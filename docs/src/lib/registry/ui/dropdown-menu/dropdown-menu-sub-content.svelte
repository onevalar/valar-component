<script lang="ts">
	import { MenuSubContent as SdkSubContent } from "@ui-sdk/svelte/menu";
	import type { Anchor, Side } from "@ui-sdk/core";
	import type { StyleProperties } from "svelte-toolbelt";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import {
		MENU_SUB_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		skipDisabledMenuItems,
		toStyleString,
		type MenuDismissPolicy,
		type MenuPolicyContext,
	} from "./context.js";
	import type { DropdownMenuPortalProps } from "./dropdown-menu-content.svelte";

	let {
		ref = $bindable(null),
		class: className,
		style,
		appearance = "default",
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
			portalProps?: DropdownMenuPortalProps;
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

	const policyContext = getContext<MenuPolicyContext | undefined>(MENU_SUB_POLICY_KEY);
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
		"--bits-floating-available-height:var(--available-height);--bits-floating-available-width:var(--available-width);--bits-floating-transform-origin:var(--transform-origin);";
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
	data-slot="dropdown-menu-sub-content"
	data-appearance={appearance}
	class={cn(
		"cn-dropdown-menu-sub-content cn-dropdown-menu-content-logical cn-menu-target cn-overlay-surface cn-dropdown-menu-surface z-50 max-h-(--available-height) max-w-[min(var(--available-width,100vw),calc(100vw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-hidden data-closed:overflow-hidden",
		appearance === "surface" && "animate-none!",
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
			"data-slot": "dropdown-menu-sub-content",
			"data-appearance": appearance,
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
