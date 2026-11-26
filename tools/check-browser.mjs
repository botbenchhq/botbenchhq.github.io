// Opens every page in a real browser: screenshots at five widths in both themes,
// an accessibility scan, a keyboard pass, and the coordination scene's playback,
// controls and reduced-motion frame. Needs `npm install` first.
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'shots');
mkdirSync(OUT, { recursive: true });
const axe = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const TYPES = { html: 'text/html', css: 'text/css', js: 'text/javascript', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', mp4: 'video/mp4' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html');
  try {
    const body = readFileSync(join(ROOT, path));
    res.writeHead(200, { 'content-type': TYPES[path.split('.').pop()] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const pages = readdirSync(ROOT).filter((f) => f.endsWith('.html') && f !== '404.html');
const problems = [];
const browser = await chromium.launch();

for (const theme of ['dark', 'light']) for (const width of [358, 390, 768, 1280, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => problems.push(`${theme} ${width}: script error ${e.message}`));
  p.on('response', (r) => { if (r.status() >= 400) problems.push(`${theme} ${width}: ${r.status()} ${r.url()}`); });
  for (const file of pages) {
    await p.goto(base + file, { waitUntil: 'load' });
    const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (over > 0) problems.push(`${file} ${theme} ${width}: the page scrolls sideways by ${over}px`);
    await p.evaluate(async () => { for (const i of document.images) { i.loading = 'eager'; await i.decode().catch(() => {}); } });
    await p.screenshot({ path: join(OUT, `${file.replace('.html', '')}-${width}-${theme}.png`), fullPage: true });
    if (width === 390 || width === 1280) {
      await p.addScriptTag({ content: axe });
      const res = await p.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] }));
      for (const v of res.violations) problems.push(`${file} ${theme} ${width}: ${v.id} (${v.impact}) ${v.help}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
    }
  }
  await ctx.close();
}

// Keyboard pass.
const expect = (ok, what) => { if (!ok) problems.push(`keyboard: ${what}`); };
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(base + 'index.html');
  await p.keyboard.press('Tab');
  expect(await p.evaluate(() => document.activeElement.className === 'skip'), 'the first Tab reaches the skip link');
  await p.focus('#tab-delegate');
  await p.keyboard.press('ArrowRight');
  expect(await p.evaluate(() => document.activeElement.id === 'tab-hand-over' && !document.getElementById('panel-hand-over').hidden && document.getElementById('panel-delegate').hidden), 'ArrowRight selects the second tab and shows its panel');
  await p.keyboard.press('End');
  expect(await p.evaluate(() => document.activeElement.id === 'tab-verify' && !document.getElementById('panel-verify').hidden), 'End selects the last tab');
  await p.keyboard.press('ArrowRight');
  expect(await p.evaluate(() => document.activeElement.id === 'tab-delegate'), 'ArrowRight wraps to the first tab');
  await p.focus('[data-theme-toggle]');
  const before = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await p.keyboard.press('Enter');
  expect(before !== await p.evaluate(() => getComputedStyle(document.body).backgroundColor), 'Enter on the theme button changes the theme');
  expect(await p.evaluate(() => !!document.querySelector('[data-theme-toggle]').getAttribute('aria-label')), 'the theme button has a name');

  await p.goto(base + 'explore.html');
  const all = await p.locator('[data-cap]:visible').count();
  await p.focus('[data-cap-filter="planned"]');
  await p.keyboard.press('Space');
  const planned = await p.locator('[data-cap]:visible').count();
  expect(planned > 0 && planned < all, 'Space on Planned narrows the list');
  await p.fill('[data-cap-search]', 'zzzz');
  expect((await p.textContent('[data-cap-count]')).startsWith('None of'), 'a search with no match says so');

  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  await p.goto(base + 'get-started.html');
  await p.focus('[data-copy="cmd-start"]');
  await p.keyboard.press('Enter');
  expect((await p.evaluate(() => navigator.clipboard.readText())) === 'npm start', 'Copy puts the command on the clipboard');
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(base + 'index.html');
  expect(!(await p.isVisible('#site-nav')), 'the menu starts closed at phone width');
  await p.focus('[data-menu-toggle]');
  await p.keyboard.press('Enter');
  expect(await p.isVisible('#site-nav') && (await p.getAttribute('[data-menu-toggle]', 'aria-expanded')) === 'true', 'Enter opens the menu');
  await p.screenshot({ path: join(OUT, 'menu-open-390.png') });
  await p.keyboard.press('Tab');
  expect(await p.evaluate(() => document.activeElement.closest('#site-nav') !== null), 'Tab from the menu button reaches the menu');
  await p.keyboard.press('Escape');
  expect(!(await p.isVisible('#site-nav')) && await p.evaluate(() => document.activeElement.matches('[data-menu-toggle]')), 'Escape closes the menu and returns focus to its button');
  await ctx.close();
}

// What each page says and how: the closing band only where it is the page's next step,
// one name for the Evidence page, no capitals set by CSS, and the get-started steps
// ending at the branch.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  for (const file of [...pages, '404.html']) {
    await p.goto(base + file);
    const closing = await p.locator('.closing').count();
    const wants = ['index.html', 'workbench.html', 'coordination.html', 'proof.html'].includes(file);
    expect(closing === (wants ? 1 : 0), `${file}: the closing band is ${wants ? 'there' : 'not there'}`);
    const caps = await p.evaluate(() => [...document.querySelectorAll('body *')].filter((el) => getComputedStyle(el).textTransform === 'uppercase' && el.textContent.trim() && !el.closest('.bb-stage')).map((el) => el.textContent.trim().slice(0, 30)));
    expect(caps.length === 0, `${file}: no text is set in capitals by CSS (${caps.join(', ')})`);
    expect(await p.locator('.eyebrow').count() === 0, `${file}: no eyebrow label above a heading`);
    expect(!/Verification/.test(await p.evaluate(() => document.title + document.body.innerText)), `${file}: the Evidence page is never called Verification`);
    expect(!/Claude Code or Codex/.test(await p.evaluate(() => document.body.innerText)), `${file}: Claude Code is never offered as an alternative to Codex`);
  }
  await p.goto(base + 'proof.html');
  expect((await p.title()).startsWith('Evidence'), 'proof.html: its title is Evidence');
  await p.goto(base + 'get-started.html');
  expect((await p.locator('.steps > li h3').last().textContent()).trim() === 'See the branch', 'get-started.html: the last step is See the branch');
  await ctx.close();
}

// The coordination scene: present where it is placed, starts only once in view,
// Pause and Replay work from the keyboard, and reduced motion shows the last frame still.
const mark = (p) => p.evaluate(() => document.querySelector('.bb-stage .ss-stage')?.getAttribute('data-mark') ?? '');
for (const file of ['index.html', 'coordination.html']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(base + file);
  expect(await p.locator('[data-scene-mount="coordination"] .bb-stage .ss-stage').count() === 1, `${file}: the coordination scene is on the page`);
  expect(await p.locator('.scene-label a[href$="#what-works-today"]').count() === 1, `${file}: the scene carries its illustration label and link`);
  if (file === 'index.html') {
    await p.waitForTimeout(1500);
    expect(!/^beat-[1-5]$/.test(await mark(p)), `${file}: the scene waits until it is in view`);
  }
  await p.locator('.bb-scene').scrollIntoViewIfNeeded();
  await p.waitForFunction(() => /^beat-[1-5]$/.test(document.querySelector('.bb-stage .ss-stage')?.getAttribute('data-mark') ?? ''), null, { timeout: 8000 }).catch(() => {});
  expect(/^beat-[1-5]$/.test(await mark(p)), `${file}: the scene plays once in view`);
  const toggle = p.locator('[data-scene-toggle]');
  expect((await toggle.textContent()).trim() === 'Pause', `${file}: the scene's control reads Pause while it plays`);
  const box = await toggle.boundingBox();
  expect(box && box.height >= 44 && box.width >= 44, `${file}: the scene's controls are at least 44px`);
  await toggle.focus();
  await p.keyboard.press('Enter');
  expect((await toggle.textContent()).trim() === 'Play' && await p.locator('.bb-scene[data-paused]').count() === 1, `${file}: Enter on Pause pauses the scene`);
  const held = await mark(p);
  await p.waitForTimeout(2500);
  expect(await mark(p) === held, `${file}: a paused scene stays on its beat`);
  await p.keyboard.press('Space');
  expect((await toggle.textContent()).trim() === 'Pause', `${file}: Space on Play plays it again`);
  await p.locator('[data-scene-replay]').focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  expect(/^1 of 5/.test((await p.textContent('.bb-caption')).trim()), `${file}: Replay starts the scene from its first step`);
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(base + 'coordination.html');
  await p.locator('.bb-scene').scrollIntoViewIfNeeded();
  await p.waitForTimeout(1500);
  expect(await p.locator('.bb-scene[data-reduced] .bb-stage .ss-stage[data-still]').count() === 1, 'reduced motion: the scene shows its still frame');
  expect(await p.locator('.bb-stage [data-target="accept"]').count() === 1 && (await p.textContent('.bb-caption')).includes('before either was merged'), 'reduced motion: the still is the last step, with its caption');
  expect(await p.locator('[data-scene-toggle]').count() === 0, 'reduced motion: no playback controls');
  const running = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.target?.closest?.('.bb-stage')).length);
  expect(running === 0, `reduced motion: nothing in the scene animates (${running} running)`);
  expect(!/^beat-/.test(await mark(p)), 'reduced motion: the scene\'s script does not run');
  await ctx.close();
}
for (const file of ['index.html', 'coordination.html']) {
  const ctx = await browser.newContext({ viewport: { width: 358, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(base + file);
  await p.locator('.bb-scene').scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);
  expect(await p.locator('.bb-stage .ss-stage[data-layout="compact"]').count() === 1, `${file} at 358: the scene uses its compact design`);
  expect(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, `${file} at 358: no sideways scroll with the scene`);
  await p.locator('.scene').screenshot({ path: join(OUT, `scene-${file.replace('.html', '')}-358.png`) });
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(base + 'coordination.html');
  expect(await p.locator('.scene-fallback').isVisible() && await p.locator('.scene-fallback-caption').isVisible(), 'without JavaScript: the scene\'s last frame and caption show');
  await ctx.close();
}

await browser.close();
server.close();
console.log(`${pages.length} pages at 5 widths in 2 themes. Screenshots are in shots/.`);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('No sideways scroll, no failed requests, no accessibility findings, keyboard pass and scene checks complete.');
