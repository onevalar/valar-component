<script lang="ts">
	import { HoverCardContent as SdkContent } from "@ui-sdk/svelte/hover-card";
	import type { Anchor, Side } from "@ui-sdk/core";
	import type { StyleProperties } from "svelte-toolbelt";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import {
		HOVER_CARD_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		toStyleString,
		type HoverCardDismissPolicy,
		type HoverCardPolicyContext,
	} from "./context.js";

	export type HoverCardPortalProps = {
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
		anchor,
		portalProps,
		container: containerProp,
		forceMount = false,
		keepMounted,
		interactOutsideBehavior,
		escapeKeydownBehavior,
		onInteractOutside,
		onEscapeKeydown,
		// Legacy Bits props accepted without error so callers remain source-compatible.
		avoidCollisions: _avoidCollisions,
		strategy: _strategy,
		children,
		child,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> &
		HoverCardDismissPolicy & {
			ref?: HTMLDivElement | HTMLElement | null;
			style?: StyleProperties | string | null;
			appearance?: "default" | "profile";
			side?: Side;
			align?: "start" | "center" | "end";
			sideOffset?: number;
			alignOffset?: number;
			collisionPadding?: number;
			arrowPadding?: number;
			anchor?: Anchor | string | null;
			portalProps?: HoverCardPortalProps;
			container?: Element | DocumentFragment | null;
			forceMount?: boolean;
			keepMounted?: boolean;
			avoidCollisions?: boolean;
			strategy?: "fixed" | "absolute";
			child?: Snippet<[{ props: Record<string, unknown>; open: boolean }]>;
			children?: Snippet;
		} = $props();

	const policyContext = getContext<HoverCardPolicyContext | undefined>(HOVER_CARD_POLICY_KEY);
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
	});

	const compatVars =
		"--bits-link-preview-content-available-height:var(--available-height);--bits-link-preview-content-available-width:var(--available-width);--bits-link-preview-content-transform-origin:var(--transform-origin);";
</script>

<SdkContent
	{side}
	{align}
	{sideOffset}
	{alignOffset}
	{collisionPadding}
	{arrowPadding}
	{anchor}
	keepMounted={resolvedKeepMounted}
	container={resolvedContainer}
	data-slot="hover-card-content"
	data-appearance={appearance}
	class={cn(
		"cn-hover-card-content cn-hover-card-content-logical z-50 origin-(--transform-origin) outline-hidden",
		appearance === "profile" && "cn-hover-card-profile",
		className
	)}
	style={`${compatVars}${toStyleString(style) ?? ""}`}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			"data-slot": "hover-card-content",
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
