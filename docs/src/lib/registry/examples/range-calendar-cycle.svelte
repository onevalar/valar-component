<script lang="ts">
	import { parseDate, type DateValue } from "@internationalized/date";
	import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";

	const minimum = parseDate("2026-11-20");
	const initialEnd = parseDate("2026-12-03");
	let availableWidth = $state(0);
	let value = $state<{
		start: DateValue | undefined;
		end: DateValue | undefined;
	}>({
		start: minimum,
		end: initialEnd
	});
</script>

<div
	bind:clientWidth={availableWidth}
	class="grid w-full max-w-[492px] min-w-0 gap-3"
	data-slot="cycle-date-sample"
>
	<RangeCalendar
		appearance="cycle"
		locale="en-US"
		calendarLabel="Cycle date range"
		numberOfMonths={availableWidth >= 492 ? 2 : 1}
		minValue={minimum}
		disableDaysOutsideMonth
		bind:value
	/>
	<p class="px-2 text-xs text-muted-foreground tabular-nums">
		{#if value?.start && value?.end}
			Cycle dates: {value.start.toString()} – {value.end.toString()}
		{:else if value?.start}
			Starts {value.start.toString()}. Choose an end date.
		{:else}
			Choose a date range.
		{/if}
	</p>
</div>
