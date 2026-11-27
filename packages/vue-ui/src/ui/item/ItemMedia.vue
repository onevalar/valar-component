<script setup lang="ts">
import { cn } from "cn";
import { itemMediaVariants, type ItemMediaVariant } from ".";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{ class?: HTMLAttributes["class"]; variant?: ItemMediaVariant }>(),
	{ variant: "default" }
);
</script>

<template>
	<div
		data-slot="item-media"
		:data-variant="variant"
		:class="cn(itemMediaVariants({ variant }), props.class)"
	>
		<slot />
	</div>
</template>
