<script lang="ts">
	import { RadioGroup as SdkRadioGroup } from "@ui-sdk/svelte/radio";
	import { untrack, type Snippet } from "svelte";
	import { styleToString } from "svelte-toolbelt";
	import { createAttachmentKey, type Attachment } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		value = $bindable(),
		defaultValue,
		class: className,
		style,
		orientation = "vertical",
		readonly,
		name,
		required,
		onValueChange,
		children,
		child,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children" | "defaultValue"> & {
		ref?: HTMLDivElement | null;
		value?: string;
		defaultValue?: string;
		orientation?: "vertical" | "horizontal";
		readonly?: boolean;
		disabled?: boolean;
		loop?: boolean;
		name?: string;
		form?: string;
		required?: boolean;
		style?: string | Record<string, string | number | null | undefined> | null;
		onValueChange?: (value: string) => void;
		children?: Snippet;
		child?: Snippet<[{ props: Record<PropertyKey, unknown> }]>;
	} = $props();

	const initiallyUncontrolled = untrack(() => value === undefined);
	const inlineStyle = $derived(style && typeof style === "object" ? styleToString(style) : style);
	const refKey = createAttachmentKey();
	const attachRef: Attachment<HTMLDivElement> = (element) => {
		ref = element;
		return () => {
			if (ref === element) ref = null;
		};
	};

	function update(next: string | null | undefined) {
		const selected = next ?? "";
		value = selected;
		onValueChange?.(selected);
	}
</script>

<SdkRadioGroup
	{...restProps}
	bind:value={() => (value === "" ? null : value), update}
	defaultValue={defaultValue === "" || (defaultValue === undefined && initiallyUncontrolled)
		? null
		: defaultValue}
	readOnly={readonly}
	name={name || undefined}
	required={Boolean(name) && required}
	aria-required={required || undefined}
	aria-orientation={orientation}
	data-orientation={orientation}
	style={inlineStyle}
	class={cn("cn-radio-group w-full", className)}
>
	{#snippet render({ props })}
		{#if child}
			{@render child({ props: { ...props, "data-slot": "radio-group", [refKey]: attachRef } })}
		{:else}
			<div {...props} bind:this={ref} data-slot="radio-group">
				{@render children?.()}
			</div>
		{/if}
	{/snippet}
</SdkRadioGroup>
