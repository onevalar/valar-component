<script setup lang="ts">
import { cn } from "cn";
import { DrawerOverlay } from "vaul-vue";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<DrawerOverlay
		data-slot="drawer-overlay"
		:class="
			cn(
				'cn-drawer-overlay fixed inset-0 z-50 motion-reduce:animate-none! motion-reduce:transition-none!',
				props.class
			)
		"
	/>
</template>
