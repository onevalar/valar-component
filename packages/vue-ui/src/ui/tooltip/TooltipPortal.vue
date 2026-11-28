<script setup lang="ts">
export interface TooltipPortalProps {
	to?: string | Element | DocumentFragment | null;
	disabled?: boolean;
	forceMount?: boolean;
}

defineProps<TooltipPortalProps>();
</script>

<template>
	<slot />
</template>
