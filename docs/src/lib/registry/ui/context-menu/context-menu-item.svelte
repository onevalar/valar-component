<script lang="ts">
	import { MenuItem as SdkItem } from "@ui-sdk/svelte/menu";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		inset,
		variant = "default",
		value,
		label,
		textValue,
		disabled,
		shortcut,
		closeOnSelect = true,
		onSelect,
		child,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "children" | "onselect"> & {
		ref?: HTMLElement | null;
		inset?: boolean;
		variant?: "default" | "destructive";
		value?: string;
		label?: string;
		textValue?: string;
		disabled?: boolean | null;
		shortcut?: string;
		closeOnSelect?: boolean;
		onSelect?: (event: Event) => unknown;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkItem
	{value}
	label={label ?? textValue}
	disabled={disabled ?? undefined}
	destructive={variant === "destructive"}
	{shortcut}
	{closeOnSelect}
	{onSelect}
	class={cn(
		"cn-context-menu-item group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	{...restProps}
>
	{#snippet render({ props })}
		{@const attributes = {
			...props,
			"data-slot": "context-menu-item",
			"data-inset": inset || undefined,
			"data-variant": variant,
			...refAttachment,
		}}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<div {...attributes}>{@render children?.()}</div>
		{/if}
	{/snippet}
</SdkItem>
