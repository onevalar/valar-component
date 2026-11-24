<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		surface = "plain",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		surface?: "plain" | "card";
	} = $props();
</script>

<section
	bind:this={ref}
	data-slot="page-layout-section"
	data-surface={surface}
	class={cn(
		"flex min-w-0 flex-col",
		surface === "card"
			? "overflow-hidden rounded-lg border-[0.5px] border-border bg-card"
			: "gap-3",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</section>
