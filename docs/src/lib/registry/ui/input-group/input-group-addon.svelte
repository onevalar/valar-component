<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";
	export const inputGroupAddonVariants = tv({
		base: "cn-input-group-addon flex cursor-text items-center justify-center select-none",
		variants: {
			align: {
				"inline-start": "cn-input-group-addon-align-inline-start order-first",
				"inline-end": "cn-input-group-addon-align-inline-end order-last",
				"block-start": "cn-input-group-addon-align-block-start order-first w-full justify-start",
				"block-end": "cn-input-group-addon-align-block-end order-last w-full justify-start",
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
		const target = e.target;
		if (e.defaultPrevented || !(target instanceof Element)) return;
		const interactive = target.closest(
			"button, a[href], label, input, textarea, select, [tabindex], [contenteditable]"
		);
		if (interactive && e.currentTarget.contains(interactive)) return;
		const root = e.currentTarget.closest('[data-slot="input-group"]');
		const control =
			root?.querySelector<HTMLElement>('[data-slot="input-group-control"]') ??
			root?.querySelector<HTMLElement>('input:not([type="hidden"]), textarea');
		if (control && control.closest('[data-slot="input-group"]') === root) control.focus();
	}}
	{...restProps}
>
	{@render children?.()}
</div>
