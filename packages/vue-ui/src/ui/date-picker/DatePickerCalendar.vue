<script setup lang="ts">
import { cn } from "cn";
import { CalendarRoot, type CalendarRootEmits } from "reka-ui";
import { computed } from "vue";
import {
	CalendarCell,
	CalendarCellTrigger,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHead,
	CalendarGridRow,
	CalendarHeadCell,
	CalendarHeader,
	CalendarHeading,
	CalendarNextButton,
	CalendarPrevButton,
} from "../calendar";
import type { CalendarDate } from "@internationalized/date";

const props = defineProps<{
	label: string;
	locale: string;
	dir?: "ltr" | "rtl";
	value?: CalendarDate;
	anchor?: CalendarDate;
	min: CalendarDate;
	max: CalendarDate;
	disabled: boolean;
}>();
const emit = defineEmits<Pick<CalendarRootEmits, "update:modelValue">>();
const chinese = computed(() => props.locale.toLowerCase().startsWith("zh"));

// The SDK Calendar's default Reka day name converts via the user's time zone.
// Compose its parts here to override day names without altering Reka navigation.
const dayLabel = computed(
	() =>
		new Intl.DateTimeFormat(props.locale, {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
			timeZone: "UTC",
		})
);
</script>

<template>
	<CalendarRoot
		v-slot="{ grid, weekDays }"
		data-slot="calendar"
		:class="cn('cn-calendar', 'cn-calendar-project-date mx-auto bg-transparent')"
		:calendar-label="label"
		:locale="locale"
		:dir="dir"
		:week-starts-on="1"
		weekday-format="short"
		fixed-weeks
		prevent-deselect
		:model-value="value"
		:default-placeholder="anchor"
		:min-value="min"
		:max-value="max"
		:disabled="disabled"
		@update:model-value="(next) => emit('update:modelValue', next)"
	>
		<CalendarHeader class="h-9 justify-start ps-2 pe-20">
			<CalendarHeading class="truncate text-xs font-normal" />
			<nav class="pointer-events-none absolute end-2 top-1 z-10 flex gap-1">
				<CalendarPrevButton
					class="size-7 rounded-full text-(color:--calendar-date-muted) [&>svg]:size-3.5"
					:aria-label="chinese ? '上个月' : 'Previous month'"
				/>
				<CalendarNextButton
					class="size-7 rounded-full text-(color:--calendar-date-muted) [&>svg]:size-3.5"
					:aria-label="chinese ? '下个月' : 'Next month'"
				/>
			</nav>
		</CalendarHeader>
		<CalendarGrid v-for="month in grid" :key="month.value.toString()" class="gap-3 py-3">
			<CalendarGridHead>
				<CalendarGridRow>
					<CalendarHeadCell
						v-for="day in weekDays"
						:key="day"
						class="flex h-[27.5px] min-w-0 flex-1 items-center justify-center text-[13px] text-(color:--calendar-date-weekday)"
					>
						{{ day }}
					</CalendarHeadCell>
				</CalendarGridRow>
			</CalendarGridHead>
			<CalendarGridBody class="flex flex-col gap-2">
				<CalendarGridRow v-for="(week, index) in month.rows" :key="index" class="h-[26px] w-full">
					<CalendarCell
						v-for="(date, dayIndex) in week"
						:key="dayIndex"
						:date="date"
						class="flex h-full min-w-0 flex-1 items-center justify-center"
					>
						<CalendarCellTrigger
							:day="date"
							:month="month.value"
							:aria-label="dayLabel.format(date.toDate('UTC'))"
						/>
					</CalendarCell>
				</CalendarGridRow>
			</CalendarGridBody>
		</CalendarGrid>
	</CalendarRoot>
</template>
