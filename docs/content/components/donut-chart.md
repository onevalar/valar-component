---
title: Static Donut
description: Decorative annular sectors with a fixed denominator.
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="donut-chart-demo"><div></div></ComponentPreview>

## Installation

<PMAddComp name="donut-chart" />

## Contract

`import { StaticDonut, type DonutPart } from '@valar/svelte-ui/donut-chart'`.

Required `parts: DonutPart[]`, `total: number`. DonutPart is `{ key: string; value: number; color: string }`. Native SVG attributes forward. Caller validates unique keys, finite nonnegative values, positive total and sum ≤ total. Cumulative turns never renormalize; full circles use two outer/two inner arcs. SVG is decorative with viewBox 0 0 208 208; supply exact values in a nearby accessible legend. No enlargement of small slices, hover, animation or tooltip.
