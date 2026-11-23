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

## Rules for what the pages say

- Every claim comes from the Botbench README. Change the README first.
- Each capability is Available, Early or Planned, and Planned means not built.
- Only real screens and recordings, listed in `PROVENANCE.md` with the commit they came from. Nothing is drawn to look like the product.
- Wording follows `docs/product/voice.md` in the Botbench repository.
- No cookies and no tracking.
