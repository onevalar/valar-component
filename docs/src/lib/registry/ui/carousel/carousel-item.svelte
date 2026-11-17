<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { getEmblaContext } from "./context.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		index,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement> & { index?: number }> = $props();

	const emblaCtx = getEmblaContext("<Carousel.Item/>");
	const hidden = $derived(
		emblaCtx.appearance === "media" && index !== undefined && index !== emblaCtx.selectedIndex
	);
</script>

<div
	bind:this={ref}
	data-slot="carousel-item"
	data-orientation={emblaCtx.orientation}
	data-appearance={emblaCtx.appearance}
	role="group"
	aria-roledescription="幻灯片"
	aria-hidden={hidden || undefined}
	inert={hidden || undefined}
	class={cn(
		"min-w-0 shrink-0 grow-0 basis-full",
		emblaCtx.appearance === "media"
			? "grid h-full min-h-0 place-items-center"
			: emblaCtx.orientation === "horizontal"
				? "ps-4 cn-carousel-item-horizontal"
				: "pt-4 cn-carousel-item-vertical",
		className
	)}
	data-embla-slide=""
	{...restProps}
>
	{@render children?.()}
</div>
