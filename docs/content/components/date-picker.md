---
title: Date Picker
description: Select a day, month, quarter, half-year, or year by typing or using the calendar.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/date-picker
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="date-picker-demo">

<div></div>

</ComponentPreview>

## Installation

<PMAddComp name="date-picker" />

## Usage

```svelte
<script lang="ts">
	import { DatePicker, type Timeframe } from "$lib/components/ui/date-picker/index.js";

	let start = $state<Timeframe>();
	let target = $state<Timeframe>();
</script>

<DatePicker label="Start date" max={target} bind:value={start} />
<DatePicker label="Target date" min={start} bind:value={target} />
```

Type `May 2027`, `Q2 2027`, or `2027-05-20` and press Enter. The precision tabs also let you browse periods. The value stores the ISO date and the detected precision. To clear a date, use Clear date or empty the input and press Enter. Set `locale="zh-CN"` for Chinese labels or `precisions={["day"]}` to accept individual dates.

Use the Range Calendar composition below to select a continuous range within one calendar.

## Basic

A basic date picker component.

<ComponentPreview name="date-picker-basic">

<div></div>

</ComponentPreview>

## Range Picker

A date picker component for selecting a range of dates.

<ComponentPreview name="date-picker-range">

<div></div>

</ComponentPreview>

## Date of Birth

A date picker component for selecting a date of birth. This component includes a dropdown caption layout for date and month selection.

<ComponentPreview name="date-picker-dob">

<div></div>

</ComponentPreview>

## Input

A date picker component with an input field for selecting a date.

<ComponentPreview name="date-picker-input">

<div></div>

</ComponentPreview>

## Time Picker

A date picker component with a time input field for selecting a time.

<ComponentPreview name="date-picker-time">

<div></div>

</ComponentPreview>

## Natural Language Picker

This component uses the `chrono-node` library to parse natural language dates.

<ComponentPreview name="date-picker-natural-language">

<div></div>

</ComponentPreview>
