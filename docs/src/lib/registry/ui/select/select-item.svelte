<script lang="ts">
	import { SelectItem as SdkItem } from "@ui-sdk/svelte/select";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import type { StyleProperties } from "svelte-toolbelt";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { bindElementRef, toStyleString } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		style,
		value,
		label,
		disabled = false,
		index,
		children: childrenProp,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> & {
		ref?: HTMLDivElement | HTMLElement | null;
		style?: StyleProperties | string | null;
		value: string;
		label?: string;
		disabled?: boolean;
		index?: number;
		children?: Snippet<[{ selected: boolean; highlighted: boolean }]>;
	} = $props();

	const refAttachment = bindElementRef<HTMLDivElement>((el) => {
		ref = el;
	});
</script>

<SdkItem
	{value}
	{label}
	{disabled}
	{index}
	data-slot="select-item"
	class={cn(
		"cn-select-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	style={toStyleString(style)}
	{...restProps}
>
	{#snippet render({ props, state })}
		<div
			{...props}
			{...refAttachment}
			aria-disabled={disabled || state.disabled ? "true" : undefined}
			data-disabled={disabled || state.disabled ? "" : undefined}
		>
			<span class="cn-select-item-indicator" aria-hidden="true">
				{#if state.selected}
					<IconPlaceholder
						lucide="CheckIcon"
						tabler="IconCheck"
						hugeicons="Tick02Icon"
						phosphor="CheckIcon"
						remixicon="RiCheckLine"
						class="cn-select-item-indicator-icon pointer-events-none"
					/>
				{/if}
			</span>
			<!-- parity-ignore: UI SDK renders item content inline; keep Valar's text wrapper -->
			<span class="cn-select-item-text min-w-0">
				{#if childrenProp}
					{@render childrenProp({ selected: state.selected, highlighted: state.highlighted })}
				{:else}
					<span class="truncate">{label || value}</span>
				{/if}
			</span>
		</div>
	{/snippet}
</SdkItem>
