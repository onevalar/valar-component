<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@lucide/vue";
import { cn } from "cn";
import { Primitive, useForwardExpose } from "reka-ui";
import { computed } from "vue";
import { usePagination, type PaginationControlProps } from "./context";
import { buttonVariants } from "../button";

const props = withDefaults(
	defineProps<
		PaginationControlProps & {
			direction: "previous" | "next";
			legacy?: boolean;
		}
	>(),
	{ as: "button" }
);
const context = usePagination();
const { forwardRef } = useForwardExpose();
const previous = computed(() => props.direction === "previous");
const label = computed(() => props.label ?? (previous.value ? "上一页" : "下一页"));
const unavailable = computed(
	() =>
		props.disabled ||
		context.disabled.value ||
		(previous.value ? context.page.value <= 1 : context.page.value >= context.pageCount.value)
);

function step(event: MouseEvent) {
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
	context.setPage(context.page.value + (previous.value ? -1 : 1));
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
		:aria-label="label"
		data-pagination-control
		:data-slot="previous ? 'pagination-previous' : 'pagination-next'"
		:class="
			cn(
				buttonVariants({ variant: 'ghost' }),
				previous ? 'cn-pagination-previous' : 'cn-pagination-next',
				props.class
			)
		"
		@click="step"
	>
		<slot>
			<ChevronLeftIcon
				v-if="previous"
				aria-hidden="true"
				data-icon="inline-start"
				class="cn-rtl-flip"
			/>
			<span :class="legacy ? undefined : 'hidden sm:block'">{{ label }}</span>
			<ChevronRightIcon
				v-if="!previous"
				aria-hidden="true"
				data-icon="inline-end"
				class="cn-rtl-flip"
			/>
		</slot>
	</Primitive>
</template>
