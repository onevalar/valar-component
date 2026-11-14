---
title: 问题详情
description: 编辑问题内容、管理属性并参与活动和评论。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/issue-detail
---

<script>
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

[在 My issues 试用问题详情](/zh/themes/my-issues)。点击问题行或使用详情按钮打开。

## 安装

<PMAddComp name="issue-detail" />

## 用法

```svelte
<script lang="ts">
  import {
    IssueDetail,
    type IssueDetailValue,
  } from "$lib/components/ui/issue-detail/index.js";

  let issue = $state<IssueDetailValue>({
    id: "VLR-103",
    title: "补齐键盘导航",
    description: "检查关闭菜单后的焦点恢复。",
    status: "progress",
    priority: "high",
  });
</script>

<IssueDetail
  {issue}
  chinese
  assignees={[{ id: "mira", label: "Mira Chen" }]}
  projects={[{ id: "docs", label: "组件文档整理" }]}
  labelOptions={[{ id: "a11y", label: "无障碍" }]}
  onUpdate={(patch) => (issue = { ...issue, ...patch })}
/>
```

点击保存或按 Command/Ctrl+Enter 提交标题和描述草稿。点击取消或按 Escape 放弃草稿。每次属性选择会独立提交更新。传入 `onBack` 可显示返回列表的入口。

描述可传入纯文本或 `descriptionContent` 中的 Tiptap 文档。保存富文本时会同时返回结构化文档和纯文本。保存结构化字段可保留格式。

## 活动与评论

传入 `activity` 启用活动区。宿主管理按时间排列的 `IssueActivityEntry[]`，提供当前用户 `viewer`，并通过 `onAction` 处理发表、回复、编辑和属性变更。评论包含纯文本、可选的 Tiptap 文档和附件。示例可用 `applyIssueActivityAction` 把操作合并进本地状态。

```svelte
<script lang="ts">
  import {
    applyIssueActivityAction,
    type IssueActivityEntry,
  } from "$lib/components/ui/issue-detail/index.js";

  const viewer = { id: "self", name: "我" };
  let entries = $state<readonly IssueActivityEntry[]>([]);
</script>

<IssueDetail
  {issue}
  chinese
  activity={{
    entries,
    viewer,
    onAction: (action) =>
      (entries = applyIssueActivityAction(entries, action, viewer)),
  }}
  onUpdate={(patch) => (issue = { ...issue, ...patch })}
/>
```

只有作者的评论显示编辑入口。按 Command/Ctrl+Enter 发表或保存。脏草稿在取消时要求确认。

## 订阅、回应与线程

传入 `activity.collaboration` 启用协作控件。宿主提供 `people`、当前 `subscribers`、问题级 `reactions` 和 `onAction`，并使用评论上的 `reactions` 与线程上的 `resolution` 还原各自状态。操作带有目标状态，宿主重复处理同一操作时可以保留相同结果。

```svelte
<script lang="ts">
  import {
    applyIssueActivityAction,
    applyIssueCollaborationAction,
    type IssueCollaborationState,
  } from "$lib/components/ui/issue-detail/index.js";

  const viewer = { id: "self", name: "我" };
  const people = [viewer, { id: "mira", name: "Mira Chen" }];
  let state = $state<IssueCollaborationState>({ entries: [], subscribers: [], reactions: [] });
</script>

<IssueDetail
  {issue}
  chinese
  activity={{
    entries: state.entries,
    viewer,
    onAction: (action) =>
      (state = { ...state, entries: applyIssueActivityAction(state.entries, action, viewer) }),
    collaboration: {
      people,
      subscribers: state.subscribers,
      reactions: state.reactions,
      onAction: (action) => (state = applyIssueCollaborationAction(state, action, viewer)),
    },
  }}
  onUpdate={(patch) => (issue = { ...issue, ...patch })}
/>
```

活动区标题旁可以订阅或管理订阅者。表情选择器可搜索常用表情或粘贴单个 Unicode 表情。点已选回应可取消自己的回应。已解决线程默认折叠，展开后可查看评论和回应，并可从菜单重新打开。
