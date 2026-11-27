<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="item-actions"
		:class="cn('cn-item-actions flex max-w-full flex-wrap items-center', props.class)"
	>
		<slot />
	</div>
</template>
