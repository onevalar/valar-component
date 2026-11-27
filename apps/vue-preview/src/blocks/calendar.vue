<script setup lang="ts">
import {
	CalendarDate,
	getDayOfWeek,
	getLocalTimeZone,
	isEqualMonth,
	isWeekend,
	today,
	type DateValue,
} from "@internationalized/date";
import { VisAxis, VisGroupedBar, VisXYContainer } from "@unovis/vue";
import { Button } from "@valar/vue-ui/button";
import {
	Calendar,
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
} from "@valar/vue-ui/calendar";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@valar/vue-ui/card";
import {
	ChartContainer,
	ChartCrosshair,
	ChartTooltip,
	ChartTooltipContent,
	componentToString,
} from "@valar/vue-ui/chart";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@valar/vue-ui/drawer";
import { Input } from "@valar/vue-ui/input";
import { Label } from "@valar/vue-ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@valar/vue-ui/popover";
import {
	RangeCalendar,
	RangeCalendarCell,
	RangeCalendarCellTrigger,
	RangeCalendarGrid,
	RangeCalendarGridBody,
	RangeCalendarGridHead,
	RangeCalendarGridRow,
	RangeCalendarHeadCell,
	RangeCalendarHeader,
	RangeCalendarNextButton,
	RangeCalendarPrevButton,
} from "@valar/vue-ui/range-calendar";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@valar/vue-ui/select";
import { en, zh } from "chrono-node";
import { CalendarRoot, RangeCalendarRoot, type DateRange } from "reka-ui";
import { computed, h, ref, shallowRef, useId, watch } from "vue";

const props = defineProps<{ block: string; chinese?: boolean }>();
const id = useId();
const t = (en: string, zh: string) => (props.chinese ? zh : en);
const language = computed(() => t("en-US", "zh-CN"));
const date = (day: number, month = 6) => new CalendarDate(2025, month, day);
const localToday = () => today(getLocalTimeZone());
const shortDate = { day: "2-digit", month: "short", year: "numeric" } as const;
const longDate = { day: "2-digit", month: "long", year: "numeric" } as const;
const weekend = (day: DateValue) => isWeekend(day, "en-US");
const framed = "w-fit max-w-full rounded-lg border-[0.5px] shadow-sm";
const plain = "w-fit bg-transparent p-0!";
// Composed roots do not pass through the SDK's high-level calendar wrapper.
const calendarTokens =
	"[--cell-size:28px] [--cell-radius:999px] [--calendar-date-text:var(--foreground)] [--calendar-date-muted:var(--muted-foreground)] [--calendar-date-strong:var(--foreground)] [--calendar-date-today:var(--muted)] [--calendar-date-accent:var(--primary)] [--calendar-date-accent-text:var(--primary-foreground)] [--calendar-date-nav-hover:var(--accent)]";
const panel = "w-auto max-w-[calc(100vw-1rem)] overflow-auto p-0!";
const wholeMonth =
	"[--cell-size:min(44px,calc((100cqw-18px)/7))]! md:[--cell-size:min(48px,calc((100cqw-18px)/7))]!";
const priceCells =
	"[--cell-size:min(44px,calc((100cqw-26px)/7))]! md:[--cell-size:min(52px,calc((100cqw-26px)/7))]!";
const timeInput =
	"appearance-none bg-background tabular-nums [&::-webkit-calendar-picker-indicator]:hidden";
const captionOptions = ["dropdown", "dropdown-months", "dropdown-years"] as const;
const times = Array.from(
	{ length: 37 },
	(_, i) =>
		`${String(9 + Math.floor(i / 4)).padStart(2, "0")}:${String((i % 4) * 15).padStart(2, "0")}`
);
const events = [
	["Team Sync Meeting", "团队同步会议", "09:00", "10:00"],
	["Design Review", "设计评审", "11:30", "12:30"],
	["Client Presentation", "客户演示", "14:00", "15:00"],
] as const;
const traffic = [
	178, 470, 103, 439, 88, 294, 323, 385, 438, 155, 92, 492, 81, 426, 307, 371, 475, 107, 341, 408,
	169, 448, 149, 103, 480, 132, 454, 189, 103, 446,
].map((visitors, i) => ({ day: i + 1, visitors }));
const total = traffic.reduce((sum, { visitors }) => sum + visitors, 0);

const rangeSamples: Record<string, DateRange | undefined> = {
	"calendar-04": { start: date(9), end: date(26) },
	"calendar-05": { start: date(12), end: date(15, 7) },
	"calendar-06": { start: date(12), end: date(26) },
	"calendar-07": { start: date(18), end: date(7, 7) },
	"calendar-09": { start: date(17), end: date(20) },
	"calendar-11": { start: date(17), end: date(20) },
	"calendar-12": { start: date(9, 9), end: date(17, 9) },
	"calendar-21": { start: date(12), end: date(17) },
	"calendar-27": { start: date(5), end: date(20) },
	"calendar-30": { start: date(4), end: date(10) },
};
const appointmentLanguage = ref<"es" | "en">("es");
const caption = ref<(typeof captionOptions)[number]>("dropdown");
const selected = shallowRef<DateValue>();
const placeholder = shallowRef<DateValue>(date(12));
const several = shallowRef<DateValue[]>([]);
const range = shallowRef<DateRange>();
const time = ref("10:00");
const open = ref(false);
const endOpen = ref(false);
const endDate = shallowRef<DateValue>();
const input = ref("");

function format(value?: DateValue, options?: Intl.DateTimeFormatOptions) {
	return value?.toDate(getLocalTimeZone()).toLocaleDateString(language.value, options) ?? "";
}

watch(
	() => props.block,
	(block) => {
		selected.value =
			block === "calendar-28"
				? date(1)
				: block === "calendar-29"
					? localToday().add({ days: 2 })
					: /^calendar-(?:0[1-9]|1[0-9]|20|21|31)$/.test(block)
						? date(12)
						: undefined;
		placeholder.value = selected.value ?? date(12);
		several.value = [date(12), date(24, 7)];
		range.value = rangeSamples[block];
		input.value =
			block === "calendar-29" ? t("In 2 days", "两天后") : format(selected.value, longDate);
		open.value = endOpen.value = false;
		endDate.value = undefined;
		caption.value = "dropdown";
		time.value = "10:00";
		appointmentLanguage.value = "es";
	},
	{ immediate: true }
);

const selectDate = computed(() => t("Select date", "选择日期"));
const from = computed(() => t("From", "开始时间"));
const to = computed(() => t("To", "结束时间"));
const birthday = computed(() => t("Date of birth", "出生日期"));
const stay = computed(() => t("Select your stay", "选择入住日期"));
const common = computed(() => ({ locale: language.value, weekStartsOn: 1 as const }));
const note = computed(
	() =>
		(
			({
				"calendar-06": t("A minimum of 5 days is required", "至少需要选择 5 天"),
				"calendar-07": t("Your stay must be between 2 and 20 nights", "入住须为 2 至 20 晚"),
				"calendar-09": t("Your stay cannot extend through the weekend", "入住日期不能跨越周末"),
				"calendar-11": t("We are open in June and July only.", "我们仅在六月和七月开放。"),
			}) as Record<string, string>
		)[props.block]
);
const captionLabels = computed(() => ({
	dropdown: t("Month and Year", "月份和年份"),
	"dropdown-months": t("Month Only", "仅月份"),
	"dropdown-years": t("Year Only", "仅年份"),
}));
const presets = computed(
	() =>
		[
			[0, t("Today", "今天")],
			[1, t("Tomorrow", "明天")],
			[3, t("In 3 days", "3 天后")],
			[7, t("In a week", "一周后")],
			[14, t("In 2 weeks", "两周后")],
		] as const
);
const pickerFields = computed(() =>
	props.block === "calendar-26"
		? ([
				{ key: "start", label: t("Check-in", "入住"), width: "w-full", timeLabel: from.value },
				{ key: "end", label: t("Check-out", "退房"), width: "w-full", timeLabel: to.value },
			] as const)
		: ([
				{
					key: "start",
					label: props.block === "calendar-22" ? birthday.value : t("Date", "日期"),
					width:
						props.block === "calendar-22"
							? "w-48"
							: props.block === "calendar-24"
								? "w-32"
								: "w-full",
					timeLabel: props.block === "calendar-24" ? t("Time", "时间") : undefined,
				},
			] as const)
);

function icon(name: "chevron" | "clock" | "calendar" | "calendar-plus" | "plus") {
	const path = (d: string) => h("path", { d });
	const children =
		name === "chevron"
			? [path("m6 9 6 6 6-6")]
			: name === "clock"
				? [h("circle", { cx: 12, cy: 12, r: 10 }), path("M12 6v6l4 2")]
				: name === "plus"
					? [path("M12 5v14M5 12h14")]
					: [
							h("rect", { x: 3, y: 5, width: 18, height: 16, rx: 2 }),
							path("M16 3v4M8 3v4M3 10h18"),
							...(name === "calendar-plus" ? [path("M12 13v5m-2.5-2.5h5")] : []),
						];
	return h(
		"svg",
		{
			"aria-hidden": "true",
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			"stroke-width": "2",
			"stroke-linecap": "round",
			"stroke-linejoin": "round",
			class: "size-4 shrink-0",
		},
		children
	);
}

function TimeField({
	label,
	end,
	clock,
	hidden,
}: {
	label: string;
	end?: boolean;
	clock?: boolean;
	hidden?: "sr-only" | "invisible";
}) {
	const control = `${id}-${end ? "end" : "start"}-time`;
	return h("div", { class: "flex min-w-0 flex-col gap-3" }, [
		h(Label, { for: control, class: hidden }, () => label),
		h("div", { class: "relative" }, [
			clock
				? h(
						"span",
						{
							class:
								"pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground",
						},
						[icon("clock")]
					)
				: null,
			h(Input, {
				id: control,
				"aria-label": hidden === "invisible" ? label : undefined,
				type: "time",
				step: "1",
				defaultValue: end ? "12:30:00" : "10:30:00",
				class: `${timeInput} ${clock ? "ps-8" : ""}`,
			}),
		]),
	]);
}

function jump(days: number) {
	placeholder.value = selected.value = localToday().add({ days });
}

function booked(day: DateValue) {
	return (
		day.compare(date(props.block === "calendar-20" ? 17 : 15)) >= 0 &&
		day.compare(date(props.block === "calendar-20" ? 19 : 26)) <= 0
	);
}

function updateMultiple(value: DateValue | DateValue[] | undefined) {
	if (Array.isArray(value) && value.length <= 5) several.value = value;
}

function updateRange(value: DateRange) {
	const { start, end } = value;
	if (start && end) {
		// Svelte's range bounds count both dates. Reka does not provide a minimum.
		const days = Math.round((+end.toDate("UTC") - +start.toDate("UTC")) / 86_400_000) + 1;
		const invalid =
			(props.block === "calendar-06" && days < 5) ||
			(props.block === "calendar-07" && (days < 2 || days > 20));
		if (invalid) {
			const prior = range.value?.start;
			range.value = { start: prior && start.compare(prior) === 0 ? end : start, end: undefined };
			return;
		}
	}
	range.value = value;
}

function rangeLabel(compact = false) {
	if (!range.value?.start || !range.value.end) return undefined;
	const { start, end } = range.value;
	return compact
		? new Intl.DateTimeFormat(language.value, shortDate).formatRange(
				start.toDate(getLocalTimeZone()),
				end.toDate(getLocalTimeZone())
			)
		: `${format(start)} – ${format(end)}`;
}

function isoWeek(day: DateValue) {
	const thursday = day.add({ days: 3 - getDayOfWeek(day, "en-GB") });
	return (
		Math.floor(
			(+thursday.toDate("UTC") - +thursday.set({ month: 1, day: 1 }).toDate("UTC")) / 604_800_000
		) + 1
	);
}

// The SDK's high-level RangeCalendar has no custom day slot; use its public grid
// pieces with the Reka root so prices keep the original range state and keyboard behavior.
const months = Array.from({ length: 12 }, (_, month) => month + 1);
const years = Array.from({ length: 111 }, (_, i) => localToday().year - 100 + i);
const monthLabel = (month: number) => format(date(1, month), { month: "long" });
const price = (day: DateValue) => (weekend(day) ? "$220" : "$100");

function setPickerOpen(key: "start" | "end", value: boolean) {
	(key === "end" ? endOpen : open).value = value;
}

function choose(key: "start" | "end", value?: DateValue) {
	if (key === "end") endDate.value = value;
	else {
		selected.value = value;
		if (value && endDate.value && endDate.value.compare(value) < 0) endDate.value = undefined;
	}
	setPickerOpen(key, false);
}

function changeInput(value: string | number) {
	const text = String(value);
	input.value = text;
	const natural = props.block === "calendar-29";
	const iso = /^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?$/.exec(text.trim());
	if (iso) {
		const next = new CalendarDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
		if (
			next.year === Number(iso[1]) &&
			next.month === Number(iso[2]) &&
			next.day === Number(iso[3])
		)
			selected.value = next;
		return;
	}
	const parsed = natural
		? ((props.chinese ? zh.hans.parseDate(text) : null) ?? en.parseDate(text))
		: new Date(text);
	if (parsed && !Number.isNaN(+parsed))
		selected.value = new CalendarDate(
			parsed.getFullYear(),
			parsed.getMonth() + 1,
			parsed.getDate()
		);
}

function openFromInput(event: KeyboardEvent) {
	if (event.key === "ArrowDown" && !event.isComposing) {
		event.preventDefault();
		open.value = true;
	}
}

const chartConfig = computed(() => ({
	visitors: { label: t("Visitors", "访客"), color: "var(--primary)" },
}));
const chart = computed(() =>
	traffic.filter(
		({ day }) =>
			!range.value?.start ||
			!range.value.end ||
			(range.value.start.day <= day && day <= range.value.end.day)
	)
);
type Traffic = (typeof traffic)[number];
const chartX = ({ day }: Traffic) => day;
const chartY = ({ visitors }: Traffic) => visitors;
const tooltip = componentToString(chartConfig.value, ChartTooltipContent, {
	labelFormatter: (day) =>
		typeof day === "number"
			? format(date(day), longDate)
			: day.toLocaleDateString(language.value, longDate),
});
</script>

<template>
	<div class="@container/preview w-full min-w-0">
		<div :key="block" class="flex justify-center">
			<Calendar
				v-if="
					['calendar-01', 'calendar-02', 'calendar-08', 'calendar-14', 'calendar-18'].includes(
						block
					)
				"
				v-model="selected"
				v-model:placeholder="placeholder"
				v-bind="common"
				:class="[framed, block === 'calendar-18' && wholeMonth]"
				:number-of-months="block === 'calendar-02' ? 2 : 1"
				:min-value="block === 'calendar-08' ? date(12) : undefined"
				:is-date-unavailable="block === 'calendar-14' ? booked : undefined"
			/>

			<Calendar
				v-else-if="block === 'calendar-03'"
				v-bind="common"
				:model-value="several"
				:default-placeholder="date(12)"
				multiple
				:number-of-months="2"
				:class="framed"
				@update:model-value="updateMultiple"
			/>

			<div
				v-else-if="
					[
						'calendar-04',
						'calendar-05',
						'calendar-06',
						'calendar-07',
						'calendar-09',
						'calendar-11',
					].includes(block)
				"
				class="flex max-w-full flex-col items-center gap-2"
			>
				<RangeCalendar
					v-bind="common"
					:model-value="range"
					:default-placeholder="date(12)"
					:class="framed"
					:number-of-months="['calendar-04', 'calendar-06'].includes(block) ? 1 : 2"
					:is-date-disabled="block === 'calendar-09' ? weekend : undefined"
					:is-date-unavailable="block === 'calendar-09' ? weekend : undefined"
					:min-value="block === 'calendar-11' ? date(1) : undefined"
					:max-value="block === 'calendar-11' ? date(31, 7) : undefined"
					@update:model-value="updateRange"
				/>
				<div v-if="note" class="text-center text-xs text-muted-foreground">{{ note }}</div>
			</div>

			<Card v-else-if="block === 'calendar-10'" class="w-fit max-w-full">
				<CardHeader
					><CardTitle>{{ t("Appointment", "预约") }}</CardTitle
					><CardDescription>{{ t("Find a date.", "选择日期。") }}</CardDescription
					><CardAction
						><Button size="sm" variant="outline" @click="jump(0)">{{
							t("Today", "今天")
						}}</Button></CardAction
					></CardHeader
				>
				<CardContent
					><Calendar
						v-model="selected"
						v-model:placeholder="placeholder"
						v-bind="common"
						:class="plain"
				/></CardContent>
			</Card>

			<Card v-else-if="block === 'calendar-12'" class="w-fit max-w-full">
				<CardHeader
					><CardTitle>{{
						appointmentLanguage === "es" ? "Reserva una cita" : "Book an appointment"
					}}</CardTitle
					><CardDescription>{{
						appointmentLanguage === "es"
							? "Selecciona las fechas para tu cita"
							: "Select the dates for your appointment"
					}}</CardDescription
					><CardAction
						><Select v-model="appointmentLanguage"
							><SelectTrigger class="w-[100px]" :aria-label="t('Select language', '选择语言')">{{
								appointmentLanguage === "es" ? "Español" : "English"
							}}</SelectTrigger
							><SelectContent align="end"
								><SelectItem value="en">English</SelectItem
								><SelectItem value="es">Español</SelectItem></SelectContent
							></Select
						></CardAction
					></CardHeader
				>
				<CardContent
					><RangeCalendar
						v-model="range"
						v-bind="common"
						:locale="appointmentLanguage"
						:number-of-months="2"
						:default-placeholder="date(9, 9)"
						:class="[plain, '[&_nav_button]:border-[0.5px] [&_nav_button]:border-border']"
				/></CardContent>
			</Card>

			<div v-else-if="block === 'calendar-13'" class="flex max-w-full flex-col gap-4">
				<Calendar
					v-model="selected"
					v-model:placeholder="placeholder"
					v-bind="common"
					:class="framed"
					:caption-layout="caption"
				/>
				<div class="flex flex-col gap-3">
					<Label :for="`${id}-caption`" class="px-1">{{ t("Dropdown", "下拉选项") }}</Label
					><Select v-model="caption"
						><SelectTrigger :id="`${id}-caption`" size="sm" class="w-full bg-background">{{
							captionLabels[caption]
						}}</SelectTrigger
						><SelectContent
							><SelectItem v-for="option in captionOptions" :key="option" :value="option">{{
								captionLabels[option]
							}}</SelectItem></SelectContent
						></Select
					>
				</div>
			</div>

			<CalendarRoot
				v-else-if="block === 'calendar-15'"
				v-slot="{ grid, weekDays }"
				v-model="selected"
				v-model:placeholder="placeholder"
				v-bind="common"
				weekday-format="short"
				data-slot="calendar"
				:class="['relative bg-background p-2', framed, calendarTokens]"
			>
				<CalendarHeader
					><CalendarHeading />
					<nav class="pointer-events-none absolute inset-x-0 top-0 flex justify-between">
						<CalendarPrevButton /><CalendarNextButton /></nav
				></CalendarHeader>
				<CalendarGrid v-for="month in grid" :key="month.value.toString()" class="mt-4">
					<CalendarGridHead
						><CalendarGridRow
							><CalendarHeadCell :aria-label="t('Week', '周')">{{ t("Wk", "周") }}</CalendarHeadCell
							><CalendarHeadCell v-for="day in weekDays" :key="day">{{
								day
							}}</CalendarHeadCell></CalendarGridRow
						></CalendarGridHead
					>
					<CalendarGridBody
						><CalendarGridRow v-for="row in month.rows" :key="row[0].toString()" class="mt-2 w-full"
							><th
								scope="row"
								:aria-label="t(`Week ${isoWeek(row[0])}`, `第 ${isoWeek(row[0])} 周`)"
								class="grid size-(--cell-size) shrink-0 place-items-center text-xs font-normal text-muted-foreground tabular-nums"
							>
								{{ isoWeek(row[0]) }}
							</th>
							<CalendarCell v-for="day in row" :key="day.toString()" :date="day"
								><CalendarCellTrigger
									:day="day"
									:month="month.value" /></CalendarCell></CalendarGridRow
					></CalendarGridBody>
				</CalendarGrid>
			</CalendarRoot>

			<Card
				v-else-if="block === 'calendar-16' || block === 'calendar-17'"
				class="w-fit max-w-full py-4"
			>
				<CardContent class="px-4"
					><Calendar
						v-model="selected"
						v-model:placeholder="placeholder"
						v-bind="common"
						:class="[
							plain,
							block === 'calendar-17' && '[--cell-size:min(42px,calc((100cqw-34px)/7))]!',
						]"
				/></CardContent>
				<CardFooter
					:class="
						block === 'calendar-16'
							? 'grid gap-6 border-t px-4 pt-4!'
							: 'grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 border-t px-4 pt-4!'
					"
				>
					<TimeField
						:label="t('Start Time', '开始时间')"
						:clock="block === 'calendar-16'"
						:hidden="block === 'calendar-17' ? 'sr-only' : undefined"
					/><span v-if="block === 'calendar-17'" aria-hidden="true">-</span
					><TimeField
						:label="t('End Time', '结束时间')"
						:end="true"
						:clock="block === 'calendar-16'"
						:hidden="block === 'calendar-17' ? 'sr-only' : undefined"
					/>
				</CardFooter>
			</Card>

			<Card v-else-if="block === 'calendar-19'" class="w-fit max-w-[min(300px,100%)] py-4">
				<CardContent class="px-4"
					><Calendar
						v-model="selected"
						v-model:placeholder="placeholder"
						v-bind="common"
						:class="[plain, '[--cell-size:min(38px,calc((100cqw-34px)/7))]!']"
				/></CardContent>
				<CardFooter class="flex-wrap gap-2 border-t px-4 pt-4!"
					><Button
						v-for="[days, label] in presets"
						:key="days"
						variant="outline"
						size="sm"
						class="flex-1"
						@click="jump(days)"
						>{{ label }}</Button
					></CardFooter
				>
			</Card>

			<Card v-else-if="block === 'calendar-20'" class="w-fit max-w-full gap-0 p-0">
				<CardContent class="relative p-0 @xl/preview:pe-48"
					><div class="p-6">
						<Calendar
							v-model="selected"
							v-model:placeholder="placeholder"
							v-bind="common"
							:is-date-unavailable="booked"
							:class="[
								plain,
								'[--cell-size:min(40px,calc((100cqw-50px)/7))]! @xl/preview:[--cell-size:48px]! [&_button[data-outside-view]]:invisible',
							]"
						/>
					</div>
					<div
						class="grid max-h-72 gap-2 overflow-y-auto border-t p-6 @xl/preview:absolute @xl/preview:inset-y-0 @xl/preview:end-0 @xl/preview:max-h-none @xl/preview:w-48 @xl/preview:border-s @xl/preview:border-t-0"
						:aria-label="t('Meeting times', '会议时间')"
						role="group"
					>
						<Button
							v-for="slot in times"
							:key="slot"
							:aria-pressed="time === slot"
							:variant="time === slot ? 'default' : 'outline'"
							class="w-full shadow-none"
							@click="time = slot"
							>{{ slot }}</Button
						>
					</div></CardContent
				>
				<CardFooter class="flex-col gap-4 border-t px-6 py-5! @xl/preview:flex-row"
					><div aria-live="polite" class="text-sm">
						<template v-if="selected"
							>{{ t("Your meeting is booked for", "会议已预约在") }}
							<strong>{{
								format(selected, { weekday: "long", day: "numeric", month: "short" })
							}}</strong>
							{{ t("at", "") }} <strong>{{ time }}</strong
							>{{ t(".", "。") }}</template
						><template v-else>{{
							t("Select a date and time for your meeting.", "请选择会议日期和时间。")
						}}</template>
					</div>
					<Button
						:disabled="!selected"
						class="w-full @xl/preview:ms-auto @xl/preview:w-auto"
						variant="outline"
						>{{ t("Continue", "继续") }}</Button
					></CardFooter
				>
			</Card>

			<RangeCalendarRoot
				v-else-if="block === 'calendar-21'"
				v-slot="{ grid, weekDays, date: visible }"
				v-model="range"
				v-model:placeholder="placeholder"
				v-bind="common"
				weekday-format="short"
				data-slot="range-calendar"
				:class="['relative bg-background p-3', framed, calendarTokens, priceCells]"
			>
				<nav class="pointer-events-none absolute inset-x-3 top-3 flex justify-between">
					<RangeCalendarPrevButton /><RangeCalendarNextButton />
				</nav>
				<div class="@container/range w-[calc(var(--cell-size)*7)] max-w-full">
					<RangeCalendarHeader class="@max-[286px]/range:mt-[calc(var(--cell-size)+0.5rem)]"
						><div class="flex items-center justify-center gap-2">
							<Select
								:model-value="String(visible.month)"
								@update:model-value="
									(value) => (placeholder = placeholder.set({ month: Number(value) }))
								"
								><SelectTrigger size="sm" :aria-label="t('Month', '月份')">{{
									monthLabel(visible.month)
								}}</SelectTrigger
								><SelectContent class="max-h-60"
									><SelectItem v-for="month in months" :key="month" :value="String(month)">{{
										monthLabel(month)
									}}</SelectItem></SelectContent
								></Select
							>
							<Select
								:model-value="String(visible.year)"
								@update:model-value="
									(value) => (placeholder = placeholder.set({ year: Number(value) }))
								"
								><SelectTrigger size="sm" :aria-label="t('Year', '年份')">{{
									visible.year
								}}</SelectTrigger
								><SelectContent class="max-h-60"
									><SelectItem v-for="year in years" :key="year" :value="String(year)">{{
										year
									}}</SelectItem></SelectContent
								></Select
							>
						</div></RangeCalendarHeader
					>
				</div>
				<RangeCalendarGrid v-for="month in grid" :key="month.value.toString()" class="mt-4"
					><RangeCalendarGridHead
						><RangeCalendarGridRow
							><RangeCalendarHeadCell v-for="day in weekDays" :key="day">{{
								day
							}}</RangeCalendarHeadCell></RangeCalendarGridRow
						></RangeCalendarGridHead
					><RangeCalendarGridBody
						><RangeCalendarGridRow
							v-for="row in month.rows"
							:key="row[0].toString()"
							class="mt-2 w-full"
							><RangeCalendarCell v-for="day in row" :key="day.toString()" :date="day"
								><RangeCalendarCellTrigger
									:day="day"
									:month="month.value"
									:aria-label="`${format(day, longDate)}${isEqualMonth(day, month.value) ? `, ${price(day)}` : ''}`"
									class="flex-col gap-0.5 leading-none"
									><span>{{ day.day }}</span
									><span v-if="isEqualMonth(day, month.value)" aria-hidden="true" class="text-xs">{{
										price(day)
									}}</span></RangeCalendarCellTrigger
								></RangeCalendarCell
							></RangeCalendarGridRow
						></RangeCalendarGridBody
					></RangeCalendarGrid
				>
			</RangeCalendarRoot>

			<div
				v-else-if="['calendar-22', 'calendar-24', 'calendar-25', 'calendar-26'].includes(block)"
				class="grid max-w-full gap-6"
			>
				<div
					v-for="field in pickerFields"
					:key="field.key"
					:class="[
						'grid gap-4',
						field.timeLabel &&
							(block === 'calendar-24'
								? 'grid-cols-[minmax(0,auto)_minmax(0,1fr)]'
								: 'grid-cols-2'),
					]"
				>
					<div class="flex min-w-0 flex-col gap-3">
						<Label :for="`${id}-${field.key}`" class="px-1">{{ field.label }}</Label
						><Popover
							:open="field.key === 'end' ? endOpen : open"
							@update:open="(value) => setPickerOpen(field.key, value)"
							><PopoverTrigger as-child
								><Button
									:id="`${id}-${field.key}`"
									variant="outline"
									:class="[field.width, 'max-w-full justify-between font-normal']"
									>{{
										format(
											field.key === "end" ? endDate : selected,
											block === "calendar-26" ? shortDate : undefined
										) || selectDate
									}}<component :is="icon('chevron')" /></Button></PopoverTrigger
							><PopoverContent :class="panel" align="start"
								><Calendar
									v-bind="common"
									:model-value="field.key === 'end' ? endDate : selected"
									:default-placeholder="
										field.key === 'end'
											? (endDate ?? selected ?? localToday())
											: (selected ?? localToday())
									"
									:max-value="block === 'calendar-22' ? localToday() : undefined"
									:is-date-disabled="
										field.key === 'end'
											? (day) => Boolean(selected && day.compare(selected) < 0)
											: undefined
									"
									caption-layout="dropdown"
									@update:model-value="(value) => choose(field.key, value)" /></PopoverContent
						></Popover>
					</div>
					<TimeField
						v-if="field.timeLabel"
						:label="field.timeLabel"
						:end="field.key === 'end'"
						:hidden="block === 'calendar-26' ? 'invisible' : undefined"
					/>
				</div>
				<div v-if="block === 'calendar-25'" class="grid grid-cols-2 gap-4">
					<TimeField :label="from" /><TimeField :label="to" :end="true" />
				</div>
			</div>

			<div
				v-else-if="block === 'calendar-23' || block === 'calendar-30'"
				class="flex flex-col gap-3"
			>
				<Label :for="`${id}-stay`" class="px-1">{{ stay }}</Label
				><Popover
					><PopoverTrigger as-child
						><Button
							:id="`${id}-stay`"
							variant="outline"
							class="w-56 max-w-full justify-between font-normal"
							>{{ rangeLabel(block === "calendar-30") ?? selectDate
							}}<component :is="icon('chevron')" /></Button></PopoverTrigger
					><PopoverContent :class="panel" align="start"
						><RangeCalendar
							v-model="range"
							v-bind="common"
							:default-placeholder="range?.start ?? localToday()"
							caption-layout="dropdown" /></PopoverContent
				></Popover>
			</div>

			<Card v-else-if="block === 'calendar-27'" class="@container/card w-full max-w-xl"
				><CardHeader class="flex flex-col border-b @md/card:grid"
					><CardTitle>{{ t("Web Analytics", "网站分析") }}</CardTitle
					><CardDescription>{{
						t("Showing total visitors for this month.", "显示本月访客总数。")
					}}</CardDescription
					><CardAction class="mt-2 @md/card:mt-0"
						><Popover
							><PopoverTrigger as-child
								><Button variant="outline"
									><component :is="icon('calendar')" />{{
										rangeLabel() ?? t("June 2025", "2025 年 6 月")
									}}</Button
								></PopoverTrigger
							><PopoverContent :class="panel" align="end"
								><RangeCalendar
									v-model="range"
									v-bind="common"
									:default-placeholder="date(1)"
									:min-value="date(1)"
									:max-value="date(30)"
									fixed-weeks /></PopoverContent></Popover></CardAction
				></CardHeader>
				<CardContent class="px-4"
					><ChartContainer
						:config="chartConfig"
						class="aspect-auto h-[250px] w-full"
						role="img"
						:aria-label="
							t('Daily visitors in the selected date range', '所选日期范围内的每日访客数')
						"
						><VisXYContainer :data="chart" :height="250"
							><VisGroupedBar
								:x="chartX"
								:y="chartY"
								color="var(--color-visitors)"
								:rounded-corners="4" /><VisAxis
								type="x"
								:grid-line="false"
								:domain-line="false"
								:tick-line="false"
								:tick-values="chart.map(chartX)"
								:tick-format="(day: number) => String(day)" /><ChartTooltip /><ChartCrosshair
								:template="tooltip"
								color="var(--color-visitors)" /></VisXYContainer></ChartContainer
				></CardContent>
				<CardFooter class="border-t text-sm"
					><span
						>{{ t("You had", "六月共有") }} <strong>{{ total.toLocaleString(language) }}</strong>
						{{ t("visitors for the month of June.", "位访客。") }}</span
					></CardFooter
				>
			</Card>

			<div
				v-else-if="block === 'calendar-28' || block === 'calendar-29'"
				class="flex max-w-full flex-col gap-3"
			>
				<Label :for="`${id}-date`" class="px-1">{{
					block === "calendar-29"
						? t("Schedule Date", "发布日期")
						: t("Subscription Date", "订阅日期")
				}}</Label>
				<div class="relative flex gap-2">
					<Input
						:id="`${id}-date`"
						:model-value="input"
						:placeholder="
							block === 'calendar-29'
								? t('Tomorrow or next week', '明天或下周三')
								: format(date(1), longDate)
						"
						class="bg-background pe-10"
						@update:model-value="changeInput"
						@keydown="openFromInput"
					/><Popover v-model:open="open"
						><PopoverTrigger as-child
							><Button
								size="icon-xs"
								variant="ghost"
								:aria-label="selectDate"
								class="absolute end-2 top-1/2 -translate-y-1/2"
								><component :is="icon('calendar')" /></Button></PopoverTrigger
						><PopoverContent :class="panel" align="end" :align-offset="-8" :side-offset="10"
							><Calendar
								v-bind="common"
								:model-value="selected"
								:default-placeholder="selected ?? localToday()"
								caption-layout="dropdown"
								@update:model-value="
									(value) => {
										choose('start', value);
										input = format(value, longDate);
									}
								" /></PopoverContent
					></Popover>
				</div>
				<div
					v-if="block === 'calendar-29'"
					class="px-1 text-sm text-muted-foreground"
					aria-live="polite"
				>
					{{ t("Your post will be published on", "文章将发布于") }}
					<strong>{{ format(selected, longDate) }}</strong
					>{{ t(".", "。") }}
				</div>
			</div>

			<Card v-else-if="block === 'calendar-31'" class="w-fit max-w-full py-4"
				><CardContent class="px-4"
					><Calendar
						v-model="selected"
						v-model:placeholder="placeholder"
						v-bind="common"
						:class="plain"
						prevent-deselect /></CardContent
				><CardFooter class="flex-col items-start gap-3 border-t px-4 pt-4!"
					><div class="flex w-full items-center justify-between px-1">
						<div class="text-sm font-medium">
							{{ format(selected, { ...longDate, day: "numeric" }) }}
						</div>
						<Button
							:aria-label="t('Add Event', '添加活动')"
							:title="t('Add Event', '添加活动')"
							variant="ghost"
							size="icon-xs"
							><component :is="icon('plus')"
						/></Button>
					</div>
					<div class="flex w-full flex-col gap-2">
						<div
							v-for="[en, zh, start, end] in events"
							:key="en"
							class="relative rounded-md bg-muted p-2 ps-6 text-sm after:absolute after:inset-y-2 after:start-2 after:w-1 after:rounded-full after:bg-primary/70"
						>
							<div class="font-medium">{{ t(en, zh) }}</div>
							<div class="text-xs text-muted-foreground">
								{{
									new Intl.DateTimeFormat(language, {
										month: "short",
										day: "numeric",
										hour: "numeric",
										minute: "numeric",
									}).formatRange(
										new Date(`2025-06-12T${start}:00`),
										new Date(`2025-06-12T${end}:00`)
									)
								}}
							</div>
						</div>
					</div></CardFooter
				></Card
			>

			<div v-else-if="block === 'calendar-32'" class="flex flex-col gap-3">
				<Label :for="`${id}-drawer`" class="px-1">{{ birthday }}</Label
				><Drawer v-model:open="open"
					><DrawerTrigger as-child
						><Button
							:id="`${id}-drawer`"
							variant="outline"
							class="w-48 max-w-full justify-between font-normal"
							>{{ format(selected) || selectDate
							}}<component :is="icon('calendar-plus')" /></Button></DrawerTrigger
					><DrawerContent class="overflow-auto p-0"
						><DrawerHeader class="sr-only"
							><DrawerTitle>{{ selectDate }}</DrawerTitle
							><DrawerDescription>{{
								t("Set your date of birth", "设置你的出生日期")
							}}</DrawerDescription></DrawerHeader
						><Calendar
							v-bind="common"
							:model-value="selected"
							:default-placeholder="selected ?? localToday()"
							class="mx-auto w-fit [--cell-size:clamp(28px,calc(100vw/7.5),52px)]!"
							caption-layout="dropdown"
							@update:model-value="
								(value) => {
									selected = value;
									if (value) open = false;
								}
							" /></DrawerContent
				></Drawer>
				<div class="px-1 text-sm text-muted-foreground">
					{{ t("This example works best on mobile.", "此示例在移动设备上的体验最佳。") }}
				</div>
			</div>
		</div>
	</div>
</template>
