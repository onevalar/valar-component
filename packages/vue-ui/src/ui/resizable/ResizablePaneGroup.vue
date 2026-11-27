<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { SplitterGroup, useForwardExpose, useForwardPropsEmits } from "reka-ui";
import type { SplitterGroupEmits, SplitterGroupProps } from "reka-ui";
import { provide, type HTMLAttributes } from "vue";
import { paneCommands } from "./context";

const props = defineProps<SplitterGroupProps & { class?: HTMLAttributes["class"] }>();
const emit = defineEmits<SplitterGroupEmits>();
const forwarded = useForwardPropsEmits(reactiveOmit(props, "class"), emit);
const { forwardRef } = useForwardExpose();
provide(paneCommands, new Map());
</script>

<template>
	<SplitterGroup :ref="forwardRef" v-slot="state" v-bind="forwarded" data-slot="resizable-pane-group"
		:data-direction="direction" :class="cn('flex size-full min-h-0 min-w-0', props.class)">
		<slot v-bind="state" />
	</SplitterGroup>
</template>
