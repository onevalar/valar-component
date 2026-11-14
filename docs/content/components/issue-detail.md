---
title: Issue Detail
description: Edit issue content, manage properties, and participate in activity and comments.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/issue-detail
---

<script>
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

[Try Issue Detail in My issues](/themes/my-issues). Open an issue row or use the details button.

## Installation

<PMAddComp name="issue-detail" />

## Usage

```svelte
<script lang="ts">
  import {
    IssueDetail,
    type IssueDetailValue,
  } from "$lib/components/ui/issue-detail/index.js";

  let issue = $state<IssueDetailValue>({
    id: "VLR-103",
    title: "Finish keyboard navigation",
    description: "Check focus restoration after closing the menu.",
    status: "progress",
    priority: "high",
  });
</script>

<IssueDetail
  {issue}
  assignees={[{ id: "mira", label: "Mira Chen" }]}
  projects={[{ id: "docs", label: "Component documentation" }]}
  labelOptions={[{ id: "a11y", label: "Accessibility" }]}
  onUpdate={(patch) => (issue = { ...issue, ...patch })}
/>
```

Save or press Command/Ctrl+Enter to commit the title and description draft. Cancel or Escape discards that draft. Property selections produce separate updates immediately. Provide `onBack` to render a list navigation control.

The description accepts plain text or a Tiptap document in `descriptionContent`. Saving a rich-text edit returns the structured document and its plain-text counterpart. Store the structured value to preserve formatting.

## Activity and comments

Pass `activity` to show the activity section. The host provides chronological `IssueActivityEntry[]`, the current `viewer`, and an `onAction` callback for posts, replies, edits, and property changes. Comments carry plain text, an optional Tiptap document, and attachments. Previews can use `applyIssueActivityAction` to apply actions to local state.

```svelte
<script lang="ts">
  import {
    applyIssueActivityAction,
    type IssueActivityEntry,
  } from "$lib/components/ui/issue-detail/index.js";

  const viewer = { id: "self", name: "Me" };
  let entries = $state<readonly IssueActivityEntry[]>([]);
</script>

<IssueDetail
  {issue}
  activity={{
    entries,
    viewer,
    onAction: (action) =>
      (entries = applyIssueActivityAction(entries, action, viewer)),
  }}
  onUpdate={(patch) => (issue = { ...issue, ...patch })}
/>
```

Authors can edit their own comments. Command/Ctrl+Enter posts or saves the draft. Cancelling a changed draft asks for confirmation.

## Subscriptions, reactions, and threads

Pass `activity.collaboration` to enable the collaboration controls. The host supplies `people`, current `subscribers`, issue-level `reactions`, and `onAction`. Store each comment's `reactions` and each thread's `resolution` alongside the entries. Actions carry the desired state, so the host can apply them repeatedly without toggling the result.

```svelte
<script lang="ts">
  import {
    applyIssueActivityAction,
    applyIssueCollaborationAction,
    type IssueCollaborationState,
  } from "$lib/components/ui/issue-detail/index.js";

  const viewer = { id: "self", name: "Me" };
  const people = [viewer, { id: "mira", name: "Mira Chen" }];
  let state = $state<IssueCollaborationState>({ entries: [], subscribers: [], reactions: [] });
</script>

<IssueDetail
  {issue}
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

Use the controls next to Activity to subscribe or manage subscribers. Search common emoji or paste a single Unicode emoji into the picker. Select a pressed reaction to remove your own reaction. Expand a resolved thread to see the comments and reactions, or reopen it from the comment menu.
