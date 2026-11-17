---
title: Skeleton
description: Use to show a placeholder while content is loading.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/skeleton
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
</script>

<ComponentPreview name="skeleton-demo">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="skeleton" />
{/snippet}
{#snippet manual()}
<Steps>

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

```svelte
<script lang="ts">
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>
```

```svelte
<Skeleton class="h-[20px] w-[100px] rounded-full" />
```

## Issue filters

Use `appearance="filter"` for the 24 px placeholders shown while Linear generates issue filters. Set widths to match the eventual filters and `delay` in milliseconds to stagger their appearance. The local example reserves space for the filters, keeps the issue list visible, and announces when generation has finished.

<ComponentPreview name="skeleton-filter">

<div></div>

</ComponentPreview>

## Avatar

Keep the avatar at its intended diameter and let the text lines shrink to fit the available width. Set `aria-busy="true"` on the container while content is loading.

<ComponentPreview name="skeleton-avatar">

<div></div>

</ComponentPreview>

## Card

<ComponentPreview name="skeleton-card">

<div></div>

</ComponentPreview>

## Text

<ComponentPreview name="skeleton-text">

<div></div>

</ComponentPreview>

## Form

<ComponentPreview name="skeleton-form">

<div></div>

</ComponentPreview>

## Table

<ComponentPreview name="skeleton-table">

<div></div>

</ComponentPreview>
