---
title: Tick Meter
description: 独立原创的六十条径向 SVG 刻度静态仪表。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="tick-meter-demo"><div></div></ComponentPreview>

## 安装

<PMAddComp name="tick-meter" />

## 行为合同

`import { TickMeter } from '@valar/svelte-ui/tick-meter'`。

必填有限 value:number、本地化 label:string 和 valueText:string。可选 tone='accent' | 'danger'（默认 accent）、原生 div 属性与 class。恰好六十条 SVG line，间隔六度。填充数量与 aria-valuenow 限制在 0–100，显示的取整数字保留超限值（含负数）；调用方的 valueText 原样保留，用于播报超限详情。缺失状态由调用方处理，不回退为零。

实现独立来自产品要求，不是 Arc Pro 转换；未阅读或再分发 Pro 源码和 CSS。无圆形 CSS mask、动画或庆祝。PROVENANCE.md 随 registry 和共享包分发。
