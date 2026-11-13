---
title: Range Calendar
description: A calendar component that allows users to select a range of dates.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/range-calendar
  doc: https://bits-ui.com/docs/components/range-calendar
  api: https://bits-ui.com/docs/components/range-calendar#api-reference
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

<ComponentPreview name="range-calendar-demo">

<div></div>

</ComponentPreview>

With `captionLayout="dropdown"`, month and year controls use the same Valar Select as Calendar. In narrow containers, these controls move below the month navigation buttons.

## About

The `<RangeCalendar />` component is built on top of the [Bits Range Calendar](https://www.bits-ui.com/docs/components/range-calendar) component, which uses the [@internationalized/date](https://react-spectrum.adobe.com/internationalized/date/index.html) package to handle dates.

## Blocks

You can see the `RangeCalendar` component in action in the 30+ [Calendar Blocks](/blocks/calendar) we've built.

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="range-calendar" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

Install `bits-ui` and `@internationalized/date`:

</Step>

<PMInstall command="bits-ui @internationalized/date -D" />

<Step>

Set up [Calendar](/docs/components/calendar), then copy the following code into your project. The CLI installs the component dependencies automatically.

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>
