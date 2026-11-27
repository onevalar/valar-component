<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<span data-slot="trace-title" :class="cn('min-w-0 truncate', props.class)">
		<slot />
	</span>
</template>
