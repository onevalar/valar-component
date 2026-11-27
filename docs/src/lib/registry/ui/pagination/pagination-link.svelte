<script lang="ts">
	import { PaginationLink as SdkLink } from "@ui-sdk/svelte/pagination";
	import { styleToString } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { buttonVariants, type ButtonSize } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import type { Pagination as PaginationPrimitive } from "bits-ui";
	let {
		ref = $bindable(null),
		class: className,
		size = "icon",
		isActive,
		page,
		children,
		child,
		disabled,
		style,
		...restProps
	}: PaginationPrimitive.PageProps & {
		size?: ButtonSize;
		isActive: boolean;
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

<SdkLink
	page={page.value}
	aria-label={`Page ${page.value}`}
	data-slot="pagination-link"
	data-pagination-page=""
	data-pagination-control=""
	data-value={page.value}
	data-active={isActive}
	data-size={size}
	class={cn(
		buttonVariants({ size, variant: isActive ? "outline" : "ghost" }),
		"cn-pagination-link tabular-nums",
		className
	)}
	style={style && typeof style === "object" ? styleToString(style) : style}
	{...restProps as Record<string, unknown>}
>
	{#snippet render({ props, state })}
		{@const button = {
			...props,
			...refProps,
			disabled,
			"aria-current": isActive ? ("page" as const) : undefined,
			"data-selected": state.current ? "" : undefined,
		}}
		{#if child}
			{@render child({ props: button })}
		{:else}
			<button {...button}
				>{#if children}{@render children()}{:else}{page.value}{/if}</button
			>
		{/if}
	{/snippet}
</SdkLink>
