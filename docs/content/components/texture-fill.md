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

Pass a finite `value: number` and a `texture` of `dither`, `lines`, `halftone`, `hatch`, or `solid`. Set a height, for example `class="h-4"`. The neutral track and accent follow the theme. Fill starts at the inline edge and clamps to 0–100%. Show the exact percentage beside the track. For a semantic meter, label a meter in the surrounding markup and provide its current value there.

With `intro` enabled, fill animates from zero. Reduced motion shows the new value immediately and responds to preference changes while mounted. The renderer resizes with its container at a device pixel ratio of up to 3. Override the accent with a text color utility. The canvas is hidden from assistive technology. Server rendering provides the decorative track, and the browser requires Canvas 2D, ResizeObserver and matchMedia.
