<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { cn } from "cn";
import { computed, nextTick, useTemplateRef, watch } from "vue";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
	open?: boolean;
	label: string;
	trigger?: HTMLElement | null;
	class?: HTMLAttributes["class"];
}>();
const emit = defineEmits<{ "update:open": [open: boolean] }>();
const panel = useTemplateRef<HTMLElement>("panel");
const view = computed(() => panel.value?.ownerDocument.defaultView);

watch(
	() => props.open,
	async (open) => {
		const element = panel.value;
		if (open || !element?.contains(element.ownerDocument.activeElement)) return;
		await nextTick();
		if (!props.open) props.trigger?.focus({ preventScroll: true });
	}
);

// Wait until nested Reka layer listeners on document have handled Escape.
useEventListener(view, "keydown", (event: KeyboardEvent) => {
	const target = event.target;
	if (
		!props.open ||
		event.key !== "Escape" ||
		event.defaultPrevented ||
		event.isComposing ||
		!(target instanceof Element) ||
		!panel.value?.contains(target)
	)
		return;
	const layer = target.closest("[data-dismissable-layer]");
	if (layer && panel.value.contains(layer)) return;
	event.preventDefault();
	emit("update:open", false);
});
</script>

<template>
	<section
		ref="panel"
		:aria-label="label"
		data-slot="sheet-panel"
		:data-state="open ? 'open' : 'closed'"
		:hidden="!open"
		:class="cn('cn-sheet-panel cn-sheet-details data-[state=closed]:hidden', props.class)"
	>
		<div v-if="open" data-slot="sheet-panel-scroll" class="cn-sheet-panel-scroll pe-[11px]">
			<slot />
		</div>
	</section>
</template>
