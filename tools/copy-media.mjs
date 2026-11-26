// Copies the product pictures and clips from a Botbench checkout into assets/media, unchanged, and writes their
// table in PROVENANCE.md (file, source, SHA-256, and the commit they came from), between its two marker lines.
//
//   BOTBENCH_DIR=../botbench node tools/copy-media.mjs
//
// The files are made in the Botbench repository by `npm run media` (e2e/media.shots.ts); nothing is made here.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BOTBENCH_DIR = resolve(process.env.BOTBENCH_DIR ?? '../botbench');
const MEDIA = resolve(import.meta.dirname, '..', 'assets', 'media');

const FILES = [
  'docs/images/hero-workbench.png',
  'docs/images/ready-for-review-proof.png',
  'docs/images/permissions-check.png',
  'docs/images/ready-for-review-proof-light.png',
  'docs/images/permissions-check-light.png',
  'docs/images/approval-card.png',
  'docs/images/paired-question.png',
  'docs/media/botbench-demo.mp4',
  'docs/media/botbench-demo-thumbnail.png',
  'docs/media/first-task-phone.mp4',
  'docs/media/first-task-phone-poster.jpg',
  'docs/media/paired-question.mp4',
  'docs/media/paired-question-poster.jpg',
  'docs/media/social-preview.png',
];

const missing = FILES.filter((file) => !existsSync(join(BOTBENCH_DIR, file)));
if (missing.length > 0) {
  console.error(`Not found in ${BOTBENCH_DIR}: ${missing.join(', ')}. Set BOTBENCH_DIR to a Botbench checkout where \`npm run media\` has run.`);
  process.exit(1);
}
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: BOTBENCH_DIR }).toString().trim();
const lines = [`From botbench at commit \`${commit}\`:`, '', '| File | Source in botbench | SHA-256 |', '|---|---|---|'];
for (const file of FILES) {
  const name = file.split('/').at(-1);
  copyFileSync(join(BOTBENCH_DIR, file), join(MEDIA, name));
  lines.push(`| \`assets/media/${name}\` | \`${file}\`, unchanged | \`${createHash('sha256').update(readFileSync(join(MEDIA, name))).digest('hex')}\` |`);
}
const provenance = resolve(import.meta.dirname, '..', 'PROVENANCE.md');
const [START, END] = ['<!-- media:start -->', '<!-- media:end -->'];
const text = readFileSync(provenance, 'utf8');
if (!text.includes(START) || !text.includes(END)) {
  console.error(`PROVENANCE.md has lost its ${START} and ${END} lines; put them back around the table and run this again.`);
  process.exit(1);
}
writeFileSync(provenance, `${text.slice(0, text.indexOf(START) + START.length)}\n${lines.join('\n')}\n${text.slice(text.indexOf(END))}`);
console.log(`Copied ${FILES.length} files from botbench at ${commit} and wrote their table in PROVENANCE.md.`);
