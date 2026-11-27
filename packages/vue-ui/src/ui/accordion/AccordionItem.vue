<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { AccordionItem, useForwardExpose, useForwardProps } from "reka-ui";
import type { AccordionItemProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<AccordionItemProps & { class?: HTMLAttributes["class"] }>();
const forwarded = useForwardProps(reactiveOmit(props, "class"));
const { forwardRef } = useForwardExpose();
</script>

<template>
	<AccordionItem :ref="forwardRef" v-slot="state" v-bind="forwarded" data-slot="accordion-item"
		:class="cn('cn-accordion-item', props.class)">
		<slot v-bind="state" />
	</AccordionItem>
</template>
