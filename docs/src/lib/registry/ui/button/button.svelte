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
	import { Button as SdkButton } from "@ui-sdk/svelte/button";
	import { createAttachmentKey } from "svelte/attachments";

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

	const isDisabled = $derived(
		(disabled as unknown) === "" || Boolean(disabled)
	);
	const resolvedSlot = $derived(
		((restProps as Record<string, unknown>)["data-slot"] as string | undefined) ?? "button"
	);

	function blockActivation(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
	}

	const refProps = {
		[createAttachmentKey()]: (element: HTMLButtonElement) => {
			ref = element;
			return () => {
				if (ref === element) ref = null;
			};
		},
	};
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot={resolvedSlot}
		data-variant={variant}
		data-size={size}
		data-shape={shape}
		class={cn(buttonVariants({ variant, size, shape }), className)}
		{...restProps}
		href={isDisabled || loading ? undefined : href}
		aria-disabled={isDisabled || loading ? true : restProps["aria-disabled"]}
		aria-busy={loading ? true : restProps["aria-busy"]}
		data-loading={loading ? "" : undefined}
		role={isDisabled || loading ? "link" : restProps.role}
		tabindex={isDisabled ? -1 : loading ? (tabindex ?? 0) : tabindex}
		onclick={isDisabled || loading ? blockActivation : restProps.onclick}
	>
		{@render children?.()}
	</a>
{:else}
	<SdkButton
		{...refProps}
		data-variant={variant}
		data-size={size}
		data-shape={shape}
		class={cn(buttonVariants({ variant, size, shape }), className)}
		type={type ?? undefined}
		disabled={isDisabled || undefined}
		tabindex={isDisabled ? -1 : tabindex}
		{...restProps}
		data-slot={resolvedSlot}
		aria-disabled={loading ? true : restProps["aria-disabled"]}
		aria-busy={loading ? true : restProps["aria-busy"]}
		data-loading={loading ? "" : undefined}
		onclick={(event) => {
			if (loading) blockActivation(event);
			else if (event.currentTarget instanceof HTMLButtonElement) {
				return restProps.onclick?.(event as MouseEvent & { currentTarget: HTMLButtonElement });
			}
		}}
	>
		{#snippet render({ props })}
			<button {...props} data-slot={resolvedSlot}>
				{@render children?.()}
			</button>
		{/snippet}
	</SdkButton>
{/if}
