<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		layout?: "settings" | "detail";
	}>(),
	{ layout: "settings" }
);
</script>

<template>
	<div
		data-slot="page-layout-property-list"
		:data-layout="layout"
		:class="
			cn(
				'flex min-w-0 flex-col',
				layout === 'settings' ? 'divide-y-[0.5px] divide-border' : 'gap-2.5',
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
