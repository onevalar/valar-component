<script lang="ts">
	import {
		MenuCheckboxItem as SdkCheckboxItem,
		type MenuCheckedChangeReason,
	} from "@ui-sdk/svelte/menu";
	import type { ChangeDetails } from "@ui-sdk/core";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		indeterminate = $bindable(false),
		value,
		label,
		textValue,
		disabled,
		inset,
		children: childrenProp,
		closeOnSelect = false,
		onCheckedChange,
		onSelect,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "children" | "onselect"> & {
		ref?: HTMLElement | null;
		checked?: boolean;
		indeterminate?: boolean;
		value?: string;
		label?: string;
		textValue?: string;
		disabled?: boolean | null;
		inset?: boolean;
		closeOnSelect?: boolean;
		onCheckedChange?: (checked: boolean, details?: ChangeDetails<MenuCheckedChangeReason>) => void;
		onSelect?: (event: Event) => void;
		children?: Snippet;
	} = $props();

	const generatedId = $props.id();
	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkCheckboxItem
	value={value ?? generatedId}
	label={label ?? textValue}
	disabled={disabled ?? undefined}
	checked={indeterminate ? false : checked}
	{closeOnSelect}
	onCheckedChange={(next, details) => {
		if (onSelect) {
			onSelect(new Event("select", { cancelable: true }));
		}
		if (indeterminate) indeterminate = false;
		checked = next;
		onCheckedChange?.(next, details);
	}}
	class={cn(
		"cn-menubar-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const isChecked = state.checked}
		{@const indicatorState = indeterminate
			? "indeterminate"
			: isChecked
				? "checked"
				: "unchecked"}
		<div
			{...props}
			data-slot="menubar-checkbox-item"
			data-inset={inset || undefined}
			data-state={indicatorState}
			aria-checked={indeterminate ? "mixed" : isChecked ? "true" : "false"}
			data-indeterminate={indeterminate ? "" : undefined}
			{...refAttachment}
		>
			<span
				data-slot="menubar-checkbox-item-indicator"
				class="cn-menubar-checkbox-item-indicator pointer-events-none absolute flex items-center justify-center"
				aria-hidden="true"
			>
				{#if indeterminate}
					<IconPlaceholder
						lucide="MinusIcon"
						tabler="IconMinus"
						hugeicons="MinusSignIcon"
						phosphor="MinusIcon"
						remixicon="RiSubtractLine"
					/>
				{:else if isChecked}
					<IconPlaceholder
						lucide="CheckIcon"
						tabler="IconCheck"
						hugeicons="Tick02Icon"
						phosphor="CheckIcon"
						remixicon="RiCheckLine"
					/>
				{/if}
			</span>
			{@render childrenProp?.()}
		</div>
	{/snippet}
</SdkCheckboxItem>
