// Opens every page in a real browser: screenshots at four widths in both themes,
// an accessibility scan, and a keyboard pass. Needs `npm install` first.
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

for (const theme of ['dark', 'light']) for (const width of [390, 768, 1280, 1440]) {
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

await browser.close();
server.close();
console.log(`${pages.length} pages at 4 widths in 2 themes. Screenshots are in shots/.`);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('No sideways scroll, no failed requests, no accessibility findings, keyboard pass complete.');
