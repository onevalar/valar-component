<script lang="ts">
	import { Root as ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { AttachmentOrientation } from "./attachment.svelte";
	import type { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		style,
		id,
		orientation = "horizontal",
		"aria-label": label,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		orientation?: AttachmentOrientation;
	} = $props();

	const viewportProps: Omit<ScrollAreaPrimitive.ViewportProps, "children" | "ref"> = $derived({
		...restProps,
		id: id ?? undefined,
		"aria-label": label,
		"data-slot": "attachment-group",
		class: cn(
			"[max-height:inherit] [gap:inherit] [&>[data-scroll-area-content]]:flex [&>[data-scroll-area-content]]:[gap:inherit]",
			orientation === "horizontal"
				? "scroll-fade-x snap-x snap-mandatory [scroll-padding:inherit] overscroll-x-contain [&>[data-scroll-area-content]>[data-slot=attachment]]:flex-none [&>[data-scroll-area-content]>[data-slot=attachment]]:snap-start"
				: "[&>[data-scroll-area-content]]:flex-col"
		),
	});
</script>

<ScrollArea
	bind:viewportRef={ref}
	{orientation}
	type="hover"
	style={style ?? undefined}
	class={cn("cn-attachment-group max-w-full min-w-0", className)}
	viewportLabel={label ?? undefined}
	{viewportProps}
>
	{@render children?.()}
</ScrollArea>
