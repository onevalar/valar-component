<script lang="ts" module>
	import { getContext, setContext } from "svelte";
	import type { PaneGroupProps } from "paneforge";

	const directionKey = Symbol("resizable direction");

	export function getPaneGroupDirection() {
		return getContext<() => PaneGroupProps["direction"]>(directionKey);
	}
</script>

<script lang="ts">
	import * as ResizablePrimitive from "paneforge";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		this: paneGroup = $bindable(),
		direction,
		class: className,
		...restProps
	}: ResizablePrimitive.PaneGroupProps & {
		this?: ResizablePrimitive.PaneGroup;
	} = $props();

	setContext(directionKey, () => direction);
</script>

<ResizablePrimitive.PaneGroup
	bind:ref
	bind:this={paneGroup}
	{direction}
	data-slot="resizable-pane-group"
	class={cn(
		// parity-ignore: Paneforge exposes the group axis as data-direction; Radix uses aria-orientation
		"cn-resizable-panel-group flex h-full w-full data-[direction=vertical]:flex-col",
		className
	)}
	{...restProps}
/>
