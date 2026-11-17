<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import {
		type CarouselAPI,
		type CarouselProps,
		type EmblaContext,
		setEmblaContext,
	} from "./context.js";

	let {
		ref = $bindable(null),
		opts = {},
		plugins = [],
		setApi = () => {},
		orientation = "horizontal",
		appearance = "default",
		onkeydown,
		class: className,
		children,
		...restProps
	}: WithElementRef<CarouselProps> = $props();

	// svelte-ignore state_referenced_locally
	let carouselState = $state<EmblaContext>({
		api: undefined,
		scrollPrev,
		scrollNext,
		orientation,
		appearance,
		canScrollNext: false,
		canScrollPrev: false,
		handleKeyDown,
		options: getOptions(),
		plugins,
		onInit,
		scrollSnaps: [],
		selectedIndex: 0,
		scrollTo,
	});

	setEmblaContext(carouselState);

	function getOptions() {
		if (appearance !== "media") return opts;
		const mediaOptions = { loop: false, slidesToScroll: 1 };
		const breakpoints = Object.fromEntries(
			Object.entries(opts.breakpoints ?? {}).map(([query, options]) => [
				query,
				{ ...options, ...mediaOptions },
			])
		);
		return { ...opts, ...mediaOptions, breakpoints };
	}

	function scrollPrev() {
		carouselState.api?.scrollPrev(reduceMediaMotion());
	}

	function scrollNext() {
		carouselState.api?.scrollNext(reduceMediaMotion());
	}

	function reduceMediaMotion() {
		return appearance === "media" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
		const usesVerticalKeys = appearance === "media" || orientation === "vertical";
		if (e.key === "ArrowLeft" || (usesVerticalKeys && e.key === "ArrowUp")) {
			e.preventDefault();
			scrollPrev();
		} else if (e.key === "ArrowRight" || (usesVerticalKeys && e.key === "ArrowDown")) {
			e.preventDefault();
			scrollNext();
		}
	}

	function handleRootKeyDown(event: Parameters<NonNullable<CarouselProps["onkeydown"]>>[0]) {
		onkeydown?.(event);
		if (appearance !== "media" || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
			return;
		if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]"))
			return;
		handleKeyDown(event);
	}

	function syncSlides() {
		if (!carouselState.api) return;
		carouselState.scrollSnaps = carouselState.api.scrollSnapList();
		onSelect();
	}

	function onInit(event: CustomEvent<CarouselAPI>) {
		carouselState.api = event.detail;
		carouselState.api.on("select", onSelect).on("reInit", syncSlides);
		syncSlides();
		setApi(carouselState.api);
	}

	$effect(() => {
		return () => {
			carouselState.api?.off("select", onSelect).off("reInit", syncSlides);
		};
	});
</script>

<div
	bind:this={ref}
	data-slot="carousel"
	data-appearance={appearance}
	class={cn("relative", className)}
	role="region"
	aria-roledescription="轮播"
	onkeydown={handleRootKeyDown}
	{...restProps}
>
	{@render children?.()}
</div>
