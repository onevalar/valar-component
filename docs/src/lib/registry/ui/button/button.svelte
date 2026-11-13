<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

	export const buttonVariants = tv({
		base: "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap outline-none select-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [a]:not-data-loading:aria-disabled:pointer-events-none",
		variants: {
			variant: {
				default: "cn-button-variant-default",
				outline: "cn-button-variant-outline",
				secondary: "cn-button-variant-secondary",
				ghost: "cn-button-variant-ghost",
				destructive: "cn-button-variant-destructive",
				link: "cn-button-variant-link",
			},
			size: {
				default: "cn-button-size-default",
				xs: "cn-button-size-xs",
				sm: "cn-button-size-sm",
				lg: "cn-button-size-lg",
				icon: "cn-button-size-icon",
				"icon-xs": "cn-button-size-icon-xs",
				"icon-sm": "cn-button-size-icon-sm",
				"icon-lg": "cn-button-size-icon-lg",
			},
			shape: {
				auto: "",
				pill: "not-in-data-[slot=button-group]:rounded-full",
				square: "",
			},
		},
		compoundVariants: [
			{
				shape: "auto",
				size: ["default", "xs", "sm", "lg"],
				class: "cn-button-shape-auto-text",
			},
		],
		defaultVariants: {
			variant: "default",
			size: "default",
			shape: "auto",
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];
	export type ButtonShape = VariantProps<typeof buttonVariants>["shape"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
			/** Prevents repeat activation while leaving focus on the pending action. */
			loading?: boolean;
			/** Auto uses a pill for text sizes and the theme radius for icon sizes. */
			shape?: ButtonShape;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		shape = "auto",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		loading = false,
		tabindex,
		children,
		...restProps
	}: ButtonProps = $props();

	function blockActivation(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
	}
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		data-variant={variant}
		data-size={size}
		data-shape={shape}
		class={cn(buttonVariants({ variant, size, shape }), className)}
		{...restProps}
		href={disabled || loading ? undefined : href}
		aria-disabled={disabled || loading ? true : restProps["aria-disabled"]}
		aria-busy={loading ? true : restProps["aria-busy"]}
		data-loading={loading ? "" : undefined}
		role={disabled || loading ? "link" : restProps.role}
		tabindex={disabled ? -1 : loading ? (tabindex ?? 0) : tabindex}
		onclick={disabled || loading ? blockActivation : restProps.onclick}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		data-variant={variant}
		data-size={size}
		data-shape={shape}
		class={cn(buttonVariants({ variant, size, shape }), className)}
		{type}
		{disabled}
		tabindex={disabled ? -1 : tabindex}
		{...restProps}
		aria-disabled={loading ? true : restProps["aria-disabled"]}
		aria-busy={loading ? true : restProps["aria-busy"]}
		data-loading={loading ? "" : undefined}
		onclick={loading ? blockActivation : restProps.onclick}
	>
		{@render children?.()}
	</button>
{/if}
