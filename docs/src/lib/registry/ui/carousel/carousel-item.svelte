<script lang="ts">
	import { CarouselItem as SdkItem } from "@ui-sdk/svelte/carousel";
	import { createAttachmentKey } from "svelte/attachments";
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
	const attachKey = createAttachmentKey();
	function attachRef(element: HTMLDivElement) {
		ref = element;
		return () => { if (ref === element) ref = null; };
	}
	const classes = $derived(cn("min-w-0 shrink-0 grow-0 basis-full",
		emblaCtx.orientation === "horizontal" ? "ps-4 cn-carousel-item-horizontal" : "pt-4 cn-carousel-item-vertical",
		className));
</script>

{#if emblaCtx.sdk}
	<SdkItem data-slot="carousel-item" aria-roledescription="幻灯片" class={cn("min-w-0 shrink-0 grow-0 basis-full", className)} {...restProps}>
		{#snippet render({ props })}
			<div {...{ ...props, [attachKey]: attachRef }}>{@render children?.()}</div>
		{/snippet}
	</SdkItem>
{:else}
<div
	bind:this={ref}
	data-slot="carousel-item"
	data-orientation={emblaCtx.orientation}
	role="group"
	aria-roledescription="幻灯片"
	class={classes}
	data-embla-slide=""
	{...restProps}
>
	{@render children?.()}
</div>
{/if}
