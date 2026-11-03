<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { getEmblaContext } from "./context.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const emblaCtx = getEmblaContext("<Carousel.Item/>");
</script>

<div
	bind:this={ref}
	data-slot="carousel-item"
	data-orientation={emblaCtx.orientation}
	role="group"
	aria-roledescription="幻灯片"
	class={cn(
		"min-w-0 shrink-0 grow-0 basis-full",
		emblaCtx.orientation === "horizontal" ? "ps-4" : "pt-4",
		emblaCtx.orientation === "horizontal"
			? "cn-carousel-item-horizontal"
			: "cn-carousel-item-vertical",
		className
	)}
	data-embla-slide=""
	{...restProps}
>
	{@render children?.()}
</div>
