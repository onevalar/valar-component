<script lang="ts">
	import {
		DialogTrigger as SdkTrigger,
		type DialogController,
	} from "@ui-sdk/svelte/dialog";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		type = "button",
		disabled,
		focusableWhenDisabled,
		payload,
		shortcut,
		controller,
		children,
		child,
		...restProps
	}: Omit<HTMLButtonAttributes, "children"> & {
		ref?: HTMLButtonElement | HTMLElement | null;
		focusableWhenDisabled?: boolean;
		payload?: unknown;
		shortcut?: string;
		controller?: DialogController<unknown, unknown>;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkTrigger
	{type}
	disabled={disabled ?? undefined}
	{focusableWhenDisabled}
	{payload}
	{shortcut}
	{controller}
	data-slot="sheet-trigger"
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			"data-slot": "sheet-trigger",
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
