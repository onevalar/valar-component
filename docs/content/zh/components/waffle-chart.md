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

## 安装

<PMAddComp name="waffle-chart" />

## 行为合同

`import { WaffleChart, type WaffleCategory } from '@valar/svelte-ui/waffle-chart'`。

必填 `data: { key: string; value: number; color: string }[]`、`label: string`，转发原生 div 属性。数据须有限，负贡献按零计算。正总量使用最大余数法分配一百格（并列时保留输入顺序），从左下逐列向上填充。空数组或总量为零时不绘制格子。调用方提供颜色和精确的可访问图例。无选择、提示框或动画。
