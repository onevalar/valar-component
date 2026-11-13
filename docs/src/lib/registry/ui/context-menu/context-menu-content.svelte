<script lang="ts">
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import { innerWidth } from "svelte/reactivity/window";
	import { cn } from "$lib/utils.js";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";
	import ContextMenuPortal from "./context-menu-portal.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		portalProps,
		class: className,
		side,
		...restProps
	}: ContextMenuPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof ContextMenuPortal>>;
	} = $props();

	const preferredSide = $derived(
		side ?? ((innerWidth.current ?? Infinity) < 400 ? "bottom" : "right")
	);
</script>

<ContextMenuPortal {...portalProps}>
	<ContextMenuPrimitive.Content
		bind:ref
		data-slot="context-menu-content"
		side={preferredSide}
		class={cn(
			"cn-context-menu-content cn-context-menu-content-logical cn-menu-target cn-overlay-surface cn-context-menu-surface z-50 max-h-(--bits-floating-available-height) max-w-[min(var(--bits-floating-available-width,100vw),calc(100vw-1rem))] origin-(--bits-floating-transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden",
			className
		)}
		collisionPadding={8}
		{...restProps}
	/>
</ContextMenuPortal>
