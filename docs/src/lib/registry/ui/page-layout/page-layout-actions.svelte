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
	data-slot="page-layout-actions"
	class={cn("flex shrink-0 flex-wrap items-center gap-2", className)}
	{...restProps}
>
	{@render children?.()}
</div>
