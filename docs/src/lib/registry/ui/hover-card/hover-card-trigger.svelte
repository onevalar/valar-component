<script lang="ts">
	import { HoverCardTrigger as SdkTrigger, type HoverCardController } from "@ui-sdk/svelte/hover-card";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import {
		HOVER_CARD_FOCUS_KEY,
		bindElementRef,
		type HoverCardFocusContext,
	} from "./context.js";

	let {
		ref = $bindable(null),
		payload,
		controller,
		onpointerdown,
		onfocus,
		child,
		children,
		...restProps
	}: Omit<HTMLAnchorAttributes, "children"> & {
		ref?: HTMLElement | null;
		payload?: unknown;
		controller?: HoverCardController<unknown>;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	const focusCtx = getContext<HoverCardFocusContext | undefined>(HOVER_CARD_FOCUS_KEY);
	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});

	function handlePointerDown(event: PointerEvent & { currentTarget: EventTarget & HTMLAnchorElement }) {
		if (focusCtx) {
			focusCtx.pointerDown = true;
			queueMicrotask(() => {
				focusCtx.pointerDown = false;
			});
		}
		onpointerdown?.(event);
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLAnchorElement }) {
		onfocus?.(event);
		if (
			!focusCtx ||
			focusCtx.disabled ||
			focusCtx.pointerDown ||
			performance.now() - focusCtx.lastDismissedAt < 200
		)
			return;
		const target = event.currentTarget;
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
	onpointerdown={handlePointerDown}
	onfocus={handleFocus}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			role: (restProps.role as string | undefined) ?? "button",
			"data-slot": "hover-card-trigger",
			"data-state": state.open ? "open" : "closed",
			...refAttachment,
		}}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<a {...attributes}>{@render children?.()}</a>
		{/if}
	{/snippet}
</SdkTrigger>
