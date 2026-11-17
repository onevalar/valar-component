<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	export const buttonGroupVariants = tv({
		base: "cn-button-group group/button-group flex w-fit max-w-full min-w-0 items-stretch *:focus-visible:relative *:focus-visible:z-10 [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:min-w-0 [&>input]:flex-1",
		variants: {
			variant: {
				default: "",
				pill: "",
			},
			orientation: {
				horizontal:
					"cn-button-group-orientation-horizontal [&>*:not(:first-child)]:rounded-s-none [&>*:not(:first-child)]:border-s-0 [&>*:not(:last-child)]:rounded-e-none",
				vertical:
					"cn-button-group-orientation-vertical flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
			},
		},
		compoundVariants: [
			{ variant: "pill", orientation: "horizontal", class: "cn-button-group-variant-pill" },
		],
		defaultVariants: {
			variant: "default",
			orientation: "horizontal",
		},
	});

	export type ButtonGroupVariant = VariantProps<typeof buttonGroupVariants>["variant"];
	export type ButtonGroupOrientation = VariantProps<typeof buttonGroupVariants>["orientation"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		orientation = "horizontal",
		variant = "default",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		orientation?: ButtonGroupOrientation;
		variant?: ButtonGroupVariant;
	} = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="button-group"
	data-orientation={orientation}
	data-variant={variant}
	class={cn(buttonGroupVariants({ orientation, variant }), className)}
	{...restProps}
>
	{@render children?.()}
</div>
