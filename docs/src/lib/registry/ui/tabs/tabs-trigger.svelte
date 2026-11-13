<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
	bind:ref
	data-slot="tabs-trigger"
	class={cn(
		"cn-tabs-trigger relative inline-flex flex-1 group-data-horizontal/tabs:h-full items-center justify-center whitespace-nowrap text-foreground/60 transition-[border-color,background-color,color,opacity,box-shadow] group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none dark:group-not-data-[variant=capsule]/tabs-list:text-muted-foreground dark:group-not-data-[variant=capsule]/tabs-list:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
		"group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
		"data-active:bg-background data-active:text-foreground dark:group-not-data-[variant=capsule]/tabs-list:data-active:border-input dark:group-not-data-[variant=capsule]/tabs-list:data-active:bg-input/30 dark:group-not-data-[variant=capsule]/tabs-list:data-active:text-foreground",
		"after:pointer-events-none after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-0 group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:end-0 group-data-vertical/tabs:after:w-0.5 motion-reduce:after:transition-none group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
		"cn-tabs-trigger-capsule",
		className
	)}
	{...restProps}
/>
