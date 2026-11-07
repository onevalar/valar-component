<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...props
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="input-group"
	role="group"
	class={cn(
		"group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto",
		// Some styles fade the whole group when anything inside is disabled. A disabled send
		// button (empty message) is normal, so only a disabled field fades the group.
		"has-disabled:bg-transparent has-disabled:opacity-100 has-[[data-slot=input-group-control]:disabled]:opacity-50 dark:has-disabled:bg-input/30",
		className
	)}
	{...props}
>
	{@render children?.()}
</div>
