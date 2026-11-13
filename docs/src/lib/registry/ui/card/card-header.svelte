<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card-header"
	class={cn(
		"cn-card-header group/card-header @container/card-header grid min-w-0",
		className
	)}
	{...restProps}
>
	<div
		class="grid min-w-0 auto-rows-min grid-cols-[minmax(0,1fr)] items-start gap-[inherit] @min-[17rem]/card-header:has-[>[data-slot=card-action]]:grid-cols-[minmax(0,1fr)_minmax(0,40%)]"
	>
		{@render children?.()}
	</div>
</div>
