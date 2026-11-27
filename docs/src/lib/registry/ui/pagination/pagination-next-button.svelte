<script lang="ts">
	import { PaginationNext as SdkNext } from "@ui-sdk/svelte/pagination";
	import { styleToString } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import { buttonVariants } from "../button/index.js";
	import type { Pagination as PaginationPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		children,
		child,
		disabled,
		label = "下一页",
		style,
		...restProps
	}: PaginationPrimitive.NextButtonProps & {
		/** Visible button text. */
		label?: string;
	} = $props();
	const refProps = {
		[createAttachmentKey()]: (element: HTMLButtonElement) => {
			ref = element;
			return () => {
				if (ref === element) ref = null;
			};
		},
	};
</script>

{#snippet Fallback()}
	<span>{label}</span>
	<IconPlaceholder
		lucide="ChevronRightIcon"
		tabler="IconChevronRight"
		hugeicons="ArrowRightIcon"
		phosphor="CaretRightIcon"
		remixicon="RiArrowRightSLine"
		class={cn("cn-rtl-flip size-4", className)}
	/>
{/snippet}

<SdkNext
	aria-label="下一页"
	data-pagination-next=""
	data-pagination-control=""
	class={cn(buttonVariants({ variant: "ghost" }), "cn-pagination-next", className)}
	style={style && typeof style === "object" ? styleToString(style) : style}
	{...restProps as Record<string, unknown>}
>
	{#snippet render({ props, state })}
		{@const button = { ...props, ...refProps, disabled: disabled || state.disabled }}
		{#if child}
			{@render child({ props: button })}
		{:else}
			<button {...button}
				>{#if children}{@render children()}{:else}{@render Fallback()}{/if}</button
			>
		{/if}
	{/snippet}
</SdkNext>
