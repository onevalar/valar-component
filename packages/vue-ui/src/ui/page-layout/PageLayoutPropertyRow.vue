<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		label: string;
		description?: string;
		layout?: "settings" | "detail";
	}>(),
	{ layout: "settings" }
);
</script>

<template>
	<div
		data-slot="page-layout-property-row"
		:data-layout="layout"
		:class="
			cn(
				layout === 'settings'
					? 'flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3'
					: 'flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4',
				props.class
			)
		"
	>
		<template v-if="layout === 'settings'">
			<div class="flex min-w-0 flex-col gap-0.5">
				<span class="text-sm font-medium text-foreground">{{ label }}</span>
				<span v-if="description" class="text-xs text-muted-foreground">{{ description }}</span>
			</div>
			<div class="flex shrink-0 items-center gap-2"><slot /></div>
		</template>
		<template v-else>
			<span class="w-28 shrink-0 text-sm text-muted-foreground">{{ label }}</span>
			<div class="flex min-w-0 flex-1 items-center gap-2 text-sm text-foreground tabular-nums">
				<slot />
			</div>
		</template>
	</div>
</template>
