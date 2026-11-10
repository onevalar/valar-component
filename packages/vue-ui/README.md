# @valar/vue-ui (Private, Local Only)

Actual Vue SFC source SDK, not a bundled Svelte adapter. Build before consuming.
The package deliberately ships `.vue` and `.ts` (including their types) like the
Svelte source SDK; consumers need Vue SFC/TypeScript-capable tooling and Tailwind 4.
It is not published. Upstream paths, revision and MIT copyright: PROVENANCE.md / LICENSE.

## Build and Public Imports

Use command-local Node 24.22.2 and `npx --yes pnpm@12.14.0` with
`--config.verifyDepsBeforeRun=false` for scripts, after the workspace owner installs.
Do not rely on pnpm's implicit dependency verification to install anything.

```sh
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false --filter @valar/vue-ui build
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false --filter @valar/vue-ui check
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false --filter @valar/vue-ui test
```

```ts
import { Button } from "@valar/vue-ui/button";
import { Input } from "@valar/vue-ui/input";
import { Checkbox } from "@valar/vue-ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@valar/vue-ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@valar/vue-ui/dialog";
import { Calendar } from "@valar/vue-ui/calendar";
import { RangeCalendar } from "@valar/vue-ui/range-calendar";
import { Slider } from "@valar/vue-ui/slider";
import { ChartContainer, ChartTooltipContent } from "@valar/vue-ui/chart";
```

In the consumer Tailwind entry, import `tailwindcss` then
`@valar/vue-ui/theme.css`. Generated theme.css scans its own relative `ui` and
`lib` directories, so installed tarballs do not rely on the monorepo docs paths.
The builder invokes the shared `scripts/valar-style.ts`; it does not own a token
copy. Reka content variables use `--reka-select-*` / `--reka-popover-*`, not Bits
variables. Checked states are native `data-state=checked`; Select uses native
focus/highlight state. Slider geometry/drag CSS remains Reka's. Unovis axis
variables map to Valar tokens within ChartContainer; no consumer selector patch.

## Native Contract, Not a Framework-Neutral Shim

- Root exports contain the same native composition components as copied upstream.
  Content, description, title, item, trigger and indicator slots remain Vue slots.
  Props/events remain Reka's names (`modelValue` / `update:modelValue`, `open` /
  `update:open`, `valueCommit`). No Svelte callback/snippet/ref API is claimed.
- Most native wrappers use `useForwardProps(Emits)` and `reactiveOmit`: this
  preserves absence of optional Boolean props, instead of accidentally supplying
  `false` to a native controlled/uncontrolled primitive. Unrecognized DOM attrs,
  ARIA/data attributes and event listeners fall through to the actual root.
  Portal content wrappers explicitly move `$attrs` onto the content, not Teleport.
  Non-DOM root providers cannot meaningfully accept arbitrary DOM attrs.
- Component refs are Vue instances (`$el` when it exists), not a promised native
  DOM-ref callback or an exposed focus method. Use native composition where an
  underlying primitive's full exposed instance is required.
- Input retains upstream passive `useVModel`, supporting `defaultValue` and local
  edits with `update:modelValue`; parent updates sync in. A native reset event
  alone does not reset a bound parent model. Reka controls use their native hidden
  form inputs and native `name`/`required`/disabled semantics. The preview resets
  controlled values and keys the form to remount passive/native internal state.
  Native Reka Slider serializes its vector model to `name[0]`, etc., even when
  the scalar adapter is used. The shared preview intentionally leaves that name
  unset and supplies a hidden `quota` input for its scalar form contract.
- Button retains Primitive `as`/`asChild`, plus `href`, `disabled`, `type` (default
  `button`), `shape=auto|pill|square`. Icon sizes use the style’s default radius. Disabled direct links lose href, get role=link,
  aria-disabled=true and tabindex=-1. With `asChild` the child determines the real
  element: supply matching link semantics on the child, not a hidden fake API.
- Dialog content/footer/scroll content accept `closeLabel` (default `关闭`). Native
  modal/non-modal modes and focus/dismissal stay in Reka, with native content emits.
- Calendar keeps native `layout=month-and-year|month-only|year-only`, heading and
  navigation icon slots. Additive `captionLayout=dropdown|dropdown-months|dropdown-years|label`
  maps to that layout (explicit `layout` wins). DateValue/range models remain native,
  not JS Date/string models. Both calendars default to zh-CN; generated years use
  upstream min/max or -100/+10-year bounds, overridable by `yearRange`.
  Captions update placeholder only; popovers show 3×4 months and paged 12 years.
  Dates are 36px. Do not assume Svelte's `months`/`years` or day snippet API exists.
- Slider defaults to native array mode and native Reka keyboard behavior (including
  native ten-step Page/Shift navigation). Add `type="single"` for scalar models,
  four-arrow numeric direction, min-relative snapping, Home at min and End at
  the largest permitted min-relative grid step (fixture -20/80/3 ends at 79),
  Page and Shift steps of `largeStep ?? 2*step`. Alt/Ctrl/Meta and cancelled events
  bubble unprevented and unchanged; ordinary handled keys bubble defaultPrevented.
  A narrow as-child surface replaces **only** native scalar key handling because
  Reka SliderImpl itself does not guard those modifiers. Pointer/drag, hidden inputs,
  orientation, direction, inversion, multiple thumbs and ARIA stay native.
  `thumbLabels` and root aria-label/labelledby/valuetext are forwarded to thumbs.
  Native `SliderRoot`, `SliderTrack`, `SliderRange`, `SliderThumb` are also exported
  for custom composition. Ownership mode switching is not promised.
- ChartContainer/ChartLegendContent/ChartTooltipContent use upstream config/context;
  ChartCrosshair and ChartTooltip are real Unovis exports. Compose `@unovis/vue`
  VisLine/VisXYContainer/etc, not a fabricated SVG. Config is trusted developer CSS
  input, not safe arbitrary user CSS. Tooltip zero renders; null/undefined hides.
  The native Unovis bundle includes optional graph/map code and currently produces
  large-chunk warnings; no bundle-size or LayerChart API equivalence is claimed.

## Preview and Verification Limits

`apps/vue-preview` uses public package paths only, a local Geist Variable font,
the shared serializable fixture, and shared layout stylesheet. Start on 5214:

```sh
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false --filter @valar/vue-preview dev
```

Query `?theme=dark&disabled=1`; use the browser's reduced-motion preference.
Parent owns the real three-document comparison and browser acceptance.
`standards/porting-records/first-batch-vue.md` records executed checks and gaps.
Compile/unit success is not behavioral parity, accessibility, SSR or independent
tarball acceptance. DateValue dependencies must resolve to one compatible version:
this workspace pins direct Vue date dependencies to Reka's existing 3.12.0, rather
than casting incompatible private-class types from mixed 3.12.0/3.12.4 copies.
