<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<span
		data-slot="marker-content"
		:class="cn('cn-marker-content max-w-full min-w-0 wrap-break-word', props.class)"
	>
		<slot />
	</span>
</template>
