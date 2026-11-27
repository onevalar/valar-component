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

## First high-reuse wave

The following Vue ports were authored against Valar's Svelte sources at
`cfd989c9f63156774dbfb3871cc1fa1774e62ee5` in `docs/src/lib/registry/ui`:
`label`, `field`, `textarea`, `switch`, `tabs`, `kbd`, `tooltip`, `radio-group`,
`native-select`, `input-group`, `toggle`, `toggle-group`, and `button-group`.
They share the repository's Valar `cn-*` style source and use installed MIT
Reka UI 2.10.5 and Vue 3.5 primitives, not a copy of the Bits UI implementations.
The existing shadcn-vue license continues to cover the upstream material retained
in the package; the wave's public composition follows shadcn-vue named exports.

## Content, feedback and layout wave

The Vue ports for `accordion`, `alert`, `aspect-ratio`, `avatar`, `badge`,
`breadcrumb`, `card`, `carousel`, `collapsible`, `empty`, `item`, `page-layout`,
`pagination`, `progress`, `resizable`, `scroll-area`, `skeleton`, and `spinner`
follow the corresponding Valar Svelte contracts and shared styles at the same
baseline. Carousel uses MIT-licensed Embla 8.6.0 directly. Resizable uses Reka
Splitter; no PaneForge or Svelte runtime is included.

## Menus, overlays and navigation wave

The Vue ports for `alert-dialog`, `context-menu`, `drawer`, `dropdown-menu`,
`hover-card`, `menubar`, `navigation-menu`, `sheet`, `sidebar`, and `sonner`
follow the Valar Svelte contracts and shared styles at the same baseline. They
compose Reka and SDK parts, Vaul Vue 0.4.1 for drawer gestures and Vue Sonner
2.0.9 for notifications. Vue Sonner includes its MIT license. The Vaul Vue
0.4.1 tarball omits its license; its package Git revision's [MIT license](https://github.com/unovue/vaul-vue/blob/1b1f6dfdba6a775410508884097443d35c9a8690/LICENSE)
is retained here. No Nuxt, Bits UI, or Svelte runtime is used by these ports.

### Vaul Vue 0.4.1 licence

MIT License

Copyright (c) 2025 unovue

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Complex input and data wave

The Vue ports for `command`, `combobox`, `date-picker`, `input-otp`, `number-field`,
`tags-input`, `stepper`, `slider-field`, `color-picker`, and `table` follow the
corresponding Valar Svelte contracts and styles at the same MIT baseline.
Number Field uses Adobe's `@internationalized/number` 3.6.9 (Apache-2.0); its
license and copyright notices accompany that dependency. The Data Table guide
uses MIT TanStack Vue Table 9.0.0 in the consuming app, not inside this package.

## Visualization and meter wave

The Vue ports follow Valar's MIT Svelte versions at the same baseline. Donut,
Gauge, Ruler Slider, Sparkline and Waffle originally adapt free Arc components
by Elia Kuratli. Texture Fill derives from TokenPlan `platforms/tauri/src/DitherFill.tsx`
at `c588b28cc1a19a1bdd5964db5c791e2ec66d5ec4`, with original OpenUsage code by
Robin Ebers and TokenPlan modifications by onevalar. Their copyright and permission
notices are in `LICENSE`. Tick Meter is independently authored from Valar's product
requirements; no Arc Pro source, CSS or assets are included.

## Conversation and issue wave

The Vue ports adapt Valar's MIT Svelte registry and primitives at the same
baseline. Questionnaire follows the source's MIT shadcn/ui-derived collection
behavior. Code Block optionally loads Shiki 3.20.0, and Issue Detail uses Tiptap
and ProseMirror through Tiptap's 3.33.1 packages, as in the source.
