<script lang="ts">
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import { innerWidth } from "svelte/reactivity/window";
	import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
	import ContextMenuPortal from "./context-menu-portal.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		align = "start",
		alignOffset = -3,
		side,
		portalProps,
		elevated = false,
		role = "menu",
		children,
		child,
		escapeKeydownBehavior = "close",
		onEscapeKeydown,
		...restProps
	}: ContextMenuPrimitive.SubContentProps & {
		elevated?: boolean;
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof ContextMenuPortal>>;
	} = $props();

	const preferredSide = $derived(
		side ?? ((innerWidth.current ?? Infinity) < 400 ? "bottom" : "right")
	);

	function handleEscape(event: KeyboardEvent) {
		onEscapeKeydown?.(event);
		if (event.defaultPrevented || !ref?.id) return;
		const tree = ref.getRootNode() as Document | ShadowRoot;
		const trigger = tree.querySelector<HTMLElement>(
			`[data-slot="context-menu-sub-trigger"][aria-controls="${CSS.escape(ref.id)}"]`
		);
		trigger?.focus({ preventScroll: true });
	}
</script>

<ContextMenuPortal {...portalProps}>
	<ContextMenuPrimitive.SubContent
		bind:ref
		data-slot="context-menu-sub-content"
		data-elevated={elevated ? "" : undefined}
		side={preferredSide}
		{align}
		{alignOffset}
		class={cn(
			"cn-context-menu-sub-content cn-context-menu-content-logical cn-menu-target cn-overlay-surface cn-context-menu-surface z-50 max-h-(--bits-floating-available-height) max-w-[min(var(--bits-floating-available-width,100vw),calc(100vw-1rem))] origin-(--bits-floating-transform-origin) overflow-x-hidden overflow-y-auto overscroll-contain outline-hidden",
			elevated && "cn-context-menu-sub-elevated",
			className
		)}
		collisionPadding={8}
		strategy={portalProps?.to || portalProps?.disabled ? undefined : "fixed"}
		{escapeKeydownBehavior}
		onEscapeKeydown={handleEscape}
		{...restProps}
	>
		{#snippet child({ props, wrapperProps, open })}
			{#if child}
				{@render child({ props: { ...props, role }, wrapperProps, open })}
			{:else}
				<div {...wrapperProps}>
					<div {...props} {role}>
						{@render children?.()}
					</div>
				</div>
			{/if}
		{/snippet}
	</ContextMenuPrimitive.SubContent>
</ContextMenuPortal>
