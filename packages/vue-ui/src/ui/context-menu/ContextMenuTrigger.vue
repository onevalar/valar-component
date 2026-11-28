<script setup lang="ts">
import { MenuContextTrigger as SdkContextTrigger } from "@ui-sdk/vue/menu";
import { cn } from "cn";
import type { Component, HTMLAttributes } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		as?: string | Component;
		asChild?: boolean;
		disabled?: boolean;
		payload?: unknown;
		class?: HTMLAttributes["class"];
	}>(),
	{ as: "div", disabled: undefined }
);

const emit = defineEmits<{ keydown: [event: KeyboardEvent] }>();

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
			button: 0,
			clientX: bounds.left + Math.min(16, bounds.width / 2),
			clientY: bounds.bottom - Math.min(8, bounds.height / 2),
		})
	);
}
</script>

<template>
	<SdkContextTrigger
		v-bind="$attrs"
		:disabled="props.disabled"
		:payload="props.payload"
		:class="cn('select-none', props.class)"
		@keydown="openByKeyboard"
	>
		<template #render="{ props: part, state }">
			<DisclosureElement
				:as="props.as"
				:as-child="props.asChild"
				:part="{
					...part,
					'data-slot': 'context-menu-trigger',
					'data-state': state.open ? 'open' : 'closed',
				}"
			>
				<slot />
			</DisclosureElement>
		</template>
	</SdkContextTrigger>
</template>
