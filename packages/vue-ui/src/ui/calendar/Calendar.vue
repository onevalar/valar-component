<script lang="ts" setup>
import { getLocalTimeZone, today } from "@internationalized/date";
import { createReusableTemplate, reactiveOmit, useVModel } from "@vueuse/core";
import { cn } from "cn";
import { CalendarRoot, useDateFormatter, useForwardPropsEmits } from "reka-ui";
import { createYearRange, toDate } from "reka-ui/date";
import { computed, toRaw } from "vue";
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
} from ".";
import CalendarCaption from "./CalendarCaption.vue";
import type { LayoutTypes } from ".";
import type { CalendarRootEmits, CalendarRootProps, DateValue } from "reka-ui";
import type { HTMLAttributes, Ref } from "vue";

const props = withDefaults(
	defineProps<
		CalendarRootProps & {
			class?: HTMLAttributes["class"];
			layout?: LayoutTypes;
			captionLayout?: "dropdown" | "dropdown-months" | "dropdown-years" | "label";
			yearRange?: DateValue[];
		}
	>(),
	{
		modelValue: undefined,
		layout: undefined,
		locale: "zh-CN",
		weekdayFormat: "short",
	}
);
const emits = defineEmits<CalendarRootEmits>();

const delegatedProps = reactiveOmit(
	props,
	"class",
	"layout",
	"captionLayout",
	"yearRange",
	"placeholder"
);
const effectiveLayout = computed(
	() =>
		props.layout ??
		(
			{
				dropdown: "month-and-year",
				"dropdown-months": "month-only",
				"dropdown-years": "year-only",
				label: undefined,
			} as const
		)[props.captionLayout ?? "label"]
);

const placeholder = useVModel(props, "placeholder", emits, {
	passive: true,
	defaultValue: props.defaultPlaceholder ?? today(getLocalTimeZone()),
}) as Ref<DateValue>;

const formatter = useDateFormatter(props.locale ?? "en");

const yearRange = computed(() => {
	return (
		props.yearRange ??
		createYearRange({
			start:
				props?.minValue ??
				(toRaw(props.placeholder) ?? props.defaultPlaceholder ?? today(getLocalTimeZone())).cycle(
					"year",
					-100
				),

			end:
				props?.maxValue ??
				(toRaw(props.placeholder) ?? props.defaultPlaceholder ?? today(getLocalTimeZone())).cycle(
					"year",
					10
				),
		})
	);
});

const [DefineMonthTemplate, ReuseMonthTemplate] = createReusableTemplate<{ date: DateValue }>();
const [DefineYearTemplate, ReuseYearTemplate] = createReusableTemplate<{ date: DateValue }>();

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<DefineMonthTemplate v-slot="{ date }">
		<CalendarCaption
			:date="date"
			kind="month"
			:locale="locale"
			:disabled="disabled"
			@select="(month) => (placeholder = placeholder.set({ month }))"
		/>
	</DefineMonthTemplate>

	<DefineYearTemplate v-slot="{ date }">
		<CalendarCaption
			:date="date"
			kind="year"
			:locale="locale"
			:year-range="yearRange"
			:disabled="disabled"
			@select="(year) => (placeholder = placeholder.set({ year }))"
		/>
	</DefineYearTemplate>

	<CalendarRoot
		v-slot="{ grid, weekDays, date }"
		v-bind="forwarded"
		v-model:placeholder="placeholder"
		data-slot="calendar"
		:class="
			cn(
				'cn-calendar cn-calendar-geometry group/calendar bg-background in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent',
				props.class
			)
		"
	>
		<CalendarHeader class="pt-0">
			<slot
				name="calendar-heading"
				:date="date"
				:month="ReuseMonthTemplate"
				:year="ReuseYearTemplate"
			>
				<template v-if="effectiveLayout === 'month-and-year'">
					<div class="flex items-center justify-center gap-1.5">
						<ReuseMonthTemplate :date="date" />
						<ReuseYearTemplate :date="date" />
					</div>
				</template>
				<template v-else-if="effectiveLayout === 'month-only'">
					<div class="flex items-center justify-center gap-1.5">
						<ReuseMonthTemplate :date="date" />
						{{ formatter.custom(toDate(date), { year: "numeric" }) }}
					</div>
				</template>
				<template v-else-if="effectiveLayout === 'year-only'">
					<div class="flex items-center justify-center gap-1.5">
						{{ formatter.custom(toDate(date), { month: "short" }) }}
						<ReuseYearTemplate :date="date" />
					</div>
				</template>
				<template v-else>
					<CalendarHeading />
				</template>
			</slot>

			<nav
				class="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-1"
			>
				<CalendarPrevButton>
					<slot name="calendar-prev-icon" />
				</CalendarPrevButton>
				<CalendarNextButton>
					<slot name="calendar-next-icon" />
				</CalendarNextButton>
			</nav>
		</CalendarHeader>

		<div class="mt-4 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
			<CalendarGrid v-for="month in grid" :key="month.value.toString()">
				<CalendarGridHead>
					<CalendarGridRow>
						<CalendarHeadCell v-for="day in weekDays" :key="day">
							{{ day }}
						</CalendarHeadCell>
					</CalendarGridRow>
				</CalendarGridHead>
				<CalendarGridBody>
					<CalendarGridRow
						v-for="(weekDates, index) in month.rows"
						:key="`weekDate-${index}`"
						class="mt-2 w-full"
					>
						<CalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate">
							<CalendarCellTrigger :day="weekDate" :month="month.value" />
						</CalendarCell>
					</CalendarGridRow>
				</CalendarGridBody>
			</CalendarGrid>
		</div>
	</CalendarRoot>
</template>
