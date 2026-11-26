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
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', nameTheme);
  // A screen the product has in light and dark shows the one that matches the
  // page: the device's choice, or the visitor's once they choose (data-scheme sources).
  const syncPictures = () => document.querySelectorAll('source[data-scheme]').forEach((source) => {
    const chosen = root.dataset.theme;
    const scheme = chosen ? (chosen === source.dataset.scheme ? '' : 'not all') : `(prefers-color-scheme: ${source.dataset.scheme})`;
    source.media = scheme === 'not all' ? scheme : [source.dataset.base, scheme].filter(Boolean).join(' and ') || 'all';
  });
  syncPictures();
  themeBtn?.addEventListener('click', () => {
    const next = dark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('botbench-site-theme', next); } catch {}
    nameTheme();
    syncPictures();
  });

  // The coordination scene: its styles and script load only when it comes near
  // the view. Until then, and if they never load, its still frame shows.
  const sceneMounts = [...document.querySelectorAll('[data-scene-assets]')];
  if (sceneMounts.length && 'IntersectionObserver' in window) {
    const load = () => {
      io.disconnect();
      const files = sceneMounts[0].dataset.sceneAssets.split(' ');
      const styles = files.filter((f) => f.endsWith('.css')).map((href) => new Promise((done) => {
        const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
        link.onload = link.onerror = done;
        document.head.append(link);
      }));
      Promise.all(styles).then(() => files.filter((f) => f.endsWith('.js')).forEach((src) => document.head.append(Object.assign(document.createElement('script'), { src }))));
    };
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) load(); }, { rootMargin: '800px 0px' });
    sceneMounts.forEach((el) => io.observe(el));
  }

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
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    matchMedia('(min-width: 941px)').addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
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
    const select = (tab, focus, remember = false) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !on;
          if (!on) panel.querySelectorAll('video').forEach((v) => v.pause());
        }
      });
      if (focus) tab.focus();
      // A selected stage is linkable. This changes the address without a jump.
      if (remember) {
        try { history.replaceState(null, '', `#${tab.id}`); } catch {}
      }
    };
    const fromAddress = () => {
      const tab = tabs.find((t) => `#${t.id}` === location.hash || `#${t.getAttribute('aria-controls')}` === location.hash);
      if (tab) select(tab, false);
    };
    fromAddress();
    window.addEventListener('hashchange', fromAddress);
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab, false, true));
      tab.addEventListener('keydown', (e) => {
        const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        select(tabs[(to + tabs.length) % tabs.length], true, true);
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
