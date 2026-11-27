<script lang="ts">
	import { SelectGroupLabel as SdkGroupLabel } from "@ui-sdk/svelte/select";
	import type { StyleProperties } from "svelte-toolbelt";
	import { getContext, type Snippet } from "svelte";
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

	const inGroup = getContext<boolean | undefined>(SELECT_GROUP_KEY) ?? false;
	const refAttachment = bindElementRef<HTMLDivElement>((el) => {
		ref = el;
	});
</script>

{#if inGroup}
	<SdkGroupLabel
		data-slot="select-label"
		class={cn("cn-select-label", className)}
		style={toStyleString(style)}
		{...restProps}
	>
		{#snippet render({ props })}
			<div {...props} {...refAttachment}>{@render children?.()}</div>
		{/snippet}
	</SdkGroupLabel>
{:else}
	<div
		bind:this={ref}
		data-slot="select-label"
		class={cn("cn-select-label", className)}
		style={toStyleString(style)}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}
