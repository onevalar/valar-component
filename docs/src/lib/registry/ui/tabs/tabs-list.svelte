<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	export const tabsListVariants = tv({
		base: "cn-tabs-list group/tabs-list inline-flex w-fit max-w-full items-center justify-center-safe text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-horizontal:scrollbar-none data-horizontal:overflow-x-auto",
		variants: {
			variant: {
				default: "cn-tabs-list-variant-default bg-muted",
				line: "cn-tabs-list-variant-line gap-1 bg-transparent",
				capsule: "cn-tabs-list-variant-capsule group-data-horizontal/tabs:w-full",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type TabsListVariant = VariantProps<typeof tabsListVariants>["variant"];
</script>

<script lang="ts">
	import { TabsList as SdkList } from "@ui-sdk/svelte/tabs";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { tabsElementRef, tabsStyle, type TabsElementProps } from "./context.js";

	let {
		ref = $bindable(null),
		variant = "default",
		class: className,
		onfocusin,
		children,
		child,
		style,
		...restProps
	}: TabsElementProps<HTMLAttributes<HTMLDivElement>> & {
		variant?: TabsListVariant;
	} = $props();
	const reference = tabsElementRef((element) => { ref = element; });

	const revealFocusedTab: NonNullable<HTMLAttributes<HTMLDivElement>["onfocusin"]> = (event) => {
		onfocusin?.(event);
		const list = event.currentTarget;
		const tab = event.target;
		if (
			event.defaultPrevented ||
			list.dataset.orientation !== "horizontal" ||
			list.scrollWidth <= list.clientWidth ||
			!(tab instanceof HTMLElement) ||
			tab.dataset.slot !== "tabs-trigger" ||
			tab.closest('[role="tablist"]') !== list
		)
			return;

		const start = list.getBoundingClientRect().left + list.clientLeft;
		const end = start + list.clientWidth;
		const bounds = tab.getBoundingClientRect();
		if (bounds.left < start) list.scrollBy({ left: bounds.left - start, behavior: "instant" });
		else if (bounds.right > end) list.scrollBy({ left: bounds.right - end, behavior: "instant" });
	};
</script>

<SdkList
	data-variant={variant}
	class={cn(tabsListVariants({ variant }), className)}
	onfocusin={revealFocusedTab}
	style={tabsStyle(style)}
	{...restProps}
>
	{#snippet render({ props })}
		{@const attributes = { ...props, ...reference, "data-slot": "tabs-list" }}
		{#if child}{@render child({ props: attributes })}
		{:else}<div {...attributes}>{@render children?.()}</div>{/if}
	{/snippet}
</SdkList>
