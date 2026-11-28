<script lang="ts">
	import { MenuTrigger as SdkTrigger } from "@ui-sdk/svelte/menu";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		disabled,
		focusableWhenDisabled,
		shortcut,
		child,
		children,
		...restProps
	}: Omit<HTMLButtonAttributes, "children" | "disabled"> & {
		ref?: HTMLElement | null;
		disabled?: boolean | null;
		focusableWhenDisabled?: boolean;
		shortcut?: string;
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
	{shortcut}
	class={cn("cn-menubar-trigger flex items-center outline-hidden select-none", className)}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			"data-slot": "menubar-trigger",
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
