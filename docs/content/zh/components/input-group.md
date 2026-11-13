---
title: 输入框组
description: 为输入框添加附加项、按钮和辅助内容。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/input-group
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
	import Callout from "$lib/components/callout.svelte";
</script>

<ComponentPreview name="input-group-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="input-group" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `@lucide/svelte`：

</Step>

<PMInstall command="@lucide/svelte -D" />

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
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
  import SearchIcon from "@lucide/svelte/icons/search";
</script>
```

```svelte showLineNumbers
<InputGroup.Root>
  <InputGroup.Input aria-label="搜索组件" placeholder="Search..." />
  <InputGroup.Addon aria-hidden="true">
    <SearchIcon />
  </InputGroup.Addon>
  <InputGroup.Addon align="inline-end">
    <InputGroup.Button>Search</InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>
```

## 设置搜索

使用 `appearance="settings-search"` 显示带 16 px 前导图标的紧凑搜索框。预览会随输入筛选设置。按 Escape 或点击清除按钮可以重置关键词，焦点回到搜索框。

<ComponentPreview name="input-group-settings-search">

<div></div>

</ComponentPreview>

## 图标与名称

图标选择按钮和名称输入框需要共用边框时，使用 `appearance="settings-name"`。按钮和输入框各自拥有可访问名称与键盘焦点。

<ComponentPreview name="input-group-settings-name">

<div></div>

</ComponentPreview>

## 对齐

用 `InputGroup.Addon` 的 `align` 属性设置附加项相对输入框的位置。

<Callout>

在 DOM 中将 `InputGroup.Addon` 放在 `InputGroup.Input` 或 `InputGroup.Textarea` 之后，键盘会先到达输入区。用 `align` 调整附加项的视觉位置。点击纯文字或装饰图标会聚焦输入区，按钮、标签和链接各自保留原有行为。

</Callout>

### inline-start

传入 `align="inline-start"` 把附加项放在输入框起始位置，这是默认值。

<ComponentPreview name="input-group-inline-start">

<div></div>

</ComponentPreview>

### inline-end

传入 `align="inline-end"` 把附加项放在输入框末尾。

<ComponentPreview name="input-group-inline-end">

<div></div>

</ComponentPreview>

### block-start

传入 `align="block-start"` 把附加项放在输入框上方。

<ComponentPreview name="input-group-block-start">

<div></div>

</ComponentPreview>

### block-end

传入 `align="block-end"` 把附加项放在输入框下方。

<ComponentPreview name="input-group-block-end">

<div></div>

</ComponentPreview>

## 图标

<ComponentPreview name="input-group-icon-demo">

<div></div>

</ComponentPreview>

## 文本

<ComponentPreview name="input-group-text-demo">

<div></div>

</ComponentPreview>

## 按钮

<ComponentPreview name="input-group-button-demo">

<div></div>

</ComponentPreview>

## 键帽

<ComponentPreview name="input-group-kbd">

<div></div>

</ComponentPreview>

## 下拉菜单

<ComponentPreview name="input-group-dropdown-demo">

<div></div>

</ComponentPreview>

## 加载指示器

本地预览模拟检查工作区网址。焦点与校验结果使用组合边框。输入“design”可看到错误，修改后可以重新检查。管理员配置的网址展示禁用状态。

<ComponentPreview name="input-group-spinner-demo">

<div></div>

</ComponentPreview>

## 多行输入框

底部附加区可放操作按钮和字数说明。输入框随草稿增长，有内容后即可发送。

<ComponentPreview name="input-group-textarea-demo">

<div></div>

</ComponentPreview>

## 自定义输入框

给自定义输入框加上 `data-slot="input-group-control"` 属性，焦点状态会自动处理。

以下是一个自定义多行输入框示例，随内容自动调整高度。

<ComponentPreview name="input-group-custom-input-demo">

<div></div>

</ComponentPreview>
