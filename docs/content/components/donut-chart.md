---
title: Static Donut
description: A read-only breakdown of a known total.
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="donut-chart-demo"><div></div></ComponentPreview>

## Usage

Pair the chart with a nearby legend listing each category, count and share. Use it when the total is known, such as a project capacity or allocation. A subdued track shows the unused part of that total. For a known total with no allocation, show an empty track and explain the remaining capacity in text. With an unknown or invalid total, show an explicit empty message in the host.

## Installation

<PMAddComp name="donut-chart" />

## Contract

`import { StaticDonut, type DonutPart } from '@valar/svelte-ui/donut-chart'`.

Required `parts: DonutPart[]` and `total: number`. DonutPart is `{ key: string; value: number; color: string }`. Native SVG attributes forward. Provide unique keys, finite nonnegative values, a positive total and a sum no larger than the total. Each segment stays proportional to the original total. The decorative SVG has a square viewBox and fits the available width. Use the legend for reading precise values and categories.
