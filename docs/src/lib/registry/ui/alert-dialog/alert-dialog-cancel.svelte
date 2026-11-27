<script lang="ts">
	import { DialogClose as SdkClose } from "@ui-sdk/svelte/dialog";
	import {
		buttonVariants,
		type ButtonVariant,
		type ButtonSize,
	} from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		type = "button",
		variant = "outline",
		size = "default",
		children,
		child,
		...restProps
	}: Omit<HTMLButtonAttributes, "children" | "value"> & {
		ref?: HTMLButtonElement | HTMLElement | null;
		variant?: ButtonVariant;
		size?: ButtonSize;
		value?: string;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkClose
	{type}
	data-slot="alert-dialog-cancel"
	data-variant={variant}
	class={cn(buttonVariants({ variant, size, shape: "pill" }), "cn-alert-dialog-cancel", className)}
	{...restProps}
>
	{#snippet render({ props })}
		{@const attributes = {
			...props,
			"data-slot": "alert-dialog-cancel",
			...refAttachment,
		}}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<button {...attributes}>{@render children?.()}</button>
		{/if}
	{/snippet}
</SdkClose>
