<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<h2
		data-slot="page-layout-section-title"
		:class="cn('text-sm font-medium text-foreground', props.class)"
	>
		<slot />
	</h2>
</template>
