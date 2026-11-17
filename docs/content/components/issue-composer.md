---
title: Issue Composer
description: An expandable form for creating issues with rich descriptions, searchable properties, attachments, and drafts.
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

Use a single composer for the list header and empty-state action. Set `returnFocus` to the current trigger or a visible fallback. Expanding or collapsing the editor keeps the same draft. With **Create more** enabled, each submission clears the title, description, and attachments and keeps the selected properties.

Pass `teams`, `assignees`, `projects`, and `labels` as arrays of `{ id, label }`. Options can include `teamIds` to limit them to certain teams. A single team stays fixed, and the labels picker stays open when you select an item. Status and priority support number shortcuts with an empty search.

Type `/` in an empty paragraph for headings, lists, a checklist, a quote, a code block, a collapsible section, a Mermaid diagram, or a LaTeX formula. **Media** inserts a local image or video in the description. For a local image, choose **Crop image** and drag a handle or use the arrow keys. Hold Shift to move by ten pixels. **Attach files…** opens the same file picker as the footer. Press Ctrl+K or Command+K to edit a link, and Ctrl+Enter or Command+Enter to submit. The form body, option lists, and large diagram or formula previews use an overlay Scroll Area.

On a narrow screen, **Open menu** contains the image actions. Choose **Download** to save the current local image or video, and **Copy link** for media with a hosted URL. The video player provides keyboard controls for playback, seeking, volume, speed, and full-screen viewing.

When you close a changed form, you can discard it, return to editing, or save a draft. `onCreate` and `onSaveDraft` receive the plain `description`, optional rich `descriptionContent`, selected property IDs, and local `File` objects. `inlineMedia` associates the inserted media node IDs with the original files. Crop bounds live in the corresponding media nodes. Pass `inlineMedia` to Issue Detail to show local media. A host that uploads the original files can save their HTTPS URLs in the matching nodes' `src` attributes.
