---
title: 面板
description: 在屏幕边缘的模态层或工作区侧栏中展示辅助内容。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/sheet
  doc: https://bits-ui.com/docs/components/dialog
  api: https://bits-ui.com/docs/components/dialog#api-reference
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

<ComponentPreview name="sheet-project-details" title="时间线详情侧栏" tunable={false}>

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="sheet" />
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
  import * as Sheet from "$lib/components/ui/sheet/index.js";
</script>
```

```svelte showLineNumbers
<Sheet.Root>
  <Sheet.Trigger>Open</Sheet.Trigger>
  <Sheet.Content>
    <Sheet.Header>
      <Sheet.Title>Are you sure absolutely sure?</Sheet.Title>
      <Sheet.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Sheet.Description>
    </Sheet.Header>
  </Sheet.Content>
</Sheet.Root>
```

## 时间线侧栏

用 `Sheet.Panel` 在工作区内展示非模态侧栏，上方预览以项目时间线为例。将侧栏的 `open` 绑定到工具栏按钮，通过 `aria-controls` 关联两者，并为侧栏提供 `label`。面板单独滚动，工作区仍可操作。示例在窄屏将侧栏排到时间线下方。

Valar 支持在面板内按 Escape 关闭。传入工具栏按钮作为 `trigger` 后，关闭时会将焦点归还给该按钮。需要遮罩和焦点限制时，使用 `Sheet.Root` 和 `Sheet.Content`。在 `Sheet.Content` 上设置 `appearance="details"` 可为模态面板应用详情卡片样式。

## 基础用法

<ComponentPreview name="sheet-demo">

<div></div>

</ComponentPreview>

## 方向

用 `Sheet.Content` 的 `side` 属性设置面板出现的屏幕边缘，可选 `top`、`right`、`bottom`、`left`。

<ComponentPreview name="sheet-side">

<div></div>

</ComponentPreview>

## 无关闭按钮

在 `Sheet.Content` 上传入 `showCloseButton={false}` 隐藏关闭按钮。

<ComponentPreview name="sheet-no-close-button">

<div></div>

</ComponentPreview>
