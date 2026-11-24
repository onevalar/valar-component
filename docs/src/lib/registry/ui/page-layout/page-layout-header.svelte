<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<header
	bind:this={ref}
	data-slot="page-layout-header"
	class={cn("flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2", className)}
	{...restProps}
>
	{@render children?.()}
</header>
