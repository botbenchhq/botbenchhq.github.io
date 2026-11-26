// Makes the pictures the pages show from the real screens in assets/media:
// each is cut out of its source and/or scaled down, then saved as WebP, with no
// other change to the pixels. The full-size sources stay unchanged in
// assets/media (PROVENANCE.md), and each shown picture links to its source.
// Needs cwebp (Homebrew `webp`). Writes assets/media/v/ and the table in
// PROVENANCE.md between its variants markers.
//   node tools/media-variants.mjs
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MEDIA = join(ROOT, 'assets/media');
const OUT = join(MEDIA, 'v');

// [name, source in assets/media, crop [x, y, w, h] or null, widths, what it shows]
export const VARIANTS = [
  ['check-a-command', 'permissions-check.png', [634, 100, 1584, 1096], [800, 1584], 'Check a command and its answer in each mode'],
  ['check-a-command-light', 'permissions-check-light.png', [634, 100, 1584, 1096], [800, 1584], 'the same, light theme'],
  ['check-a-command-modes', 'permissions-check.png', [690, 690, 900, 345], [900], 'the answer in each mode, for a phone'],
  ['check-a-command-modes-light', 'permissions-check-light.png', [690, 690, 900, 345], [900], 'the same, light theme'],
  ['review-evidence', 'ready-for-review-proof.png', [588, 640, 1552, 700], [800, 1552], 'the check and Codex’s review'],
  ['review-evidence-light', 'ready-for-review-proof-light.png', [588, 640, 1552, 700], [800, 1552], 'the same, light theme'],
  ['your-decision', 'ready-for-review-proof.png', [2242, 40, 600, 1060], [600], 'Your decision, with Reject and Accept'],
  ['your-decision-light', 'ready-for-review-proof-light.png', [2242, 40, 600, 1060], [600], 'the same, light theme'],
  ['ready-for-review', 'ready-for-review-proof.png', null, [1200, 2000], 'the whole task screen'],
  ['ready-for-review-light', 'ready-for-review-proof-light.png', null, [1200, 2000], 'the same, light theme'],
  ['approval-card', 'approval-card.png', null, [600, 900], 'an approval card at phone size'],
  ['peers-overlap', 'peers/peers-overlap-phone.png', null, [600, 900], 'the overlap line at phone size'],
  ['peers-passed-together', 'peers/peers-passed-together-phone.png', null, [600, 900], 'Passed together at phone size'],
  ['peers-claim-warning', 'peers/peers-claim-warning-phone.png', null, [600, 900], 'the task composer, with the claim warning, at phone size'],
  ['demo-poster', 'botbench-demo-thumbnail.png', null, [1440], 'the demo recording’s poster'],
  ['hero-desktop', 'hero-desktop-crop.png', null, [1200, 2380], 'the hero’s desktop screen'],
  ['hero-phone', 'hero-phone-crop.png', null, [680], 'the hero’s phone screen'],
];

if (import.meta.url === `file://${process.argv[1]}`) {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  const rows = ['| File | Made from | SHA-256 |', '|---|---|---|'];
  for (const [name, source, crop, widths] of VARIANTS) {
    for (const w of widths) {
      const file = `${name}-${w}.webp`;
      const sourceW = crop ? crop[2] : Number(execFileSync('sips', ['-g', 'pixelWidth', join(MEDIA, source)]).toString().match(/pixelWidth: (\d+)/)[1]);
      const args = ['-quiet', '-q', '86', '-m', '6'];
      if (crop) args.push('-crop', ...crop.map(String));
      if (w !== sourceW) args.push('-resize', String(w), '0');
      execFileSync('cwebp', [...args, join(MEDIA, source), '-o', join(OUT, file)]);
      const how = [crop && `cut ${crop[2]} × ${crop[3]} at x ${crop[0]}, y ${crop[1]}`, w !== sourceW && `scaled to ${w} wide`].filter(Boolean).join(', ') || 'same size';
      rows.push(`| \`assets/media/v/${file}\` | \`assets/media/${source}\`, ${how} (\`cwebp ${args.join(' ')}\`) | \`${createHash('sha256').update(readFileSync(join(OUT, file))).digest('hex')}\` |`);
    }
  }
  const provenance = join(ROOT, 'PROVENANCE.md');
  const [START, END] = ['<!-- variants:start -->', '<!-- variants:end -->'];
  const text = readFileSync(provenance, 'utf8');
  if (!text.includes(START) || !text.includes(END)) {
    console.error(`PROVENANCE.md has no ${START} and ${END} lines; add them where the table goes and run this again.`);
    process.exit(1);
  }
  writeFileSync(provenance, `${text.slice(0, text.indexOf(START) + START.length)}\n${rows.join('\n')}\n${text.slice(text.indexOf(END))}`);
  console.log(`Wrote ${rows.length - 2} pictures in assets/media/v and their table in PROVENANCE.md.`);
}
