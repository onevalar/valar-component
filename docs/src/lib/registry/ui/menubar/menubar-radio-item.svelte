<script lang="ts">
	import { MenuRadioItem as SdkRadioItem } from "@ui-sdk/svelte/menu";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		value,
		label,
		textValue,
		disabled,
		class: className,
		inset,
		children: childrenProp,
		closeOnSelect = false,
		onSelect,
		onclick,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "children" | "onselect"> & {
		ref?: HTMLElement | null;
		value: string;
		label?: string;
		textValue?: string;
		disabled?: boolean | null;
		inset?: boolean;
		closeOnSelect?: boolean;
		onSelect?: (event: Event) => void;
		children?: Snippet<[{ checked: boolean }]>;
	} = $props();

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkRadioItem
	{value}
	label={label ?? textValue}
	disabled={disabled ?? undefined}
	{closeOnSelect}
	class={cn(
		"cn-menubar-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	onclick={(event) => {
		onclick?.(event);
		if (onSelect && !disabled) {
			onSelect(new Event("select", { cancelable: true }));
		}
	}}
	{...restProps}
>
	{#snippet render({ props, state })}
		<div
			{...props}
			data-slot="menubar-radio-item"
			data-inset={inset || undefined}
			data-state={state.checked ? "checked" : "unchecked"}
			{...refAttachment}
		>
			<span
				data-slot="menubar-radio-item-indicator"
				class="cn-menubar-radio-item-indicator pointer-events-none absolute flex items-center justify-center"
				aria-hidden="true"
			>
				{#if state.checked}
					<IconPlaceholder
						lucide="CheckIcon"
						tabler="IconCheck"
						hugeicons="Tick02Icon"
						phosphor="CheckIcon"
						remixicon="RiCheckLine"
					/>
				{/if}
			</span>
			{@render childrenProp?.({ checked: state.checked })}
		</div>
	{/snippet}
</SdkRadioItem>
