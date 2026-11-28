<script lang="ts">
	import { TooltipArrow as SdkArrow, TooltipContent as SdkContent } from "@ui-sdk/svelte/tooltip";
	import type { Anchor, Side } from "@ui-sdk/core";
	import type { StyleProperties } from "svelte-toolbelt";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import {
		TOOLTIP_POLICY_KEY,
		bindElementRef,
		resolvePortalContainer,
		toStyleString,
		type TooltipDismissPolicy,
		type TooltipPolicyContext,
	} from "./context.js";

	export type TooltipPortalProps = {
		to?: string | Element | DocumentFragment | null;
		disabled?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		style,
		appearance = "default",
		sideOffset = 6,
		side = "top",
		align = "center",
		alignOffset = 0,
		collisionPadding = 8,
		arrowPadding,
		anchor,
		arrowClasses,
		portalProps,
		container: containerProp,
		hidden,
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
		TooltipDismissPolicy & {
			ref?: HTMLDivElement | HTMLElement | null;
			style?: StyleProperties | string | null;
			arrowClasses?: string;
			appearance?: "default" | "surface";
			side?: Side;
			align?: "start" | "center" | "end";
			sideOffset?: number;
			alignOffset?: number;
			collisionPadding?: number;
			arrowPadding?: number;
			anchor?: Anchor | string | null;
			portalProps?: TooltipPortalProps;
			container?: Element | DocumentFragment | null;
			avoidCollisions?: boolean;
			strategy?: "fixed" | "absolute";
			child?: Snippet<[{ props: Record<string, unknown>; open: boolean }]>;
			children?: Snippet;
		} = $props();

	const policyContext = getContext<TooltipPolicyContext | undefined>(TOOLTIP_POLICY_KEY);
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

	const refAttachment = bindElementRef<HTMLDivElement>((el) => {
		ref = el;
	});

	const compatVars =
		"--bits-tooltip-content-available-height:var(--available-height);--bits-tooltip-content-available-width:var(--available-width);--bits-tooltip-content-transform-origin:var(--transform-origin);";
</script>

{#if !policyContext?.disabled && !hidden}
	<SdkContent
		{side}
		{align}
		{sideOffset}
		{alignOffset}
		{collisionPadding}
		{arrowPadding}
		{anchor}
		container={resolvedContainer}
		data-slot="tooltip-content"
		data-appearance={appearance}
		class={cn(
			"cn-tooltip-content cn-tooltip-content-logical cn-overlay-surface z-50 w-fit max-w-[min(20rem,calc(100vw-1rem))] origin-(--transform-origin) wrap-anywhere [&>*]:min-w-0",
			appearance === "surface" && "animate-none!",
			className
		)}
		style={`${compatVars}${toStyleString(style) ?? ""}`}
		{...restProps}
	>
		{#snippet render({ props, state })}
			{@const isHidden = props.hidden !== undefined && props.hidden !== false}
			{@const attributes = {
				...props,
				"data-slot": isHidden ? undefined : "tooltip-content",
				"data-appearance": appearance,
				"data-side": (props["data-side"] as string | undefined) ?? side,
				"data-align": (props["data-align"] as string | undefined) ?? align,
				"data-state": state.open ? "open" : "closed",
				...refAttachment,
			}}
			{#if child}
				{@render child({ props: attributes, open: state.open })}
			{:else}
				<div {...attributes}>
					{@render children?.()}
					{#if appearance === "default" && arrowClasses !== undefined}
						<SdkArrow>
							{#snippet render({ props: arrowProps })}
								<div
									{...arrowProps}
									data-slot="tooltip-arrow"
									aria-hidden="true"
									class={cn(
										"cn-tooltip-arrow z-50 bg-foreground fill-foreground",
										arrowClasses
									)}
								></div>
							{/snippet}
						</SdkArrow>
					{/if}
				</div>
			{/if}
		{/snippet}
	</SdkContent>
{/if}
