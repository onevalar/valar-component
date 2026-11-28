<script lang="ts">
	import { MenuContent as SdkContent, type MenuFinalFocus } from "@ui-sdk/svelte/menu";
	import type { Anchor, Side } from "@ui-sdk/core";
	import type { StyleProperties } from "svelte-toolbelt";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { innerWidth } from "svelte/reactivity/window";
	import { cn } from "$lib/utils.js";
	import {
		CONTEXT_MENU_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		skipDisabledMenuItems,
		toStyleString,
		type ContextMenuDismissPolicy,
		type ContextMenuPolicyContext,
	} from "./context.js";

	export type ContextMenuPortalProps = {
		to?: string | Element | DocumentFragment | null;
		disabled?: boolean;
	};

	let {
		ref = $bindable(null),
		portalProps,
		container: containerProp,
		class: className,
		style,
		side,
		align = "start",
		sideOffset,
		alignOffset,
		collisionPadding = 8,
		arrowPadding,
		anchor: anchorProp,
		customAnchor,
		finalFocus: finalFocusProp,
		forceMount = false,
		keepMounted,
		interactOutsideBehavior,
		escapeKeydownBehavior,
		onInteractOutside,
		onEscapeKeydown,
		onOpenAutoFocus,
		onCloseAutoFocus,
		onkeydown,
		onfocus,
		avoidCollisions: _avoidCollisions,
		strategy: _strategy,
		trapFocus,
		preventScroll: _preventScroll,
		collisionBoundary: _collisionBoundary,
		children,
		child,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> &
		ContextMenuDismissPolicy & {
			ref?: HTMLDivElement | HTMLElement | null;
			style?: StyleProperties | string | null;
			side?: Side;
			align?: "start" | "center" | "end";
			sideOffset?: number;
			alignOffset?: number;
			collisionPadding?: number;
			arrowPadding?: number;
			anchor?: Anchor | string | null;
			customAnchor?: Anchor | string | null;
			finalFocus?: MenuFinalFocus;
			portalProps?: ContextMenuPortalProps;
			container?: Element | DocumentFragment | null;
			forceMount?: boolean;
			keepMounted?: boolean;
			onOpenAutoFocus?: (event: Event) => void;
			onCloseAutoFocus?: (event: Event) => void;
			avoidCollisions?: boolean;
			strategy?: "fixed" | "absolute";
			trapFocus?: boolean;
			preventScroll?: boolean;
			collisionBoundary?: Element | Element[] | null;
			child?: Snippet<[{ props: Record<string, unknown>; open: boolean }]>;
			children?: Snippet;
		} = $props();

	const policyContext = getContext<ContextMenuPolicyContext | undefined>(CONTEXT_MENU_POLICY_KEY);
	function syncPolicy() {
		policyContext?.set({
			interactOutsideBehavior,
			escapeKeydownBehavior,
			trapFocus,
			onInteractOutside,
			onEscapeKeydown,
		});
	}
	syncPolicy();
	$effect.pre(() => {
		syncPolicy();
	});

	const preferredSide = $derived(
		side ?? ((innerWidth.current ?? Infinity) < 400 ? "bottom" : "right")
	);
	const resolvedContainer = $derived(
		portalProps?.disabled
			? undefined
			: (containerProp ?? resolvePortalContainer(portalProps?.to))
	);
	const resolvedAnchor = $derived(anchorProp ?? customAnchor ?? undefined);
	const resolvedKeepMounted = $derived(keepMounted ?? forceMount);

	const resolvedFinalFocus = $derived.by<MenuFinalFocus | undefined>(() => {
		if (finalFocusProp !== undefined) return finalFocusProp;
		if (!onCloseAutoFocus) return undefined;
		return () => {
			const event = new Event("closeAutoFocus", { cancelable: true });
			onCloseAutoFocus(event);
			if (event.defaultPrevented) {
				return document.activeElement instanceof HTMLElement ? document.activeElement : null;
			}
			return undefined;
		};
	});

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

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onfocus?.(event);
		if (
			event.target !== event.currentTarget ||
			event.currentTarget.getAttribute("role") !== "menu"
		) {
			return;
		}
		const firstEnabled = [
			...event.currentTarget.querySelectorAll<HTMLElement>(
				'[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]'
			),
		].find(
			(item) =>
				item.closest('[role="menu"]') === event.currentTarget &&
				item.getAttribute("aria-disabled") !== "true"
		);
		firstEnabled?.focus({ preventScroll: true });
	}

	const hasExplicitAriaLabel = $derived(
		Boolean((restProps as Record<string, unknown>)["aria-label"]) &&
			!(restProps as Record<string, unknown>)["aria-labelledby"]
	);

	const compatVars =
		"--bits-floating-available-height:var(--available-height);--bits-floating-available-width:var(--available-width);--bits-floating-transform-origin:var(--transform-origin);";
</script>

<SdkContent
	side={preferredSide}
	{align}
	{sideOffset}
	{alignOffset}
	{collisionPadding}
	{arrowPadding}
	anchor={resolvedAnchor}
	finalFocus={resolvedFinalFocus}
	keepMounted={resolvedKeepMounted}
	container={resolvedContainer}
	data-slot="context-menu-content"
	class={cn(
		"cn-context-menu-content cn-context-menu-content-logical cn-menu-target cn-overlay-surface cn-context-menu-surface z-50 max-h-(--available-height) max-w-[min(var(--available-width,100vw),calc(100vw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden",
		className
	)}
	style={`${compatVars}${toStyleString(style) ?? ""}`}
	onkeydown={handleKeydown}
	onfocus={handleFocus}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			...(hasExplicitAriaLabel ? { "aria-labelledby": undefined } : {}),
			"data-slot": "context-menu-content",
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
</SdkContent>
