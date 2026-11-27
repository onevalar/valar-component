<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="attachment-group"
		:class="
			cn(
				'cn-attachment-group flex min-w-0 scroll-fade-x snap-x snap-mandatory scrollbar-none overflow-x-auto overscroll-x-contain focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start',
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
