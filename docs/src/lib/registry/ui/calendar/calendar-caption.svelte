<script lang="ts">
	import { DateFormatter, getLocalTimeZone, type DateValue } from "@internationalized/date";
	import { Calendar as CalendarPrimitive, RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { tick } from "svelte";
	import * as Select from "$lib/registry/ui/select/index.js";
	import type Calendar from "./calendar.svelte";
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
		range = false,
	}: {
		captionLayout: ComponentProps<typeof Calendar>["captionLayout"];
		months: CalendarPrimitive.MonthSelectProps["months"];
		monthFormat: CalendarPrimitive.MonthSelectProps["monthFormat"];
		years: CalendarPrimitive.YearSelectProps["years"];
		yearFormat: CalendarPrimitive.YearSelectProps["yearFormat"];
		month: DateValue;
		placeholder: DateValue | undefined;
		locale: string;
		monthIndex: number;
		range?: boolean;
	} = $props();

	const chinese = $derived(locale.toLowerCase().startsWith("zh"));
	let monthTrigger = $state<HTMLButtonElement | null>(null);
	let yearTrigger = $state<HTMLButtonElement | null>(null);
	const MonthPicker = $derived(
		range ? RangeCalendarPrimitive.MonthSelect : CalendarPrimitive.MonthSelect
	);
	const YearPicker = $derived(
		range ? RangeCalendarPrimitive.YearSelect : CalendarPrimitive.YearSelect
	);

	async function choose(part: "month" | "year", value: string) {
		if (!placeholder || !value) return;
		const trigger = part === "month" ? monthTrigger : yearTrigger;
		const calendar = trigger?.closest('[data-slot="calendar"],[data-slot="range-calendar"]');
		const selector = `[data-calendar-caption="${part}"][data-month-index="${monthIndex}"]`;
		placeholder = month.set({ [part]: Number(value) }).subtract({ months: monthIndex });
		await tick();
		calendar?.querySelector<HTMLButtonElement>(selector)?.focus({ preventScroll: true });
	}

	function formatYear(date: DateValue) {
		const dateObj = date.toDate(getLocalTimeZone());
		if (typeof yearFormat === "function") return yearFormat(dateObj.getFullYear());
		return new DateFormatter(locale, { year: yearFormat }).format(dateObj);
	}

	function formatMonth(date: DateValue) {
		const dateObj = date.toDate(getLocalTimeZone());
		if (typeof monthFormat === "function") return monthFormat(dateObj.getMonth() + 1);
		return new DateFormatter(locale, { month: monthFormat }).format(dateObj);
	}
</script>

{#snippet CaptionSelect(
	part: "month" | "year",
	items: { value: number; label: string }[],
	disabled: boolean
)}
	{@const current = month[part]}
	{@const label = part === "month" ? (chinese ? "月份" : "Month") : chinese ? "年份" : "Year"}
	<Select.Root
		type="single"
		value={String(current)}
		{disabled}
		onValueChange={(value) => void choose(part, value)}
	>
		<Select.Trigger
			size="sm"
			aria-label={label}
			data-calendar-caption={part}
			data-month-index={monthIndex}
			bind:ref={
				() => (part === "month" ? monthTrigger : yearTrigger),
				(node) => {
					if (part === "month") monthTrigger = node;
					else yearTrigger = node;
				}
			}
			class="h-(--cell-size)!"
		>
			<span class="min-w-0 truncate">
				{items.find((item) => item.value === current)?.label ??
					(part === "month" ? formatMonth(month) : formatYear(month))}
			</span>
		</Select.Trigger>
		<Select.Content
			align="start"
			appearance="settings"
			data-calendar-caption-options={part}
			class="max-h-[min(15rem,var(--bits-select-content-available-height,15rem))]!"
			collisionPadding={8}
		>
			{#each items as item (item.value)}
				<Select.Item value={String(item.value)} label={item.label} />
			{/each}
		</Select.Content>
	</Select.Root>
{/snippet}

{#snippet MonthSelect()}
	<MonthPicker {months} {monthFormat}>
		{#snippet child({ props, monthItems })}
			{@render CaptionSelect("month", monthItems, Boolean(props.disabled))}
		{/snippet}
	</MonthPicker>
{/snippet}

{#snippet YearSelect()}
	<YearPicker {years} {yearFormat}>
		{#snippet child({ props, yearItems })}
			{@render CaptionSelect("year", yearItems, Boolean(props.disabled))}
		{/snippet}
	</YearPicker>
{/snippet}

{#if captionLayout === "dropdown"}
	{@render MonthSelect()}
	{@render YearSelect()}
{:else if captionLayout === "dropdown-months"}
	{@render MonthSelect()}
	{formatYear(month)}
{:else if captionLayout === "dropdown-years"}
	{formatMonth(month)}
	{@render YearSelect()}
{:else}
	{formatMonth(month)} {formatYear(month)}
{/if}
