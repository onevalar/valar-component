<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="attachment-content"
		:class="cn('cn-attachment-content max-w-full min-w-0 flex-1', props.class)"
	>
		<slot />
	</div>
</template>
