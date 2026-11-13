<script lang="ts">
	import { isEqualMonth, type DateValue } from "@internationalized/date";
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import type { ButtonVariant } from "$lib/registry/ui/button/index.js";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import RangeCalendarCaption from "./range-calendar-caption.svelte";
	import RangeCalendarCell from "./range-calendar-cell.svelte";
	import RangeCalendarDay from "./range-calendar-day.svelte";
	import RangeCalendarGridBody from "./range-calendar-grid-body.svelte";
	import RangeCalendarGridHead from "./range-calendar-grid-head.svelte";
	import RangeCalendarGridRow from "./range-calendar-grid-row.svelte";
	import RangeCalendarGrid from "./range-calendar-grid.svelte";
	import RangeCalendarHeadCell from "./range-calendar-head-cell.svelte";
	import RangeCalendarHeader from "./range-calendar-header.svelte";
	import RangeCalendarMonth from "./range-calendar-month.svelte";
	import RangeCalendarMonths from "./range-calendar-months.svelte";
	import RangeCalendarNav from "./range-calendar-nav.svelte";
	import RangeCalendarNextButton from "./range-calendar-next-button.svelte";
	import RangeCalendarPrevButton from "./range-calendar-prev-button.svelte";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		value = $bindable(),
		placeholder = $bindable(),
		weekdayFormat = "short",
		class: className,
		buttonVariant = "ghost",
		captionLayout = "label",
		locale = "zh-CN",
		months: monthsProp,
		years,
		monthFormat: monthFormatProp,
		yearFormat = "numeric",
		day,
		disableDaysOutsideMonth = false,
		...restProps
	}: WithoutChildrenOrChild<RangeCalendarPrimitive.RootProps> & {
		buttonVariant?: ButtonVariant;
		captionLayout?: "dropdown" | "dropdown-months" | "dropdown-years" | "label";
		months?: RangeCalendarPrimitive.MonthSelectProps["months"];
		years?: RangeCalendarPrimitive.YearSelectProps["years"];
		monthFormat?: RangeCalendarPrimitive.MonthSelectProps["monthFormat"];
		yearFormat?: RangeCalendarPrimitive.YearSelectProps["yearFormat"];
		day?: Snippet<[{ day: DateValue; outsideMonth: boolean }]>;
	} = $props();

	const hasCaptionSelect = $derived(captionLayout !== "label");
	const monthFormat = $derived.by(() => {
		if (monthFormatProp) return monthFormatProp;
		if (captionLayout.startsWith("dropdown")) return "short";
		return "long";
	});
</script>

<RangeCalendarPrimitive.Root
	bind:ref
	bind:value
	bind:placeholder
	{weekdayFormat}
	{disableDaysOutsideMonth}
	data-slot="range-calendar"
	class={cn(
		"cn-calendar group/calendar bg-background p-3 [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
		"cn-range-calendar-geometry",
		className
	)}
	{locale}
	{monthFormat}
	{yearFormat}
	{...restProps}
>
	{#snippet children({ months, weekdays })}
		<RangeCalendarMonths>
			<RangeCalendarNav>
				<RangeCalendarPrevButton variant={buttonVariant} />
				<RangeCalendarNextButton variant={buttonVariant} />
			</RangeCalendarNav>
			{#each months as month, monthIndex (month)}
				<RangeCalendarMonth
					class={hasCaptionSelect
						? "@container w-[calc(var(--cell-size)*7)] min-w-0 max-w-full"
						: undefined}
				>
					{#if hasCaptionSelect}
						<div aria-hidden="true" class="mb-2 h-(--cell-size) @min-[256px]:hidden"></div>
					{/if}
					<RangeCalendarHeader
						class={hasCaptionSelect
							? "min-w-0 gap-2 px-[calc(var(--cell-size)+0.5rem)] @max-[256px]:px-0"
							: undefined}
					>
						<RangeCalendarCaption
							{captionLayout}
							months={monthsProp}
							{monthFormat}
							{years}
							{yearFormat}
							month={month.value}
							bind:placeholder
							{locale}
							{monthIndex}
						/>
					</RangeCalendarHeader>

					<RangeCalendarGrid>
						<RangeCalendarGridHead>
							<RangeCalendarGridRow class="select-none">
								{#each weekdays as weekday, i (i)}
									<RangeCalendarHeadCell class={hasCaptionSelect ? "min-w-0 flex-1" : undefined}>
										{weekday.slice(0, 2)}
									</RangeCalendarHeadCell>
								{/each}
							</RangeCalendarGridRow>
						</RangeCalendarGridHead>
						<RangeCalendarGridBody>
							{#each month.weeks as weekDates (weekDates)}
								<RangeCalendarGridRow class="mt-2 w-full">
									{#each weekDates as date (date)}
										<RangeCalendarCell
											{date}
											month={month.value}
											class={hasCaptionSelect
												? "min-w-0 flex-1 [&_[data-range-calendar-day]]:max-w-full"
												: undefined}
										>
											{#if day}
												{@render day({
													day: date,
													outsideMonth: !isEqualMonth(date, month.value),
												})}
											{:else}
												<RangeCalendarDay />
											{/if}
										</RangeCalendarCell>
									{/each}
								</RangeCalendarGridRow>
							{/each}
						</RangeCalendarGridBody>
					</RangeCalendarGrid>
				</RangeCalendarMonth>
			{/each}
		</RangeCalendarMonths>
	{/snippet}
</RangeCalendarPrimitive.Root>
