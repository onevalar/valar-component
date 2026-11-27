<script lang="ts">
	import { CarouselPrevious as SdkPrevious } from "@ui-sdk/svelte/carousel";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button, buttonVariants, type Props } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import { getEmblaContext } from "./context.js";
	import type { WithoutChildren } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		variant = "outline",
		size = "icon-sm",
		label = "上一张",
		disabled,
		onclick,
		onkeydown,
		...restProps
	}: WithoutChildren<Props> & {
		/** Screen reader text. */
		label?: string;
	} = $props();

	const emblaCtx = getEmblaContext("<Carousel.Previous/>");
	const classes = $derived(cn("cn-carousel-previous absolute touch-manipulation",
		emblaCtx.orientation === "horizontal" ? "inset-y-0 -start-12 my-auto" : "start-1/2 -top-12 -translate-x-1/2 rotate-90", className));
	function keydown(event: KeyboardEvent) {
		if (event.currentTarget instanceof HTMLAnchorElement) onkeydown?.(event as KeyboardEvent & { currentTarget: HTMLAnchorElement });
		else if (event.currentTarget instanceof HTMLButtonElement) onkeydown?.(event as KeyboardEvent & { currentTarget: HTMLButtonElement });
		if (!disabled) emblaCtx.handleKeyDown(event);
	}
	function click(event: MouseEvent) {
		if (event.currentTarget instanceof HTMLAnchorElement) return onclick?.(event as MouseEvent & { currentTarget: HTMLAnchorElement });
		if (event.currentTarget instanceof HTMLButtonElement) return onclick?.(event as MouseEvent & { currentTarget: HTMLButtonElement });
	}
</script>

{#if emblaCtx.sdk}
<SdkPrevious {...restProps} data-slot="carousel-previous" data-variant={variant} data-size={size}
	class={cn(buttonVariants({ variant, size }), "aria-disabled:opacity-50", classes)} {disabled} onclick={click} onkeydown={keydown}>
	{#snippet render({ props })}<button {...props} bind:this={ref}>{@render icon()}</button>{/snippet}
</SdkPrevious>
{:else}
<Button
	data-slot="carousel-previous"
	{variant}
	{size}
	aria-disabled={disabled || !emblaCtx.canScrollPrev}
	disabled={disabled || !emblaCtx.canScrollPrev}
	class={classes}
	onclick={(event: MouseEvent) => { click(event); if (!event.defaultPrevented) emblaCtx.scrollPrev(); }}
	onkeydown={keydown}
	{...restProps}
	bind:ref
>
	{@render icon()}
</Button>
{/if}

{#snippet icon()}
	<IconPlaceholder
		lucide="ChevronLeftIcon"
		tabler="IconChevronLeft"
		hugeicons="ArrowLeft01Icon"
		phosphor="CaretLeftIcon"
		remixicon="RiArrowLeftSLine"
		class={emblaCtx.orientation === "horizontal" ? "cn-rtl-flip" : undefined}
	/>
	<span class="sr-only">{label}</span>
{/snippet}
