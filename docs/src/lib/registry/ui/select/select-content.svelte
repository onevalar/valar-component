<script lang="ts">
	import { SelectContent as SdkContent } from "@ui-sdk/svelte/select";
	import type { Anchor, Side } from "@ui-sdk/core";
	import type { StyleProperties } from "svelte-toolbelt";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import {
		bindElementRef,
		observeHighlightedReveal,
		resolvePortalContainer,
		toStyleString,
	} from "./context.js";

	export type SelectPortalProps = {
		to?: string | Element | DocumentFragment | null;
		disabled?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		style,
		side = "bottom",
		align = "start",
		sideOffset = 4,
		alignOffset = 0,
		collisionPadding = 8,
		arrowPadding,
		anchor,
		alignItemWithTrigger = false,
		portalProps,
		container: containerProp,
		forceMount = false,
		keepMounted,
		appearance = "default",
		// Legacy Bits props accepted for source compatibility.
		preventScroll: _preventScroll,
		avoidCollisions: _avoidCollisions,
		strategy: _strategy,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> & {
		ref?: HTMLDivElement | HTMLElement | null;
		style?: StyleProperties | string | null;
		side?: Side;
		align?: "start" | "center" | "end";
		sideOffset?: number;
		alignOffset?: number;
		collisionPadding?: number;
		arrowPadding?: number;
		anchor?: Anchor | string | null;
		alignItemWithTrigger?: boolean;
		portalProps?: SelectPortalProps;
		container?: Element | DocumentFragment | null;
		forceMount?: boolean;
		keepMounted?: boolean;
		appearance?: "default" | "settings";
		preventScroll?: boolean;
		avoidCollisions?: boolean;
		strategy?: "fixed" | "absolute";
		children?: Snippet;
	} = $props();

	const resolvedContainer = $derived(
		portalProps?.disabled
			? undefined
			: (containerProp ?? resolvePortalContainer(portalProps?.to))
	);
	const resolvedKeepMounted = $derived(keepMounted ?? forceMount);
	let stopReveal: (() => void) | undefined;
	const refAttachment = bindElementRef<HTMLDivElement>((el) => {
		ref = el;
		stopReveal?.();
		stopReveal = el ? observeHighlightedReveal(el) : undefined;
	});
	const compatVars =
		"--bits-select-content-available-height:var(--available-height);--bits-select-anchor-width:var(--anchor-width);--bits-select-content-transform-origin:var(--transform-origin);";
</script>

<!-- parity-ignore-upstream: data-[align-trigger=true]:animate-none | Radix marks its item-aligned mode with data-align-trigger; UI SDK aligns via alignItemWithTrigger -->
<!-- parity-ignore-upstream: data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 | UI SDK uses sideOffset directly -->
<!-- parity-ignore-upstream: data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width) | UI SDK exposes --anchor-width directly -->
<SdkContent
	{side}
	{align}
	{sideOffset}
	{alignOffset}
	{collisionPadding}
	{arrowPadding}
	{anchor}
	{alignItemWithTrigger}
	keepMounted={resolvedKeepMounted}
	container={resolvedContainer}
	data-slot="select-content"
	class={cn(
		"cn-select-content cn-select-content-logical cn-menu-target cn-overlay-surface relative z-50 max-h-(--available-height) max-w-[calc(100vw-1rem)] min-w-[min(max(8rem,var(--anchor-width,8rem)),calc(100vw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto",
		appearance === "settings" && "cn-select-content-settings animate-none!",
		className
	)}
	style={`${compatVars}${toStyleString(style) ?? ""}`}
	{...restProps}
>
	{#snippet render({ props, state })}
		<div
			{...props}
			{...refAttachment}
			data-state={state.open ? "open" : "closed"}
		>
			<div class="cn-select-viewport w-full min-w-0 scroll-my-1 px-1.5 py-1">
				{@render children?.()}
			</div>
		</div>
	{/snippet}
</SdkContent>
