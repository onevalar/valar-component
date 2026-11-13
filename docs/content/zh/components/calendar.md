---
title: 日历
description: 支持键盘操作的日历，可选择单个或多个日期。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/calendar
  doc: https://bits-ui.com/docs/components/calendar
  api: https://bits-ui.com/docs/components/calendar#api-reference
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
</script>

<ComponentPreview name="calendar-project-date" title="项目日期">

<div></div>

</ComponentPreview>

设置 `appearance="project-date"` 可使用 Linear 项目目标日期的月历外观。方向键移动日期，Enter 或空格选择。标题右侧的按钮用于翻月，所选日期会显示在月历下方。

默认日历也使用圆形日期，星期从周一开始。可以用 `weekStartsOn` 改变周起始日，或用 `captionLayout="dropdown"` 快速选择年月。

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="calendar" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `bits-ui` 和 `@internationalized/date`：

</Step>

<PMInstall command="bits-ui @internationalized/date -D" />

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

## 用法

```svelte showLineNumbers
<script lang="ts">
  import { getLocalTimeZone, today } from "@internationalized/date";
  import { Calendar } from "$lib/components/ui/calendar/index.js";

  let value = $state(today(getLocalTimeZone()));
</script>
```

```svelte showLineNumbers
<Calendar type="single" bind:value class="rounded-lg border" />
```

更多信息见 [Bits UI Calendar](https://bits-ui.com/docs/components/calendar) 文档。

## 关于

`<Calendar />` 基于 [Bits UI Calendar](https://bits-ui.com/docs/components/calendar) 组件构建，日期处理由 [@internationalized/date](https://react-spectrum.adobe.com/internationalized/date/index.html) 包负责。

## 日期选择器

用 `<Calendar />` 组件搭建日期选择器，更多信息见[日期选择器](/docs/components/date-picker)文档。

## 基础用法

基础日历组件。示例用 `class="rounded-lg border"` 设置日历样式。

<ComponentPreview name="calendar-basic">

<div></div>

</ComponentPreview>

## 年月与样式调节

<ComponentPreview name="calendar-demo">

<div></div>

</ComponentPreview>

## 区间日历

使用 [`RangeCalendar`](/docs/components/range-calendar) 组件启用区间选择。

<ComponentPreview name="calendar-range">

<div></div>

</ComponentPreview>

## 月份与年份选择器

传入 `captionLayout="dropdown"`，月份与年份使用 Valar Select 菜单。长列表在面板内滚动。方向键和 Enter 可选择，按 Escape 可返回触发器。

<ComponentPreview name="calendar-caption">

<div></div>

</ComponentPreview>

## 预设

<ComponentPreview name="calendar-presets">

<div></div>

</ComponentPreview>

## 日期与时间选择器

<ComponentPreview name="calendar-time">

<div></div>

</ComponentPreview>

## 已预订日期

<ComponentPreview name="calendar-booked-dates">

<div></div>

</ComponentPreview>

## 自定义单元格尺寸

<ComponentPreview name="calendar-custom-days" class="**:[.preview]:min-h-[560px]">

<div></div>

</ComponentPreview>

日历单元格尺寸由 `--cell-size` CSS 变量控制；按断点分别取值即可实现响应式：

```svelte showLineNumbers
<Calendar
  type="single"
  bind:value
  class="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
/>
```

或使用固定值：

```svelte showLineNumbers
<Calendar
  type="single"
  bind:value
  class="rounded-lg border [--cell-size:2.75rem] md:[--cell-size:3rem]"
/>
```
