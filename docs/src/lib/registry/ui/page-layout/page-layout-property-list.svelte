<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		layout = "settings",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		layout?: "settings" | "detail";
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="page-layout-property-list"
	data-layout={layout}
	class={cn(
		"flex min-w-0 flex-col",
		layout === "settings" ? "divide-y-[0.5px] divide-border" : "gap-2.5",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
