<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
	bind:this={ref}
	data-slot="attachment-title"
	class={cn(
		"cn-attachment-title block max-w-full min-w-0 truncate motion-safe:group-data-[state=processing]/attachment:shimmer motion-safe:group-data-[state=uploading]/attachment:shimmer",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>
