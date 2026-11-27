<script lang="ts">
	import { Separator as SdkSeparator, type SeparatorOrientation } from "@ui-sdk/svelte/separator";
	import { styleToString } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		"data-slot": dataSlot = "separator",
		orientation = "horizontal",
		decorative = false,
		child,
		children,
		style,
		...restProps
	}: Omit<HTMLAttributes<HTMLDivElement>, "style"> & {
		ref?: HTMLElement | null;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		style?: HTMLAttributes<HTMLDivElement>["style"] | Parameters<typeof styleToString>[0];
		orientation?: SeparatorOrientation;
		decorative?: boolean;
		"data-slot"?: string;
	} = $props();

	const refKey = createAttachmentKey();
	const attachRef = (element: HTMLElement) => {
		ref = element;
		return () => {
			if (ref === element) ref = null;
		};
	};
</script>

<SdkSeparator
	{orientation}
	{decorative}
	aria-hidden={decorative || undefined}
	data-horizontal={orientation === "horizontal" ? "" : undefined}
	data-vertical={orientation === "vertical" ? "" : undefined}
	class={cn(
		"shrink-0 bg-[color:var(--valar-separator,var(--valar-separator-base,lch(0%_0_0_/_8.8%)))] dark:[--valar-separator-base:lch(100%_0_0_/_8.3%)] data-horizontal:h-[0.5px] data-horizontal:w-full data-vertical:w-[0.5px] data-vertical:self-stretch",
		"cn-separator-geometry",
		className
	)}
	style={style && typeof style === "object" ? styleToString(style) : style}
	{...restProps}
>
	{#snippet render({ props })}
		{#if child}
			{@render child({ props: { ...props, "data-slot": dataSlot, [refKey]: attachRef } })}
		{:else}
			<div {...props} data-slot={dataSlot} {@attach attachRef}>{@render children?.()}</div>
		{/if}
	{/snippet}
</SdkSeparator>
