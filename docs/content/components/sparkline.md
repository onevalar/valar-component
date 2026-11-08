---
title: Static Sparkline
description: Calendar-slot geometry with a zero baseline and null gaps.
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="sparkline-demo"><div></div></ComponentPreview>

## Installation

<PMAddComp name="sparkline" />

## Contract

`import { StaticSparkline } from '@valar/svelte-ui/sparkline'`.

Required `values: (number | null)[]` in calendar order. Finite nonnegative values only. Null breaks the path without closing the calendar gap; zero remains on the baseline; isolated samples remain dots. Empty arrays render an empty decorative SVG. ViewBox 0 0 72 40, default width 50.4 and height 28; native SVG attributes/class forward. Caller supplies adjacent accessible summary/data. No interpolation, scrubber, tooltip or motion.
