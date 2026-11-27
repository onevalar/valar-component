---
title: 复选框
description: 用于在选中与未选中状态之间切换的控件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/checkbox
  doc: https://ui-sdk.dev/docs
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
	import Step from "$lib/components/step.svelte";
</script>

<ComponentPreview name="checkbox-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="checkbox" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 UI SDK 和样式辅助依赖：

</Step>

<PMInstall command="@ui-sdk/core@0.1.0-beta.17 @ui-sdk/svelte@0.1.0-beta.17 svelte-toolbelt@0.10.6" />

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

```svelte
<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
</script>
```

```svelte
<Checkbox />
```

## 选中状态

用 `bind:checked` 绑定复选框状态，或用 `onCheckedChange` 监听状态变化。

默认方框为 14 px，圆角 3 px。点击标签，或聚焦后按空格键，可切换选中状态。

```svelte showLineNumbers
<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";

  let checked = $state(false);
</script>

<Checkbox bind:checked />
```

## 无效状态

直接提交可查看与复选框关联的错误提示。点击标签或按空格修正后可重新提交。

为复选框设置 `aria-invalid`，并为外层字段容器设置 `data-invalid`，即可显示无效样式。

<ComponentPreview name="checkbox-invalid">

<div></div>

</ComponentPreview>

## 基础用法

复选框配合 `Field.Field` 和 `Field.Label` 使用，获得正确的布局与标签。

<ComponentPreview name="checkbox-basic">

<div></div>

</ComponentPreview>

## 描述

辅助文字使用 `Field.Content` 和 `Field.Description`。

<ComponentPreview name="checkbox-description">

<div></div>

</ComponentPreview>

## 禁用

传入 `disabled` 属性阻止交互，并为 `<Field.Field>` 组件加上 `data-disabled` 属性，以应用禁用样式。

<ComponentPreview name="checkbox-disabled">

<div></div>

</ComponentPreview>

## 分组

从同一个 `checkbox` 入口导入 `CheckboxGroup`。给组设置 `name`，给每个 `Checkbox` 设置不同的字符串 `value`。表单以组名提交每个选中值。用 `defaultValue` 指定初始及重置时的选项，或用 `bind:value` 绑定当前选项。组的 `required` 表示至少选一项。

如果原先用 Bits UI 的 `Checkbox.Group` 包裹 Valar 复选框，将外层换成 Valar 的 `CheckboxGroup`。只设初始值时，用 `defaultValue` 替代固定的 `value`。如果每项都必须同意，请使用各自有名称、各自必填的独立复选框，不要使用组的 `required`。

<ComponentPreview name="checkbox-group">

<div></div>

</ComponentPreview>

## 表格

表头复选框表示部分选中并控制全选。各行复选框仍有各自的名称和键盘焦点。

<ComponentPreview name="checkbox-table">

<div></div>

</ComponentPreview>
