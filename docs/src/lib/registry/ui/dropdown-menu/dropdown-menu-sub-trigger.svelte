<script lang="ts">
	import { MenuSubTrigger as SdkSubTrigger } from "@ui-sdk/svelte/menu";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		inset,
		disabled,
		child,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		ref?: HTMLElement | null;
		inset?: boolean;
		disabled?: boolean | null;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		children?: Snippet;
	} = $props();

	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

<SdkSubTrigger
	disabled={disabled ?? undefined}
	class={cn(
		"cn-dropdown-menu-sub-trigger flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = {
			...props,
			"data-slot": "dropdown-menu-sub-trigger",
			"data-inset": inset || undefined,
			"data-state": state.open ? "open" : "closed",
			...refAttachment,
		}}
		{#if child}
			{@render child({ props: attributes })}
		{:else}
			<div {...attributes}>
				{@render children?.()}
				<IconPlaceholder
					lucide="ChevronRightIcon"
					tabler="IconChevronRight"
					hugeicons="ArrowRight01Icon"
					phosphor="CaretRightIcon"
					remixicon="RiArrowRightSLine"
					class="cn-rtl-flip ms-auto rtl:rotate-180"
				/>
			</div>
		{/if}
	{/snippet}
</SdkSubTrigger>
