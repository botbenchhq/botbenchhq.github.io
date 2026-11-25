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

## Crops of the hero picture

The homepage hero shows two crops of `assets/media/hero-workbench.png`, each cut out of it with no other change (no scaling, no edit of the pixels), so the desktop screen can be shown at its own size and the phone screen on its own on a phone:

| File | Cut from `assets/media/hero-workbench.png` | SHA-256 |
|---|---|---|
| `assets/media/hero-desktop-crop.png` | 2380 × 1500 at x 68, y 110: the desktop window (`ffmpeg -i hero-workbench.png -vf crop=2380:1500:68:110`) | `e1c424d0f277ad16b9bfde3e70846411069e9247ae04b2348d0c63daddf1e9db` |
| `assets/media/hero-phone-crop.png` | 680 × 1452 at x 2448, y 134: the phone (`-vf crop=680:1452:2448:134`) | `05ad15bf158e616bba83eb80b87c11a69bbf624d344ded5fb394b4a12fcb4559` |

## The coordination scene (an illustration, not a screen)

"Before the second pull request" on the home and Coordination pages is drawn, not recorded, and is labelled as an illustration where it is shown. It is built with the Stageshow kit (`third_party/stageshow/`, MIT, revision `299140fafd08df55a9c234e610c3f64af3f45531`). The words inside its windows are Botbench's own, copied from botbenchhq/botbench at commit `f1ab6448e13e3d03e610c4b00bd5e498a749f698`: the claim and its withdrawal from `src/engine/claims.ts` (`holderWords` and the withdrawn detail, times in the format of `claimTimeWords` in `src/engine/claim-branch.ts`), the run's status line from `e2e/northstar.e2e.ts`, the overlap line from `web/src/app/peers.ts` (`overlapLines`), Check together from `web/src/app/check-together.ts` and `web/src/components/check-together.tsx`, and the decision line from `web/src/screens2/review/decision-panel.tsx`. The names studio-mac and office-mac, the repository billing-api, and the issue and task titles are the example of the real screenshots. The colours are the Botbench theme of botbenchhq/design-system (`themes/botbench.css`, Graphite + Glacier, at `9457a46630f10c55a33682d80ee872e001a9a2a8`). Each step is shipped behaviour listed in the README's "What works today"; the acceptance test (`e2e/northstar.e2e.ts`) covers the claim and the withdrawal.

`assets/media/scene-coordination-final.png` is the scene's last frame, rendered from the scene itself (Playwright, Chromium, 1280 wide, device scale 2, reduced motion), shown only when JavaScript is off. SHA-256 `d544b2b47bf4ce61ca0f9d18732b3a4177f22ab161943c83c1a193e0af4f8e13`.
