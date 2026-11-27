---
title: Radio Group
description: A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/radio-group
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

<ComponentPreview name="radio-group-demo">

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

Install the UI SDK and the style helper:

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
  import { Label } from "$lib/components/ui/label/index.js";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
</script>
```

```svelte showLineNumbers
<RadioGroup.Root defaultValue="option-one" aria-label="Options">
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

## Form behavior

Set a non-empty `name` for native form submission and `required` validation.
An unselected group or a disabled selection contributes no form entry. Use
`defaultValue` to set the reset value, or `bind:value` and your form's reset
handler when the parent owns the value. In Svelte, `""` means no selection;
use unique, non-empty values for the items. Clear a selection when disabling
that option if submission must require an enabled choice; the browser can
consider a checked, disabled radio valid even though it won't submit it.

## Description

Radio group items with a description using the `Field` component.

<ComponentPreview name="radio-group-description">

<div></div>

</ComponentPreview>

## Choice Card

Wrap `Field.Field` in `Field.Label` to make the whole card clickable. Use
`aria-labelledby` to link the radio to the card title and `aria-describedby`
to link it to the supporting text.

<ComponentPreview name="radio-group-choice-card">

<div></div>

</ComponentPreview>

## Fieldset

Use `Field.Set` and `Field.Legend` to group radio items with a label and description.

<ComponentPreview name="radio-group-fieldset">

<div></div>

</ComponentPreview>

## Disabled

Use the `disabled` prop on `RadioGroup.Item` to disable individual items.

<ComponentPreview name="radio-group-disabled">

<div></div>

</ComponentPreview>

## Invalid

Use `aria-invalid` on `RadioGroup.Item` and `data-invalid` on `Field.Field` to show validation errors.

<ComponentPreview name="radio-group-invalid">

<div></div>

</ComponentPreview>
