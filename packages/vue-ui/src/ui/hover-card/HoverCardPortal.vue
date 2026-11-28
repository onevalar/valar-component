<script setup lang="ts">
export interface HoverCardPortalProps {
	to?: string | Element | DocumentFragment | null;
	disabled?: boolean;
	forceMount?: boolean;
}

defineProps<HoverCardPortalProps>();
</script>

<template>
	<slot />
</template>
