<script lang="ts">
	import { SelectGroupLabel as SdkGroupLabel } from "@ui-sdk/svelte/select";
	import type { StyleProperties } from "svelte-toolbelt";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { bindElementRef, toStyleString } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		style,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style" | "children"> & {
		ref?: HTMLDivElement | HTMLElement | null;
		style?: StyleProperties | string | null;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLDivElement>((el) => {
		ref = el;
	});
</script>

<!-- parity-ignore: UI SDK uses SelectGroupLabel inside SelectGroup; keep our slot name -->
<SdkGroupLabel
	data-slot="select-group-heading"
	class={cn("cn-select-label", className)}
	style={toStyleString(style)}
	{...restProps}
>
	{#snippet render({ props })}
		<div {...props} {...refAttachment}>{@render children?.()}</div>
	{/snippet}
</SdkGroupLabel>
