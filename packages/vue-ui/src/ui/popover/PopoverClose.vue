<script setup lang="ts">
import { PopoverClose, useForwardExpose } from "reka-ui";
import type { PopoverCloseProps } from "reka-ui";

const props = defineProps<PopoverCloseProps>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<PopoverClose :ref="forwardRef" data-slot="popover-close" v-bind="props">
		<slot />
	</PopoverClose>
</template>
