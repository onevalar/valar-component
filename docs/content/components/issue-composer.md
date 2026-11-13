---
title: Issue Composer
description: An expandable form for creating issues with a title, description, status, priority, and attachments.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/issue-composer
---

<script>
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

[Try the interactive issue composer](/themes/new-issue).

## Installation

<PMAddComp name="issue-composer" />

## Usage

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

<button bind:this={opener} onclick={() => (open = true)}>New issue</button>
<IssueComposer
  bind:open
  returnFocus={() => opener}
  onCreate={(issue) => (issues = [...issues, issue])}
/>
```

Use a single composer for the list header and empty-state action. Set `returnFocus` to the current trigger or a visible fallback. The dialog keeps the draft when the editor is expanded or collapsed. With **Create more** enabled, each submission clears the title, description, and attachments and keeps the selected status and priority.

Status and priority pickers support search, arrow keys, Enter, and number shortcuts with an empty search. Press Ctrl+Enter or Command+Enter while editing to submit. `onCreate` receives the draft and selected `File` objects. The host can persist and upload them.
