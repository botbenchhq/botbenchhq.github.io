// Botbench website: theme, menu, tabs, capability filter, copy. No dependencies.
(() => {
  const root = document.documentElement;

  // Theme: follows the device until the visitor chooses.
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const dark = () => root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  const nameTheme = () => themeBtn?.setAttribute('aria-label', dark() ? 'Use the light theme' : 'Use the dark theme');
  nameTheme();
  themeBtn?.addEventListener('click', () => {
    const next = dark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('botbench-site-theme', next); } catch {}
    nameTheme();
  });

  // Menu at phone width.
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('site-nav');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close the menu' : 'Open the menu');
  };
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
  }

  // Tabs: arrow keys move, Home and End jump.
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !on;
        if (!on) panel.querySelectorAll('video').forEach((v) => v.pause());
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        select(tabs[(to + tabs.length) % tabs.length], true);
      });
    });
  });

  // Capability filter.
  const search = document.querySelector('[data-cap-search]');
  const chips = [...document.querySelectorAll('[data-cap-filter]')];
  const caps = [...document.querySelectorAll('[data-cap]')];
  const count = document.querySelector('[data-cap-count]');
  let state = 'all';
  const apply = () => {
    const q = (search?.value || '').trim().toLowerCase();
    let shown = 0;
    caps.forEach((c) => {
      const ok = (state === 'all' || c.dataset.state === state) && (!q || c.textContent.toLowerCase().includes(q));
      c.hidden = !ok;
      if (ok) shown++;
    });
    if (count) count.textContent = shown === caps.length
      ? `${caps.length} listed.`
      : shown === 0 ? `None of ${caps.length} match. Clear the search or choose All.` : `${shown} of ${caps.length} shown.`;
  };
  chips.forEach((chip) => chip.addEventListener('click', () => {
    state = chip.dataset.capFilter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    apply();
  }));
  search?.addEventListener('input', apply);
  if (caps.length) apply();

  // Copy a command block.
  document.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
    const text = document.getElementById(btn.dataset.copy)?.textContent.trim();
    if (!text) return;
    const label = btn.textContent;
    try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied'; }
    catch { btn.textContent = 'Not copied: select the text'; }
    setTimeout(() => { btn.textContent = label; }, 2000);
  }));
})();
