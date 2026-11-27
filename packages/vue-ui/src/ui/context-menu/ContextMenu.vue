<script setup lang="ts">
import { ContextMenuRoot } from "reka-ui";
import ContextMenuState from "./ContextMenuState.vue";
import type { ContextMenuRootEmits, ContextMenuRootProps } from "reka-ui";

// The virtual anchor is owned by Reka; the state adapter runs inside that context.
const props = withDefaults(defineProps<ContextMenuRootProps & { open?: boolean }>(), {
	open: undefined,
	modal: true,
});
const emit = defineEmits<ContextMenuRootEmits>();
</script>

<template>
	<ContextMenuRoot :modal="props.modal" :dir="props.dir" :press-open-delay="props.pressOpenDelay">
		<ContextMenuState :open="props.open" @update:open="emit('update:open', $event)">
			<template #default="slotProps"><slot v-bind="slotProps" /></template>
		</ContextMenuState>
	</ContextMenuRoot>
</template>
