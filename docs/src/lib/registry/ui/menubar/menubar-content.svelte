<script lang="ts">
	import { MenuContent as SdkContent, type MenuFinalFocus } from "@ui-sdk/svelte/menu";
	import type { Anchor, Side } from "@ui-sdk/core";
	import type { StyleProperties } from "svelte-toolbelt";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import {
		MENUBAR_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		skipDisabledMenuItems,
		toStyleString,
		type MenubarDismissPolicy,
		type MenubarPolicyContext,
	} from "./context.js";

	export type MenubarPortalProps = {
		to?: string | Element | DocumentFragment | null;
		disabled?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		style,
		sideOffset = 8,
		alignOffset = -4,
		align = "start",
		side = "bottom",
		collisionPadding = 8,
		arrowPadding,
		anchor,
		finalFocus: finalFocusProp,
		portalProps,
		container: containerProp,
		forceMount = false,
		keepMounted,
		interactOutsideBehavior,
		escapeKeydownBehavior,
		onInteractOutside,
		onEscapeKeydown,
		onOpenAutoFocus,
		onCloseAutoFocus,
		onkeydown,
		avoidCollisions: _avoidCollisions,
		strategy: _strategy,
		trapFocus: _trapFocus,
		preventScroll: _preventScroll,
		collisionBoundary: _collisionBoundary,
		children,
		child,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> &
		MenubarDismissPolicy & {
			ref?: HTMLDivElement | HTMLElement | null;
			style?: StyleProperties | string | null;
			side?: Side;
			align?: "start" | "center" | "end";
			sideOffset?: number;
			alignOffset?: number;
			collisionPadding?: number;
			arrowPadding?: number;
			anchor?: Anchor | string | null;
			finalFocus?: MenuFinalFocus;
			portalProps?: MenubarPortalProps;
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

	const policyContext = getContext<MenubarPolicyContext | undefined>(MENUBAR_POLICY_KEY);
	$effect(() => {
		policyContext?.set({
			interactOutsideBehavior,
			escapeKeydownBehavior,
			onInteractOutside,
			onEscapeKeydown,
		});
	});

	const resolvedContainer = $derived(
		portalProps?.disabled
			? undefined
			: (containerProp ?? resolvePortalContainer(portalProps?.to))
	);
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
		"--bits-menubar-content-transform-origin:var(--transform-origin);--bits-floating-available-height:var(--available-height);--bits-floating-available-width:var(--available-width);";
</script>

<SdkContent
	{align}
	{alignOffset}
	{side}
	{sideOffset}
	{collisionPadding}
	{arrowPadding}
	{anchor}
	finalFocus={resolvedFinalFocus}
	keepMounted={resolvedKeepMounted}
	container={resolvedContainer}
	data-slot="menubar-content"
	class={cn(
		"cn-menubar-content cn-menubar-content-logical cn-menu-target cn-menu-translucent z-50 origin-(--transform-origin) overflow-hidden",
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
			"data-slot": "menubar-content",
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
