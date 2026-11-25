# Botbench website

The pages at https://botbenchhq.github.io/. Plain HTML, CSS and JavaScript, served by GitHub Pages from the top folder of `main`. Nothing to install to read or change a page.

## Change a page

The pages are written by one script, so the header, the footer and the wording stay the same everywhere. Edit `tools/build.mjs`, then:

```sh
node tools/build.mjs          # writes the .html files
node tools/check-links.mjs    # every link and asset resolves
```

Commit the script and the pages it wrote together.

## Check it in a browser

```sh
npm install
npx playwright install chromium
node tools/check-browser.mjs
```

It opens every page at 390, 768, 1280 and 1440 wide in both themes, saves screenshots to `shots/`, runs an accessibility scan (axe), and does a keyboard pass over the menu, the tabs, the filter and the copy buttons.

`BOTBENCH_DIR=../botbench node tools/check-links.mjs --online` also checks that every repository path the site links to exists in a checkout, and asks each outside address.

## The coordination scene

An authored illustration, "Before the second pull request", on the home and Coordination pages. Its source is `scene/coordination.tsx` and `scene/coordination.css`, built with the Stageshow kit in `third_party/stageshow/` (MIT, pinned revision in that folder's README). The bundled files under `assets/` are committed, so the pages need no build to be served:

```sh
npm ci
node tools/build-scene.mjs    # writes assets/scene-coordination.{js,css} and assets/kit/stageshow.css
node tools/build.mjs
```

Every word inside its windows is Botbench's own, copied from the code the scene's source names; the captions under it are the site's. Film it with Stageshow's own tools, against a local server of this folder:

```sh
node third_party/stageshow/scripts/film.mjs "http://127.0.0.1:8765/coordination.html" --select ".bb-stage" --width 1280 --every 1000 --count 20 --gate --out shots/scene.png
```

`scene/REHEARSAL.md` records the last rehearsal.

## Product pictures and recordings

They are made in the Botbench repository (`npm run media` there) and copied here unchanged:

```sh
BOTBENCH_DIR=../botbench node tools/copy-media.mjs   # copies into assets/media and updates PROVENANCE.md
```

## Rules for what the pages say

- Every claim comes from the Botbench README. Change the README first.
- Each capability is Available, Early or Planned, and Planned means not built.
- Real screens and recordings are the evidence, listed in `PROVENANCE.md` with the commit they came from. An authored illustration is allowed only for shipped behaviour, uses the product's own words, is labelled as an illustration where it is shown, and sits beside real media.
- Wording follows `docs/product/voice.md` in the Botbench repository.
- No cookies and no tracking.
