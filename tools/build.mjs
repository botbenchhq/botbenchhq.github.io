// Writes the site's HTML pages. No dependencies: `node tools/build.mjs`.
// Every capability claim here is taken from the Botbench README at the commit
// named in PROVENANCE.md. Change the README first, then this file.
// Each page has one purpose and one primary action; the comment above each page says which.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://botbenchhq.github.io/';
const REPO = 'https://github.com/botbenchhq/botbench';
const src = (path) => `${REPO}/blob/main/${path}`;
const issue = (n) => `${REPO}/issues/${n}`;

const icon = {
  out: '<svg class="out" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5H3.5v9h9V10M9 3.5h3.5V7M12.5 3.5 7 9"/></svg>',
  sun: '<svg class="sun" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="3.4"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/></svg>',
  moon: '<svg class="moon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 11.8A7 7 0 0 1 8.2 3.5a7 7 0 1 0 8.3 8.3z"/></svg>',
  menu: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3.5 6h13M3.5 10h13M3.5 14h13"/></svg>',
  mark: '<svg viewBox="3 3 18 18" aria-hidden="true"><path class="mark-a" d="M13 4H6A2 2 0 0 0 4 6V17A2 2 0 0 0 6 19H8V9H13Z"/><path class="mark-b" d="M11 20H18A2 2 0 0 0 20 18V7A2 2 0 0 0 18 5H16V15H11Z"/></svg>',
};

const NAV = [
  ['workbench.html', 'Workbench'],
  ['coordination.html', 'Coordination'],
  ['proof.html', 'Evidence'],
  ['explore.html', 'What works today'],
  ['docs.html', 'Docs'],
];

// A state tag marks the one item a reader must treat differently; available items carry none.
const tag = (state) => `<span class="tag tag-${state}">${{ early: 'Early', planned: 'Planned' }[state]}</span>`;
const btn = (label, href, kind = 'primary', ic = '') => `<a class="btn btn-${kind}" href="${href}">${label}${ic ? ` ${ic}` : ''}</a>`;
const more = (label, href, ic = '') => `<a class="more" href="${href}">${label}${ic ? ` ${ic}` : ''}</a>`;
// A crop links to the whole screen it was cut from (PROVENANCE.md lists each crop).
const shot = (file, w, h, alt, caption, cls = '', whole = file) =>
  `<figure class="frame ${cls}"><a class="zoom" href="assets/media/${whole}" aria-label="Open the whole screen: ${alt.split(':')[0]}"><img src="assets/media/${file}" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async"></a>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
const clip = (file, poster, w, h, label, caption, fallback, cls = '') =>
  `<figure class="frame ${cls}"><video controls playsinline preload="none" width="${w}" height="${h}" poster="assets/media/${poster}" aria-label="${label}"><source src="assets/media/${file}" type="video/mp4">${fallback}</video><figcaption>${caption}</figcaption></figure>`;
const head = (title, text, id = '') => `<div class="section-head"${id ? ` id="${id}"` : ''}><h2>${title}</h2>${text ? `<p>${text}</p>` : ''}</div>`;
const pageHero = (title, lead, extra = '') => `<section class="hero page-hero"><div class="wrap"><h1>${title}</h1><p class="lead">${lead}</p>${extra}</div></section>`;
// A list of terms and what each means, laid out as rows: the site's one shape for a set of facts.
const facts = (rows, cls = '') => `<dl class="facts ${cls}">${rows.map(([term, text]) => `<div><dt>${term}</dt><dd>${text}</dd></div>`).join('')}</dl>`;

// The coordination scene: an authored illustration (scene/coordination.tsx), bundled
// into assets/scene-coordination.{js,css} by tools/build-scene.mjs. Without
// JavaScript the page shows its last frame as an image and its last caption.
const SCENE_ASSETS = '<link rel="stylesheet" href="assets/kit/stageshow.css">\n<link rel="stylesheet" href="assets/scene-coordination.css">\n<script defer src="assets/scene-coordination.js"></script>\n';
const SCENE_FINAL_ALT = 'Illustration of two Botbench workbenches on one GitHub repository, at its last step. On the remote billing-api, studio-mac’s claim on issue #42 and its pull request #12. office-mac’s task for issue #43 is accepted, after checking it together with pull request #12: Passed together.';
const scene = (id) => `<figure class="scene" id="${id}">
<div class="scene-mount" data-scene-mount="coordination">
<img class="scene-fallback" src="assets/media/scene-coordination-final.png" width="2400" height="1312" alt="${SCENE_FINAL_ALT}" loading="lazy" decoding="async">
<p class="scene-fallback-caption">You found out before either was merged. Both branches are still there to decide on.</p>
</div>
<figcaption class="scene-label">Illustration. Botbench’s lines are in its own words; the repository, issue titles and the remote’s panel are examples. Each step is a shipped feature: issue claims, the overlap warning and checking two changes together. <a href="${REPO}#what-works-today">What works today</a></figcaption>
</figure>`;

// Said once per page that shows the real screens, under the first of them.
const SHOTS_NOTE = 'Real screens from a Botbench installation named studio-mac, working on a small billing repository. The agents’ work is replayed from recorded Claude Code and Codex sessions; the repository’s check really ran. Nothing on them was edited. <a href="https://github.com/botbenchhq/botbenchhq.github.io/blob/main/PROVENANCE.md">Where each one came from</a>';

// What it takes, said in one place: the closing of the four product pages.
const NEEDS = facts([
  ['Mac', 'macOS. Agents start only on macOS, because the confinement relies on its sandbox.'],
  ['Node', 'Node 24 or later, and git set up so you can commit.'],
  ['Claude Code', 'Required, signed in with your own subscription. It plans every run and builds by default.'],
  ['Codex', 'Optional, to build or to review.'],
], 'needs');

const closing = `<section class="closing" aria-labelledby="closing-title"><div class="wrap closing-grid">
<div><h2 id="closing-title">Make your first branch in about ten minutes.</h2>
<p>Build Botbench from source, hand Claude Code one task in a practice repository, and read the branch it leaves. Early software: no installer, no hosted service, and nothing promised to stay the same.</p>
<div class="btn-row">${btn('Build from source', 'get-started.html')}${btn('View the code on GitHub', REPO, 'quiet')}</div></div>
<div><h3 class="needs-title">What it needs</h3>${NEEDS}</div>
</div></section>`;

function page({ file, title, description, body, base = '', rootLinks = false, headExtra = '', end = false }) {
  const nav = NAV.map(([href, label]) => `<a href="${href}"${href === file ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const url = SITE + (file === 'index.html' ? '' : file);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${base}<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Botbench">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}assets/media/social-preview.png">
<meta property="og:image:width" content="1280">
<meta property="og:image:height" content="640">
<meta property="og:image:alt" content="Botbench: put your coding agents to work. Together.">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#111316" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#F5F6F7" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="preload" href="assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/site.css">
<script>try{var t=localStorage.getItem('botbench-site-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}</script>
<script defer src="assets/site.js"></script>
${headExtra}<noscript><style>.tabpanel[hidden]{display:grid!important;margin-top:16px}.tablist,.menu-btn,.theme-btn{display:none!important}.nav-links{display:flex!important;position:static!important;flex-wrap:wrap}</style></noscript>
</head>
<body${file === 'index.html' ? ' class="home"' : ''}>
<a class="skip" href="#main">Skip to the page</a>
<header class="site-header"><div class="wrap nav">
<a class="brand" href="index.html" aria-label="Botbench, home">${icon.mark}<span>Botbench</span></a>
<button class="icon-btn menu-btn" type="button" data-menu-toggle aria-controls="site-nav" aria-expanded="false" aria-label="Open the menu">${icon.menu}</button>
<nav class="nav-links" id="site-nav" aria-label="Pages">${nav}<a class="phone-only" href="get-started.html"${file === 'get-started.html' ? ' aria-current="page"' : ''}>Build from source</a></nav>
<div class="nav-actions">
<button class="icon-btn theme-btn" type="button" data-theme-toggle aria-label="Use the dark theme">${icon.sun}${icon.moon}</button>
${file === 'get-started.html' ? '' : btn('Build from source', 'get-started.html', 'quiet')}
</div>
</div></header>
<main id="main">
${body}
${end ? closing : ''}
</main>
<footer class="footer"><div class="wrap footer-grid">
<div><a class="brand" href="index.html" aria-label="Botbench, home">${icon.mark}<span>Botbench</span></a>
<p>One workbench for your agents. One coordination layer for your team.</p>
<p>Built by <a class="maker-link" href="https://github.com/jon-lange">Jon Lange</a>. Early software for macOS.<br>Apache License 2.0. No cookies or visit tracking.</p></div>
<div class="footer-cols">
<div><p class="footer-head">Product</p><a href="workbench.html">Workbench</a><a href="coordination.html">Coordination</a><a href="proof.html">Evidence</a><a href="explore.html">What works today</a></div>
<div><p class="footer-head">Use it</p><a href="get-started.html">Build from source</a><a href="docs.html">Docs</a><a href="${REPO}">GitHub</a></div>
<div><p class="footer-head">Project</p><a href="${REPO}/issues">Issues</a><a href="${src('SECURITY.md')}">Security</a><a href="${src('LICENSE')}">Licence</a><a href="https://github.com/botbenchhq/design-system">Design system</a></div>
</div>
</div></footer>
</body>
</html>
`;
  writeFileSync(join(ROOT, file), rootLinks ? html.replace(/\s(href|src)="(?!https?:|#|\/)/g, ' $1="/') : html);
}

/* ---------- Home: both halves in one screen each; primary action Build from source ---------- */
const stages = [
  {
    id: 'delegate', label: 'Delegate', hint: 'Hand over the work',
    title: 'A task. Its own branch.',
    text: 'Hand over a task, or let Claude Code plan a run of several. Each task works in its own copy of your repository, on a branch such as <code>botbench/your-mac/run-1/task-1</code>, under the mode you choose: manual, semi-autonomous or fully autonomous.',
    link: 'How a piece of work goes', href: 'workbench.html',
    media: shot('check-a-command-crop.png', 1584, 1096,
      'Check a command in Botbench’s settings: git push origin main in billing-api asks you in Manual and Semi-autonomous, and is refused in Fully autonomous, each with its rule, git-push',
      'Check a command: what <code>git push origin main</code> would get in each mode, before any agent runs it.', '', 'permissions-check.png'),
  },
  {
    // The panel ID is kept so saved links and keyboard navigation still reach the second stage.
    id: 'hand-over', label: 'Follow', hint: 'Answer from anywhere',
    title: 'Answer only what reaches outside.',
    text: 'Reading, editing and commands inside the task’s copy go on without you. A push, sudo or a file outside the copy waits as a card you answer on the Mac, or on your phone over a private network that gives the Mac an HTTPS name.',
    link: 'What asks, and what never does', href: 'workbench.html#how-it-goes',
    media: clip('first-task-phone.mp4', 'first-task-phone-poster.jpg', 780, 1688,
      'A 24-second recording at phone size: a task is started, reviewed and accepted',
      'Start a task, review it and accept it, at phone size, at real speed. Claude Code’s reply is replayed from a recorded session. 24 seconds, no sound.',
      'Your browser cannot play this recording. The text beside it says what it shows.', 'frame-phone'),
  },
  {
    id: 'verify', label: 'Verify', hint: 'Judge the result',
    title: 'Come back to work you can inspect.',
    text: 'Read the branch, the diff and the output of your repository’s checks. Another vendor’s agent can review the change; Botbench shows its review as a model’s opinion, apart from the checks. Then accept or reject. Botbench never merges a pull request.',
    link: 'What a check can and cannot tell you', href: 'proof.html',
    media: shot('review-evidence-crop.png', 1552, 700,
      'A task’s evidence: 1 of 1 check passed, python3 -B -m unittest -q Passed on commit e119be7; then Codex’s review, a model’s opinion, not a check, with the two things it says it checked',
      'The check that ran, then Codex’s review, labelled as an opinion.', '', 'ready-for-review-proof.png'),
  },
];

page({
  file: 'index.html',
  title: 'Botbench: put your coding agents to work. Together.',
  description: 'A local-first workbench on your Mac for Claude Code and Codex: hand over a task, walk away, come back to a branch with its checks and a review. When a teammate’s agents work the same repository, it tells you before your work collides.',
  headExtra: SCENE_ASSETS,
  end: true,
  body: `<section class="hero home-hero"><div class="wrap">
<div class="hero-heading">
<div><h1>Put your coding agents to work. <span class="peer">Together.</span></h1>
<p class="hero-positioning">One workbench for your agents. One coordination layer for your team.</p></div>
<div class="hero-intro">
<p class="lead">For developers on a Mac who use Claude Code. Hand it a task, walk away, and come back to a branch with its checks and a second agent’s review.</p>
<p class="lead lead-team">Share a GitHub repository with a teammate who uses their own agents? When you both push there, Botbench can tell you before your work collides, not when the second pull request opens.</p>
<div class="btn-row">${btn('Build from source', 'get-started.html')}${btn('Watch the 25-second demo', '#demo', 'quiet')}</div>
<p class="cta-note">About ten minutes to your first branch, in a practice repository. Early, macOS only, open source.</p></div>
</div>
<figure class="hero-product">
<a class="zoom hero-shots" href="assets/media/hero-workbench.png" aria-label="Open the full-size image of Botbench on a Mac and a phone">
<picture class="hero-desktop"><source media="(max-width: 1023px)" srcset="assets/media/hero-phone-crop.png" width="680" height="1452"><img src="assets/media/hero-desktop-crop.png" width="2380" height="1500" alt="Real Botbench screens: on the Mac, Home with three things that need you; on the phone, a task ready for review." loading="eager" fetchpriority="high" decoding="async"></picture>
<img class="hero-phone" src="assets/media/hero-phone-crop.png" width="680" height="1452" alt="" loading="eager" decoding="async">
</a>
<figcaption><span>Home on studio-mac: what needs you, oldest wait first. On the phone, a task ready for review.</span></figcaption>
</figure>
<div class="agent-rail" aria-label="The agents Botbench drives">
<div><strong>Claude Code</strong><span>Plans and builds. Required.</span></div>
<div><strong>Codex</strong><span>Builds and reviews. Optional.</span></div>
<div><strong>Grok, Antigravity</strong><span>Review and chat.</span></div>
<a href="workbench.html#agents">What each agent does here</a>
</div>
</div></section>

<section class="workflow-section" id="workflow"><div class="wrap">
<div class="section-title-row"><h2>Walk away.<br>Come back to the branch.</h2><p>Botbench does not touch your files or your branch. Each task gets its own copy, and you decide what comes back.</p></div>
<div class="workflow" data-workflow>
<div class="tablist workflow-tabs" role="tablist" aria-label="Three parts of a task">
${stages.map((stage, i) => `<button class="tab workflow-tab" type="button" role="tab" id="tab-${stage.id}" aria-controls="panel-${stage.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span>${stage.label}</span><small>${stage.hint}</small></button>`).join('\n')}
</div>
${stages.map((stage, i) => `<div class="tabpanel workflow-panel" role="tabpanel" id="panel-${stage.id}" aria-labelledby="tab-${stage.id}" tabindex="0"${i === 0 ? '' : ' hidden'}><div class="workflow-copy"><h3>${stage.title}</h3><p>${stage.text}</p>${more(stage.link, stage.href)}</div><div class="workflow-media">${stage.media}</div></div>`).join('\n')}
</div>
<p class="source-note">${SHOTS_NOTE}</p>
</div></section>

<section class="team-section" aria-labelledby="team-title"><div class="wrap">
<div class="team-intro"><h2 id="team-title">Find out before the second pull request.</h2>
<div><p class="lead">Two developers, each with their own agents, usually learn they took the same issue, or changed the same file, when the second pull request opens. With Botbench on both Macs, each workbench reads the other’s work from the repository you both push to, and tells you first.</p></div></div>
${scene('before-the-second-pull-request')}
<div class="team-foot"><p><strong>Available today:</strong> the overlap warning, issue claims, and checking two changes together. ${tag('early')} Paired questions and answers, tested with two installations on one Mac, not yet across two.</p>
${more('How coordination works today', 'coordination.html')}</div>
</div></section>

<section id="demo" class="demo-section" aria-labelledby="demo-title"><div class="wrap">
<div class="section-title-row"><h2 id="demo-title">From task to decision, in 25 seconds.</h2><p>A plan is approved, Claude Code fixes a bug, the repository’s check and Codex’s review come back, and the task is accepted.</p></div>
${clip('botbench-demo.mp4', 'botbench-demo-thumbnail.png', 1440, 900,
  'A 25-second recording of a Botbench task: its plan is approved, Claude Code builds, the check and Codex’s review come back, and the task is accepted.',
  'Recorded at 1440 × 900, at its real speed. The agents’ parts are replayed from recorded sessions; the check really ran. No sound.',
  `Your browser cannot play this recording. <a href="${src('docs/media/botbench-demo.mp4')}">Watch it on GitHub</a>.`, 'demo-frame')}
</div></section>`,
});

/* ---------- Workbench: the solo loop; primary action Build from source ---------- */
page({
  file: 'workbench.html',
  title: 'The workbench · Botbench',
  description: 'How a piece of work goes in Botbench: a separate copy and branch for each task, three modes, approvals only for what reaches outside, your checks, and what each agent can do.',
  end: true,
  body: `${pageHero('Walk away. Come back to the branch.', 'One coding agent in one terminal is easy to follow. Several are not. Botbench gives each task its own copy and branch, asks you only about what reaches outside it, and keeps a record of everything that ran.')}

<section id="how-it-goes" aria-labelledby="how-title"><div class="wrap split">
<div>${head('Five steps, ending in a decision.', 'What you come back to is the last step: a branch, its checks and a review, waiting for Accept or Reject.').replace('<h2>', '<h2 id="how-title">')}
</div>
<ol class="steps">
<li><div><h3>You start a task or a run</h3><p>A task is a prompt and a repository. A run is a prompt or a spec file, which Claude Code turns into a plan of tasks. In a manual run, and in any run from a GitHub issue, nothing is built before you approve the plan.</p></div></li>
<li><div><h3>Each task gets a separate copy</h3><p>It is built in its own copy of your repository (a git worktree), on its own branch, such as <code>botbench/your-mac/run-1/task-1</code>.</p></div></li>
<li><div><h3>The agent works, and asks only when it matters</h3><p>Reading, searching and editing inside the copy never ask, in any mode. An action that reaches outside the copy waits for your answer: a push, sudo, a file outside the copy. A fully autonomous run refuses these instead of asking.</p></div></li>
<li><div><h3>Botbench commits and checks</h3><p>It runs the checks you set for the repository. If you chose a reviewer, it reads the change; with concerns, the builder makes a round of fixes and the checks and the review run again.</p></div></li>
<li><div><h3>You accept or reject</h3><p>You read the diff, the checks and the transcript. Accept keeps the branch, and opens a pull request if the run says so. Botbench never merges one.</p></div></li>
</ol>
</div>
<div class="wrap result-shot">${shot('ready-for-review-proof.png', 2880, 1800,
  'A task ready for review: 1 of 1 check passed, Codex’s review, the changed line of calc.py, and Your decision with Reject and Accept',
  `What you come back to: the task, its check, Codex’s review and Your decision. ${SHOTS_NOTE}`)}</div>
</section>

<section aria-labelledby="modes-title"><div class="wrap">
${head('Choose how much each run needs you.', 'A mode is about your decisions, not about which tools an agent has. The safety rules are the same in every mode.').replace('<h2>', '<h2 id="modes-title">')}
<div class="table-scroll"><table class="stack">
<thead><tr><th scope="col">Mode</th><th scope="col">The plan</th><th scope="col">Each result</th><th scope="col">An action on the always-ask list</th></tr></thead>
<tbody>
<tr><th scope="row">Manual</th><td data-label="The plan">You approve it</td><td data-label="Each result">You decide</td><td data-label="Always-ask action">Asks you</td></tr>
<tr><th scope="row">Semi-autonomous</th><td data-label="The plan">Building starts without waiting</td><td data-label="Each result">You decide</td><td data-label="Always-ask action">Asks you</td></tr>
<tr><th scope="row">Fully autonomous</th><td data-label="The plan">Building starts without waiting</td><td data-label="Each result">Accepted without you only when its conditions hold</td><td data-label="Always-ask action">Refused, never run</td></tr>
</tbody></table></div>
<p class="source-note">A run started from a GitHub issue always waits for your approval of its plan and is never fully autonomous. The conditions for accepting without you are on <a href="proof.html#accepts">Evidence</a>.</p>
</div></section>

<section id="control" aria-labelledby="control-title"><div class="wrap split media-first">
${shot('check-a-command-crop.png', 1584, 1096, 'Check a command in Botbench’s settings: git push origin main in billing-api asks you in Manual and Semi-autonomous, and is refused in Fully autonomous, each with its rule, git-push', 'Here a push asks you, or is refused in a fully autonomous run. Open it for the whole Permissions screen, with Activity.', '', 'permissions-check.png')}
<div class="prose">
<h2 id="control-title">Know the answer before the agent asks.</h2>
<p>Check a command shows what any command would get in each mode, before an agent runs it. Permissions also lists what you chose to always allow, and every action that ran, newest first. The record is kept on your Mac and is only ever added to.</p>
<p>Commands you trust for a repository, such as <code>npm test</code>, can be allowed in advance in its settings.</p>
</div>
</div></section>

<section id="agents" aria-labelledby="agents-title"><div class="wrap">
${head('The agents you already use, each for what it can do here.', 'Botbench runs each vendor’s own, unmodified program under your own sign-in. It never reads or stores your credentials and uses no API keys.').replace('<h2>', '<h2 id="agents-title">')}
<div class="table-scroll"><table class="stack">
<thead><tr><th scope="col">Agent</th><th scope="col">Plans a run</th><th scope="col">Builds</th><th scope="col">Reviews</th><th scope="col">Chats</th></tr></thead>
<tbody>
<tr><th scope="row">Claude Code <span class="req">Required</span></th><td class="yes" data-label="Plans a run">Yes</td><td class="yes" data-label="Builds">Yes</td><td data-label="Reviews">No</td><td class="yes" data-label="Chats">Yes</td></tr>
<tr><th scope="row">Codex <span class="req">Optional</span></th><td data-label="Plans a run">No</td><td class="yes" data-label="Builds">Yes, in its own sandbox, once Botbench’s check finds that your Codex can build</td><td class="yes" data-label="Reviews">Yes</td><td class="yes" data-label="Chats">Yes</td></tr>
<tr><th scope="row">Grok</th><td data-label="Plans a run">No</td><td data-label="Builds">No</td><td class="yes" data-label="Reviews">Yes</td><td class="yes" data-label="Chats">Yes</td></tr>
<tr><th scope="row">Antigravity</th><td data-label="Plans a run">No</td><td data-label="Builds">No</td><td class="yes" data-label="Reviews">Yes</td><td class="yes" data-label="Chats">Yes</td></tr>
</tbody></table></div>
<p class="source-note">The reviewer must be a different model from the builder. Whether your subscription allows running an agent while you are away is the vendor’s decision; check its terms before relying on it.</p>
</div></section>

<section aria-label="Questions"><div class="wrap split even">
<div class="prose" id="sandbox">
<h2>Is it a sandbox?</h2>
<p class="answer">Partly, and not a hard one.</p>
<p>The macOS sandbox confines the commands an agent runs: they cannot read your sign-ins, keys or Keychain, reach no network except hosts you allow for that repository, and can write only in the task’s copy and a temporary folder.</p>
<p>It is not a virtual machine or a container. A separate copy separates changes; it is not a security boundary. Claude Code itself runs outside the sandbox with your rights, and your repository’s setup and check commands can still read your home folder outside the protected places. Point Botbench only at repositories you trust.</p>
${more('The exact limits, in the threat model', src('docs/security/threat-model.md'), icon.out)}
</div>
<div class="prose" id="leaves">
<h2>Does my code leave my Mac?</h2>
<p class="answer">Yes, as it does when you use the agents directly.</p>
<p>Each agent sends your prompts and the code it reads to its provider. Botbench does not change that, and sends little else. Without your choosing it: every 6 hours, one request to GitHub for Botbench’s latest release, with nothing about you in it, and your own <code>gh</code> and <code>git</code> reading other workbenches’ pull requests and branches. Only if you chose it: a pull request for a run, a notification to your phone, a claim on an issue.</p>
<p>Plans, transcripts, diffs, check results and approvals stay in a database on your Mac. Botbench listens on <code>127.0.0.1</code> only; do not put it on the public internet.</p>
${more('The full list of what leaves your Mac', `${REPO}#what-leaves-your-mac`, icon.out)}
</div>
</div></section>`,
});

/* ---------- Coordination: the team half, today and planned; primary action Build from source ---------- */
page({
  file: 'coordination.html',
  title: 'Coordination · Botbench',
  description: 'Two developers, each with their own agents, find out they took the same issue when the second pull request opens. What two Botbench workbenches on one repository tell you before then, what is early, and what is planned.',
  headExtra: SCENE_ASSETS,
  end: true,
  body: `${pageHero('Your agents. Their agents. One coordinated workflow.', 'Two developers, each with their own agents, find out they took the same issue when the second pull request opens. With Botbench on both Macs, each workbench sees the other’s work on the repository you share, and tells you before then.',
  `<p class="hero-meta">Each of you runs your own Botbench on your own Mac. There are no accounts and no shared server: the workbenches meet in the GitHub repository you both push to, read with your own <code>gh</code> and <code>git</code>.</p>`)}

<section class="scene-section" aria-labelledby="scene-title"><div class="wrap">
${head('What each workbench sees.', 'Two developers reach for the same issue, and then the same file. Botbench’s lines are its own; the names are examples.').replace('<h2>', '<h2 id="scene-title">')}
${scene('before-the-second-pull-request')}
</div></section>

<section aria-labelledby="today-title"><div class="wrap split">
<div>${head('Available today', 'Three warnings, in Botbench’s own words, with example names. Each needs both workbenches to push their branches or open pull requests on the same remote, with <code>gh</code> signed in on each Mac.').replace('<h2>', '<h2 id="today-title">')}</div>
<div>
<dl class="moments">
<div><dt>The same files</dt><dd><p>When another workbench’s open pull request changes the same files as your task, the task’s Review tab says so under the changed files:</p><blockquote><code>office-mac’s open pull request #12 also changes calc.py, so the two may conflict when both are merged.</code></blockquote></dd></div>
<div><dt>The same issue</dt><dd><p>Turn on issue claims for a repository (<code>"claimIssues": true</code>, off by default). A run from an issue that opens pull requests claims it as it starts; the remote takes only the first claim, and the later run stops:</p><blockquote><code>studio-mac started on issue #42 at 14:14:07 UTC on 2026-11-25, before this workbench did (14:15:02 UTC on 2026-11-25), so this run stopped: when two workbenches start on one issue, the earliest claim goes ahead.</code></blockquote><p>Before you start, Botbench also warns when another workbench already has a pull request open for the issue you attached.</p></dd></div>
<div><dt>Changes that must fit</dt><dd><p>On a task that is ready for review, choose Check together with a teammate’s open pull request. Botbench merges the two in a temporary copy, runs the repository’s own checks on the merge, pushes nothing, and shows the result as including another workbench’s code:</p><blockquote><code>Passed together: Merged cleanly, and every check passed on the merge.</code></blockquote><p>A pass proves only what your checks cover, and counts only while both branches stay at the commits it ran on.</p></dd></div>
</dl>
${facts([
  ['Branches never clash', 'Each workbench puts its name in its branches: <code>botbench/&lt;workbench&gt;/run-N/task-M</code>.'],
  ['You see each other’s work', 'The Work screen shows, read only, the other workbenches’ open pull requests and pushed branches on the same remote.'],
  ['Nothing else is written', 'Apart from a claim, Botbench writes nothing to GitHub for this, and puts nothing another workbench wrote into a prompt to your agents.'],
])}
</div>
</div></section>

<section id="paired" aria-labelledby="paired-title"><div class="wrap split even">
${clip('paired-question.mp4', 'paired-question-poster.jpg', 1212, 1298, 'A 21-second recording of two paired workbenches exchanging a question and an answer', 'office-mac on the left, studio-mac on the right, already paired: office-mac’s question, studio-mac’s answer, and the conversation it leaves. Two installations on one Mac, recorded at real speed. 21 seconds, no sound.', 'Your browser cannot play this recording. The text beside it says what it shows.')}
<div class="prose">
<p>${tag('early')}</p>
<h2 id="paired-title">Ask the other workbench, once paired.</h2>
<p>Either of you, or your agent with your Send, can ask the paired workbench a question about the repository you share. The other owner answers it, gives it to their Claude Code, or dismisses it. Every message that leaves is one its owner approved.</p>
<p>Pairing is off until you add a listener to Botbench’s settings file. Then one owner makes an invite, the other pastes it, you compare fingerprints, and both confirm. The two workbenches talk directly: no relay and no Botbench service. A message that arrives is a card marked Outside text: not a command, it never runs anything, and it carries no file.</p>
<p><strong>Its limits today.</strong> One pairing per installation, on one repository. Questions and answers only. Tested with two installations on one Mac over the loopback address, not across two Macs.</p>
${more('Pair two workbenches', src('docs/pairing.md'), icon.out)}
</div>
</div></section>

<section aria-labelledby="planned-title"><div class="wrap">
${head('Planned, not built.', 'The coordination layer is meant to connect separately owned workbenches, so that your agents and a colleague’s coordinate who does what and finish work together, with the people steering instead of relaying every message. None of the rows below is in the code. A message from another workbench will never be permission to run anything.').replace('<h2>', '<h2 id="planned-title">')}
<div class="table-scroll"><table class="stack">
<thead><tr><th scope="col">Planned</th><th scope="col">What it adds</th><th scope="col">Issue</th></tr></thead>
<tbody>
<tr><th scope="row">More between paired workbenches</th><td data-label="What it adds">Six more kinds of message: interface proposals, counters, accepts, blockers, review requests and verdicts; pairing across two Macs on a private network; more than one pairing.</td><td data-label="Issue"><a href="${issue(154)}">#154</a></td></tr>
<tr><th scope="row">Work that depends on a teammate’s</th><td data-label="What it adds">Including two changes to different files that must meet one shared contract.</td><td data-label="Issue"><a href="${issue(172)}">#172</a></td></tr>
</tbody></table></div>
<p class="source-note">How much of a conversation between workbenches a person must approve is an open question, set out in <a href="${src('docs/product/peers-autonomy-tradeoff.md')}">the autonomy trade-off</a>. Coding is where this starts; nothing beyond coding is built.</p>
</div></section>`,
});

/* ---------- Evidence: what a result is made of, and what was not tested; primary action Build from source ---------- */
page({
  file: 'proof.html',
  title: 'Evidence · Botbench',
  description: 'What Botbench shows you at the end of a task: a branch, its diff, the output of your own checks, a review labelled as a model’s opinion. What each can tell you, the acceptance test, and what has not been tested.',
  end: true,
  body: `${pageHero('Proof, not promises.', 'Every task ends in things you can inspect: a branch, its diff, the output of your own checks, and the transcript of what the agent did and what you answered. This page says what each of them can tell you, and what has not been tested.')}

<section aria-labelledby="kinds-title"><div class="wrap split media-first">
${shot('review-evidence-crop.png', 1552, 700, 'A task’s evidence: 1 of 1 check passed, python3 -B -m unittest -q Passed on commit e119be7; then Codex’s review, a model’s opinion, not a check: Codex found nothing to fix, and the two things it says it checked', `Cut from a task ready for review; open it for the whole screen. ${SHOTS_NOTE}`, '', 'ready-for-review-proof.png')}
<div class="prose">
<h2 id="kinds-title">A check runs your commands. A review is a model’s opinion.</h2>
<p><strong>Checks</strong> are your repository’s own commands, run on the agent’s work in a sandbox. Botbench keeps their output. A passing check proves only what the check covers, and the agent may have changed the code the checks run, so read the output, not only the result.</p>
<p><strong>A review</strong> is by another vendor’s agent: Codex, Grok or Antigravity. It is asked to say what it checked, and the task shows when it did not. Botbench always shows it as a model’s opinion, never as a check.</p>
</div>
</div></section>

<section id="accepts" aria-labelledby="accepts-title"><div class="wrap split">
<div>${head('When a result is accepted without you.', 'Only in a fully autonomous run, and only when all four hold. Otherwise the run waits for you and says why.').replace('<h2>', '<h2 id="accepts-title">')}</div>
<ol class="steps conditions">
<li><div><p>At least one check ran, and every check passed.</p></div></li>
<li><div><p>The reviewer, if there is one, said it looks right and named what it checked.</p></div></li>
<li><div><p>Nothing was refused that is on the always-ask list or would have reached outside the task’s copy.</p></div></li>
<li><div><p>Every changed file was expected from the plan, and none is under a protected path.</p></div></li>
</ol>
</div></section>

<section id="together" aria-labelledby="together-title"><div class="wrap split">
<div class="prose">
<h2 id="together-title">Learn that two changes do not fit before either is merged.</h2>
<p>On a task that is ready for review, you ask for it. Botbench merges your task with another workbench’s open pull request in a temporary copy, runs the repository’s own setup and checks on the merge, and shows the result, labelled as including another workbench’s code: <code>Passed together:</code>, <code>Failed together:</code> or <code>Conflict:</code>.</p>
<p>It pushes nothing and removes the copy. The result counts only while both branches are still at the commits it ran on.</p>
<p>Its behaviour is tested in <a href="${src('test/engine/check-together.test.ts')}"><code>test/engine/check-together.test.ts</code></a>, and the overlap warning’s wording in <a href="${src('test/peers-words.test.ts')}"><code>test/peers-words.test.ts</code></a>. Neither has been recorded from two real installations yet, so the picture is an illustration.</p>
${more('Where it is in the code', src('src/engine/combined.ts'), icon.out)}
</div>
<figure class="frame">
<a class="zoom" href="assets/media/scene-coordination-final.png" aria-label="Open the full-size illustration"><img src="assets/media/scene-coordination-final.png" width="2400" height="1312" alt="${SCENE_FINAL_ALT}" loading="lazy" decoding="async"></a>
<figcaption><strong>Illustration, not a screen.</strong> The last frame of the coordination scene: Botbench’s lines in its own words, with example names. <a href="coordination.html#before-the-second-pull-request">See it play</a></figcaption>
</figure>
</div></section>

<section aria-labelledby="test-title"><div class="wrap split">
<div>${head('One acceptance test: two workbenches, one issue.').replace('<h2>', '<h2 id="test-title">')}</div>
<div class="prose">
<p>Two Botbench processes, each its own workbench, share one remote. On the first, one issue becomes a fully autonomous run: its first check fails, the builder fixes it, the reviewer raises a concern, the builder fixes that too, and the task is accepted and opened as a pull request with no person deciding. The second workbench starts on the same issue, sees the first one’s claim, and withdraws.</p>
<p>It drives the real Claude Code in a real browser; the answers of <code>gh</code> and of the reviewer are replayed from output captured once from the real ones. It does not run in GitHub’s CI. Run it on your Mac, from the repository’s folder:</p>
<div class="code"><div class="code-head"><span>Terminal</span><button class="copy" type="button" data-copy="cmd-northstar">Copy</button></div><pre tabindex="0" aria-label="Command to copy" id="cmd-northstar">npx playwright test --config e2e/playwright.config.ts e2e/northstar.e2e.ts</pre></div>
${more('Read the acceptance test', src('e2e/northstar.e2e.ts'), icon.out)}
<h3 id="used-title">Is anyone using it?</h3>
<p>Its author, on its own repository. Botbench is built with Botbench where it can be, under the same rules and tests as any other change. <a href="${REPO}/pull/113">Pull request #113</a> is one Botbench pushed and opened: its description is the task’s evidence, from what was asked to the review.</p>
</div>
</div></section>

<section aria-labelledby="untested-title"><div class="wrap split">
<div>${head('Not tested yet.').replace('<h2>', '<h2 id="untested-title">')}</div>
${facts([
  ['Two Macs', 'Pairing and questions and answers were tested with two installations on one Mac, over the loopback address, not across two Macs.'],
  ['A real iPhone', 'Adding Botbench to the Home Screen and its notifications are in the code, not confirmed on a real iPhone.'],
  ['Your phone, remotely', 'Using Botbench from a phone over a private network was not part of the tested quickstart.'],
  ['Two real installations', 'No recording yet shows the overlap warning or checking together between two real installations.'],
  ['First-run time', 'About ten minutes is the author’s figure, not a measurement.'],
])}
</div></section>`,
});

/* ---------- What works today: every capability with its state; action Find the code behind a claim ---------- */
const SEE = {
  demo: ['index.html#demo', 'Watch the demo'],
  proof: ['proof.html', 'See the evidence'],
  check: ['workbench.html#control', 'See Check a command'],
  phone: ['index.html#panel-hand-over', 'Watch it at phone size'],
  paired: ['coordination.html#paired', 'Watch the recording'],
  scene: ['coordination.html#before-the-second-pull-request', 'See the illustration'],
};
const CAPS = [
  ['available', 'Agents', 'Claude Code plans and builds', 'Required. One task at a time, each in its own copy and branch, under your own sign-in.', 'src/drivers/claude-code.ts', 'demo'],
  ['available', 'Agents', 'Codex builds', 'Optional. Chosen per task or run once Botbench’s check finds that your Codex can build. It works in its own sandbox, in the task’s copy, with no network.', 'src/drivers/codex.ts'],
  ['available', 'Agents', 'Review by another vendor’s agent', 'Codex, Grok or Antigravity reads the change and is asked to say what it checked. With concerns, the builder makes rounds of fixes.', 'src/engine/review.ts', 'proof'],
  ['available', 'Agents', 'Chat with any agent, or several at once', 'Ask Claude Code, Codex, Grok or Antigravity outside a repository, and compare their answers.', 'web/src/screens2/chat'],
  ['available', 'Agents', 'Move a task to another agent', 'From Claude Code to Codex or back while it is being built. The work so far is committed, and the other agent carries on in the same copy and branch.', 'src/engine/handoff.ts'],
  ['available', 'Agents', 'Wait out a usage limit, or switch', 'A task waits and starts again at the reset time, or moves to the next agent on your list.', 'src/engine/usage-limit.ts'],
  ['available', 'Control', 'Approval cards', 'An action that reaches outside the task’s copy waits for your answer, on the Mac or your phone. A short list of dangerous commands always asks.', 'src/approvals/', 'phone'],
  ['available', 'Control', 'Three modes per run', 'Manual, semi-autonomous and fully autonomous. The safety rules are the same in every mode.', 'src/engine/modes.ts', 'check'],
  ['available', 'Control', 'Confined commands', 'Commands run in the macOS sandbox, kept away from your sign-ins and the network. Not a virtual machine or a container.', 'src/confinement.ts'],
  ['available', 'Control', 'An agent can ask you a question', 'A card with lettered choices. Your answer goes back as text and allows nothing to run.', 'src/approvals/question.ts'],
  ['available', 'Work', 'Checks and setup per repository', 'Your own commands, run after the work is committed, with their output kept.', 'src/engine/stations.ts', 'proof'],
  ['available', 'Work', 'A pull request for an accepted task', 'Opened with your own git and gh, only when you chose it for the run. Never the default branch, never by force, never merged.', 'src/engine/delivery.ts'],
  ['available', 'Work', 'A run from a GitHub issue', 'Read with your own gh and treated as outside text: it always waits for plan approval and is never fully autonomous.', 'src/engine/intake.ts'],
  ['available', 'Work', 'Watch a repository for labelled issues', 'Each is listed as a proposal with Start and Dismiss. Nothing starts by itself.', 'src/engine/watch.ts'],
  ['available', 'Team', 'See other workbenches’ work', 'A read-only view of their open pull requests and pushed branches on the same remote, with a warning when one covers your issue or your files.', 'src/engine/peers.ts', 'scene'],
  ['available', 'Team', 'Claim an issue', 'Off by default. The remote takes only the first claim; the later run stops and opens no pull request.', 'src/engine/claims.ts', 'scene'],
  ['available', 'Team', 'Check together', 'Merge your ready task with a teammate’s open pull request in a temporary copy and run the repository’s checks on the merge.', 'src/engine/combined.ts', 'scene'],
  ['early', 'Team', 'Pair with one other workbench', 'An invite that works once, fingerprints you both compare. One pairing per installation. Tested on one Mac over loopback, not across two Macs.', 'docs/pairing.md'],
  ['early', 'Team', 'Questions and answers between paired workbenches', 'You approve every message that leaves and decide about every message that arrives. A thread stops at 3 round trips.', 'src/peers/conversation.ts', 'paired'],
  ['early', 'Control', 'Run a repository’s commands in a container', 'Set per repository: one Docker container per task, from an image already on your Mac, holding only the task’s copy and no network. Claude Code itself stays on your Mac. It cannot be combined with allowed hosts, and a task Codex builds is refused there.', 'docs/adr/0009-container-execution.md'],
  ['early', 'Work', 'Home Screen app and notifications on a phone', 'In the code, not confirmed on a real iPhone.', 'src/push.ts'],
  ['planned', 'Team', 'More kinds of message between workbenches', 'Interface proposals, counters, accepts, blockers, review requests and verdicts; pairing across two Macs; more than one pairing.', 154],
  ['planned', 'Team', 'Work that depends on a teammate’s work', 'Including two changes to different files that must meet one shared contract.', 172],
  ['planned', 'Work', 'A shorter first run', 'Today it takes about ten minutes from cloning to a first branch.', 174],
  ['planned', 'Team', 'Beyond coding', 'Coding is where Botbench starts. Nothing beyond it is built.', 'docs/product/positioning-concept.md'],
];
const STATE_WORD = { available: 'Available', early: 'Early', planned: 'Planned' };

page({
  file: 'explore.html',
  title: 'What works today · Botbench',
  description: 'Every main Botbench capability with its state, available, early or planned, and where it is in the code, with a link to the screen or recording that shows it.',
  body: `${pageHero('What works today, and what does not yet.', 'Each line has a state and a place in the code or an issue. Available works in the current code. Early works in a first, limited form, or is in the code and not yet confirmed on a real device. Planned is not built.')}

<section class="tight-top"><div class="wrap">
<div class="filterbar">
<div class="chips" role="group" aria-label="Show by state">
<button class="chip" type="button" data-cap-filter="all" aria-pressed="true">All</button>
<button class="chip" type="button" data-cap-filter="available" aria-pressed="false">Available</button>
<button class="chip" type="button" data-cap-filter="early" aria-pressed="false">Early</button>
<button class="chip" type="button" data-cap-filter="planned" aria-pressed="false">Planned</button>
</div>
<label class="search-label"><span class="visually-hidden">Search what Botbench does</span><input class="search" type="search" data-cap-search placeholder="Search, for example: review"></label>
</div>
<p class="count" data-cap-count role="status" aria-live="polite"></p>
<ul class="caps">
${CAPS.map(([state, group, name, text, where, see]) => `<li class="cap" data-cap data-state="${state}"><div class="cap-body"><h2>${name}</h2><p>${text}</p><p class="cap-links">${typeof where === 'number' ? `<a href="${issue(where)}">Issue #${where}</a>` : `<a class="path" href="${src(where)}">${where}</a>`}${see ? `<a href="${SEE[see][0]}">${SEE[see][1]}</a>` : ''}</p></div><p class="meta"><span class="state state-${state}">${STATE_WORD[state]}</span> <span>${group}</span></p></li>`).join('\n')}
</ul>
<p class="source-note">Taken from the README’s <a href="${REPO}#what-works-today">What works today</a> and <a href="${REPO}#where-it-is-going">Where it is going</a>. The code is the authority; where this page and the code differ, the code is right.</p>
</div></section>`,
});

/* ---------- Get started: first success; action Run the steps ---------- */
const code = (id, label, text, wrap = false) => `<div class="code"><div class="code-head"><span>${label}</span><button class="copy" type="button" data-copy="${id}">Copy</button></div><pre tabindex="0" aria-label="${label} text to copy" id="${id}"${wrap ? ' class="wrap-lines"' : ''}>${text}</pre></div>`;

page({
  file: 'get-started.html',
  title: 'Build from source · Botbench',
  description: 'Build Botbench from source on a Mac and make a first branch with Claude Code in a practice repository. About ten minutes, ending in a branch you can see with git.',
  body: `${pageHero('Build from source, on a Mac.', 'About ten minutes. It ends with a branch made by Claude Code in a practice repository, which you can see with <code>git branch</code>, and costs one short Claude Code reply on your subscription. There is no installer and no hosted service.')}

<section class="tight-top" aria-labelledby="before-title"><div class="wrap split even">
<div>
<h2 id="before-title" class="small-head">You need</h2>
${facts([
  ['macOS', 'Agents are started only on macOS, because the confinement relies on its sandbox.'],
  ['Node and git', 'Node 24 or later, and git set up so you can commit.'],
  ['Claude Code', 'Required: 2.1.322 or later, installed and signed in. It plans every run. Check with <code>claude --version</code> and <code>claude auth status</code>.'],
  ['Codex', 'Optional: 0.171.0 or later, only if you want it to review or build.'],
])}
</div>
<div>
<h2 class="small-head">Do not use it if</h2>
<ul class="plain">
<li>You are on Windows or Linux.</li>
<li>You want a hosted service or a shared team server.</li>
<li>You need a hard security boundary for code you do not trust.</li>
<li>You need it stable. It changes often, and nothing is promised to stay the same.</li>
</ul>
</div>
</div></section>

<section aria-labelledby="steps-title"><div class="wrap split reorder">
<div>${head('Clone, build, start, hand over one task, see the branch.').replace('<h2>', '<h2 id="steps-title">')}
${clip('first-task-phone.mp4', 'first-task-phone-poster.jpg', 780, 1688, 'A 24-second recording of starting one task and accepting it, on a phone-size screen', 'One task from start to Accept, recorded at phone size from a real Botbench at its real speed. Claude Code’s reply is replayed from a recorded session, and the task is a bug fix, not the hello.txt of step 5. 24 seconds, no sound.', 'Your browser cannot play this recording. The steps beside it say what it shows.', 'frame-phone')}</div>
<div>
<ol class="steps">
<li><div><h3>Clone it and build its web interface</h3>
${code('cmd-build', 'Terminal', `git clone https://github.com/botbenchhq/botbench.git
cd botbench
npm ci
npm ci --prefix web
npm run build --prefix web`)}</div></li>
<li><div><h3>Start it</h3><p>Leave this terminal open; Ctrl+C stops Botbench. It prints its address, <code>http://127.0.0.1:4780</code>, and on the first start a login token.</p>
${code('cmd-start', 'Terminal', 'npm start')}</div></li>
<li><div><h3>Sign in</h3><p>Open <code>http://127.0.0.1:4780</code> in a browser on the Mac, paste the token and choose Sign in. You arrive on Home. Later, read the token with <code>cat ~/.botbench/login-token</code>. If Chat says “Connect an agent in Settings → Agents.”, run <code>claude auth login</code> in a terminal.</p></div></li>
<li><div><h3>Make a practice repository</h3><p>In a second terminal. Copy the path the last line prints.</p>
${code('cmd-try', 'Terminal', `mkdir ~/botbench-try &amp;&amp; cd ~/botbench-try
git init
echo "# Try" &gt; README.md
git add README.md &amp;&amp; git commit -m "Start"
pwd`)}</div></li>
<li><div><h3>Start a task</h3><p>Open Chat, press Add context under the message box, choose Repository, then Another folder…, and paste the path. When it reads “Usable git repository.”, close the sheet. Write the task and choose Send:</p>
${code('cmd-task', 'Message', 'Add a file hello.txt that says hello, then run ls to show that it is there.', true)}</div></li>
<li><div><h3>Review and accept</h3><p>Within a minute the transcript shows Claude Code writing the file and running <code>ls</code>. The task then reads Ready for review, with <code>hello.txt</code> under “1 file changed” and its branch, such as <code>botbench/your-mac/run-1/task-1</code>. This repository has no checks, so the button reads Accept without verification; choose it. Botbench keeps the branch and removes the task’s copy.</p></div></li>
<li><div><h3>See the branch</h3><p>In the practice repository, with the name <code>git branch</code> lists:</p>
${code('cmd-branch', 'Terminal', `git branch
git log --stat -1 botbench/your-mac/run-1/task-1`)}
<p class="done">The branch holds one commit by Botbench that adds <code>hello.txt</code>. Your own branch is unchanged, and <code>git status</code> shows nothing to commit. That is your first branch.</p>
<p>To clean up: Ctrl+C in the first terminal, then <code>rm -rf ~/botbench-try</code>. Botbench keeps its database and login token in <code>~/.botbench</code>; delete that folder only to start again from nothing.</p></div></li>
</ol>
<p class="source-note">These steps follow the README’s quickstart, which is the authority and has every detail, including how to use Botbench from your phone over a private network.</p>
<div class="btn-row next-steps">${btn('Set up checks for a real repository', `${REPO}#configure-a-repository`, 'primary', icon.out)}${btn('The full quickstart', `${REPO}#quickstart`, 'quiet', icon.out)}</div>
</div>
</div></section>`,
});

/* ---------- Docs: route to the right document; action Pick a document ---------- */
const DOCS = [
  ['Start', [
    ['README', 'What Botbench is, the quickstart, what works today and where it is going.', `${REPO}#readme`],
    ['Configure a repository', 'Setup commands, checks, commands allowed in advance, allowed hosts, where commands run.', `${REPO}#configure-a-repository`],
    ['Use it from your phone', 'Over a private network that gives the Mac an HTTPS name. Never the public internet.', `${REPO}#use-it-from-your-phone`],
    ['Pair two workbenches', 'The invite, the fingerprints, and what a paired workbench can and cannot send.', src('docs/pairing.md')],
  ]],
  ['Trust', [
    ['Threat model', 'Exactly what is protected and what is not.', src('docs/security/threat-model.md')],
    ['What leaves your Mac', 'The full list, and when each thing is sent.', `${REPO}#what-leaves-your-mac`],
    ['Decision records', 'Why it drives the vendors’ own programs, and how secrets are kept from agents.', `${REPO}/tree/main/docs/adr`],
    ['Report a security problem', 'Not in an issue. How to report it privately.', src('SECURITY.md')],
  ]],
  ['Direction', [
    ['Positioning', 'The workbench and the coordination layer, and who each is for.', src('docs/product/positioning-concept.md')],
    ['How it compares', 'Other projects, from a read of their source.', src('docs/competitive/README.md')],
    ['The autonomy trade-off', 'How much of a conversation between workbenches a person must approve. An open question.', src('docs/product/peers-autonomy-tradeoff.md')],
  ]],
  ['Contribute', [
    ['Contributing', 'Run the tests, send a fix, add another agent.', src('CONTRIBUTING.md')],
    ['Issues', 'Report a bug with what you did, what you expected and what Botbench printed.', `${REPO}/issues`],
    ['Design system', 'The shared tokens, components and rules the screens are built from.', 'https://github.com/botbenchhq/design-system'],
  ]],
];

page({
  file: 'docs.html',
  title: 'Documentation · Botbench',
  description: 'Where Botbench’s documentation lives: the README, the threat model, pairing, decision records and how to contribute.',
  body: `${pageHero('Find the document for what you want to do.', 'The documentation is kept in the repository on GitHub, beside the code it describes, so it changes in the same pull request. Each link below opens it there.')}
<section class="tight-top"><div class="wrap">
${DOCS.map(([group, rows]) => `<div class="doc-group split"><h2 class="group">${group}</h2>
<ul class="links">
${rows.map(([name, text, href]) => `<li><a href="${href}"><strong>${name}</strong><span>${text}</span>${icon.out}</a></li>`).join('\n')}
</ul>
</div>`).join('\n')}
<p class="source-note">New here? <a href="get-started.html">Build from source</a> first: it takes about ten minutes and ends in a branch.</p>
</div></section>`,
});

/* ---------- Not found: recover; action Go to the overview ---------- */
page({
  file: '404.html',
  title: 'Page not found · Botbench',
  description: 'This page does not exist.',
  base: `<meta name="robots" content="noindex">\n`,
  rootLinks: true,
  body: `<section class="hero page-hero not-found"><div class="wrap"><h1>This page does not exist.</h1><p class="lead">The address may have changed. Every page is in the menu above.</p><div class="btn-row">${btn('Go to the home page', 'index.html')}${btn('What works today', 'explore.html', 'quiet')}</div></div></section>`,
});

console.log('Wrote the pages.');
