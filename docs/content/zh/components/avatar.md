---
title: 头像
description: 用于表示用户的图片，加载失败时显示替代内容。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/avatar
  doc: https://bits-ui.com/docs/components/avatar
  api: https://bits-ui.com/docs/components/avatar#api-reference
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

<ComponentPreview name="avatar-subscriber" title="订阅者与成员头像">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="avatar" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `bits-ui`：

</Step>

<PMInstall command="bits-ui@2.20.0 -D" />

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

使用 Bits UI 2.20.0 时，独立消费者还需按[依赖补丁说明](/docs/installation#依赖补丁与严格类型检查)应用补丁。没有运行时补丁时，成功图片切换到坏源后仍保留 `loaded`，Fallback 不会出现；仅更新组件源码或 CLI 不会自动应用补丁。

## 用法

```svelte showLineNumbers
<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar/index.js";
</script>
```

```svelte showLineNumbers
<Avatar.Root>
  <Avatar.Image src="/favicon.svg" alt="Valar" />
  <Avatar.Fallback>CN</Avatar.Fallback>
</Avatar.Root>
```

## 订阅者

在成员姓名旁用 `appearance="subscriber"` 显示 18 px 头像。用 `--valar-avatar-subscriber-color` 指定成员姓名缩写的背景色。示例可在本地照片与姓名缩写之间切换。 在设置成员列表用 `appearance="member"` 显示 24 px 头像。

<ComponentPreview name="avatar-demo" title="头像用法概览">

<div></div>

</ComponentPreview>

## 基础用法

带图片和替代内容的基础头像组件。

<ComponentPreview name="avatar-basic">

<div></div>

</ComponentPreview>

## 徽标

使用 `Avatar.Badge` 组件为头像添加徽标，徽标位于头像右下角。

<ComponentPreview name="avatar-badge">

<div></div>

</ComponentPreview>

传入 `class` 属性为徽标自定义样式，例如颜色、尺寸等。

```svelte showLineNumbers
<Avatar.Root>
  <Avatar.Image src="/favicon.svg" alt="Valar" />
  <Avatar.Fallback>CN</Avatar.Fallback>
  <Avatar.Badge class="bg-green-600 dark:bg-green-800" />
</Avatar.Root>
```

## 带图标的徽标

`<Avatar.Badge>` 内同样支持图标。

<ComponentPreview name="avatar-badge-icon">

<div></div>

</ComponentPreview>

## 头像组

使用 `Avatar.Group` 组件把多个头像归为一组。

<ComponentPreview name="avatar-group">

<div></div>

</ComponentPreview>

## 头像组计数

使用 `<Avatar.GroupCount>` 在头像组内显示计数。

<ComponentPreview name="avatar-group-count">

<div></div>

</ComponentPreview>

## 带图标的头像组

`<Avatar.GroupCount>` 内同样支持图标。

<ComponentPreview name="avatar-group-count-icon">

<div></div>

</ComponentPreview>

## 尺寸

传入 `size` 属性调整头像尺寸。

<ComponentPreview name="avatar-size">

<div></div>

</ComponentPreview>

## 下拉菜单

头像组件可作为下拉菜单的触发器。

<ComponentPreview name="avatar-dropdown">

<div></div>

</ComponentPreview>
