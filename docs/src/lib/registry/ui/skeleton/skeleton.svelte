<svelte:options css="injected" />

<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		delay = 0,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		appearance?: "default" | "filter";
		/** Delay in milliseconds before a filter placeholder appears. */
		delay?: number;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="skeleton"
	data-appearance={appearance}
	aria-hidden={appearance === "filter" ? true : undefined}
	style:--valar-skeleton-delay={appearance === "filter" ? `${delay}ms` : undefined}
	class={cn(
		"max-w-full",
		appearance === "filter"
			? "h-6 rounded-[8px] border-0 bg-[lch(92.44%_.5_282)] dark:bg-[lch(7.32%_.85_272)]"
			: "cn-skeleton motion-safe:animate-pulse",
		className
	)}
	{...restProps}
></div>

<style>
	@media (prefers-reduced-motion: no-preference) {
		[data-appearance="filter"] {
			animation:
				filter-entry 1.2s ease var(--valar-skeleton-delay) both,
				filter-loop 2s ease calc(1.2s + var(--valar-skeleton-delay)) infinite;
		}
	}

	@keyframes filter-entry {
		0% { opacity: 0; }
		50% { opacity: 1; }
		100% { opacity: 0.3; }
	}

	@keyframes filter-loop {
		0%, 20%, 100% { opacity: 0.3; }
		60% { opacity: 1; }
	}
</style>
