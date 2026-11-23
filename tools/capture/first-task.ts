// Records the quickstart's first task at phone size, from a real Botbench and a real Claude Code reply.
//
//   BOTBENCH_DIR=../botbench node tools/capture/first-task.ts
//
// It starts a second Botbench from that checkout with its own data folder (never ~/.botbench), makes a
// practice repository under /private/tmp, drives the real screens, and keeps a screenshot for every
// moment with the time it was taken. Nothing on a frame is edited. If the agent works for longer than a few
// seconds, that stretch is played faster and the factor is written beside the video; otherwise the whole
// recording plays at its real speed. Costs one short Claude Code reply.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BOTBENCH_DIR = path.resolve(process.env.BOTBENCH_DIR ?? '../botbench');
const SITE = path.resolve(import.meta.dirname, '..', '..');
const WORK = '/private/tmp/botbench-site-capture';
const REPO = '/private/tmp/botbench-try';
const TASK = 'Add a file hello.txt that says hello, then run ls to show that it is there.';
const WORKING_SECONDS_SHOWN = 8; // how long the working stretch lasts in the video

const { startBotbench } = await import(path.join(BOTBENCH_DIR, 'e2e', 'botbench.ts'));
const git = (...args: string[]) => execFileSync('git', args, { cwd: REPO, stdio: 'pipe' });

fs.rmSync(WORK, { recursive: true, force: true });
fs.rmSync(REPO, { recursive: true, force: true });
fs.mkdirSync(path.join(WORK, 'frames'), { recursive: true });
fs.mkdirSync(REPO, { recursive: true });
git('init', '-q', '-b', 'main');
fs.writeFileSync(path.join(REPO, 'README.md'), '# Try\n');
git('add', 'README.md');
git('-c', 'user.name=maya', '-c', 'user.email=maya@example.com', 'commit', '-q', '-m', 'Start');

const botbench = await startBotbench({
  home: path.join(WORK, 'home'),
  settings: { workbench: 'your-mac', drivers: { 'claude-code': { model: 'haiku' } } },
});
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark', isMobile: true, hasTouch: true });
const page = await context.newPage();

// Sign in before the recording starts: the login token is not for a video.
await page.goto(botbench.base);
await page.getByLabel('Login token').fill(botbench.token);
await page.getByRole('button', { name: 'Sign in' }).click();
const box = page.locator('form.ds-composer textarea');
await box.waitFor({ state: 'visible' });
await page.getByText('Claude Code is signed in.').waitFor({ timeout: 30_000 });

const frames: { file: string; at: number }[] = [];
const marks: Record<string, number> = {};
let recording = true;
const loop = (async () => {
  for (let i = 0; recording; i++) {
    const file = path.join(WORK, 'frames', `${String(i).padStart(5, '0')}.jpg`);
    const at = Date.now();
    await page.screenshot({ path: file, type: 'jpeg', quality: 92 }).catch(() => {});
    if (fs.existsSync(file)) frames.push({ file, at });
    await new Promise((r) => setTimeout(r, 60));
  }
})();
const pause = (ms: number) => page.waitForTimeout(ms);
const mark = (name: string) => { marks[name] = Date.now(); };

try {
  await pause(1200);
  const sheet = page.locator('dialog.ds-sheet');
  await page.getByRole('button', { name: 'Add context' }).click();
  await pause(900);
  await sheet.locator('.ds-context-list__button', { has: page.locator('.ds-context-list__label', { hasText: /^Repository$/ }) }).click();
  await pause(700);
  await sheet.getByRole('radio', { name: 'Another folder…' }).check();
  await sheet.getByLabel('Folder path').pressSequentially(REPO, { delay: 28 });
  await sheet.getByTestId('repo-state').getByText('Usable git repository.').waitFor();
  await pause(900);
  await sheet.getByRole('button', { name: 'Back to Add context' }).click();
  await pause(700);
  await sheet.getByRole('button', { name: 'Close Add context' }).click();
  await pause(500);
  await box.pressSequentially(TASK, { delay: 22 });
  await pause(700);
  await page.getByRole('button', { name: 'Send' }).click();
  await page.waitForURL(/#\/tasks\/\d+$/);
  await pause(1500);
  mark('working');
  // A card appears only for an action that reaches outside the task's copy. This task has none; if one
  // appears the recording stops, so that nothing is answered off camera.
  await Promise.race([
    page.getByText('Ready for review').first().waitFor({ timeout: 300_000 }),
    page.getByRole('button', { name: /^Allow/ }).first().waitFor({ timeout: 300_000 }).then(() => { throw new Error('An approval card appeared. Not answered; nothing was recorded.'); }),
    page.getByText(/^(Failed|Stopped)$/).first().waitFor({ timeout: 300_000 }).then(() => { throw new Error('The task did not finish. Nothing was recorded.'); }),
  ]);
  mark('ready');
  await pause(2500);
  const accept = page.getByRole('button', { name: 'Accept', exact: true });
  for (let y = 0; !(await accept.isVisible()) || !(await accept.evaluate((el) => { const r = el.getBoundingClientRect(); return r.top > 80 && r.bottom < innerHeight - 20; })); y++) {
    if (y > 40) throw new Error('Accept was not reached by scrolling.');
    await page.mouse.wheel(0, 260);
    await pause(450);
  }
  await pause(1800);
  await accept.click();
  await page.getByText('Accepted').first().waitFor({ timeout: 30_000 });
  await pause(2500);
} finally {
  recording = false;
  await loop;
  await browser.close();
  await botbench.stop();
}

// What the agent really did, from git, for the record beside the video.
const branches = git('branch', '--list', 'botbench/*').toString().trim().split('\n').map((b) => b.trim()).filter(Boolean);
const log = branches.length ? git('log', '--stat', '-1', '--format=%s', branches[0]!).toString().trim() : '';

// Assemble: each frame is shown for as long as it was on screen, except that the working stretch is
// played faster by one factor.
const working = (marks.ready! - marks.working!) / 1000;
const factor = Math.max(1, Math.round(working / WORKING_SECONDS_SHOWN));
const lines: string[] = [];
frames.forEach((f, i) => {
  const next = frames[i + 1]?.at ?? f.at + 500;
  let d = (next - f.at) / 1000;
  if (f.at >= marks.working! && f.at < marks.ready!) d /= factor;
  lines.push(`file '${f.file}'`, `duration ${d.toFixed(4)}`);
});
lines.push(`file '${frames.at(-1)!.file}'`);
const list = path.join(WORK, 'frames.txt');
fs.writeFileSync(list, lines.join('\n'));
const out = path.join(SITE, 'assets', 'media', 'first-task-phone.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-vf', 'fps=30,scale=780:-2', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-crf', '24', out]);
const lastReady = frames.filter((f) => f.at >= marks.ready!)[Math.min(20, frames.filter((f) => f.at >= marks.ready!).length - 1)]!;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', lastReady.file, path.join(SITE, 'assets', 'media', 'first-task-phone-poster.jpg')]);

const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: BOTBENCH_DIR }).toString().trim();
const record = {
  what: 'The quickstart task, recorded at 390 by 844 from a real Botbench and a real Claude Code reply.',
  botbenchCommit: commit,
  recordedAt: new Date(marks.working!).toISOString(),
  task: TASK,
  model: 'haiku',
  workingSeconds: Math.round(working),
  workingStretchPlayedFaster: factor === 1 ? 'no: the whole recording plays at its real speed' : `${factor} times`,
  frames: frames.length,
  branch: branches[0] ?? null,
  lastCommit: log,
};
fs.writeFileSync(path.join(SITE, 'assets', 'media', 'first-task-phone.json'), JSON.stringify(record, null, 2) + '\n');
console.log(record);
