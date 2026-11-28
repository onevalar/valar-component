<script lang="ts">
	import {
		MenuCheckboxItem as SdkCheckboxItem,
		type MenuCheckedChangeReason,
	} from "@ui-sdk/svelte/menu";
	import type { ChangeDetails } from "@ui-sdk/core";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import {
		MENU_CHECKBOX_GROUP_KEY,
		bindElementRef,
		type MenuCheckboxGroupContext,
	} from "./context.js";

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		value,
		label,
		textValue,
		disabled,
		inset,
		class: className,
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
	const group = getContext<MenuCheckboxGroupContext | undefined>(MENU_CHECKBOX_GROUP_KEY);
	const grouped = $derived(group !== undefined && value !== undefined);
	const resolvedChecked = $derived(grouped ? group!.value.includes(value!) : checked);

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkCheckboxItem
	value={value ?? generatedId}
	label={label ?? textValue}
	disabled={disabled ?? undefined}
	checked={indeterminate ? false : resolvedChecked}
	{closeOnSelect}
	onCheckedChange={(next, details) => {
		if (onSelect) {
			onSelect(new Event("select", { cancelable: true }));
		}
		if (indeterminate) indeterminate = false;
		if (grouped) {
			group!.setChecked(value!, next);
		} else {
			checked = next;
		}
		onCheckedChange?.(next, details);
	}}
	class={cn(
		"cn-dropdown-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
			data-slot="dropdown-menu-checkbox-item"
			data-inset={inset || undefined}
			data-state={indicatorState}
			aria-checked={indeterminate ? "mixed" : isChecked ? "true" : "false"}
			data-indeterminate={indeterminate ? "" : undefined}
			{...refAttachment}
		>
			<span
				class="cn-dropdown-menu-item-indicator pointer-events-none"
				data-slot="dropdown-menu-checkbox-item-indicator"
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
