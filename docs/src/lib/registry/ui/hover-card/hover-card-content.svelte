<script lang="ts">
	import { LinkPreview as HoverCardPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import HoverCardPortal from "./hover-card-portal.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		side = "bottom",
		sideOffset = 4,
		align = "center",
		collisionPadding = 8,
		portalProps,
		...restProps
	}: HoverCardPrimitive.ContentProps & {
		appearance?: "default" | "profile";
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof HoverCardPortal>>;
	} = $props();
</script>

<HoverCardPortal {...portalProps}>
	<HoverCardPrimitive.Content
		bind:ref
		data-slot="hover-card-content"
		data-appearance={appearance}
		{side}
		{sideOffset}
		{align}
		{collisionPadding}
		class={cn(
			"cn-hover-card-content cn-hover-card-content-logical z-50 origin-(--bits-link-preview-content-transform-origin) outline-hidden",
			appearance === "profile" && "cn-hover-card-profile",
			className
		)}
		{...restProps}
	/>
</HoverCardPortal>
