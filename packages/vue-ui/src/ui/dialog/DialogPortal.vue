<script setup lang="ts">
defineProps<{
	to?: string | Element | DocumentFragment | null;
	disabled?: boolean;
	forceMount?: boolean;
}>();
</script>

<template>
	<slot />
</template>
