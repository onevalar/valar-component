---
title: 警告对话框
description: 打断用户操作、提示重要内容并要求给出响应的模态对话框。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/alert-dialog
  doc: https://bits-ui.com/docs/components/alert-dialog
  api: https://bits-ui.com/docs/components/alert-dialog#api-reference
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

<ComponentPreview name="alert-dialog-demo" title="丢弃草稿确认">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="alert-dialog" />
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

默认样式和 `appearance="confirmation"` 共用最大宽度为 480 px 的紧凑确认弹窗。传入 `focusCancel` 可先聚焦安全操作，草稿示例会先聚焦继续编辑。按 Escape 可以取消，点击丢弃草稿执行当前页面的示例操作。

删除确认使用 `appearance="danger"` 与危险操作按钮。提交时给 `AlertDialog.Action` 传入 `loading`，保留焦点并防止重复触发。失败时保留弹窗、显示错误和重试入口。删除示例模拟首次失败、重试成功。

```svelte showLineNumbers
<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";

  let open = $state(false);
</script>
```

```svelte showLineNumbers
<AlertDialog.Root bind:open>
  <AlertDialog.Trigger class={buttonVariants({ variant: "outline" })}>
    Show Dialog
  </AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This action cannot be undone. This will permanently delete your account
        from our servers.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={() => (open = false)}>Continue</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
```

## 基础用法

带标题、描述以及取消和继续按钮的基础警告对话框。

<ComponentPreview name="alert-dialog-basic">

<div></div>

</ComponentPreview>

## 小尺寸

传入 `size="sm"` 属性缩小警告对话框。

<ComponentPreview name="alert-dialog-small">

<div></div>

</ComponentPreview>

## 媒体

使用 `AlertDialog.Media` 组件为警告对话框添加图标或图片等媒体元素。

<ComponentPreview name="alert-dialog-media">

<div></div>

</ComponentPreview>

## 带媒体的小尺寸

传入 `size="sm"` 属性缩小警告对话框，再用 `AlertDialog.Media` 组件添加图标或图片等媒体元素。

<ComponentPreview name="alert-dialog-small-media">

<div></div>

</ComponentPreview>

## 危险

使用 `AlertDialog.Action` 组件为警告对话框添加危险操作按钮。

<ComponentPreview name="alert-dialog-destructive">

<div></div>

</ComponentPreview>
