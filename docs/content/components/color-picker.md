---
title: Color Picker
description: Choose a hexadecimal color using a color well, input, or label palette.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/color-picker
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="color-picker-demo"><div></div></ComponentPreview>

## Installation

<PMAddComp name="color-picker" />

The CLI also installs Popover and Scroll Area.

## Usage

```svelte
<script lang="ts">
  import { ColorPicker } from "$lib/components/ui/color-picker/index.js";
  let color = $state("#2563eb");
</script>

<ColorPicker
  label="Primary color"
  bind:value={color}
  presets={["#0f172a", "#2563eb"]}
/>
```

## Label palette

<ComponentPreview name="color-picker-label"><div></div></ComponentPreview>

Use `appearance="label"` beside a label name. Presets accept hex strings or `{ color, label }` objects. Tab visits each color and the custom-color button. Selecting a preset or pressing Enter on a valid custom hex value closes the picker and restores focus to its trigger. Custom color also offers a pointer-driven saturation/brightness area and hue strip. Arrow keys adjust either control. Use `labels` to localize the custom panel.

## Behavior

- The displayed and submitted value is a lowercase six-digit `#rrggbb`. `normalizeHex` expands shorthand, and an invalid external value displays `#000000`.
- The default panel synchronizes the native color well, hex input, and optional presets. Six-digit input applies immediately. Shorthand applies on Enter or blur; incomplete input restores the current value on blur.
- Preset buttons expose their current state with `aria-pressed`. Escape returns focus to the trigger. A constrained panel uses an overlay scrollbar.
- `contentProps` forwards Popover.Content options such as `sideOffset`, `class`, and `portalProps`. The default portal is enabled. Use `portalProps={{ disabled: true }}` for an inline panel.
- Root `class` and `contentProps.class` can override layout utilities. The panel uses `data-slot="color-picker-content"` in both appearances.
- Set `name` to submit the current `#rrggbb` with a native form. The native color well’s appearance depends on the browser.
