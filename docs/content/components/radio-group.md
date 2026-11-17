---
title: Radio Group
description: A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/radio-group
  doc: https://bits-ui.com/docs/components/radio-group
  api: https://bits-ui.com/docs/components/radio-group#api-reference
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

<ComponentPreview name="radio-group-demo">

<div></div>

</ComponentPreview>

## Jira import method

The default Valar radio is 16 px with a transparent unchecked surface, a thin border, and a 4 px dot on the selected accent fill. Keyboard focus uses an inset outline. Set `appearance="settings"` for a 16 px gap between options. This example follows Jira's import method picker. Labels sit 12 px from the controls and wrap when space is limited. Horizontal, disabled, and invalid states follow the general Valar rules.

<ComponentPreview name="radio-group-jira">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="radio-group" />
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
  import { Label } from "$lib/components/ui/label/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
</script>
```

```svelte showLineNumbers
<RadioGroup.Root value="option-one" aria-label="Display density">
  <div class="flex items-center gap-3">
    <RadioGroup.Item value="option-one" id="option-one" />
    <Label for="option-one">Option One</Label>
  </div>
  <div class="flex items-center gap-3">
    <RadioGroup.Item value="option-two" id="option-two" />
    <Label for="option-two">Option Two</Label>
  </div>
</RadioGroup.Root>
```

## Description

Use `Field.Description` and reference its ID from each option's `aria-describedby`.

<ComponentPreview name="radio-group-description">

<div></div>

</ComponentPreview>

## Choice Card

Wrap the entire `Field.Field` in `Field.Label` for a clickable card. Reference its title with `aria-labelledby` and its supporting text with `aria-describedby`.

<ComponentPreview name="radio-group-choice-card">

<div></div>

</ComponentPreview>

## Fieldset

Use `Field.Set` and `Field.Legend` for the group. Attach the legend to `RadioGroup.Root` with `aria-labelledby` and its description with `aria-describedby`.

<ComponentPreview name="radio-group-fieldset">

<div></div>

</ComponentPreview>

## Disabled

Use the `disabled` prop on `RadioGroup.Item` to disable individual items.

<ComponentPreview name="radio-group-disabled">

<div></div>

</ComponentPreview>

## Invalid

Set `aria-invalid` on the group and its items. Apply `data-invalid` to `Field.Field` and connect the `Field.Error` ID with `aria-describedby`.

<ComponentPreview name="radio-group-invalid">

<div></div>

</ComponentPreview>
