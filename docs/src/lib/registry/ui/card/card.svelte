<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		size = "default",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		size?: "default" | "sm" | "settings";
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	data-size={size}
	class={cn(
		"cn-card group/card flex min-w-0 flex-col",
		size === "settings" && "cn-card-settings",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
