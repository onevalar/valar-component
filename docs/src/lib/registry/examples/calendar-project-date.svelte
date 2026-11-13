<script lang="ts">
	import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";
	import { Calendar } from "$lib/registry/ui/calendar/index.js";

	const current = today(getLocalTimeZone());
	const initial = current.set({ day: current.day === 15 ? 16 : 15 });
	const minimum = current.set({ day: 1 }).subtract({ months: 1 }).set({ day: 28 });
	let selected = $state<DateValue | undefined>(initial);
</script>

<div class="grid w-full max-w-[301px] min-w-0 gap-2">
	<Calendar
		type="single"
		appearance="project-date"
		locale="en-US"
		calendarLabel="Project target date"
		weekStartsOn={1}
		fixedWeeks
		minValue={minimum}
		bind:value={selected}
	/>
	<p class="text-muted-foreground px-2 text-xs tabular-nums" aria-live="polite">
		{selected ? `Target date: ${selected.toString()}` : "No target date"}
	</p>
</div>
