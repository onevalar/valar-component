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
		label = "下一张",
		...restProps
	}: WithoutChildren<Props> & {
		/** Screen reader text. */
		label?: string;
	} = $props();

	const emblaCtx = getEmblaContext("<Carousel.Next/>");
	const isMedia = $derived(emblaCtx.appearance === "media");
</script>

<Button
	data-slot="carousel-next"
	variant={variant ?? (isMedia ? "ghost" : "outline")}
	{size}
	aria-disabled={!emblaCtx.canScrollNext}
	disabled={!isMedia && !emblaCtx.canScrollNext}
	class={cn(
		"touch-manipulation",
		isMedia
			? "size-7 shrink-0"
			: "cn-carousel-next absolute",
		!isMedia && (emblaCtx.orientation === "horizontal"
			? "inset-y-0 -end-12 my-auto"
			: "start-1/2 -bottom-12 -translate-x-1/2 rotate-90"),
		className
	)}
	onclick={emblaCtx.scrollNext}
	onkeydown={isMedia ? undefined : emblaCtx.handleKeyDown}
	bind:ref
	{...restProps}
>
	{#if isMedia}
		<IconPlaceholder
			lucide="ArrowDownIcon"
			tabler="IconArrowDown"
			hugeicons="ArrowDown01Icon"
			phosphor="ArrowDownIcon"
			remixicon="RiArrowDownLine"
			class="size-3.5 text-[color:lch(19.588%_1.25_282)] dark:text-[color:lch(90.451%_1.2_272)]"
		/>
	{:else}
		<IconPlaceholder
			lucide="ChevronRightIcon"
			tabler="IconChevronRight"
			hugeicons="ArrowRight01Icon"
			phosphor="CaretRightIcon"
			remixicon="RiArrowRightSLine"
			class="cn-rtl-flip"
		/>
	{/if}
	<span class="sr-only">{label}</span>
</Button>
