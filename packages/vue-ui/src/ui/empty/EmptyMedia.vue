<script setup lang="ts">
import { cn } from "cn";
import { emptyMediaVariants, type EmptyMediaVariant } from ".";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{ class?: HTMLAttributes["class"]; variant?: EmptyMediaVariant }>(),
	{ variant: "default" }
);
</script>

<template>
	<div
		data-slot="empty-icon"
		:data-variant="variant"
		:class="cn(emptyMediaVariants({ variant }), props.class)"
	>
		<slot />
	</div>
</template>
