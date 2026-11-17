<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		...restProps
	}: RangeCalendarPrimitive.DayProps & {
		appearance?: "default" | "cycle";
	} = $props();
</script>

<RangeCalendarPrimitive.Day
	bind:ref
	class={cn(
		"flex size-(--cell-size) flex-col items-center justify-center gap-1 rounded-(--cell-radius) p-0 leading-none font-normal whitespace-nowrap select-none",
		"data-disabled:pointer-events-none data-unavailable:line-through focus-visible:relative focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-solid",
		appearance === "cycle"
			? [
					"text-[13px] text-(color:--cycle-date-text) not-data-outside-month:data-today:font-medium not-data-outside-month:data-today:not-data-selected:bg-(--cycle-range)",
					"not-data-selected:not-data-disabled:hover:bg-(--calendar-date-nav-hover)",
					"not-data-outside-month:data-[range-start]:bg-(--calendar-date-accent) not-data-outside-month:data-[range-start]:text-(color:--calendar-date-accent-text)",
					"not-data-outside-month:data-[range-end]:bg-(--calendar-date-accent) not-data-outside-month:data-[range-end]:text-(color:--calendar-date-accent-text)",
					"data-outside-month:text-(color:--cycle-date-muted) data-disabled:text-(color:--cycle-date-muted)",
					"focus-visible:outline-(color:--calendar-date-accent) data-[range-start]:focus-visible:outline-(color:--calendar-date-accent-text) data-[range-end]:focus-visible:outline-(color:--calendar-date-accent-text)"
				]
			: [
					"not-data-selected:hover:bg-accent/50 not-data-selected:hover:text-accent-foreground",
					"data-[range-middle]:rounded-none [&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground [&[data-today][data-disabled]]:text-muted-foreground",
					"data-[range-start]:bg-primary data-[range-start]:text-primary-foreground",
					"data-[range-end]:bg-primary data-[range-end]:text-primary-foreground",
					"[&[data-outside-month]:not([data-selected])]:text-muted-foreground [&[data-outside-month]:not([data-selected])]:hover:text-accent-foreground",
					"data-disabled:text-muted-foreground data-disabled:opacity-50 dark:data-[range-middle]:hover:bg-accent/0",
					"focus-visible:outline-ring data-[range-start]:focus-visible:outline-primary-foreground data-[range-end]:focus-visible:outline-primary-foreground"
				],
		// inner spans
		"[&>span]:text-xs [&>span]:opacity-70",
		className
	)}
	{...restProps}
/>
