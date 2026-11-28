<script lang="ts">
	import { MenuTrigger as SdkTrigger, type MenuController } from "@ui-sdk/svelte/menu";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		disabled,
		focusableWhenDisabled,
		payload,
		shortcut,
		controller,
		child,
		children,
		...restProps
	}: Omit<HTMLButtonAttributes, "children" | "disabled"> & {
		ref?: HTMLElement | null;
		disabled?: boolean | null;
		focusableWhenDisabled?: boolean;
		payload?: unknown;
		shortcut?: string;
		controller?: MenuController<unknown>;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkTrigger
	disabled={disabled ?? undefined}
	{focusableWhenDisabled}
	{payload}
	{shortcut}
	{controller}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			"data-slot": "dropdown-menu-trigger",
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
