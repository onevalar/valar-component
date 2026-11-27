<script lang="ts">
	import {
		Select as SdkSelect,
		type SelectController,
		type SelectDismissReason,
		type SelectOpenChangeReason,
		type SelectValueChangeReason,
	} from "@ui-sdk/svelte/select";
	import type { ChangeDetails, DismissAttemptDetails } from "@ui-sdk/core";
	import type { ListData } from "@ui-sdk/core/select";
	import type { Snippet } from "svelte";

	export type SelectItemData = {
		value: string;
		label?: string;
		disabled?: boolean;
	};

	type SingleProps = {
		type?: "single";
		multiple?: false;
		value?: string;
		defaultValue?: string;
		onValueChange?: (value: string, details?: ChangeDetails<SelectValueChangeReason>) => void;
	};

	type MultipleProps = {
		type: "multiple";
		multiple?: true;
		value?: string[];
		defaultValue?: string[];
		onValueChange?: (value: string[], details?: ChangeDetails<SelectValueChangeReason>) => void;
	};

	let {
		type = "single",
		multiple: multipleProp,
		open = $bindable(),
		defaultOpen,
		value = $bindable(),
		defaultValue,
		items,
		name,
		form,
		autoComplete,
		disabled,
		readOnly,
		required,
		placeholder,
		loop = true,
		virtualFocus = true,
		modal,
		presentation,
		controller,
		dismissible,
		container,
		// Accepted for Bits UI compatibility.
		allowDeselect: _allowDeselect,
		scrollAlignment: _scrollAlignment,
		onValueChange,
		onOpenChange,
		onOpenChangeComplete,
		onDismissAttempt,
		children,
	}: (SingleProps | MultipleProps) & {
		open?: boolean;
		defaultOpen?: boolean;
		items?: SelectItemData[] | ListData<string>;
		name?: string;
		form?: string;
		autoComplete?: string;
		disabled?: boolean;
		readOnly?: boolean;
		required?: boolean;
		placeholder?: string;
		loop?: boolean;
		virtualFocus?: boolean;
		modal?: boolean | "pointer";
		presentation?: "auto" | "popover" | "sheet";
		controller?: SelectController<string, boolean>;
		dismissible?: boolean;
		container?: Element | DocumentFragment | null;
		allowDeselect?: boolean;
		scrollAlignment?: "nearest" | "center";
		onOpenChange?: (open: boolean, details?: ChangeDetails<SelectOpenChangeReason>) => void;
		onOpenChangeComplete?: (open: boolean) => void;
		onDismissAttempt?: (details: DismissAttemptDetails<SelectDismissReason>) => void;
		children?: Snippet;
	} = $props();

	const isMultiple = $derived(multipleProp ?? type === "multiple");

	const sdkValue = $derived.by(() => {
		if (isMultiple) {
			return Array.isArray(value) ? value : undefined;
		}
		if (value === undefined) return undefined;
		return value === "" ? null : (value as string);
	});

	const sdkDefaultValue = $derived.by(() => {
		if (defaultValue === undefined) return undefined;
		if (isMultiple) {
			return Array.isArray(defaultValue) ? defaultValue : [];
		}
		return defaultValue === "" ? null : (defaultValue as string);
	});

	function handleValueChange(
		next: string | string[] | null,
		details: ChangeDetails<SelectValueChangeReason>
	) {
		if (isMultiple) {
			const arr = Array.isArray(next) ? next : [];
			(
				onValueChange as
					| ((value: string[], details?: ChangeDetails<SelectValueChangeReason>) => void)
					| undefined
			)?.(arr, details);
			if (!details.canceled) {
				value = arr;
			}
		} else {
			const str = typeof next === "string" ? next : "";
			(
				onValueChange as
					| ((value: string, details?: ChangeDetails<SelectValueChangeReason>) => void)
					| undefined
			)?.(str, details);
			if (!details.canceled) {
				value = str;
			}
		}
	}

	function handleOpenChange(next: boolean, details: ChangeDetails<SelectOpenChangeReason>) {
		onOpenChange?.(next, details);
		if (!next && !details.canceled && details.reason === "escape-key") {
			details.event?.stopPropagation();
		}
		if (!details.canceled && open !== undefined) {
			open = next;
		}
	}
</script>

<SdkSelect
	multiple={isMultiple}
	bind:open
	{defaultOpen}
	value={sdkValue as never}
	defaultValue={sdkDefaultValue as never}
	items={items as ListData<string> | undefined}
	{name}
	{form}
	{autoComplete}
	{disabled}
	{readOnly}
	{required}
	{placeholder}
	{loop}
	{virtualFocus}
	{modal}
	{presentation}
	{controller}
	{dismissible}
	{container}
	onValueChange={handleValueChange as never}
	onOpenChange={handleOpenChange}
	{onOpenChangeComplete}
	{onDismissAttempt}
>
	{@render children?.()}
</SdkSelect>
