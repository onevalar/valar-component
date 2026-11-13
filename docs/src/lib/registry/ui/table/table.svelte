<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLTableAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		scrollLabel,
		children,
		...restProps
	}: WithElementRef<HTMLTableAttributes> & {
		appearance?: "default" | "settings";
		scrollLabel?: string;
	} = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (named scroll regions need a keyboard entry point) -->
<div
	data-slot="table-container"
	class="cn-table-container"
	role={scrollLabel ? "region" : undefined}
	aria-label={scrollLabel}
	tabindex={scrollLabel ? 0 : undefined}
>
	<table
		bind:this={ref}
		data-slot="table"
		data-appearance={appearance}
		class={cn("cn-table", appearance === "settings" && "cn-table-settings", className)}
		{...restProps}
	>
		{@render children?.()}
	</table>
</div>
