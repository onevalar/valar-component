---
title: Gauge
description: A static percentage meter and composable SVG arcs.
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="gauge-demo"><div></div></ComponentPreview>

## Installation

<PMAddComp name="gauge" />

## Contract

Import `Gauge`, `GaugeArc` from `@valar/svelte-ui/gauge` (shared package) or `$lib/components/ui/gauge/index.js` (registry).

`Gauge`: required `value: number`, `label: string`, `valueText: string`; optional `tone: 'accent' | 'danger'` (accent). Native div attributes including `class` and `onclick` forward. Graphic and numeric ARIA range clamp to 0–100; visible number and valueText retain overflow.

`GaugeArc`: required `value: number | null`; optional `radius=42`, `tone='accent'`, native SVG group attributes. Mount inside a 100-unit SVG viewBox. Null draws a dashed missing track. No interaction or animation. Supply finite numeric input; caller handles missing before mounting Gauge.
