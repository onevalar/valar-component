---
title: Progress
description: Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/progress
  doc: https://bits-ui.com/docs/components/progress
  api: https://bits-ui.com/docs/components/progress#api-reference
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

<ComponentPreview name="progress-project">

<div></div>

</ComponentPreview>

Use `appearance="project"` for a read-only project completion percentage. Move the slider to preview progress values. Give the indicator an accessible label, and put project status actions in a separate control.

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="progress" />
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
  import { Progress } from "$lib/components/ui/progress/index.js";
</script>
```

```svelte showLineNumbers
<Progress value={33} aria-label="Import progress" />
```

<ComponentPreview name="progress-demo">

<div></div>

</ComponentPreview>

## Label

Use a `Field` component to add a label to the progress bar.

<ComponentPreview name="progress-label">

<div></div>

</ComponentPreview>

## Controlled

A progress bar that can be controlled by a slider.

<ComponentPreview name="progress-controlled">

<div></div>

</ComponentPreview>

## Progress states

Pass `null` while the total is unknown. Set `min` and `max` to match the task range, and provide an accessible name.

<ComponentPreview name="progress-states">

<div></div>

</ComponentPreview>
