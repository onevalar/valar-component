<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		align = "start",
		appearance,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		align?: "start" | "end";
		appearance?: "agent";
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="message"
	data-align={align}
	data-appearance={appearance}
	class={cn(
		"cn-message group/message relative flex w-full min-w-0 data-[align=end]:flex-row-reverse",
		appearance === "agent" && "cn-message-agent",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
