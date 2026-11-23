// Checks every link and asset in the built pages. No dependencies.
//   node tools/check-links.mjs            internal files and anchors
//   node tools/check-links.mjs --online   also asks each outside address
//   BOTBENCH_DIR=../botbench ...          also checks repository paths against a checkout
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const online = process.argv.includes('--online');
const checkout = process.env.BOTBENCH_DIR;
const pages = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const failures = [];
const outside = new Set();
const ids = Object.fromEntries(pages.map((p) => [p, new Set([...readFileSync(join(ROOT, p), 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));

for (const page of pages) {
  const html = readFileSync(join(ROOT, page), 'utf8');
  for (const [, , ref] of html.matchAll(/\s(href|src|poster)="([^"]+)"/g)) {
    if (/^https?:/.test(ref)) { outside.add(ref); continue; }
    const [path, hash] = ref.split('#');
    const target = path || page;
    if (!existsSync(join(ROOT, target))) { failures.push(`${page}: ${ref} is not in the site`); continue; }
    if (hash && target.endsWith('.html') && !ids[target].has(hash)) failures.push(`${page}: ${ref} names an anchor that is not on ${target}`);
  }
}

if (checkout) {
  for (const url of outside) {
    const m = url.match(/botbenchhq\/botbench\/(?:blob|tree)\/main\/([^#]+)/);
    if (m && !existsSync(join(checkout, m[1]))) failures.push(`${url} is not in the checkout at ${checkout}`);
  }
}

if (online) {
  for (const url of outside) {
    if (url.startsWith('https://botbenchhq.github.io/')) continue; // this site, checked above as files
    try {
      const res = await fetch(url.split('#')[0], { redirect: 'follow', headers: { 'user-agent': 'site-link-check' } });
      if (!res.ok) failures.push(`${url} answered ${res.status}`);
    } catch (e) { failures.push(`${url} could not be reached: ${e.message}`); }
  }
}

console.log(`${pages.length} pages, ${outside.size} outside addresses${online ? ' asked' : ''}${checkout ? ', repository paths checked' : ''}.`);
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('Every link and asset resolves.');
