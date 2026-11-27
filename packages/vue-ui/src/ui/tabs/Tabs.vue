<script setup lang="ts" generic="T extends string | number = string">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { TabsRoot, useForwardExpose, useForwardPropsEmits } from "reka-ui";
import type { TabsRootEmits, TabsRootProps } from "reka-ui";
import { provide, toRefs, type HTMLAttributes } from "vue";
import { tabsContext } from "./context";

const props = withDefaults(defineProps<TabsRootProps<T> & {
	class?: HTMLAttributes["class"];
	loop?: boolean;
	disabled?: boolean;
}>(), { orientation: "horizontal", loop: false, disabled: false });
const emit = defineEmits<TabsRootEmits<T>>();
const forwarded = useForwardPropsEmits(reactiveOmit(props, "class", "loop", "disabled"), emit);
const { forwardRef } = useForwardExpose();
provide(tabsContext, toRefs(props));
</script>

<template>
	<TabsRoot :ref="forwardRef" v-slot="state" v-bind="forwarded" data-slot="tabs" :data-disabled="disabled ? '' : undefined" :class="cn('cn-tabs group/tabs flex min-w-0 data-horizontal:flex-col', props.class)">
		<slot v-bind="state" />
	</TabsRoot>
</template>
