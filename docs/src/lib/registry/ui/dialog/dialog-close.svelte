<script lang="ts">
	import { DialogClose as SdkClose } from "@ui-sdk/svelte/dialog";
	import type { ActionDetails } from "@ui-sdk/core";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		type = "button",
		value,
		action,
		children,
		child,
		...restProps
	}: Omit<HTMLButtonAttributes, "children" | "value"> & {
		ref?: HTMLButtonElement | HTMLElement | null;
		value?: string;
		action?: (event: Event | undefined, details: ActionDetails) => unknown;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkClose {type} {value} {action} data-slot="dialog-close" {...restProps}>
	{#snippet render({ props })}
		{@const attributes = {
			...props,
			...refAttachment,
		}}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<button {...attributes}>{@render children?.()}</button>
		{/if}
	{/snippet}
</SdkClose>
