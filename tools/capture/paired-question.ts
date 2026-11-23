// Records two Botbench installations on this Mac pairing, then one owner asking the other a question.
//
//   BOTBENCH_DIR=../botbench node tools/capture/paired-question.ts
//
// Two real Botbench processes from that checkout, each with its own data folder and its own copy of one
// repository with a shared remote, all under /private/tmp. Two browser windows at phone size, maya's on
// the left and theo's on the right, drive the owners' own screens. Every message is typed and sent by its
// owner; no agent takes part, so no model reply is spent. Nothing on a frame is edited and nothing is
// played faster. This is two installations on one Mac over the loopback address, not two Macs.
import { chromium, type Page } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BOTBENCH_DIR = path.resolve(process.env.BOTBENCH_DIR ?? '../botbench');
const SITE = path.resolve(import.meta.dirname, '..', '..');
const WORK = '/private/tmp/botbench-site-pair';
const QUESTION = 'Is the cart API still sending totalCents? My checkout change reads it.';
const ANSWER = 'No. From this branch on it sends total, in dollars.';

const { startBotbench } = await import(path.join(BOTBENCH_DIR, 'e2e', 'botbench.ts'));
const git = (cwd: string, ...args: string[]) => execFileSync('git', ['-c', 'user.name=demo', '-c', 'user.email=demo@example.com', ...args], { cwd, stdio: 'pipe' });

fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(path.join(WORK, 'frames'), { recursive: true });
const remote = path.join(WORK, 'acme-shop.git');
git(WORK, 'init', '-q', '--bare', '-b', 'main', remote);
const repos = { maya: path.join(WORK, 'maya', 'acme-shop'), theo: path.join(WORK, 'theo', 'acme-shop') };
fs.mkdirSync(repos.maya, { recursive: true });
git(repos.maya, 'init', '-q', '-b', 'main');
fs.writeFileSync(path.join(repos.maya, 'README.md'), '# acme-shop\n');
git(repos.maya, 'add', 'README.md');
git(repos.maya, 'commit', '-q', '-m', 'Start');
git(repos.maya, 'remote', 'add', 'origin', remote);
git(repos.maya, 'push', '-q', 'origin', 'main');
fs.mkdirSync(path.dirname(repos.theo), { recursive: true });
git(WORK, 'clone', '-q', remote, repos.theo);

const start = (name: 'maya' | 'theo', peerPort: number) => startBotbench({
  home: path.join(WORK, `${name}-data`, 'home'),
  settings: { workbench: name, peers: { listen: { address: '127.0.0.1', port: peerPort } }, repositories: { [repos[name]]: {} } },
});
fs.mkdirSync(path.join(WORK, 'maya-data'), { recursive: true });
fs.mkdirSync(path.join(WORK, 'theo-data'), { recursive: true });
const maya = await start('maya', 47911);
const theo = await start('theo', 47912);
const browser = await chromium.launch();

async function signedIn(w: { base: string; token: string }): Promise<Page> {
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark', isMobile: true, hasTouch: true })).newPage();
  await page.goto(w.base);
  await page.getByLabel('Login token').fill(w.token);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.locator('form.ds-composer textarea').waitFor({ state: 'visible' });
  await page.goto(`${w.base}/#/settings/paired`);
  await page.getByTestId('paired-workbench').getByRole('heading', { name: 'Paired workbench' }).waitFor();
  return page;
}
const m = await signedIn(maya);
const t = await signedIn(theo);

const frames: { at: number; i: number }[] = [];
let recording = true;
const loop = (async () => {
  for (let i = 0; recording; i++) {
    const at = Date.now();
    const name = String(i).padStart(5, '0');
    const done = await Promise.all([
      m.screenshot({ path: path.join(WORK, 'frames', `m${name}.jpg`), type: 'jpeg', quality: 92 }).then(() => true, () => false),
      t.screenshot({ path: path.join(WORK, 'frames', `t${name}.jpg`), type: 'jpeg', quality: 92 }).then(() => true, () => false),
    ]);
    if (done.every(Boolean)) frames.push({ at, i });
    await new Promise((r) => setTimeout(r, 60));
  }
})();
const pause = (ms: number) => m.waitForTimeout(ms);
let ok = false;

try {
  const ms = m.getByTestId('paired-workbench');
  const ts = t.getByTestId('paired-workbench');
  await pause(1500);
  await ms.getByRole('button', { name: 'Make an invite' }).click();
  const line = ms.getByTestId('invite-line');
  await line.waitFor();
  await line.scrollIntoViewIfNeeded();
  await pause(1800);
  const invite = await line.inputValue();
  await ts.getByTestId('paste-invite').scrollIntoViewIfNeeded();
  await ts.getByTestId('paste-invite').fill(invite);
  await pause(900);
  await ts.getByRole('button', { name: 'Check the invite' }).click();
  await ts.getByTestId('pasted-fingerprint').waitFor();
  await ts.getByTestId('pasted-fingerprint').scrollIntoViewIfNeeded();
  await pause(2200);
  await ts.getByRole('button', { name: 'Confirm', exact: true }).click();
  await ts.getByTestId('pairing-words').getByText('Waiting for maya to confirm').waitFor();
  await ms.getByTestId('peer-fingerprint').waitFor({ timeout: 30_000 });
  await ms.getByTestId('peer-fingerprint').scrollIntoViewIfNeeded();
  await pause(2200);
  await ms.getByRole('button', { name: 'Confirm', exact: true }).click();
  await ms.getByTestId('pairing-words').getByText('Paired', { exact: true }).waitFor({ timeout: 30_000 });
  await ts.getByTestId('pairing-words').getByText('Paired', { exact: true }).waitFor({ timeout: 30_000 });
  await pause(1800);

  const ask = ts.getByLabel('A new question for maya');
  await ask.scrollIntoViewIfNeeded();
  await ask.pressSequentially(QUESTION, { delay: 18 });
  await pause(700);
  await ts.getByTestId('new-question').getByRole('button', { name: 'Send', exact: true }).click();
  await ts.getByTestId('new-question-said').waitFor();
  const tray = m.getByTestId('tray-peer-cards');
  await tray.waitFor({ timeout: 30_000 });
  await pause(1500);
  await tray.click();
  const card = m.getByTestId('peer-card');
  await card.getByRole('heading', { name: /^theo asks a question about/ }).waitFor();
  await pause(2800);
  await card.getByRole('button', { name: 'Answer it yourself' }).click();
  await card.getByLabel('Your answer').pressSequentially(ANSWER, { delay: 18 });
  await pause(700);
  await card.getByRole('button', { name: 'Send', exact: true }).click();
  await card.waitFor({ state: 'detached', timeout: 30_000 });
  const back = t.getByTestId('tray-peer-cards');
  await back.waitFor({ timeout: 30_000 });
  await pause(1200);
  await back.click();
  const answered = t.getByTestId('peer-card');
  await answered.getByRole('heading', { name: /^maya answered your question about/ }).waitFor();
  await pause(1800);
  await answered.getByRole('link', { name: 'Open the conversation' }).click();
  await t.getByRole('heading', { level: 1, name: 'Conversation with maya' }).waitFor();
  await pause(3500);
  ok = true;
} finally {
  recording = false;
  await loop;
  if (!ok) { await m.screenshot({ path: path.join(WORK, 'stopped-maya.png') }); await t.screenshot({ path: path.join(WORK, 'stopped-theo.png') }); }
  await browser.close();
  await maya.stop();
  await theo.stop();
}

const lists = { m: [] as string[], t: [] as string[] };
frames.forEach((f, k) => {
  const d = (((frames[k + 1]?.at ?? f.at + 500) - f.at) / 1000).toFixed(4);
  for (const side of ['m', 't'] as const) lists[side].push(`file '${path.join(WORK, 'frames', `${side}${String(f.i).padStart(5, '0')}.jpg`)}'`, `duration ${d}`);
});
for (const side of ['m', 't'] as const) fs.writeFileSync(path.join(WORK, `${side}.txt`), lists[side].join('\n'));
const out = path.join(SITE, 'assets', 'media', 'paired-question.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(WORK, 'm.txt'), '-f', 'concat', '-safe', '0', '-i', path.join(WORK, 't.txt'),
  '-filter_complex', '[0:v]fps=30,scale=600:-2,pad=iw+12:ih:0:0:color=0x0F0F10[a];[1:v]fps=30,scale=600:-2[b];[a][b]hstack=inputs=2', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-crf', '25', out]);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-sseof', '-1', '-i', out, '-frames:v', '1', path.join(SITE, 'assets', 'media', 'paired-question-poster.jpg')]);

const record = {
  what: 'Two Botbench installations on one Mac, maya (left) and theo (right), pair and exchange one question and one answer, each typed and sent by its owner.',
  botbenchCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: BOTBENCH_DIR }).toString().trim(),
  recordedAt: new Date(frames[0]!.at).toISOString(),
  question: QUESTION,
  answer: ANSWER,
  playedFaster: 'no',
  modelReplies: 0,
  frames: frames.length,
};
fs.writeFileSync(path.join(SITE, 'assets', 'media', 'paired-question.json'), JSON.stringify(record, null, 2) + '\n');
console.log(record);
