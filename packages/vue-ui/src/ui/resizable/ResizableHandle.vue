<script setup lang="ts">
import { cn } from "cn";
import { injectSplitterGroupContext, SplitterResizeHandle, useForwardExpose } from "reka-ui";
import type { SplitterResizeHandleEmits, SplitterResizeHandleProps } from "reka-ui";
import { computed, inject, ref, watch, type HTMLAttributes } from "vue";
import { paneCommands } from "./context";

const props = withDefaults(defineProps<Omit<SplitterResizeHandleProps, "asChild"> & {
	class?: HTMLAttributes["class"];
	withHandle?: boolean;
	appearance?: "default" | "workspace";
}>(), { tabindex: 0, appearance: "default" });
const emit = defineEmits<SplitterResizeHandleEmits>();
const { forwardRef } = useForwardExpose();
const { direction } = injectSplitterGroupContext();
const panes = inject(paneCommands, null);
const dragging = ref(false);
const hitArea = computed(() => props.hitAreaMargins ?? (props.appearance === "workspace" ? { fine: 3, coarse: 15 } : undefined));

function onDragging(value: boolean) {
	dragging.value = value;
	emit("dragging", value);
}

watch(() => props.disabled, (disabled) => {
	if (disabled && dragging.value) onDragging(false);
});

function handleEnter(event: KeyboardEvent) {
	if (event.key !== "Enter" || event.defaultPrevented) return;
	if (props.disabled) {
		event.preventDefault();
		return;
	}
	const target = event.currentTarget as HTMLElement;
	const pane = panes?.get(target.getAttribute("aria-controls") ?? "");
	if (!pane) return;
	// Reka's group Enter handler changes its rendered layout without committing it or emitting events.
	event.preventDefault();
	if (pane.isCollapsed()) pane.expand();
	else pane.collapse();
}
</script>

<template>
	<SplitterResizeHandle :ref="forwardRef" :id="id" :as="as" :disabled="disabled" :nonce="nonce" :hit-area-margins="hitArea"
		data-slot="resizable-handle" :data-direction="direction" :data-appearance="appearance"
		:data-enabled="!disabled" :data-active="dragging && !disabled ? 'pointer' : undefined"
		:aria-orientation="direction === 'horizontal' ? 'vertical' : 'horizontal'" :aria-disabled="disabled || undefined"
		:tabindex="disabled ? -1 : tabindex"
		:class="cn('relative flex w-px shrink-0 items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring focus-visible:outline-hidden data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:translate-x-0 data-[direction=vertical]:after:-translate-y-1/2 [&[data-direction=vertical]>div]:rotate-90', appearance === 'workspace' && 'cn-resizable-handle-workspace', props.class)"
		@keydown.capture="handleEnter" @dragging="onDragging">
		<div v-if="withHandle" aria-hidden="true" class="cn-resizable-handle-icon z-10 flex shrink-0" />
	</SplitterResizeHandle>
</template>
