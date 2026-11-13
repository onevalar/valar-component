---
title: 日期选择器
description: 支持输入和选择日、月、季度、半年和年的日期选择器。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/date-picker
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="date-picker-demo">

<div></div>

</ComponentPreview>

## 安装

<PMAddComp name="date-picker" />

## 用法

```svelte
<script lang="ts">
	import { DatePicker, type Timeframe } from "$lib/components/ui/date-picker/index.js";

	let start = $state<Timeframe>();
	let target = $state<Timeframe>();
</script>

<DatePicker label="Start date" max={target} bind:value={start} />
<DatePicker label="Target date" min={start} bind:value={target} />
```

打开上方示例，直接输入 `May 2027`、`Q2 2027` 或 `2027-05-20`，按 Enter 提交。也可以用精度标签切换选项。值保留 ISO 日期和识别出的精度。已有值时，按「清除日期」或清空输入后按 Enter。用 `locale="zh-CN"` 显示中文，用 `precisions={["day"]}` 只允许选择具体日期。

需要在一份日历中选择连续区间时，可继续使用下方的 Range Calendar 组合。

## 基础用法

基础日期选择器组件。

<ComponentPreview name="date-picker-basic">

<div></div>

</ComponentPreview>

## 区间选择器

用于选择日期区间的日期选择器组件。

<ComponentPreview name="date-picker-range">

<div></div>

</ComponentPreview>

## 出生日期

用于选择出生日期的日期选择器组件。标题栏以下拉菜单呈现，月份和日期可分别选择。

<ComponentPreview name="date-picker-dob">

<div></div>

</ComponentPreview>

## 输入框

带输入框的日期选择器组件，可直接输入日期。

<ComponentPreview name="date-picker-input">

<div></div>

</ComponentPreview>

## 时间选择器

带时间输入框的日期选择器组件，可选择具体时间。

<ComponentPreview name="date-picker-time">

<div></div>

</ComponentPreview>

## 自然语言选择器

该组件使用 `chrono-node` 库解析自然语言描述的日期。

<ComponentPreview name="date-picker-natural-language">

<div></div>

</ComponentPreview>
