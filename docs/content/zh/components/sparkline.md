---
title: Static Sparkline
description: 保留日历槽位、零基线和 null 缺口。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="sparkline-demo"><div></div></ComponentPreview>

## 项目完成趋势

项目进度摘要可用 `appearance="project"`。细靛蓝线、渐隐面积和末端圆点取自 Linear 项目进度图的 Completed 序列。104 × 32 px 是 Valar 的紧凑尺寸，示例使用合成的每周数据。面积分段落在零基线上，缺失周在线和面积上都留下空位。精确读数放在图形旁边。 [Linear 项目进度图](https://linear.app/docs/project-graph)

<ComponentPreview name="sparkline-project"><div></div></ComponentPreview>

## 安装

<PMAddComp name="sparkline" />

## 行为合同

`import { StaticSparkline } from '@valar/svelte-ui/sparkline'`。

必填按日历排序的 `values: (number | null)[]`，数值须有限非负。null 断开线条但保留日期间隔；零保持在基线；孤立记录保留圆点。空数组绘制空的装饰性 SVG。viewBox 为 0 0 72 40，默认宽 50.4、高 28，转发原生 SVG 属性和 class。调用方提供相邻的可访问摘要与数据。无插值、游标、提示框或动画。
