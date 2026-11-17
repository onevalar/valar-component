<script lang="ts">
	import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
	import NavigationMenuViewport from "./navigation-menu-viewport.svelte";

	let {
		ref = $bindable(null),
		class: className,
		viewport = true,
		appearance = "default",
		scrollLabel,
		children,
		...restProps
	}: NavigationMenuPrimitive.RootProps & {
		viewport?: boolean;
		appearance?: "default" | "project";
		scrollLabel?: string;
	} = $props();

	const project = $derived(appearance === "project");
</script>

<NavigationMenuPrimitive.Root
	bind:ref
	data-slot="navigation-menu"
	data-appearance={appearance}
	data-viewport={viewport && !project}
	class={cn(
		"group/navigation-menu relative flex flex-1 items-center",
		project ? "w-full min-w-0" : "cn-navigation-menu max-w-max justify-center",
		className
	)}
	{...restProps}
>
	{#if project}
		<ScrollArea.Root
			orientation="horizontal"
			type="hover"
			class="w-full max-w-full"
			viewportLabel={scrollLabel}
		>
			{@render children?.()}
		</ScrollArea.Root>
	{:else}
		{@render children?.()}
		{#if viewport}<NavigationMenuViewport />{/if}
	{/if}
</NavigationMenuPrimitive.Root>
