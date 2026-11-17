<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	export const codeBlockVariants = tv({
		base: "cn-code-block group/code-block relative flex w-full min-w-0 flex-col overflow-hidden",
		variants: {
			variant: {
				default: "cn-code-block-variant-default",
				destructive: "cn-code-block-variant-destructive",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type CodeBlockVariant = VariantProps<typeof codeBlockVariants>["variant"];
	export type CodeBlockSize = "default" | "sm";
	export type CodeBlockAppearance = "issue" | "agent";
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		size = "default",
		appearance,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: CodeBlockVariant;
		size?: CodeBlockSize;
		appearance?: CodeBlockAppearance;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="code-block"
	data-variant={variant}
	data-size={size}
	data-appearance={appearance}
	class={cn(codeBlockVariants({ variant }), appearance && "cn-code-block-linear", className)}
	{...restProps}
>
	{@render children?.()}
</div>
