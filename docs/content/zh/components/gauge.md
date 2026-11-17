---
title: Gauge
description: 只读百分比、迭代容量和可组合的 SVG 弧线。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="gauge-demo"><div></div></ComponentPreview>

## 迭代容量

在列表行中用 `appearance="capacity"` 把 16 px 的弧线放在百分比旁。可传入本地化的 `suffix` 补充上下文，并在 `valueText` 中提供完整读数。弧线填充最多为 100%，超额后改用红色，界面和读屏仍提供实际百分比。

<ComponentPreview name="gauge-capacity"><div></div></ComponentPreview>

## 安装

<PMAddComp name="gauge" />

## 行为合同

共享包从 `@valar/svelte-ui/gauge` 导入 `Gauge`、`GaugeArc`；registry 安装后从 `$lib/components/ui/gauge/index.js` 导入。

`Gauge` 必填 `value: number`、`label: string` 和 `valueText: string`。通用外观的 `tone: "accent" | "danger"` 默认为 accent。转发 `class`、`onclick` 等原生 div 属性。图形与 ARIA 数值范围限制在 0–100，界面和 `valueText` 保留超限读数。

`GaugeArc` 必填 `value: number | null`，可传入 `radius=42`、`tone="accent"` 和原生 SVG group 属性。放在 100 单位 viewBox 中，null 绘制缺失虚线。传给 `Gauge` 的数值须有限，缺失状态由调用方处理。
