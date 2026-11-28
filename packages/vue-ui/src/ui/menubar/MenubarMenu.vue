<script setup lang="ts">
import { Menu as SdkMenu, type MenuOpenChangeReason } from "@ui-sdk/vue/menu";
import type { ChangeDetails } from "@ui-sdk/core";
import { computed, inject, provide, ref, useId } from "vue";
import { menuPolicyKey, type MenuDismissPolicy } from "../dropdown-menu/parts.js";
import { MENUBAR_VALUE_KEY } from "./context";

const props = withDefaults(
	defineProps<{
		value?: string;
		open?: boolean;
		defaultOpen?: boolean;
		modal?: boolean | "pointer";
		loop?: boolean;
		delay?: number;
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
}>();

const generatedValue = useId();
const menuValue = computed(() => props.value ?? generatedValue);
const bar = inject(MENUBAR_VALUE_KEY, null);
const policy = ref<MenuDismissPolicy>({});
provide(menuPolicyKey, policy);

const controlledOpen = computed(() => {
	if (props.open !== undefined) return props.open;
	if (bar?.isControlled.value) return bar.value.value === menuValue.value;
	return undefined;
});

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
		bar?.onMenuOpenChange(menuValue.value, next);
		if (!next && details.reason === "escape-key") {
			details.event?.stopPropagation();
		}
		emit("update:open", next);
	}
}
</script>

<template>
	<SdkMenu
		:open="controlledOpen"
		:default-open="
			props.defaultOpen ??
			(bar && !bar.isControlled.value && bar.value.value === menuValue ? true : undefined)
		"
		:modal="props.modal"
		:loop="props.loop"
		:delay="props.delay"
		presentation="popover"
		:container="props.container"
		@open-change="handleOpenChange"
	>
		<slot />
	</SdkMenu>
</template>
