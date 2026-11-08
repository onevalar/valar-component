# Source and Modifications

The directories under `src/ui` were copied from the actual source of
[unovue/shadcn-vue](https://github.com/unovue/shadcn-vue/tree/d1bf1b3a2d1a824b19f32d7253a28a43797b8253/apps/v4/registry/bases/reka/ui),
commit **d1bf1b3a2d1a824b19f32d7253a28a43797b8253**:

`apps/v4/registry/bases/reka/ui/{button,input,checkbox,select,dialog,calendar,range-calendar,slider,chart,popover}`.

MIT License, Copyright (c) 2023 unovue. The complete upstream license is
retained in LICENSE and copied into dist. The source paths above map directly
to matching `src/ui` paths; new CalendarCaption.vue, scalar-keyboard.ts and lib
files are Valar adaptations, not files claimed to exist upstream.

Modifications: generated local imports and Lucide icon resolution; shared Valar
style expansion with narrow native Reka selector/CSS-variable mappings; Button
shape/default type/disabled-link semantics; localized dialog close labels;
36px calendar geometry, borderless ghost navigation and popover month/year
captions; Select popper/start defaults with the native 4px translation gap;
optional scalar single
slider adapter with Valar keyboard and thumb-label behavior; chart zero-value
tooltip correction. Real Reka controls and the Unovis chart engine are retained.

The Vue preview's ChartTooltip/ChartCrosshair/componentToString composition
reuses the same pinned source's
`apps/v4/registry/bases/reka/examples/chart/ChartLineExample.vue` and
`apps/v4/registry/bases/reka/blocks/preview-02/components/PowerUsage.vue`, adapted
to the shared fixture, linear/null-gap line, axes and scatter dots.

The package does not contain Arc Pro code, another framework runtime, a Nuxt
host, or compatibility shims pretending to implement another framework API.
