<script setup lang="ts">
import {
	Popover as SdkPopover,
	type PopoverController,
	type PopoverDismissReason,
	type PopoverOpenChangeReason,
} from "@ui-sdk/vue/popover";
import type { ChangeDetails, DismissAttemptDetails } from "@ui-sdk/core";
import { provide, ref } from "vue";
import { POPOVER_CONTEXT_KEY, type PopoverDismissPolicy } from "./context";

export interface PopoverProps {
	open?: boolean;
	defaultOpen?: boolean;
	modal?: boolean | "trap-focus";
	openOnHover?: boolean;
	delay?: number;
	closeDelay?: number;
	presentation?: "auto" | "popover" | "sheet";
	controller?: PopoverController<unknown>;
	dismissible?: boolean;
	container?: Element | DocumentFragment | null;
}

const props = withDefaults(defineProps<PopoverProps>(), {
	open: undefined,
	defaultOpen: undefined,
	modal: undefined,
	openOnHover: undefined,
	dismissible: undefined,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	openChange: [open: boolean, details: ChangeDetails<PopoverOpenChangeReason>];
	openChangeComplete: [open: boolean];
	dismissAttempt: [details: DismissAttemptDetails<PopoverDismissReason>];
}>();

const anchor = ref<HTMLElement | null>(null);
const policy = ref<PopoverDismissPolicy>({});

provide(POPOVER_CONTEXT_KEY, { anchor, policy });

function handleOpenChange(next: boolean, details: ChangeDetails<PopoverOpenChangeReason>) {
	if (!next) {
		if (details.reason === "outside-press" && policy.value.onInteractOutside) {
			const event = new CustomEvent("interactOutside", {
				cancelable: true,
				detail: { originalEvent: details.event },
			});
			policy.value.onInteractOutside(event);
			if (event.defaultPrevented) {
				details.cancel();
				return;
			}
		}
		if (details.reason === "escape-key" && policy.value.onEscapeKeyDown) {
			const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
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
	<SdkPopover
		:open="props.open"
		:default-open="props.defaultOpen"
		:modal="props.modal"
		:open-on-hover="props.openOnHover"
		:delay="props.delay"
		:close-delay="props.closeDelay"
		:presentation="props.presentation"
		:controller="props.controller"
		:dismissible="props.dismissible"
		:container="props.container"
		@open-change="handleOpenChange"
		@open-change-complete="(next) => emit('openChangeComplete', next)"
		@dismiss-attempt="(details) => emit('dismissAttempt', details)"
	>
		<slot />
	</SdkPopover>
</template>
