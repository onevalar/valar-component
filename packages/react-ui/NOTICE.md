# React First Batch Source Notice

The files `src/{button,input,checkbox,select,dialog,calendar,slider,chart,popover}.tsx`
are copied and adapted from **shadcn-ui/ui**, at commit
`42f3bb63b46a69e52a24bd005cdc9ec15ba7a7b9`, paths
`apps/v4/registry/bases/radix/ui/<name>.tsx`:

https://github.com/shadcn-ui/ui/tree/42f3bb63b46a69e52a24bd005cdc9ec15ba7a7b9/apps/v4/registry/bases/radix/ui

Copyright (c) 2023 shadcn. MIT License: see the accompanying `LICENSE`.
Generated `dist` copies carry the source paths, commit and copyright header.

Valar modifications: self-contained local imports; actual Lucide icons in place
of the documentation site's multi-icon provider; shared Valar style expansion;
button shape/default type/disabled anchor semantics; localized dialog close copy;
36px calendar cells, month-first DOM-composed popover captions and localized year
formatting; native range modifiers styled as the Valar accent band; scalar Slider
step-grid compatibility and disabled field-name omission; Select popper/start defaults.
`calendar-dropdown.tsx` follows the existing Valar Svelte caption selection UI in
`docs/src/lib/registry/ui/{calendar,range-calendar}/*-{month,year}-select.svelte`.
Default year bounds follow installed Bits UI 2.20.0's `getDefaultYears` in
`dist/internal/date-time/calendar-helpers.svelte.js` (MIT), not DayPicker's
current-year-only dropdown end; explicit native navigation limits take priority.
Range geometry follows `docs/src/lib/registry/ui/range-calendar/` root, month,
header and grid composition, while preserving native override props.
`range-calendar.tsx` composes the same native DayPicker engine in range mode,
defaulting its actual `resetOnSelect` API to true (callers may override). That API
was added in DayPicker 9.14, so this package declares `react-day-picker ^9.14.0`.
Its installed public type definitions and `selection/useRange.js` were inspected;
no range selection engine was copied or rewritten.

The high-reuse components in `src/{label,field,textarea,switch,tabs,kbd,tooltip,radio-group,native-select,input-group,toggle,toggle-group,button-group}.tsx`
adapt variants, structure and class selections from the corresponding Valar Svelte
components and `RULES.md` under `docs/src/lib/registry/ui/`, at the working-tree
baseline `cfd989c9f63156774dbfb3871cc1fa1774e62ee5` (MIT; see repository and
package licenses). They use the same build-time `cn-*` style map, implemented
with native React DOM or Radix UI primitives, not embedded Bits UI or Svelte code.

The content, feedback and layout ports in
`src/{accordion,alert,aspect-ratio,avatar,badge,breadcrumb,card,carousel,collapsible,empty,item,page-layout,pagination,progress,resizable,scroll-area,skeleton,spinner}.tsx`
follow the corresponding Valar Svelte contracts and shared styles at the same baseline.
Carousel uses Embla 8.6.0 via its React adapter; Resizable uses
react-resizable-panels 2.1.9. Both are MIT-licensed dependencies.

The menu, overlay and navigation ports in
`src/{alert-dialog,context-menu,drawer,dropdown-menu,hover-card,menubar,navigation-menu,sheet,sidebar,sonner}.tsx`
follow the Valar Svelte contracts and shared styles at the same baseline. They
compose Radix UI and SDK parts, Vaul 1.1.2 for drawer gestures and Sonner 2.0.8
for notifications. Vaul and Sonner are MIT; licenses accompany the dependencies.

Runtime engines remain native React: Radix UI (MIT), React Day Picker (MIT),
Recharts (MIT), Lucide (ISC), class-variance-authority (Apache-2.0), cn (MIT), and
tw-animate-css (MIT). Their package licenses remain with those dependencies.
React and React DOM (MIT) and Tailwind CSS (MIT) are peer dependencies.
Build-only workspace tooling is not imported by the delivered package source.

ChartStyle, like its upstream source, is a developer configuration API: only
trusted application-defined CSS color values belong in ChartConfig. Do not pass
untrusted end-user CSS/configuration into it.

The complex input and data ports in
`src/{command,combobox,date-picker,input-otp,number-field,tags-input,stepper,slider-field,color-picker,table}.tsx`
follow the corresponding Valar Svelte contracts and styles at the same MIT baseline.
Number Field uses Adobe's `@internationalized/number` 3.6.9 (Apache-2.0); its
license and copyright notices accompany that dependency. The Data Table guide
uses MIT TanStack React Table 9.0.0 in the consuming app, not inside this package.

The visualization and meter ports follow Valar's MIT Svelte versions at the same
baseline. Donut, Gauge, Ruler Slider, Sparkline and Waffle originally adapt free
Arc components by Elia Kuratli. Texture Fill derives from TokenPlan
`platforms/tauri/src/DitherFill.tsx` at `c588b28cc1a19a1bdd5964db5c791e2ec66d5ec4`,
with original OpenUsage code by Robin Ebers and TokenPlan modifications by onevalar.
Their copyright and permission notices are in `LICENSE`. Tick Meter is independently
authored from Valar's product requirements; no Arc Pro source, CSS or assets are included.

The conversation and issue ports adapt Valar's MIT Svelte registry and primitives
at the same baseline. Questionnaire follows the source's MIT shadcn/ui-derived
collection behavior. Code Block optionally loads Shiki 3.20.0, and Issue Detail
uses Tiptap and ProseMirror 3.33.1 through Tiptap's packages, as in the source.
