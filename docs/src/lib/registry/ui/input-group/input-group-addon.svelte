<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";
	export const inputGroupAddonVariants = tv({
		base: "cn-input-group-addon flex cursor-text items-center justify-center select-none",
		variants: {
			align: {
				// Concentric corners: a button's radius is its container's radius minus the gap
				// between them. Inline buttons keep their own shape (icon-only = circle). The
				// multi-line prompt box has a larger radius (see input-group.svelte) and 8px gaps,
				// so its buttons are circles and capsules.
				"inline-start": "cn-input-group-addon-align-inline-start order-first",
				"inline-end": "cn-input-group-addon-align-inline-end order-last",
				"block-start":
					"cn-input-group-addon-align-block-start order-first w-full justify-start px-2 pt-2 [&>button]:rounded-full",
				"block-end":
					"cn-input-group-addon-align-block-end order-last w-full justify-start px-2 pb-2 [&>button]:rounded-full",
			},
		},
		defaultVariants: {
			align: "inline-start",
		},
	});

	export type InputGroupAddonAlign = VariantProps<typeof inputGroupAddonVariants>["align"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		align = "inline-start",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		align?: InputGroupAddonAlign;
	} = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="input-group-addon"
	data-align={align}
	class={cn(inputGroupAddonVariants({ align }), className)}
	onclick={(e) => {
		if ((e.target as HTMLElement).closest("button")) {
			return;
		}
		e.currentTarget.parentElement?.querySelector("input")?.focus();
	}}
	{...restProps}
>
	{@render children?.()}
</div>
