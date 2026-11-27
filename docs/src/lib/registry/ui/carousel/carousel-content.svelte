<script lang="ts">
	import { CarouselContent as SdkContent, CarouselViewport as SdkViewport } from "@ui-sdk/svelte/carousel";
	import { createAttachmentKey } from "svelte/attachments";
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
	const attachKey = createAttachmentKey();
	function attachRef(element: HTMLDivElement) {
		ref = element;
		return () => { if (ref === element) ref = null; };
	}
	const classes = $derived(cn("flex", emblaCtx.orientation === "horizontal"
		? "-ms-4 cn-carousel-content-horizontal"
		: "-mt-4 flex-col cn-carousel-content-vertical", className));
</script>

{#if emblaCtx.sdk}
	<SdkViewport data-slot="carousel-content" tabindex={0} class="scrollbar-none focus-visible:-outline-offset-1 focus-visible:outline-ring data-[orientation=vertical]:h-full">
		{#snippet render({ props: viewportProps })}
			<div {...viewportProps} data-slot="carousel-content">
				<SdkContent class={cn("gap-4 cn-carousel-sdk-content", emblaCtx.orientation === "vertical" && "h-full", className)} {...restProps}>
					{#snippet render({ props })}
						<div {...{ ...props, [attachKey]: attachRef }} data-slot="carousel-container" data-carousel-engine="sdk" data-orientation={emblaCtx.orientation}>{@render children?.()}</div>
					{/snippet}
				</SdkContent>
			</div>
		{/snippet}
	</SdkViewport>
{:else}
<div
	data-slot="carousel-content"
	class="overflow-hidden"
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
		class={classes}
		data-embla-container=""
		{...restProps}
	>
		{@render children?.()}
	</div>
</div>
{/if}
