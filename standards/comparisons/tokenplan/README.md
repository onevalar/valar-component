# Live Comparison (Development Only)

The original iframe imports the real, unchanged free MIT TokenPlan components, not replicas. The migrated iframe imports actual Valar public subpaths. Separate documents isolate CSS, framework roots and state. No message bridge is used: shared controls remount both iframes with identical serializable URL fixtures; each External Value input independently changes props without remounting. Events are recorded in each document. TickMeter is shown only on the target side: it has independent provenance, and no Pro source is imported.

From Valar root:

```sh
export PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH"
npx --yes pnpm@12.14.0 --filter @valar/svelte-ui build
mkdir -p .amp/in/tokenplan-react
cp standards/comparisons/tokenplan/react-runtime.json .amp/in/tokenplan-react/package.json
npx --yes pnpm@12.14.0 --dir .amp/in/tokenplan-react --ignore-workspace install
node standards/comparisons/tokenplan/serve.mjs
```

Open http://127.0.0.1:5198. Stop with Ctrl-C. `TOKENPLAN_SOURCE` may override the sibling `token-plan/platforms/tauri` Git checkout, which must contain revision `c588b28cc1a19a1bdd5964db5c791e2ec66d5ec4`. Its Svelte 5.57.3, Vite 7.3.7, Svelte plugin 6.2.4 and Tailwind 4.3.3 dependencies must be installed. The app removed its React dependencies and implementations during migration. The launcher extracts only an exact allowlist of free MIT source files at that revision into ignored `.amp/in/tokenplan-source/`; it does not restore files in TokenPlan or extract any Pro directory. The dev-only manifest pins React/ReactDOM 19.3.1, Motion 14.4.0 and Lucide React 1.60.0 from the original source lockfile in an isolated ignored directory. `TOKENPLAN_REACT_RUNTIME` can point to another prepared directory. Nothing is installed by the launcher, no production dependencies are added to the library, and no production build imports this harness. Never substitute/import the Pro tick-ring.

Run the bounded checks in a second terminal (with the same Node PATH), using the already installed Chromium 147 executable:

```sh
export TOKENPLAN_TEST_BROWSER="$HOME/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
node standards/comparisons/tokenplan/check-browser.mjs
node standards/comparisons/tokenplan/check-ruler.mjs
TOKENPLAN_TEST_WEBKIT="$HOME/Library/Caches/ms-playwright/webkit-2370/pw_run.sh" node standards/comparisons/tokenplan/check-confirm-focus.mjs
node standards/comparisons/tokenplan/check-confirm-morph.mjs
```

Seven scenarios write `tokenplan-browser.json` and light/dark captures under `.amp/in/artifacts/`. Ensure `/.amp/in/` is in the local Git exclude before running. The checks reject runtime and non-favicon resource errors. They include scalar Slider all-arrow/Shift/Page/Home/End and modifier behavior, ConfirmAction fullWidth/44px hit area, Confirm-first then Shift+Tab Cancel focus, stopped reduced-motion pending Spinner, and clamped TickMeter ARIA with overflow valueText. Zero percent solid texture is correctly transparent, not a failed paint. Remove `.amp/in/tokenplan-react`, `.amp/in/tokenplan-source` and `.amp/in/comparison-vite` after stopping the launcher if no further comparison is needed; the reproducible source harness and manifest remain.

Use normal/zero/overflow/missing/disabled/failure, light/dark, 320/480/720px, direction, Reset, External Value, direct pointer and keyboard input. Readiness requires `body[data-ready=ready]` after each framework mounted; the shell displays loading for unresolved mounts. Inspect errors in the affected iframe console. The motion selector configures source MotionConfig; use browser reduced-motion emulation for native matchMedia on **both** sides (TextureFill uses native preference). Apply / Reset always discards divergent state.

The ruler suite runs 22 source/target cases: normal/reduced motion, inverse spacing-scaled drag, tap spring, sampled flick/commit, boundary cancel/lost capture, wheel dominance/debounce, external retarget, keys, native mouse/wheel, catch and disabled. Deterministic velocity cases use a real pointer capture followed by timestamped PointerEvents; a separate case uses real mouse movement and browser wheel. Captures and traces belong in `.amp/in/artifacts/ruler-browser.json`. External reset while coasting exposes an original React/Motion race (reset is overwritten by a last emitted value); the native target must honor the requested reset and emit no stale commit. This is recorded in sourceIssues, not hidden as equivalence.

The confirmation/focus suite runs both real original and generated target in Chromium 147 and an existing WebKit (currently executable reports 26.5, **not** 27.2); no browser is downloaded. Its 16 combinations cover themes/motion/implementations, exact fullWidth sizing (<2px difference, >=44px), Confirm-first and Cancel traversal, actual Space down/up cancellation/completion, pending Spinner/motion/status, single-flight and Undo. Shared deferred promises keep pending observable until its aria-busy, Spinner and exact operation count are asserted; they are then explicitly resolved, avoiding a historical-log/400ms-promise race. A real target WebKit negative control removes only DOM tabindex, proving Tab/click fail without it and pass when restored. Original ConfirmMorph's native Cancel lacks tabindex and is skipped under this WebKit preference; target must remain reachable. Default Playwright WebKit path is unavailable locally, so set the existing executable explicitly.

The independent morph suite uses `manual=1` deferred promises to isolate pending/result/undo/retry and `compact=1` for content-sized controls (default is fullWidth). Eleven state changes are sampled with requestAnimationFrame in each of 16 source/target × theme × width × motion combinations. The observed end is the last >0.2px geometry, >0.01 effective-opacity or >0.1px blur change, with at least 150ms of subsequent quiet; timings are sampled observations, not declared durations or a performance certification. Forty-four normal-motion comparisons enforce target no slower than unchanged original. Four extra target cases use real Shift+Tab/Cancel during flight and a live reduced-motion preference change. Equal natural geometry does not require an artificial pulse: content must still transition. Reduced-motion checks inspect owned envelope/content/ghost animations, not unrelated Button color-focus CSS transitions; those are recorded separately. Target frames retain one live status, connected/unhidden expected focus, and state changes on the first post-command paint. Samples and six inspected start/intermediate/end PNGs are under `.amp/in/artifacts/confirm-morph/`. Morph feedback is **independently authored visual adaptation, not an equivalence pass**; no Arc animation source/CSS/curves were read or translated for it.

Intentional differences: Valar semantic tokens, radio semantics for single selection, synchronous ruler digits (animateReadout=false; **tape physics is implemented**), independent native state-shape feedback, extended localized status labels, independently authored TickMeter. These are not pixel-parity fixtures. Browser test evidence and outstanding checks belong in the porting record. This harness alone does not establish app-level overlays, real touch hardware, WebKit 27.2 or screen-reader behavior. Parent owns fresh tarball/App acceptance; a same-path tarball requires explicit forced installation rather than plain npm install.
