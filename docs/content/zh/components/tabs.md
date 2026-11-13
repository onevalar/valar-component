---
title: 标签页
description: 一组层叠的内容区块，即标签页面板，每次只显示其中一个。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/tabs
  doc: https://bits-ui.com/docs/components/tabs
  api: https://bits-ui.com/docs/components/tabs#api-reference
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

<ComponentPreview name="tabs-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="tabs" />
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
  import * as Tabs from "$lib/components/ui/tabs/index.js";
</script>
```

```svelte showLineNumbers
<Tabs.Root value="account" class="w-full max-w-[400px]">
  <Tabs.List aria-label="账户设置">
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">
    Make changes to your account here.
  </Tabs.Content>
  <Tabs.Content value="password">Change your password here.</Tabs.Content>
</Tabs.Root>
```

为列表提供可访问名称，标签和对应面板使用相同的值。方向键和 Home／End 在可用标签之间移动。默认激活模式会随焦点切换面板。

## 线条

在 `Tabs.List` 上使用 `variant="line"`。宽度不足时，列表横向滚动，并让获得焦点的标签进入可见范围。可在预览里试用 End 和 Home。

<ComponentPreview name="tabs-line">

<div></div>

</ComponentPreview>

## 胶囊

在项目侧栏等窄面板中，用 `variant="capsule"` 并排显示少量同级标签。示例使用 `activationMode="manual"`，方向键移动焦点，Space 或 Enter 激活选项。

<ComponentPreview name="tabs-capsule">

<div></div>

</ComponentPreview>

## 垂直

传入 `orientation="vertical"`，用上、下方向键在垂直列表中移动焦点。

<ComponentPreview name="tabs-vertical">

<div></div>

</ComponentPreview>

## 禁用

<ComponentPreview name="tabs-disabled">

<div></div>

</ComponentPreview>

## 图标

<ComponentPreview name="tabs-icons">

<div></div>

</ComponentPreview>
