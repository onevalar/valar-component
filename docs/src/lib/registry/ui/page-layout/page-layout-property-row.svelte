<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		label,
		description,
		layout = "settings",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		label: string;
		description?: string;
		layout?: "settings" | "detail";
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="page-layout-property-row"
	data-layout={layout}
	class={cn(
		layout === "settings"
			? "flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3"
			: "flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4",
		className
	)}
	{...restProps}
>
	{#if layout === "settings"}
		<div class="flex min-w-0 flex-col gap-0.5">
			<span class="text-sm font-medium text-foreground">{label}</span>
			{#if description}
				<span class="text-xs text-muted-foreground">{description}</span>
			{/if}
		</div>
		<div class="flex shrink-0 items-center gap-2">
			{@render children?.()}
		</div>
	{:else}
		<span class="w-28 shrink-0 text-sm text-muted-foreground">{label}</span>
		<div class="flex min-w-0 flex-1 items-center gap-2 text-sm tabular-nums text-foreground">
			{@render children?.()}
		</div>
	{/if}
</div>
