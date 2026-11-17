---
title: Waffle Chart
description: 固定一百格的静态占比图。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="waffle-chart-demo"><div></div></ComponentPreview>

## 用法

用于快速比较总量中各类别的比重。有颜色的每一格近似占总量的 1%。图旁列出类别、精确数值和百分比。没有正数数据时保留空框，并在旁边说明暂无可绘制数据。

## 安装

<PMAddComp name="waffle-chart" />

## 行为合同

`import { WaffleChart, type WaffleCategory } from '@valar/svelte-ui/waffle-chart'`。

必填 `data: { key: string; value: number; color: string }[]` 和 `label: string`，转发原生 div 属性。负值和非有限数值按零计算。正总量使用最大余数法分配一百格，并列时保留输入顺序，从左下逐列向上填充。配色需在浅深主题均可区分。图表为只读展示。
