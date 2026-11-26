// Renders the coordination scene's last frame from the scene itself, for the
// places that show it still: the page without JavaScript (wide and compact) and
// the Evidence page (office-mac's window only, large enough to read).
// Playwright and Chromium, device scale 2, reduced motion (the scene then shows
// its last frame and nothing moves). Run after tools/build-scene.mjs:
//   node tools/render-scene-stills.mjs
// Writes WebP with cwebp (Homebrew `webp`); without cwebp it keeps the PNG.
import { chromium } from 'playwright';
import { readFileSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MEDIA = join(ROOT, 'assets/media');
const TYPES = { html: 'text/html', css: 'text/css', js: 'text/javascript', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', woff2: 'font/woff2' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html');
  let body;
  try { body = readFileSync(join(ROOT, path)); } catch { return res.writeHead(404).end(); }
  res.writeHead(200, { 'content-type': TYPES[path.split('.').pop()] || 'application/octet-stream' }).end(body);
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();

const shots = [
  // [file, viewport width, element]
  ['scene-coordination-final', 1280, '.bb-stage'],
  ['scene-coordination-final-compact', 390, '.bb-stage'],
  // office-mac's window, cut to the part inside the stage and right of the remote's panel
  ['scene-coordination-pane', 1280, 'pane'],
];
for (const [name, width, selector] of shots) {
  const ctx = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce', colorScheme: 'dark' });
  const p = await ctx.newPage();
  await p.goto(base + 'coordination.html');
  await p.locator('.bb-scene').scrollIntoViewIfNeeded();
  await p.waitForSelector('.bb-stage .ss-stage[data-still]');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  const png = join(MEDIA, `${name}.png`);
  if (selector === 'pane') {
    const clip = await p.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const stage = r('.bb-stage'), win = r('.bb-stage .bb-win-office'), remote = r('.bb-stage .bb-remote');
      const x = Math.max(win.left, remote.right + 4), y = win.top;
      return { x, y, width: stage.right - x, height: stage.bottom - y };
    });
    await p.screenshot({ path: png, clip, animations: 'disabled' });
  } else await p.locator(selector).first().screenshot({ path: png, animations: 'disabled' });
  await ctx.close();
  let out = png;
  try {
    execFileSync('cwebp', ['-quiet', '-q', '88', png, '-o', join(MEDIA, `${name}.webp`)]);
    unlinkSync(png);
    out = join(MEDIA, `${name}.webp`);
  } catch { /* cwebp not installed: the PNG */ }
  const sha = createHash('sha256').update(readFileSync(out)).digest('hex');
  console.log(`${out.slice(ROOT.length + 1)}  sha256 ${sha}`);
}
await browser.close();
server.close();
