<script lang="ts">
	import { isEqualMonth, type DateValue } from "@internationalized/date";
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import CalendarCaption from "./calendar-caption.svelte";
	import CalendarCell from "./calendar-cell.svelte";
	import CalendarDay from "./calendar-day.svelte";
	import CalendarGridBody from "./calendar-grid-body.svelte";
	import CalendarGridHead from "./calendar-grid-head.svelte";
	import CalendarGridRow from "./calendar-grid-row.svelte";
	import CalendarGrid from "./calendar-grid.svelte";
	import CalendarHeadCell from "./calendar-head-cell.svelte";
	import CalendarHeader from "./calendar-header.svelte";
	import CalendarMonth from "./calendar-month.svelte";
	import CalendarMonths from "./calendar-months.svelte";
	import CalendarNav from "./calendar-nav.svelte";
	import CalendarNextButton from "./calendar-next-button.svelte";
	import CalendarPrevButton from "./calendar-prev-button.svelte";
	import type { ButtonVariant } from "../button/button.svelte";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		value = $bindable(),
		placeholder = $bindable(),
		class: className,
		appearance = "default",
		weekdayFormat = "short",
		buttonVariant = "ghost",
		captionLayout = "label",
		locale = "zh-CN",
		weekStartsOn = 1,
		months: monthsProp,
		years,
		monthFormat: monthFormatProp,
		yearFormat = "numeric",
		day,
		disableDaysOutsideMonth = false,
		...restProps
	}: WithoutChildrenOrChild<CalendarPrimitive.RootProps> & {
		appearance?: "default" | "project-date";
		buttonVariant?: ButtonVariant;
		captionLayout?: "dropdown" | "dropdown-months" | "dropdown-years" | "label";
		months?: CalendarPrimitive.MonthSelectProps["months"];
		years?: CalendarPrimitive.YearSelectProps["years"];
		monthFormat?: CalendarPrimitive.MonthSelectProps["monthFormat"];
		yearFormat?: CalendarPrimitive.YearSelectProps["yearFormat"];
		day?: Snippet<[{ day: DateValue; outsideMonth: boolean }]>;
	} = $props();

	const appearanceClass = $derived(appearance === "project-date" && "cn-calendar-project-date");
	const hasCaptionSelect = $derived(captionLayout !== "label");
	const monthFormat = $derived.by(() => {
		if (monthFormatProp) return monthFormatProp;
		if (captionLayout.startsWith("dropdown")) return "short";
		return "long";
	});
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<CalendarPrimitive.Root
	bind:value={value as never}
	bind:ref
	bind:placeholder
	{weekdayFormat}
	{disableDaysOutsideMonth}
	data-slot="calendar"
	data-appearance={appearance === "default" ? undefined : appearance}
	data-caption-layout={captionLayout}
	class={cn(
		"cn-calendar group/calendar bg-background in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
		"cn-calendar-geometry",
		appearanceClass,
		className
	)}
	{locale}
	{weekStartsOn}
	{monthFormat}
	{yearFormat}
	{...restProps}
>
	{#snippet children({ months, weekdays })}
		<CalendarMonths>
			<CalendarNav data-slot="calendar-nav">
				<CalendarPrevButton variant={buttonVariant} />
				<CalendarNextButton variant={buttonVariant} />
			</CalendarNav>
			{#each months as month, monthIndex (month)}
				<CalendarMonth
					data-slot="calendar-month"
					class={hasCaptionSelect
						? "min-w-[calc(max(var(--cell-size),1.75rem)*2+11rem)]"
						: undefined}
				>
					<CalendarHeader
						class={hasCaptionSelect
							? "justify-center! gap-2 px-[calc(max(var(--cell-size),1.75rem)+0.5rem)]!"
							: undefined}
					>
						<CalendarCaption
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
					</CalendarHeader>
					<CalendarGrid>
						<CalendarGridHead>
							<CalendarGridRow class="select-none">
								{#each weekdays as weekday, i (i)}
									<CalendarHeadCell class={hasCaptionSelect ? "flex-1" : undefined}>
										{weekday.slice(0, 2)}
									</CalendarHeadCell>
								{/each}
							</CalendarGridRow>
						</CalendarGridHead>
						<CalendarGridBody>
							{#each month.weeks as weekDates (weekDates)}
								<CalendarGridRow class="mt-2 w-full">
									{#each weekDates as date (date)}
										<CalendarCell
											{date}
											month={month.value}
											class={hasCaptionSelect
												? "flex flex-1 items-center justify-center"
												: undefined}
										>
											{#if day}
												{@render day({
													day: date,
													outsideMonth: !isEqualMonth(date, month.value),
												})}
											{:else}
												<CalendarDay />
											{/if}
										</CalendarCell>
									{/each}
								</CalendarGridRow>
							{/each}
						</CalendarGridBody>
					</CalendarGrid>
				</CalendarMonth>
			{/each}
		</CalendarMonths>
	{/snippet}
</CalendarPrimitive.Root>
