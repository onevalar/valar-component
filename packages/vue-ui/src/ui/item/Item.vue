<script setup lang="ts">
import { cn } from "cn";
import { Primitive, useForwardExpose } from "reka-ui";
import { itemVariants, type ItemSize, type ItemVariant } from ".";
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<
		PrimitiveProps & {
			class?: HTMLAttributes["class"];
			appearance?: "default" | "issue-row";
			size?: ItemSize;
			variant?: ItemVariant;
		}
	>(),
	{ as: "div", appearance: "default" }
);
const { forwardRef } = useForwardExpose();
</script>

<template>
	<Primitive
		:ref="forwardRef"
		:as="as"
		:as-child="asChild"
		:type="as === 'button' && !asChild ? 'button' : undefined"
		data-slot="item"
		:data-appearance="appearance"
		:data-size="size"
		:data-variant="variant"
		:class="
			cn(
				appearance === 'issue-row'
					? 'cn-item-issue-row group/item flex w-full items-center'
					: itemVariants({ size, variant }),
				props.class
			)
		"
	>
		<slot />
	</Primitive>
</template>
