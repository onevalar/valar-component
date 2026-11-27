<script setup lang="ts">
import { useForwardExpose } from "reka-ui";
import PaginationStep from "./PaginationStep.vue";
import type { PaginationControlProps } from "./context";

const props = defineProps<PaginationControlProps>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<PaginationStep :ref="forwardRef" v-bind="props" direction="previous" legacy>
		<template v-if="$slots.default" #default><slot /></template>
	</PaginationStep>
</template>
