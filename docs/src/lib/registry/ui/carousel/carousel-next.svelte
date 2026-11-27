<script lang="ts">
	import { CarouselNext as SdkNext } from "@ui-sdk/svelte/carousel";
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
		label = "下一张",
		disabled,
		onclick,
		onkeydown,
		...restProps
	}: WithoutChildren<Props> & {
		/** Screen reader text. */
		label?: string;
	} = $props();

	const emblaCtx = getEmblaContext("<Carousel.Next/>");
	const classes = $derived(cn("cn-carousel-next absolute touch-manipulation",
		emblaCtx.orientation === "horizontal" ? "inset-y-0 -end-12 my-auto" : "start-1/2 -bottom-12 -translate-x-1/2 rotate-90", className));
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
<SdkNext {...restProps} data-slot="carousel-next" data-variant={variant} data-size={size}
	class={cn(buttonVariants({ variant, size }), "aria-disabled:opacity-50", classes)} {disabled} onclick={click} onkeydown={keydown}>
	{#snippet render({ props })}<button {...props} bind:this={ref}>{@render icon()}</button>{/snippet}
</SdkNext>
{:else}
<Button
	data-slot="carousel-next"
	{variant}
	{size}
	aria-disabled={disabled || !emblaCtx.canScrollNext}
	disabled={disabled || !emblaCtx.canScrollNext}
	class={classes}
	onclick={(event: MouseEvent) => { click(event); if (!event.defaultPrevented) emblaCtx.scrollNext(); }}
	onkeydown={keydown}
	bind:ref
	{...restProps}
>
	{@render icon()}
</Button>
{/if}

{#snippet icon()}
	<IconPlaceholder
		lucide="ChevronRightIcon"
		tabler="IconChevronRight"
		hugeicons="ArrowRight01Icon"
		phosphor="CaretRightIcon"
		remixicon="RiArrowRightSLine"
		class={emblaCtx.orientation === "horizontal" ? "cn-rtl-flip" : undefined}
	/>
	<span class="sr-only">{label}</span>
{/snippet}
