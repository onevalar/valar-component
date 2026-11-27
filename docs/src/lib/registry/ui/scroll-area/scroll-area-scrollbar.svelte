<script lang="ts">
	import { ScrollAreaScrollbar, ScrollAreaThumb } from "@ui-sdk/svelte/scroll-area";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn, type WithoutChild } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		orientation = "vertical",
		forceMount,
		children,
		...restProps
	}: WithoutChild<HTMLAttributes<HTMLDivElement>> & {
		ref?: HTMLElement | null;
		orientation?: "vertical" | "horizontal";
		forceMount?: boolean;
	} = $props();
	const refProps = {
		[createAttachmentKey()]: (element: HTMLDivElement) => {
			ref = element;
			return () => {
				if (ref === element) ref = null;
			};
		},
	};
</script>

<ScrollAreaScrollbar
	{...refProps}
	data-slot="scroll-area-scrollbar"
	data-orientation={orientation}
	data-vertical={orientation === "vertical" ? "" : undefined}
	data-horizontal={orientation === "horizontal" ? "" : undefined}
	{orientation}
	class={cn(
		"cn-scroll-area-scrollbar flex touch-none p-px opacity-0 transition-[color,opacity] select-none data-visible:opacity-100 motion-reduce:transition-none",
		orientation === "vertical" && "h-auto!",
		forceMount && "flex!",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ScrollAreaThumb
		data-slot="scroll-area-thumb"
		class={cn(
			"cn-scroll-area-thumb relative shrink-0 bg-border",
			orientation === "vertical" ? "w-full" : "h-full"
		)}
	/>
</ScrollAreaScrollbar>
