<script setup lang="ts">
import {
	CheckIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpIcon,
	XIcon,
} from "@lucide/vue";
const props = defineProps<{
	lucide: keyof typeof icons;
	tabler?: string;
	hugeicons?: string;
	phosphor?: string;
	remixicon?: string;
}>();
const icons = {
	CheckIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpIcon,
	XIcon,
};
</script>

<template>
	<component :is="icons[props.lucide]" aria-hidden="true" />
</template>
