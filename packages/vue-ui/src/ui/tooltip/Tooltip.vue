<script setup lang="ts">
import {
	Tooltip as SdkTooltip,
	createTooltipController,
	type TooltipController,
	type TooltipOpenChangeReason,
} from "@ui-sdk/vue/tooltip";
import type { ChangeDetails } from "@ui-sdk/core";
import { computed, inject, provide } from "vue";
import { TOOLTIP_DISABLED_KEY, TOOLTIP_FOCUS_KEY, TOOLTIP_PROVIDER_KEY } from "./context";

export interface TooltipProps {
	open?: boolean;
	defaultOpen?: boolean;
	delayDuration?: number;
	delay?: number;
	closeDelay?: number;
	disableHoverableContent?: boolean;
	disabled?: boolean;
	toggleable?: boolean;
	closeOnPress?: boolean;
	type?: "label" | "description";
	shortcut?: string;
	controller?: TooltipController<unknown>;
	container?: Element | DocumentFragment | null;
}

const props = withDefaults(defineProps<TooltipProps>(), {
	open: undefined,
	defaultOpen: undefined,
	disabled: undefined,
	disableHoverableContent: undefined,
	toggleable: undefined,
	closeOnPress: undefined,
});

const emit = defineEmits<{
	"update:open": [open: boolean];
	openChange: [open: boolean, details: ChangeDetails<TooltipOpenChangeReason>];
	openChangeComplete: [open: boolean];
}>();

const provider = inject(TOOLTIP_PROVIDER_KEY, null);
const resolvedDisabled = computed(() => props.disabled ?? provider?.disabled.value ?? false);
const resolvedDelay = computed(
	() => props.delay ?? props.delayDuration ?? provider?.delayDuration.value ?? 500
);

const internalController = createTooltipController();
const resolvedController = computed(() => props.controller ?? internalController);
const pointerDown = { current: false };
const lastDismissedAt = { current: -Infinity };

provide(TOOLTIP_DISABLED_KEY, resolvedDisabled);
provide(TOOLTIP_FOCUS_KEY, {
	controller: resolvedController,
	disabled: resolvedDisabled,
	pointerDown,
	lastDismissedAt,
});

function handleOpenChange(next: boolean, details: ChangeDetails<TooltipOpenChangeReason>) {
	if (resolvedDisabled.value && next) {
		details.cancel();
		return;
	}
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
	<SdkTooltip
		:open="resolvedDisabled ? false : props.open"
		:default-open="resolvedDisabled ? false : props.defaultOpen"
		:delay="resolvedDelay"
		:close-delay="props.closeDelay"
		:disabled="resolvedDisabled"
		:toggleable="props.toggleable"
		:close-on-press="props.closeOnPress"
		:type="props.type"
		:shortcut="props.shortcut"
		:controller="resolvedController"
		:container="props.container"
		@open-change="handleOpenChange"
		@open-change-complete="(next) => emit('openChangeComplete', next)"
	>
		<slot />
	</SdkTooltip>
</template>
