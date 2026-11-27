<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div data-slot="empty-title" :class="cn('cn-font-heading cn-empty-title', props.class)">
		<slot />
	</div>
</template>
