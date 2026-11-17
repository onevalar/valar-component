---
title: Gauge
description: Read-only percentages, cycle capacity and composable SVG arcs.
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="gauge-demo"><div></div></ComponentPreview>

## Cycle capacity

Use `appearance="capacity"` when a row needs a 16 px ring beside the percentage. Add an optional localized `suffix` for context, and include that context in `valueText`. The ring stops at 100% and turns red above capacity while the visible value and spoken description retain the actual percentage.

<ComponentPreview name="gauge-capacity"><div></div></ComponentPreview>

## Installation

<PMAddComp name="gauge" />

## Contract

Import `Gauge`, `GaugeArc` from `@valar/svelte-ui/gauge` (shared package) or `$lib/components/ui/gauge/index.js` (registry).

`Gauge` requires `value: number`, `label: string` and `valueText: string`. The default appearance accepts `tone: "accent" | "danger"` and uses the accent tone by default. Native div attributes including `class` and `onclick` forward. The graphic and numeric ARIA range clamp to 0–100. The visible number and `valueText` retain overflow.

`GaugeArc` requires `value: number | null` and accepts `radius=42`, `tone="accent"` and native SVG group attributes. Mount it inside a 100-unit SVG viewBox. Null draws a dashed missing track. Supply a finite value for `Gauge` and handle missing values before mounting it.
