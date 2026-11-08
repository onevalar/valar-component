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

Runtime engines remain native React: Radix UI (MIT), React Day Picker (MIT),
Recharts (MIT), Lucide (ISC), class-variance-authority (Apache-2.0), cn (MIT), and
tw-animate-css (MIT). Their package licenses remain with those dependencies.
React and React DOM (MIT) and Tailwind CSS (MIT) are peer dependencies.
Build-only workspace tooling is not imported by the delivered package source.

ChartStyle, like its upstream source, is a developer configuration API: only
trusted application-defined CSS color values belong in ChartConfig. Do not pass
untrusted end-user CSS/configuration into it.
