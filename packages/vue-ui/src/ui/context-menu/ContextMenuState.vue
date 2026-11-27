<script setup lang="ts">
import { injectContextMenuRootContext } from "reka-ui";
import { nextTick, watch } from "vue";

const props = withDefaults(defineProps<{ open?: boolean }>(), { open: undefined });
const emit = defineEmits<{ "update:open": [open: boolean] }>();
const { open } = injectContextMenuRootContext();

function sync() {
	if (props.open !== undefined) open.value = props.open;
}

watch(() => props.open, sync, { immediate: true });
watch(open, async (value) => {
	if (value === props.open) return;
	emit("update:open", value);
	await nextTick();
	sync();
});
</script>

<template>
	<slot :open="open" />
</template>
