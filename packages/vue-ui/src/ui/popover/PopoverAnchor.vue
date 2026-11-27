<script setup lang="ts">
import { inject, onBeforeUnmount, watchEffect, ref, type Component } from "vue";
import { POPOVER_CONTEXT_KEY } from "./context";

const props = defineProps<{
	as?: string | Component;
}>();

const ctx = inject(POPOVER_CONTEXT_KEY, null);
const elRef = ref<HTMLElement | null>(null);

watchEffect(() => {
	if (ctx) ctx.anchor.value = elRef.value;
});

onBeforeUnmount(() => {
	if (ctx && ctx.anchor.value === elRef.value) ctx.anchor.value = null;
});
</script>

<template>
	<component :is="props.as ?? 'div'" ref="elRef" data-slot="popover-anchor">
		<slot />
	</component>
</template>
