<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import { cn, type WithoutChild, type WithoutChildrenOrChild } from "$lib/utils.js";
	import AlertDialogOverlay from "./alert-dialog-overlay.svelte";
	import AlertDialogPortal from "./alert-dialog-portal.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		size = "default",
		appearance = "default",
		focusCancel = false,
		portalProps,
		interactOutsideBehavior = "ignore",
		onOpenAutoFocus,
		...restProps
	}: WithoutChild<AlertDialogPrimitive.ContentProps> & {
		size?: "default" | "sm";
		appearance?: "default" | "confirmation" | "danger";
		/** Places initial focus on an enabled Cancel button when one is present. */
		focusCancel?: boolean;
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof AlertDialogPortal>>;
	} = $props();
</script>

<AlertDialogPortal {...portalProps}>
	<AlertDialogOverlay
		onmousedown={(event) => {
			if (interactOutsideBehavior === "ignore") event.preventDefault();
		}}
	/>
	<AlertDialogPrimitive.Content
		bind:ref
		data-slot="alert-dialog-content"
		data-size={size}
		data-appearance={appearance}
		{interactOutsideBehavior}
		class={cn(
			"cn-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 outline-none",
			appearance === "danger" && "cn-alert-dialog-danger",
			className
		)}
		{...restProps}
		onOpenAutoFocus={(event) => {
			onOpenAutoFocus?.(event);
			if (!focusCancel || event.defaultPrevented) return;
			const cancel = ref?.querySelector<HTMLButtonElement>(
				'button[data-slot="alert-dialog-cancel"]:not(:disabled,[aria-disabled="true"])'
			);
			if (!cancel) return;
			cancel.focus({ preventScroll: true });
			if (cancel === cancel.ownerDocument.activeElement) event.preventDefault();
		}}
	/>
</AlertDialogPortal>
