<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="empty-header"
		:class="cn('cn-empty-header flex max-w-sm flex-col items-center', props.class)"
	>
		<slot />
	</div>
</template>
