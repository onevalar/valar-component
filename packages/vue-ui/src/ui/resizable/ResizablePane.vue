<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { SplitterPanel, useForwardPropsEmits } from "reka-ui";
import type { SplitterPanelEmits, SplitterPanelProps } from "reka-ui";
import { inject, useTemplateRef, watchPostEffect, type HTMLAttributes } from "vue";
import { paneCommands } from "./context";

const props = withDefaults(defineProps<SplitterPanelProps & { class?: HTMLAttributes["class"] }>(), { minSize: 0 });
const emit = defineEmits<SplitterPanelEmits>();
const forwarded = useForwardPropsEmits(reactiveOmit(props, "class"), emit);
const panel = useTemplateRef<InstanceType<typeof SplitterPanel>>("panel");
const commands = {
	collapse: () => panel.value?.collapse(),
	expand: () => panel.value?.expand(),
	isCollapsed: () => panel.value?.isCollapsed ?? false,
};
defineExpose({
	...commands,
	isExpanded: () => panel.value?.isExpanded ?? false,
	getSize: () => panel.value?.getSize(),
	resize: (size: number) => panel.value?.resize(size),
});
const group = inject(paneCommands, null);
watchPostEffect((cleanup) => {
	const id = panel.value?.$el?.id;
	if (!group || !id || !props.collapsible) return;
	group.set(id, commands);
	cleanup(() => group.delete(id));
});
</script>

<template>
	<SplitterPanel ref="panel" v-slot="state" v-bind="forwarded" data-slot="resizable-pane"
		:class="cn('min-h-0 min-w-0', props.class)">
		<slot v-bind="state" />
	</SplitterPanel>
</template>
