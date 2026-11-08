# @valar/react-ui (Private Workspace SDK)

Native React first batch adapted from pinned shadcn/ui sources. This is an
unpublished source SDK, not a Next documentation application and not a Svelte
runtime bridge. Read `NOTICE.md`, `LICENSE`, and
`standards/porting-records/first-batch-react.md` for provenance and pending checks.

## Build And Consume

Use Node 24.22.2 and `npx --yes pnpm@12.14.0`. The workspace owner installs
dependencies. Scoped scripts should use `--config.verifyDepsBeforeRun=false`
to avoid an implicit workspace install during parallel implementation:

```sh
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false --filter @valar/react-ui build
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false --filter @valar/react-ui check
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false --filter @valar/react-ui test
```

`dist` contains native `.tsx`/`.ts` source and a generated `theme.css`, like the
Svelte source SDK. Consumers need a TypeScript/JSX-aware React bundler and
Tailwind 4; no precompiled CommonJS distribution is promised. The theme scans
its own `dist` sources using relative `@source` paths. The builder reads the
shared Valar theme/style generator at build time only. Do not copy global tokens
or import the Svelte SDK's runtime or theme from a React consumer.

```tsx
import { Button } from "@valar/react-ui/button";
import { Input } from "@valar/react-ui/input";
import { Calendar } from "@valar/react-ui/calendar";
import { Slider } from "@valar/react-ui/slider";
```

```css
@import "tailwindcss";
@import "@valar/react-ui/theme.css";
```

Other public subpaths are `checkbox`, `select`, `dialog`, `range-calendar`,
`chart`, `popover`, `calendar-dropdown`; the root entry re-exports them all.
Native primitives' full props and upstream component compositions are retained.

## Intentional Valar Adaptations

- `Button`: native button/ref/`asChild` plus native anchor props via `href`;
  `shape="auto" | "pill" | "square"`. Icon sizes are circular by default.
  Real buttons default to `type="button"`. Disabled href/asChild anchors lose
  their href, get `aria-disabled`, and leave the tab order.
- `DialogContent` and `DialogFooter` accept `closeLabel` (default `关闭`).
- `SelectContent` defaults to native Radix `position="popper"`, `align="start"`
  with the upstream side translation providing the shared 4px gap. Native
  positioning/alignment overrides remain available.
- `Calendar` retains DayPicker modes, constraints, navigation, labels,
  formatters, `classNames` and `components`. Its default locale is Chinese;
  provide a native DayPicker locale to override. The `dropdown` captions use
  the existing Valar 3×4 month choices and paged 12-year popovers. Actual native
  dropdown children are composed month-first in DOM and keyboard order; Chinese
  year formatting includes 年. Caller `components`/`formatters` override these
  defaults. Range cells use native modifiers to paint a continuous accent band.
  Year dropdowns use the existing Bits chooser range: latest of initial view
  and current year minus 100 through plus 10, extending the lower end to initial
  year minus 10 for older views. Native `startMonth`/`endMonth` (and deprecated
  boundary props) take precedence. DayPicker uses these same bounds for both
  its dropdown and navigation; set explicit bounds for a wider window.
  `RangeCalendar` is the same engine with `mode="range"` implicit and native
  `resetOnSelect=true` by default: clicking after a complete range starts a new
  range. Set `resetOnSelect={false}` for native extend-range behavior. This API
  requires the declared **react-day-picker >=9.14.0**. Its geometry follows the
  source range composition (12px padding, 16px grid margin, 4px head/body gap,
  36px cells), distinct from single Calendar. Public `className`, `classNames`
  and `components` retain final override priority. Values are native `Date` and
  `{ from, to }`, not Svelte `DateValue`. DayPicker is not an input: it does not
  automatically submit a `name` field. Consumers serialize dates explicitly if
  their form requires that field.
- `Slider`: the original array API remains the default, including native
  orientation/RTL/inversion/multiple thumbs. `type="single"` opts into scalar
  `value/defaultValue` and scalar callbacks. Scalar keyboard arrows always
  increase (Right/Up) or decrease (Left/Down); Shift arrows/Page keys use
  `largeStep ?? step * 2`; Home selects min and End selects the last permitted
  min-anchored step (for min=-20/max=80/step=3, that is 79). Alt/Ctrl/Meta shortcuts
  bubble unchanged. `thumbLabels` and root ARIA descriptions reach real thumbs.
  `SliderPrimitive` is also exported for native custom child composition.
  A disabled wrapper omits the root name so Radix's hidden form input is not
  a successful field; the native pointer and form engine otherwise stays intact.
  Controlled reset must restore application state; the demo performs native
  form reset then a fixture key remount so primitive-local state resets too.
- Chart uses the real Recharts container, tooltip, legend and composition API;
  it does not render a replacement SVG. ChartConfig is trusted developer CSS
  configuration, not an untrusted HTML/CSS input boundary.

## Real Preview

```sh
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false --filter @valar/react-preview dev
```

Port 5213, query `?theme=dark&disabled=1` (or `theme=light`). Reduced motion
follows the browser preference and updates without reload. The actual native
components import only public package paths and share the neutral fixture/CSS.
Readiness is `[data-framework=react][data-ready=true]` after mount. Cross-framework
behavior/visual acceptance is parent-owned and not implied by these checks.

With this preview running, the focused public browser regression is:

```sh
npx --yes pnpm@12.14.0 --config.verifyDepsBeforeRun=false --filter @valar/react-ui test:browser
```

It imports this package's declared `@playwright/test` 1.62.0 development dependency,
not a shipped SDK runtime dependency. `VALAR_TEST_BROWSER` can select an existing browser
executable (on macOS the default is installed Google Chrome), and
`VALAR_REACT_PREVIEW_URL` overrides the default local preview URL. No browser
download or dependency install is performed. Coverage includes asymmetric scalar
bounds, real FormData including disabled fields, month/year DOM and Tab order,
future year selection, narrow range geometry, range restart, light/dark range
cell colors, native popup placement and favicon.
