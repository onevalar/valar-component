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
		onclick,
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
	{onclick}
	onSelect={(event) => {
		const result = onSelect?.(event);
		if (onclick && event.type !== "click") {
			onclick(event as unknown as MouseEvent & { currentTarget: EventTarget & HTMLDivElement });
		}
		return result;
	}}
	class={cn(
		"cn-dropdown-menu-item group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	{...restProps}
>
	{#snippet render({ props })}
		{@const attributes = {
			...props,
			"data-slot": "dropdown-menu-item",
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
