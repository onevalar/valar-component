---
title: Texture Fill
description: A decorative percentage canvas with textures and a reduced-motion-aware spring.
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="texture-fill-demo"><div></div></ComponentPreview>

## Installation

<PMAddComp name="texture-fill" />

## Contract

`import { TextureFill, textures, type Texture, type FillTexture } from '@valar/svelte-ui/texture-fill'`.

Required finite `value: number`, `texture: 'dither' | 'lines' | 'halftone' | 'hatch' | 'solid'`. Optional `intro=false`, native span attributes and class (not className). Give the container explicit dimensions, for example class="h-12 w-full". Percentage is graphically clamped; the unfilled portion retains its texture as in the source. Canvas is decorative/aria-hidden; caller owns meter semantics and missing values.

intro starts at zero only when motion is allowed. Changes use the original damped spring and moving texture band; reduced motion snaps immediately and responds to preference changes while mounted. ResizeObserver updates canvas size at device pixel ratio capped at 3. Color follows currentColor and ancestor attribute/theme changes. Effects dispose observers, media listener and RAF on teardown/texture replacement. SSR renders only the decorative shell; browser Canvas 2D, ResizeObserver and matchMedia are required. Canvas failure raises an explicit error rather than silently claiming a rendered fill.
