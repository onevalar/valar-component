<script lang="ts">
	import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
	import { cn, type WithoutChild } from "$lib/utils.js";
	import Scrollbar from "./scroll-area-scrollbar.svelte";

	let {
		ref = $bindable(null),
		viewportRef = $bindable(null),
		class: className,
		appearance = "default",
		orientation = "vertical",
		type,
		viewportLabel,
		overscroll = "auto",
		scrollbarXClasses = "",
		scrollbarYClasses = "",
		children,
		...restProps
	}: WithoutChild<ScrollAreaPrimitive.RootProps> & {
		appearance?: "default" | "settings";
		orientation?: "vertical" | "horizontal" | "both" | undefined;
		scrollbarXClasses?: string | undefined;
		scrollbarYClasses?: string | undefined;
		viewportRef?: HTMLElement | null;
		viewportLabel?: string;
		overscroll?: "auto" | "contain";
	} = $props();

	const scrollbarAppearance = $derived(
		appearance === "settings" && "cn-scroll-area-scrollbar-settings"
	);
</script>

<ScrollAreaPrimitive.Root
	bind:ref
	data-slot="scroll-area"
	data-appearance={appearance}
	type={type ?? (appearance === "settings" ? "auto" : undefined)}
	class={cn("cn-scroll-area relative min-h-0 min-w-0", className)}
	{...restProps}
>
	<ScrollAreaPrimitive.Viewport
		bind:ref={viewportRef}
		data-slot="scroll-area-viewport"
		role={viewportLabel ? "region" : undefined}
		aria-label={viewportLabel}
		tabindex={viewportLabel ? 0 : undefined}
		class={cn(
			"cn-scroll-area-viewport size-full rounded-[inherit] outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring",
			overscroll === "contain" && "overscroll-contain"
		)}
	>
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>
	{#if orientation === "vertical" || orientation === "both"}
		<Scrollbar orientation="vertical" class={cn(scrollbarAppearance, scrollbarYClasses)} />
	{/if}
	{#if orientation === "horizontal" || orientation === "both"}
		<Scrollbar orientation="horizontal" class={cn(scrollbarAppearance, scrollbarXClasses)} />
	{/if}
	<ScrollAreaPrimitive.Corner />
</ScrollAreaPrimitive.Root>
