<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		pressed = false,
		type = "button",
		children,
		...restProps
	}: WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & { pressed?: boolean } = $props();
</script>

<button
	bind:this={ref}
	{type}
	data-slot="bubble-reaction"
	aria-pressed={pressed}
	class={cn(
		"cn-bubble-reaction inline-flex min-w-0 shrink-0 items-center justify-center outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:opacity-50",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</button>
