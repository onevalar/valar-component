<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { DialogContent, DialogPortal, useForwardExpose, useForwardProps } from "reka-ui";
import { AlertDialogOverlay } from "./parts.js";
import type { DialogContentEmits, DialogContentProps, DialogPortalProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<
		DialogContentProps & {
			class?: HTMLAttributes["class"];
			size?: "default" | "sm";
			appearance?: "default" | "confirmation" | "danger";
			focusCancel?: boolean;
			portalProps?: DialogPortalProps;
		}
	>(),
	{ size: "default", appearance: "default", disableOutsidePointerEvents: undefined }
);
const emit = defineEmits<DialogContentEmits>();
const forwarded = useForwardProps(
	reactiveOmit(props, "class", "size", "appearance", "focusCancel", "portalProps")
);
const { forwardRef } = useForwardExpose();

function focusOnOpen(event: Event) {
	emit("openAutoFocus", event);
	if (!props.focusCancel || event.defaultPrevented) return;
	// The event target is the live focus scope, even before the forwarded ref
	// has updated after a portalled dialog is reopened.
	const content = event.currentTarget;
	if (!(content instanceof Element)) return;
	const cancel = content.querySelector<HTMLElement>(
		'[data-slot="alert-dialog-cancel"]:not(:disabled,[aria-disabled="true"])'
	);
	cancel?.focus({ preventScroll: true });
	if (cancel && cancel.ownerDocument.activeElement === cancel) event.preventDefault();
}
</script>

<template>
	<DialogPortal v-bind="portalProps">
		<AlertDialogOverlay @mousedown.prevent />
		<DialogContent
			:ref="forwardRef"
			v-bind="{ ...$attrs, ...forwarded }"
			role="alertdialog"
			aria-modal="true"
			data-slot="alert-dialog-content"
			:data-size="size"
			:data-appearance="appearance"
			:class="
				cn(
					'cn-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 outline-none',
					appearance === 'danger' && 'cn-alert-dialog-danger',
					props.class
				)
			"
			@open-auto-focus="focusOnOpen"
			@close-auto-focus="emit('closeAutoFocus', $event)"
			@escape-key-down="emit('escapeKeyDown', $event)"
			@pointer-down-outside.prevent="emit('pointerDownOutside', $event)"
			@focus-outside.prevent="emit('focusOutside', $event)"
			@interact-outside.prevent="emit('interactOutside', $event)"
		>
			<slot />
		</DialogContent>
	</DialogPortal>
</template>
