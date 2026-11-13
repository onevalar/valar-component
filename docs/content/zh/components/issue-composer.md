---
title: 问题编辑弹窗
description: 支持展开的新建问题表单，包含标题、描述、状态、优先级和附件。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/issue-composer
---

<script>
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

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

列表标题栏和空状态入口可以共用同一个弹窗。`returnFocus` 返回当次触发器或仍可见的备用控件。展开和收起时保留草稿。打开「继续创建」后，每次提交会清空标题、描述和附件，并保留已选的状态和优先级。

状态与优先级菜单支持搜索、方向键、Enter 和搜索框为空时的数字快捷键。编辑时按 Ctrl+Enter 或 Command+Enter 提交。`onCreate` 返回表单和选中的 `File`，宿主可以保存问题和上传附件。
