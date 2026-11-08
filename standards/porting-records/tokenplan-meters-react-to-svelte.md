# TokenPlan Meters and Controls: React → Svelte

## Acceptance Boundaries — Read First

This is bounded library and TokenPlan fixture acceptance, not release approval.
Real accounts, actual OS permissions/notification delivery/terminal launch,
Windows/Linux physical desktops, physical touch and real screen-reader behavior
remain unverified. Library SSR/hydration and generic rolling digits are also
outside the verified scope; TokenPlan uses animateReadout=false.

## 1. Scope and Provenance

- Standard: COMPONENT_PORTING.md 1.0; date: 2026-11-07; no independent review yet.
- Status: required application-scope native implementation and bounded verification delivered; **not full generic-source parity or wider accessibility/cross-browser certification**. The rejected static ruler has been replaced with actual tape physics; only rolling digits remain explicitly unsupported for the app's animateReadout=false scope.
- Source: `onevalar/token-plan`, revision `c588b28cc1a19a1bdd5964db5c791e2ec66d5ec4`, `platforms/tauri/src/components/arc/`.
- Reviewed only free MIT implementations: gauge, waffle-chart, static-donut, sparkline/static-sparkline, ruler-slider, segmented-control, confirm-morph, Button (focus follow-up) and their actual callers. The comparison executes their unchanged contents at the pinned revision. The app concurrently removed its React files; the launcher extracts only an exact free-source allowlist into ignored Valar scratch space without restoring or modifying TokenPlan.
- Copyright (c) 2026 Elia Kuratli; each adapted registry directory retains the full MIT notice in LICENSE.md so registry and package distribution carry it.
- TickMeter is independently authored from the user's product requirements. No Arc Pro tick-ring source, CSS or geometry was read, copied or translated. It is not an Arc port.
- TextureFill additionally adapts MIT TokenPlan `platforms/tauri/src/DitherFill.tsx` at that revision; the in-progress native app `src/svelte/usage/DitherFill.svelte` was read as input, never edited. Its own LICENSE.md retains Robin Ebers / onevalar notices; this is not Arc code.
- Target: Svelte 5.57.2 runes for Valar checks; browser harness uses app-installed Svelte 5.57.3. Existing Bits UI 2.20.0; Node 24.22.2 and pinned `npx --yes pnpm@12.14.0`. No production dependency additions or existing version changes. Do not use/repair the broken global Corepack shim.
- Source browser runtime: React / ReactDOM 19.3.1, Motion 14.4.0, Lucide React 1.60.0, pinned from source package-lock in an isolated ignored comparison-only installation. Vite 7.3.7, Svelte plugin 6.2.4, Tailwind 4.3.3 from the sibling app. Neither runtime installation nor the harness is part of the shipped library.
- Existing equivalents: ToggleGroup for segmented selection; existing Collapsible covers disclosures. Valar Slider cannot model translated tape, elastic boundaries or catching momentum; RulerSlider therefore uses a component-local native RAF controller, not a duplicate absolute-position Slider. Existing Slider separately preserves the app's keyboard contract.
- Visual scope: Valar semantic tokens, native Svelte attributes/events and snippets; no React, Motion or Arc runtime in the deliverable.

## 2. Capability Contract (Before Implementation)

| Source | Target | Scope / Intentional Difference | Evidence |
| --- | --- | --- | --- |
| Gauge / GaugeArc | gauge: Gauge / GaugeArc | Static 270° arc; null supported by SVG-only GaugeArc; bounded graphic/ARIA range, overflow retained in visible number/valueText; danger/accent | Pass: DOM tests and browser zero/overflow/missing |
| WaffleChart | waffle-chart: WaffleChart | Stable largest-remainder 100-cell allocation, bottom-left column order; caller label; zero total empty | Pass: DOM allocation/empty and browser |
| StaticDonut / DonutPart | donut-chart: StaticDonut / DonutPart | Fixed denominator, no renormalization, precise annular sectors; decorative; caller validates data and supplies legend | Pass: geometry DOM tests; mounted in both browser panes |
| StaticSparkline | sparkline: StaticSparkline | Calendar slots, zero baseline, null gaps, isolated points; decorative | Pass: DOM tests; both panes mounted |
| RulerSlider | ruler-slider: RulerSlider | value/bind:value/onValueChange/onValueCommit, bounds/step, format/unit/name/disabled; fixed needle and translated tape, inverse spacing-scaled drag, tap spring, flick inertia, rubber band/catch/settle, horizontal wheel, cancellation and live reduced-motion cleanup. animateReadout only accepts false; rolling digits are explicitly unsupported. | Pass: 8 focused tape/gesture/wheel/resource tests plus 22 matched original/target Chromium cases (normal/reduced). Exact distance, bounds, final ticks and commits match; frame event samples vary naturally. Original external reset during coast loses its requested value; native target correctly honors the external value without stale commit. See §7. |
| SegmentedControl | segmented-control: SegmentedControl | ToggleGroup composition; string options/value/bind:value/onValueChange, label, accessory snippets, intent callback; cannot deselect current choice; arrows/Home/End select; no Motion layout animation. Bits single selection uses radio/aria-checked instead of source button/aria-pressed; repeat selection emits no duplicate change callback. | Pass for stated target contract: DOM keys/cannot-clear and real pointer selection. Explicit semantic/event differences, no whole-source parity claim. |
| ConfirmMorph | confirm-action: ConfirmAction | Inline idle/confirming/pending/done/error, press/hold/countdown, cancel/Escape/outside, async error/retry/undo, localized labels, fullWidth/disabled/defaultState, timeout pauses and safe teardown; native state/snippets/events plus independently authored size/radius/content feedback, never Arc animation code/parameters | Pass for tested state behavior: DOM race/cancel/retry/countdown/focus/timeouts and browser promise success/undo/failure/Escape. fullWidth idle fills available width with a minimum 44px hit target. Entry focus stays on Confirm, Shift+Tab reaches Cancel. Native Spinner stays visible but stops under reduced motion. Space starts hold; early release cancels. Independent visual-adaptation evidence is in §8, not an equivalence claim. Real-device hold interaction remains unverified. |
| Product requirements only | tick-meter: TickMeter | Exactly 60 SVG line ticks; bounded graphic/aria-valuenow; visible number and exact valueText preserve raw overflow; accent/danger; no missing state, motion or celebration. Clamped ARIA supersedes the original raw-ARIA request per the user's clarified integration requirement. | Pass: 0/50/100/140/negative DOM cases, browser 125% valueText with aria-valuenow=100 and 60 lines. Independent provenance retained. |
| DitherFill | texture-fill: TextureFill | dither/lines/halftone/hatch/solid, value/class/intro, spring, resize/DPR cap3, currentColor, live reduced motion, full cleanup; no app preference helpers | Pass: 8 Canvas-mocked tests and actual 5-texture canvas rendering on both browser sides. No frame-time/pixel-equality claim. |

## 3. State and Integration

- Read-only graphics have no internal interaction state, timers or browser globals.
- Scalar/selection controls follow Valar value/bind:value/onValueChange conventions; callbacks only on actual user changes, not external updates. No React-style onClick; native onclick attributes forward normally.
- ConfirmAction uses a single native state machine. Pending actions are single-flight; stale completions after external state changes or teardown are ignored. A controlled state parent must acknowledge onStateChange; switching controlled mode while mounted is unsupported.
- Form behavior is scoped to RulerSlider's numeric hidden name/value; no required/invalid text editing is invented. Confirmation/segmented buttons are type=button.
- All meter accessible names/valueText and action copy come from caller props. Decorative charts require an external accessible legend.
- TextureFill uses client effects only. Replacing texture disposes its previous renderer; value changes update the current renderer. Reduced-motion changes cancel RAF and snap, resize updates backing pixels, ancestor attribute changes recolor. Canvas failure throws explicitly. SSR shell is intentional but server/hydration execution is not verified here.
- Existing Slider forwards aria-valuetext onto the actual thumb. Its scalar/numeric-step keyboard contract now handles all four arrows, Shift+arrows/Page by largeStep (default 2×step), and Home/End at the exact bounds, with one change then one commit per actual edit. Alt/Ctrl/Meta combinations bubble unchanged without preventing app/browser shortcuts. Multiple thumbs and irregular steps retain Bits movement. RulerSlider's tape viewport implements its own matching key behavior with largeStep defaulting to the labelled interval. Workbench inventory lists new components but does not falsely mark new tuning panels ready.

## 4. Acceptance Matrix

| Dimension | Applicability / Scenarios | Result |
| --- | --- | --- |
| State/data | All: zero, overflow, null where specified; controls: disabled, external changes; action rejection/retry/cancellation | Pass for scoped 45 tests and 7 broad + 22 ruler + 16 confirmation/focus browser combinations; source defects separately recorded |
| Form | RulerSlider: numeric named value and disabled omission; others not form fields | Pass DOM tests; native form.reset is not supported, reset bound value explicitly |
| Keyboard/focus | Slider keys; segmented roving selection; action cancellation/focus continuity | Pass DOM cases and browser scalar all-arrow/Shift/Page/Home/End/modifier checks, ruler ArrowRight/external update, Confirm-first → Shift+Tab Cancel and Escape. Complete app Tab traversal and hold on real hardware unverified |
| Accessibility | Meter semantics, explicit labels, decorative charts, action live status | Pass DOM semantics and browser clamped TickMeter ARIA with exact overflow valueText. Actual screen-reader speech unverified |
| IME/i18n/RTL | No editable text/IME; caller-formatted numbers and localized copy | IME not applicable; English/localized examples type-check, browser RTL dark/320px renders; long-label and RTL keyboard matrix unverified |
| Touch/pointer | Option/confirmation clicks, spacing-scaled ruler gestures/wheel | Pass real mouse drag/browser wheel plus captured timestamped flick/cancel/lostcapture/catch cases in both implementations. Real touch hardware remains unverified |
| Async/lifecycle | Duplicate submits, rejection, retry, stale resolution, timeout and cleanup; Canvas resources | Pass targeted DOM/mocked tests plus actual async success/undo/failure in both frameworks |
| SSR/hydration | Deterministic graphic geometry/IDs; client Canvas effects | Unverified: no SSR/hydration run; no server compatibility claim from client compilation |
| Overlays/layout | No portals/modal/scroll lock; inline confirmation and segmented overflow | Portal checks not applicable; light/dark 320/480/720px fixtures render; app nesting not independently retested |
| Visual/adaptation | Valar themes, narrow widths, reduced motion | Pass bounded inspected captures, browser fullWidth idle ≥44px and stopped pending Spinner under reduce; colors/radii/ruler/confirmation layouts intentionally differ. No pixel or contrast certification; zoom unverified |
| Performance/resources | Static 60 SVG ticks / 100 waffle cells / bounded scale labels; timers, observers and RAF | Pass resource cleanup mocked tests and finite structure checks; actual performance/memory profiling unverified |
| Security/privacy | No HTML injection, links, requests, credentials, analytics | Pass source boundary inspection: no added network/service/runtime bridge; comparison uses same-origin URL fixtures, no postMessage |
| Types/dependencies | Package build/check, public subpaths, compiler | Pass latest shared package tests2/check0 warnings; docs205 across21 files/check0 warnings; focused generator28. Earlier build:cli success had existing bundler/publint advisory output |
| Distribution/integration | Registry files/dependency closure; packed consumer | Pass registry generation and closure assertions. Supervisor independently reported TokenPlan sync/tarball installation and build/check0 errors; not rerun per instruction. App behavior/acceptance remains with app task. |

## 5. Reproducible Evidence

Executed on macOS Darwin 27.2.0 arm64, 2026-11-07. Browser: existing Chromium 147.0.7727.15, no downloads. Browser emulates prefers-reduced-motion=reduce, system font, shared source/target fixtures; default timezone, no random or service inputs. No assistive-technology device attached.

All pnpm commands used Node `~/.nvm/versions/node/v24.22.2/bin` on PATH and `npx --yes pnpm@12.14.0`:

| Command / Evidence | Actual Result |
| --- | --- |
| `pnpm build:cli` | Pass: CLI, primitives, addons and shared UI generated. Existing tsdown Zod CommonJS-declaration / dependency-bundling advisories and publint repository URL suggestion; no failure. |
| `pnpm --filter @valar/svelte-ui test` | Pass 2/2; all public exports compile without docs aliases or undeclared runtime dependencies, watch lifecycle preserved. |
| `pnpm --filter @valar/svelte-ui check` | Pass 0 errors, 0 warnings. |
| `pnpm --filter docs test` | Latest pass 205/205 across21 files, including49 scoped meter/control/texture/confirmation/morph tests. Initial full run correctly caught missing workbench inventory entries; entries added without pretending tuning coverage. |
| `pnpm --filter docs check` | Pass 0 errors, 0 warnings; 133 translated documents match. Initial Sparkline SVG `values` type collision was fixed by omitting the native attribute from its public prop base. |
| `pnpm --filter docs build:registry` | Pass 801 items, schema validation, dependency discovery, catalog and Valar style JSON generated. Additional assertions verify all nine index/RULES/license-or-provenance files in registry and built package, implementation files and dependency closure; ConfirmAction discovers Button + Spinner. |
| `node standards/comparisons/tokenplan/check-browser.mjs` with documented TOKENPLAN_TEST_BROWSER | Pass 7 scenarios after latest integration fixes; errors array empty (favicon excluded). Covers fullWidth idle hit area, Confirm/Shift+Tab focus, stopped pending Spinner, scalar keyboard/modifiers and clamped TickMeter ARIA as well as original cases. JSON and inspected captures in `.amp/in/artifacts/tokenplan-browser.json`, `tokenplan-normal-light.png`, `tokenplan-overflow-dark.png`. |
| Formatting | Owned components/examples/tests/harness formatted with repository oxfmt; four existing modified code-block examples excluded and preserved. |

The real comparison lives in `standards/comparisons/tokenplan/`: unchanged MIT React imports left, actual generated Svelte public exports right, isolated iframe documents. Shared selectors reset both; each pane retains independent interactions and raw logs. Readiness checks inspect each mounted body and matching fixture URL, not merely iframe load. Source React dependencies and then implementations were removed concurrently from the app. The reproducible launcher now uses isolated ignored dependencies and exact Git-revision free-source extraction under `.amp/in/`; no TokenPlan files were changed and no Pro directory was extracted. See README for preparation/start/check/shutdown. Earlier runs interrupted by local HMR and missing source files were diagnosed, not accepted as passes; the recorded seven-case result is the final stable run.

Full docs site build, fresh browser install, native app build, screen-reader review, touch hardware and server/hydration were not run. Per supervisor instruction, do not duplicate the already executed application package sync/tarball installation.

## 6. Handoff

Implementation and registry source: `docs/src/lib/registry/ui/{gauge,waffle-chart,donut-chart,sparkline,ruler-slider,segmented-control,confirm-action,tick-meter,texture-fill}`. Each has index/types, meta, RULES and LICENSE or independent PROVENANCE; nine runnable registry examples and paired English/Chinese docs accompany them. Generated registry JSON contains notices as installable files, not only repository links. No global theme or existing dependency versions changed.

Public imports (existing package wildcard export; no new root export required):

| Import Subpath (`@valar/svelte-ui/…`) | Public Exports / Main Inputs |
| --- | --- |
| gauge | Gauge, GaugeArc; GaugeProps, GaugeArcProps. Gauge(value:number,label,valueText,tone?); Arc(value:number\|null,radius?,tone?). |
| waffle-chart | WaffleChart, WaffleChartProps, WaffleCategory. data:{key,value,color}[], label. |
| donut-chart | StaticDonut, StaticDonutProps, **type** DonutPart. parts:{key,value,color}[], total. DonutPart is a data type, not another visual component. |
| sparkline | StaticSparkline, StaticSparklineProps. values:(number\|null)[]. |
| ruler-slider | RulerSlider, RulerSliderProps. label; value/bind:value/defaultValue, onValueChange/onValueCommit, min/max/step/largeStep/majorEvery/spacing/format/unit/name/disabled; animateReadout?:false. |
| segmented-control | SegmentedControl, SegmentedControlProps, Segment. label/options, value/bind:value/onValueChange, onOptionIntent, disabled; accessory:Snippet. |
| confirm-action | ConfirmAction, ConfirmActionProps, ConfirmActionState, ConfirmActionMode. label, localized label props, onConfirm/onUndo/onCancel, controlled state+onStateChange or defaultState, press/hold/countdown, timeouts/tone/disabled/fullWidth, icon:Snippet, bind:ref. |
| tick-meter | TickMeter, TickMeterProps. value:number,label,valueText,tone?:accent\|danger. |
| texture-fill | TextureFill, TextureFillProps, textures, Texture, FillTexture. value,texture,intro?,class and native span attributes. |

Native event attributes use `onclick`, not onClick. Check/radio abstractions were not added; existing Valar primitives retain checked/onCheckedChange. Meter inputs require finite values; caller handles missing before mounting except GaugeArc null. Styling uses Valar semantic tokens. No source runtime, copied Pro code, application-specific provider logic or theme changes are shipped.

The earlier static-ruler deviation was explicitly rejected by the supervisor. The continuation below supersedes that scope; it is not an accepted regression. Broader SSR, touch and accessibility acceptance stays explicitly unverified. This work is local and unpublished: no commit, push, package publication or deployment performed.

## 7. Ruler Tape Continuation — Contract Before Implementation

Status: implemented and bounded matched verification passed. Source is the complete free MIT RulerSlider and CSS at the same revision, available in TokenPlan's ignored `react-baseline`. No Pro inputs.

Required: fixed center needle and translated tape; spacing/step-scaled inverse drag; 4px tap slop; tap spring; last six pointer samples and <60ms fresh release velocity; power .42 / timeConstant 260ms flick; 44px asymptotic boundary rubber band; catch current animated position; cancellation/lost capture zero-velocity settle; horizontal-dominant wheel only, 120ms debounced commit; synchronous snapped readout and changes during drag/coast; commit once after coast and immediately for keys/tap (as actual source implementation); external updates stop/retarget without events; reduced motion snaps without inertia or elastic extension; cleanup of RAF/timer/listener. Keyboard retains all arrows, major-step Shift/Page, Home/End and shortcut pass-through. Default readout formatting and tick geometry must match. Retain name/disabled form behavior.

Use a component-local native RAF physics module because the existing absolute-position Slider cannot model an unbounded moving tape/catch/elastic gesture. No new runtime/dependency or general animation abstraction. Keep `animateReadout?:false`: the app explicitly disables rolling digits; generic true remains unsupported and explicit rather than inert.

Latest actual checks (supersede earlier static-ruler evidence):

- Shared package rebuild: 664 source files; `@valar/svelte-ui test` 2/2; check **0 errors/0 warnings**. Build/types preceded browser comparison. Generated package and registry now contain the native motion.ts module with no Slider dependency for RulerSlider.
- Full docs unit run **201/201 across 20 files**; focused six control suites **37/37**, plus TextureFill8 make 45 scoped cases. Generator injection tests **28/28**. Docs check **0 errors/0 warnings**, 133 language pairs. Registry generation **801 items**; notice/index/dependency assertions passed. An initial scratch assertion used the wrong registry property (path instead of target); corrected to the real schema, not a component failure.
- `check-ruler.mjs`: **22/22 target-contract checks** with unchanged MIT source alongside generated public target, Chromium **147.0.7727.15**. 40px left drag at spacing2 moves 400→420; flick samples 400→408 project to450, with no commit until settle; reduced motion stops at408. Tap+24px commits412 immediately while the normal tape springs. Both boundary cancellation modes produce the same 24.444…px rubber extension and settle0; reduced extension0. Wheel7+7px produces407 and one debounced commit; vertical/equal-axis inputs stay unprevented. Real mouse drag/browser wheel reaches430. Catch stops tape at its current position, holds, then moves exactly another10px; disabled controls ignore input. Keys match all arrows/Shift/Page/Home/End. Intermediate transforms/events are in `.amp/in/artifacts/ruler-browser.json`.
- A source defect is not disguised as equivalence: during normal coast, an external reset to600 is overwritten by a final source value around427 while stopping Motion; native target settles600 at offset-1200 with no stale commit. Both an input and a reset button reproduced the source race, including a trial flushSync in the adapter (removed; did not fix it). Reduced-motion source reset behaves normally. `sourceIssues` records the exact observed values; source code was not patched. Catch observations wait40ms for the original Motion's final queued DOM paint, then assert it remains stationary for180ms.
- `check-confirm-focus.mjs`: **16 combinations** across original/target × Chromium147/WebKit26.5 × light/dark × normal/reduced. Target fullWidth idle button and zone are **448×44**, **0px width difference**. Confirm-first focus preserved, Shift+Tab reaches Cancel in target, actual Space down/up cancels early and completes once, pending Spinner animation is spin normally / none when reduced, live label correct, Undo returns idle. All runtime/resource error arrays empty.
- The earlier Space report was invalid for generated output: style injection trimmed every double-quoted string and changed " " to "". Fixed generically by preserving literals without injected class markers; source, generated package and registry all now retain both real Space comparisons. Public-artifact regression mounts generated ConfirmAction and exercises actual Space, early keyup, completion and ignored empty key. Additional generated registry diffs are consequences of preserving ordinary whitespace, not unrelated source edits.
- WebKit hypothesis **confirmed in available WebKit26.5**, not claimed for27.2: removing only the real target Close Button's DOM tabindex made both Tab and click skip focus; restoring0 made both focus it. Original MIT Button with explicit0 also passes. Library Button now defaults tabindex0, respects explicit -1/positive values and forces disabled buttons/links to-1. A public generated-artifact test covers those variants. Original ConfirmMorph's separate native Cancel lacks tabindex and is skipped in this WebKit; target improves it via Valar Button. Source defect recorded separately in `.amp/in/artifacts/confirm-focus-browser.json`. Requested WebKit27.2 is not installed here; parent retains app-level verification.
- Broad `check-browser.mjs` **7/7** rerun after these fixes; updated light/dark captures inspected. These establish bounded Valar styling and moving tape, not pixel identity. No full docs site build, app sync, global toolchain changes or browser downloads.
- Final parity package run **111/111 across 4 files**, TypeScript check passed. Parent independently reproduced the actual App pointer-focus regression in the same WebKit27.2 at1280×720: original Record Shortcut focuses/saves Control+Shift+KeyK; old target does not; setting only target tabindex0 restores both. This corroborates the library's local WebKit26.5 negative control; no custom pointer handler or app business-logic workaround was added. Parent owns fresh tarball installation and the full application suite; no installed node_modules were touched here.

New evidence supersedes the old static-ruler scope. Generic rolling digits, real touch/screen-reader/SSR/hydration and WebKit27.2 remain explicitly unverified or unsupported as stated, not accepted regressions in the tested app scope. Parent must refresh the tarball with explicit forced package install; plain npm install may reuse the same path artifact. No TokenPlan writes, commits, pushes or publication performed.

## 8. Independent ConfirmAction Morph — Contract Before Implementation

Supervisor rejected instantaneous state-shape replacement. Implement an independently designed native Svelte/WAAPI size, physical radius and content transition; do not read/copy Arc animation code, CSS or curve/spring parameters. The original is executed only as an unchanged timing/geometry reference. Initial independent choice was a short160ms ease-out envelope and100ms content reveal; browser measurement shortened the final envelope to120ms, incoming content80ms and outgoing visual60ms. Measure actual end-to-end observed duration against original, not declared CSS values. This is intentional Valar visual adaptation, never an equivalence pass.

State/events/focus/timeouts remain owned by the existing component and update immediately. A before-update geometry snapshot and after-update animation must not delay actions, await completion, duplicate live status or retain outgoing interactive controls. Any outgoing visual clone is inert/aria-hidden with IDs/roles/live semantics removed. Interruptions retarget from current painted geometry; reduced motion, including changes during flight, snaps directly and disposes animation. Keep fullWidth edge-to-edge/44px, Confirm-first/Shift+Tab Cancel, Space early-release/hold, native Spinner, async single flight/Undo, cancellation and external-state behavior. Build/types precede browser tests.

### Actual Native Morph Verification — 2026-11-08

- Implementation: `confirm-action.svelte` retains its existing state machine and stable live status; component-local `morph.ts` measures geometry before Svelte updates and starts native animations after tick, without awaiting animation for actions/focus. Incoming real controls never scale or clip. Old visuals are inert/aria-hidden, disabled, stripped of IDs/roles/live/data-autofocus identity, and removed on finish/interruption. Revision guards reject stale snapshots/completions. Resize, reduced-motion changes and destroy clear animations/styles/ghosts. No new runtime/dependency, source animation implementation or Arc parameters.
- Package build/type checks passed before final browser measurement: **665 source files**, package tests **2/2**, package check **0 errors/0 warnings**. Full docs tests **205/205 across21 files**, including four new measured-animation/interruption/stale-snapshot/resize/reduced-motion tests; docs check **0 errors/0 warnings**,133 language pairs. Registry regeneration **801 items**; all nine public index/RULES/notices exist in registry and generated package. ConfirmAction includes `morph.ts`, native Space literals and Button+Spinner dependencies. Logs: `.amp/in/confirm-morph-{ui-tests,ui-check,docs-tests,docs-check,registry}.log`.
- Retained `check-confirm-morph.mjs` passed **176 actual source/target timelines**:11 state changes × original/target × light/dark × compact/fullWidth × normal/reduced motion. Manual fixture promises isolate confirm/undo pending, success, error/Retry and result dismissal. All **44 normal-motion paired timing budgets pass**; no source/target runtime or non-favicon resource errors. This is a timing-budget pass for **intentional visual adaptation, NOT equivalence**.

| Normal-Motion Observed Total | Unchanged Original | Independent Native Target |
| --- | --- | --- |
| Compact: all22 transitions (two themes) | 242–449ms | 121–142ms |
| fullWidth: all22 transitions (two themes) | 162–240ms | 121–149ms |
| Compact idle→confirming | 398–399ms | 135–139ms |
| fullWidth idle→confirming | 240ms | 148–149ms |
| Compact confirming→pending | 404–407ms | 131–142ms |
| fullWidth confirming→pending | 166–167ms | 144–147ms |
| Compact pending→done | 445–446ms | 129–137ms |
| fullWidth pending→done | 205–212ms | 147–148ms |

- Timing method: requestAnimationFrame samples from command dispatch; last >0.2px root/text geometry, >0.01 effective opacity or >0.1px blur change, followed by ≥150ms quiet. Total includes outgoing DOM removal, not just a declared duration; unrelated perpetual Spinner rotation is excluded. Results have frame-sampling granularity, are environment-specific, and are not frame-rate/performance certification.
- Visible intermediate geometry: light compact target starts **80.547×38px/radius19px**; at **49.8ms** it is **142.875×38px/radius16.557px**, incoming opacity **0.811**, Confirm focused; final **208.141×38px/radius14px**, opacity1. Where natural fullWidth state dimensions are equal, content still transitions without an artificial size pulse. Source and target start/intermediate/end captures were inspected; source blur/pill styling and target sharper/token-based treatment intentionally differ.
- Reduced-motion target changes directly on the first post-command paint (**1–10ms observed**), with no morph/ghost and content opacity1. Four extra light/dark × compact/fullWidth cases pass real Shift+Tab→Cancel during flight, immediate idle/focus restoration, and switching the actual browser preference during another morph. Owned envelope/content/ghost animations become0, opacity1 and final geometry remains unchanged after180ms. Generic Button color/focus CSS transitions are recorded separately, not falsely classified as an in-flight morph. All target frames retain one live status, connected/unhidden focus and the new state from the first post-command paint; status observer records at most one update per transition.
- Expected active focus was additionally asserted against every recorded target post-command frame: **9,628 assertions pass** (Confirm, pending root, Undo, Retry or idle Button as appropriate); this stronger assertion is retained in the morph harness. After the morph change, the broad browser suite reran **7/7**, and confirmation/focus reran **16/16** combinations in Chromium147 and existing WebKit26.5. Target idle Button/zone remain **448×44px,0px width difference**; Confirm-first/Shift+Tab Cancel, real Space early-release/completion, single-flight, pending Spinner, Undo and explicit Button tabindex negative control all pass. Normal Spinner rotates; reduced Spinner is stopped. Both artifact error arrays are empty: `.amp/in/artifacts/{tokenplan-browser,confirm-focus-browser}.json`, logs `.amp/in/confirm-morph-{broad,focus}.log`.
- Measurement iteration was not concealed: the first160ms envelope produced a fullWidth179ms observation against an original170ms transition, so final120/80/60 timing was chosen for budget headroom. Initial harness assertions incorrectly required intermediate geometry even when both natural sizes were equal, and counted unrelated Button CSS color transitions as morphs; both were corrected against actual browser observations. No failed check is relabeled as a pass.
- The first focus rerun sampled original WebKit after its transient400ms promise: a persistent pending log was present but aria-busy was no longer true. The retained suite now uses shared deferred confirm/undo fixture promises, verifies aria-busy/Spinner and exact operation count while pending, then explicitly completes them. Assertions were not weakened and neither source nor target state logic was changed; the final16-case rerun passes. The separate original WebKit Cancel/tabindex defect remains recorded as a source issue.
- Evidence: `.amp/in/artifacts/confirm-morph/timings.json` (all176 timelines,44 timing comparisons,4 interruption cases), `.amp/in/confirm-morph-browser.log`; six PNGs in that artifact directory named `{original,migrated}-light-compact-normal-idle-confirming-{start,intermediate,end}.png`. Reproduction, fixtures and measurement thresholds are documented in `standards/comparisons/tokenplan/README.md`.
- Scope: Chromium **147.0.7727.15**, macOS Darwin27.2 arm64, matched480×1800 fixtures; native Svelte5.57.3 consumer versus unchanged React19.3.1/Motion14.4.0 reference. No Arc motion source/CSS/curve/spring parameters were read or translated for this independent continuation. Real touch/screen-reader/SSR/hydration and WebKit27.2 remain unverified locally; parent owns the new tarball/App acceptance. No TokenPlan writes or installed package changes, dependency/version/theme changes, commit/push/publication.

### Approved Intentional Deviation: Reset During Inertia

The supervisor explicitly approved keeping the reset-correctness fix, not copying
the source race. This is **not an equivalence pass**. Normal-motion reproduction:
flick from400 with spacing2, release, request external600 while coasting. In the
latest Chromium147.0.7727.15 matched480×1800 run, original tape samples moved
-839.888→-850.405 before reset, and target -839.888→-848.796; neither had committed.
Original then emitted `reset: 600`, `value: 428` and ended with readout428 but
offset-1200. Target ended600/-1200 and emitted **nothing after `reset: 600`**,
including no stale commit through2600ms of settling. Stale state overwriting a
newer explicit value is a data-correctness defect, not a capability.

`check-ruler.mjs` now records the reset marker before the external prop update,
requires actual ongoing motion, asserts600/-1200 and an empty complete
post-reset event slice, and labels this case `kind: intentional-deviation`.
Reduced motion separately matches the original: prior408 commit, reset600,
no further event. The retained22-case run passed with21 equivalence checks and
one target-correctness intentional deviation; runtime/resource errors are empty.
Evidence: `.amp/in/artifacts/ruler-browser.json`, `.amp/in/ruler-reset-final.log`.

## 9. Work-Branch Handoff and Excluded Changes

The authorized delivery is a commit and push of this migration to the
`valar-svelte` work branch, without a main merge, package publication or release.
The shared TokenPlan acceptance report records exact remote commit identities.
TokenPlan's integrated static-production suite passes 719 of 741 entries, with
22 existing Mac-only platform skips and no failures/flakiness; that is separate
from the library's 205 docs/component tests, 2 package tests and 111 parity tests.

Four existing code-block example source edits are deliberately **not staged**:
`code-block-show-more-scroll.svelte`, `code-block-show-more.svelte`,
`code-block-tabs.svelte` and `code-block-wrap-line-numbers.svelte`, all under
`docs/src/lib/registry/examples/create/code-block/`. They protect sample import
text from Vite's dependency scanner, an independent docs concern. They remain
untouched in the working tree, rather than being discarded or included in this
migration commit. The registry JSON does not contain these example-source edits.

Generated code-block, chart, sidebar, stepper, tags-input and highlighted-code
registry changes are different: the required class-injector fix stops trimming
ordinary string whitespace (including the real Space key used by confirmation).
Regeneration consequently preserves formatting/whitespace in these artifacts.
Their changed content was checked to differ only in whitespace; the unchanged
source components were not refactored. Retain those generator outputs so source,
registry and built consumer packages remain synchronized.
