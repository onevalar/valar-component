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
	data-slot="marker-content"
	class={cn(
		"cn-marker-content min-w-0 wrap-break-word motion-safe:group-data-[appearance=thinking]/marker:shimmer group-data-[appearance=thinking]/marker:shimmer-duration-2400 group-data-[appearance=thinking]/marker:shimmer-color-primary",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>
