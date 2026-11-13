---
title: 键帽
description: 显示来自键盘的文本输入。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/kbd
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

<ComponentPreview name="kbd-demo" title="标准键帽与菜单快捷键">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="kbd" />
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
  import * as Kbd from "$lib/components/ui/kbd/index.js";
</script>
```

```svelte
<Kbd.Root>B</Kbd.Root>
```

键帽与对应的操作名称一起展示，并使用当前平台的快捷键写法。

菜单项尾部使用 `appearance="inline"`，紧凑的带框键帽使用 `appearance="compact"`。
在上方预览打开 Help 可以查看菜单快捷键，聚焦 Help 时按 Shift+S 可以切换状态。

## 分组

用 `Kbd.Group` 组件把多个按键组合在一起。

<ComponentPreview name="kbd-group-demo">

<div></div>

</ComponentPreview>

## 按钮

在 `Button` 组件内使用 `Kbd.Root`，即可在按钮中显示键帽。

<ComponentPreview name="kbd-button-demo">

<div></div>

</ComponentPreview>

## 工具提示

使用 `Tooltip.Hint` 在工具提示里显示紧凑键帽。聚焦预览按钮后按 Shift+V 可以切换按钮状态。

<ComponentPreview name="kbd-tooltip-demo">

<div></div>

</ComponentPreview>

## 输入框组

在 `InputGroup.Addon` 组件内使用 `Kbd.Root`，即可在输入框组中显示键帽。

<ComponentPreview name="kbd-input-group-demo">

<div></div>

</ComponentPreview>
