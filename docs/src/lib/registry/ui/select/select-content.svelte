<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn, type WithoutChild } from "$lib/utils.js";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";
	import SelectPortal from "./select-portal.svelte";
	import SelectScrollDownButton from "./select-scroll-down-button.svelte";
	import SelectScrollUpButton from "./select-scroll-up-button.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		portalProps,
		children,
		preventScroll = true,
		appearance = "default",
		...restProps
	}: WithoutChild<SelectPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SelectPortal>>;
		appearance?: "default" | "settings";
	} = $props();
</script>

<!-- parity-ignore-upstream: data-[align-trigger=true]:animate-none | Radix marks its item-aligned mode with data-align-trigger; Bits only positions the content as a popper -->
<!-- parity-ignore-upstream: data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 | Radix offsets popper content with per-side translates; Bits takes the same gap as the sideOffset prop, which also works for the logical sides -->
<!-- parity-ignore-upstream: data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width) | Radix gates the viewport sizing behind its popper mode; Bits applies the trigger-width minimum to the content and sizes the viewport to its contents -->
<SelectPortal {...portalProps}>
	<SelectPrimitive.Content
		bind:ref
		{sideOffset}
		{preventScroll}
		data-slot="select-content"
		class={cn(
			"cn-select-content cn-select-content-logical cn-menu-target cn-overlay-surface relative z-50 max-h-(--bits-select-content-available-height) max-w-[calc(100vw-1rem)] min-w-[min(max(8rem,var(--bits-select-anchor-width,8rem)),calc(100vw-1rem))] origin-(--bits-select-content-transform-origin) overflow-x-hidden overflow-y-auto",
			appearance === "settings" && "cn-select-content-settings animate-none!",
			className
		)}
		collisionPadding={8}
		{...restProps}
	>
		<SelectScrollUpButton />
		<SelectPrimitive.Viewport class="cn-select-viewport w-full min-w-0 scroll-my-1 px-1.5 py-1">
			{@render children?.()}
		</SelectPrimitive.Viewport>
		<SelectScrollDownButton />
	</SelectPrimitive.Content>
</SelectPortal>
