---
title: Color Picker
description: Interactive 2D color board, hue and alpha sliders, HEX / RGB / HSL / OKLCH editing, EyeDropper, and recent/preset swatches.
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

Depends on Valar's Popover, which the CLI installs automatically.

## Usage

```svelte
<script lang="ts">
  import { ColorPicker } from "$lib/registry/ui/color-picker/index.js";
  let color = $state("#2563eb");
</script>

<ColorPicker
  label="Primary"
  bind:value={color}
  presets={["#0f172a", "#2563eb", "#0ea5e9", "#16a34a", "#eab308", "#f97316", "#dc2626", "#9333ea"]}
/>
```

## Behavior contract

- Alpha is enabled by default (`alpha={true}`): opaque values emit 6-digit lowercase `#rrggbb`, while translucent values emit 8-digit `#rrggbbaa`. Pass `alpha={false}` when only opaque hex colors are accepted.
- The popover provides a built-in 2D saturation/value canvas, hue rainbow slider, and checkerboard alpha slider with pointer capture dragging and keyboard arrow (`Shift` for coarse step) support while preserving hue at black/white boundaries.
- Switch and edit live across `HEX`, `RGB`, `HSL`, and `OKLCH`; the copy button copies the active CSS format, and an EyeDropper button appears automatically in browsers supporting the EyeDropper API.
- Recently committed colors are stored locally (up to 8 entries; pass `showRecent={false}` to disable) alongside optional preset swatches with luminance-adaptive checkmarks for readable contrast on light and dark colors.
- `contentProps` forwards Popover.Content options (excluding `children`/`child`), and passing `name` submits the normalized hex value in native forms.
