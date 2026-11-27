<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<span
		data-slot="attachment-description"
		:class="
			cn(
				'cn-attachment-description block max-w-full min-w-0 truncate text-muted-foreground group-data-[state=error]/attachment:text-destructive/80',
				props.class
			)
		"
	>
		<slot />
	</span>
</template>
