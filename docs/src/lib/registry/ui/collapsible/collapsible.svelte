<script lang="ts">
	import { Collapsible } from "@ui-sdk/svelte/collapsible";
	import { styleToString, type StyleProperties } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		open = $bindable(),
		defaultOpen,
		appearance = "default",
		class: className,
		style,
		child,
		children,
		onOpenChange,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
		ref?: HTMLElement | null;
		open?: boolean;
		defaultOpen?: boolean;
		disabled?: boolean;
		onOpenChange?: (open: boolean) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		appearance?: "default" | "properties";
		style?: StyleProperties | string | null;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const refKey = createAttachmentKey();
	function setRef(element: HTMLElement) {
		ref = element;
		return () => {
			ref = null;
		};
	}
</script>

<Collapsible
	bind:open
	{defaultOpen}
	onOpenChange={(next) => onOpenChange?.(next)}
	data-slot="collapsible"
	data-collapsible-root=""
	data-appearance={appearance}
	class={cn(appearance === "properties" && "cn-collapsible-properties", className)}
	style={style && typeof style === "object" ? styleToString(style) : style}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			"data-state": state.open ? "open" : "closed",
			[refKey]: setRef,
		}}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<div {...attributes}>{@render children?.()}</div>
		{/if}
	{/snippet}
</Collapsible>
