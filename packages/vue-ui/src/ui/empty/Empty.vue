<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		appearance?: "default" | "issue-list" | "filtered-list";
	}>(),
	{ appearance: "default" }
);
</script>

<template>
	<div
		data-slot="empty"
		:data-appearance="appearance"
		:class="
			cn(
				'cn-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance',
				appearance !== 'default' && 'cn-empty-issue-list',
				appearance === 'filtered-list' && 'cn-empty-filtered-list',
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
