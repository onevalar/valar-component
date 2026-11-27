<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(defineProps<{
	class?: HTMLAttributes["class"];
	appearance?: "default" | "settings-search" | "settings-name" | "composer";
}>(), { appearance: "default" });
</script>

<template>
	<div data-slot="input-group" role="group" :data-appearance="appearance" :class="cn(
		'group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto',
		appearance === 'settings-search' && 'cn-input-group-settings-search',
		appearance === 'settings-name' && 'cn-input-group-settings-name',
		appearance === 'composer' && 'cn-input-group-composer', props.class)">
		<slot />
	</div>
</template>
