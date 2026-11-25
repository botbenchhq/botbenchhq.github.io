# Stageshow (vendored)

From https://github.com/benjitaylor/skills, folder `stageshow`, at revision
`299140fafd08df55a9c234e610c3f64af3f45531`, by Benji Taylor, under the MIT
License (`LICENSE`, `NOTICE.md`).

- `kit/`: the React kit, copied unchanged. `tools/build-scene.mjs` bundles the
  parts the coordination scene imports.
- `scripts/`: the filming and checking scripts (`film.mjs`, `film-checks.mjs`,
  `jumps.mjs`, `layout.mjs` and the modules they import), copied unchanged
  except one change in `scripts/browser.mjs`: when `playwright-core` is not
  installed it loads `playwright`, this site's dev dependency, which carries
  the same API.

Nothing else from the skill (its examples, playground and references) is
copied here.
