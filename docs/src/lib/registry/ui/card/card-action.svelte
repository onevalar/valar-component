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
	data-slot="card-action"
	class={cn(
		"cn-card-action order-last max-w-full min-w-0 self-start justify-self-start @min-[17rem]/card-header:col-start-2 @min-[17rem]/card-header:row-span-2 @min-[17rem]/card-header:row-start-1 @min-[17rem]/card-header:justify-self-end",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
