<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	export const itemVariants = tv({
		base: "cn-item group/item flex w-full min-w-0 flex-wrap items-center transition-colors duration-150 outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none",
		variants: {
			variant: {
				default: "cn-item-variant-default",
				outline: "cn-item-variant-outline",
				muted: "cn-item-variant-muted",
			},
			size: {
				default: "cn-item-size-default",
				sm: "cn-item-size-sm",
				xs: "cn-item-size-xs",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ItemSize = VariantProps<typeof itemVariants>["size"];
	export type ItemVariant = VariantProps<typeof itemVariants>["variant"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		child,
		variant,
		size,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		appearance?: "default" | "issue-row";
		child?: Snippet<[{ props: Record<string, unknown> }]>;
		variant?: ItemVariant;
		size?: ItemSize;
	} = $props();

	const mergedProps = $derived({
		class: cn(
			appearance === "issue-row"
				? "cn-item-issue-row group/item flex w-full items-center"
				: itemVariants({ variant, size }),
			className
		),
		"data-slot": "item",
		"data-appearance": appearance,
		"data-variant": variant,
		"data-size": size,
		...restProps,
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render mergedProps.children?.()}
	</div>
{/if}
