<script lang="ts" generics="T = never">
	import { TooltipTrigger as SdkTrigger, type TooltipController } from "@ui-sdk/svelte/tooltip";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { TOOLTIP_FOCUS_KEY, bindElementRef, type TooltipFocusContext } from "./context.js";

	let {
		ref = $bindable(null),
		payload,
		controller,
		disabled,
		type = "button",
		onpointerenter,
		onpointerleave,
		onpointerdown,
		onfocus,
		child,
		children,
		...restProps
	}: Omit<HTMLButtonAttributes, "children" | "disabled"> & {
		ref?: HTMLElement | null;
		payload?: T;
		controller?: TooltipController<T>;
		disabled?: boolean | null;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	const focusCtx = getContext<TooltipFocusContext | undefined>(TOOLTIP_FOCUS_KEY);
	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});

	function handlePointerEnter(event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (focusCtx) {
			focusCtx.pointerEnteredAt = performance.now();
		}
		onpointerenter?.(event);
	}

	function handlePointerLeave(event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		focusCtx?.cancelPendingHoverOpen();
		if (focusCtx?.openedByHoverTimer) {
			focusCtx.openedByHoverTimer = false;
			void focusCtx.controller.close();
		}
		onpointerleave?.(event);
	}

	function handlePointerDown(event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (focusCtx) {
			focusCtx.pointerDown = true;
			queueMicrotask(() => {
				focusCtx.pointerDown = false;
			});
		}
		onpointerdown?.(event);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onfocus?.(event);
		if (
			!focusCtx ||
			focusCtx.disabled ||
			focusCtx.pointerDown ||
			disabled ||
			performance.now() - focusCtx.lastDismissedAt < 200
		)
			return;
		const target = event.currentTarget;
		if (target.matches(":disabled")) return;
		queueMicrotask(() => {
			if (
				document.activeElement === target &&
				!focusCtx.controller.isOpen() &&
				performance.now() - focusCtx.lastDismissedAt >= 200
			) {
				void focusCtx.controller.open();
			}
		});
	}
</script>

<SdkTrigger
	{payload}
	{controller}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onpointerdown={handlePointerDown}
	onfocus={handleFocus}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			...(disabled != null ? { disabled } : {}),
			"data-slot": "tooltip-trigger",
			"data-state": state.open ? "open" : "closed",
			...refAttachment,
		}}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<button {type} {...attributes}>{@render children?.()}</button>
		{/if}
	{/snippet}
</SdkTrigger>
