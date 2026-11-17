<script lang="ts">
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLTableAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		scroll = "native",
		scrollLabel,
		children,
		...restProps
	}: WithElementRef<HTMLTableAttributes> & {
		appearance?: "default" | "settings";
		scroll?: "native" | "overlay";
		scrollLabel?: string;
	} = $props();
</script>

{#snippet table()}
	<table
		bind:this={ref}
		data-slot="table"
		data-appearance={appearance}
		class={cn("cn-table", appearance === "settings" && "cn-table-settings", className)}
		{...restProps}
	>
		{@render children?.()}
	</table>
{/snippet}

{#if scroll === "overlay"}
	<div data-slot="table-container" class="w-full min-w-0">
		<ScrollArea.Root
			{appearance}
			orientation="horizontal"
			type="auto"
			viewportLabel={scrollLabel}
			viewportProps={{ class: "overscroll-x-contain" }}
		>
			{@render table()}
		</ScrollArea.Root>
	</div>
{:else}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (named scroll regions need a keyboard entry point) -->
	<div
		data-slot="table-container"
		class="cn-table-container"
		role={scrollLabel ? "region" : undefined}
		aria-label={scrollLabel}
		tabindex={scrollLabel ? 0 : undefined}
	>
		{@render table()}
	</div>
{/if}
