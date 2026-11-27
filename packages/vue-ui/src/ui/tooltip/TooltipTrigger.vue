<script setup lang="ts">
import { TooltipTrigger, useForwardExpose, useForwardProps } from "reka-ui";
import type { TooltipTriggerProps } from "reka-ui";

const props = defineProps<TooltipTriggerProps>();
const forwarded = useForwardProps(props);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<TooltipTrigger :ref="forwardRef" v-bind="forwarded" data-slot="tooltip-trigger"><slot /></TooltipTrigger>
</template>
