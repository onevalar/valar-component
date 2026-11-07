<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	const inputGroupButtonVariants = tv({
		base: "cn-input-group-button flex items-center shadow-none",
		variants: {
			size: {
				xs: "cn-input-group-button-size-xs",
				sm: "cn-input-group-button-size-sm",
				"icon-xs": "cn-input-group-button-size-icon-xs",
				"icon-sm": "cn-input-group-button-size-icon-sm",
			},
			shape: {
				auto: "",
				pill: "rounded-full",
				square: "",
			},
		},
		compoundVariants: [
			// Icon-only buttons are circles, like Button.
			{
				size: ["icon-xs", "icon-sm"],
				shape: "auto",
				class: "rounded-full",
			},
		],
		defaultVariants: {
			size: "xs",
			shape: "auto",
		},
	});

	export type InputGroupButtonSize = VariantProps<typeof inputGroupButtonVariants>["size"];
	export type InputGroupButtonShape = VariantProps<typeof inputGroupButtonVariants>["shape"];
</script>

<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		children,
		type = "button",
		variant = "ghost",
		size = "xs",
		shape = "auto",
		...restProps
	}: Omit<ComponentProps<typeof Button>, "href" | "size" | "shape"> & {
		size?: InputGroupButtonSize;
		shape?: InputGroupButtonShape;
	} = $props();
</script>

<Button
	bind:ref
	{type}
	data-size={size}
	{variant}
	class={cn(
		inputGroupButtonVariants({ size, shape }),
		// The addon around the button is muted text, which outline and ghost buttons would
		// inherit. Buttons must read as clickable, so they take the normal text colour.
		(variant === "outline" || variant === "ghost") && "text-foreground",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</Button>
