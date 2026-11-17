<script lang="ts">
	import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: NavigationMenuPrimitive.ListProps = $props();
</script>

<NavigationMenuPrimitive.List
	bind:ref
	data-slot="navigation-menu-list"
	class={cn(
		"cn-navigation-menu-list group flex flex-1 list-none items-center justify-center group-data-[appearance=project]/navigation-menu:w-max group-data-[appearance=project]/navigation-menu:justify-start group-data-[appearance=project]/navigation-menu:gap-1 group-data-[appearance=project]/navigation-menu:py-2",
		className
	)}
	{...restProps}
/>
