#!/usr/bin/env node
// The README product card: one task, from hand-off to a branch you can judge, and a
// teammate's overlap caught before merge. Built with the ChanMeng SVG product-card kit
// (tools/cards/lib, pinned revision in PROVENANCE.md) as the kit's field guide says:
// outlined shared glyphs, one CSS timeline whose base state is the finished frame,
// no script, no external reference.
//
//   node tools/cards/build.mjs            writes assets/cards/*.svg
//
// Every word on the card is Botbench's own. When a Botbench checkout is found
// (BOTBENCH_DIR, default ../botbench beside this repository) the build reads the files
// the words come from and stops when one no longer says them. When the design system is
// found (DS_DIR, default ../ds or ../design-system) it checks every colour against
// themes/botbench.css the same way. Without them it builds from what is committed here.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { createGlyphSet } = require('./lib/text.cjs');
const { createTimeline } = require('./lib/timeline.cjs');
const { card } = require('./lib/shell.cjs');

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const OUT = process.env.CARDS_OUT || join(ROOT, 'assets', 'cards');

// ---------------------------------------------------------------- the words
// Each string, and the Botbench file that says it (paths at botbench f1ab644).
const COPY = {
  task: 'Task 7 · billing-api',
  title: 'Make add in calc.py return the sum',
  builder: 'Claude Code',
  branchLabel: 'Branch',
  branch: 'botbench/studio-mac/run-7/task-7',
  working: 'Working. Claude Code is working in a separate copy of the project.',
  states: ['Working', 'Checking', 'In review', 'Ready for review'],
  checks: '1 of 1 check passed',
  command: 'python3 -B -m unittest -q',
  passed: 'Passed',
  reviewer: 'Codex, its default model',
  verdict: 'Codex found nothing to fix.',
  opinion: "A model's opinion, not a check.",
  files: '1 file changed',
  file: 'calc.py',
  overlap: "office-mac's open pull request #12 also changes calc.py, so the two may conflict when both are merged.",
  decision: 'Your decision',
  accepting: 'Accepting will',
  will: ['Keep the branch on this Mac, for you to merge yourself', "Remove the task's copy of the project", 'Push or merge nothing'],
  rejectNote: 'Reject removes the copy too, and asks whether to keep the branch.',
  reject: 'Reject',
  accept: 'Accept',
  thisTask: 'This task',
  facts: [['Mode', 'Manual'], ['Agent', 'Claude Code'], ['Reviewer', 'Codex, its default model'], ['Repository', 'billing-api']],
  label: "Illustration · words from Botbench's screens",
  // Not a product string: the card's one annotation, drawn outside the screen's surfaces in the
  // peer colour with a leader to the line it explains.
  note: 'Another workbench is changing the same file. You find out before either is merged.',
};

// Fragments to find in the product's source. A templated line is checked by its fixed parts.
const SOURCES = [
  ['e2e/media.shots.ts', ['Make add in calc.py return the sum', 'python3 -B -m unittest -q', 'studio-mac and office-mac']],
  ['web/src/components/task-status.ts', ['building: "Working"', 'verifying: "Checking"', 'reviewing: "In review"', 'awaiting_decision: "Ready for review"', '"Working. Claude Code is working in a separate copy of the project."']],
  ['web/src/components/evidence.tsx', ['"check", "checks")} passed.', 'words: "Passed"', `"A model's opinion, not a check."`, '"its default model"']],
  ['src/engine/refine.ts', ['${reviewer} found nothing to fix.']],
  ['web/src/screens2/review/review-parts.tsx', ['"file", "files")} changed']],
  ['web/src/app/peers.ts', ["'s open pull request #${pr.number} also changes ${list(named)}, so the two may conflict when both are merged."]],
  ['web/src/screens2/task/task-screen.tsx', ['data-testid="peer-overlap"', 'aria-label="This task"', '{ name: "Mode"', '{ name: "Agent"', '{ name: "Reviewer"', '{ name: "Repository"']],
  ['web/src/app/run-words.ts', ['manual: "Manual"']],
  ['web/src/screens2/review/decision-panel.tsx', ['"Your decision"', '"Accepting will"', '"Keep the branch on this Mac, for you to merge yourself"', `"Remove the task's copy of the project"`, '"Push or merge nothing"', '"Reject removes the copy too, and asks whether to keep the branch."', ': "Reject"}', ': "Accept"}']],
];

function sibling(env, names) {
  if (process.env[env]) return process.env[env];
  return names.map((n) => join(ROOT, '..', n)).find((p) => existsSync(p)) ?? null;
}

const botbench = sibling('BOTBENCH_DIR', ['botbench']);
if (botbench && existsSync(join(botbench, 'web/src'))) {
  for (const [file, needles] of SOURCES) {
    const text = readFileSync(join(botbench, file), 'utf8');
    for (const n of needles) if (!text.includes(n)) throw new Error(`card words: ${file} no longer says ${JSON.stringify(n)}. Read the change, then update COPY.`);
  }
  console.log(`words: checked against ${botbench}`);
} else console.log('words: no Botbench checkout found (BOTBENCH_DIR); built from the committed copy');

// ---------------------------------------------------------------- the colours
// Graphite + Glacier, from design-system themes/botbench.css (light :root, dark [data-theme="dark"]).
const THEMES = {
  light: { surface: '#F5F6F7', raised: '#FFFFFF', fill: '#ECEEF1', text: '#1A2028', muted: '#545E6B', border: '#DFE2E7', borderStrong: '#76808E', accent: '#215BB8', onAccent: '#FFFFFF', success: '#146A4A', successSubtle: '#E1F3EA', danger: '#B43E46', info: '#215BB8', infoSubtle: '#E6EEFB', approval: '#97600E', approvalSubtle: '#FBF0DC', peer: '#0C7187' },
  dark: { surface: '#111316', raised: '#20242B', fill: '#2C3139', text: '#F2F3F5', muted: '#ADB4BE', border: '#2A2F37', borderStrong: '#727D8B', accent: '#7CB7FF', onAccent: '#0B1522', success: '#6ED5A4', successSubtle: '#12281F', danger: '#FF898A', info: '#7CB7FF', infoSubtle: '#16263A', approval: '#F2B95D', approvalSubtle: '#2E2513', peer: '#60D4D4' },
};
const TOKEN = { surface: 'surface', raised: 'surface-raised', fill: 'fill', text: 'on-surface', muted: 'muted', border: 'border', borderStrong: 'border-strong', accent: 'accent', onAccent: 'on-accent', success: 'success', successSubtle: 'success-subtle', danger: 'danger', info: 'info', infoSubtle: 'info-subtle', approval: 'approval', approvalSubtle: 'approval-subtle', peer: 'peer' };

const ds = sibling('DS_DIR', ['ds', 'design-system']);
if (ds && existsSync(join(ds, 'themes/botbench.css'))) {
  const css = readFileSync(join(ds, 'themes/botbench.css'), 'utf8');
  const block = (sel) => css.slice(css.indexOf(sel), css.indexOf('}', css.indexOf(sel)));
  const blocks = { light: block(':root {'), dark: block('[data-theme="dark"] {') };
  for (const [mode, theme] of Object.entries(THEMES)) {
    for (const [key, hex] of Object.entries(theme)) {
      const m = blocks[mode].match(new RegExp(`--ds-color-${TOKEN[key]}:\\s*(#[0-9A-Fa-f]{6})`));
      if (!m || m[1].toUpperCase() !== hex.toUpperCase()) throw new Error(`card colours: ${mode} ${TOKEN[key]} is ${m ? m[1] : 'missing'} in the theme, ${hex} here`);
    }
  }
  console.log(`colours: checked against ${join(ds, 'themes/botbench.css')}`);
} else console.log('colours: no design system checkout found (DS_DIR); built from the committed values');

// ---------------------------------------------------------------- type
const font = (pkg, file) => join(dirname(require.resolve(`@fontsource/${pkg}/package.json`)), 'files', file);
const FONTS = {
  sans: font('inter', 'inter-latin-400-normal.woff'),
  bold: font('inter', 'inter-latin-600-normal.woff'),
  mono: font('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
};

// The real two-tone lockup, unchanged except its one <text>, which is outlined in Inter
// SemiBold (the lockup asks for the platform's system font, which may not be shipped).
function lockup(mode, glyphs) {
  const svg = readFileSync(join(HERE, 'assets', `botbench-lockup-two-tone-${mode}.svg`), 'utf8');
  const mark = svg.match(/<g transform="translate\(-6 -6\) scale\(2\)">[\s\S]*?<\/g>/);
  const t = svg.match(/<text x="(\d+)" y="(\d+)"[^>]*font-size="(\d+)" font-weight="600" letter-spacing="(-?[\d.]+)" fill="(#[0-9A-F]{6})">Botbench<\/text>/);
  if (!svg.includes('viewBox="0 0 212 36"') || !mark || !t) throw new Error(`lockup ${mode}: the file changed shape; read it again before drawing it`);
  const [, x, y, size, ls, fill] = t;
  return mark[0] + glyphs.text('Botbench', { font: 'bold', size: +size, x: +x, y: +y, fill, tracking: +ls / +size });
}

// ---------------------------------------------------------------- drawing
const f1 = (n) => Number(n.toFixed(1));
const rect = (x, y, w, h, rx, fill, stroke, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ''}${extra}/>`;
const line = (x1, y1, x2, y2, stroke) => `<path d="M${f1(x1)} ${f1(y1)}H${f1(x2)}" stroke="${stroke}"/>`;
// lucide icons as the product draws them (lucide-react, ISC): Check, Minus, CircleCheck
const icon = (d, x, y, size, stroke, width = 2) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${size / 24})" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${d}</g>`;
const CHECK = '<path d="M20 6 9 17l-5-5"/>';
const MINUS = '<path d="M5 12h14"/>';
const CIRCLE_CHECK = '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>';

/**
 * One card. `wide` is the README at desktop width (shown about 830 px wide); `compact`
 * is the phone (about 358 px wide), its own composition with larger type and less said.
 */
function build(mode, layout) {
  const C = THEMES[mode];
  const glyphs = createGlyphSet(FONTS, { prefix: 'g' });
  const T = 13;
  const tl = createTimeline({ duration: T, prefix: 'b' });
  const ease = 'cubic-bezier(.2,0,0,1)';
  // A story beat: rises 8 px and fades in over 0.35 s from `t`, then stays. Part of the still frame.
  const rise = (t, dy = 8) => `class="${tl.keyframes((p) => `0%,${p(t)}{opacity:0;transform:translateY(${dy}px)}${p(t + 0.35)},100%{opacity:1;transform:translateY(0)}`, { timing: ease })}"`;
  const text = (s, o) => glyphs.text(s, { font: 'sans', ...o });
  const W = layout === 'wide' ? 1200 : 640;
  const P = layout === 'wide' ? 40 : 24;
  const S = layout === 'wide'
    ? { label: 17, task: 20, chip: 16, title: 36, meta: 19, mono: 18, big: 24, body: 20, small: 18, panelTitle: 26, panelBody: 18 }
    : { label: 19, task: 24, chip: 20, title: 30, meta: 22, mono: 21, big: 28, body: 23, small: 22, panelTitle: 30, panelBody: 22 };
  const out = [];
  const g = (attrs, inner) => `<g ${attrs}>${inner}</g>`;
  const measure = (s, size, f = 'sans') => glyphs.measure(s, { font: f, size });
  const wrap = (s, size, width, f = 'sans') => glyphs.wrap(s, { font: f, size }, width);

  // Header: the lockup, and the label that says what this picture is.
  const lockScale = layout === 'wide' ? 1 : 0.95;
  const header = [];
  header.push(`<g transform="translate(${P} ${layout === 'wide' ? 22 : 24}) scale(${lockScale})">${lockup(mode, glyphs)}</g>`);
  let y;
  if (layout === 'wide') {
    header.push(text(COPY.label, { size: S.label, x: W - P, y: 46, fill: C.muted, anchor: 'end' }));
    header.push(line(0, 72.5, W, 72.5, C.border));
    y = 72;
  } else {
    header.push(text(COPY.label, { size: S.label, x: P, y: 98, fill: C.muted }));
    header.push(line(0, 120.5, W, 120.5, C.border));
    y = 120;
  }

  const L = P; // left column
  const LW = layout === 'wide' ? 720 : W - 2 * P;
  const stage = [];

  // Breadcrumb and the status chip, which follows the task through its states.
  y += layout === 'wide' ? 46 : 50;
  stage.push(text(COPY.task, { font: 'bold', size: S.task, x: L, y, fill: C.text }));
  const chipX = L + measure(COPY.task, S.task, 'bold') + 14;
  const chip = (word, fg, bg) => {
    const w = measure(word, S.chip, 'bold') + 22;
    const h = S.chip + 14;
    return rect(chipX, y - h + 7 + S.chip * 0.15, w, h, 6, bg) + text(word, { font: 'bold', size: S.chip, x: chipX + 11, y: y + S.chip * 0.15 - 1, fill: fg });
  };
  const [working, checking, reviewing, ready] = COPY.states;
  stage.push(g(tl.span(1.5, 3.2).attrs, chip(working, C.info, C.infoSubtle)));
  stage.push(g(tl.span(3.2, 4.6).attrs, chip(checking, C.info, C.infoSubtle)));
  stage.push(g(tl.span(4.6, 6.6).attrs, chip(reviewing, C.info, C.infoSubtle)));
  stage.push(g(tl.on(6.6, { fade: 0.25 }).attrs, chip(ready, C.approval, C.approvalSubtle)));

  // The task, typed: it is being handed over.
  y += layout === 'wide' ? 54 : 60;
  const titleW = measure(COPY.title, S.title, 'bold');
  if (titleW > LW) throw new Error('card: the title does not fit');
  stage.push(text(COPY.title, { font: 'bold', size: S.title, x: L, y, fill: C.text }));
  const cv = tl.cover({ start: 0.35, end: 1.3, chars: COPY.title.length, width: titleW + 14 });
  const titleTop = y - S.title, titleH = S.title * 1.35;
  out.push(`<clipPath id="tc"><rect x="${L}" y="${f1(titleTop)}" width="${f1(titleW + 6)}" height="${f1(titleH)}"/></clipPath>`);
  stage.push(`<g clip-path="url(#tc)"><g class="${cv}">${rect(L - 2, titleTop, titleW + 14, titleH, 0, C.surface)}${rect(L - 2, titleTop + 4, 2.5, S.title * 1.1, 0, C.accent)}</g></g>`);

  // Who builds it, and the branch of its own copy, which exists once it is working.
  y += layout === 'wide' ? 38 : 44;
  stage.push(text(COPY.builder, { size: S.meta, x: L, y, fill: C.muted }));
  let bx = L + measure(COPY.builder, S.meta) + 24;
  if (layout === 'compact') { y += S.meta + 14; bx = L; }
  const branch = text(COPY.branchLabel, { size: S.meta, x: bx, y, fill: C.muted }) + glyphs.text(COPY.branch, { font: 'mono', size: S.mono, x: bx + measure(COPY.branchLabel, S.meta) + 10, y, fill: C.text });
  if (bx + measure(COPY.branchLabel, S.meta) + 10 + measure(COPY.branch, S.mono, 'mono') > L + LW) throw new Error('card: the branch does not fit');
  stage.push(g(rise(1.5, 4), branch));

  // Evidence: the check, then the review.
  y += layout === 'wide' ? 28 : 30;
  const pad = layout === 'wide' ? 24 : 20;
  const rowA = layout === 'wide' ? 92 : 104;
  const rowB = layout === 'wide' ? 100 : 156;
  // The evidence card is there once the work has started.
  stage.push(g(rise(1.5, 4), rect(L + 0.5, y + 0.5, LW - 1, rowA + rowB - 1, 12, C.raised, C.border)));
  // Before there is evidence, the card says what is happening.
  const wl = wrap(COPY.working, S.body, LW - 2 * pad - 30);
  stage.push(g(tl.span(1.5, 3.6).attrs,
    `<circle cx="${L + pad + 6}" cy="${f1(y + rowA / 2 + 8 - (wl.length - 1) * S.body * 0.65 - S.body * 0.35)}" r="5" fill="${C.info}"/>` +
    wl.map((s, i) => text(s, { size: S.body, x: L + pad + 24, y: y + rowA / 2 + 8 - (wl.length - 1) * S.body * 0.65 + i * S.body * 1.3, fill: C.muted })).join('')));
  const ic = layout === 'wide' ? 40 : 44;
  const checkRow =
    `<circle cx="${L + pad + ic / 2}" cy="${y + rowA / 2}" r="${ic / 2}" fill="${C.successSubtle}"/>` +
    icon(CHECK, L + pad + ic / 2 - 11, y + rowA / 2 - 11, 22, C.success, 2.4) +
    text(COPY.checks, { font: 'bold', size: S.big, x: L + pad + ic + 16, y: y + rowA / 2 - 4, fill: C.text }) +
    icon(CIRCLE_CHECK, L + pad + ic + 16, y + rowA / 2 + 10, S.mono, C.success, 2) +
    glyphs.text(COPY.command, { font: 'mono', size: S.mono, x: L + pad + ic + 16 + S.mono + 10, y: y + rowA / 2 + 10 + S.mono * 0.8, fill: C.text });
  const passX = L + pad + ic + 16 + S.mono + 10 + measure(COPY.command, S.mono, 'mono') + 12;
  const passW = measure(COPY.passed, S.small - 2) + 16;
  if (passX + passW > L + LW - pad) throw new Error('card: the check row does not fit');
  const checkAll = checkRow + rect(passX, y + rowA / 2 + 8, passW, S.mono + 8, 5, C.successSubtle) + text(COPY.passed, { size: S.small - 2, x: passX + 8, y: y + rowA / 2 + 8 + S.mono * 0.95, fill: C.success });
  stage.push(g(rise(3.6), checkAll + line(L + 1, y + rowA + 0.5, L + LW - 1, y + rowA + 0.5, C.border)));
  // The review: Codex's words, and what they are.
  const ry = y + rowA;
  const review = [];
  const vx = L + pad;
  if (layout === 'wide') {
    review.push(text(COPY.reviewer, { font: 'bold', size: S.body, x: vx, y: ry + 40, fill: C.text }));
    review.push(text(COPY.verdict, { size: S.body, x: vx + measure(COPY.reviewer, S.body, 'bold') + 8, y: ry + 40, fill: C.muted }));
    review.push(text(COPY.opinion, { size: S.small, x: vx, y: ry + 72, fill: C.text }));
  } else {
    review.push(text(COPY.reviewer, { font: 'bold', size: S.body, x: vx, y: ry + 42, fill: C.text }));
    review.push(text(COPY.verdict, { size: S.body, x: vx, y: ry + 78, fill: C.muted }));
    review.push(text(COPY.opinion, { size: S.small, x: vx, y: ry + 122, fill: C.text }));
  }
  stage.push(g(rise(5.0), review.join('')));
  y += rowA + rowB;

  // What changed, committed to the branch once the work is done.
  y += layout === 'wide' ? 16 : 18;
  const fh = layout === 'wide' ? 112 : 124;
  const files = [];
  files.push(rect(L + 0.5, y + 0.5, LW - 1, fh - 1, 12, C.raised, C.border));
  files.push(text(COPY.files, { font: 'bold', size: S.body, x: L + pad, y: y + 38, fill: C.text }));
  const plus = (yy, right) => glyphs.text('+1', { font: 'mono', size: S.mono, x: right - measure('-1', S.mono, 'mono') - 10, y: yy, fill: C.success, anchor: 'end' }) + glyphs.text('-1', { font: 'mono', size: S.mono, x: right, y: yy, fill: C.danger, anchor: 'end' });
  files.push(plus(y + 38, L + LW - pad));
  files.push(line(L + 1, y + 56.5, L + LW - 1, y + 56.5, C.border));
  const fw = measure(COPY.file, S.mono, 'mono') + 24;
  files.push(rect(L + pad - 8, y + 66, fw, S.mono + 16, 6, C.fill));
  files.push(glyphs.text(COPY.file, { font: 'mono', size: S.mono, x: L + pad + 4, y: y + 66 + S.mono * 1.15, fill: C.text }));
  files.push(text('modified', { size: S.small - 1, x: L + LW - pad - measure('+1 -1', S.mono, 'mono') - 14, y: y + 66 + S.mono * 1.15, fill: C.muted, anchor: 'end' }));
  files.push(plus(y + 66 + S.mono * 1.15, L + LW - pad));
  stage.push(g(rise(3.2), files.join('')));
  y += fh;

  // The overlap: muted meta text under the changed files, as the Review tab shows it.
  y += layout === 'wide' ? 34 : 40;
  const ol = wrap(COPY.overlap, S.small, LW - 8);
  stage.push(g(rise(7.0), ol.map((s, i) => text(s, { size: S.small, x: L, y: y + i * S.small * 1.4, fill: C.muted })).join('')));
  const overlapTop = y;
  y += (ol.length - 1) * S.small * 1.4;

  // The annotation: not part of the screen. A 1.5 px leader in the peer colour leaves a dot
  // 6 px from the line it explains and draws to a short note, which then fades in and stays.
  const draw = (t, axis) => `class="${tl.keyframes((p) => `0%,${p(t)}{opacity:0;transform:scale${axis}(0)}${p(t + 0.05)}{opacity:1;transform:scale${axis}(0)}${p(t + 0.35)},100%{opacity:1;transform:scale${axis}(1)}`, { timing: ease, base: `transform-box:fill-box;transform-origin:${axis === 'X' ? 'left center' : 'center top'};` })}"`;
  const NOTE = layout === 'wide' ? 21 : 25;
  const noteLines = (width) => wrap(COPY.note, NOTE, width, 'bold');
  let noteBottom;
  if (layout === 'wide') {
    const NX = 812, ly = overlapTop - S.small * 0.36;
    const from = L + measure(ol[0], S.small) + 6;
    const lines = noteLines(W - P - NX);
    stage.push(g(tl.on(7.25, { fade: 0.1 }).attrs, `<circle cx="${f1(from + 2.5)}" cy="${f1(ly)}" r="2.5" fill="${C.peer}"/>`));
    stage.push(`<path ${draw(7.25, 'X')} d="M${f1(from + 2.5)} ${f1(ly)}H${NX - 10}" stroke="${C.peer}" stroke-width="1.5"/>`);
    stage.push(g(rise(7.5, 6), lines.map((l, i) => text(l, { font: 'bold', size: NOTE, x: NX, y: ly + NOTE * 0.36 + i * NOTE * 1.32, fill: C.peer })).join('')));
    noteBottom = ly + NOTE * 0.36 + (lines.length - 1) * NOTE * 1.32;
  } else {
    const top = y + 16, lines = noteLines(LW - 22);
    const first = top + 14 + NOTE * 0.8;
    const last = first + (lines.length - 1) * NOTE * 1.32;
    stage.push(g(tl.on(7.25, { fade: 0.1 }).attrs, `<circle cx="${L + 4}" cy="${f1(top)}" r="2.5" fill="${C.peer}"/>`));
    stage.push(`<path ${draw(7.25, 'Y')} d="M${L + 4} ${f1(top)}V${f1(last + 6)}" stroke="${C.peer}" stroke-width="1.5"/>`);
    stage.push(g(rise(7.5, 6), lines.map((l, i) => text(l, { font: 'bold', size: NOTE, x: L + 20, y: first + i * NOTE * 1.32, fill: C.peer })).join('')));
    noteBottom = last;
    y = last;
  }

  // Right column (wide) or below (compact): the task's facts until the decision, then the decision.
  const decision = [];
  let H;
  if (layout === 'wide') {
    const X = 800, RW = W - P - X;
    const facts = [text(COPY.thisTask, { font: 'bold', size: S.body, x: X, y: 140, fill: C.text })];
    COPY.facts.forEach(([k, v], i) => {
      const fy = 196 + i * 54;
      facts.push(text(k, { size: S.panelBody, x: X, y: fy, fill: C.muted }));
      facts.push(text(v, { size: S.panelBody, x: X + RW, y: fy, fill: C.text, anchor: 'end' }));
      facts.push(line(X, fy + 20.5, X + RW, fy + 20.5, C.border));
    });
    stage.push(g(tl.until(9.1, { fade: 0.2 }).attrs, facts.join('')));
    const top = 100, ix = X + 24, iw = RW - 48;
    let dy = top + 52;
    decision.push(text(COPY.decision, { font: 'bold', size: S.panelTitle, x: ix, y: dy, fill: C.text }));
    dy += 40;
    decision.push(text(COPY.accepting, { font: 'bold', size: S.panelBody - 2, x: ix, y: dy, fill: C.muted }));
    dy += 32;
    COPY.will.forEach((s, i) => {
      const lines = wrap(s, S.panelBody, iw - 28);
      decision.push(icon(i < 2 ? CHECK : MINUS, ix, dy - 15, 18, C.muted, 2));
      lines.forEach((l, j) => decision.push(text(l, { size: S.panelBody, x: ix + 28, y: dy + j * 26, fill: C.text })));
      dy += lines.length * 26 + 10;
    });
    dy += 10;
    wrap(COPY.rejectNote, S.panelBody - 2, iw).forEach((l, j) => decision.push(text(l, { size: S.panelBody - 2, x: ix, y: dy + j * 23, fill: C.muted })));
    dy += 2 * 23 + 16;
    const bh = 50, rw = 112, aw = iw - rw - 12;
    decision.push(rect(ix + 0.5, dy + 0.5, rw - 1, bh - 1, 8, 'none', C.borderStrong));
    decision.push(text(COPY.reject, { font: 'bold', size: S.panelBody, x: ix + rw / 2, y: dy + bh / 2 + 6.5, fill: C.text, anchor: 'middle' }));
    decision.push(rect(ix + rw + 12, dy, aw, bh, 8, C.accent));
    decision.push(text(COPY.accept, { font: 'bold', size: S.panelBody, x: ix + rw + 12 + aw / 2, y: dy + bh / 2 + 6.5, fill: C.onAccent, anchor: 'middle' }));
    dy += bh + 26;
    const panel = rect(X + 0.5, top + 0.5, RW - 1, dy - top - 1, 14, C.raised, C.border) + decision.join('');
    stage.push(g(rise(9.35, 10), panel));
    H = Math.ceil(Math.max(y, dy, noteBottom) + 40);
  } else {
    y += 28;
    const top = y, ix = L + pad;
    let dy = top + 50;
    decision.push(text(COPY.decision, { font: 'bold', size: S.panelTitle, x: ix, y: dy, fill: C.text }));
    dy += 26;
    const bh = 60, rw = 170, aw = LW - 2 * pad - rw - 14;
    decision.push(rect(ix + 0.5, dy + 0.5, rw - 1, bh - 1, 9, 'none', C.borderStrong));
    decision.push(text(COPY.reject, { font: 'bold', size: S.panelBody, x: ix + rw / 2, y: dy + bh / 2 + 8, fill: C.text, anchor: 'middle' }));
    decision.push(rect(ix + rw + 14, dy, aw, bh, 9, C.accent));
    decision.push(text(COPY.accept, { font: 'bold', size: S.panelBody, x: ix + rw + 14 + aw / 2, y: dy + bh / 2 + 8, fill: C.onAccent, anchor: 'middle' }));
    dy += bh + 24;
    stage.push(g(rise(9.35, 10), rect(L + 0.5, top + 0.5, LW - 1, dy - top - 1, 14, C.raised, C.border) + decision.join('')));
    H = Math.ceil(dy + P);
  }

  const title = "Illustration in Botbench's own words: a task, Make add in calc.py return the sum, is handed to Claude Code, which works in a separate copy on the branch botbench/studio-mac/run-7/task-7. 1 of 1 check passed. Codex's review is shown as a model's opinion, not a check. Under the changed file, calc.py, Botbench warns: office-mac's open pull request #12 also changes calc.py, so the two may conflict when both are merged. Your decision: Reject or Accept. An annotation beside the warning, not part of the screen, says: Another workbench is changing the same file. You find out before either is merged.";
  const body = rect(0, 0, W, H, 0, C.surface) + `<g class="${tl.dip({ seconds: 0.4 })}">${header.join('')}${stage.join('')}</g>`;
  return { svg: card({ title, css: tl.css(), defs: out.join('') + glyphs.defs(), body, width: W, height: H, radius: 16 }), T };
}

// A still is the same file with nothing scheduled: the base state is the finished frame,
// and what is absent from it carries opacity="0".
function still(svg) {
  return svg.replace(/<style>[\s\S]*?<\/style>/, '').replace(/ class="[^"]*"/g, '').replace(/<clipPath id="tc">[\s\S]*?<\/clipPath>/, '').replace(/<g clip-path="url\(#tc\)">(?:<g>(?:<rect[^>]*\/>)+<\/g>)<\/g>/, '');
}

mkdirSync(OUT, { recursive: true });
const MAX = 300 * 1024;
for (const mode of ['light', 'dark']) {
  for (const layout of ['wide', 'compact']) {
    const { svg } = build(mode, layout);
    const name = layout === 'wide' ? `botbench-card-${mode}` : `botbench-card-compact-${mode}`;
    const stillName = layout === 'wide' ? `botbench-card-still-${mode}` : `botbench-card-compact-still-${mode}`;
    const s = still(svg);
    if (s.includes('class=') || s.includes('url(#tc)')) throw new Error(`${stillName}: something animated is left in the still`);
    for (const [n, body] of [[name, svg], [stillName, s]]) {
      if (Buffer.byteLength(body) > MAX) throw new Error(`${n} is ${Buffer.byteLength(body)} bytes, above ${MAX}`);
      writeFileSync(join(OUT, `${n}.svg`), body);
      console.log(`${n}.svg  ${Buffer.byteLength(body)} bytes`);
    }
  }
}
