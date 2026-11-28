<script lang="ts">
	import {
		PopoverContent as SdkContent,
		type PopoverFinalFocus,
		type PopoverInitialFocus,
	} from "@ui-sdk/svelte/popover";
	import type { Anchor, Side } from "@ui-sdk/core";
	import type { StyleProperties } from "svelte-toolbelt";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import {
		POPOVER_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		toStyleString,
		type PopoverDismissPolicy,
		type PopoverPolicyContext,
	} from "./context.js";

	export type PopoverPortalProps = {
		to?: string | Element | DocumentFragment | null;
		disabled?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		style,
		appearance = "default",
		side = "bottom",
		sideOffset = 4,
		align = "center",
		alignOffset = 0,
		collisionPadding = 8,
		arrowPadding,
		portalProps,
		container: containerProp,
		inline: inlineProp,
		forceMount = false,
		keepMounted,
		customAnchor,
		anchor: anchorProp,
		initialFocus: initialFocusProp,
		finalFocus: finalFocusProp,
		onOpenAutoFocus,
		onCloseAutoFocus,
		interactOutsideBehavior,
		escapeKeydownBehavior,
		onInteractOutside,
		onEscapeKeydown,
		// Legacy Bits props accepted without error so callers remain source-compatible.
		strategy: _strategy,
		avoidCollisions: _avoidCollisions,
		trapFocus: _trapFocus,
		preventScroll: _preventScroll,
		children,
		child,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> &
		PopoverDismissPolicy & {
			ref?: HTMLDivElement | HTMLElement | null;
			style?: StyleProperties | string | null;
			appearance?: "default" | "surface" | "options";
			side?: Side;
			sideOffset?: number;
			align?: "start" | "center" | "end";
			alignOffset?: number;
			collisionPadding?: number;
			arrowPadding?: number;
			portalProps?: PopoverPortalProps;
			container?: Element | DocumentFragment | null;
			inline?: boolean;
			forceMount?: boolean;
			keepMounted?: boolean;
			customAnchor?: Anchor | string | null;
			anchor?: Anchor | string | null;
			initialFocus?: PopoverInitialFocus;
			finalFocus?: PopoverFinalFocus;
			onOpenAutoFocus?: (event: Event) => void;
			onCloseAutoFocus?: (event: Event) => void;
			strategy?: "fixed" | "absolute";
			avoidCollisions?: boolean;
			trapFocus?: boolean;
			preventScroll?: boolean;
			child?: Snippet<[{ props: Record<string, unknown>; open: boolean }]>;
			children?: Snippet;
		} = $props();

	const policyContext = getContext<PopoverPolicyContext | undefined>(POPOVER_POLICY_KEY);
	$effect(() => {
		policyContext?.set({
			interactOutsideBehavior,
			escapeKeydownBehavior,
			onInteractOutside,
			onEscapeKeydown,
		});
	});

	const resolvedInline = $derived(inlineProp ?? portalProps?.disabled ?? false);
	const resolvedContainer = $derived(
		resolvedInline
			? undefined
			: (containerProp ??
				resolvePortalContainer(portalProps?.to) ??
				(typeof document !== "undefined" ? document.body : undefined))
	);
	const resolvedAnchor = $derived(anchorProp ?? customAnchor);
	const resolvedKeepMounted = $derived(keepMounted ?? forceMount);

	const resolvedInitialFocus = $derived.by<PopoverInitialFocus | undefined>(() => {
		if (initialFocusProp !== undefined) return initialFocusProp;
		if (!onOpenAutoFocus) return undefined;
		return () => {
			const event = new Event("openAutoFocus", { cancelable: true });
			onOpenAutoFocus(event);
			if (event.defaultPrevented) {
				return document.activeElement instanceof HTMLElement ? document.activeElement : null;
			}
			return (
				ref?.querySelector<HTMLElement>(
					'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
				) ?? undefined
			);
		};
	});

	const resolvedFinalFocus = $derived.by<PopoverFinalFocus | undefined>(() => {
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
	});

	const resolvedDataSlot = $derived(
		((restProps as Record<string, unknown>)["data-slot"] as string | undefined) ??
			"popover-content"
	);
	const hasExplicitAriaLabel = $derived(
		Boolean((restProps as Record<string, unknown>)["aria-label"]) &&
			!(restProps as Record<string, unknown>)["aria-labelledby"]
	);
	const compatVars =
		"--bits-popover-content-available-height:var(--available-height);--bits-popover-content-available-width:var(--available-width);--bits-popover-content-transform-origin:var(--transform-origin);";
</script>

<SdkContent
	{side}
	{align}
	{sideOffset}
	{alignOffset}
	{collisionPadding}
	{arrowPadding}
	anchor={resolvedAnchor}
	initialFocus={resolvedInitialFocus}
	finalFocus={resolvedFinalFocus}
	keepMounted={resolvedKeepMounted}
	inline={resolvedInline}
	container={resolvedContainer}
	data-slot={resolvedDataSlot}
	data-appearance={appearance}
	class={cn(
		"cn-popover-content cn-popover-content-logical cn-overlay-surface cn-popover-viewport pointer-events-auto z-50 origin-(--transform-origin) outline-hidden data-closed:pointer-events-none",
		appearance === "options" ? "w-[330px]" : "w-72",
		appearance === "surface" && "cn-overlay-menu-rows animate-none!",
		appearance === "options" && "cn-popover-options animate-none!",
		className
	)}
	style={`${compatVars}${toStyleString(style) ?? ""}`}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			...(hasExplicitAriaLabel ? { "aria-labelledby": undefined } : {}),
			hidden: !state.open || undefined,
			inert: !state.open || undefined,
			"data-slot": resolvedDataSlot,
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
