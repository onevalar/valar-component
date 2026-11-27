<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="attachment-actions"
		:class="cn('cn-attachment-actions z-20 flex shrink-0 items-center', props.class)"
	>
		<slot />
	</div>
</template>
