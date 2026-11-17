---
title: 单选按钮组
description: 一组可选中按钮（即单选按钮），同一时间最多只能选中其中一个。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/radio-group
  doc: https://bits-ui.com/docs/components/radio-group
  api: https://bits-ui.com/docs/components/radio-group#api-reference
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

## Jira 导入方式

默认的 Valar 单选框直径 16 px，未选时使用透明底和细描边，选中时以主题强调色和 4 px 圆点标记。键盘焦点使用内描边。`appearance="settings"` 将组选项间距设为 16 px。示例复现 Jira 的导入方式，标签离控件 12 px，空间不足时可换行。横排、禁用和校验样式沿用 Valar 通用规则。

<ComponentPreview name="radio-group-jira">

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

安装 `bits-ui`：

</Step>

<PMInstall command="bits-ui -D" />

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
<RadioGroup.Root value="option-one" aria-label="显示密度">
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

## 描述

用 `Field.Description` 补充说明，再在每个选项上用 `aria-describedby` 引用对应的 ID。

<ComponentPreview name="radio-group-description">

<div></div>

</ComponentPreview>

## 选择卡片

用 `Field.Label` 包裹整个 `Field.Field`，让卡片可以点击。用 `aria-labelledby` 引用标题，用 `aria-describedby` 关联说明。

<ComponentPreview name="radio-group-choice-card">

<div></div>

</ComponentPreview>

## 字段集

用 `Field.Set` 和 `Field.Legend` 将选项分组。在 `RadioGroup.Root` 上用 `aria-labelledby` 引用图例，用 `aria-describedby` 关联说明。

<ComponentPreview name="radio-group-fieldset">

<div></div>

</ComponentPreview>

## 禁用

给 `RadioGroup.Item` 传入 `disabled` 属性，可禁用单个选项。

<ComponentPreview name="radio-group-disabled">

<div></div>

</ComponentPreview>

## 无效状态

在组和选项上设置 `aria-invalid`。为 `Field.Field` 设置 `data-invalid`，并用 `aria-describedby` 关联 `Field.Error`。

<ComponentPreview name="radio-group-invalid">

<div></div>

</ComponentPreview>
