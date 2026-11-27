<script setup lang="ts">
import { Accordion as SdkRoot } from "@ui-sdk/vue/accordion";
import { cn } from "cn";
import { useDirection } from "reka-ui";
import type { AccordionRootEmits, AccordionRootProps } from "reka-ui";
import { computed, getCurrentInstance, provide, toRef, type HTMLAttributes } from "vue";
import DisclosureElement from "../collapsible/DisclosureElement";

const props = withDefaults(defineProps<AccordionRootProps & {
	class?: HTMLAttributes["class"];
	loop?: boolean;
}>(), { collapsible: true, orientation: "vertical", loop: true, unmountOnHide: true });
const emit = defineEmits<AccordionRootEmits>();
const direction = useDirection(toRef(props, "dir"));
provide("valar-accordion-orientation", toRef(props, "orientation"));
provide("valar-accordion-unmount", toRef(props, "unmountOnHide"));
const instance = getCurrentInstance();
const multiple = computed(() => props.type ? props.type === "multiple" : Array.isArray(props.modelValue ?? props.defaultValue));
const values = (value: string | string[] | undefined) => Array.isArray(value) ? value : value ? [value] : [];
const model = computed(() => {
	const attributes = instance?.vnode.props ?? {};
	return props.modelValue !== undefined || "modelValue" in attributes || "model-value" in attributes
		? values(props.modelValue) : undefined;
});
const legacyValue = (value: string[]) => multiple.value ? value : value[0];

function navigate(event: KeyboardEvent) {
	if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
	const root = event.currentTarget;
	const trigger = event.target;
	if (!(root instanceof HTMLElement) || !(trigger instanceof HTMLElement) ||
		!trigger.matches('[data-slot="accordion-trigger"]') || trigger.closest('[data-slot="accordion"]') !== root) return;

	const previous = props.orientation === "vertical" ? "ArrowUp" : direction.value === "rtl" ? "ArrowRight" : "ArrowLeft";
	const next = props.orientation === "vertical" ? "ArrowDown" : direction.value === "rtl" ? "ArrowLeft" : "ArrowRight";
	if (![previous, next, "Home", "End"].includes(event.key)) return;

	// The SDK omits arrow navigation; Valar keeps it scoped to this accordion.
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
	<SdkRoot :value="model" :default-value="values(defaultValue)" :multiple="multiple" :collapsible="collapsible"
		:disabled="disabled" @update:value="emit('update:modelValue', legacyValue($event))" data-slot="accordion"
		:dir="direction" :data-orientation="orientation" :class="cn('flex w-full min-w-0 flex-col', props.class)"
		@keydown="navigate">
		<template #render="{ props: part, state }">
			<DisclosureElement :as="as ?? 'div'" :as-child="asChild" :part="part">
				<slot :model-value="legacyValue(state.value)" />
			</DisclosureElement>
		</template>
	</SdkRoot>
</template>
