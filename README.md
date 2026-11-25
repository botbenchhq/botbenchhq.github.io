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

## Product pictures and recordings

They are made in the Botbench repository (`npm run media` there) and copied here unchanged:

```sh
BOTBENCH_DIR=../botbench node tools/copy-media.mjs   # copies into assets/media and updates PROVENANCE.md
```

## README product card

`assets/cards/` holds the animated card the Botbench README shows, an illustration in the product's own words (see `PROVENANCE.md`). It is built from `tools/cards/build.mjs` with the ChanMeng product-card kit in `tools/cards/lib/`:

```sh
npm install
BOTBENCH_DIR=../botbench DS_DIR=../design-system npm run build:cards   # checks the words and colours against those checkouts when they are there
npm run check:cards                                                     # rebuilt the same, the kit's static gate, and an <img> in Chromium, WebKit and Firefox
npm run check:cards -- --frames=shots/cards                             # also the kit's timed captures and a contact sheet per card
```

## Rules for what the pages say

- Every claim comes from the Botbench README. Change the README first.
- Each capability is Available, Early or Planned, and Planned means not built.
- Only real screens and recordings, listed in `PROVENANCE.md` with the commit they came from. Nothing is drawn to look like the product.
- Wording follows `docs/product/voice.md` in the Botbench repository.
- No cookies and no tracking.
