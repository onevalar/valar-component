<script lang="ts">
	import { MenuSubContent as SdkSubContent } from "@ui-sdk/svelte/menu";
	import type { Anchor, Side } from "@ui-sdk/core";
	import type { StyleProperties } from "svelte-toolbelt";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import {
		MENUBAR_SUB_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		skipDisabledMenuItems,
		toStyleString,
		type MenubarDismissPolicy,
		type MenubarPolicyContext,
	} from "./context.js";
	import type { MenubarPortalProps } from "./menubar-content.svelte";

	let {
		ref = $bindable(null),
		class: className,
		style,
		side,
		align = "start",
		sideOffset,
		alignOffset = -3,
		collisionPadding = 8,
		arrowPadding,
		anchor,
		portalProps,
		container: containerProp,
		forceMount = false,
		keepMounted,
		interactOutsideBehavior,
		escapeKeydownBehavior,
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
			portalProps?: MenubarPortalProps;
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

	const policyContext = getContext<MenubarPolicyContext | undefined>(MENUBAR_SUB_POLICY_KEY);
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

<SdkSubContent
	{side}
	{align}
	{sideOffset}
	{alignOffset}
	{collisionPadding}
	{arrowPadding}
	{anchor}
	keepMounted={resolvedKeepMounted}
	container={resolvedContainer}
	data-slot="menubar-sub-content"
	class={cn(
		"cn-menubar-sub-content cn-menu-target cn-menu-translucent z-50 origin-(--transform-origin) overflow-hidden",
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
			"data-slot": "menubar-sub-content",
			"data-side": (props["data-side"] as string | undefined) ?? side ?? "right",
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
