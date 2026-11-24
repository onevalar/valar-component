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
	data-slot="page-layout-toolbar"
	class={cn("flex min-w-0 flex-wrap items-center justify-between gap-2", className)}
	{...restProps}
>
	{@render children?.()}
</div>
