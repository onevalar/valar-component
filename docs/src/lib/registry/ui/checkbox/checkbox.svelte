<script lang="ts">
	import { checkbox, type CheckboxGroupApi } from "@ui-sdk/core/checkbox";
	import { usePart, usePrimitive } from "@ui-sdk/svelte/primitive";
	import { getContext } from "svelte";
	import { styleToString } from "svelte-toolbelt";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import { checkboxGroupKey } from "./checkbox-group.svelte";

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		id: userId,
		disabled = false,
		readonly = false,
		required = false,
		name,
		value = "on",
		form,
		type = "button",
		tabindex,
		style,
		parent,
		onCheckedChange,
		onIndeterminateChange,
		onkeydown,
		onclick,
		...restProps
	}: Omit<HTMLButtonAttributes, "children" | "value" | "style"> & {
		ref?: HTMLButtonElement | null;
		checked?: boolean;
		indeterminate?: boolean;
		readonly?: boolean | null;
		required?: boolean;
		value?: string;
		style?: string | Record<string, string | number | null | undefined> | null;
		parent?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		onIndeterminateChange?: (indeterminate: boolean) => void;
	} = $props();

	const uid = $props.id();
	const group = getContext<(() => CheckboxGroupApi) | undefined>(checkboxGroupKey);
	const handle = usePrimitive<typeof checkbox>(checkbox, () => ({
		id: userId ?? uid,
		checked: indeterminate ? "indeterminate" : checked,
		group,
		parent,
		value,
		name: group ? (name ?? undefined) : undefined,
		form: group ? (form ?? undefined) : undefined,
		disabled: Boolean(disabled),
		readOnly: Boolean(readonly),
		required,
		onCheckedChange(next) {
			if (indeterminate) {
				indeterminate = false;
				onIndeterminateChange?.(false);
			}
			checked = next === true;
			onCheckedChange?.(checked);
		}
	}));
	const root = usePart<typeof checkbox, "root">(handle, "root");
	const indicator = usePart<typeof checkbox, "indicator">(handle, "indicator", () => ({
		keepMounted: true
	}));
	const input = usePart<typeof checkbox, "input">(handle, "input");
	const inlineStyle = $derived(style && typeof style === "object" ? styleToString(style) : style);
	const state = $derived(root.state.indeterminate ? "indeterminate" : root.state.checked);

	const nativeClick: NonNullable<HTMLButtonAttributes["onclick"]> = (event) => {
		onclick?.(event);
		if (!event.defaultPrevented) handle.api.toggle({ reason: "press", event });
	};
	const keydown: NonNullable<HTMLButtonAttributes["onkeydown"]> = (event) => {
		onkeydown?.(event);
		if (event.defaultPrevented || root.attrs.disabled || readonly) return;
		if (event.key === "Enter") {
			event.preventDefault();
			if (type === "submit") event.currentTarget.form?.requestSubmit();
		} else if (event.key === " ") {
			event.preventDefault();
			handle.api.toggle({ reason: "press", event });
		}
	};
	// Preserve the native default action of an explicitly configured submit button.
	const button = $derived(
		!group && (type === "submit" || readonly)
			? {
					...restProps,
					...root.attrs,
					onclick: nativeClick,
					onkeydown: keydown
				}
			: root.slot({
					...restProps,
					id: userId ?? uid,
					onclick,
					onkeydown: keydown
				})
	);
</script>

<button
	{...button}
	bind:this={ref}
	id={userId ?? uid}
	{form}
	{type}
	{tabindex}
	style={inlineStyle}
	role="checkbox"
	data-slot="checkbox"
	data-checkbox-root=""
	data-state={state === "indeterminate" ? state : state ? "checked" : "unchecked"}
	class={cn(
		"cn-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
>
	<div
		{...indicator.slot()}
		data-slot="checkbox-indicator"
		class="cn-checkbox-indicator grid place-content-center text-current transition-none"
		aria-hidden="true"
	>
		{#if state === "indeterminate"}
			<IconPlaceholder
				lucide="MinusIcon"
				tabler="IconMinus"
				hugeicons="MinusSignIcon"
				phosphor="MinusIcon"
				remixicon="RiSubtractLine"
			/>
		{:else if state}
			<IconPlaceholder
				lucide="CheckIcon"
				tabler="IconCheck"
				hugeicons="Tick02Icon"
				phosphor="CheckIcon"
				remixicon="RiCheckLine"
			/>
		{/if}
	</div>
</button>

{#if group}
	<input {...input.slot()} />
{:else if name}
	<!-- Standalone fields keep Bits-era FormData and reset behavior without a legacy primitive. -->
	<input
		type="checkbox"
		{name}
		{form}
		{value}
		{checked}
		defaultChecked={checked}
		{disabled}
		{required}
		aria-hidden="true"
		tabindex={-1}
		class="sr-only"
		onfocus={() => ref?.focus()}
	/>
{/if}
