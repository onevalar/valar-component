<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		width?: "full" | "narrow";
	}>(),
	{ width: "full" }
);
</script>

<template>
	<div
		data-slot="page-layout"
		:data-width="width"
		:class="
			cn(
				'flex w-full min-w-0 flex-col gap-6',
				width === 'narrow' && 'mx-auto max-w-3xl',
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
