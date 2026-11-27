<script lang="ts">
	import { CollapsiblePanel } from "@ui-sdk/svelte/collapsible";
	import { styleToString, type StyleProperties } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		style,
		forceMount = false,
		hiddenUntilFound = false,
		child,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
		ref?: HTMLElement | null;
		style?: StyleProperties | string | null;
		forceMount?: boolean;
		hiddenUntilFound?: boolean;
		child?: Snippet<[{ props: Record<string, unknown>; open: boolean }]>;
	} = $props();

	const refKey = createAttachmentKey();
	function setRef(element: HTMLElement) {
		ref = element;
		return () => {
			ref = null;
		};
	}
	const panelStyle = $derived(
		styleToString({
			"--bits-collapsible-content-height": "var(--collapsible-panel-height)",
			"--bits-collapsible-content-width": "var(--collapsible-panel-width)",
			...(typeof style === "object" ? style : {}),
		}) + (typeof style === "string" ? `;${style}` : "")
	);
</script>

<CollapsiblePanel
	keepMounted
	{hiddenUntilFound}
	data-slot="collapsible-content"
	data-collapsible-content=""
	class={cn("cn-collapsible-content-geometry", className)}
	style={panelStyle}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			"data-slot": "collapsible-content",
			hidden:
				forceMount && !hiddenUntilFound
					? undefined
					: props.hidden === "until-found"
						? ("until-found" as const)
						: props.hidden === "" || props.hidden === true,
			"data-state": state.open ? "open" : "closed",
			[refKey]: setRef,
		}}
		{#if child}
			{@render child({ props: attributes, open: state.open })}
		{:else}
			<div {...attributes}>{@render children?.()}</div>
		{/if}
	{/snippet}
</CollapsiblePanel>
