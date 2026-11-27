<script lang="ts">
	import { Carousel as SdkCarousel, createCarouselController } from "@ui-sdk/svelte/carousel";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import {
		type CarouselAPI,
		type CarouselProps,
		type EmblaContext,
		setEmblaContext,
	} from "./context.js";

	let {
		ref = $bindable(null),
		opts,
		plugins,
		setApi,
		orientation = "horizontal",
		class: className,
		children,
		...restProps
	}: WithElementRef<CarouselProps> = $props();
	const sdk = createCarouselController();
	const attachKey = createAttachmentKey();
	function attachRef(element: HTMLDivElement) {
		ref = element;
		return () => { if (ref === element) ref = null; };
	}

	// svelte-ignore state_referenced_locally
	let carouselState = $state<EmblaContext>({
		get sdk() { return opts || plugins || setApi ? undefined : sdk; },
		api: undefined,
		scrollPrev,
		scrollNext,
		get orientation() { return orientation; },
		canScrollNext: false,
		canScrollPrev: false,
		handleKeyDown,
		get options() { return opts ?? {}; },
		get plugins() { return plugins ?? []; },
		onInit,
		scrollSnaps: [],
		selectedIndex: 0,
		scrollTo,
	});

	setEmblaContext(carouselState);

	function scrollPrev() {
		carouselState.api?.scrollPrev();
	}

	function scrollNext() {
		carouselState.api?.scrollNext();
	}

	function scrollTo(index: number, jump?: boolean) {
		carouselState.api?.scrollTo(index, jump);
	}

	function onSelect() {
		if (!carouselState.api) return;
		carouselState.selectedIndex = carouselState.api.selectedScrollSnap();
		carouselState.canScrollNext = carouselState.api.canScrollNext();
		carouselState.canScrollPrev = carouselState.api.canScrollPrev();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
		const rtl = e.currentTarget instanceof HTMLElement && getComputedStyle(e.currentTarget).direction === "rtl";
		const previous = orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
		const next = orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
		if (e.key === previous) {
			e.preventDefault();
			if (carouselState.sdk) sdk.previous({ reason: "list-navigation", event: e });
			else scrollPrev();
		} else if (e.key === next) {
			e.preventDefault();
			if (carouselState.sdk) sdk.next({ reason: "list-navigation", event: e });
			else scrollNext();
		}
	}

	function onInit(event: CustomEvent<CarouselAPI>) {
		carouselState.api = event.detail;
		setApi?.(carouselState.api);

		carouselState.scrollSnaps = carouselState.api.scrollSnapList();
		carouselState.api.on("select", onSelect);
		onSelect();
	}

	$effect(() => {
		return () => {
			carouselState.api?.off("select", onSelect);
		};
	});
</script>

{#if carouselState.sdk}
	<SdkCarousel controller={sdk} {orientation} data-slot="carousel" class={cn("relative", className)} aria-roledescription="轮播" {...restProps}>
		{#snippet render({ props })}
			<div {...{ ...props, [attachKey]: attachRef }}>{@render children?.()}</div>
		{/snippet}
	</SdkCarousel>
{:else}
<div
	bind:this={ref}
	data-slot="carousel"
	class={cn("relative", className)}
	role="region"
	aria-roledescription="轮播"
	{...restProps}
>
	{@render children?.()}
</div>
{/if}
