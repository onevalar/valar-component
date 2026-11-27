<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<span
		data-slot="marker-icon"
		aria-hidden="true"
		:class="cn('cn-marker-icon shrink-0', props.class)"
	>
		<slot />
	</span>
</template>
