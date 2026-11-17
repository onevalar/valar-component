---
title: 问题编辑弹窗
description: 支持展开的新建问题表单，包含富文本描述、可搜索属性、附件和草稿。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/issue-composer
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="issue-composer-demo">

<div></div>

</ComponentPreview>

[试用新建问题弹窗](/zh/themes/new-issue)。

## 安装

<PMAddComp name="issue-composer" />

## 用法

```svelte
<script lang="ts">
  import {
    IssueComposer,
    type IssueDraft,
  } from "$lib/components/ui/issue-composer/index.js";

  let open = $state(false);
  let opener: HTMLButtonElement;
  let issues = $state<IssueDraft[]>([]);
</script>

<button bind:this={opener} onclick={() => (open = true)}>新建问题</button>
<IssueComposer
  bind:open
  chinese
  returnFocus={() => opener}
  onCreate={(issue) => (issues = [...issues, issue])}
/>
```

列表标题栏和空状态入口可以共用同一个弹窗。`returnFocus` 返回当次触发器或仍可见的备用控件。展开和收起时保留草稿。打开「继续创建」后，每次提交会清空标题、描述和附件，并保留已选属性。

`teams`、`assignees`、`projects` 和 `labels` 接受 `{ id, label }` 数组。选项可用 `teamIds` 限定适用团队。单团队不可切换，标签选择后保持菜单打开。状态和优先级在搜索框为空时支持数字快捷键。

空段落按 `/` 可插入标题、列表、检查清单、引用、代码块、折叠区块、Mermaid 图示和 LaTeX 公式。「媒体」把本地图片或视频插入正文。选择「裁剪图片」后，可拖动控制点或用方向键调整，按住 Shift 时每次移动 10 px。「添加附件…」打开与底栏相同的文件选择器。按 Ctrl+K 或 Command+K 编辑链接，按 Ctrl+Enter 或 Command+Enter 提交。表单主体、选项列表和大型图示或公式使用悬浮 Scroll Area。

窄屏通过「打开菜单」访问图片操作。「下载」保存当前的本地图片或视频，媒体已有托管地址时可以「复制链接」。视频播放器支持键盘控制播放、进度、音量、倍速和全屏。

关闭改动过的表单时，可以放弃、返回编辑或保存草稿。`onCreate` 和 `onSaveDraft` 返回纯文本 `description`、可选的富文本 `descriptionContent`、已选属性 ID 和本地 `File`。`inlineMedia` 将媒体节点 ID 与原文件关联，裁剪范围保存在对应节点内。可把 `inlineMedia` 传给 Issue Detail 显示本地媒体。宿主上传原文件后，可把 HTTPS 地址写入对应节点的 `src` 属性。
