---
title: 多行输入框
description: 显示表单多行输入框，或外观与多行输入框一致的组件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/textarea
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

<ComponentPreview name="textarea-demo" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="textarea" />
{/snippet}
{#snippet manual()}
<Steps>

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
  import { Textarea } from "$lib/components/ui/textarea/index.js";
</script>
```

```svelte
<label for="message">消息</label>
<Textarea id="message" />
```

## 表单字段

用 `Field.Field`、`Field.Label` 和 `Field.Description` 给多行输入框加上标签与描述，并通过 `aria-describedby` 关联说明。

<ComponentPreview name="textarea-field" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 团队描述

设置卡片使用 `appearance="settings"`。字段高 120 px，内边距 16 px，字号 13 px，超出时在框内滚动。团队描述示例沿用 Linear 实测的 255 字符上限，并在 Valar 中提供可见计数。默认外观仍随内容增长。

<ComponentPreview name="textarea-team-description" class="[&_[data-align]>*]:max-w-md">

<div></div>

</ComponentPreview>

## 禁用

传入 `disabled` 属性禁用多行输入框。要定制禁用状态的样式，在 `Field.Field` 组件上添加 `data-disabled` 属性。

<ComponentPreview name="textarea-disabled" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 只读

可选取和复制字段内容时，使用 `readonly`。

<ComponentPreview name="textarea-readonly" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 无效

用 `aria-invalid` 标记错误，并通过 `aria-describedby` 关联错误说明。在 `Field.Field` 上使用 `data-invalid` 标记周围区域的状态。输入文字可清除预览中的错误。

<ComponentPreview name="textarea-invalid" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 按钮

与 `Button` 搭配，得到带提交按钮的多行输入框。提交后，预览会清空草稿并显示确认。

<ComponentPreview name="textarea-button" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>
