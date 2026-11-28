<script lang="ts">
	import { MenuContextTrigger as SdkContextTrigger, type MenuController } from "@ui-sdk/svelte/menu";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		disabled,
		payload,
		controller,
		onkeydown,
		child,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		ref?: HTMLElement | null;
		disabled?: boolean | null;
		payload?: unknown;
		controller?: MenuController<unknown>;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		onkeydown?.(event);
		const opensMenu = event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey);
		if (
			disabled ||
			event.defaultPrevented ||
			event.isComposing ||
			event.target !== event.currentTarget ||
			!opensMenu
		) {
			return;
		}

		event.preventDefault();
		const target = event.currentTarget;
		const bounds = target.getBoundingClientRect();
		// button: 0 lets @ui-sdk/core recognize a keyboard contextmenu and focus the first item.
		target.dispatchEvent(
			new MouseEvent("contextmenu", {
				bubbles: true,
				cancelable: true,
				button: 0,
				clientX: bounds.left + Math.min(16, bounds.width / 2),
				clientY: bounds.bottom - Math.min(8, bounds.height / 2),
			})
		);
	}
</script>

<SdkContextTrigger
	disabled={disabled ?? undefined}
	{payload}
	{controller}
	class={cn("cn-context-menu-trigger select-none", className)}
	{...restProps}
	onkeydown={handleKeydown}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			"data-slot": "context-menu-trigger",
			"data-state": state.open ? "open" : "closed",
			...refAttachment,
		}}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<div {...attributes}>{@render children?.()}</div>
		{/if}
	{/snippet}
</SdkContextTrigger>
