<script lang="ts">
	import { Popover as PopoverPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import PopoverPortal from "./popover-portal.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		sideOffset = 4,
		align = "center",
		strategy = "fixed",
		portalProps,
		forceMount = false,
		...restProps
	}: PopoverPrimitive.ContentProps & {
		appearance?: "default" | "surface" | "options";
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof PopoverPortal>>;
	} = $props();
</script>

<PopoverPortal {...portalProps}>
	<PopoverPrimitive.Content
		bind:ref
		data-slot="popover-content"
		{sideOffset}
		{align}
		{strategy}
		{forceMount}
		data-appearance={appearance}
		class={cn(
			"cn-popover-content cn-popover-content-logical cn-overlay-surface cn-popover-viewport z-50 origin-(--bits-popover-content-transform-origin) outline-hidden",
			appearance === "options" ? "w-[330px]" : "w-72",
			appearance === "surface" && "cn-overlay-menu-rows animate-none!",
			appearance === "options" && "cn-popover-options animate-none!",
			// Bits keeps the floating wrapper until its next frame. A closed work-area panel
			// must already be hidden so it cannot overflow the viewport or capture focus.
			appearance !== "default" &&
				!forceMount &&
				"[[data-bits-floating-content-wrapper]:has(>&[data-state=closed])]:hidden",
			className
		)}
		collisionPadding={8}
		{...restProps}
	/>
</PopoverPortal>
