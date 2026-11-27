<script setup lang="ts">
import { cn } from "cn";
import { Primitive, useForwardExpose } from "reka-ui";
import { computed, ref } from "vue";
import { pageItems, providePagination } from "./context";
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<
		PrimitiveProps & {
			class?: HTMLAttributes["class"];
			count?: number;
			perPage?: number;
			siblingCount?: number;
			page?: number;
			defaultPage?: number;
			disabled?: boolean;
			orientation?: "horizontal" | "vertical";
			loop?: boolean;
		}
	>(),
	{ as: "nav", count: 0, perPage: 10, siblingCount: 1, defaultPage: 1, orientation: "horizontal" }
);
const emit = defineEmits<{ "update:page": [page: number] }>();
const { forwardRef } = useForwardExpose();
const localPage = ref(props.defaultPage);
const count = computed(() => Math.max(0, Math.floor(props.count)));
const perPage = computed(() => Math.max(1, Math.floor(props.perPage)));
const pageCount = computed(() => Math.max(1, Math.ceil(count.value / perPage.value)));
const currentPage = computed(() =>
	Math.min(pageCount.value, Math.max(1, Math.floor(props.page ?? localPage.value)))
);
const pages = computed(() =>
	pageItems(currentPage.value, pageCount.value, Math.max(0, Math.floor(props.siblingCount)))
);
const range = computed(() => ({
	start: (currentPage.value - 1) * perPage.value + 1,
	end: Math.min(count.value, currentPage.value * perPage.value),
}));

providePagination({
	page: currentPage,
	pageCount,
	disabled: computed(() => props.disabled),
	setPage(value) {
		if (
			props.disabled ||
			!Number.isInteger(value) ||
			value < 1 ||
			value > pageCount.value ||
			value === currentPage.value
		)
			return;
		if (props.page === undefined) localPage.value = value;
		emit("update:page", value);
	},
});

function onKeydown(event: KeyboardEvent) {
	if (
		event.defaultPrevented ||
		event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		event.shiftKey ||
		props.disabled
	)
		return;
	if (!(event.target instanceof Element)) return;
	const root = event.currentTarget as HTMLElement;
	const target = event.target.closest<HTMLElement>("[data-pagination-control]");
	if (!target || target.closest("[data-pagination-root]") !== root) return;
	const rtl = getComputedStyle(root).direction === "rtl";
	const next = props.orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
	const previous = props.orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
	if (event.key !== next && event.key !== previous && event.key !== "Home" && event.key !== "End")
		return;
	const controls = Array.from(
		root.querySelectorAll<HTMLElement>(
			"[data-pagination-control]:not(:disabled):not([aria-disabled=true])"
		)
	).filter((control) => control.closest("[data-pagination-root]") === root);
	const index = controls.indexOf(target);
	if (index === -1) return;
	event.preventDefault();
	const last = controls.length - 1;
	let destination =
		event.key === "Home" ? 0 : event.key === "End" ? last : index + (event.key === next ? 1 : -1);
	if (props.loop) destination = (destination + controls.length) % controls.length;
	controls[destination]?.focus();
}
</script>

<template>
	<Primitive
		:ref="forwardRef"
		:as="as"
		:as-child="asChild"
		role="navigation"
		aria-label="分页"
		data-pagination-root
		data-slot="pagination"
		:data-orientation="orientation"
		:class="cn('cn-pagination mx-auto flex w-full justify-center', props.class)"
		@keydown="onKeydown"
	>
		<slot
			:pages="pages"
			:range="range"
			:current-page="currentPage"
			:page="currentPage"
			:page-count="pageCount"
		/>
	</Primitive>
</template>
