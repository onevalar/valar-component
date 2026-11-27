<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		size?: "default" | "sm" | "settings";
	}>(),
	{ size: "default" }
);
</script>

<template>
	<div
		data-slot="card"
		:data-size="size"
		:class="
			cn(
				'cn-card group/card flex min-w-0 flex-col',
				size === 'settings' && 'cn-card-settings',
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
