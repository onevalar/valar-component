<script lang="ts">
	import { TabsTab as SdkTab } from "@ui-sdk/svelte/tabs";
	import { getContext } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { tabsContext, tabsElementRef, tabsStyle, type TabsElementProps } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		value,
		disabled,
		children,
		child,
		style,
		...restProps
	}: TabsElementProps<HTMLButtonAttributes> & { value: string } = $props();
	const rootDisabled = getContext<() => boolean>(tabsContext);
	const isDisabled = $derived(Boolean(disabled || rootDisabled?.()));
	const reference = tabsElementRef((element) => { ref = element; });
</script>

<SdkTab
	{value}
	disabled={isDisabled}
	style={tabsStyle(style)}
	class={cn(
		"cn-tabs-trigger relative inline-flex flex-1 group-data-horizontal/tabs:h-full items-center justify-center whitespace-nowrap text-foreground/60 transition-[border-color,background-color,color,opacity,box-shadow] group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-0 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none dark:group-not-data-[variant=capsule]/tabs-list:text-muted-foreground dark:group-not-data-[variant=capsule]/tabs-list:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
		"group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
		"data-active:bg-background data-active:text-foreground dark:group-not-data-[variant=capsule]/tabs-list:data-active:border-input dark:group-not-data-[variant=capsule]/tabs-list:data-active:bg-input/30 dark:group-not-data-[variant=capsule]/tabs-list:data-active:text-foreground",
		"after:pointer-events-none after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-0 group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:end-0 group-data-vertical/tabs:after:w-0.5 motion-reduce:after:transition-none group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
		"cn-tabs-trigger-capsule",
		className
	)}
	{...restProps}
>
	{#snippet render({ props, state })}
		<!-- A native disabled tab must not register as a roving-focus destination. -->
		{@const elementProps = isDisabled ? Object.fromEntries(Object.entries(props)) : props}
		{@const attributes = { ...elementProps, ...reference, "data-slot": "tabs-trigger", "data-active": state.selected ? "" : undefined, "data-state": state.selected ? "active" : "inactive", disabled: isDisabled }}
		{#if child}{@render child({ props: attributes })}
		{:else}<button {...attributes}>{@render children?.()}</button>{/if}
	{/snippet}
</SdkTab>
