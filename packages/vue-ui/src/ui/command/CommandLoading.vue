<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
	progress?: number;
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<div
		role="progressbar"
		aria-label="Loading..."
		aria-valuemin="0"
		aria-valuemax="100"
		:aria-valuenow="progress"
		data-slot="command-loading"
		:class="cn('cn-command-loading', props.class)"
	>
		<slot />
	</div>
</template>
