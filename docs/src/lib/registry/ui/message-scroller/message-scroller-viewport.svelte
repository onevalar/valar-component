<script lang="ts">
	import { MessageScroller as MessageScrollerPrimitive } from "@valar/svelte-primitives/message-scroller";
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
	import { cn } from "$lib/utils.js";

	let {
		class: className,
		ref = $bindable(null),
		"aria-label": ariaLabel = "消息",
		child: customViewport,
		children,
		...restProps
	}: MessageScrollerPrimitive.ViewportProps = $props();
</script>

<MessageScrollerPrimitive.Viewport
	bind:ref
	data-slot="message-scroller-viewport"
	aria-label={ariaLabel}
	class={cn(
		"cn-message-scroller-viewport size-full min-h-0 min-w-0 scroll-fade-b contain-content data-pending-scroll:invisible",
		className
	)}
	{...restProps}
>
	{#snippet child(state)}
		{#if customViewport}
			{@render customViewport(state)}
		{:else}
			<ScrollArea.Root
				type="hover"
				overscroll="contain"
				class="size-full"
				viewportProps={state.props}
			>
				{@render children?.()}
			</ScrollArea.Root>
		{/if}
	{/snippet}
</MessageScrollerPrimitive.Viewport>
