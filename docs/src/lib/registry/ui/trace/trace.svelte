<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & { appearance?: "agent" } = $props();
</script>

<div
	bind:this={ref}
	data-slot="trace"
	data-appearance={appearance}
	class={cn(
		"cn-trace flex w-full min-w-0 flex-col *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:text-start *:has-[>[data-slot=trace-line]]:outline-none",
		appearance === "agent" && "cn-trace-agent",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
