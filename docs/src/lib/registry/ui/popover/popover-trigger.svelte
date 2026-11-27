<script lang="ts">
	import { PopoverTrigger as SdkTrigger, type PopoverController } from "@ui-sdk/svelte/popover";
	import type { StyleProperties } from "svelte-toolbelt";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { bindElementRef, toStyleString } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		style,
		disabled,
		focusableWhenDisabled,
		payload,
		shortcut,
		controller,
		child,
		children,
		...restProps
	}: Omit<HTMLButtonAttributes, "style" | "children"> & {
		ref?: HTMLButtonElement | HTMLElement | null;
		style?: StyleProperties | string | null;
		disabled?: boolean;
		focusableWhenDisabled?: boolean;
		payload?: unknown;
		shortcut?: string;
		controller?: PopoverController<unknown>;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLButtonElement>((el) => {
		ref = el;
	});
</script>

<SdkTrigger
	{disabled}
	{focusableWhenDisabled}
	{payload}
	{shortcut}
	{controller}
	data-slot="popover-trigger"
	class={cn("", className)}
	style={toStyleString(style)}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			"data-state": state.open ? "open" : "closed",
			...refAttachment,
		}}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<button {...attributes}>{@render children?.()}</button>
		{/if}
	{/snippet}
</SdkTrigger>
