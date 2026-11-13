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
	data-slot="avatar-group"
	class={cn(
		"cn-avatar-group group/avatar-group flex max-w-full flex-wrap gap-y-1 ps-2 *:-ms-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
