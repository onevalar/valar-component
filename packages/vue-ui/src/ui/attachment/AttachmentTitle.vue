<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<span
		data-slot="attachment-title"
		:class="
			cn(
				'cn-attachment-title block max-w-full min-w-0 truncate motion-safe:group-data-[state=processing]/attachment:shimmer motion-safe:group-data-[state=uploading]/attachment:shimmer',
				props.class
			)
		"
	>
		<slot />
	</span>
</template>
