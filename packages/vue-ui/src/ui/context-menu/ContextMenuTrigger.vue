<script setup lang="ts">
import { ContextMenuTrigger, useForwardExpose } from "reka-ui";
import type { ContextMenuTriggerProps } from "reka-ui";

const props = withDefaults(defineProps<ContextMenuTriggerProps>(), { as: "div" });
const emit = defineEmits<{ keydown: [event: KeyboardEvent] }>();
const { forwardRef } = useForwardExpose();

function openByKeyboard(event: KeyboardEvent) {
	emit("keydown", event);
	if (
		props.disabled ||
		event.defaultPrevented ||
		event.isComposing ||
		event.target !== event.currentTarget
	)
		return;
	if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
	const target = event.currentTarget as HTMLElement;
	const bounds = target.getBoundingClientRect();
	event.preventDefault();
	target.dispatchEvent(
		new MouseEvent("contextmenu", {
			bubbles: true,
			cancelable: true,
			button: 2,
			clientX: bounds.left + Math.min(16, bounds.width / 2),
			clientY: bounds.bottom - Math.min(8, bounds.height / 2),
		})
	);
}
</script>

<template>
	<ContextMenuTrigger
		:ref="forwardRef"
		v-bind="props"
		data-slot="context-menu-trigger"
		class="select-none"
		@keydown="openByKeyboard"
	>
		<slot />
	</ContextMenuTrigger>
</template>
