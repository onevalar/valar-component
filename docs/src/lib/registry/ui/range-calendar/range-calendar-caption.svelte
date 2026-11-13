<script lang="ts">
	import { Caption } from "$lib/registry/ui/calendar/index.js";
	import RangeCalendarMonthSelect from "./range-calendar-month-select.svelte";
	import RangeCalendarYearSelect from "./range-calendar-year-select.svelte";
	import type RangeCalendar from "./range-calendar.svelte";
	import type { DateValue } from "@internationalized/date";
	import type { ComponentProps } from "svelte";

	let {
		captionLayout,
		months,
		monthFormat,
		years,
		yearFormat,
		month,
		locale,
		placeholder = $bindable(),
		monthIndex = 0,
	}: {
		captionLayout: ComponentProps<typeof RangeCalendar>["captionLayout"];
		months: ComponentProps<typeof RangeCalendarMonthSelect>["months"];
		monthFormat: ComponentProps<typeof RangeCalendarMonthSelect>["monthFormat"];
		years: ComponentProps<typeof RangeCalendarYearSelect>["years"];
		yearFormat: ComponentProps<typeof RangeCalendarYearSelect>["yearFormat"];
		month: DateValue;
		placeholder: DateValue | undefined;
		locale: string;
		monthIndex: number;
	} = $props();
</script>

<Caption
	range
	{captionLayout}
	{months}
	{monthFormat}
	{years}
	{yearFormat}
	{month}
	{locale}
	{monthIndex}
	bind:placeholder
/>
