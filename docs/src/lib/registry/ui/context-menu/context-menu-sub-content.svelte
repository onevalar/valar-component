<script lang="ts">
	import { MenuSubContent as SdkSubContent } from "@ui-sdk/svelte/menu";
	import type { Anchor, Side } from "@ui-sdk/core";
	import type { StyleProperties } from "svelte-toolbelt";
	import { getContext, type Snippet } from "svelte";
	import { createAttachmentKey } from "svelte/attachments";
	import type { HTMLAttributes } from "svelte/elements";
	import { innerWidth } from "svelte/reactivity/window";
	import { cn } from "$lib/utils.js";
	import {
		CONTEXT_MENU_SUB_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		skipDisabledMenuItems,
		toStyleString,
		type ContextMenuDismissPolicy,
		type ContextMenuPolicyContext,
	} from "./context.js";
	import type { ContextMenuPortalProps } from "./context-menu-content.svelte";

	let {
		ref = $bindable(null),
		class: className,
		style,
		align = "start",
		alignOffset = -3,
		side,
		sideOffset,
		collisionPadding = 8,
		arrowPadding,
		anchor,
		portalProps,
		container: containerProp,
		forceMount = false,
		keepMounted,
		elevated = false,
		role = "menu",
		interactOutsideBehavior,
		escapeKeydownBehavior = "close",
		onInteractOutside,
		onEscapeKeydown,
		onOpenAutoFocus,
		onCloseAutoFocus: _onCloseAutoFocus,
		onkeydown,
		avoidCollisions: _avoidCollisions,
		strategy: _strategy,
		trapFocus: _trapFocus,
		collisionBoundary: _collisionBoundary,
		children,
		child,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> &
		ContextMenuDismissPolicy & {
			ref?: HTMLDivElement | HTMLElement | null;
			style?: StyleProperties | string | null;
			elevated?: boolean;
			side?: Side;
			align?: "start" | "center" | "end";
			sideOffset?: number;
			alignOffset?: number;
			collisionPadding?: number;
			arrowPadding?: number;
			anchor?: Anchor | string | null;
			portalProps?: ContextMenuPortalProps;
			container?: Element | DocumentFragment | null;
			forceMount?: boolean;
			keepMounted?: boolean;
			onOpenAutoFocus?: (event: Event) => void;
			onCloseAutoFocus?: (event: Event) => void;
			avoidCollisions?: boolean;
			strategy?: "fixed" | "absolute";
			trapFocus?: boolean;
			collisionBoundary?: Element | Element[] | null;
			child?: Snippet<[{ props: Record<string, unknown>; open: boolean }]>;
			children?: Snippet;
		} = $props();

	const policyContext = getContext<ContextMenuPolicyContext | undefined>(
		CONTEXT_MENU_SUB_POLICY_KEY
	);
	$effect(() => {
		policyContext?.set({
			interactOutsideBehavior,
			escapeKeydownBehavior,
			onInteractOutside,
			onEscapeKeydown,
		});
	});

	const preferredSide = $derived(
		side ?? ((innerWidth.current ?? Infinity) < 400 ? "bottom" : "right")
	);
	const resolvedContainer = $derived(
		portalProps?.disabled
			? undefined
			: (containerProp ?? resolvePortalContainer(portalProps?.to))
	);
	const resolvedKeepMounted = $derived(keepMounted ?? forceMount);

	const refAttachment = bindElementRef<HTMLDivElement>((el) => {
		ref = el;
		if (el && onOpenAutoFocus) {
			queueMicrotask(() => {
				if (ref === el) onOpenAutoFocus(new Event("openAutoFocus", { cancelable: true }));
			});
		}
	});

	function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onkeydown?.(event);
		skipDisabledMenuItems(event.currentTarget, event.key);
	}

	const hasExplicitAriaLabel = $derived(
		Boolean((restProps as Record<string, unknown>)["aria-label"]) &&
			!(restProps as Record<string, unknown>)["aria-labelledby"]
	);

	const dialogPortalKey = createAttachmentKey();
	const dialogPortalAttachment = $derived(
		role !== "menu" && !portalProps?.disabled
			? {
					[dialogPortalKey]: (el: HTMLElement) => {
						const target = resolvedContainer ?? document.body;
						const wasPopoverOpen = el.matches?.(":popover-open") ?? false;
						const marker = document.createComment("");
						el.before(marker);
						target.appendChild(el);
						if (wasPopoverOpen) {
							try {
								el.showPopover();
							} catch {}
						}
						return () => {
							marker.replaceWith(el);
						};
					},
				}
			: {}
	);

	const compatVars =
		"--bits-floating-available-height:var(--available-height);--bits-floating-available-width:var(--available-width);--bits-floating-transform-origin:var(--transform-origin);";
</script>

<SdkSubContent
	side={preferredSide}
	{align}
	{sideOffset}
	{alignOffset}
	{collisionPadding}
	{arrowPadding}
	{anchor}
	keepMounted={resolvedKeepMounted}
	container={resolvedContainer}
	data-slot="context-menu-sub-content"
	data-elevated={elevated ? "" : undefined}
	class={cn(
		"cn-context-menu-sub-content cn-context-menu-content-logical cn-menu-target cn-overlay-surface cn-context-menu-surface z-50 max-h-(--available-height) max-w-[min(var(--available-width,100vw),calc(100vw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden",
		elevated && "cn-context-menu-sub-elevated",
		className
	)}
	style={`${compatVars}${toStyleString(style) ?? ""}`}
	onkeydown={handleKeydown}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...dialogPortalAttachment,
			...props,
			...(hasExplicitAriaLabel ? { "aria-labelledby": undefined } : {}),
			role,
			"data-slot": "context-menu-sub-content",
			"data-elevated": elevated ? "" : undefined,
			"data-side": (props["data-side"] as string | undefined) ?? preferredSide,
			"data-align": (props["data-align"] as string | undefined) ?? align,
			"data-state": state.open ? "open" : "closed",
			...refAttachment,
		}}
		{#if child}
			{@render child({ props: attributes, open: state.open })}
		{:else}
			<div {...attributes}>{@render children?.()}</div>
		{/if}
	{/snippet}
</SdkSubContent>
