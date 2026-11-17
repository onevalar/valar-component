---
title: Tick Meter
description: A read-only radial meter that keeps the exact overflow reading.
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="tick-meter-demo"><div></div></ComponentPreview>

Use Tick Meter to show a current percentage or quota usage. Place a short label alongside the reading, and use the danger tone when an overflow needs emphasis. In a settings card grid, give each meter a square area and let the cards wrap when space is limited. Use Gauge for a continuous arc.

## Installation

<PMAddComp name="tick-meter" />

## Contract

`import { TickMeter } from '@valar/svelte-ui/tick-meter'`.

Required finite `value: number`, localized `label: string` and `valueText: string`. Optional `tone='accent' | 'danger'` (accent), native div attributes/class. Exactly 60 SVG line ticks at six-degree intervals. Graphic filled count and aria-valuenow clamp to 0–100; visible rounded number retains overflow, including negatives. The exact caller valueText is preserved for spoken overflow details. Caller handles missing values; no missing-to-zero fallback.

The graphic and its tabular percentage readout scale together. The meter has an accessible name and value and stays out of the keyboard tab order.

Independent implementation from product requirements, not an Arc Pro adaptation. No Pro source/CSS was read or redistributed. No circular CSS mask, motion or celebration. PROVENANCE.md ships with registry/package source.
