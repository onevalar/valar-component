<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const alertVariants = tv({
		base: "cn-alert group/alert relative w-full",
		variants: {
			variant: {
				default: "cn-alert-variant-default",
				destructive: "cn-alert-variant-destructive"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	});

	export type AlertVariant = VariantProps<typeof alertVariants>["variant"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		appearance,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: AlertVariant;
		appearance?: "connection" | "notification" | "workflow-error";
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert"
	data-appearance={appearance}
	data-variant={variant}
	role="alert"
	class={cn(
		appearance === "connection"
			? "cn-alert-connection group/alert"
			: appearance === "notification"
				? "cn-alert-notification group/alert"
				: appearance === "workflow-error"
					? "cn-alert-workflow-error group/alert"
					: alertVariants({ variant }),
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
