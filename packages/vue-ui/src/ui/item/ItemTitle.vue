<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
	<div
		data-slot="item-title"
		:class="
			cn(
				'cn-item-title line-clamp-1 flex w-fit max-w-full min-w-0 items-center wrap-anywhere',
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
