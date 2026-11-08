---
title: Gauge
description: 静态百分比仪表和可组合的 SVG 弧线。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="gauge-demo"><div></div></ComponentPreview>

## 安装

<PMAddComp name="gauge" />

## 行为合同

共享包从 `@valar/svelte-ui/gauge` 导入 `Gauge`、`GaugeArc`；registry 安装后从 `$lib/components/ui/gauge/index.js` 导入。

`Gauge` 必填 `value: number`、`label: string`、`valueText: string`；`tone: 'accent' | 'danger'` 默认 accent。转发 class、onclick 等原生 div 属性。图形与 ARIA 数值范围限制在 0–100，显示数字和 valueText 保留超限读数。

`GaugeArc` 必填 `value: number | null`；可选 `radius=42`、`tone='accent'` 和原生 SVG group 属性。放在 100 单位 viewBox 中；null 绘制缺失虚线。无交互和动画。数字须有限；Gauge 的缺失状态由调用方处理。
