<script setup lang="ts">
import {
	Dialog as SdkDialog,
	type DialogController,
	type DialogDismissAttemptDetails,
	type DialogOpenChangeDetails,
	type DialogPayloadChangeReason,
} from "@ui-sdk/vue/dialog";
import type { ChangeDetails } from "@ui-sdk/core";
import { computed, provide, ref } from "vue";
import { DIALOG_CONTEXT_KEY, type DialogDismissPolicy } from "./context";

export interface DialogProps {
	open?: boolean;
	defaultOpen?: boolean;
	modal?: boolean | "trap-focus";
	closeOnOutsidePress?: boolean;
	presentation?: "auto" | "dialog" | "sheet";
	controller?: DialogController<unknown, unknown>;
	dismissible?: boolean;
	persistentElements?: (Element | string)[] | (() => Element[]);
	pendingAnnouncement?: string;
	container?: Element | DocumentFragment | null;
}

const props = withDefaults(defineProps<DialogProps>(), {
	open: undefined,
	defaultOpen: undefined,
	modal: true,
	closeOnOutsidePress: undefined,
	presentation: "dialog",
	dismissible: undefined,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	openChange: [open: boolean, details: DialogOpenChangeDetails];
	openChangeComplete: [open: boolean];
	payloadChange: [payload: unknown, details: ChangeDetails<DialogPayloadChangeReason>];
	dismissAttempt: [details: DialogDismissAttemptDetails];
}>();

const policy = ref<DialogDismissPolicy>({});
const modalRef = computed(() => props.modal ?? true);

provide(DIALOG_CONTEXT_KEY, { policy, modal: modalRef });

function handleOpenChange(next: boolean, details: DialogOpenChangeDetails) {
	if (!next) {
		if (
			details.reason === "outside-press" &&
			(policy.value.onInteractOutside || policy.value.onPointerDownOutside)
		) {
			const event = new CustomEvent("interactOutside", {
				cancelable: true,
				detail: { originalEvent: details.event },
			});
			if (details.event?.target) {
				Object.defineProperty(event, "target", { value: details.event.target });
			}
			policy.value.onPointerDownOutside?.(event);
			if (!event.defaultPrevented) policy.value.onInteractOutside?.(event);
			if (event.defaultPrevented) {
				details.cancel();
				return;
			}
		}
		if (details.reason === "escape-key" && policy.value.onEscapeKeyDown) {
			const original = details.event;
			const event = new KeyboardEvent("keydown", {
				key: "Escape",
				cancelable: true,
				isComposing: original instanceof KeyboardEvent ? original.isComposing : false,
			});
			if (original?.target) {
				Object.defineProperty(event, "target", { value: original.target });
			}
			policy.value.onEscapeKeyDown(event);
			if (event.defaultPrevented) {
				details.cancel();
				return;
			}
		}
	}
	emit("openChange", next, details);
	if (!next && !details.canceled && details.reason === "escape-key") {
		details.event?.stopPropagation();
	}
	if (!details.canceled) {
		emit("update:open", next);
	}
}
</script>

<template>
	<SdkDialog
		:open="props.open"
		:default-open="props.defaultOpen"
		:modal="props.modal"
		:close-on-outside-press="props.closeOnOutsidePress"
		:presentation="props.presentation"
		:controller="props.controller"
		:dismissible="props.dismissible"
		:persistent-elements="props.persistentElements"
		:pending-announcement="props.pendingAnnouncement"
		:container="props.container"
		@open-change="handleOpenChange"
		@open-change-complete="(next) => emit('openChangeComplete', next)"
		@payload-change="(payload, details) => emit('payloadChange', payload, details)"
		@dismiss-attempt="(details) => emit('dismissAttempt', details)"
	>
		<slot />
	</SdkDialog>
</template>
