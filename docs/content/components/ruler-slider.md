---
title: Ruler Slider
description: A moving tape with precise readout, flick inertia and elastic boundaries.
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="ruler-slider-demo"><div></div></ComponentPreview>

## Installation

<PMAddComp name="ruler-slider" />

## Contract

`import { RulerSlider } from '@valar/svelte-ui/ruler-slider'`.

Required `label`; `value`/`bind:value`, `defaultValue` (min), `onValueChange(number)`, `onValueCommit(number)`. Defaults: min=0, max=100, step=1, majorEvery=10, spacing=10, disabled=false. Optional largeStep, format(number), unit, name, class and native div attributes. Supply finite values and max > min. Value clamps/snaps; callbacks only follow user input, not external updates. Named hidden input submits the numeric value; disabled omits it. Reset through the bound value, not native form.reset().

Drag moves the tape inversely by `spacing / step`, independent of viewport width. A tap glides the chosen tick to the fixed center needle. Fresh flicks coast to a snapped value; grabbing the tape catches it. Ends rubber-band up to 44px, then settle. Pointer cancellation/lost capture settles without a flick. Horizontal-dominant wheel input adjusts; vertical wheel scroll stays untouched. Label ticks follow the complete configured range, so choose a sensible labelled interval for large ranges.

All arrows step; PageUp/Down and Shift+arrows use largeStep (default step × majorEvery). Home/End reach the bounds. Alt/Ctrl/Meta shortcuts pass through. format and unit also produce aria-valuetext on the slider viewport.

`onValueChange` follows snapped ticks during drag/coast. `onValueCommit` fires once after drag settlement, immediately for a tap/key target (matching the actual source implementation), and after 120ms of wheel inactivity. External values retarget without emitting events. Native RAF/timers/listeners are disposed on unmount; reduced motion snaps without inertia or elastic extension. Only `animateReadout={false}` is accepted: rolling-digit animation remains unsupported; precise readout is synchronous.
