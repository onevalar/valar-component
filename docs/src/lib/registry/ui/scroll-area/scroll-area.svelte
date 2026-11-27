<script lang="ts">
	import {
		ScrollArea as SdkScrollArea,
		ScrollAreaViewport,
		ScrollAreaContent,
		ScrollAreaCorner,
		type ScrollAreaType,
	} from "@ui-sdk/svelte/scroll-area";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn, type WithoutChild } from "$lib/utils.js";
	import Scrollbar from "./scroll-area-scrollbar.svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		viewportRef = $bindable(null),
		class: className,
		appearance = "default",
		orientation = "vertical",
		type,
		scrollHideDelay,
		viewportLabel,
		overscroll = "auto",
		scrollbarXClasses = "",
		scrollbarYClasses = "",
		children,
		...restProps
	}: WithoutChild<HTMLAttributes<HTMLDivElement>> & {
		ref?: HTMLElement | null;
		type?: ScrollAreaType;
		scrollHideDelay?: number;
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
	const rootRefProps = {
		[createAttachmentKey()]: (element: HTMLDivElement) => {
			ref = element;
			return () => {
				if (ref === element) ref = null;
			};
		},
	};
	const viewportRefProps = {
		[createAttachmentKey()]: (element: HTMLDivElement) => {
			viewportRef = element;
			return () => {
				if (viewportRef === element) viewportRef = null;
			};
		},
	};
</script>

<SdkScrollArea
	{...rootRefProps}
	data-slot="scroll-area"
	data-appearance={appearance}
	type={type ?? (appearance === "settings" ? "auto" : undefined)}
	{scrollHideDelay}
	class={cn("cn-scroll-area relative min-h-0 min-w-0", className)}
	{...restProps}
>
	<ScrollAreaViewport
		{...viewportRefProps}
		data-slot="scroll-area-viewport"
		role={viewportLabel ? "region" : undefined}
		aria-label={viewportLabel}
		tabindex={viewportLabel ? 0 : undefined}
		class={cn(
			"cn-scroll-area-viewport size-full max-h-[inherit] rounded-[inherit] outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring",
			orientation === "vertical" && "overflow-x-hidden!",
			orientation === "horizontal" && "overflow-y-hidden!",
			overscroll === "contain" && "overscroll-contain"
		)}
	>
		<ScrollAreaContent>{@render children?.()}</ScrollAreaContent>
	</ScrollAreaViewport>
	{#if orientation === "vertical" || orientation === "both"}
		<Scrollbar orientation="vertical" class={cn(scrollbarAppearance, scrollbarYClasses)} />
	{/if}
	{#if orientation === "horizontal" || orientation === "both"}
		<Scrollbar orientation="horizontal" class={cn(scrollbarAppearance, scrollbarXClasses)} />
	{/if}
	<ScrollAreaCorner />
</SdkScrollArea>
