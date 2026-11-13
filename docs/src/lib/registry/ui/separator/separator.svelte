<script lang="ts">
	import { Separator as SeparatorPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		"data-slot": dataSlot = "separator",
		...restProps
	}: SeparatorPrimitive.RootProps = $props();
</script>

<SeparatorPrimitive.Root
	bind:ref
	data-slot={dataSlot}
	class={cn(
		"shrink-0 bg-[color:var(--valar-separator,var(--valar-separator-base,lch(0%_0_0_/_8.8%)))] dark:[--valar-separator-base:lch(100%_0_0_/_8.3%)] data-horizontal:h-[0.5px] data-horizontal:w-full data-vertical:w-[0.5px] data-vertical:self-stretch",
		"cn-separator-geometry",
		className
	)}
	{...restProps}
/>
