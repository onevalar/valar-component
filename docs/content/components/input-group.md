---
title: Input Group
description: Add addons, buttons, and helper content to inputs.
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

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="input-group" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

Install `@lucide/svelte`:

</Step>

<PMInstall command="@lucide/svelte -D" />

<Step>

Copy and paste the following code into your project.

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

## Usage

```svelte showLineNumbers
<script lang="ts">
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
  import SearchIcon from "@lucide/svelte/icons/search";
</script>
```

```svelte showLineNumbers
<InputGroup.Root>
  <InputGroup.Input aria-label="Search components" placeholder="Search..." />
  <InputGroup.Addon aria-hidden="true">
    <SearchIcon />
  </InputGroup.Addon>
  <InputGroup.Addon align="inline-end">
    <InputGroup.Button>Search</InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>
```

## Settings search

Use `appearance="settings-search"` for the compact search field with a 16 px leading icon. The preview filters settings as you type. Press Escape or use the clear button to reset the query and return to the search field.

<ComponentPreview name="input-group-settings-search">

<div></div>

</ComponentPreview>

## Icon and name

Use `appearance="settings-name"` when an icon picker shares a border with a name field. The picker and the field each have their own accessible name and keyboard focus.

<ComponentPreview name="input-group-settings-name">

<div></div>

</ComponentPreview>

## Align

Use the `align` prop on `InputGroup.Addon` to position the addon relative to the input.

<Callout>

Place `InputGroup.Addon` after `InputGroup.Input` or `InputGroup.Textarea` in the DOM so keyboard users reach the input first. Use `align` for visual placement. Clicking a passive addon focuses the input. Buttons, labels, and links keep their own behavior.

</Callout>

### inline-start

Use `align="inline-start"` to position the addon at the start of the input. This is the default.

<ComponentPreview name="input-group-inline-start">

<div></div>

</ComponentPreview>

### inline-end

Use `align="inline-end"` to position the addon at the end of the input.

<ComponentPreview name="input-group-inline-end">

<div></div>

</ComponentPreview>

### block-start

Use `align="block-start"` to position the addon above the input.

<ComponentPreview name="input-group-block-start">

<div></div>

</ComponentPreview>

### block-end

Use `align="block-end"` to position the addon below the input.

<ComponentPreview name="input-group-block-end">

<div></div>

</ComponentPreview>

## Icon

<ComponentPreview name="input-group-icon-demo">

<div></div>

</ComponentPreview>

## Text

<ComponentPreview name="input-group-text-demo">

<div></div>

</ComponentPreview>

## Button

<ComponentPreview name="input-group-button-demo">

<div></div>

</ComponentPreview>

## Kbd

<ComponentPreview name="input-group-kbd">

<div></div>

</ComponentPreview>

## Dropdown

<ComponentPreview name="input-group-dropdown-demo">

<div></div>

</ComponentPreview>

## Spinner

This local preview checks a workspace URL. It reserves the shared border for the input's focus and error states. Try “design” to see the error, then edit the value to check again. The managed URL demonstrates a disabled field.

<ComponentPreview name="input-group-spinner-demo">

<div></div>

</ComponentPreview>

## Textarea

Use a bottom addon for actions and character limits. The textarea grows with the draft, and the send button becomes available when the draft has content.

<ComponentPreview name="input-group-textarea-demo">

<div></div>

</ComponentPreview>

## Custom Input

Add the `data-slot="input-group-control"` attribute to your custom input for automatic focus state handling.

Here's an example of a custom auto-resizing textarea.

<ComponentPreview name="input-group-custom-input-demo">

<div></div>

</ComponentPreview>
