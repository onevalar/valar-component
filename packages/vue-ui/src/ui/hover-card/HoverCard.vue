<script setup lang="ts">
import {
	HoverCard as SdkHoverCard,
	createHoverCardController,
	type HoverCardController,
	type HoverCardOpenChangeReason,
} from "@ui-sdk/vue/hover-card";
import type { ChangeDetails } from "@ui-sdk/core";
import { computed, provide } from "vue";
import { HOVER_CARD_FOCUS_KEY } from "./context";

export interface HoverCardProps {
	open?: boolean;
	defaultOpen?: boolean;
	openDelay?: number;
	delay?: number;
	closeDelay?: number;
	disabled?: boolean;
	controller?: HoverCardController<unknown>;
	container?: Element | DocumentFragment | null;
}

const props = withDefaults(defineProps<HoverCardProps>(), {
	open: undefined,
	defaultOpen: undefined,
	disabled: undefined,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	openChange: [open: boolean, details: ChangeDetails<HoverCardOpenChangeReason>];
	openChangeComplete: [open: boolean];
}>();

const resolvedDelay = computed(() => props.delay ?? props.openDelay);
const internalController = createHoverCardController();
const resolvedController = computed(() => props.controller ?? internalController);
const resolvedDisabled = computed(() => Boolean(props.disabled));
const pointerDown = { current: false };
const lastDismissedAt = { current: -Infinity };

provide(HOVER_CARD_FOCUS_KEY, {
	controller: resolvedController,
	disabled: resolvedDisabled,
	pointerDown,
	lastDismissedAt,
});

function handleOpenChange(next: boolean, details: ChangeDetails<HoverCardOpenChangeReason>) {
	emit("openChange", next, details);
	if (!next && !details.canceled && details.reason === "escape-key") {
		lastDismissedAt.current = performance.now();
		details.event?.stopPropagation();
	}
	if (!details.canceled) {
		emit("update:open", next);
	}
}
</script>

<template>
	<SdkHoverCard
		:open="props.open"
		:default-open="props.defaultOpen"
		:delay="resolvedDelay"
		:close-delay="props.closeDelay"
		:disabled="props.disabled"
		:controller="resolvedController"
		:container="props.container"
		@open-change="handleOpenChange"
		@open-change-complete="(next) => emit('openChangeComplete', next)"
	>
		<slot />
	</SdkHoverCard>
</template>
