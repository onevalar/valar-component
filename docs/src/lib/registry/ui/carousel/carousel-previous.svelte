<script lang="ts">
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button, type Props } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import { getEmblaContext } from "./context.js";
	import type { WithoutChildren } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		variant,
		size = "icon-sm",
		label = "上一张",
		...restProps
	}: WithoutChildren<Props> & {
		/** Screen reader text. */
		label?: string;
	} = $props();

	const emblaCtx = getEmblaContext("<Carousel.Previous/>");
	const isMedia = $derived(emblaCtx.appearance === "media");
</script>

<Button
	data-slot="carousel-previous"
	variant={variant ?? (isMedia ? "ghost" : "outline")}
	{size}
	aria-disabled={!emblaCtx.canScrollPrev}
	disabled={!isMedia && !emblaCtx.canScrollPrev}
	class={cn(
		"touch-manipulation",
		isMedia
			? "size-7 shrink-0"
			: "cn-carousel-previous absolute",
		!isMedia && (emblaCtx.orientation === "horizontal"
			? "inset-y-0 -start-12 my-auto"
			: "start-1/2 -top-12 -translate-x-1/2 rotate-90"),
		className
	)}
	onclick={emblaCtx.scrollPrev}
	onkeydown={isMedia ? undefined : emblaCtx.handleKeyDown}
	{...restProps}
	bind:ref
>
	{#if isMedia}
		<IconPlaceholder
			lucide="ArrowUpIcon"
			tabler="IconArrowUp"
			hugeicons="ArrowUp01Icon"
			phosphor="ArrowUpIcon"
			remixicon="RiArrowUpLine"
			class="size-3.5 text-[color:lch(19.588%_1.25_282)] dark:text-[color:lch(90.451%_1.2_272)]"
		/>
	{:else}
		<IconPlaceholder
			lucide="ChevronLeftIcon"
			tabler="IconChevronLeft"
			hugeicons="ArrowLeft01Icon"
			phosphor="CaretLeftIcon"
			remixicon="RiArrowLeftSLine"
			class="cn-rtl-flip"
		/>
	{/if}
	<span class="sr-only">{label}</span>
</Button>
