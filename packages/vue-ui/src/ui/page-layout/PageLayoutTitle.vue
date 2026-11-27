<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		tag?: "h1" | "h2";
	}>(),
	{ tag: "h1" }
);
</script>

<template>
	<component
		:is="tag"
		data-slot="page-layout-title"
		:class="
			cn('min-w-0 truncate text-lg font-semibold tracking-tight text-foreground', props.class)
		"
	>
		<slot />
	</component>
</template>
