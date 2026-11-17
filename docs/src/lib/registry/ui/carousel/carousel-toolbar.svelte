<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="carousel-toolbar"
	role="group"
	class={cn(
		"flex h-10 min-w-0 items-center justify-end gap-1 bg-[lch(97.94%_0.5_282)] px-2 py-1.5 dark:bg-[lch(5.52%_0.4_272)]",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
