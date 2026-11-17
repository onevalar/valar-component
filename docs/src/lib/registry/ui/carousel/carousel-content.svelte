<script lang="ts">
	import emblaCarouselSvelte from "embla-carousel-svelte";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { getEmblaContext } from "./context.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const emblaCtx = getEmblaContext("<Carousel.Content/>");
</script>

<div
	data-slot="carousel-content"
	class={emblaCtx.appearance === "media" ? "h-full min-h-0 w-full overflow-hidden" : "overflow-hidden"}
	use:emblaCarouselSvelte={{
		options: {
			container: "[data-embla-container]",
			slides: "[data-embla-slide]",
			...emblaCtx.options,
			axis: emblaCtx.orientation === "horizontal" ? "x" : "y",
		},
		plugins: emblaCtx.plugins,
	}}
	onemblaInit={emblaCtx.onInit}
>
	<div
		bind:this={ref}
		data-slot="carousel-container"
		data-orientation={emblaCtx.orientation}
		data-appearance={emblaCtx.appearance}
		class={cn(
			"flex",
			emblaCtx.appearance === "media"
				? "h-full min-h-0"
				: emblaCtx.orientation === "horizontal"
					? "-ms-4 cn-carousel-content-horizontal"
					: "-mt-4 cn-carousel-content-vertical",
			emblaCtx.orientation === "vertical" && "flex-col",
			className
		)}
		data-embla-container=""
		{...restProps}
	>
		{@render children?.()}
	</div>
</div>
