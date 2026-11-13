<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	export const fieldVariants = tv({
		base: "cn-field group/field flex w-full",
		variants: {
			appearance: {
				default: "",
				settings: "cn-field-appearance-settings",
			},
			orientation: {
				vertical: "cn-field-orientation-vertical flex-col *:w-full [&>.sr-only]:w-auto",
				horizontal:
					"cn-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
				responsive:
					"cn-field-orientation-responsive flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
			},
		},
		compoundVariants: [
			{
				appearance: "settings",
				orientation: "horizontal",
				class: "has-[>[data-slot=field-content]]:items-center",
			},
			{
				appearance: "settings",
				orientation: "responsive",
				class: "@md/field-group:has-[>[data-slot=field-content]]:items-center",
			},
		],
		defaultVariants: {
			appearance: "default",
			orientation: "vertical",
		},
	});

	export type FieldAppearance = VariantProps<typeof fieldVariants>["appearance"];
	export type FieldOrientation = VariantProps<typeof fieldVariants>["orientation"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		appearance = "default",
		orientation = "vertical",
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		appearance?: FieldAppearance;
		orientation?: FieldOrientation;
	} = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="field"
	data-orientation={orientation}
	data-appearance={appearance}
	class={cn(fieldVariants({ appearance, orientation }), className)}
	{...restProps}
>
	{@render children?.()}
</div>
