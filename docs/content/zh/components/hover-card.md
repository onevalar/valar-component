---
title: 悬停卡片
description: 供视力正常的用户预览链接背后的内容。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/hover-card
  doc: https://bits-ui.com/docs/components/link-preview
  api: https://bits-ui.com/docs/components/link-preview#api-reference
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

<ComponentPreview name="hover-card-profile" title="成员资料卡" tunable={false}>

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="hover-card" />
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
  import * as HoverCard from "$lib/components/ui/hover-card/index.js";
</script>
```

```svelte showLineNumbers
<HoverCard.Root>
  <HoverCard.Trigger>Hover</HoverCard.Trigger>
  <HoverCard.Content>
    SvelteKit - Web development, streamlined
  </HoverCard.Content>
</HoverCard.Root>
```

## 成员资料

在 `HoverCard.Content` 上传入 `appearance="profile"` 可显示紧凑的成员预览。悬停或聚焦姓名时预览资料，点击姓名链接也可以直接阅读相同内容。

## 触发延迟

在 `HoverCard.Root` 上传入 `openDelay` 和 `closeDelay`，控制卡片的打开与关闭时机。

```svelte showLineNumbers
<HoverCard.Root openDelay={100} closeDelay={200}>
  <HoverCard.Trigger>Hover</HoverCard.Trigger>
  <HoverCard.Content>Content</HoverCard.Content>
</HoverCard.Root>
```

## 定位

用 `HoverCard.Content` 的 `side` 和 `align` 属性控制卡片出现的位置。

```svelte showLineNumbers
<HoverCard.Root>
  <HoverCard.Trigger>Hover</HoverCard.Trigger>
  <HoverCard.Content side="top" align="start">Content</HoverCard.Content>
</HoverCard.Root>
```

## 基础用法

<ComponentPreview name="hover-card-demo">

<div></div>

</ComponentPreview>

## 方向

<ComponentPreview name="hover-card-sides">

<div></div>

</ComponentPreview>
