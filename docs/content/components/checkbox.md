---
title: Checkbox
description: A control that allows the user to toggle between checked and not checked.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/checkbox
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

<ComponentPreview name="checkbox-demo">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="checkbox" />
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

```svelte
<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
</script>
```

```svelte
<Checkbox />
```

## Checked State

Use `bind:checked` to control the checkbox state, or `onCheckedChange` to listen for changes.

The default checkbox uses a 14 px square with 3 px corners. Click its label or press Space when the checkbox has focus to toggle it.

```svelte showLineNumbers
<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";

  let checked = $state(false);
</script>

<Checkbox bind:checked />
```

## Invalid State

Submit the example without accepting to see the linked error. Use the label or Space to correct it, then submit again.

Set `aria-invalid` on the checkbox and `data-invalid` on the field wrapper to show the invalid styles.

<ComponentPreview name="checkbox-invalid">

<div></div>

</ComponentPreview>

## Basic

Pair the checkbox with `Field.Field` and `Field.Label` for proper layout and labeling.

<ComponentPreview name="checkbox-basic">

<div></div>

</ComponentPreview>

## Description

Use `Field.Content` and `Field.Description` for helper text.

<ComponentPreview name="checkbox-description">

<div></div>

</ComponentPreview>

## Disabled

Use the `disabled` prop to prevent interaction and add the `data-disabled` attribute to the `<Field.Field>` component for disabled styles.

<ComponentPreview name="checkbox-disabled">

<div></div>

</ComponentPreview>

## Group

Import `CheckboxGroup` from the same `checkbox` entry. Give the group a `name` and each `Checkbox` a distinct string `value`. The group submits each selected value under its name. Use `defaultValue` for the initial and reset selection, or `bind:value` for the current selection. Group `required` means at least one selection.

If your form used Bits UI's `Checkbox.Group` with Valar checkboxes, replace the outer group with Valar's `CheckboxGroup` from the same entry. For an initial selection, pass `defaultValue` instead of a fixed `value`. If every item must be accepted, use separately named, required checkboxes rather than group `required`.

<ComponentPreview name="checkbox-group">

<div></div>

</ComponentPreview>

## Table

The header reflects mixed selection and controls the whole set. The row checkboxes retain independent labels and keyboard focus.

<ComponentPreview name="checkbox-table">

<div></div>

</ComponentPreview>
