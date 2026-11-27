<script lang="ts">
	import { AccordionItem } from "@ui-sdk/svelte/accordion";
	import { styleToString, type StyleProperties } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import { getAccordionOrientation } from "./context.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		style,
		child,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
		ref?: HTMLElement | null;
		style?: StyleProperties | string | null;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		value?: string;
		disabled?: boolean;
	} = $props();

	const orientation = getAccordionOrientation();
	const refKey = createAttachmentKey();
	function setRef(element: HTMLElement) {
		ref = element;
		return () => {
			ref = null;
		};
	}
</script>

<AccordionItem
	data-slot="accordion-item"
	data-accordion-item=""
	data-orientation={orientation()}
	class={cn("cn-accordion-item", className)}
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
</AccordionItem>
