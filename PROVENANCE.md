# Where the media came from

Every file in the first table is copied, unchanged, from [botbenchhq/botbench](https://github.com/botbenchhq/botbench) by `tools/copy-media.mjs`, which also writes the table. Botbench makes the product screens and recordings with `npm run media` (`e2e/media.shots.ts`): real screens and recordings of a Botbench installation named studio-mac, working on a small billing repository under `/private/tmp/studio`, and of a second one on the same Mac, office-mac, paired with it. No model runs while they are made: Claude Code's build and Codex's review are replayed from sessions recorded from the real tools, the repository's check really runs, and each owner's messages between the two workbenches are typed through the real screens. Sign-in happens before a recording starts. Each was looked at before it was copied: none shows a private path, user name, token or repository.

`assets/media/social-preview.png` is marketing artwork exported from Botbench's versioned `docs/media/social-preview.svg`, which contains the canonical two-tone light lockup and the export command. The PNG is copied unchanged.

<!-- media:start -->
From botbench at commit `f1ab6448e13e3d03e610c4b00bd5e498a749f698`:

| File | Source in botbench | SHA-256 |
|---|---|---|
| `assets/media/hero-workbench.png` | `docs/images/hero-workbench.png`, unchanged | `d2e9534dd807d4b09c2f46412a97b314bb424eeb452d6623d4189aaaa8343196` |
| `assets/media/ready-for-review-proof.png` | `docs/images/ready-for-review-proof.png`, unchanged | `cb67af2f4adf1e65f614d8d816fa5b4437c70caee5a43a71db4ff0b57421a3a6` |
| `assets/media/permissions-check.png` | `docs/images/permissions-check.png`, unchanged | `101aded237fbdf1d546e41bcd19f6a7bc3326104ece7c6e8f63c8fe8582a0b0b` |
| `assets/media/ready-for-review-proof-light.png` | `docs/images/ready-for-review-proof-light.png`, unchanged | `4704d93e96c096d17bbb29d52e5544273631c9ae42bdfa77016952b11846b128` |
| `assets/media/permissions-check-light.png` | `docs/images/permissions-check-light.png`, unchanged | `e350602356ab0ff00bec504edd6a61d3f48691b7828c1991496165a4a344a8aa` |
| `assets/media/approval-card.png` | `docs/images/approval-card.png`, unchanged | `7f26a6dc40fd4345e861738afec2bb90be739cfa04f99c7aa589f1a34236c9d0` |
| `assets/media/paired-question.png` | `docs/images/paired-question.png`, unchanged | `46d164a91c6f4cc88c661d97166ab042977bd122a11b640b711f43dda9200c05` |
| `assets/media/botbench-demo.mp4` | `docs/media/botbench-demo.mp4`, unchanged | `f85d01b87da56578ce4519534425a1fd99fe2a7030382ab956db48153129a2bb` |
| `assets/media/botbench-demo-thumbnail.png` | `docs/media/botbench-demo-thumbnail.png`, unchanged | `36c3421206b5a8e326d85dcf37e52f13ba765b3d077ef22335eedc15f6dcd0a7` |
| `assets/media/first-task-phone.mp4` | `docs/media/first-task-phone.mp4`, unchanged | `7510607a54764c25b0db3fafda2d43efdd2e7c31d56ecbfad636800d223a9a25` |
| `assets/media/first-task-phone-poster.jpg` | `docs/media/first-task-phone-poster.jpg`, unchanged | `c58b7d27c19b6d64b3c69f259ec4173a71ac146d01f87c981167f9bdb69c1fd6` |
| `assets/media/paired-question.mp4` | `docs/media/paired-question.mp4`, unchanged | `93f3ced8ad217dac7ceebe7431be7e58fd9b8b7967acb76c8e940838e9dfd56c` |
| `assets/media/paired-question-poster.jpg` | `docs/media/paired-question-poster.jpg`, unchanged | `4ca087b17012600575923a494223db916729089ab6840fa90880dc8b2b769c55` |
| `assets/media/social-preview.png` | `docs/media/social-preview.png`, unchanged | `d612024227ffe6db823875c83de2554e6a3bab187a0e96cf9ccd30bdcee0e939` |
<!-- media:end -->

## From before the 0.3.0 redesign

`assets/media/move-to-codex.mp4` and `assets/media/move-to-codex-poster.png` still show the screens as they were before Botbench 0.3.0. They were made from `docs/media/move-to-codex.gif` at commit `d6f7b316bf24d81431ed132148ccefae283080b0`, a real handover on a small demo shop, changed only in format: `ffmpeg -i move-to-codex.gif -movflags +faststart -pix_fmt yuv420p -crf 26 move-to-codex.mp4`. The poster is the recording's last frame. A handover needs a live turn of both agents, which `npm run media` does not make.

| File | SHA-256 |
|---|---|
| `assets/media/move-to-codex.mp4` | `462265e5e93cab800ffea2c887d3c6acd78959f9548e9a90f6bacf4acb96f84c` |
| `assets/media/move-to-codex-poster.png` | `7cd754b678bf43125d32bb5abad2fd5f4648554d742a5b932256b2a54c6addc0` |

`assets/favicon.svg` is `assets/svg/botbench-app-icon-two-tone-dark.svg` from the same commit, unchanged.

## Crops of the hero picture

The homepage hero shows two crops of `assets/media/hero-workbench.png`, each cut out of it with no other change (no scaling, no edit of the pixels), so the desktop screen can be shown at its own size and the phone screen on its own on a phone:

| File | Cut from `assets/media/hero-workbench.png` | SHA-256 |
|---|---|---|
| `assets/media/hero-desktop-crop.png` | 2380 × 1500 at x 68, y 110: the desktop window (`ffmpeg -i hero-workbench.png -vf crop=2380:1500:68:110`) | `e1c424d0f277ad16b9bfde3e70846411069e9247ae04b2348d0c63daddf1e9db` |
| `assets/media/hero-phone-crop.png` | 680 × 1452 at x 2448, y 134: the phone (`-vf crop=680:1452:2448:134`) | `05ad15bf158e616bba83eb80b87c11a69bbf624d344ded5fb394b4a12fcb4559` |

## Real screens between two workbenches (not yet in Botbench's main branch)

The Coordination and home pages show three real screens of coordination between workbenches, made by Botbench's `npm run media` ("between workbenches", `e2e/media.shots.ts`) on the branch of [botbenchhq/botbench pull request #253](https://github.com/botbenchhq/botbench/pull/253), at commit `14dcb4ec8b65ed4437153c415c87e6dbd08ac7b0`, which is not merged yet. No model runs while they are made. The other workbench, dev1, and its open pull requests are the real `gh` output captured once (`test/recordings/gh-peers-open.json`) and replayed; dev1's branch and claim are really pushed to a test remote; the task's check and the check together really run. The repository, names and pull request numbers are that example data. Copied unchanged with `cp docs/images/peers/<file> assets/media/peers/`:

| File | Source in botbench at `14dcb4e` | SHA-256 |
|---|---|---|
| `assets/media/peers/peers-overlap-desktop.png` | `docs/images/peers/peers-overlap-desktop.png`, unchanged | `5cd7edf4031722c5e7bce9ac443da0d971432fd48bb0abb62e75792fdd57ce8b` |
| `assets/media/peers/peers-overlap-phone.png` | `docs/images/peers/peers-overlap-phone.png`, unchanged | `0afebb7d154dffeb547a6cb2fb91b5eda3207e7895164b34efb89eaa16a82078` |
| `assets/media/peers/peers-passed-together-desktop.png` | `docs/images/peers/peers-passed-together-desktop.png`, unchanged | `9f0bda61243e70a515df8d9bb60a68f5cb71a9df436c3a8e56ece0222920368a` |
| `assets/media/peers/peers-passed-together-phone.png` | `docs/images/peers/peers-passed-together-phone.png`, unchanged | `2f51d48475030a4570c9607206f6ea526bcd241cf651c91975af99c12bf1bc72` |
| `assets/media/peers/peers-claim-warning-desktop.png` | `docs/images/peers/peers-claim-warning-desktop.png`, unchanged | `828637ae5c448cf600923f4218a27c15e59e05a2b1aa1f3d02adfcb9f995f3fb` |
| `assets/media/peers/peers-claim-warning-phone.png` | `docs/images/peers/peers-claim-warning-phone.png`, unchanged | `678e614188ee5ef625fc523627e87f41a1137d1e5a015d064fc7c181d265dfbf` |

When pull request #253 is merged, these move into the first table through `tools/copy-media.mjs`.

## The pictures the pages show

A page shows a smaller or cut-out WebP of a real screen, so the words can be read at the size it is shown and the page stays light. Each is cut out of and/or scaled down from a file above with `cwebp`, with no other change to the pixels, by `tools/media-variants.mjs`, which also writes this table. Each links to the whole, unchanged screen it came from. Where the product has a light and a dark picture of a screen, the page shows the one that matches its theme.

<!-- variants:start -->
| File | Made from | SHA-256 |
|---|---|---|
| `assets/media/v/check-a-command-800.webp` | `assets/media/permissions-check.png`, cut 1584 × 1096 at x 634, y 100, scaled to 800 wide (`cwebp -quiet -q 86 -m 6 -crop 634 100 1584 1096 -resize 800 0`) | `4c5b840a119796e59f71e26aadd4d7bdc7715fe1d09875a8e330e33f87e8f737` |
| `assets/media/v/check-a-command-1584.webp` | `assets/media/permissions-check.png`, cut 1584 × 1096 at x 634, y 100 (`cwebp -quiet -q 86 -m 6 -crop 634 100 1584 1096`) | `7c23dbb595d55f63ab20f988c0bf9b9b4f2c93257aa0fa998cdaf6e38408bfc5` |
| `assets/media/v/check-a-command-light-800.webp` | `assets/media/permissions-check-light.png`, cut 1584 × 1096 at x 634, y 100, scaled to 800 wide (`cwebp -quiet -q 86 -m 6 -crop 634 100 1584 1096 -resize 800 0`) | `8401889f7df49fd98572c0e1b3d1e49e7c6a1d209b4fbf22fcba21770f5ee785` |
| `assets/media/v/check-a-command-light-1584.webp` | `assets/media/permissions-check-light.png`, cut 1584 × 1096 at x 634, y 100 (`cwebp -quiet -q 86 -m 6 -crop 634 100 1584 1096`) | `87146e992c9f8852d48297849f87c772c457161159757caddca29170c03b2fe7` |
| `assets/media/v/check-a-command-modes-900.webp` | `assets/media/permissions-check.png`, cut 900 × 345 at x 690, y 690 (`cwebp -quiet -q 86 -m 6 -crop 690 690 900 345`) | `1e6486bfb74e23f0dd9b7451f85d0da6ebc83385106e2d695414166b06dc6a93` |
| `assets/media/v/check-a-command-modes-light-900.webp` | `assets/media/permissions-check-light.png`, cut 900 × 345 at x 690, y 690 (`cwebp -quiet -q 86 -m 6 -crop 690 690 900 345`) | `567e4d68c861b347f8a73acfd791ab51d3e856d2f673ae82bb5c350cfec1f537` |
| `assets/media/v/review-evidence-800.webp` | `assets/media/ready-for-review-proof.png`, cut 1552 × 700 at x 588, y 640, scaled to 800 wide (`cwebp -quiet -q 86 -m 6 -crop 588 640 1552 700 -resize 800 0`) | `3f972d106d93d82147199e45d633d31856a570d3edd7f14ef2032a4777b01df6` |
| `assets/media/v/review-evidence-1552.webp` | `assets/media/ready-for-review-proof.png`, cut 1552 × 700 at x 588, y 640 (`cwebp -quiet -q 86 -m 6 -crop 588 640 1552 700`) | `6a8d3947600cb625f05f26b8c98a8ae474654a71880a7ddd40f1321b68d34f0d` |
| `assets/media/v/review-evidence-light-800.webp` | `assets/media/ready-for-review-proof-light.png`, cut 1552 × 700 at x 588, y 640, scaled to 800 wide (`cwebp -quiet -q 86 -m 6 -crop 588 640 1552 700 -resize 800 0`) | `abd86b7ad00b02d5d4dfd993817b02ed270c6118b55d196f030c73895495e6f7` |
| `assets/media/v/review-evidence-light-1552.webp` | `assets/media/ready-for-review-proof-light.png`, cut 1552 × 700 at x 588, y 640 (`cwebp -quiet -q 86 -m 6 -crop 588 640 1552 700`) | `86772f2f7bd761a846b8bb5d92a8c6ce67c007f0137bf66b9bb841ca28c81cd1` |
| `assets/media/v/your-decision-600.webp` | `assets/media/ready-for-review-proof.png`, cut 600 × 1060 at x 2242, y 40 (`cwebp -quiet -q 86 -m 6 -crop 2242 40 600 1060`) | `c31a230995327a4bb4cfb2370a4ca4954993fc2f1148b3f32a247d975902ad49` |
| `assets/media/v/your-decision-light-600.webp` | `assets/media/ready-for-review-proof-light.png`, cut 600 × 1060 at x 2242, y 40 (`cwebp -quiet -q 86 -m 6 -crop 2242 40 600 1060`) | `e5a97e02c0ea8dc8ac713c24a02bd08e4a6562c347bfdc871b33723e29a4b16e` |
| `assets/media/v/ready-for-review-1200.webp` | `assets/media/ready-for-review-proof.png`, scaled to 1200 wide (`cwebp -quiet -q 86 -m 6 -resize 1200 0`) | `369e00ed7765022fbb0a95ea22f534471dc5bd1cb8b47c1a7130ae53c7e5653e` |
| `assets/media/v/ready-for-review-2000.webp` | `assets/media/ready-for-review-proof.png`, scaled to 2000 wide (`cwebp -quiet -q 86 -m 6 -resize 2000 0`) | `b2ce15ab6369a6c063344b80ba13ac031bcf4b8d4e4961e8db8fbbaeb3cdd492` |
| `assets/media/v/ready-for-review-light-1200.webp` | `assets/media/ready-for-review-proof-light.png`, scaled to 1200 wide (`cwebp -quiet -q 86 -m 6 -resize 1200 0`) | `7dcaf7dfbdd2e617b9a4a93fa1a23d781c30a9c1edcd58b8b4cd020871fd992a` |
| `assets/media/v/ready-for-review-light-2000.webp` | `assets/media/ready-for-review-proof-light.png`, scaled to 2000 wide (`cwebp -quiet -q 86 -m 6 -resize 2000 0`) | `5c5cf7bb53434475f8da9b559a37ea71e7856c5c638016f7999594f3cdebcf1a` |
| `assets/media/v/approval-card-600.webp` | `assets/media/approval-card.png`, scaled to 600 wide (`cwebp -quiet -q 86 -m 6 -resize 600 0`) | `8e04a53ed8dfc482525ee61c2da1d13a4bf5533bbd0b3f544e867feb517512cd` |
| `assets/media/v/approval-card-900.webp` | `assets/media/approval-card.png`, scaled to 900 wide (`cwebp -quiet -q 86 -m 6 -resize 900 0`) | `3788c74c3cc52c7568353372b25a92232ec51d3977b768460f136a8d235af0f5` |
| `assets/media/v/peers-overlap-600.webp` | `assets/media/peers/peers-overlap-phone.png`, scaled to 600 wide (`cwebp -quiet -q 86 -m 6 -resize 600 0`) | `383433a9f7c82bc3bd1a403af9a40b81175bbaddf3516ec11d053beace03fa7b` |
| `assets/media/v/peers-overlap-900.webp` | `assets/media/peers/peers-overlap-phone.png`, scaled to 900 wide (`cwebp -quiet -q 86 -m 6 -resize 900 0`) | `44f2a5798122045e0182ee3d7b199590d9a5f1a6a762bd20e6f8c823a262225c` |
| `assets/media/v/peers-passed-together-600.webp` | `assets/media/peers/peers-passed-together-phone.png`, scaled to 600 wide (`cwebp -quiet -q 86 -m 6 -resize 600 0`) | `a730d2195c619b5ed7a4a595dbaeec78f696648f1dec4dda15f9d3a86c87bd93` |
| `assets/media/v/peers-passed-together-900.webp` | `assets/media/peers/peers-passed-together-phone.png`, scaled to 900 wide (`cwebp -quiet -q 86 -m 6 -resize 900 0`) | `2c9c49b312b97989426300a475e51955acf92da2c50c367cec1cf7631b9b93f5` |
| `assets/media/v/peers-claim-warning-600.webp` | `assets/media/peers/peers-claim-warning-phone.png`, scaled to 600 wide (`cwebp -quiet -q 86 -m 6 -resize 600 0`) | `295498036c8613489a34f8c5ea96cc634493881c1dee36d368d9c35e3df952e2` |
| `assets/media/v/peers-claim-warning-900.webp` | `assets/media/peers/peers-claim-warning-phone.png`, scaled to 900 wide (`cwebp -quiet -q 86 -m 6 -resize 900 0`) | `87b085d10143c01340bf12deddd4ae664ae828eb4106df295e026d5ea6ec5995` |
| `assets/media/v/demo-poster-1440.webp` | `assets/media/botbench-demo-thumbnail.png`, scaled to 1440 wide (`cwebp -quiet -q 86 -m 6 -resize 1440 0`) | `d60484c515b95692b2c3334d88afb4295a9616ab673e4c863eb8dd8312ce03e9` |
| `assets/media/v/hero-desktop-1200.webp` | `assets/media/hero-desktop-crop.png`, scaled to 1200 wide (`cwebp -quiet -q 86 -m 6 -resize 1200 0`) | `8694b30a6a9a6df0174676e369ded1e78e3dbb24fdcd2bfdba0e33b23f6ef96f` |
| `assets/media/v/hero-desktop-2380.webp` | `assets/media/hero-desktop-crop.png`, same size (`cwebp -quiet -q 86 -m 6`) | `8cfed40aca10d4e0066010b78adc45ffe49ca594958cb9e0e53ef363d38ca459` |
| `assets/media/v/hero-phone-680.webp` | `assets/media/hero-phone-crop.png`, same size (`cwebp -quiet -q 86 -m 6`) | `6e23474e3fe5e331138a08f08c362811246ffce628978e3b774727264f36886a` |
<!-- variants:end -->

## The coordination scene (an illustration, not a screen)

"Before the second pull request" on the home and Coordination pages is drawn, not recorded, and is labelled as an illustration where it is shown. It is built with the Stageshow kit (`third_party/stageshow/`, MIT, revision `299140fafd08df55a9c234e610c3f64af3f45531`). The words inside its windows are Botbench's own, copied from botbenchhq/botbench at commit `f1ab6448e13e3d03e610c4b00bd5e498a749f698`: the claim and its withdrawal from `src/engine/claims.ts` (`holderWords` and the withdrawn detail, times in the format of `claimTimeWords` in `src/engine/claim-branch.ts`), the run's status line from `e2e/northstar.e2e.ts`, the overlap line from `web/src/app/peers.ts` (`overlapLines`), Check together from `web/src/app/check-together.ts` and `web/src/components/check-together.tsx`, and the decision line from `web/src/screens2/review/decision-panel.tsx`. The names studio-mac and office-mac, the repository billing-api, and the issue and task titles are the example of the real screenshots. The colours are the Botbench theme of botbenchhq/design-system (`themes/botbench.css`, Graphite + Glacier, at `9457a46630f10c55a33682d80ee872e001a9a2a8`). Each step is shipped behaviour listed in the README's "What works today"; the acceptance test (`e2e/northstar.e2e.ts`) covers the claim and the withdrawal.

The scene's last frame is rendered from the scene itself by `tools/render-scene-stills.mjs` (Playwright, Chromium, device scale 2, reduced motion, dark), and saved as WebP:

- `assets/media/scene-coordination-final.webp`: the whole stage at 1280 wide, shown when JavaScript is off.
- `assets/media/scene-coordination-final-compact.webp`: the phone design at 390 wide, shown in its place on a narrow screen.
- `assets/media/scene-coordination-pane.webp`: office-mac's window only, shown on the Evidence page, labelled there as an illustration, not a screen.

## README product card (an illustration, not a recording)

`assets/cards/botbench-card-{light,dark}.svg`, their motionless `botbench-card-still-{light,dark}.svg`, and the phone compositions `botbench-card-compact-{light,dark}.svg` and `botbench-card-compact-still-{light,dark}.svg` are **authored illustrations**, labelled on the card itself: "Illustration · words from Botbench's screens". They are made by `tools/cards/build.mjs` (`npm run build:cards`) and checked by `tools/cards/check.mjs` (`npm run check:cards`). They show one task of the run in `docs/images/ready-for-review-proof.png`: Make add in calc.py return the sum, built by Claude Code on `botbench/studio-mac/run-7/task-7`, 1 of 1 check passed, Codex's review as "A model's opinion, not a check.", then the overlap line on the Review tab under the changed file with one annotation beside it, then Your decision.

- **Words.** Every string is Botbench's own, from botbench at `f1ab6448e13e3d03e610c4b00bd5e498a749f698`. The builder lists the file each comes from and, when a Botbench checkout is beside this one (`BOTBENCH_DIR`), stops if one no longer says it. The overlap line is the product's sentence (`web/src/app/peers.ts`, `overlapLines`) filled with office-mac and pull request #12: office-mac is the second workbench of the media recordings, and pull request #12 is the example the product brief uses, not a recorded pull request. No recording shows this overlap line yet.
- **Placement and order.** As the product shows it: the overlap line is muted text on the Review tab under the changed files (`web/src/screens2/task/task-screen.tsx`), shown once the task is Ready for review. The card brings the decision panel in after the overlap line so the warning is read first; in the product both appear when the task becomes Ready for review.
- **The one annotation.** "Another workbench is changing the same file. You find out before either is merged." is not a product string and not part of the screen: it is drawn outside the screen's surfaces, in the theme's peer colour, joined by a fine leader to the overlap line it explains. It is in the resting frame, the stills and the alt text.
- **Look.** The Botbench theme of the design system (Graphite + Glacier), checked against `themes/botbench.css` at design-system `aff82d06bbf9f32009db29114c351c7b94065234` when a checkout is beside this one (`DS_DIR`). The lockup is the real file, unchanged except that its one `<text>` ("Botbench", which asks for the platform's system font) is outlined in Inter SemiBold.
- **Kit.** ChanMeng SVG product-card kit, MIT, at `539208618e6ca68963474f77921f62e39713bb0e`; the five files in `tools/cards/lib/` are unchanged copies.

| File | Source | SHA-256 |
|---|---|---|
| `tools/cards/assets/botbench-lockup-two-tone-light.svg` | botbench `assets/svg/botbench-lockup-two-tone-light.svg` at `f1ab6448e13e3d03e610c4b00bd5e498a749f698`, unchanged | `413ee8684c133d0090e978aa61cb60bd8954dfe554c9db4a5e0d11183b439896` |
| `tools/cards/assets/botbench-lockup-two-tone-dark.svg` | botbench `assets/svg/botbench-lockup-two-tone-dark.svg` at `f1ab6448e13e3d03e610c4b00bd5e498a749f698`, unchanged | `39fb799a4f483fb2cad1b86090836d7af518dcaaa1ee25603a5985f488229761` |
