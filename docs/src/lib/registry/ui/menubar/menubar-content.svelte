<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import MenubarPortal from "./menubar-portal.svelte";
	import { getMenubarAppearance, navigationPanelClass } from "./context.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 8,
		alignOffset,
		align = "start",
		side = "bottom",
		portalProps,
		...restProps
	}: MenubarPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof MenubarPortal>>;
	} = $props();

	const readAppearance = getMenubarAppearance();
	const appearance = $derived(readAppearance());
</script>

<MenubarPortal {...portalProps}>
	<MenubarPrimitive.Content
		bind:ref
		data-slot="menubar-content"
		data-appearance={appearance}
		{align}
		alignOffset={alignOffset ?? (appearance === "navigation" ? 0 : -4)}
		{side}
		{sideOffset}
		collisionPadding={appearance === "navigation" ? 8 : undefined}
		class={appearance === "default"
			? cn(
					"cn-menubar-content cn-menubar-content-logical cn-menu-target cn-menu-translucent z-50 origin-(--bits-menubar-content-transform-origin) overflow-hidden",
					className
				)
			: cn("cn-menu-target z-50 overflow-hidden", navigationPanelClass, className)}
		{...restProps}
	/>
</MenubarPortal>
