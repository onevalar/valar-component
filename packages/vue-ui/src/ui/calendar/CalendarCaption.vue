<script setup lang="ts">
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@lucide/vue";
import { useDateFormatter } from "reka-ui";
import { createYear, toDate } from "reka-ui/date";
import { computed, ref } from "vue";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import type { DateValue } from "@internationalized/date";

const props = withDefaults(
	defineProps<{
		date: DateValue;
		kind: "month" | "year";
		locale?: string;
		yearRange?: DateValue[];
		disabled?: boolean;
	}>(),
	{ locale: "zh-CN" }
);
const emits = defineEmits<{ select: [value: number] }>();
const formatter = useDateFormatter(props.locale);
const open = ref(false);
const start = ref<number | null>(null);
const items = computed(() =>
	props.kind === "month"
		? createYear({ dateObj: props.date }).map((date) => ({
				value: date.month,
				label: formatter.custom(toDate(date), { month: "short" }),
			}))
		: (props.yearRange ?? []).map((date) => ({
				value: date.year,
				label: formatter.custom(toDate(date), { year: "numeric" }),
			}))
);
const current = computed(() => (props.kind === "month" ? props.date.month : props.date.year));
const last = computed(() => Math.max(0, items.value.length - 12));
const first = computed(() =>
	Math.min(
		Math.max(
			0,
			start.value ??
				Math.max(
					0,
					items.value.findIndex((item) => item.value === current.value)
				) - 5
		),
		last.value
	)
);
const shown = computed(() =>
	props.kind === "month" ? items.value : items.value.slice(first.value, first.value + 12)
);
function choose(value: number) {
	emits("select", value);
	open.value = false;
}
</script>

<template>
	<Popover
		v-model:open="open"
		@update:open="
			(value) => {
				if (value) start = null;
			}
		"
	>
		<PopoverTrigger as-child>
			<Button
				variant="outline"
				size="sm"
				:disabled="disabled"
				:aria-label="kind === 'month' ? '选择月份' : '选择年份'"
				class="relative h-9 gap-1 ps-2 pe-1.5 font-medium"
			>
				{{ items.find((item) => item.value === current)?.label ?? current }}
				<ChevronDownIcon class="size-3.5 text-muted-foreground" aria-hidden="true" />
			</Button>
		</PopoverTrigger>
		<PopoverContent align="start" :class="kind === 'month' ? 'w-52 p-2' : 'w-60 gap-2 p-2'">
			<div v-if="kind === 'year'" class="flex items-center justify-between">
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="前 12 年"
					:disabled="first === 0"
					@click="start = Math.max(0, first - 12)"
				>
					<ChevronLeftIcon aria-hidden="true" />
				</Button>
				<span class="text-sm font-medium">{{ shown[0]?.label }} – {{ shown.at(-1)?.label }}</span>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="后 12 年"
					:disabled="first >= last"
					@click="start = Math.min(last, first + 12)"
				>
					<ChevronRightIcon aria-hidden="true" />
				</Button>
			</div>
			<div class="grid grid-cols-3 gap-1">
				<Button
					v-for="item in shown"
					:key="item.value"
					:variant="item.value === current ? 'default' : 'ghost'"
					size="sm"
					:aria-pressed="item.value === current"
					@click="choose(item.value)"
				>
					{{ item.label }}
				</Button>
			</div>
		</PopoverContent>
	</Popover>
</template>
