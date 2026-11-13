---
title: Textarea
description: Displays a form textarea or a component that looks like a textarea.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/textarea
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

<ComponentPreview name="textarea-demo" class="[&_[data-tuning-current]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="textarea" />
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
  import { Textarea } from "$lib/components/ui/textarea/index.js";
</script>
```

```svelte
<label for="message">Message</label>
<Textarea id="message" />
```

## Field

Use `Field.Field`, `Field.Label`, and `Field.Description` to create a textarea with a label and description. Link the description to the textarea with `aria-describedby`.

<ComponentPreview name="textarea-field" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Team description

Use `appearance="settings"` for a compact settings card. It is 120 px high with 16 px padding and 13 px text. Overflow scrolls inside the field. The team description example uses the 255-character limit observed in Linear and adds a visible character count in Valar. The default appearance still grows with its contents.

<ComponentPreview name="textarea-team-description" class="[&_[data-align]>*]:max-w-md">

<div></div>

</ComponentPreview>

## Disabled

Use the `disabled` prop to disable the textarea. To style the disabled state, add the `data-disabled` attribute to the `Field.Field` component.

<ComponentPreview name="textarea-disabled" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Read-only

Use `readonly` when the value can be selected and copied.

<ComponentPreview name="textarea-readonly" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Invalid

Set `aria-invalid` and link the error with `aria-describedby`. Set `data-invalid` on `Field.Field` for the surrounding state. Type a message to clear the example error.

<ComponentPreview name="textarea-invalid" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>

## Button

Pair with `Button` to create a textarea with a submit button. The form clears the draft and shows confirmation in the preview.

<ComponentPreview name="textarea-button" class="[&_[data-align]>*]:max-w-xs">

<div></div>

</ComponentPreview>
