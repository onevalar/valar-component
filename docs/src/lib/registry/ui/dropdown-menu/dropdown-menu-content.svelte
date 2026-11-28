<script lang="ts">
	import { MenuContent as SdkContent, type MenuFinalFocus } from "@ui-sdk/svelte/menu";
	import type { Anchor, Side } from "@ui-sdk/core";
	import type { StyleProperties } from "svelte-toolbelt";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import {
		MENU_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		skipDisabledMenuItems,
		toStyleString,
		type MenuDismissPolicy,
		type MenuPolicyContext,
	} from "./context.js";

	export type DropdownMenuPortalProps = {
		to?: string | Element | DocumentFragment | null;
		disabled?: boolean;
	};

	let {
		ref = $bindable(null),
		side = "bottom",
		sideOffset = 4,
		align = "start",
		alignOffset = 0,
		collisionPadding = 8,
		arrowPadding,
		anchor: anchorProp,
		customAnchor,
		finalFocus: finalFocusProp,
		portalProps,
		container: containerProp,
		forceMount = false,
		keepMounted,
		class: className,
		style,
		appearance = "default",
		interactOutsideBehavior,
		escapeKeydownBehavior,
		onInteractOutside,
		onEscapeKeydown,
		onOpenAutoFocus,
		onCloseAutoFocus,
		onkeydown,
		// Legacy Bits props accepted without error so callers remain source-compatible.
		avoidCollisions: _avoidCollisions,
		strategy: _strategy,
		trapFocus,
		preventScroll: _preventScroll,
		collisionBoundary: _collisionBoundary,
		children,
		child,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> &
		MenuDismissPolicy & {
			ref?: HTMLDivElement | HTMLElement | null;
			style?: StyleProperties | string | null;
			appearance?: "default" | "surface";
			side?: Side;
			align?: "start" | "center" | "end";
			sideOffset?: number;
			alignOffset?: number;
			collisionPadding?: number;
			arrowPadding?: number;
			anchor?: Anchor | string | null;
			customAnchor?: Anchor | string | null;
			finalFocus?: MenuFinalFocus;
			portalProps?: DropdownMenuPortalProps;
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

	const policyContext = getContext<MenuPolicyContext | undefined>(MENU_POLICY_KEY);
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

	const resolvedContainer = $derived(
		portalProps?.disabled
			? undefined
			: (containerProp ?? resolvePortalContainer(portalProps?.to))
	);
	const resolvedAnchor = $derived(anchorProp ?? customAnchor);
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

	const hasExplicitAriaLabel = $derived(
		Boolean((restProps as Record<string, unknown>)["aria-label"]) &&
			!(restProps as Record<string, unknown>)["aria-labelledby"]
	);

	const compatVars =
		"--bits-floating-available-height:var(--available-height);--bits-floating-available-width:var(--available-width);--bits-floating-transform-origin:var(--transform-origin);--bits-dropdown-menu-anchor-width:var(--anchor-width);";
</script>

<SdkContent
	{side}
	{sideOffset}
	{align}
	{alignOffset}
	{collisionPadding}
	{arrowPadding}
	anchor={resolvedAnchor}
	finalFocus={resolvedFinalFocus}
	keepMounted={resolvedKeepMounted}
	container={resolvedContainer}
	data-slot="dropdown-menu-content"
	data-appearance={appearance}
	class={cn(
		"cn-dropdown-menu-content cn-dropdown-menu-content-logical cn-menu-target cn-overlay-surface cn-dropdown-menu-surface z-50 max-h-(--available-height) max-w-[min(var(--available-width,100vw),calc(100vw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-hidden data-closed:overflow-hidden",
		appearance === "default" ? "w-(--anchor-width)" : "animate-none!",
		className
	)}
	style={`${compatVars}${toStyleString(style) ?? ""}`}
	onkeydown={handleKeydown}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			...(hasExplicitAriaLabel ? { "aria-labelledby": undefined } : {}),
			"data-slot": "dropdown-menu-content",
			"data-appearance": appearance,
			"data-side": (props["data-side"] as string | undefined) ?? side,
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
