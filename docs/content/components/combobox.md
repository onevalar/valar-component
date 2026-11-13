---
title: Combobox
description: Autocomplete input with a list of suggestions.
component: true
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="combobox-demo">

<div></div>

</ComponentPreview>

This preview follows Linear’s issue assignee picker. Open it to focus search, type to filter, and use the arrow keys and Enter to choose. A checkmark identifies the current assignee separately from keyboard highlight. The preview uses local example data.

## Installation

<PMAddComp name="combobox" />

The shared package exports `@valar/svelte-ui/combobox`.

## Usage

```svelte
<script lang="ts">
  import { Combobox } from "$lib/components/ui/combobox/index.js";

  const options = [
    { id: "", label: "Unassigned" },
    { id: "ada", label: "Ada Chen", keywords: ["design"] },
    { id: "morgan", label: "Morgan Lee" },
  ];

  let value = $state<readonly string[]>([""]);
</script>

<Combobox label="Assignee" placeholder="Assign to…" {options} bind:value />
```

`value` contains the selected IDs. A single choice closes the panel and returns focus to the trigger. Multiple choices keep the panel open. Use `group` for headings and `keywords` for search aliases. Include an explicit “Unassigned” option when a single selection can be cleared.

## Basic

A simple combobox with a list of frameworks.

<ComponentPreview name="combobox-basic">

<div></div>

</ComponentPreview>

## Groups

Set `group` on an option to show a group heading.

<ComponentPreview name="combobox-groups">

<div></div>

</ComponentPreview>

## Custom Items

Use the `option` snippet to show an avatar, icon, or secondary label. The trailing slot shows selection.

<ComponentPreview name="combobox-custom">

<div></div>

</ComponentPreview>

## Invalid

Set `aria-invalid` in `triggerProps` and connect the error text using `aria-describedby`.

<ComponentPreview name="combobox-invalid">

<div></div>

</ComponentPreview>

## Disabled

Use the `disabled` prop to disable the combobox.

<ComponentPreview name="combobox-disabled">

<div></div>

</ComponentPreview>

## Popup

Use the `children` snippet to customize the trigger label and icons. You can set `side`, `align`, or `contentClass`; collision handling keeps the panel within the viewport.

<ComponentPreview name="combobox-popup">

<div></div>

</ComponentPreview>

## Multiple selection

Use `multiple` to add or remove labels. Search stays open after each choice, and keyboard navigation skips disabled options.

<ComponentPreview name="combobox-multiple">

<div></div>

</ComponentPreview>

## Async search

Bind `query` and set `filter={false}` to show results from the caller. Type `support` to exercise a local failure and retry. Changing the query starts a fresh lookup.

<ComponentPreview name="combobox-async">

<div></div>

</ComponentPreview>
