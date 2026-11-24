<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		width = "full",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		width?: "full" | "narrow";
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="page-layout"
	data-width={width}
	class={cn(
		"flex w-full min-w-0 flex-col gap-6",
		width === "narrow" && "mx-auto max-w-3xl",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
