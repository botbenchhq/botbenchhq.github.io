#!/usr/bin/env node
// Checks the README cards in assets/cards. `npm run check:cards`.
//
//   1. The committed files are what the builder makes now (rebuilt into a temporary folder).
//   2. The kit's static gate (lib/check-card.mjs) on every file: no script, no <text>,
//      nothing external, a title, a reduced-motion rule; a still has no motion at all.
//   3. Each file inside an <img> in Chromium, WebKit and Firefox: it decodes at its own
//      size and paints (--shots=<dir> keeps the screenshots).
//
//   --frames=<dir>  also run the kit's timed capture (lib/capture-frames.mjs) every 0.5 s
//                   across the loop, and tile each card's frames into <dir>/<card>-sheet.png
//                   with ffmpeg (left to right, top to bottom, 0 s to 12.6 s), to look at
//                   every frame.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { checkSvg } from './lib/check-card.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const DIR = join(ROOT, 'assets', 'cards');
const LOOP = 13;
const problems = [];
const files = readdirSync(DIR).filter((f) => f.endsWith('.svg')).sort();
const expected = ['light', 'dark'].flatMap((m) => [`botbench-card-${m}.svg`, `botbench-card-still-${m}.svg`, `botbench-card-compact-${m}.svg`, `botbench-card-compact-still-${m}.svg`]);
for (const f of expected) if (!files.includes(f)) problems.push(`${f} is missing`);

// 1. Rebuilt the same.
const tmp = mkdtempSync(join(tmpdir(), 'cards-'));
execFileSync(process.execPath, [join(HERE, 'build.mjs')], { env: { ...process.env, CARDS_OUT: tmp }, stdio: 'ignore' });
for (const f of files) {
  const fresh = join(tmp, f);
  if (!existsSync(fresh)) problems.push(`${f}: the builder no longer makes it`);
  else if (!readFileSync(fresh).equals(readFileSync(join(DIR, f)))) problems.push(`${f}: differs from what tools/cards/build.mjs makes now; rebuild and commit`);
}
rmSync(tmp, { recursive: true, force: true });

// 2. The kit's static gate.
for (const f of files) {
  const svg = readFileSync(join(DIR, f), 'utf8');
  const { errors, warnings, stats } = checkSvg(svg, { maxKb: 300 });
  const isStill = f.includes('still');
  console.log(`${errors.length ? '✗' : '✓'} ${f}  ${Buffer.byteLength(svg)} bytes, ${stats.glyphs} glyphs, ${stats.keyframes} keyframes${stats.loop ? `, loop ${stats.loop}` : ''}`);
  for (const e of errors) problems.push(`${f}: ${e}`);
  for (const w of warnings) if (!(isStill && w.startsWith('no @keyframes'))) problems.push(`${f}: ${w}`);
  if (isStill && (stats.keyframes || /\bclass=|<style/.test(svg))) problems.push(`${f}: a still must not move`);
  if (!isStill && stats.loop !== `${LOOP}s`) problems.push(`${f}: expected one ${LOOP}s loop, got ${stats.loop}`);
  if (/<animate|<set\b|<script|foreignObject|@font-face|https?:\/\/(?!www\.w3\.org\/2000\/svg)/.test(svg)) problems.push(`${f}: SMIL, script, foreignObject, a font or a URL`);
  if (!svg.includes("Illustration in Botbench's own words")) problems.push(`${f}: the title no longer says it is an illustration`);
}

// 3. Three engines, through <img>.
const { chromium, webkit, firefox } = await import('playwright');
const shots = process.argv.find((a) => a.startsWith('--shots='))?.slice(8);
if (shots) mkdirSync(shots, { recursive: true });
// Served over HTTP, as a README image is, with the SVG media type.
const server = createServer((req, res) => {
  const f = decodeURIComponent(new URL(req.url, 'http://x').pathname).slice(1);
  if (f === 'host.html') return res.writeHead(200, { 'content-type': 'text/html' }).end(`<body style="margin:0;background:#808080"><img id="i" src="${new URL(req.url, 'http://x').searchParams.get('src')}" style="display:block"></body>`);
  if (!files.includes(f)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': 'image/svg+xml' }).end(readFileSync(join(DIR, f)));
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const sizeOf = (svg) => svg.match(/viewBox="0 0 (\d+) (\d+)"/).slice(1).map(Number);
for (const [name, engine] of [['chromium', chromium], ['webkit', webkit], ['firefox', firefox]]) {
  let browser;
  try {
    browser = await engine.launch();
  } catch (e) {
    problems.push(`${name}: could not start (${e.message.split('\n')[0]}); run npx playwright install ${name}`);
    continue;
  }
  for (const f of files) {
    const [w, h] = sizeOf(readFileSync(join(DIR, f), 'utf8'));
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(`${base}host.html?src=${encodeURIComponent(f)}`);
    await page.waitForFunction(() => document.getElementById('i').complete);
    const nat = await page.evaluate(() => [document.getElementById('i').naturalWidth, document.getElementById('i').naturalHeight]);
    if (nat[0] !== w || nat[1] !== h) problems.push(`${name} ${f}: decoded at ${nat.join('×')}, expected ${w}×${h}`);
    // The card paints its own plate: a pixel inside it is not the grey page behind it.
    const shot = await page.screenshot(shots ? { path: join(shots, `${name}-${f.replace('.svg', '.png')}`) } : {});
    if (shot.length < 2000) problems.push(`${name} ${f}: the picture is empty`);
    await page.close();
  }
  console.log(`✓ ${name}: every card decodes inside <img>`);
  await browser.close();
}

server.close();

// Optional: the kit's timed captures and a contact sheet per card.
const frames = process.argv.find((a) => a.startsWith('--frames='))?.slice(9);
if (frames) {
  mkdirSync(frames, { recursive: true });
  const at = Array.from({ length: 26 }, (_, i) => i * 0.5).concat([12.6]);
  for (const f of files.filter((x) => !x.includes('still'))) {
    const base = f.replace('.svg', '');
    try {
      execFileSync(process.execPath, [join(HERE, 'lib', 'capture-frames.mjs'), join(DIR, f), `--at=${at.join(',')}`, `--out=${frames}`], { stdio: 'inherit' });
    } catch {
      problems.push(`${f}: capture-frames failed`);
      continue;
    }
    const canvas = base.endsWith('dark') ? 'dark' : 'light';
    const list = at.map((t) => join(frames, `${base}-${canvas}-${t}s.png`));
    const wide = !base.includes('compact');
    const cols = wide ? 3 : 6;
    const rows = Math.ceil(list.length / cols);
    const sheet = join(frames, `${base}-sheet.png`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...list.flatMap((p) => ['-i', p]), '-filter_complex',
      `${list.map((_, i) => `[${i}:v]scale=${wide ? 600 : 320}:-2[v${i}]`).join(';')};${list.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${list.length}:layout=${list.map((_, i) => `${(i % cols) ? Array.from({ length: i % cols }, () => 'w0').join('+') : '0'}_${Math.floor(i / cols) ? Array.from({ length: Math.floor(i / cols) }, () => 'h0').join('+') : '0'}`).join('|')}:fill=gray`,
      '-frames:v', '1', sheet]);
    console.log(`sheet: ${sheet} (${rows} rows)`);
  }
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('\ncards: all checks passed');
