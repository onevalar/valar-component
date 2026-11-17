---
title: Static Donut
description: 按已知总量展示类别构成的只读环图。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="donut-chart-demo"><div></div></ComponentPreview>

## 用法

用于项目容量、额度分配等有明确总量的场景。图旁同时列出类别名称、数量与占比。低对比度轨道表示未用份额。总量已知且暂无分配时，保留轨道并写出剩余容量。总量未知或无效时，由外层显示明确的空状态说明。

## 安装

<PMAddComp name="donut-chart" />

## 行为合同

`import { StaticDonut, type DonutPart } from '@valar/svelte-ui/donut-chart'`。

必填 `parts: DonutPart[]` 和 `total: number`，DonutPart 为 `{ key: string; value: number; color: string }`。转发原生 SVG 属性。调用方提供唯一 key、有限非负值及正总量，各部分之和不超过总量。每段的角度按固定总量计算。装饰性 SVG 使用方形 viewBox 并随可用宽度收缩，类别和精确数据通过图例读取。
