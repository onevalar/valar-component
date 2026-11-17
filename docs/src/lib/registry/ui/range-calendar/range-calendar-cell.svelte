<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		...restProps
	}: RangeCalendarPrimitive.CellProps & {
		appearance?: "default" | "cycle";
	} = $props();
</script>

<RangeCalendarPrimitive.Cell
	bind:ref
	class={cn(
		"relative size-(--cell-size) p-0 text-center text-sm focus-within:z-20",
		appearance === "cycle"
			? "isolate inline-flex items-center justify-center before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-(--cycle-range) data-[range-start]:not-data-[range-end]:before:start-1/2 data-[range-end]:not-data-[range-start]:before:end-1/2 first:before:rounded-s-full last:before:rounded-e-full not-data-selected:before:hidden data-[range-start]:data-[range-end]:before:hidden data-outside-month:before:hidden"
			: "data-[range-middle]:rounded-e-(--cell-radius) [&:first-child[data-selected]_[data-bits-day]]:rounded-s-(--cell-radius) [&:has([data-range-end])]:rounded-e-(--cell-radius) dark:[&:has([data-range-end])]:hover:bg-accent [&:has([data-range-middle])]:rounded-none [&:has([data-range-middle])]:bg-accent first:[&:has([data-range-middle])]:rounded-s-(--cell-radius) last:[&:has([data-range-middle])]:rounded-e-(--cell-radius) dark:[&:has([data-range-middle])]:hover:bg-accent/50 [&:has([data-range-start])]:rounded-s-(--cell-radius) dark:[&:has([data-range-start])]:hover:bg-accent [&:has([data-selected])]:bg-accent [&:last-child[data-selected]_[data-bits-day]]:rounded-e-(--cell-radius)",
		className
	)}
	{...restProps}
/>
