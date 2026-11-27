<script setup lang="ts">
import { DialogOverlay, useForwardExpose } from "reka-ui";
import type { DialogOverlayProps } from "reka-ui";

const props = defineProps<DialogOverlayProps>();
const { forwardRef } = useForwardExpose();
</script>

<template>
	<DialogOverlay
		:ref="forwardRef"
		v-bind="props"
		data-slot="alert-dialog-overlay"
		class="cn-alert-dialog-overlay fixed inset-0 z-50"
	>
		<slot />
	</DialogOverlay>
</template>
