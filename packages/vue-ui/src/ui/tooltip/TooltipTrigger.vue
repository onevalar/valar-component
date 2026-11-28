<script setup lang="ts">
import { TooltipTrigger as SdkTrigger, type TooltipController } from "@ui-sdk/vue/tooltip";
import { inject, type Component, type HTMLAttributes } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";
import { TOOLTIP_FOCUS_KEY } from "./context";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
	as?: string | Component;
	asChild?: boolean;
	payload?: unknown;
	controller?: TooltipController<unknown>;
	class?: HTMLAttributes["class"];
}>();

const focusCtx = inject(TOOLTIP_FOCUS_KEY, null);

function handlePointerDown() {
	if (!focusCtx) return;
	focusCtx.pointerDown.current = true;
	queueMicrotask(() => {
		focusCtx.pointerDown.current = false;
	});
}

function handleFocus(event: FocusEvent) {
	if (
		!focusCtx ||
		focusCtx.disabled.value ||
		focusCtx.pointerDown.current ||
		performance.now() - focusCtx.lastDismissedAt.current < 200
	)
		return;
	const target = event.currentTarget as HTMLElement | null;
	if (!target || target.matches(":disabled")) return;
	queueMicrotask(() => {
		if (
			document.activeElement === target &&
			!focusCtx.controller.value.isOpen() &&
			performance.now() - focusCtx.lastDismissedAt.current >= 200
		) {
			void focusCtx.controller.value.open();
		}
	});
}
</script>

<template>
	<SdkTrigger
		v-bind="$attrs"
		:payload="props.payload"
		:controller="props.controller"
		:class="props.class"
		@pointerdown="handlePointerDown"
		@focus="handleFocus"
	>
		<template #render="{ props: part, state }">
			<DisclosureElement
				:as="props.as ?? 'button'"
				:as-child="props.asChild"
				:part="{
					...part,
					'data-slot': 'tooltip-trigger',
					'data-state': state.open ? 'open' : 'closed',
				}"
			>
				<slot />
			</DisclosureElement>
		</template>
	</SdkTrigger>
</template>
