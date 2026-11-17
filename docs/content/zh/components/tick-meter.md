---
title: Tick Meter
description: 保留实际超限读数的只读径向刻度仪表。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="tick-meter-demo"><div></div></ComponentPreview>

用于展示当前百分比或配额使用率。读数旁保留短标签，需要突出超限时选用危险配色。在设置卡片中给仪表留出正方形区域，宽度不足时让卡片换行。需要连续弧线时用 Gauge。

## 安装

<PMAddComp name="tick-meter" />

## 行为合同

`import { TickMeter } from '@valar/svelte-ui/tick-meter'`。

必填有限 value:number、本地化 label:string 和 valueText:string。可选 tone='accent' | 'danger'（默认 accent）、原生 div 属性与 class。恰好六十条 SVG line，间隔六度。填充数量与 aria-valuenow 限制在 0–100，显示的取整数字保留超限值（含负数）；调用方的 valueText 原样保留，用于播报超限详情。缺失状态由调用方处理，不回退为零。

图形和等宽数字一起缩放。仪表提供可访问名称与读数，在 Tab 顺序中跳过。

实现独立来自产品要求，不是 Arc Pro 转换；未阅读或再分发 Pro 源码和 CSS。无圆形 CSS mask、动画或庆祝。PROVENANCE.md 随 registry 和共享包分发。
