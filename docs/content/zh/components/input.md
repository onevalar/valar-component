---
title: 输入框
description: 用于表单与数据录入的文本输入框，内置样式与无障碍支持。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/input
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

<ComponentPreview name="input-demo" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="input" />
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
  import { Input } from "$lib/components/ui/input/index.js";
</script>
```

```svelte
<Input />
```

## 基础用法

<ComponentPreview name="input-basic" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 表单字段

用 `Field.Field`、`Field.Label` 和 `Field.Description` 组合标签、输入框与说明。试着输入团队标识符，示例会转为大写、限制为 7 字符，并即时更新说明里的前缀。

<ComponentPreview name="input-field" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 字段组

用 `Field.Group` 组织多个 `Field.Field` 块，搭建表单。

<ComponentPreview name="input-fieldgroup" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 禁用

使用 `disabled` 可跳过键盘焦点并排除表单提交。给 `Field.Field` 加上 `data-disabled`，可同步调整标签的禁用样式。

<ComponentPreview name="input-disabled" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 只读

用 `readonly` 保留聚焦、选取、复制和表单提交，限制编辑。

<ComponentPreview name="input-readonly" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 无效

校验失败时在输入框设置 `aria-invalid`，在字段设置 `data-invalid`，并用 `aria-describedby` 关联 `Field.Error`。试着修正邮箱地址，错误会随即消失。

<ComponentPreview name="input-invalid" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 文件

使用 `type="file"` 与 `bind:files` 读取浏览器选中的文件。

<ComponentPreview name="input-file" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 行内

把 `Field.Field` 与 `orientation="horizontal"` 搭配，得到行内输入框。再配合 `Button`，即可组成带按钮的搜索输入框。

<ComponentPreview name="input-inline" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 网格

用网格布局并排放置多个输入框。

<ComponentPreview name="input-grid">

<div></div>

</ComponentPreview>

## 必填

使用原生 `required` 属性。装饰性的星号使用 `aria-hidden="true"`，避免辅助技术重复播报必填要求。

<ComponentPreview name="input-required" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 徽标

在标签里使用 `Badge`，突出推荐填写的字段。

<ComponentPreview name="input-badge" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 输入框组

要在输入框内加入图标、文本或按钮，使用 `InputGroup` 组件。更多示例见[输入框组](/docs/components/input-group)组件。

<ComponentPreview name="input-input-group" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 按钮组

要给输入框添加按钮，使用 `ButtonGroup` 组件。更多示例见[按钮组](/docs/components/button-group)组件。

<ComponentPreview name="input-button-group" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## 表单

完整表单示例，包含多个输入框、一个选择器和一个按钮。

<ComponentPreview name="input-form">

<div></div>

</ComponentPreview>
