<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { AccordionRoot, useDirection, useForwardExpose, useForwardPropsEmits } from "reka-ui";
import type { AccordionRootEmits, AccordionRootProps } from "reka-ui";
import { toRef, type HTMLAttributes } from "vue";

const props = withDefaults(defineProps<AccordionRootProps & {
	class?: HTMLAttributes["class"];
	loop?: boolean;
}>(), { collapsible: true, orientation: "vertical", loop: true });
const emit = defineEmits<AccordionRootEmits>();
const forwarded = useForwardPropsEmits(reactiveOmit(props, "class", "loop"), emit);
const direction = useDirection(toRef(props, "dir"));
const { forwardRef } = useForwardExpose();

function navigate(event: KeyboardEvent) {
	if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
	const root = event.currentTarget;
	const trigger = event.target;
	if (!(root instanceof HTMLElement) || !(trigger instanceof HTMLElement) ||
		!trigger.matches('[data-slot="accordion-trigger"]') || trigger.closest('[data-slot="accordion"]') !== root) return;

	const previous = props.orientation === "vertical" ? "ArrowUp" : direction.value === "rtl" ? "ArrowRight" : "ArrowLeft";
	const next = props.orientation === "vertical" ? "ArrowDown" : direction.value === "rtl" ? "ArrowLeft" : "ArrowRight";
	if (![previous, next, "Home", "End"].includes(event.key)) return;

	// Reka's collection navigation always loops and includes disabled endpoints and nested collections.
	const enabled = [...root.querySelectorAll<HTMLElement>('[data-slot="accordion-trigger"]:not([disabled]):not([data-disabled])')]
		.filter((element) => element.closest('[data-slot="accordion"]') === root);
	const index = enabled.indexOf(trigger);
	if (index < 0) return;
	event.preventDefault();
	event.stopPropagation();
	let target = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : index + (event.key === next ? 1 : -1);
	if (props.loop) target = (target + enabled.length) % enabled.length;
	enabled[target]?.focus();
}
</script>

<template>
	<AccordionRoot :ref="forwardRef" v-slot="state" v-bind="forwarded" data-slot="accordion"
		:dir="direction" :data-orientation="orientation" :class="cn('flex w-full min-w-0 flex-col', props.class)"
		@keydown.capture="navigate">
		<slot v-bind="state" />
	</AccordionRoot>
</template>
