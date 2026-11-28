<script setup lang="ts">
import { Menu as SdkMenu, type MenuOpenChangeReason } from "@ui-sdk/vue/menu";
import type { ChangeDetails } from "@ui-sdk/core";
import { provide, ref } from "vue";
import { menuPolicyKey, type MenuDismissPolicy } from "../dropdown-menu/parts.js";

const props = withDefaults(
	defineProps<{
		open?: boolean;
		defaultOpen?: boolean;
		modal?: boolean | "pointer";
		loop?: boolean;
		delay?: number;
		dir?: "ltr" | "rtl";
		pressOpenDelay?: number;
		container?: Element | DocumentFragment | null;
	}>(),
	{
		open: undefined,
		defaultOpen: undefined,
		modal: undefined,
		loop: undefined,
	}
);

const emit = defineEmits<{
	"update:open": [open: boolean];
	openChange: [open: boolean, details: ChangeDetails<MenuOpenChangeReason>];
	openChangeComplete: [open: boolean];
}>();

const policy = ref<MenuDismissPolicy>({});
provide(menuPolicyKey, policy);

function handleOpenChange(next: boolean, details: ChangeDetails<MenuOpenChangeReason>) {
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
	if (!details.canceled) {
		if (!next && details.reason === "escape-key") {
			details.event?.stopPropagation();
		}
		emit("update:open", next);
	}
}
</script>

<template>
	<SdkMenu
		:open="props.open"
		:default-open="props.defaultOpen"
		:modal="props.modal"
		:loop="props.loop"
		:delay="props.delay"
		presentation="popover"
		:container="props.container"
		@open-change="handleOpenChange"
		@open-change-complete="(next) => emit('openChangeComplete', next)"
	>
		<slot />
	</SdkMenu>
</template>
