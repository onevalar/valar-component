<script setup lang="ts">
import { computed, provide } from "vue";
import { TOOLTIP_PROVIDER_KEY } from "./context";

const props = withDefaults(
	defineProps<{
		delayDuration?: number;
		skipDelayDuration?: number;
		disableHoverableContent?: boolean;
		disabled?: boolean;
	}>(),
	{
		delayDuration: 500,
		disabled: false,
	}
);

provide(TOOLTIP_PROVIDER_KEY, {
	delayDuration: computed(() => props.delayDuration),
	disabled: computed(() => props.disabled),
});
</script>

<template>
	<slot />
</template>
