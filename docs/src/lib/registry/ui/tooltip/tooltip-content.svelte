<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import type { WithoutChildrenOrChild } from "$lib/utils.js";
	import TooltipPortal from "./tooltip-portal.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		sideOffset = 6,
		side = "top",
		children,
		arrowClasses,
		portalProps,
		...restProps
	}: TooltipPrimitive.ContentProps & {
		arrowClasses?: string;
		appearance?: "default" | "surface";
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof TooltipPortal>>;
	} = $props();
</script>

<TooltipPortal {...portalProps}>
	<TooltipPrimitive.Content
		bind:ref
		data-slot="tooltip-content"
		{sideOffset}
		{side}
		class={cn(
			"cn-tooltip-content cn-tooltip-content-logical cn-overlay-surface z-50 w-fit max-w-[min(20rem,calc(100vw-1rem))] origin-(--bits-tooltip-content-transform-origin) wrap-anywhere [&>*]:min-w-0",
			appearance === "surface" && "animate-none!",
			className
		)}
		collisionPadding={8}
		{...restProps}
	>
		{@render children?.()}
		{#if appearance === "default" && arrowClasses !== undefined}
			<TooltipPrimitive.Arrow>
				{#snippet child({ props })}
					<div
						class={cn(
							// parity-ignore: Bits Arrow + child snippet needs per-side transforms; Radix uses a single translate-y
							"cn-tooltip-arrow z-50 bg-foreground fill-foreground data-[side=bottom]:-translate-x-1/2 data-[side=bottom]:-translate-y-[calc(-50%+1px)] data-[side=left]:-translate-y-[calc(50%-3px)] data-[side=right]:translate-x-[calc(50%+2px)] data-[side=right]:translate-y-1/2 data-[side=top]:translate-x-1/2 data-[side=top]:translate-y-[calc(-50%+2px)]",
							arrowClasses
						)}
						{...props}
					></div>
				{/snippet}
			</TooltipPrimitive.Arrow>
		{/if}
	</TooltipPrimitive.Content>
</TooltipPortal>
