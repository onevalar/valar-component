<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const toggleVariants = tv({
		base: "cn-toggle group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default: "cn-toggle-variant-default",
				outline: "cn-toggle-variant-outline",
			},
			size: {
				default: "cn-toggle-size-default",
				sm: "cn-toggle-size-sm",
				lg: "cn-toggle-size-lg",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ToggleVariant = VariantProps<typeof toggleVariants>["variant"];
	export type ToggleSize = VariantProps<typeof toggleVariants>["size"];
	export type ToggleVariants = VariantProps<typeof toggleVariants>;
</script>

<script lang="ts">
	import { Toggle as SdkToggle } from "@ui-sdk/svelte/toggle";
	import { createAttachmentKey } from "svelte/attachments";
	import { styleToString } from "svelte-toolbelt";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		pressed = $bindable(false),
		class: className,
		size = "default",
		variant = "default",
		children,
		child,
		style,
		value,
		disabled,
		onPressedChange,
		...restProps
	}: Omit<HTMLButtonAttributes, "style" | "children"> & {
		ref?: HTMLElement | null;
		pressed?: boolean;
		onPressedChange?: (pressed: boolean) => void;
		children?: Snippet<[{ pressed: boolean }]>;
		child?: Snippet<[{ props: Record<string, unknown>; pressed: boolean }]>;
		style?: HTMLButtonAttributes["style"] | Parameters<typeof styleToString>[0];
		variant?: ToggleVariant;
		size?: ToggleSize;
	} = $props();
	const refKey = createAttachmentKey();
	const attachRef = (element: HTMLElement) => {
		ref = element;
		return () => { if (ref === element) ref = null; };
	};
</script>

<SdkToggle
	bind:pressed
	disabled={Boolean(disabled)}
	data-size={size}
	data-variant={variant}
	class={cn(toggleVariants({ variant, size }), className)}
	style={style && typeof style === "object" ? styleToString(style) : style}
	{onPressedChange}
	{...restProps}
>
	{#snippet render({ props, state })}
		{@const attrs = { ...props, value, "data-state": state.pressed ? "on" : "off" }}
		{#if child}
			{@render child({ props: { ...attrs, [refKey]: attachRef }, pressed: state.pressed })}
		{:else}
			<button {...attrs} {@attach attachRef}>{@render children?.({ pressed: state.pressed })}</button>
		{/if}
	{/snippet}
</SdkToggle>
