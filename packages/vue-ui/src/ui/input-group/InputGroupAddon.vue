<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
import { inputGroupAddonVariants, type InputGroupAddonAlign } from ".";

const props = withDefaults(defineProps<{ class?: HTMLAttributes["class"]; align?: InputGroupAddonAlign }>(), { align: "inline-start" });
const emit = defineEmits<{ click: [event: MouseEvent] }>();

function focusControl(event: MouseEvent) {
	emit("click", event);
	const addon = event.currentTarget;
	const target = event.target;
	if (event.defaultPrevented || !(addon instanceof HTMLElement) || !(target instanceof Element)) return;
	const interactive = target.closest("button, a[href], label, input, textarea, select, [tabindex], [contenteditable]");
	if (interactive && addon.contains(interactive)) return;
	const root = addon.closest('[data-slot="input-group"]');
	if (!root || target.closest('[data-slot="input-group"]') !== root) return;
	const belongsToRoot = (control: HTMLElement) => control.closest('[data-slot="input-group"]') === root;
	const control = [...root.querySelectorAll<HTMLElement>('[data-slot="input-group-control"]')].find(belongsToRoot)
		?? [...root.querySelectorAll<HTMLElement>('input:not([type="hidden"]), textarea')].find(belongsToRoot);
	control?.focus();
}
</script>

<template>
	<div role="group" data-slot="input-group-addon" :data-align="align" :class="cn(inputGroupAddonVariants({ align }), props.class)" @click="focusControl"><slot /></div>
</template>
