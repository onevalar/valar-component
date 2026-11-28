<script lang="ts">
	import {
		MenuRadioGroup as SdkRadioGroup,
		type MenuValueChangeReason,
	} from "@ui-sdk/svelte/menu";
	import type { ChangeDetails } from "@ui-sdk/core";
	import { setContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { IN_MENU_GROUP_KEY, bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		name,
		value = $bindable(),
		defaultValue,
		onValueChange,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		ref?: HTMLElement | null;
		name?: string;
		value?: string;
		defaultValue?: string;
		onValueChange?: (value: string, details?: ChangeDetails<MenuValueChangeReason>) => void;
		children?: Snippet;
	} = $props();

	const generatedName = $props.id();
	setContext(IN_MENU_GROUP_KEY, true);

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkRadioGroup
	name={name ?? generatedName}
	bind:value
	{defaultValue}
	{onValueChange}
	{...restProps}
>
	{#snippet render({ props })}
		<div {...props} data-slot="dropdown-menu-radio-group" {...refAttachment}>
			{@render children?.()}
		</div>
	{/snippet}
</SdkRadioGroup>
