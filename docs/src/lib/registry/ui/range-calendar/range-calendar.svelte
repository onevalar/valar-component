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
		appearance = "default",
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
		appearance?: "default" | "cycle";
		buttonVariant?: ButtonVariant;
		captionLayout?: "dropdown" | "dropdown-months" | "dropdown-years" | "label";
		months?: RangeCalendarPrimitive.MonthSelectProps["months"];
		years?: RangeCalendarPrimitive.YearSelectProps["years"];
		monthFormat?: RangeCalendarPrimitive.MonthSelectProps["monthFormat"];
		yearFormat?: RangeCalendarPrimitive.YearSelectProps["yearFormat"];
		day?: Snippet<[{ day: DateValue; outsideMonth: boolean }]>;
	} = $props();

	const cycleAppearanceClasses =
		"w-full max-w-[492px] min-w-0 p-0 [--cell-size:26px] [--cycle-date-text:lch(20%_1_282)] [--cycle-date-muted:lch(66%_1_282)] [--cycle-range:lch(90.55%_0_282)] dark:[--cycle-date-text:lch(90.826%_1.425_272)] dark:[--cycle-date-muted:lch(39.452%_1.425_272)] dark:[--cycle-range:lch(16.32%_1.48_272)]";
	const cycle = $derived(appearance === "cycle");
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
	data-appearance={appearance}
	class={cn(
		"cn-calendar group/calendar bg-background p-3 [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
		"cn-range-calendar-geometry",
		cycle && cycleAppearanceClasses,
		className
	)}
	{locale}
	{monthFormat}
	{yearFormat}
	{...restProps}
>
	{#snippet children({ months, weekdays })}
		<RangeCalendarMonths
			data-month-count={cycle ? months.length : undefined}
			class={cycle
				? "grid grid-cols-[repeat(auto-fit,minmax(min(100%,246px),1fr))] gap-0 data-[month-count=1]:mx-auto data-[month-count=1]:max-w-[246px]"
				: undefined}
		>
			<RangeCalendarNav
				class={cycle ? "start-auto end-2 top-1 z-10 w-auto justify-end gap-1" : undefined}
			>
				<RangeCalendarPrevButton
					variant={buttonVariant}
					class={cycle ? "size-7 rounded-full [&>svg]:size-3.5" : undefined}
				/>
				<RangeCalendarNextButton
					variant={buttonVariant}
					class={cycle ? "size-7 rounded-full [&>svg]:size-3.5" : undefined}
				/>
			</RangeCalendarNav>
			{#each months as month, monthIndex (month)}
				<RangeCalendarMonth
					data-slot="range-calendar-month"
					class={cn(
						hasCaptionSelect && "@container w-[calc(var(--cell-size)*7)] min-w-0 max-w-full",
						cycle && "w-full max-w-[246px] min-w-0 justify-self-center"
					)}
				>
					{#if hasCaptionSelect}
						<div aria-hidden="true" class="mb-2 h-(--cell-size) @min-[256px]:hidden"></div>
					{/if}
					<RangeCalendarHeader
						class={cn(
							hasCaptionSelect &&
								"min-w-0 gap-2 px-[calc(var(--cell-size)+0.5rem)] @max-[256px]:px-0",
							cycle &&
								"h-9 justify-start px-2 text-xs/[18px] font-normal text-(color:--cycle-date-text)"
						)}
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

					<RangeCalendarGrid class={cycle ? "mt-2 gap-4 px-1 pb-6" : undefined}>
						<RangeCalendarGridHead>
							<RangeCalendarGridRow class="select-none">
								{#each weekdays as weekday, i (i)}
									<RangeCalendarHeadCell
										class={cn(
											(hasCaptionSelect || cycle) && "min-w-0 flex-1",
											cycle && "h-[19.5px] text-[13px]/[19.5px]"
										)}
									>
										{#if cycle}
											<span class="inline-block w-(--cell-size) max-w-full">{weekday}</span>
										{:else}
											{weekday.slice(0, 2)}
										{/if}
									</RangeCalendarHeadCell>
								{/each}
							</RangeCalendarGridRow>
						</RangeCalendarGridHead>
						<RangeCalendarGridBody>
							{#each month.weeks as weekDates, weekIndex (weekDates)}
								<RangeCalendarGridRow class={cycle && weekIndex === 0 ? "w-full" : "mt-2 w-full"}>
									{#each weekDates as date (date)}
										<RangeCalendarCell
											{date}
											month={month.value}
											{appearance}
											class={hasCaptionSelect || cycle
												? "min-w-0 flex-1 [&_[data-range-calendar-day]]:max-w-full"
												: undefined}
										>
											{#if day}
												{@render day({
													day: date,
													outsideMonth: !isEqualMonth(date, month.value)
												})}
											{:else}
												<RangeCalendarDay {appearance} />
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
