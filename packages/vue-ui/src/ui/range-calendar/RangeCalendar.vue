<script lang="ts" setup>
import { getLocalTimeZone, today } from "@internationalized/date";
import { reactiveOmit, useVModel } from "@vueuse/core";
import { cn } from "cn";
import { RangeCalendarRoot, useForwardPropsEmits } from "reka-ui";
import { createYearRange } from "reka-ui/date";
import { computed, toRaw } from "vue";
import {
	RangeCalendarCell,
	RangeCalendarCellTrigger,
	RangeCalendarGrid,
	RangeCalendarGridBody,
	RangeCalendarGridHead,
	RangeCalendarGridRow,
	RangeCalendarHeadCell,
	RangeCalendarHeader,
	RangeCalendarHeading,
	RangeCalendarNextButton,
	RangeCalendarPrevButton,
} from ".";
import CalendarCaption from "../calendar/CalendarCaption.vue";
import type { DateValue, RangeCalendarRootEmits, RangeCalendarRootProps } from "reka-ui";
import type { HTMLAttributes, Ref } from "vue";

const props = withDefaults(
	defineProps<
		RangeCalendarRootProps & {
			class?: HTMLAttributes["class"];
			captionLayout?: "dropdown" | "dropdown-months" | "dropdown-years" | "label";
			yearRange?: DateValue[];
		}
	>(),
	{ locale: "zh-CN", weekdayFormat: "short" }
);

const emits = defineEmits<RangeCalendarRootEmits>();

const delegatedProps = reactiveOmit(props, "class", "captionLayout", "yearRange", "placeholder");
const placeholder = useVModel(props, "placeholder", emits, {
	passive: true,
	defaultValue: props.defaultPlaceholder ?? today(getLocalTimeZone()),
}) as Ref<DateValue>;
const yearRange = computed(
	() =>
		props.yearRange ??
		createYearRange({
			start:
				props.minValue ??
				(toRaw(props.placeholder) ?? props.defaultPlaceholder ?? today(getLocalTimeZone())).cycle(
					"year",
					-100
				),
			end:
				props.maxValue ??
				(toRaw(props.placeholder) ?? props.defaultPlaceholder ?? today(getLocalTimeZone())).cycle(
					"year",
					10
				),
		})
);

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<RangeCalendarRoot
		v-slot="{ grid, weekDays, date }"
		data-slot="range-calendar"
		:class="cn('cn-calendar cn-range-calendar-geometry p-3', props.class)"
		v-bind="forwarded"
		v-model:placeholder="placeholder"
	>
		<RangeCalendarHeader>
			<slot name="calendar-heading" :date="date">
				<div
					v-if="captionLayout && captionLayout !== 'label'"
					class="flex items-center justify-center gap-1.5"
				>
					<CalendarCaption
						v-if="captionLayout !== 'dropdown-years'"
						:date="date"
						kind="month"
						:locale="locale"
						:disabled="disabled"
						@select="(month) => (placeholder = placeholder.set({ month }))"
					/>
					<span v-else>{{ date.month }}</span>
					<CalendarCaption
						v-if="captionLayout !== 'dropdown-months'"
						:date="date"
						kind="year"
						:locale="locale"
						:year-range="yearRange"
						:disabled="disabled"
						@select="(year) => (placeholder = placeholder.set({ year }))"
					/>
					<span v-else>{{ date.year }}</span>
				</div>
				<RangeCalendarHeading v-else />
			</slot>

			<nav
				class="pointer-events-none absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1"
			>
				<RangeCalendarPrevButton />
				<RangeCalendarNextButton />
			</nav>
		</RangeCalendarHeader>

		<div class="mt-4 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
			<RangeCalendarGrid v-for="month in grid" :key="month.value.toString()">
				<RangeCalendarGridHead>
					<RangeCalendarGridRow>
						<RangeCalendarHeadCell v-for="day in weekDays" :key="day">
							{{ day }}
						</RangeCalendarHeadCell>
					</RangeCalendarGridRow>
				</RangeCalendarGridHead>
				<RangeCalendarGridBody>
					<RangeCalendarGridRow
						v-for="(weekDates, index) in month.rows"
						:key="`weekDate-${index}`"
						class="mt-2 w-full"
					>
						<RangeCalendarCell
							v-for="weekDate in weekDates"
							:key="weekDate.toString()"
							:date="weekDate"
						>
							<RangeCalendarCellTrigger :day="weekDate" :month="month.value" />
						</RangeCalendarCell>
					</RangeCalendarGridRow>
				</RangeCalendarGridBody>
			</RangeCalendarGrid>
		</div>
	</RangeCalendarRoot>
</template>
