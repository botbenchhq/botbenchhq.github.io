# Rehearsal: Before the second pull request

Gold: `linear` (a wide hero, 900 to 1100 design width, a window run off the
bottom with realistic words only on the story) and `window-row` (two sessions
side by side, focus by depth), with `overlap` for the satellite on a structural
edge and `choreography` for content changing in place inside one frame. Kept:
the wide stage at 1:1 design size, windows from the kit (`Window`), `States`
for every status word, `Badge`, `Button`, `Check`, `Spinner`, `Connector`,
`play="once"` with the payoff as `poster`, keyed Replay. Changed: the
Botbench theme (Graphite + Glacier, dark) in place of the kit's look; three
office-mac screens swapped in one window; no camera; ties fade instead of
drawing on; every story transition is transform and opacity, 160 to 450 ms,
`cubic-bezier(0.2, 0, 0, 1)`, no blur and no overshoot (BRIEF.md, upstream
overrides).

Beats, measured from the stage's marks in Chromium (`beat-timings-*.txt` in the
evidence folder): wide 16.5 s to the resting frame, compact 17.4 s (it opens on
studio-mac first).

| Beat | Wide | Compact | What happens |
|---|---|---|---|
| 0 | 0 s | 0 s | studio-mac is Working on issue #42; its claim `botbench/claims/issue-42` is on the remote; office-mac shows issue #42 with Open a pull request chosen |
| 1 | 1.1 s | 1.4 s | (compact: the track carries office-mac in) the cursor presses Send; the button reads Starting; office-mac's run opens, Working |
| 2 | 3.2 s | 4.0 s | office-mac's push meets the claim (the row lights; a tie from "Botbench pushes its branch" to it); the run rolls to Cancelled, with the run's status line and the claim sentence; held 3 s |
| 3 | 7.0 s | 7.8 s | studio-mac's task is Accepted and pull request #12 appears on the remote; office-mac's task for #43 is Ready for review; the overlap line fades in under the changed file, tied to #12 |
| 4 | 10.6 s | 11.5 s | the cursor presses Check together with pull request #12; Checking together for 1.2 s; Passed together: Merged cleanly, and every check passed on the merge |
| 5 | 15.1 s | 16.0 s | the cursor presses Accept; Ready for review rolls to Accepted; the scene rests on the payoff (16.5 s / 17.4 s), and Pause becomes Play |

Captured: widths 1280 (wide, scaled 1.15 by `fill`) and 390 (compact, 358);
the reduced-motion still at 1280; every beat at `--slow 10`; ffmpeg contact
sheets of the host at 500 ms (1280 dark, 390 light); the page screenshots at
358, 390, 768, 1280 and 1440 in both themes from `tools/check-browser.mjs`.
Evidence: `~/claude-remote/pmx/evidence/scene/`.

Gate: `node third_party/stageshow/scripts/film.mjs ".../coordination.html" --select ".bb-stage" --gate`
ends `rehearsal passed` at 1280 and at 390, on the reduced-motion still, and
on each beat at `--slow 10`.

Film lines on the way (each fixed, then re-filmed):

- `framing: narrower than tall` (both windows tall): the layout became
  studio-mac as a short whole window over the remote, office-mac a bled hero
  wider than it shows tall; compact shows 346 × 346 of its window.
- `framing: corner bleed gutter`: the remote card straddles office-mac's left
  edge as its satellite; studio-mac and the remote bleed off the left (their
  traffic lights are cropped, never words).
- `kit override` on `.ss-check__fill`: a false positive from bundling the
  kit's CSS into the scene's file; the kit's styles now ship in
  `assets/kit/stageshow.css` so the check can tell them apart.
- `uneven gutters`, `loose stack`, `uneven inset` (title bar, claim highlight
  ring), `half-pixel glyph` (spinner 13 → 14), `touching` (badge and outcome
  line now a flex pair), `lands on a transform` (resting layers keep
  `will-change: transform`), `jump` on the ties (they now show only after both
  ends have landed), `covers` (the cursor aims beside "Send").

Candidates left: `appears, then moves: span.ss-states__item … 146%` on
beats 1 and 2 at `--slow 10`. Looked at frame by frame: it is the kit's
`States` label inside the pressed Send button and the run's status pill
while the office-mac screen rises 8 px; nothing reads as a pop. Not fixed.
`manual: same-box content change: ss-connector`: the tie fades in place, by
design.

Review: no separate fresh-eye reviewer was run (references/review.md).

Assumptions: the remote card's words ("GitHub remote", "Pull requests",
"None open", "Open", the time beside the claim) are GitHub's side, not
Botbench's; the issue and task titles and `github.com/billing/billing-api`
are the example's.

Not checked: Safari and Firefox (Chromium only, through Playwright); a real
phone's touch; live frame pacing on a slow device; a screen reader reading the
page (the stage is one `role="img"` with a summary, checked by axe only).
