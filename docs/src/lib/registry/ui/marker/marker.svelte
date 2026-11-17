<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	export const markerVariants = tv({
		base: "cn-marker group/marker relative flex w-full items-center",
		variants: {
			variant: {
				default: "cn-marker-variant-default",
				separator: "cn-marker-variant-separator",
				border: "cn-marker-variant-border"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	});

	export type MarkerVariant = VariantProps<typeof markerVariants>["variant"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		appearance,
		child,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: MarkerVariant;
		appearance?: "thinking";
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const mergedProps = $derived({
		class: cn(
			markerVariants({ variant }),
			appearance === "thinking" &&
				"min-h-[15.5px] text-[13px]/[15.5px] font-medium text-[rgb(94_94_95)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300 dark:text-[rgb(92_92_95)] motion-reduce:dark:text-muted-foreground",
			className
		),
		"data-slot": "marker",
		"data-variant": variant,
		"data-appearance": appearance,
		role: appearance === "thinking" ? ("status" as const) : undefined,
		...restProps
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render mergedProps.children?.()}
	</div>
{/if}
