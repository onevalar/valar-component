<script setup lang="ts">
import { cn } from "cn";
import { Primitive, useForwardExpose } from "reka-ui";
import { computed } from "vue";
import { usePagination, type PaginationPage } from "./context";
import { buttonVariants, type ButtonVariants } from "../button";
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<
		PrimitiveProps & {
			class?: HTMLAttributes["class"];
			page: PaginationPage | number;
			isActive?: boolean;
			size?: ButtonVariants["size"];
			disabled?: boolean;
		}
	>(),
	{ as: "button", size: "icon", isActive: undefined }
);
const context = usePagination();
const { forwardRef } = useForwardExpose();
const value = computed(() => (typeof props.page === "number" ? props.page : props.page.value));
const active = computed(() => props.isActive ?? value.value === context.page.value);
const unavailable = computed(
	() =>
		props.disabled ||
		context.disabled.value ||
		value.value < 1 ||
		value.value > context.pageCount.value
);

function select(event: MouseEvent) {
	if (unavailable.value) event.preventDefault();
	if (
		event.defaultPrevented ||
		event.button !== 0 ||
		event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		event.shiftKey
	)
		return;
	context.setPage(value.value);
}
</script>

<template>
	<Primitive
		:ref="forwardRef"
		:as="as"
		:as-child="asChild"
		:type="as === 'button' ? 'button' : undefined"
		:disabled="unavailable"
		:aria-disabled="unavailable ? true : undefined"
		:tabindex="unavailable ? -1 : undefined"
		:aria-label="`Page ${value}`"
		:aria-current="active ? 'page' : undefined"
		data-pagination-control
		data-slot="pagination-link"
		:data-active="active"
		:data-size="size"
		:class="
			cn(
				buttonVariants({ size, variant: active ? 'outline' : 'ghost' }),
				'cn-pagination-link tabular-nums',
				props.class
			)
		"
		@click="select"
	>
		<slot>{{ value }}</slot>
	</Primitive>
</template>
