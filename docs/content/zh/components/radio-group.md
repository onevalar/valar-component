---
title: 单选按钮组
description: 一组可选中按钮（即单选按钮），同一时间最多只能选中其中一个。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/radio-group
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

<ComponentPreview name="radio-group-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="radio-group" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 UI SDK 和样式辅助库：

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

```svelte showLineNumbers
<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
</script>
```

```svelte showLineNumbers
<RadioGroup.Root defaultValue="option-one" aria-label="选项">
  <div class="flex items-center gap-3">
    <RadioGroup.Item value="option-one" id="option-one" />
    <Label for="option-one">Option One</Label>
  </div>
  <div class="flex items-center gap-3">
    <RadioGroup.Item value="option-two" id="option-two" />
    <Label for="option-two">Option Two</Label>
  </div>
</RadioGroup.Root>
```

## 表单行为

要参与原生表单提交及 `required` 校验，请为组设置非空 `name`。未选中或选中的项被禁用时，不提交该字段。用 `defaultValue` 指定重置值；如果值由父级管理，使用 `bind:value` 和表单的重置处理函数。在 Svelte 中 `""` 表示未选中，选项值应唯一且非空。如果提交时必须选中一个可用项，请在禁用当前选项时清空选中值：浏览器可能仍将已选中但禁用的选项视为有效，却不会提交它。

## 描述

用 `Field` 组件为单选按钮项加上描述。

<ComponentPreview name="radio-group-description">

<div></div>

</ComponentPreview>

## 选择卡片

用 `Field.Label` 包裹整个 `Field.Field`，让整张卡片可点击。单选按钮通过 `aria-labelledby` 关联卡片标题，通过 `aria-describedby` 关联说明。

<ComponentPreview name="radio-group-choice-card">

<div></div>

</ComponentPreview>

## 字段集

用 `Field.Set` 和 `Field.Legend` 把单选按钮项组成一组，并带上标签和描述。

<ComponentPreview name="radio-group-fieldset">

<div></div>

</ComponentPreview>

## 禁用

给 `RadioGroup.Item` 传入 `disabled` 属性，可禁用单个选项。

<ComponentPreview name="radio-group-disabled">

<div></div>

</ComponentPreview>

## 无效状态

为 `RadioGroup.Item` 设置 `aria-invalid`，为 `Field.Field` 设置 `data-invalid`，即可显示校验错误。

<ComponentPreview name="radio-group-invalid">

<div></div>

</ComponentPreview>
