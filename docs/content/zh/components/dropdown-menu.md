---
title: 下拉菜单
description: 显示由按钮触发的菜单，例如一组操作或功能。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/dropdown-menu
  doc: https://bits-ui.com/docs/components/dropdown-menu
  api: https://bits-ui.com/docs/components/dropdown-menu#api-reference
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

<ComponentPreview name="dropdown-menu-demo">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="dropdown-menu" />
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
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
</script>
```

```svelte showLineNumbers
<DropdownMenu.Root>
  <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Label>My Account</DropdownMenu.Label>
      <DropdownMenu.Item>Profile</DropdownMenu.Item>
      <DropdownMenu.Item>Billing</DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Group>
      <DropdownMenu.Item>Team</DropdownMenu.Item>
      <DropdownMenu.Item>Subscription</DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## 基础用法

面板外观取样于 Linear 工作区切换菜单。鼠标移动与键盘导航使用同一套行高亮。用分组标题和分隔线组织相关命令。

<ComponentPreview name="dropdown-menu-basic">

<div></div>

</ComponentPreview>

## 子菜单

用 `DropdownMenu.Sub` 嵌套次级操作。

<ComponentPreview name="dropdown-menu-submenu">

<div></div>

</ComponentPreview>

## 快捷键

用 `DropdownMenu.Shortcut` 将快捷键提示放在行尾。如果菜单关闭时也能使用快捷键，需要另外绑定按键。

<ComponentPreview name="dropdown-menu-shortcuts">

<div></div>

</ComponentPreview>

## 图标

图标与标签搭配，便于快速浏览。

<ComponentPreview name="dropdown-menu-icons">

<div></div>

</ComponentPreview>

## 复选框

用 `DropdownMenu.CheckboxItem` 实现可勾选的菜单项。

<ComponentPreview name="dropdown-menu-checkboxes">

<div></div>

</ComponentPreview>

## 带图标的复选框

为复选项加上图标。

<ComponentPreview name="dropdown-menu-checkboxes-icons">

<div></div>

</ComponentPreview>

## 单选按钮组

用 `DropdownMenu.RadioGroup` 实现互斥选择。行尾对勾显示当前值，鼠标或键盘焦点移动时改变行底色。选值后默认保持菜单打开，切换工作区等流程可以通过 `closeOnSelect` 选后关闭。

<ComponentPreview name="dropdown-menu-radio-group">

<div></div>

</ComponentPreview>

## 带图标的单选按钮

带图标的单选选项。

<ComponentPreview name="dropdown-menu-radio-icons">

<div></div>

</ComponentPreview>

## 危险操作

Linear Issue 菜单通过中性色的删除项打开确认弹窗。打开确认弹窗时用普通 `DropdownMenu.Item`，危险色用于弹窗里的最终确认按钮。需要直接强调菜单命令时，可以使用 `variant="destructive"`。

<ComponentPreview name="dropdown-menu-destructive">

<div></div>

</ComponentPreview>

## 头像

由头像触发的账号切换下拉菜单。

<ComponentPreview name="dropdown-menu-avatar">

<div></div>

</ComponentPreview>

## 复杂示例

组合分组、图标和子菜单的完整示例。

<ComponentPreview name="dropdown-menu-complex">

<div></div>

</ComponentPreview>
