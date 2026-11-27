<script setup lang="ts">
import { cn } from "cn";
import { useForwardExpose } from "reka-ui";
import type { TableHTMLAttributes } from "vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(
	defineProps<{
		appearance?: "default" | "settings";
		scrollLabel?: string;
		class?: TableHTMLAttributes["class"];
	}>(),
	{ appearance: "default" }
);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<div
		data-slot="table-container"
		class="cn-table-container"
		:role="scrollLabel ? 'region' : undefined"
		:aria-label="scrollLabel"
		:tabindex="scrollLabel ? 0 : undefined"
	>
		<table
			:ref="forwardRef"
			data-slot="table"
			:data-appearance="appearance"
			:class="cn('cn-table', appearance === 'settings' && 'cn-table-settings', props.class)"
			v-bind="$attrs"
		>
			<slot />
		</table>
	</div>
</template>
