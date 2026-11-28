<script lang="ts">
	import { Tabs as SdkTabs } from "@ui-sdk/svelte/tabs";
	import { setContext } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { tabsContext, tabsElementRef, tabsStyle, type TabsElementProps } from "./context.js";

	let {
		ref = $bindable(null),
		value = $bindable(""),
		class: className,
		activationMode,
		loop = true,
		disabled = false,
		children,
		child,
		style,
		onValueChange,
		...restProps
	}: TabsElementProps<HTMLAttributes<HTMLDivElement>> & {
		value?: string;
		activationMode?: "automatic" | "manual";
		loop?: boolean;
		disabled?: boolean;
		orientation?: "horizontal" | "vertical";
		onValueChange?: (value: string) => void;
	} = $props();
	setContext(tabsContext, () => disabled);
	const reference = tabsElementRef((element) => { ref = element; });
</script>

<SdkTabs
	value={value || null}
	activation={activationMode}
	{loop}
	data-disabled={disabled ? "" : undefined}
	class={cn("cn-tabs group/tabs flex min-w-0 data-horizontal:flex-col", className)}
	style={tabsStyle(style)}
	{...restProps}
	onValueChange={(next) => {
		if (disabled) return;
		value = next ?? "";
		onValueChange?.(value);
	}}
>
	{#snippet render({ props })}
		{@const attributes = { ...props, ...reference, "data-slot": "tabs" }}
		{#if child}{@render child({ props: attributes })}
		{:else}<div {...attributes}>{@render children?.()}</div>{/if}
	{/snippet}
</SdkTabs>
