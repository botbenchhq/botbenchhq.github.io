# Where the media came from

Every file in the first table is from [botbenchhq/botbench](https://github.com/botbenchhq/botbench) at commit `d6f7b316bf24d81431ed132148ccefae283080b0`. They are real screens and recordings of two Botbench installations on one Mac, named maya and theo, working on a small demo shop. Each was looked at before it was copied: none shows a private path, user name, token or repository.

| File | Source in botbench | SHA-256 |
|---|---|---|
| `assets/media/botbench-demo.mp4` | `docs/media/botbench-demo.mp4`, unchanged | `3370948a66b8bd052cb072719ea2195ad32582ce2efe51e89a7b10c8c885c244` |
| `assets/media/botbench-demo-thumbnail.png` | `docs/media/botbench-demo-thumbnail.png`, unchanged | `4dda0d2bbc3d0814e43c02fdf05921788cee977bce585d432b240341f2a97119` |
| `assets/media/social-preview.png` | `docs/media/social-preview.png`, unchanged | `7636d2f47762b741e6b3349e54aed446bf904052fa13eb1adb49be6d6d9103de` |
| `assets/media/hero-workbench.png` | `docs/images/hero-workbench.png`, unchanged | `82481a13b5b0bf767e9c4b2df9860e071f3643adf455ce24669ff99f3ff5187f` |
| `assets/media/ready-for-review-proof.png` | `docs/images/ready-for-review-proof.png`, unchanged | `21744c04080877a5b3b45851fe2ffbdb6fb594c4045cf054dce19dc1eec25682` |
| `assets/media/permissions-check.png` | `docs/images/permissions-check.png`, unchanged | `212db054fd87dc173d6e0573a96c7b0ee46431b7fb471ab8609bb5aaa77167c3` |
| `assets/media/paired-question.png` | `docs/images/paired-question.png`, unchanged | `a7b38e11665983e443856ceddc2175d0d670a2648095737bf7131b794d671de5` |
| `assets/media/move-to-codex.mp4` | made from `docs/media/move-to-codex.gif` (see below) | `462265e5e93cab800ffea2c887d3c6acd78959f9548e9a90f6bacf4acb96f84c` |
| `assets/media/move-to-codex-poster.png` | made from `docs/media/move-to-codex.gif` (see below) | `7cd754b678bf43125d32bb5abad2fd5f4648554d742a5b932256b2a54c6addc0` |

`move-to-codex.mp4` is the same recording as the GIF, changed only in format so that it has a pause button and does not play by itself: `ffmpeg -i move-to-codex.gif -movflags +faststart -pix_fmt yuv420p -crf 26 move-to-codex.mp4`. Its poster is the recording's last frame.

`assets/favicon.svg` is `assets/svg/botbench-app-icon-two-tone-dark.svg` from the same commit, unchanged.

## Recorded for this site

`assets/media/first-task-phone.mp4` and its poster were recorded by `tools/capture/first-task.ts` on 23 November 2026, from Botbench at commit `d6f7b316bf24d81431ed132148ccefae283080b0` with its own data folder, a practice repository at `/private/tmp/botbench-try`, the workbench name `your-mac`, and one real Claude Code reply (Haiku). The frames are screenshots of the real screens, shown for as long as each was on screen; nothing on them was edited and nothing is played faster. Sign-in happens before the recording starts, so the login token is not on it. `first-task-phone.json` holds the task, the branch and the commit the run made.

| File | SHA-256 |
|---|---|
| `assets/media/first-task-phone.mp4` | `e9bc52b040a9b30f4013176e217f89f5ba85b924f381fdf5d794923dfbb22235` |
| `assets/media/first-task-phone-poster.jpg` | `f186d7bb7efadef1c6c27b9f2404b6d46f9b159b140cd2bfa5d636e2213834c4` |
| `assets/media/first-task-phone.json` | `36d2939c6a5735d5bedbbebd145736bd52bd8de519926b7714688c99ff567a73` |
