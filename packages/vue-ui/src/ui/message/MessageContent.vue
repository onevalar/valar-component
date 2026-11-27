<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";
const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="message-content"
		:class="cn('cn-message-content flex w-full min-w-0 flex-col wrap-break-word', props.class)"
	>
		<slot />
	</div>
</template>
