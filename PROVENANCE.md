# Where the media came from

Every file in the first table is copied, unchanged, from [botbenchhq/botbench](https://github.com/botbenchhq/botbench) by `tools/copy-media.mjs`, which also writes the table. Botbench makes them with `npm run media` (`e2e/media.shots.ts`): real screens and recordings of a Botbench installation named studio-mac, working on a small billing repository under `/private/tmp/studio`, and of a second one on the same Mac, office-mac, paired with it. No model runs while they are made: Claude Code's build and Codex's review are replayed from sessions recorded from the real tools, the repository's check really runs, and each owner's messages between the two workbenches are typed through the real screens. Sign-in happens before a recording starts. Each was looked at before it was copied: none shows a private path, user name, token or repository.

<!-- media:start -->
From botbench at commit `53098af13cf51544b54802ff5accd76d8db17536`:

| File | Source in botbench | SHA-256 |
|---|---|---|
| `assets/media/hero-workbench.png` | `docs/images/hero-workbench.png`, unchanged | `a46959eaeb98fc292b4083d93750bef3e2f22cd416edec4d817b397cf9d0d5bb` |
| `assets/media/ready-for-review-proof.png` | `docs/images/ready-for-review-proof.png`, unchanged | `d502e46202c01661d4266861cb9dfd390bebb3afaee4c39b7828e3be614ecf13` |
| `assets/media/permissions-check.png` | `docs/images/permissions-check.png`, unchanged | `def66b9e7bbbd6b841233b5169f1857780676e429400cb66b142dc806f17a890` |
| `assets/media/paired-question.png` | `docs/images/paired-question.png`, unchanged | `fc64bccc8de15a423cd6b3a47af2e06e20be383f31f8d250544534ef8aa73474` |
| `assets/media/botbench-demo.mp4` | `docs/media/botbench-demo.mp4`, unchanged | `9af1c84e043dc8ef95c4b8cfb571ca87cb119ce46f4fec33341c77d7b73044d4` |
| `assets/media/botbench-demo-thumbnail.png` | `docs/media/botbench-demo-thumbnail.png`, unchanged | `8184dcb02463ddc737aeb53237159e3097469c0db92f96222dfd509b53d82ce6` |
| `assets/media/first-task-phone.mp4` | `docs/media/first-task-phone.mp4`, unchanged | `1616480c2a55a1df947e20a3bf04ce9937d4ab47520a462d263a6bcc0b9e6b73` |
| `assets/media/first-task-phone-poster.jpg` | `docs/media/first-task-phone-poster.jpg`, unchanged | `475e12ba7784da880bb959ef29ea865e73b8707dcda27de5fb23c6c06e166f93` |
| `assets/media/paired-question.mp4` | `docs/media/paired-question.mp4`, unchanged | `202826fae96af179a76b167cc31534026ecef9774ae11873747a5f93d2585d33` |
| `assets/media/paired-question-poster.jpg` | `docs/media/paired-question-poster.jpg`, unchanged | `23e5a1aef05a9dd0e9ecf1e0cc8326b2b003f8b0aad80c47970f381d9de98599` |
| `assets/media/social-preview.png` | `docs/media/social-preview.png`, unchanged | `7636d2f47762b741e6b3349e54aed446bf904052fa13eb1adb49be6d6d9103de` |
<!-- media:end -->

## From before the 0.3.0 redesign

`assets/media/move-to-codex.mp4` and `assets/media/move-to-codex-poster.png` still show the screens as they were before Botbench 0.3.0. They were made from `docs/media/move-to-codex.gif` at commit `d6f7b316bf24d81431ed132148ccefae283080b0`, a real handover on a small demo shop, changed only in format: `ffmpeg -i move-to-codex.gif -movflags +faststart -pix_fmt yuv420p -crf 26 move-to-codex.mp4`. The poster is the recording's last frame. A handover needs a live turn of both agents, which `npm run media` does not make.

| File | SHA-256 |
|---|---|
| `assets/media/move-to-codex.mp4` | `462265e5e93cab800ffea2c887d3c6acd78959f9548e9a90f6bacf4acb96f84c` |
| `assets/media/move-to-codex-poster.png` | `7cd754b678bf43125d32bb5abad2fd5f4648554d742a5b932256b2a54c6addc0` |

`assets/favicon.svg` is `assets/svg/botbench-app-icon-two-tone-dark.svg` from the same commit, unchanged.
