<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "cn-badge group/badge inline-flex w-fit max-w-full min-w-0 shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:ring-inset aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:shrink-0",
		variants: {
			variant: {
				default: "cn-badge-variant-default",
				secondary: "cn-badge-variant-secondary",
				destructive: "cn-badge-variant-destructive",
				outline: "cn-badge-variant-outline",
				ghost: "cn-badge-variant-ghost",
				link: "cn-badge-variant-link",
				label: "cn-badge-variant-label",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "default",
		labelColor,
		truncate = false,
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
		labelColor?: string;
		/** Keeps a long label on one line while retaining its complete accessible text. */
		truncate?: boolean;
	} = $props();
</script>

<svelte:element
	this={href ? "a" : "span"}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{#if variant === "label" && labelColor}
		<span
			aria-hidden="true"
			data-slot="badge-label-marker"
			class="grid size-3.5 shrink-0 place-items-center before:size-[9px] before:rounded-full before:bg-current"
			style:color={labelColor}
		></span>
	{/if}
	{#if truncate}
		<span
			class="min-w-0 truncate [&>svg]:inline-block [&>svg]:size-3 [&>svg]:align-[-0.125em] [&>svg[data-icon=inline-end]]:ms-1 [&>svg[data-icon=inline-start]]:me-1"
			>{@render children?.()}</span
		>
	{:else}
		{@render children?.()}
	{/if}
</svelte:element>
