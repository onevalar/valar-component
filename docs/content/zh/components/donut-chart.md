---
title: Static Donut
description: 固定总量分母的装饰性环形扇区。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="donut-chart-demo"><div></div></ComponentPreview>

## 安装

<PMAddComp name="donut-chart" />

## 行为合同

`import { StaticDonut, type DonutPart } from '@valar/svelte-ui/donut-chart'`。

必填 `parts: DonutPart[]`、`total: number`，DonutPart 为 `{ key: string; value: number; color: string }`。转发原生 SVG 属性。调用方校验唯一 key、有限非负值、正总量且部分总和不超过总量。累计角度不重新归一化；整圆用内外各两条弧线绘制。SVG 是装饰性的，viewBox 为 0 0 208 208；需相邻可访问精确图例。不放大小扇区，无悬停、动画或提示框。
