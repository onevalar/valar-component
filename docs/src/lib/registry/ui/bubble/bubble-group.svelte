<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & { appearance?: "agent" } = $props();
</script>

<div
	bind:this={ref}
	data-slot="bubble-group"
	data-appearance={appearance}
	class={cn(
		"flex min-w-0 flex-col",
		appearance === "agent" ? "cn-bubble-group-agent" : "cn-bubble-group",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
