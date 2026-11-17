<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import { cn } from "$lib/utils.js";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";
	import DrawerOverlay from "./drawer-overlay.svelte";
	import DrawerPortal from "./drawer-portal.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		portalProps,
		children,
		...restProps
	}: DrawerPrimitive.ContentProps & {
		appearance?: "default" | "workspace";
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DrawerPortal>>;
	} = $props();
</script>

<DrawerPortal {...portalProps}>
	<DrawerOverlay
		class={appearance === "workspace"
			? "bg-transparent supports-backdrop-filter:backdrop-blur-none"
			: undefined}
	/>
	<DrawerPrimitive.Content
		bind:ref
		data-slot="drawer-content"
		data-appearance={appearance === "workspace" ? "workspace" : undefined}
		class={cn(
			"cn-drawer-content group/drawer-content fixed z-50 data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:start-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:end-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm",
			appearance === "workspace" &&
				"min-h-0 bg-[lch(97.94%_.5_282)] shadow-none dark:bg-[lch(5.52%_.4_272)] data-[vaul-drawer-direction=left]:start-auto data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:h-dvh data-[vaul-drawer-direction=left]:w-[min(330px,calc(100vw-24px))] data-[vaul-drawer-direction=left]:rounded-r-[12px] data-[vaul-drawer-direction=left]:border-r-0",
			className
		)}
		{...restProps}
	>
		<div
			class="cn-drawer-handle mx-auto hidden shrink-0 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
		></div>
		{@render children?.()}
	</DrawerPrimitive.Content>
</DrawerPortal>
