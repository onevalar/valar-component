<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import {
		buttonVariants,
		type ButtonVariant,
		type ButtonSize,
	} from "$lib/registry/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		size = "default",
		loading = false,
		onclick,
		...restProps
	}: AlertDialogPrimitive.ActionProps & {
		variant?: ButtonVariant;
		size?: ButtonSize;
		/** Blocks repeat activation and retains keyboard focus while an action is pending. */
		loading?: boolean;
	} = $props();
</script>

<AlertDialogPrimitive.Action
	bind:ref
	data-slot="alert-dialog-action"
	data-variant={variant}
	class={cn(buttonVariants({ variant, size, shape: "pill" }), "cn-alert-dialog-action", className)}
	{...restProps}
	aria-busy={loading ? true : restProps["aria-busy"]}
	aria-disabled={loading ? true : restProps["aria-disabled"]}
	data-loading={loading ? "" : undefined}
	onclick={(event) => {
		if (loading || restProps["aria-disabled"] === true || restProps["aria-disabled"] === "true") {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		onclick?.(event);
	}}
/>
