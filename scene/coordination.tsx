// "Before the second pull request": two workbenches, one GitHub remote.
//
// An authored illustration built with the Stageshow kit (third_party/stageshow,
// MIT, pinned in PROVENANCE.md). Every string inside a window is Botbench's own
// wording, copied verbatim from botbenchhq/botbench at the commit PROVENANCE.md
// names:
//   - the claim sentence: src/engine/claims.ts holderWords + the withdrawn
//     detail, with the time format of claimTimeWords (src/engine/claim-branch.ts)
//   - the run's status line: e2e/northstar.e2e.ts (run-status)
//   - the overlap line: web/src/app/peers.ts overlapLines
//   - Check together: web/src/app/check-together.ts and
//     web/src/components/check-together.tsx
//   - "Accept keeps the branch. Nothing is pushed or merged.":
//     web/src/screens2/review/decision-panel.tsx
// The captions under the stage are the site's, not the product's.
//
// Beats (wide): 1 office-mac's owner starts a run from issue #42 set to open a
// pull request; 2 studio-mac's claim is already on the remote, office-mac's run
// stops; 3 office-mac takes issue #43, its task is ready for review and the
// overlap with studio-mac's pull request #12 shows under the changed files;
// 4 Check together with pull request #12, Passed together; 5 Accept, both
// branches intact. Plays once; the poster is the payoff.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Stage } from '../third_party/stageshow/kit/stage'
import { Window, Bar } from '../third_party/stageshow/kit/window'
import { Badge } from '../third_party/stageshow/kit/controls/Badge'
import { Button } from '../third_party/stageshow/kit/controls/Button'
import { States } from '../third_party/stageshow/kit/motion/States'
import { Connector } from '../third_party/stageshow/kit/motion/Connector'
import { Spinner } from '../third_party/stageshow/kit/parts/Spinner'
import { Check } from '../third_party/stageshow/kit/parts/Check'
import { useReducedMotion } from '../third_party/stageshow/kit/reduced-motion'
import type { Act } from '../third_party/stageshow/kit/act'
import type { Layout } from '../third_party/stageshow/kit/looks'
import type { Rect } from '../third_party/stageshow/kit/measure'
import './coordination.css'

/* ---------- The product's words ---------- */

const ISSUE = 42
const OTHER_ISSUE = 43
const PR = 12
const CLAIM_BRANCH = `botbench/claims/issue-${ISSUE}`
const STUDIO_TIME = '14:14:07 UTC on 2026-11-25'
const OFFICE_TIME = '14:15:02 UTC on 2026-11-25'
// holderWords(...) + ", so this run stopped: ..." (src/engine/claims.ts:266,506)
const WITHDRAWN = `studio-mac started on issue #${ISSUE} at ${STUDIO_TIME}, before this workbench did (${OFFICE_TIME}), so this run stopped: when two workbenches start on one issue, the earliest claim goes ahead. The remote refused this workbench's claim, so nothing of this run was pushed.`
const RUN_STOPPED = 'Cancelled. Nothing was built, and no task was made from this run.'
// overlapLines (web/src/app/peers.ts:157)
const OVERLAP = `studio-mac's open pull request #${PR} also changes calc.py, so the two may conflict when both are merged.`
const CHECK_BUTTON = `Check together with pull request #${PR}`
const CHECKING = `Checking together with pull request #${PR}.`
const PASSED_WORD = 'Passed together:'
const PASSED_LINE = 'Merged cleanly, and every check passed on the merge.'
const OTHERS_CODE = `Includes another workbench's code: studio-mac's pull request #${PR}, which nobody here reviewed. It ran in the same sandbox as this task's checks.`
const ACCEPT_LINE = 'Accept keeps the branch. Nothing is pushed or merged.'
const STUDIO_TASK_BRANCH = 'botbench/studio-mac/run-3/task-5'
const OFFICE_TASK_BRANCH = 'botbench/office-mac/run-5/task-9'

/* ---------- The site's captions, one per beat ---------- */

export const CAPTIONS = [
  'Two workbenches, one repository. studio-mac is already working on issue #42.',
  'office-mac’s owner starts a run from issue #42, set to open a pull request.',
  'studio-mac claimed issue #42 first, so office-mac’s run stops before it builds anything.',
  'office-mac takes issue #43 instead. Its task is ready for review, and it changes a file that studio-mac’s open pull request #12 changes too.',
  'Check together: Botbench merges both in a temporary copy and runs the repository’s own check on the merge.',
  'You found out before either was merged. Both branches are still there to decide on.',
]
export const SUMMARY =
  'Illustration of two Botbench workbenches on one GitHub repository. office-mac starts a run from issue #42; studio-mac had claimed it first, so office-mac’s run stops. office-mac takes issue #43; its task is ready for review and Botbench notes that studio-mac’s open pull request #12 also changes calc.py. The owner checks the two together: they pass together. The owner accepts, and both branches stay.'

/* ---------- Scene state ---------- */

type Screen = 'compose' | 'run' | 'task'
type S = {
  beat: number
  focus: 'studio' | 'office' // compact: which workbench is in view
  screen: Screen
  sending: boolean
  claimTry: boolean // office-mac's push meets the claim on the remote
  stopped: boolean
  studioDone: boolean // studio-mac's task accepted, pull request #12 open
  overlap: boolean
  ties: 0 | 1 | 2 // which tie to the remote shows, drawn once both ends are still
  check: 'offer' | 'running' | 'passed'
  accepted: boolean
}

const initial: S = { beat: 0, focus: 'studio', screen: 'compose', sending: false, claimTry: false, stopped: false, studioDone: false, overlap: false, ties: 0, check: 'offer', accepted: false }
export const poster: S = { beat: 5, focus: 'office', screen: 'task', sending: false, claimTry: false, stopped: true, studioDone: true, overlap: true, ties: 0, check: 'passed', accepted: true }

/* ---------- Host-controlled pause ---------- */

// The kit's Stage has no pause. Every wait in the script goes through hold(),
// which waits in short slices and blocks while the gate is closed (paused by
// the viewer, or not yet far enough into view). A transition already started
// finishes (each is at most 450 ms); the scene then holds still.
type Gate = { closed: () => boolean; onBeat: (n: number) => void; onDone: () => void }

const SLICE = 50

function makeScript(gate: Gate) {
  return async function script(a: Act<S>) {
    const compact = a.layout === 'compact'
    const hold = async (ms: number) => {
      let left = ms
      while (left > 0 || gate.closed()) {
        if (gate.closed()) {
          await a.wait(SLICE)
          continue
        }
        const step = Math.min(SLICE, left)
        await a.wait(step)
        left -= step
      }
    }
    const beat = (n: number) => {
      gate.onBeat(n)
      a.mark(`beat-${n}`)
    }

    beat(0)
    await hold(compact ? 1300 : 1000)

    // 1. office-mac's owner sends a run from issue #42, set to open a pull request
    beat(1)
    if (compact) {
      a.put({ focus: 'office' })
      await hold(500)
    }
    await a.move({ at: 'send', x: 0.86, y: 0.7 }, { duration: 450 })
    await hold(150)
    await a.click()
    a.put({ sending: true })
    await hold(350)
    a.put({ screen: 'run', sending: false })
    await a.move({ at: 'rest-end', x: 0.5, y: 0.5 }, { duration: 450 })
    await hold(500)

    // 2. Its claim meets studio-mac's on the remote, and the run stops
    beat(2)
    a.put({ claimTry: true, ties: 1 })
    await hold(700)
    a.put({ stopped: true })
    await hold(3000)

    // 3. studio-mac's task is accepted and pull request #12 opens; office-mac's
    // owner takes issue #43, whose task reaches Ready for review
    beat(3)
    a.put({ claimTry: false, ties: 0, studioDone: true })
    await hold(600)
    a.put({ screen: 'task' })
    await hold(500)
    a.put({ overlap: true })
    await hold(450)
    a.put({ ties: 2 })
    await hold(2000)

    // 4. Check together with pull request #12
    beat(4)
    await a.move({ at: 'check-together', x: 0.86, y: 0.6 }, { duration: 450 })
    await hold(150)
    await a.click()
    a.put({ check: 'running', ties: 0 })
    await hold(1200)
    a.put({ check: 'passed' })
    await hold(1800)

    // 5. Accept
    await a.move({ at: 'accept', x: 0.72, y: 0.62 }, { duration: 450 })
    await hold(150)
    await a.click()
    a.put({ accepted: true })
    beat(5)
    await a.move({ at: 'rest-end', x: 0.5, y: 0.5 }, { duration: 450 })
    await hold(900)
    gate.onDone()
  }
}

/* ---------- Pieces ---------- */

const Mono = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <code className={`bb-mono ${className}`}>{children}</code>

// A branch name may break after a slash, never inside a word.
const branch = (name: string) => name.split('/').flatMap((part, i, all) => (i < all.length - 1 ? [<span key={i} className="bb-seg">{part}/</span>, <wbr key={`w${i}`} />] : [<span key={i} className="bb-seg">{part}</span>]))

function StudioMac({ s }: { s: S }) {
  return (
    <div className="bb-pane bb-studio">
      <div className="bb-crumbs">
        <span>Work</span>
        <span className="bb-sep">/</span>
        <span className="bb-strong">Run 3 · billing-api</span>
        <States
          value={s.studioDone ? 'done' : 'working'}
          align="start"
          states={{ working: <Badge tone="accent" dot>Working</Badge>, done: <Badge tone="success">Accepted</Badge> }}
        />
      </div>
      <div className="bb-title">Invoice totals come out too low</div>
      <div className="bb-meta">Issue #{ISSUE}</div>
      <div className="bb-card bb-studio-task">
        <div className="bb-row">
          <Check on={s.studioDone} pending={!s.studioDone} size={14} />
          <span className="bb-strong">Make add in calc.py return the sum</span>
        </div>
        <div className="bb-studio-sub">
          <div className="bb-studio-pr" data-on={!s.studioDone || undefined}>Claude Code</div>
          <div className="bb-studio-pr" data-on={s.studioDone || undefined}>
            The branch is on origin, and Botbench opened pull request #{PR} into main. Nothing was merged.
          </div>
        </div>
      </div>
    </div>
  )
}

function Remote({ s, layout }: { s: S; layout: Layout }) {
  return (
    <div className="bb-remote" data-layout={layout}>
      <div className="bb-remote-head">
        <span className="bb-remote-kind">GitHub remote</span>
        <span className="bb-strong">billing-api</span>
      </div>
      <div className="bb-remote-rows">
        {layout === 'wide' && (
          <div className="bb-ref">
            <Mono>main</Mono>
          </div>
        )}
        <div className="bb-ref" data-target="claim-ref" data-hit={s.claimTry || undefined}>
          <Mono>{branch(CLAIM_BRANCH)}</Mono>
          <span className="bb-ref-meta"><span className="bb-peer">studio-mac</span> · {STUDIO_TIME.slice(0, 8)} UTC</span>
        </div>
      </div>
      <div className="bb-remote-prs">
        <span className="bb-remote-kind">Pull requests</span>
        <div className="bb-pr" data-target="pr-ref" data-on={s.studioDone || undefined}>
          <span className="bb-pr-dot" aria-hidden />
          <div>
            {layout === 'wide' && <div className="bb-strong">Make add in calc.py return the sum</div>}
            <div className="bb-ref-meta">#{PR} · <span className="bb-peer">studio-mac</span> · Open</div>
            <Mono>{branch(STUDIO_TASK_BRANCH)}</Mono>
          </div>
        </div>
        <div className="bb-pr-none" data-on={!s.studioDone || undefined}>None open</div>
      </div>
    </div>
  )
}

function Compose({ s, on }: { s: S; on: boolean }) {
  return (
    <div className="bb-screen bb-compose" data-on={on || undefined}>
      <div className="bb-crumbs"><span className="bb-strong">New chat or task</span></div>
      <div className="bb-card bb-issue-card">
        <div className="bb-title bb-issue-title">Invoice totals come out too low</div>
        <div className="bb-meta">#{ISSUE} of github.com/billing/billing-api</div>
        <div className="bb-filler bb-filler-tight">
          <Bar w={300} h={6} tone={2} />
          <Bar w={260} h={6} tone={2} />
          <Bar w={180} h={6} tone={2} />
        </div>
      </div>
      <div className="bb-composer">
        <div className="bb-filler bb-filler-tight">
          <Bar w={220} h={6} tone={2} />
        </div>
        <div className="bb-composer-foot">
          <span className="bb-chip">Claude Code</span>
          <span className="bb-chip" data-picked>Open a pull request</span>
          <span className="bb-spacer" />
          <Button variant="primary" data-target="send" className="bb-send">
            <States value={s.sending ? 'starting' : 'send'} states={{ send: 'Send', starting: 'Starting' }} />
          </Button>
        </div>
      </div>
    </div>
  )
}

function RunScreen({ s, on, layout }: { s: S; on: boolean; layout: Layout }) {
  return (
    <div className="bb-screen" data-on={on || undefined}>
      <div className="bb-crumbs">
        <span>Work</span>
        <span className="bb-sep">/</span>
        <span className="bb-strong">Run 4 · billing-api</span>
        <States
          value={s.stopped ? 'stopped' : 'working'}
          align="start"
          states={{ working: <Badge tone="accent" dot>Working</Badge>, stopped: <Badge>Cancelled</Badge> }}
        />
      </div>
      <div className="bb-title">Invoice totals come out too low</div>
      {layout === 'wide' && <div className="bb-meta" data-target="run-meta">Issue #{ISSUE} · Botbench pushes its branch and opens a pull request</div>}
      <div className="bb-stopped" data-on={s.stopped || undefined}>
        <p className="bb-strong" data-target="run-status">{RUN_STOPPED}</p>
        <div className="bb-card bb-claim" data-target="claim-line">
          <span className="bb-label">Issue claim</span>
          <p>{WITHDRAWN}</p>
        </div>
      </div>
    </div>
  )
}

function TaskScreen({ s, on, layout }: { s: S; on: boolean; layout: Layout }) {
  const compact = layout === 'compact'
  return (
    <div className="bb-screen bb-task" data-on={on || undefined}>
      <div className="bb-crumbs">
        <span>Work</span>
        <span className="bb-sep">/</span>
        <span className="bb-strong">Task 9 · billing-api</span>
        <States
          value={s.accepted ? 'accepted' : 'ready'}
          align="start"
          states={{ ready: <Badge tone="warning">Ready for review</Badge>, accepted: <Badge tone="success">Accepted</Badge> }}
        />
      </div>
      <div className="bb-title">Round invoice totals to cents</div>
      {!compact && (
        <div className="bb-meta">
          Issue #{OTHER_ISSUE} · Branch <Mono>{branch(OFFICE_TASK_BRANCH)}</Mono>
        </div>
      )}
      {!compact && (
        <div className="bb-tabs">
          <span data-active>Review</span>
          <span>Activity</span>
          <span>Files 1</span>
        </div>
      )}
      <div className="bb-card bb-evidence">
        {!compact && (
          <div className="bb-row">
            <Check on size={14} />
            <span className="bb-strong">1 of 1 check passed</span>
          </div>
        )}
        <div className="bb-row bb-file">
          <Mono>calc.py</Mono>
          <span className="bb-spacer" />
          <span className="bb-add">+4</span>
          <span className="bb-del">−1</span>
        </div>
      </div>
      <p className="bb-overlap" data-target="overlap" data-on={s.overlap || undefined}>
        {OVERLAP}
      </p>
      <div className="bb-together">
        {!compact && <div className="bb-together-head bb-strong">Check together</div>}
        <div className="bb-together-slot" data-state={s.check}>
          <div className="bb-together-offer" data-on={s.check === 'offer' || undefined}>
            <Button size="small" data-target="check-together">{CHECK_BUTTON}</Button>
          </div>
          <p className="bb-together-running" data-on={s.check === 'running' || undefined}>
            <Spinner size={14} />
            {CHECKING}
          </p>
          <div className="bb-together-result" data-on={s.check === 'passed' || undefined}>
            <p className="bb-outcome">
              <Badge tone="success">{PASSED_WORD}</Badge>
              <span>{PASSED_LINE}</span>
            </p>
            {!compact && <p className="bb-muted">{OTHERS_CODE}</p>}
          </div>
        </div>
      </div>
      <div className="bb-foot">
        <span className="bb-foot-line">{ACCEPT_LINE}</span>
        <div className="bb-foot-actions">
          <Button>Reject</Button>
          <Button variant="primary" data-target="accept">Accept</Button>
        </div>
      </div>
    </div>
  )
}

function OfficeMac({ s, layout }: { s: S; layout: Layout }) {
  return (
    <div className="bb-pane bb-office">
      <Compose s={s} on={s.screen === 'compose'} />
      <RunScreen s={s} on={s.screen === 'run'} layout={layout} />
      <TaskScreen s={s} on={s.screen === 'task'} layout={layout} />
    </div>
  )
}

function Scene({ s, rect, layout }: { s: S; rect: (name: string) => Rect; layout: Layout }) {
  const compact = layout === 'compact'
  // Ties drawn only once their ends are on screen
  const claim = rect('run-meta')
  const claimRef = rect('claim-ref')
  const overlap = rect('overlap')
  const prRef = rect('pr-ref')
  return (
    <>
      {compact ? (
        <>
          <Remote s={s} layout={layout} />
          <div className="bb-switch" aria-hidden>
            <span data-active={s.focus === 'studio' || undefined}><span>studio-mac</span></span>
            <span data-active={s.focus === 'office' || undefined}><span>office-mac</span></span>
          </div>
          <div className="bb-track" data-focus={s.focus}>
            <Window title="studio-mac" className="bb-win bb-win-studio">
              <StudioMac s={s} />
            </Window>
            <Window title="office-mac" className="bb-win bb-win-office">
              <OfficeMac s={s} layout={layout} />
            </Window>
          </div>
        </>
      ) : (
        <>
          <Window title="studio-mac" className="bb-win bb-win-studio">
            <StudioMac s={s} />
          </Window>
          <Remote s={s} layout={layout} />
          <Window title="office-mac" className="bb-win bb-win-office">
            <OfficeMac s={s} layout={layout} />
          </Window>
          <Connector
            className="bb-tie bb-tie-claim"
            show={s.ties === 1}
            route="curve"
            from={{ x: claim.x, y: claim.y + claim.height / 2 }}
            to={{ x: claimRef.x + claimRef.width, y: claimRef.y + claimRef.height / 2 }}
          />
          <Connector
            className="bb-tie bb-tie-overlap"
            show={s.ties === 2}
            route="curve"
            from={{ x: overlap.x, y: overlap.y + 10 }}
            to={{ x: prRef.x + prRef.width, y: prRef.y + prRef.height / 2 }}
          />
        </>
      )}
      <div className="bb-rest" data-target="rest-end" />
    </>
  )
}

/* ---------- The host: stage, caption and controls ---------- */

function useInView(ref: React.RefObject<HTMLElement>, threshold: number) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= threshold), { threshold: [0, threshold] })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
  return inView
}

const PlayIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M7 4.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L7.9 4.3a.6.6 0 0 0-.9.5z" fill="currentColor" /></svg>
)
const PauseIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><rect x="5.5" y="4.5" width="3" height="11" rx="1" fill="currentColor" /><rect x="11.5" y="4.5" width="3" height="11" rx="1" fill="currentColor" /></svg>
)
const ReplayIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4.5 10a5.5 5.5 0 1 0 1.7-4" /><path d="M4.2 3.5v3h3" /></svg>
)

function CoordinationScene() {
  const host = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(host, 0.45)
  const [take, setTake] = useState(0)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)
  const [beat, setBeat] = useState(0)
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const inViewRef = useRef(inView)
  inViewRef.current = inView
  const hostEl = host.current
  if (hostEl) hostEl.toggleAttribute('data-paused', paused)

  const script = useMemo(
    () =>
      makeScript({
        closed: () => pausedRef.current || !inViewRef.current,
        onBeat: setBeat,
        onDone: () => setDone(true),
      }),
    [take], // a fresh script per take, so Replay starts clean
  )

  const replay = useCallback(() => {
    setPaused(false)
    setDone(false)
    setBeat(0)
    setTake((n) => n + 1)
  }, [])
  const toggle = useCallback(() => {
    if (done) return replay()
    setPaused((p) => !p)
  }, [done, replay])

  const caption = reduced ? CAPTIONS[5] : CAPTIONS[beat]
  const playing = !paused && !done

  return (
    <div className="bb-scene" ref={host} data-paused={paused || undefined} data-reduced={reduced || undefined}>
      <div className="bb-stage-wrap" role="img" aria-label={SUMMARY}>
        <Stage<S>
          key={take}
          width={1040}
          height={568}
          compact={{ below: 640, width: 358, height: 482 }}
          initial={initial}
          poster={poster}
          script={script}
          play="once"
          fill
          theme="dark"
          cursor={{ at: { wide: { x: 780, y: 470 }, compact: { x: 340, y: 210 } }, style: 'real', idle: 2500 }}
          className="bb-stage"
        >
          {(s, rect, layout) => <Scene s={s} rect={rect} layout={layout} />}
        </Stage>
      </div>
      <div className="bb-bar">
        <p className="bb-caption" data-beat={reduced ? 5 : beat}>
          {!reduced && <span className="bb-step">{`${Math.max(beat, 1)} of 5`}</span>}
          {caption}
        </p>
        {reduced ? (
          <p className="bb-reduced-note">Showing the last step without motion, as your system asks.</p>
        ) : (
          <div className="bb-controls">
            <button type="button" className="bb-control" onClick={toggle} data-scene-toggle>
              {playing ? <PauseIcon /> : <PlayIcon />}
              <span>{playing ? 'Pause' : 'Play'}</span>
            </button>
            <button type="button" className="bb-control" onClick={replay} data-scene-replay>
              <ReplayIcon />
              <span>Replay</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Mount ---------- */

function mount() {
  document.querySelectorAll<HTMLElement>('[data-scene-mount="coordination"]').forEach((el) => {
    if (el.dataset.mounted) return
    el.dataset.mounted = 'true'
    el.replaceChildren()
    createRoot(el).render(<CoordinationScene />)
  })
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true })
else mount()
