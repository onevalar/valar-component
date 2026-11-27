<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div data-slot="message-group" :class="cn('cn-message-group flex min-w-0 flex-col', props.class)">
		<slot />
	</div>
</template>
