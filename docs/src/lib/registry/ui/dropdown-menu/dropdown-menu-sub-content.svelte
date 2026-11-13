<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import DropdownMenuPortal from "./dropdown-menu-portal.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		align = "start",
		alignOffset = -3,
		portalProps,
		...restProps
	}: DropdownMenuPrimitive.SubContentProps & {
		appearance?: "default" | "surface";
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DropdownMenuPortal>>;
	} = $props();
</script>

<DropdownMenuPortal {...portalProps}>
	<DropdownMenuPrimitive.SubContent
		bind:ref
		data-slot="dropdown-menu-sub-content"
		{align}
		{alignOffset}
		data-appearance={appearance}
		class={cn(
			"cn-dropdown-menu-sub-content cn-dropdown-menu-content-logical cn-menu-target cn-overlay-surface cn-dropdown-menu-surface z-50 max-h-(--bits-floating-available-height) max-w-[min(var(--bits-floating-available-width,100vw),calc(100vw-1rem))] origin-(--bits-floating-transform-origin) overflow-x-hidden overflow-y-auto outline-hidden data-closed:overflow-hidden",
			appearance === "surface" && "animate-none!",
			className
		)}
		collisionPadding={8}
		strategy={portalProps?.to ? undefined : "fixed"}
		{...restProps}
	/>
</DropdownMenuPortal>
