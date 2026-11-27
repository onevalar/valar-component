<script lang="ts">
	import { SelectSeparator as SdkSeparator } from "@ui-sdk/svelte/select";
	import type { StyleProperties } from "svelte-toolbelt";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { bindElementRef, toStyleString } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		style,
		decorative: _decorative,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
		ref?: HTMLDivElement | HTMLElement | null;
		style?: StyleProperties | string | null;
		decorative?: boolean;
	} = $props();

	const refAttachment = bindElementRef<HTMLDivElement>((el) => {
		ref = el;
	});
</script>

<SdkSeparator
	data-slot="select-separator"
	class={cn("cn-select-separator pointer-events-none h-[0.5px] bg-border", className)}
	style={toStyleString(style)}
	{...restProps}
>
	{#snippet render({ props })}
		<div {...props} {...refAttachment}></div>
	{/snippet}
</SdkSeparator>
