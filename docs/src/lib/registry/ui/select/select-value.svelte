<script lang="ts">
	import { SelectValue as SdkValue } from "@ui-sdk/svelte/select";
	import type { StyleProperties } from "svelte-toolbelt";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { bindElementRef, toStyleString } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		style,
		placeholder,
		maxLabels,
		getMoreLabel,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLSpanElement>, "style" | "children"> & {
		ref?: HTMLSpanElement | HTMLElement | null;
		style?: StyleProperties | string | null;
		placeholder?: string;
		maxLabels?: number;
		getMoreLabel?: (count: number) => string;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLSpanElement>((el) => {
		ref = el;
	});
</script>

<SdkValue
	{placeholder}
	{maxLabels}
	{getMoreLabel}
	data-slot="select-value"
	class={cn("truncate text-start", className)}
	style={toStyleString(style)}
	{...restProps}
>
	{#snippet render({ props, state })}
		<span {...props} {...refAttachment}>
			{#if children}
				{@render children()}
			{:else}
				{state.placeholder ? (placeholder ?? "") : state.label}
			{/if}
		</span>
	{/snippet}
</SdkValue>
