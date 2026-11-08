---
title: Segmented Control
description: 组合 ToggleGroup 的必选单项分段控件。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="segmented-control-demo"><div></div></ComponentPreview>

## 安装

<PMAddComp name="segmented-control" />

## 行为合同

`import { SegmentedControl, type Segment } from '@valar/svelte-ui/segmented-control'`。

必填 label、`options: { value: string; label: string; accessory?: Snippet; disabled?: boolean }[]`，提供 value 或 bind:value。可选 onValueChange(string)、onOptionIntent(string)、disabled 和原生 ToggleGroup 属性及 class。值须唯一且非空。再次选择当前项不清空、不重复触发回调。方向键（考虑 RTL）、Home、End 选择并移动焦点、跳过禁用项。启用项的指针进入或焦点触发 intent。超宽时可横向滚动。

沿用 Bits UI 单选的 radiogroup/radio 与 aria-checked 语义，不沿用来源的按下按钮语义。accessory 使用 Svelte snippet；无 React 运行时和布局动画。多选用 ToggleGroup，关联面板用 Tabs。
