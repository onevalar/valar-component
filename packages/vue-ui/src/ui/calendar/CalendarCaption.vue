<script setup lang="ts">
import { useDateFormatter } from "reka-ui";
import { createYear, toDate } from "reka-ui/date";
import { computed } from "vue";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select";
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
const chinese = computed(() => props.locale.toLowerCase().startsWith("zh"));
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
const current = computed(() => props.date[props.kind]);
</script>

<template>
	<Select
		:model-value="String(current)"
		:disabled="disabled"
		@update:model-value="(value) => emits('select', Number(value))"
	>
		<SelectTrigger
			size="sm"
			:aria-label="kind === 'month' ? (chinese ? '月份' : 'Month') : chinese ? '年份' : 'Year'"
			:data-calendar-caption="kind"
			class="h-(--cell-size)!"
		>
			<span class="min-w-0 truncate">{{
				items.find((item) => item.value === current)?.label ?? current
			}}</span>
		</SelectTrigger>
		<SelectContent
			class="cn-select-content-settings max-h-[min(15rem,var(--reka-select-content-available-height,15rem))]! animate-none!"
			:collision-padding="8"
		>
			<SelectItem v-for="item in items" :key="item.value" :value="String(item.value)">
				{{ item.label }}
			</SelectItem>
		</SelectContent>
	</Select>
</template>
