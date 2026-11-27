<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="page-layout-actions"
		:class="cn('flex shrink-0 flex-wrap items-center gap-2', props.class)"
	>
		<slot />
	</div>
</template>
