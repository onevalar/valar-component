<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		surface?: "plain" | "card";
	}>(),
	{ surface: "plain" }
);
</script>

<template>
	<section
		data-slot="page-layout-section"
		:data-surface="surface"
		:class="
			cn(
				'flex min-w-0 flex-col',
				surface === 'card'
					? 'overflow-hidden rounded-lg border-[0.5px] border-border bg-card'
					: 'gap-3',
				props.class
			)
		"
	>
		<slot />
	</section>
</template>
