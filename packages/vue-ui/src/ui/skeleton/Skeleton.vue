<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="skeleton"
		aria-hidden="true"
		:class="cn('cn-skeleton motion-safe:animate-pulse', props.class)"
	/>
</template>
