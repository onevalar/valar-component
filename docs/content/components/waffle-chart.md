---
title: Waffle Chart
description: A static hundred-cell proportional chart.
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="waffle-chart-demo"><div></div></ComponentPreview>

## Usage

Use the grid for a quick view of how a measured total is divided. Each colored cell approximates one percent of the sum. Put the exact category names, values and shares beside the chart. With no positive data, the grid shows an empty frame. Pair it with a short explanation of why there's nothing to plot.

## Installation

<PMAddComp name="waffle-chart" />

## Contract

`import { WaffleChart, type WaffleCategory } from '@valar/svelte-ui/waffle-chart'`.

Required `data: { key: string; value: number; color: string }[]` and `label: string`. Native div attributes forward. Negative and non-finite contributions count as zero. A positive sum allocates exactly 100 cells using largest remainders, preserving input order for ties and filling up each column from the bottom-left. Choose colors that remain distinguishable on light and dark surfaces. The chart is read-only.
