# Where the media came from

Every file in the first table is copied, unchanged, from [botbenchhq/botbench](https://github.com/botbenchhq/botbench) by `tools/copy-media.mjs`, which also writes the table. Botbench makes the product screens and recordings with `npm run media` (`e2e/media.shots.ts`): real screens and recordings of a Botbench installation named studio-mac, working on a small billing repository under `/private/tmp/studio`, and of a second one on the same Mac, office-mac, paired with it. No model runs while they are made: Claude Code's build and Codex's review are replayed from sessions recorded from the real tools, the repository's check really runs, and each owner's messages between the two workbenches are typed through the real screens. Sign-in happens before a recording starts. Each was looked at before it was copied: none shows a private path, user name, token or repository.

`assets/media/social-preview.png` is marketing artwork exported from Botbench's versioned `docs/media/social-preview.svg`, which contains the canonical two-tone light lockup and the export command. The PNG is copied unchanged; its newer source commit is recorded in the table.

<!-- media:start -->
From botbench at commit `ebc33d24e77a5c9c5a838ef8ba4b0ea087209d64`, except the social preview whose source commit is listed in its row:

| File | Source in botbench | SHA-256 |
|---|---|---|
| `assets/media/hero-workbench.png` | `docs/images/hero-workbench.png`, unchanged | `d2e9534dd807d4b09c2f46412a97b314bb424eeb452d6623d4189aaaa8343196` |
| `assets/media/ready-for-review-proof.png` | `docs/images/ready-for-review-proof.png`, unchanged | `cb67af2f4adf1e65f614d8d816fa5b4437c70caee5a43a71db4ff0b57421a3a6` |
| `assets/media/permissions-check.png` | `docs/images/permissions-check.png`, unchanged | `101aded237fbdf1d546e41bcd19f6a7bc3326104ece7c6e8f63c8fe8582a0b0b` |
| `assets/media/paired-question.png` | `docs/images/paired-question.png`, unchanged | `46d164a91c6f4cc88c661d97166ab042977bd122a11b640b711f43dda9200c05` |
| `assets/media/botbench-demo.mp4` | `docs/media/botbench-demo.mp4`, unchanged | `f85d01b87da56578ce4519534425a1fd99fe2a7030382ab956db48153129a2bb` |
| `assets/media/botbench-demo-thumbnail.png` | `docs/media/botbench-demo-thumbnail.png`, unchanged | `36c3421206b5a8e326d85dcf37e52f13ba765b3d077ef22335eedc15f6dcd0a7` |
| `assets/media/first-task-phone.mp4` | `docs/media/first-task-phone.mp4`, unchanged | `7510607a54764c25b0db3fafda2d43efdd2e7c31d56ecbfad636800d223a9a25` |
| `assets/media/first-task-phone-poster.jpg` | `docs/media/first-task-phone-poster.jpg`, unchanged | `c58b7d27c19b6d64b3c69f259ec4173a71ac146d01f87c981167f9bdb69c1fd6` |
| `assets/media/paired-question.mp4` | `docs/media/paired-question.mp4`, unchanged | `93f3ced8ad217dac7ceebe7431be7e58fd9b8b7967acb76c8e940838e9dfd56c` |
| `assets/media/paired-question-poster.jpg` | `docs/media/paired-question-poster.jpg`, unchanged | `4ca087b17012600575923a494223db916729089ab6840fa90880dc8b2b769c55` |
| `assets/media/social-preview.png` | `docs/media/social-preview.png` at `15e08edace18af92102a33f4dd4182645e42349d`, unchanged | `d612024227ffe6db823875c83de2554e6a3bab187a0e96cf9ccd30bdcee0e939` |
<!-- media:end -->

## From before the 0.3.0 redesign

`assets/media/move-to-codex.mp4` and `assets/media/move-to-codex-poster.png` still show the screens as they were before Botbench 0.3.0. They were made from `docs/media/move-to-codex.gif` at commit `d6f7b316bf24d81431ed132148ccefae283080b0`, a real handover on a small demo shop, changed only in format: `ffmpeg -i move-to-codex.gif -movflags +faststart -pix_fmt yuv420p -crf 26 move-to-codex.mp4`. The poster is the recording's last frame. A handover needs a live turn of both agents, which `npm run media` does not make.

| File | SHA-256 |
|---|---|
| `assets/media/move-to-codex.mp4` | `462265e5e93cab800ffea2c887d3c6acd78959f9548e9a90f6bacf4acb96f84c` |
| `assets/media/move-to-codex-poster.png` | `7cd754b678bf43125d32bb5abad2fd5f4648554d742a5b932256b2a54c6addc0` |

`assets/favicon.svg` is `assets/svg/botbench-app-icon-two-tone-dark.svg` from the same commit, unchanged.

## README product card (an illustration, not a recording)

`assets/cards/botbench-card-{light,dark}.svg`, their motionless `botbench-card-still-{light,dark}.svg`, and the phone compositions `botbench-card-compact-{light,dark}.svg` and `botbench-card-compact-still-{light,dark}.svg` are **authored illustrations**, labelled on the card itself: "Illustration · words from Botbench's screens". They are made by `tools/cards/build.mjs` (`npm run build:cards`) and checked by `tools/cards/check.mjs` (`npm run check:cards`). They show one task of the run in `docs/images/ready-for-review-proof.png`: Make add in calc.py return the sum, built by Claude Code on `botbench/studio-mac/run-7/task-7`, 1 of 1 check passed, Codex's review as "A model's opinion, not a check.", then the overlap line on the Review tab under the changed file, then Your decision.

- **Words.** Every string is Botbench's own, from botbench at `f1ab6448e13e3d03e610c4b00bd5e498a749f698`. The builder lists the file each comes from and, when a Botbench checkout is beside this one (`BOTBENCH_DIR`), stops if one no longer says it. The overlap line is the product's sentence (`web/src/app/peers.ts`, `overlapLines`) filled with office-mac and pull request #12: office-mac is the second workbench of the media recordings, and pull request #12 is the example the product brief uses, not a recorded pull request. No recording shows this overlap line yet.
- **Placement and order.** As the product shows it: the overlap line is muted text on the Review tab under the changed files (`web/src/screens2/task/task-screen.tsx`), shown once the task is Ready for review. The card brings the decision panel in after the overlap line so the warning is read first; in the product both appear when the task becomes Ready for review.
- **Look.** The Botbench theme of the design system (Graphite + Glacier), checked against `themes/botbench.css` at design-system `aff82d06bbf9f32009db29114c351c7b94065234` when a checkout is beside this one (`DS_DIR`). The lockup is the real file, unchanged except that its one `<text>` ("Botbench", which asks for the platform's system font) is outlined in Inter SemiBold.
- **Kit.** ChanMeng SVG product-card kit, MIT, at `539208618e6ca68963474f77921f62e39713bb0e`; the five files in `tools/cards/lib/` are unchanged copies.

| File | Source | SHA-256 |
|---|---|---|
| `tools/cards/assets/botbench-lockup-two-tone-light.svg` | botbench `assets/svg/botbench-lockup-two-tone-light.svg` at `f1ab6448e13e3d03e610c4b00bd5e498a749f698`, unchanged | `413ee8684c133d0090e978aa61cb60bd8954dfe554c9db4a5e0d11183b439896` |
| `tools/cards/assets/botbench-lockup-two-tone-dark.svg` | botbench `assets/svg/botbench-lockup-two-tone-dark.svg` at `f1ab6448e13e3d03e610c4b00bd5e498a749f698`, unchanged | `39fb799a4f483fb2cad1b86090836d7af518dcaaa1ee25603a5985f488229761` |
