<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { CollapsibleRoot, useForwardExpose, useForwardPropsEmits } from "reka-ui";
import type { CollapsibleRootEmits, CollapsibleRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(defineProps<CollapsibleRootProps & {
	class?: HTMLAttributes["class"];
	appearance?: "default" | "properties";
}>(), { appearance: "default", open: undefined, unmountOnHide: false });
const emit = defineEmits<CollapsibleRootEmits>();
const forwarded = useForwardPropsEmits(reactiveOmit(props, "class", "appearance"), emit);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<CollapsibleRoot :ref="forwardRef" v-slot="state" v-bind="forwarded" data-slot="collapsible" :data-appearance="appearance"
		:class="cn(appearance === 'properties' && 'cn-collapsible-properties', props.class)">
		<slot v-bind="state" />
	</CollapsibleRoot>
</template>
