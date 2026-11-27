<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="message-header"
		:class="cn('cn-message-header flex max-w-full min-w-0 items-center', props.class)"
	>
		<slot />
	</div>
</template>
