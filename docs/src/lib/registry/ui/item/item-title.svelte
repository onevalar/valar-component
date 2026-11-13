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
	data-slot="item-title"
	class={cn(
		"cn-item-title line-clamp-1 flex w-fit max-w-full min-w-0 items-center wrap-anywhere",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
