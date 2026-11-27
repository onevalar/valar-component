<script lang="ts">
	import { SelectGroup as SdkGroup } from "@ui-sdk/svelte/select";
	import type { StyleProperties } from "svelte-toolbelt";
	import { setContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { SELECT_GROUP_KEY, bindElementRef, toStyleString } from "./context.js";

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

	setContext(SELECT_GROUP_KEY, true);
	const refAttachment = bindElementRef<HTMLDivElement>((el) => {
		ref = el;
	});
</script>

<SdkGroup
	data-slot="select-group"
	class={cn("cn-select-group", className)}
	style={toStyleString(style)}
	{...restProps}
>
	{#snippet render({ props })}
		<div {...props} {...refAttachment}>{@render children?.()}</div>
	{/snippet}
</SdkGroup>
