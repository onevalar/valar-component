<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		appearance?: "default" | "issue-list" | "filtered-list";
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="empty"
	data-appearance={appearance}
	class={cn(
		"cn-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance",
		appearance !== "default" && "cn-empty-issue-list",
		appearance === "filtered-list" && "cn-empty-filtered-list",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
