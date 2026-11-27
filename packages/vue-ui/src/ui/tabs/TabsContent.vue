<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { TabsContent, useForwardExpose, useForwardProps } from "reka-ui";
import type { TabsContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<TabsContentProps & { class?: HTMLAttributes["class"] }>();
const forwarded = useForwardProps(reactiveOmit(props, "class"));
const { forwardRef } = useForwardExpose();
</script>

<template>
	<TabsContent :ref="forwardRef" v-bind="forwarded" data-slot="tabs-content" :class="cn('cn-tabs-content min-w-0 flex-1 outline-none', props.class)"><slot /></TabsContent>
</template>
