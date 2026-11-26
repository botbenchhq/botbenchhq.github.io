// Writes the site's HTML pages. No dependencies: `node tools/build.mjs`.
// Every capability claim here is taken from the Botbench README at the commit
// named in PROVENANCE.md. Change the README first, then this file.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://botbenchhq.github.io/';
const REPO = 'https://github.com/botbenchhq/botbench';
const src = (path) => `${REPO}/blob/main/${path}`;
const issue = (n) => `${REPO}/issues/${n}`;

const icon = {
  arrow: '',
  out: '',
  sun: '<svg class="sun" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="3.4"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/></svg>',
  moon: '<svg class="moon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 11.8A7 7 0 0 1 8.2 3.5a7 7 0 1 0 8.3 8.3z"/></svg>',
  menu: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3.5 6h13M3.5 10h13M3.5 14h13"/></svg>',
  mark: '<svg viewBox="3 3 18 18" aria-hidden="true"><path class="mark-a" d="M13 4H6A2 2 0 0 0 4 6V17A2 2 0 0 0 6 19H8V9H13Z"/><path class="mark-b" d="M11 20H18A2 2 0 0 0 20 18V7A2 2 0 0 0 18 5H16V15H11Z"/></svg>',
};

const NAV = [
  ['workbench.html', 'Workbench'],
  ['coordination.html', 'Coordination'],
  ['proof.html', 'Evidence'],
  ['explore.html', 'Explore'],
  ['docs.html', 'Docs'],
];

const tag = (state) => `<span class="tag tag-${state}">${{ available: 'Available', early: 'Early', planned: 'Planned' }[state]}</span>`;
const btn = (label, href, kind = 'primary', ic = icon.arrow) => `<a class="btn btn-${kind}" href="${href}">${label} ${ic}</a>`;
const more = (label, href, ic = icon.arrow) => `<a class="more" href="${href}">${label} ${ic}</a>`;
const shot = (file, w, h, alt, caption, cls = '') =>
  `<figure class="frame ${cls}"><a class="zoom" href="assets/media/${file}" title="Open the full-size image"><img src="assets/media/${file}" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async"></a>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
const clip = (file, poster, w, h, label, caption, fallback, cls = '') =>
  `<figure class="frame ${cls}"><video controls playsinline preload="none" width="${w}" height="${h}" poster="assets/media/${poster}" aria-label="${label}"><source src="assets/media/${file}" type="video/mp4">${fallback}</video><figcaption>${caption}</figcaption></figure>`;
const head = (eyebrow, title, text) => `<div class="section-head"><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${text ? `<p>${text}</p>` : ''}</div>`;
const pageHero = (eyebrow, title, lead) => `<section class="hero page-hero"><div class="wrap"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="lead">${lead}</p></div></section>`;

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

const SHOTS_NOTE = 'Real screens from a Botbench installation named studio-mac, working on a small billing repository, and a second one on the same Mac, office-mac, paired with it. The agents’ work is replayed from recorded Claude Code and Codex sessions; the check really ran. Nothing on them was edited.';

const closing = `<section class="closing"><div class="wrap closing-grid">
<div><p class="eyebrow">Start with one task</p><h2>Your next branch<br>starts here.</h2></div>
<div class="closing-action"><p>Bring your Mac and the agents you already use. Build Botbench from source, then make your first branch in a practice repository.</p>
<div class="btn-row">${btn('Build from source', 'get-started.html')}${btn('View on GitHub', REPO, 'quiet')}</div>
<p class="setup-note">macOS · Node 24+ · Claude Code or Codex<br>Early software. No installer or hosted service.</p></div>
</div></section>`;

function page({ file, title, description, body, base = '', rootLinks = false, headExtra = '' }) {
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
<link rel="stylesheet" href="assets/site.css">
<script>try{var t=localStorage.getItem('botbench-site-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}</script>
<script defer src="assets/site.js"></script>
${headExtra}<noscript><style>.tabpanel[hidden]{display:block!important;margin-top:16px}.tablist,.menu-btn,.theme-btn{display:none!important}.nav-links{display:flex!important;position:static!important;flex-wrap:wrap}</style></noscript>
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
${file === 'get-started.html' ? '' : closing}
</main>
<footer class="footer"><div class="wrap footer-grid">
<div><a class="brand" href="index.html" aria-label="Botbench, home">${icon.mark}<span>Botbench</span></a>
<p>One workbench for your agents. One coordination layer for your team.</p>
<p>Built by <a class="maker-link" href="https://github.com/jon-lange">Jon Lange</a>. Early, and macOS only.<br>Apache License 2.0. No cookies or visit tracking.</p></div>
<div class="footer-cols">
<div><strong>Product</strong><a href="workbench.html">Workbench</a><a href="coordination.html">Coordination</a><a href="proof.html">Verification</a><a href="explore.html">Explore</a></div>
<div><strong>Use it</strong><a href="get-started.html">Build from source</a><a href="docs.html">Docs</a><a href="${REPO}">GitHub</a></div>
<div><strong>Project</strong><a href="${REPO}/issues">Issues</a><a href="${src('SECURITY.md')}">Security</a><a href="${src('LICENSE')}">Licence</a><a href="https://github.com/botbenchhq/design-system">Design system</a></div>
</div>
</div></footer>
</body>
</html>
`;
  writeFileSync(join(ROOT, file), rootLinks ? html.replace(/\s(href|src)="(?!https?:|#|\/)/g, ' $1="/') : html);
}

/* ---------- Overview ---------- */
const stages = [
  {
    id: 'delegate', label: 'Delegate', hint: 'Choose the work', state: 'available',
    title: 'A task. Its own branch.',
    text: 'Hand over a task, or let Claude Code plan a run. Choose Claude Code or Codex to build. Each task works in its own copy of the repository, away from your current branch.',
    result: 'A separate place for the agent to work, with the permissions you chose.',
    link: 'Explore the workbench', href: 'workbench.html',
    media: shot('permissions-check.png', 2880, 1800,
      'Botbench Settings, Permissions and autonomy: Check a command shows how git push origin main is handled in each run mode, with Activity below.',
      'The real Permissions and autonomy screen. Check how a command would be handled before an agent runs it.'),
  },
  {
    // Keep the existing panel ID so saved links and keyboard navigation still reach the second stage.
    id: 'hand-over', label: 'Follow the work', hint: 'See what needs you', state: 'available',
    title: 'See what needs you next.',
    text: 'Come back to Home for the work that needs your decision. A task to recover and results to review sit above waiting and completed work.',
    result: 'What needs you on the Mac, and a task ready to review on your phone.',
    link: 'Explore the workbench', href: 'workbench.html',
    media: shot('hero-workbench.png', 3200, 1720,
      'Botbench Home on a desktop: a failed task that can be resumed, two results to review, one task waiting on a usage limit and two completed tasks. On the phone, a task is ready for review.',
      'The current Home screen on studio-mac, with a task ready for review at phone size. Real screens from the billing repository.'),
  },
  {
    id: 'coordinate', label: 'Coordinate', hint: 'Bring in a teammate', state: 'early',
    title: 'Your workbench can ask theirs.',
    text: 'Pair two workbenches to exchange questions and answers. Every message is sent only when its owner approves. A message that arrives never starts work by itself.',
    result: 'Shared context through questions and answers approved by their owners.',
    link: 'See coordination today', href: 'coordination.html',
    media: clip('paired-question.mp4', 'paired-question-poster.jpg', 1212, 1298,
      'A 21-second recording of two paired workbenches exchanging a question and an answer.',
      'Two installations on one Mac, already paired, recorded at real speed. 21 seconds, no sound. Not yet tested across two Macs.',
      'Your browser cannot play this recording. The coordination page describes the pairing and exchange.'),
  },
  {
    id: 'verify', label: 'Verify', hint: 'Inspect the result', state: 'available',
    title: 'Come back to work you can inspect.',
    text: 'Read the branch, the diff and the output of your repository’s checks. Another agent can review the change; its review is a model’s opinion, shown separately from the checks.',
    result: 'A branch with the change and the evidence. Botbench never merges a pull request.',
    link: 'Read what the evidence means', href: 'proof.html',
    media: shot('ready-for-review-proof.png', 2880, 1800,
      'A task ready for review: 1 of 1 check passed, followed by Codex’s review and the things it says it checked, the changed line, and Reject and Accept.',
      'Checks and review are shown separately. The check really ran; the build and the review are replayed from recorded sessions.'),
  },
];

page({
  file: 'index.html',
  title: 'Botbench: put your coding agents to work. Together.',
  description: 'One workbench for your coding agents. One coordination layer for your team. Hand tasks to Claude Code or Codex and come back to branches you can inspect.',
  headExtra: SCENE_ASSETS,
  body: `<section class="hero home-hero"><div class="wrap">
<div class="hero-heading">
<div><p class="eyebrow hero-kicker">Open source <span>macOS only</span> <span>Early</span></p>
<h1>Put your coding agents to work. <span class="peer">Together.</span></h1></div>
<div class="hero-intro"><p class="hero-positioning">One workbench for your agents. <br>One coordination layer for your team.</p>
<p class="lead">Hand tasks to Claude Code or Codex. Keep the work on separate branches. Pick it up on your Mac or phone when you’re ready to review.</p>
<div class="btn-row">${btn('Build from source', 'get-started.html')}${btn('Watch the demo', '#demo', 'quiet')}</div>
<a class="text-link" href="${REPO}">Explore the code on GitHub</a></div>
</div>
<figure class="hero-product">
<a class="zoom hero-shots" href="assets/media/hero-workbench.png" aria-label="Open the full-size image of Botbench on a Mac and phone">
<picture class="hero-desktop"><source media="(max-width: 1023px)" srcset="assets/media/hero-phone-crop.png" width="680" height="1452"><img src="assets/media/hero-desktop-crop.png" width="2380" height="1500" alt="Real Botbench screens: on the Mac, Home with three things that need you; on the phone, a task ready for review." loading="eager" fetchpriority="high" decoding="async"></picture>
<img class="hero-phone" src="assets/media/hero-phone-crop.png" width="680" height="1452" alt="" loading="eager" decoding="async">
</a>
<figcaption><span><strong>Your Mac does the work.</strong> Your phone can bring you back to it.</span><a href="https://github.com/botbenchhq/botbenchhq.github.io/blob/main/PROVENANCE.md">Real screens. View their source.</a></figcaption>
</figure>
<div class="agent-rail"><p>The agents you already use</p><div><strong>Claude Code</strong><span>Plan · Build</span></div><div><strong>Codex</strong><span>Build · Review</span></div><a href="workbench.html">See all agent capabilities</a></div>
</div></section>

<section class="workflow-section" id="workflow"><div class="wrap">
<div class="section-title-row"><div><p class="eyebrow">Inside the workbench</p><h2>Walk away.<br>Come back to the branch.</h2></div><p>Choose a part of the workflow. <br>See what happens, and what you get back.</p></div>
<div class="workflow" data-workflow>
<div class="tablist workflow-tabs" role="tablist" aria-label="Explore the Botbench workflow">
${stages.map((stage, i) => `<button class="tab workflow-tab" type="button" role="tab" id="tab-${stage.id}" aria-controls="panel-${stage.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span>${stage.label}</span><small>${stage.hint}</small></button>`).join('\n')}
</div>
${stages.map((stage, i) => `<div class="tabpanel workflow-panel" role="tabpanel" id="panel-${stage.id}" aria-labelledby="tab-${stage.id}" tabindex="0"${i === 0 ? '' : ' hidden'}><div class="workflow-copy">${tag(stage.state)}<h3>${stage.title}</h3><p>${stage.text}</p><div class="workflow-result"><span class="eyebrow">What comes back</span><p>${stage.result}</p></div>${more(stage.link, stage.href)}</div><div class="workflow-media">${stage.media}</div></div>`).join('\n')}
</div>
<p class="source-note">Screens and recordings from the real product. The example project is a small billing repository; the agents’ work on it is replayed from recorded sessions.</p>
</div></section>

<section class="team-section"><div class="wrap">
<div class="team-intro"><div><p class="eyebrow">The coordination layer ${tag('early')}</p><h2>One repository.<br>Two workbenches.</h2></div><p class="lead">Your agents. Their agents. A shared view of the work, with each developer in control of their own Mac.</p></div>
${scene('before-the-second-pull-request')}
<div class="team-layout team-layout-after-scene">
<div class="team-points"><article><h3>See the work in motion.</h3><p>Shared GitHub visibility shows the other workbenches’ open pull requests and pushed branches.</p></article><article><h3>Spot the overlap.</h3><p>See when a teammate already covers an issue or changes the same files. Issue claims can be turned on for a repository.</p></article><article><h3>Keep the owners in the loop.</h3><p>Paired workbenches exchange questions and answers only after their owners approve sending them.</p></article>${more('Explore the coordination layer', 'coordination.html')}</div>
</div>
<p class="team-boundary">Pairing has been demonstrated with two installations on one Mac. Testing across two Macs and broader autonomous coordination across owners remain ahead.</p>
</div></section>

<section id="demo" class="demo-section"><div class="wrap">
<div class="section-title-row"><div><p class="eyebrow">Watch the actual product</p><h2>From task to decision.</h2></div><p>A 25-second recording. <br>One task, from its plan to your decision.</p></div>
${clip('botbench-demo.mp4', 'botbench-demo-thumbnail.png', 1440, 900,
  'A 25-second recording of a Botbench task: its plan is approved, Claude Code builds, the check and Codex’s review come back, and the task is accepted.',
  'Recorded at 1440 × 900, at its real speed. The agents’ parts are replayed from recorded sessions; the check really ran. No sound.',
  `Your browser cannot play this recording. <a href="${src('docs/media/botbench-demo.mp4')}">Watch it on GitHub</a>.`, 'demo-frame')}
<div class="demo-footnote"><p><strong>A branch, a diff, the evidence.</strong><br>The result is there to inspect when you return.</p><a class="text-link" href="proof.html">What checks and reviews can tell you</a></div>
</div></section>`,
});

/* ---------- Workbench ---------- */
page({
  file: 'workbench.html',
  title: 'The workbench · Botbench',
  description: 'How a piece of work goes in Botbench: a separate copy and branch for each task, three modes, approvals for what reaches outside, and what each agent can do.',
  body: `${pageHero('Your workbench', 'Walk away. Come back to the branch.', 'One coding agent in one terminal is easy to follow. Several are not. Botbench gives each task its own copy and branch, asks you only about what reaches outside it, and keeps a record of everything that ran.')}

<section><div class="wrap split">
<div>${head('How a piece of work goes', 'Five steps, ending in a decision.')}</div>
<ol class="steps">
<li><div><h3>You start a task or a run</h3><p>A task is a prompt and a repository. A run is a prompt or a spec file, which Claude Code turns into a plan of tasks. In a manual run, nothing is built before you approve the plan.</p></div></li>
<li><div><h3>Each task gets a separate copy</h3><p>It is built in its own copy of your repository (a git worktree), on its own branch, such as <code>botbench/your-mac/run-1/task-1</code>.</p></div></li>
<li><div><h3>The agent works, and asks only when it matters</h3><p>Reading, searching and editing inside the copy never ask, in any mode. An action that reaches outside the copy waits for your answer: a push, sudo, a file outside the copy. A fully autonomous run refuses these instead of asking.</p></div></li>
<li><div><h3>Botbench commits and checks</h3><p>It runs the checks you set for the repository. If you chose a reviewer, it reads the change; with concerns, the builder makes a round of fixes and the checks and the review run again.</p></div></li>
<li><div><h3>You accept or reject</h3><p>You read the diff, the checks and the transcript. Accept keeps the branch, and opens a pull request if the run says so. Botbench never merges one.</p></div></li>
</ol>
</div></section>

<section><div class="wrap">
${head('Modes', 'Choose how much each run needs you.', 'A mode is about your decisions, not about which tools an agent has. The safety rules are the same in every mode.')}
<div class="table-scroll"><table class="stack">
<thead><tr><th scope="col">Mode</th><th scope="col">The plan</th><th scope="col">Each result</th><th scope="col">An action on the always-ask list</th></tr></thead>
<tbody>
<tr><th scope="row">Manual</th><td data-label="Plan">You approve it</td><td data-label="Result">You decide</td><td data-label="Always-ask">Asks you</td></tr>
<tr><th scope="row">Semi-autonomous</th><td data-label="Plan">Building starts without waiting</td><td data-label="Result">You decide</td><td data-label="Always-ask">Asks you</td></tr>
<tr><th scope="row">Fully autonomous</th><td data-label="Plan">Building starts without waiting</td><td data-label="Result">Accepted without you only when its conditions hold</td><td data-label="Always-ask">Refused, never run</td></tr>
</tbody></table></div>
<p class="source-note">A run started from a GitHub issue always waits for your approval of its plan and is never fully autonomous. The conditions for accepting without you are on <a href="proof.html#accepts">Verification</a>.</p>
</div></section>

<section><div class="wrap split media-first">
${shot('permissions-check.png', 2880, 1800, 'Settings, Permissions and autonomy, Check a command: git push origin main in billing-api asks you in Manual and Semi-autonomous, and is refused in Fully autonomous, each with its rule, git-push; below, Activity', 'Check what a command would get before any agent runs it. Here a push asks you, or is refused in a fully autonomous run.')}
<div class="prose">
<p class="eyebrow">Control</p>
<h2>Know the answer before the agent asks.</h2>
<p class="muted">Permissions shows what you have chosen to always allow, lets you check any command against each mode, and lists every action that ran, newest first. The record is kept on your Mac and is only ever added to.</p>
<p class="muted">Commands you trust for a repository, such as <code>npm test</code>, can be allowed in advance in its settings.</p>
</div>
</div></section>

<section><div class="wrap">
${head('Agents', 'The agents you already use, each for what it can do here.', 'Botbench runs each vendor\'s own, unmodified program under your own sign-in. It never reads or stores your credentials and uses no API keys.')}
<div class="table-scroll"><table class="stack">
<thead><tr><th scope="col">Agent</th><th scope="col">Plans a run</th><th scope="col">Builds</th><th scope="col">Reviews</th><th scope="col">Chats</th></tr></thead>
<tbody>
<tr><th scope="row">Claude Code</th><td class="yes" data-label="Plans">Yes</td><td class="yes" data-label="Builds">Yes</td><td data-label="Reviews">No</td><td class="yes" data-label="Chats">Yes</td></tr>
<tr><th scope="row">Codex</th><td data-label="Plans">No</td><td class="yes" data-label="Builds">Yes, in its own sandbox, once Botbench's check finds that your Codex can build</td><td class="yes" data-label="Reviews">Yes</td><td class="yes" data-label="Chats">Yes</td></tr>
<tr><th scope="row">Grok</th><td data-label="Plans">No</td><td data-label="Builds">No</td><td class="yes" data-label="Reviews">Yes</td><td class="yes" data-label="Chats">Yes</td></tr>
<tr><th scope="row">Antigravity</th><td data-label="Plans">No</td><td data-label="Builds">No</td><td class="yes" data-label="Reviews">Yes</td><td class="yes" data-label="Chats">Yes</td></tr>
</tbody></table></div>
<p class="source-note">The reviewer must be a different model from the builder. Whether your subscription allows running an agent while you are away is the vendor's decision; check its terms before relying on it.</p>
</div></section>

<section><div class="wrap split even">
<div class="prose">
<p class="eyebrow">Is it a sandbox?</p>
<h2>Partly, and not a hard one.</h2>
<p class="muted">The macOS sandbox confines the commands an agent runs: they cannot read your sign-ins, keys or Keychain, reach no network except hosts you allow for that repository, and can write only in the task's copy and a temporary folder.</p>
<p class="muted">It is not a virtual machine or a container. A separate copy separates changes; it is not a security boundary. Claude Code itself runs outside the sandbox with your rights, and your repository's setup and check commands can still read your home folder outside the protected places.</p>
<p>Point Botbench only at repositories you trust.</p>
${more('The exact limits, in the threat model', src('docs/security/threat-model.md'), icon.out)}
</div>
<div class="prose">
<p class="eyebrow">Does my code leave my Mac?</p>
<h2>Yes, as it does when you use the agents directly.</h2>
<p class="muted">Each agent sends your prompts and the code it reads to its provider. Botbench does not change that, and sends little else. Without your choosing it: every 6 hours, one request to GitHub for Botbench's latest release, with nothing about you in it, and your own <code>gh</code> and <code>git</code> reading other workbenches' pull requests and branches. Only if you chose it: a pull request for a run, a notification to your phone, a claim on an issue.</p>
<p class="muted">Plans, transcripts, diffs, check results and approvals stay in a database on your Mac. Botbench listens on <code>127.0.0.1</code> only; do not put it on the public internet.</p>
${more('The full list of what leaves your Mac', `${REPO}#what-leaves-your-mac`, icon.out)}
</div>
</div></section>`,
});

/* ---------- Coordination ---------- */
page({
  file: 'coordination.html',
  title: 'Coordination · Botbench',
  description: 'What two separately owned Botbench workbenches can do together today, what is early, and what is planned.',
  headExtra: SCENE_ASSETS,
  body: `${pageHero('Your team\'s coordination', 'Your agents. Their agents. One coordinated workflow.', 'Add a teammate who hands work to their own agents, and the two of you become the messengers. Botbench does the first steps about that today. The larger part is still to come, and this page says which is which.')}

<section class="scene-section"><div class="wrap">
${head('Before the second pull request', 'Find out before either change is merged.', 'Two developers, each handing work to their own agents in one repository. Here is what each workbench sees when they reach for the same issue, and then the same file.')}
${scene('before-the-second-pull-request')}
</div></section>

<section><div class="wrap">
${head('Today', 'Two workbenches on one repository.', 'Each developer runs their own Botbench on their own Mac, behind its own login token. Botbench has no accounts or shared server. Workbenches see branches and pull requests on a shared GitHub repository; paired workbenches can also exchange questions and answers approved by their owners.')}
<ol class="steps">
<li><div><h3>Branches never clash ${tag('available')}</h3><p>Each workbench puts its name in its branches: <code>botbench/&lt;workbench&gt;/run-N/task-M</code>.</p></div></li>
<li><div><h3>You see each other's work ${tag('available')}</h3><p>The Work screen shows, read only, the other workbenches' open pull requests and pushed branches on the same remote, read with your own <code>gh</code> and <code>git</code>.</p></div></li>
<li><div><h3>You are warned before you overlap ${tag('available')}</h3><p>When another workbench already has a pull request open for the issue you attached, or has started on it. And when another workbench's open pull request changes the same files as your task.</p></div></li>
<li><div><h3>Only one of you takes an issue, if you choose ${tag('available')}</h3><p>A setting you turn on for a repository. A run from an issue that opens pull requests claims it as it starts; the remote takes only the first claim, and the other workbench's run stops and says who started first.</p></div></li>
<li><div><h3>You can check two changes together ${tag('available')}</h3><p>Botbench merges your ready task with a teammate's open pull request in a temporary copy and runs the repository's own checks on the merge, so you learn that two changes do not fit before either is merged. Nothing is pushed.</p></div></li>
<li><div><h3>You can ask each other directly, once paired ${tag('early')}</h3><p>Either of you, or your agent with your Send, can ask the other workbench a question about the repository you share. The other owner answers it, gives it to their Claude Code, or dismisses it.</p></div></li>
</ol>
</div></section>

<section><div class="wrap split even">
${clip('paired-question.mp4', 'paired-question-poster.jpg', 1212, 1298, 'A 21-second recording of two paired workbenches exchanging a question and an answer', 'office-mac on the left, studio-mac on the right, already paired: office-mac\'s question, studio-mac\'s answer, and the conversation it leaves. Two installations on one Mac, recorded at its real speed. 21 seconds, no sound.', 'Your browser cannot play this recording. The text beside it says what it shows.')}
<div class="prose">
<p class="eyebrow">Paired workbenches · ${tag('early')}</p>
<h2>Every message is one its owner approved.</h2>
<p class="muted">Pairing is off until you add a listener to Botbench's settings file. Then one owner makes an invite, the other pastes it, you compare fingerprints, and both confirm. The two workbenches then talk directly: no relay and no Botbench service.</p>
<p class="muted">A message that arrives is a card marked Outside text. It is not a command, it never runs anything, and it carries no file.</p>
<p><strong>Its limits today.</strong> One pairing per installation, on one repository. Questions and answers only. Tested with two installations on one Mac over the loopback address, not across two Macs.</p>
${more('Pair two workbenches', src('docs/pairing.md'), icon.out)}
</div>
</div></section>

<section><div class="wrap">
${head('Where it is going', 'Planned, not in the code.', 'The coordination layer is meant to connect separately owned workbenches, so that your agents and a colleague\'s coordinate who does what, exchange the context each owner chose to share, and finish work together, with the people watching and steering instead of relaying every message. A message from another workbench will never be permission to run anything.')}
<div class="table-scroll"><table class="stack">
<thead><tr><th scope="col">Planned</th><th scope="col">What it adds</th><th scope="col">Issue</th></tr></thead>
<tbody>
<tr><th scope="row">More between paired workbenches</th><td data-label="Adds">Six more kinds of message, such as interface proposals and review requests; pairing across two Macs on a private network; more than one pairing.</td><td data-label="Issue"><a href="${issue(154)}">#154</a></td></tr>
<tr><th scope="row">Work that depends on a teammate's</th><td data-label="Adds">Including two changes to different files that must meet one shared contract.</td><td data-label="Issue"><a href="${issue(172)}">#172</a></td></tr>
<tr><th scope="row">A shorter first run</th><td data-label="Adds">Today it is about ten minutes: clone, build the screens, start, copy a token, make a practice repository.</td><td data-label="Issue"><a href="${issue(174)}">#174</a></td></tr>
</tbody></table></div>
<p class="source-note">How much of a conversation between workbenches a person must approve is an open question, set out in <a href="${src('docs/product/peers-autonomy-tradeoff.md')}">the autonomy trade-off</a>. Coding is where this starts. It is not meant to be where it ends, and nothing beyond coding is built.</p>
</div></section>`,
});

/* ---------- Verification ---------- */
page({
  file: 'proof.html',
  title: 'Verification · Botbench',
  description: 'What Botbench shows you at the end of a task: a branch, its diff, the output of your own checks, a review labelled as a model\'s opinion, and what each of them can and cannot tell you.',
  body: `${pageHero('Verification', 'Proof, not promises.', 'Every task ends in things you can inspect: a branch, its diff, the output of your own checks, and the transcript of what the agent did and what you answered.')}

<section><div class="wrap split media-first">
${shot('ready-for-review-proof.png', 2880, 1800, 'A task\'s evidence: 1 of 1 check passed, python3 -B -m unittest -q Passed; Codex\'s review, a model\'s opinion, not a check: Codex found nothing to fix, and the two things it says it checked', 'A task that is ready for review. The check and the review are separate, and labelled.')}
<div class="prose">
<p class="eyebrow">Two kinds of evidence</p>
<h2>A check runs your commands; a review is a model's opinion.</h2>
<p class="muted"><strong>Checks</strong> are your repository's own commands, run on the agent's work in a sandbox. Botbench keeps their output. A passing check proves only what the check covers, and the agent may have changed the code the checks run, so read the output, not only the result.</p>
<p class="muted"><strong>A review</strong> is by another vendor's agent: Codex, Grok or Antigravity. It is asked to say what it checked, and the task shows when it did not. Botbench always shows it as a model's opinion, never as a check.</p>
</div>
</div></section>

<section id="accepts"><div class="wrap split">
<div>${head('Fully autonomous', 'When a result is accepted without you.')}</div>
<div class="prose">
<p class="muted">A fully autonomous run accepts a task by itself only when all of these hold. Otherwise it waits for you and says why.</p>
<ul>
<li>At least one check ran, and every check passed.</li>
<li>The reviewer, if there is one, said it looks right and named what it checked.</li>
<li>Nothing was refused that is on the always-ask list or would have reached outside the task's copy.</li>
<li>Every changed file was expected from the plan, and none is under a protected path.</li>
</ul>
</div>
</div></section>

<section><div class="wrap split">
<div>${head(`Check together · ${tag('available')}`, 'Learn that two changes do not fit before either is merged.')}</div>
<div class="prose">
<p class="muted">On a task that is ready for review, you ask for it. Botbench merges your task with another workbench's open pull request in a temporary copy, runs the repository's own setup and checks on the merge, and shows the result, labelled as including another workbench's code.</p>
<p class="muted">It pushes nothing and removes the copy. The result counts only while both branches are still at the commits it ran on.</p>
${more('Where it is in the code', src('src/engine/combined.ts'), icon.out)}
</div>
</div></section>

<section><div class="wrap split">
<div>${head('Built with itself', 'The acceptance test runs the whole story.')}</div>
<div class="prose">
<p class="muted">Two Botbench processes, each its own workbench, share one remote. On the first, one issue becomes a fully autonomous run: its first check fails, the builder fixes it, the reviewer raises a concern, the builder fixes that too, and the task is accepted and opened as a pull request with no person deciding. The second workbench starts on the same issue, sees the first one's claim, and withdraws.</p>
<p class="muted">It drives the real Claude Code in a real browser; the answers of <code>gh</code> and of the reviewer are replayed from output captured once from the real ones. It does not run in GitHub's CI.</p>
<p class="muted">Is anyone using it? Its author, on its own repository. <a href="${REPO}/pull/113">Pull request #113</a> is one Botbench pushed and opened: its description is the task's evidence, from what was asked to the review.</p>
${more('Read the acceptance test', src('e2e/northstar.e2e.ts'), icon.out)}
</div>
</div></section>`,
});

/* ---------- Explore ---------- */
const CAPS = [
  ['available', 'Agents', 'Claude Code plans and builds', 'One task at a time, each in its own copy and branch, under your own sign-in.', 'src/drivers/claude-code.ts'],
  ['available', 'Agents', 'Codex builds', 'Chosen per task or run once Botbench\'s check finds that your Codex can build. It works in its own sandbox, in the task\'s copy, with no network.', 'src/drivers/codex.ts'],
  ['available', 'Agents', 'Review by another vendor\'s agent', 'Codex, Grok or Antigravity reads the change and is asked to say what it checked. With concerns, the builder makes rounds of fixes.', 'src/engine/review.ts'],
  ['available', 'Agents', 'Chat with any agent, or several at once', 'Ask Claude Code, Codex, Grok or Antigravity outside a repository, and compare their answers.', 'web/src/screens/turn.tsx'],
  ['available', 'Agents', 'Move a task to another agent', 'From Claude Code to Codex or back while it is being built. The work so far is committed, and the other agent carries on in the same copy and branch.', 'src/engine/handoff.ts'],
  ['available', 'Agents', 'Wait out a usage limit, or switch', 'A task waits and starts again at the reset time, or moves to the next agent on your list.', 'src/engine/usage-limit.ts'],
  ['available', 'Control', 'Approval cards', 'An action that reaches outside the task\'s copy waits for your answer, on the Mac or your phone. A short list of dangerous commands always asks.', 'src/approvals/'],
  ['available', 'Control', 'Three modes per run', 'Manual, semi-autonomous and fully autonomous. The safety rules are the same in every mode.', 'src/engine/modes.ts'],
  ['available', 'Control', 'Confined commands', 'Commands run in the macOS sandbox, kept away from your sign-ins and the network. Not a virtual machine or a container.', 'src/confinement.ts'],
  ['available', 'Control', 'An agent can ask you a question', 'A card with lettered choices. Your answer goes back as text and allows nothing to run.', 'src/approvals/question.ts'],
  ['available', 'Work', 'Checks and setup per repository', 'Your own commands, run after the work is committed, with their output kept.', 'src/engine/stations.ts'],
  ['available', 'Work', 'A pull request for an accepted task', 'Opened with your own git and gh, only when you chose it for the run. Never the default branch, never by force, never merged.', 'src/engine/delivery.ts'],
  ['available', 'Work', 'A run from a GitHub issue', 'Read with your own gh and treated as outside text: it always waits for plan approval and is never fully autonomous.', 'src/engine/intake.ts'],
  ['available', 'Work', 'Watch a repository for labelled issues', 'Each is listed as a proposal with Start and Dismiss. Nothing starts by itself.', 'src/engine/watch.ts'],
  ['available', 'Team', 'See other workbenches\' work', 'A read-only view of their open pull requests and pushed branches on the same remote, with a warning when one covers your issue or your files.', 'src/engine/peers.ts'],
  ['available', 'Team', 'Claim an issue', 'Off by default. The remote takes only the first claim; the later run stops and opens no pull request.', 'src/engine/claims.ts'],
  ['available', 'Team', 'Check together', 'Merge your ready task with a teammate\'s open pull request in a temporary copy and run the repository\'s checks on the merge.', 'src/engine/combined.ts'],
  ['early', 'Team', 'Pair with one other workbench', 'An invite that works once, fingerprints you both compare. One pairing per installation. Tested on one Mac over loopback, not across two Macs.', 'docs/pairing.md'],
  ['early', 'Team', 'Questions and answers between paired workbenches', 'You approve every message that leaves and decide about every message that arrives. A thread stops at 3 round trips.', 'src/peers/conversation.ts'],
  ['early', 'Control', 'Run a repository\'s commands in a container', 'Set per repository: one Docker container per task, from an image already on your Mac, holding only the task\'s copy and no network. Claude Code itself stays on your Mac. It cannot be combined with allowed hosts, and a task Codex builds is refused there.', 'docs/adr/0009-container-execution.md'],
  ['early', 'Work', 'Home Screen app and notifications on a phone', 'In the code, not confirmed on a real iPhone.', 'src/push.ts'],
  ['planned', 'Team', 'More kinds of message between workbenches', 'Interface proposals, counters, accepts, blockers, review requests and verdicts; pairing across two Macs; more than one pairing.', 154],
  ['planned', 'Team', 'Work that depends on a teammate\'s work', 'Including two changes to different files that must meet one shared contract.', 172],
  ['planned', 'Work', 'A shorter first run', 'Today it takes about ten minutes from cloning to a first branch.', 174],
  ['planned', 'Team', 'Beyond coding', 'Coding is where Botbench starts. Nothing beyond it is built.', 'docs/product/positioning-concept.md'],
];

page({
  file: 'explore.html',
  title: 'Explore: what works today · Botbench',
  description: 'The main Botbench capabilities, each with its state: available, early or planned, and where it is in the code.',
  body: `${pageHero('Explore', 'What works today, and what does not yet.', 'Each line has a state and a place in the code or an issue. Available means it works in the current code. Early means it works in a first, limited form, or is in the code and not yet confirmed on a real device. Planned means it is not built.')}

<section><div class="wrap">
<div class="filterbar">
<div class="chips" role="group" aria-label="Show by state">
<button class="chip" type="button" data-cap-filter="all" aria-pressed="true">All</button>
<button class="chip" type="button" data-cap-filter="available" aria-pressed="false">Available</button>
<button class="chip" type="button" data-cap-filter="early" aria-pressed="false">Early</button>
<button class="chip" type="button" data-cap-filter="planned" aria-pressed="false">Planned</button>
</div>
<input class="search" type="search" data-cap-search aria-label="Search what Botbench does" placeholder="Search, for example: review">
</div>
<p class="count" data-cap-count role="status" aria-live="polite"></p>
<ul class="caps">
${CAPS.map(([state, group, name, text, where]) => `<li class="cap" data-cap data-state="${state}"><div class="meta">${tag(state)}<span>${group}</span>${typeof where === 'number' ? `<a href="${issue(where)}">Issue #${where}</a>` : `<a href="${src(where)}">${where}</a>`}</div><div><h2>${name}</h2><p>${text}</p></div></li>`).join('\n')}
</ul>
<p class="source-note">The main capabilities, taken from the README's "What works today", "Configure a repository" and "Where it is going". The code is the authority; where this page and the code differ, the code is right.</p>
</div></section>`,
});

/* ---------- Get started ---------- */
page({
  file: 'get-started.html',
  title: 'Build from source · Botbench',
  description: 'Build Botbench from source on a Mac and make a first branch with Claude Code in a practice repository. About ten minutes.',
  body: `${pageHero('First run', 'Build from source, on a Mac.', 'About ten minutes. It ends with a branch made by Claude Code in a practice repository, and costs one short Claude Code reply on your subscription. There is no installer and no hosted service.')}

<section><div class="wrap split even">
<div class="prose">
<p class="eyebrow">You need</p>
<h2>Before you start</h2>
<ul>
<li>macOS. Agents are started only on macOS, because the confinement relies on its sandbox.</li>
<li>Node 24 or later.</li>
<li>git, set up so you can commit.</li>
<li>Claude Code 2.1.322 or later, installed and signed in. Check with <code>claude --version</code> and <code>claude auth status</code>.</li>
<li>Codex 0.171.0 or later, only if you want it to review or build.</li>
</ul>
</div>
<div class="prose">
<p class="eyebrow">Do not use it if</p>
<h2>Limits worth knowing first</h2>
<ul>
<li>You are on Windows or Linux.</li>
<li>You want a hosted service or a shared team server.</li>
<li>You need a hard security boundary for code you do not trust.</li>
<li>You need it stable. It changes often, and nothing is promised to stay the same.</li>
</ul>
</div>
</div></section>

<section><div class="wrap split reorder">
<div>${head('The first branch', 'Clone, build, start, hand over one task.')}
${clip('first-task-phone.mp4', 'first-task-phone-poster.jpg', 780, 1688, 'A 24-second recording of starting one task and accepting it, on a phone-size screen', 'One task from start to Accept, recorded at phone size from a real Botbench at its real speed. Claude Code\'s reply is replayed from a recorded session, and the task is a bug fix, not the hello.txt of step 5. 24 seconds, no sound.', `Your browser cannot play this recording. The steps beside it say what it shows.`, 'frame-phone')}</div>
<div>
<ol class="steps">
<li><div><h3>Get it and build the screens</h3>
<div class="code"><div class="code-head"><span>Terminal</span><button class="copy" type="button" data-copy="cmd-build">Copy</button></div><pre tabindex="0" aria-label="Text to copy" id="cmd-build">git clone https://github.com/botbenchhq/botbench.git
cd botbench
npm ci
npm ci --prefix web
npm run build --prefix web</pre></div></div></li>
<li><div><h3>Start it</h3><p>Leave this terminal open; Ctrl+C stops Botbench. It prints its address, <code>http://127.0.0.1:4780</code>, and on the first start a login token.</p>
<div class="code"><div class="code-head"><span>Terminal</span><button class="copy" type="button" data-copy="cmd-start">Copy</button></div><pre tabindex="0" aria-label="Text to copy" id="cmd-start">npm start</pre></div></div></li>
<li><div><h3>Sign in</h3><p>Open <code>http://127.0.0.1:4780</code> in a browser on the Mac, paste the token and choose Sign in. You arrive on Home. Later, read the token with <code>cat ~/.botbench/login-token</code>.</p></div></li>
<li><div><h3>Make a practice repository</h3><p>In a second terminal. Copy the path the last line prints.</p>
<div class="code"><div class="code-head"><span>Terminal</span><button class="copy" type="button" data-copy="cmd-try">Copy</button></div><pre tabindex="0" aria-label="Text to copy" id="cmd-try">mkdir ~/botbench-try &amp;&amp; cd ~/botbench-try
git init
echo "# Try" &gt; README.md
git add README.md &amp;&amp; git commit -m "Start"
pwd</pre></div></div></li>
<li><div><h3>Start a task</h3><p>Open Chat, press Add context under the message box, choose Repository, then Another folder…, and paste the path. When it reads "Usable git repository.", close the sheet. Write the task and choose Send:</p>
<div class="code"><div class="code-head"><span>Message</span><button class="copy" type="button" data-copy="cmd-task">Copy</button></div><pre tabindex="0" aria-label="Text to copy" id="cmd-task" style="white-space:pre-wrap">Add a file hello.txt that says hello, then run ls to show that it is there.</pre></div></div></li>
<li><div><h3>Review and accept</h3><p>Within a minute the transcript shows Claude Code writing the file and running <code>ls</code>. The task then reads Ready for review, with <code>hello.txt</code> under "1 file changed" and its branch, such as <code>botbench/your-mac/run-1/task-1</code>. This repository has no checks, so the button reads Accept without verification; choose it. Botbench keeps the branch and removes the task's copy. Your own branch is unchanged.</p></div></li>
</ol>
<p class="note">These steps follow the README's quickstart, which is the authority and has every detail, including how to clean up and how to use Botbench from your phone over a private network.</p>
<div class="btn-row" style="margin-top:28px">${btn('The full quickstart', `${REPO}#quickstart`, 'primary', icon.out)}${btn('Set up checks for a repository', `${REPO}#configure-a-repository`, 'quiet', icon.out)}</div>
</div>
</div></section>`,
});

/* ---------- Docs ---------- */
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
    ['Decision records', 'Why it drives the vendors\' own programs, and how secrets are kept from agents.', `${REPO}/tree/main/docs/adr`],
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
  description: 'Where Botbench\'s documentation lives: the README, the threat model, pairing, decision records and how to contribute.',
  body: `${pageHero('Documentation', 'The documentation lives with the code.', 'It is kept in the repository on GitHub, beside the code it describes, so it changes in the same pull request. This page is the way in.')}
${DOCS.map(([group, rows]) => `<section class="tight"><div class="wrap split">
<div><h2 class="group">${group}</h2></div>
<ul class="links">
${rows.map(([name, text, href]) => `<li><a href="${href}"><strong>${name}</strong><span>${text}</span>${icon.out}</a></li>`).join('\n')}
</ul>
</div></section>`).join('\n')}`,
});

/* ---------- Not found ---------- */
page({
  file: '404.html',
  title: 'Page not found · Botbench',
  description: 'This page does not exist.',
  base: `<meta name="robots" content="noindex">\n`,
  rootLinks: true,
  body: `<section class="hero page-hero"><div class="wrap"><p class="eyebrow">Not found</p><h1>This page does not exist.</h1><p class="lead">The address may have changed. The overview has a link to every page.</p><div class="btn-row">${btn('Go to the overview', 'index.html')}</div></div></section>`,
});

console.log('Wrote the pages.');
