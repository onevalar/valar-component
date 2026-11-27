---
title: Separator
description: Visually or semantically separates content.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/separator
  doc: https://ui-sdk.dev/docs
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

<ComponentPreview name="separator-demo">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="separator" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

Install the dependencies used by Valar Separator:

</Step>

<PMInstall command="@ui-sdk/core@0.1.0-beta.17 @ui-sdk/svelte@0.1.0-beta.17 svelte-toolbelt@0.10.6" />

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
  import { Separator } from "$lib/components/ui/separator/index.js";
</script>
```

```svelte showLineNumbers
<Separator />
```

The default line is 0.5 px in both directions. For a visual divider between
settings rows, set `decorative` and align its ends with the row content.

## Vertical

Use `orientation="vertical"` for a vertical separator.

<ComponentPreview name="separator-vertical">

<div></div>

</ComponentPreview>

## Menu

Vertical separators between menu items with descriptions.

<ComponentPreview name="separator-menu">

<div></div>

</ComponentPreview>

## List

Horizontal separators between list items.

<ComponentPreview name="separator-list">

<div></div>

</ComponentPreview>

## API Reference

`orientation` defaults to `"horizontal"`. Set `decorative` for a visual-only line. Use `bind:ref` to access the element or the `child` snippet to render your own element with the supplied attributes.
