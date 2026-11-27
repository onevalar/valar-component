<script lang="ts">
	import { CollapsibleTrigger } from "@ui-sdk/svelte/collapsible";
	import { styleToString, type StyleProperties } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		style,
		disabled,
		"aria-disabled": ariaDisabled,
		child,
		children,
		onclick,
		onkeydown,
		...restProps
	}: Omit<HTMLButtonAttributes, "style"> & {
		ref?: HTMLElement | null;
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

<CollapsibleTrigger
	data-slot="collapsible-trigger"
	data-collapsible-trigger=""
	class={cn("cn-collapsible-trigger", className)}
	style={style && typeof style === "object" ? styleToString(style) : style}
	onclick={(event) => {
		onclick?.(event);
		if (disabled) event.preventDefault();
	}}
	onkeydown={(event) => {
		onkeydown?.(event);
		if (disabled && (event.key === "Enter" || event.key === " ")) event.preventDefault();
	}}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			disabled: disabled || state.disabled,
			"aria-disabled": disabled || state.disabled ? "true" : ariaDisabled,
			"data-disabled": disabled || state.disabled ? "" : undefined,
			"data-state": state.open ? "open" : "closed",
			[refKey]: setRef,
		}}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<button {...attributes}>{@render children?.()}</button>
		{/if}
	{/snippet}
</CollapsibleTrigger>
