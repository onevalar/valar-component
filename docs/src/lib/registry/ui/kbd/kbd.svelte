<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		appearance?: "default" | "inline" | "compact";
	} = $props();
</script>

<kbd
	bind:this={ref}
	data-slot="kbd"
	data-appearance={appearance}
	class={cn(
		"cn-kbd pointer-events-none inline-flex items-center justify-center select-none",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</kbd>
