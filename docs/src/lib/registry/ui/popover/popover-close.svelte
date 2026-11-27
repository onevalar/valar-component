<script lang="ts">
	import { PopoverClose as SdkClose } from "@ui-sdk/svelte/popover";
	import type { StyleProperties } from "svelte-toolbelt";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { bindElementRef, toStyleString } from "./context.js";

	let {
		ref = $bindable(null),
		style,
		child,
		children,
		...restProps
	}: Omit<HTMLButtonAttributes, "style" | "children"> & {
		ref?: HTMLButtonElement | HTMLElement | null;
		style?: StyleProperties | string | null;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLButtonElement>((el) => {
		ref = el;
	});
</script>

<SdkClose data-slot="popover-close" style={toStyleString(style)} {...restProps}>
	{#snippet render({ props })}
		{@const attributes = { ...props, ...refAttachment }}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<button {...attributes}>{@render children?.()}</button>
		{/if}
	{/snippet}
</SdkClose>
