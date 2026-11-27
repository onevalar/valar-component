<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { Primitive, useForwardExpose, useForwardProps } from "reka-ui";
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>();
const forwarded = useForwardProps(reactiveOmit(props, "class"));
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Primitive :ref="forwardRef" v-bind="forwarded" data-slot="button-group-text" :class="cn('cn-button-group-text flex items-center [&_svg]:pointer-events-none', props.class)"><slot /></Primitive>
</template>
