---
title: Input
description: A text input component for forms and user data entry with built-in styling and accessibility features.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/input
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

<ComponentPreview name="input-demo" class="[&_[data-tuning-current]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="input" />
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
  import { Input } from "$lib/components/ui/input/index.js";
</script>
```

```svelte
<Input />
```

## Basic

<ComponentPreview name="input-basic" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Field

Use `Field.Field`, `Field.Label`, and `Field.Description` for a labeled input with help text. The team identifier example uppercases the value, caps it at seven characters, and updates the prefix in the help text as you type.

<ComponentPreview name="input-field" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Field Group

Use `Field.Group` to show multiple `Field.Field` blocks and to build forms.

<ComponentPreview name="input-fieldgroup" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Disabled

Use `disabled` to skip an input in keyboard navigation and exclude it from form submission. Set `data-disabled` on its `Field.Field` to style the associated label.

<ComponentPreview name="input-disabled" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Read-only

Use `readonly` when the value can be focused, selected, copied, and submitted but cannot be edited.

<ComponentPreview name="input-readonly" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Invalid

When a value fails validation, set `aria-invalid`, mark the field with `data-invalid`, and use `aria-describedby` to link to `Field.Error`. Try correcting the email to clear the error.

<ComponentPreview name="input-invalid" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## File

Use `type="file"` and `bind:files` to read the browser’s selected files.

<ComponentPreview name="input-file" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Inline

Use `Field.Field` with `orientation="horizontal"` to create an inline input.
Pair with `Button` to create a search input with a button.

<ComponentPreview name="input-inline" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Grid

Use a grid layout to place multiple inputs side by side.

<ComponentPreview name="input-grid">

<div></div>

</ComponentPreview>

## Required

Use the native `required` attribute. Hide any decorative asterisk from assistive technology so the requirement is announced once.

<ComponentPreview name="input-required" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Badge

Use `Badge` in the label to highlight a recommended field.

<ComponentPreview name="input-badge" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Input Group

To add icons, text, or buttons inside an input, use the `InputGroup` component. See the [Input Group](/docs/components/input-group) component for more examples.

<ComponentPreview name="input-input-group" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Button Group

To add buttons to an input, use the `ButtonGroup` component. See the [Button Group](/docs/components/button-group) component for more examples.

<ComponentPreview name="input-button-group" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Form

A full form example with multiple inputs, a select, and a button.

<ComponentPreview name="input-form">

<div></div>

</ComponentPreview>
