<script lang="ts">
	import { MenuGroupLabel as SdkGroupLabel } from "@ui-sdk/svelte/menu";
	import { getContext, type Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { IN_CONTEXT_MENU_GROUP_KEY, bindElementRef } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		inset,
		children,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
		ref?: HTMLElement | null;
		inset?: boolean;
		children?: Snippet;
	} = $props();

	const inGroup = getContext<boolean | undefined>(IN_CONTEXT_MENU_GROUP_KEY) ?? false;
	const refAttachment = bindElementRef<HTMLElement>((el) => {
		ref = el;
	});
</script>

{#if inGroup}
	<SdkGroupLabel class={cn("cn-context-menu-label", className)} {...restProps}>
		{#snippet render({ props })}
			<div
				{...props}
				data-slot="context-menu-group-heading"
				data-inset={inset || undefined}
				{...refAttachment}
			>
				{@render children?.()}
			</div>
		{/snippet}
	</SdkGroupLabel>
{:else}
	<div
		bind:this={ref}
		data-slot="context-menu-group-heading"
		data-inset={inset || undefined}
		class={cn("cn-context-menu-label", className)}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}
