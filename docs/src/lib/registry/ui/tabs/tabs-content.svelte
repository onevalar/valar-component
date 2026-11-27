<script lang="ts">
	import { TabsPanel as SdkPanel } from "@ui-sdk/svelte/tabs";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { tabsElementRef, tabsStyle, type TabsElementProps } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		value,
		hidden,
		children,
		child,
		style,
		...restProps
	}: TabsElementProps<HTMLAttributes<HTMLDivElement>> & { value: string } = $props();
	const reference = tabsElementRef((element) => { ref = element; });
</script>

<SdkPanel
	{value}
	keepMounted
	tabindex={0}
	class={cn("cn-tabs-content min-w-0 flex-1 outline-none", className)}
	style={tabsStyle(style)}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attributes = { ...props, ...reference, "data-slot": "tabs-content", "data-state": state.selected ? "active" : "inactive", hidden: !state.selected || hidden }}
		{#if child}{@render child({ props: attributes })}
		{:else}<div {...attributes}>{@render children?.()}</div>{/if}
	{/snippet}
</SdkPanel>
