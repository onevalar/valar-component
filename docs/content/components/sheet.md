---
title: Sheet
description: Displays supplemental content in an edge modal or alongside the current workspace.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/sheet
  doc: https://bits-ui.com/docs/components/dialog
  api: https://bits-ui.com/docs/components/dialog#api-reference
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

<ComponentPreview name="sheet-project-details" title="Timeline details panel" tunable={false}>

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="sheet" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

Install `bits-ui`:

</Step>

<PMInstall command="bits-ui -D" />

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
  import * as Sheet from "$lib/components/ui/sheet/index.js";
</script>
```

```svelte showLineNumbers
<Sheet.Root>
  <Sheet.Trigger>Open</Sheet.Trigger>
  <Sheet.Content>
    <Sheet.Header>
      <Sheet.Title>Are you sure absolutely sure?</Sheet.Title>
      <Sheet.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Sheet.Description>
    </Sheet.Header>
  </Sheet.Content>
</Sheet.Root>
```

## Timeline Sidebar

Use `Sheet.Panel` for a nonmodal sidebar that stays beside the workspace, as in the Projects timeline preview. Bind its `open` state to the toolbar button, link them with `aria-controls`, and give the panel a `label`. The workspace remains available and the panel scrolls independently. In the example, narrow layouts stack the sidebar below the timeline.

The Valar panel also closes on Escape when focus is inside it. Pass the toolbar element as `trigger` to return focus there. Use `Sheet.Root` and `Sheet.Content` for an edge modal with an overlay and focus containment. `appearance="details"` on `Sheet.Content` gives that modal the detail card styling.

## Basic

<ComponentPreview name="sheet-demo">

<div></div>

</ComponentPreview>

## Side

Use the `side` prop on `Sheet.Content` to set the edge of the screen where the sheet appears. Values are `top`, `right`, `bottom`, or `left`.

<ComponentPreview name="sheet-side">

<div></div>

</ComponentPreview>

## No Close Button

Use `showCloseButton={false}` on `Sheet.Content` to hide the close button.

<ComponentPreview name="sheet-no-close-button">

<div></div>

</ComponentPreview>
