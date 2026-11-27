<script setup lang="ts">
import CommandItem from "./CommandItem.vue";
import type { CommandItemProps } from "./context";

const props = defineProps<Omit<CommandItemProps, "checked"> & { href: string }>();
const emit = defineEmits<{ select: [value: string, event: MouseEvent] }>();
</script>

<template>
	<CommandItem
		v-bind="props"
		as="a"
		:href="disabled ? undefined : href"
		@select="(value, event) => emit('select', value, event)"
	>
		<slot />
	</CommandItem>
</template>
