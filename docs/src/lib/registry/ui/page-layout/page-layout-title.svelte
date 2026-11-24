<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		tag = "h1",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLHeadingElement>> & {
		tag?: "h1" | "h2";
	} = $props();
</script>

<svelte:element
	this={tag}
	bind:this={ref}
	data-slot="page-layout-title"
	class={cn("min-w-0 truncate text-lg font-semibold tracking-tight text-foreground", className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
