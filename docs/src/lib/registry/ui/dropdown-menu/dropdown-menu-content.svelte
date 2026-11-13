<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import DropdownMenuPortal from "./dropdown-menu-portal.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		sideOffset = 4,
		align = "start",
		portalProps,
		class: className,
		appearance = "default",
		...restProps
	}: DropdownMenuPrimitive.ContentProps & {
		appearance?: "default" | "surface";
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DropdownMenuPortal>>;
	} = $props();
</script>

<DropdownMenuPortal {...portalProps}>
	<DropdownMenuPrimitive.Content
		bind:ref
		data-slot="dropdown-menu-content"
		{sideOffset}
		{align}
		data-appearance={appearance}
		class={cn(
			"cn-dropdown-menu-content cn-dropdown-menu-content-logical cn-menu-target cn-overlay-surface cn-dropdown-menu-surface z-50 max-h-(--bits-floating-available-height) max-w-[min(var(--bits-floating-available-width,100vw),calc(100vw-1rem))] origin-(--bits-floating-transform-origin) overflow-x-hidden overflow-y-auto outline-hidden data-closed:overflow-hidden",
			appearance === "default" ? "w-(--bits-dropdown-menu-anchor-width)" : "animate-none!",
			className
		)}
		collisionPadding={8}
		{...restProps}
	/>
</DropdownMenuPortal>
