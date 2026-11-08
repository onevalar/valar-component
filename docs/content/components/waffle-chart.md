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

## Installation

<PMAddComp name="waffle-chart" />

## Contract

`import { WaffleChart, type WaffleCategory } from '@valar/svelte-ui/waffle-chart'`.

Required `data: { key: string; value: number; color: string }[]`, `label: string`; native div attributes forward. Finite values, negative contributions treated as zero. Positive total allocates exactly 100 cells using largest remainders (ties preserve input order), filling bottom-left up each column. Empty/zero total draws zero cells. Caller supplies colors and a nearby exact accessible legend. No selection, tooltips or animation.
