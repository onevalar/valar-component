"use client";

import * as React from "react";
import { cn } from "cn";
import { CalendarIcon } from "lucide-react";
import { TZDate } from "react-day-picker";
import { enUS, zhCN } from "react-day-picker/locale";
import { Button, buttonVariants } from "./button.tsx";
import { Calendar } from "./calendar.tsx";
import {
	dateLabel,
	examples,
	grains,
	inferTimeframe,
	inputValue,
	labels,
	periodOptions,
	rangeError,
	timeframeEnd,
	utcDate,
	type Grain,
	type Timeframe,
} from "./date-picker-value.ts";
import { Input } from "./input.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.tsx";

export {
	dateLabel,
	grains,
	inferTimeframe,
	parseTimeframe,
	timeframeEnd,
} from "./date-picker-value.ts";
export type { Grain, Timeframe } from "./date-picker-value.ts";

const dayMs = 86_400_000;

function addDays(date: Date, days: number) {
	return new TZDate(+date + days * dayMs, "UTC");
}

// TZDate's field setters can cross a skipped day in the browser's own time zone.
// Keep DayPicker's civil-day stepping and comparison on UTC timestamps.
const civilDayMath = {
	addDays,
	addWeeks: (date: Date, weeks: number) => addDays(date, 7 * weeks),
	differenceInCalendarDays: (a: Date, b: Date) => Math.floor(+a / dayMs) - Math.floor(+b / dayMs),
	isSameDay: (a: Date, b: Date) => Math.floor(+a / dayMs) === Math.floor(+b / dayMs),
};

export type DatePickerProps = Omit<
	React.ComponentProps<"button">,
	"children" | "value" | "defaultValue" | "type" | "dir"
> & {
	label: string;
	placeholder?: string;
	value?: Timeframe;
	defaultValue?: Timeframe;
	min?: Timeframe;
	max?: Timeframe;
	locale?: string;
	precisions?: readonly Grain[];
	allowClear?: boolean;
	dir?: "ltr" | "rtl";
	portalProps?: React.ComponentProps<typeof PopoverContent>["portalProps"];
	onValueChange?: (value: Timeframe | undefined) => void;
};

export function DatePicker(props: DatePickerProps) {
	const {
		label,
		placeholder = label,
		value: controlledValue,
		defaultValue,
		min,
		max,
		locale = "en",
		precisions = grains,
		allowClear = true,
		portalProps,
		className,
		onValueChange,
		dir,
		"aria-describedby": describedBy,
		...triggerProps
	} = props;
	const controlled = "value" in props;
	const [localValue, setLocalValue] = React.useState(defaultValue);
	const value = controlled ? controlledValue : localValue;
	const [open, setOpen] = React.useState(false);
	const [activeGrain, setGrain] = React.useState<Grain>("day");
	const [year, setYear] = React.useState(1);
	const [typed, setTyped] = React.useState("");
	const [error, setError] = React.useState("");
	const input = React.useRef<HTMLInputElement>(null);
	const composing = React.useRef(false);
	const valueId = React.useId();
	const chinese = locale.toLowerCase().startsWith("zh");
	const available = precisions.length ? precisions : grains;
	const grain = available.includes(activeGrain) ? activeGrain : available[0];
	const minDate = min?.date;
	const maxDate = max && timeframeEnd(max);
	const currentLabel = value && dateLabel(value, locale);
	const prompt =
		available.length === 1
			? examples[available[0]]
			: chinese
				? "试试 2027-05、Q4 或 2027-05-20"
				: "Try: May 2027, Q4, 05/20/2027";

	function changeOpen(next: boolean) {
		composing.current = false;
		if (next) {
			const anchor = value ?? min ?? max;
			setYear(anchor ? Number(anchor.date.slice(0, 4)) : new Date().getFullYear());
			setGrain(value && available.includes(value.grain) ? value.grain : available[0]);
			setTyped(value ? inputValue(value) : "");
			setError("");
		}
		setOpen(next);
	}

	function commit(next: Timeframe | undefined) {
		if (!controlled) setLocalValue(next);
		onValueChange?.(next);
		changeOpen(false);
	}

	function choose(next: Timeframe) {
		const issue = rangeError(next, minDate, maxDate, chinese);
		setError(issue);
		if (!issue) commit(next);
	}

	function chooseTyped(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key !== "Enter" || isComposing(event.nativeEvent)) return;
		event.preventDefault();
		const text = event.currentTarget.value;
		if (!text.trim() && value && allowClear) return commit(undefined);
		const next = inferTimeframe(text, year);
		if (!next) setError(chinese ? "请输入有效日期。" : "Enter a valid date.");
		else if (!available.includes(next.grain))
			setError(chinese ? "请选择允许的日期精度。" : "Choose an available date precision.");
		else choose(next);
	}

	function isComposing(event: KeyboardEvent) {
		return composing.current || event.isComposing || event.keyCode === 229;
	}

	function changeGrain(next: string) {
		setGrain(next as Grain);
		setTyped(value?.grain === next ? inputValue(value) : "");
		setError("");
	}

	function renderChoices() {
		if (grain === "day") {
			// DayPicker uses UTC as a civil-date adapter; only the definition of "today" is local.
			const now = new Date();
			const today = new Date(0);
			today.setUTCFullYear(now.getFullYear(), now.getMonth(), now.getDate());
			const start = utcDate(minDate ?? "0001-01-01");
			const end = utcDate(maxDate ?? "9999-12-31");
			const reversed = start > end;
			const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
			const caption = new Intl.DateTimeFormat(locale, {
				month: "long",
				year: "numeric",
				timeZone: "UTC",
			});
			const monthButtonClass = cn(
				buttonVariants({ variant: "ghost", size: "icon-sm", shape: "pill" }),
				"size-7 rounded-full p-0 text-(color:--calendar-date-muted) aria-disabled:opacity-50 [&>svg]:size-3.5"
			);
			return (
				<Calendar
					mode="single"
					required
					timeZone="UTC"
					dateLib={civilDayMath}
					today={today}
					weekStartsOn={1}
					fixedWeeks
					aria-label={label}
					dir={dir}
					locale={chinese ? zhCN : enUS}
					selected={value?.grain === "day" ? utcDate(value.date) : undefined}
					defaultMonth={value ? utcDate(value.date) : minDate ? start : maxDate ? end : today}
					startMonth={start}
					endMonth={reversed ? start : end}
					disabled={reversed ? true : [{ before: start }, { after: end }]}
					onSelect={(date) => choose({ date: date.toISOString().slice(0, 10), grain: "day" })}
					formatters={{
						formatWeekdayName: (date) => weekday.format(date),
						formatCaption: (date) => caption.format(date),
					}}
					className="cn-calendar-project-date mx-auto bg-transparent"
					classNames={{
						month: "rdp-month flex w-full min-w-0 flex-col",
						nav: "rdp-nav absolute end-2 top-1 z-10 flex gap-1",
						button_previous: cn("rdp-button_previous", monthButtonClass),
						button_next: cn("rdp-button_next", monthButtonClass),
						month_caption: "rdp-month_caption flex h-9 min-w-0 items-center ps-2 pe-20 text-xs",
						caption_label: "rdp-caption_label min-w-0 truncate",
						month_grid: "rdp-month_grid flex w-full flex-col gap-3 py-3",
						weekdays: "rdp-weekdays flex",
						weekday:
							"rdp-weekday flex h-[27.5px] min-w-0 flex-1 items-center justify-center text-[13px] font-normal text-(color:--calendar-date-weekday)",
						weeks: "rdp-weeks flex flex-col gap-2",
						week: "rdp-week flex w-full",
						day: "rdp-day flex h-[26px] min-w-0 flex-1 items-center justify-center p-0",
					}}
					labels={
						chinese ? { labelPrevious: () => "上个月", labelNext: () => "下个月" } : undefined
					}
				/>
			);
		}
		return (
			<div className="space-y-2 pb-2">
				<div className="flex justify-between">
					<Button
						size="sm"
						variant="ghost"
						disabled={year <= 1}
						onClick={() => setYear(Math.max(1, year - 3))}
						aria-label={chinese ? "前几年" : "Previous years"}
					>
						<span className="rtl:rotate-180" aria-hidden="true">
							‹
						</span>
					</Button>
					<Button
						size="sm"
						variant="ghost"
						disabled={year + 2 >= 9999}
						onClick={() => setYear(year + 3)}
						aria-label={chinese ? "后几年" : "Next years"}
					>
						<span className="rtl:rotate-180" aria-hidden="true">
							›
						</span>
					</Button>
				</div>
				{periodOptions(year, grain, locale).map(({ year: periodYear, options }) => (
					<div className="space-y-1" key={periodYear}>
						{grain !== "year" && <div className="text-xs text-muted-foreground">{periodYear}</div>}
						<div className={cn("grid gap-2", grain === "half" ? "grid-cols-2" : "grid-cols-4")}>
							{options.map(({ value: option, label: optionLabel, text }) => {
								const selected = value?.date === option.date && value.grain === grain;
								return (
									<Button
										key={option.date}
										variant={selected ? "secondary" : "outline"}
										shape="pill"
										size="xs"
										className="cn-date-picker-period"
										disabled={Boolean(rangeError(option, minDate, maxDate, chinese))}
										aria-label={optionLabel}
										aria-pressed={selected}
										onClick={() => choose(option)}
									>
										<span className="min-w-0 truncate">{text}</span>
									</Button>
								);
							})}
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<Popover open={open} onOpenChange={changeOpen}>
			<PopoverTrigger
				{...triggerProps}
				dir={dir}
				aria-label={label}
				aria-describedby={[describedBy, value && valueId].filter(Boolean).join(" ") || undefined}
				data-slot="date-picker-trigger"
				className={cn(
					"inline-flex h-6 max-w-full min-w-0 items-center gap-1 rounded-full border border-border bg-card px-2 text-xs text-muted-foreground hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:opacity-50 aria-expanded:bg-accent",
					className
				)}
			>
				<CalendarIcon className="size-3.5 shrink-0" aria-hidden="true" />
				<span className="truncate">{currentLabel ?? placeholder}</span>
			</PopoverTrigger>
			{value && (
				<span id={valueId} className="sr-only">
					{currentLabel}
				</span>
			)}
			<PopoverContent
				appearance="surface"
				role="dialog"
				aria-label={label}
				dir={dir}
				portalProps={portalProps}
				data-slot="date-picker-content"
				sideOffset={5}
				align="start"
				className="cn-date-picker-content gap-0 pb-0"
				onOpenAutoFocus={(event) => {
					if (!input.current) return;
					event.preventDefault();
					input.current.focus();
					input.current.select();
				}}
				onEscapeKeyDown={(event) => {
					if (isComposing(event)) event.preventDefault();
				}}
			>
				<div className="grid shrink-0 gap-2">
					<div className="text-xs font-medium text-muted-foreground">{label}</div>
					<Input
						ref={input}
						type="text"
						value={typed}
						aria-label={chinese ? "输入日期" : "Enter date"}
						aria-invalid={Boolean(error)}
						aria-describedby={error ? `${valueId}-error` : undefined}
						placeholder={prompt}
						className="cn-date-picker-input"
						onChange={(event) => {
							setTyped(event.currentTarget.value);
							setError("");
						}}
						onCompositionStart={() => {
							composing.current = true;
						}}
						onCompositionEnd={() => {
							composing.current = false;
						}}
						onKeyDown={chooseTyped}
					/>
					{error && (
						<p id={`${valueId}-error`} role="alert" className="text-xs text-destructive">
							{error}
						</p>
					)}
				</div>
				{available.length > 1 ? (
					<Tabs
						value={grain}
						onValueChange={changeGrain}
						dir={dir}
						activationMode="automatic"
						loop={false}
						className="mt-3.5 min-w-0 shrink-0"
					>
						<TabsList
							variant="capsule"
							aria-label={chinese ? "日期粒度" : "Date precision"}
							className="cn-date-picker-precision h-8 w-full overflow-x-auto"
						>
							{available.map((item) => (
								<TabsTrigger
									key={item}
									value={item}
									className="flex-[1_0_auto] text-center leading-tight whitespace-nowrap"
								>
									{labels[item][chinese ? 0 : 1]}
								</TabsTrigger>
							))}
						</TabsList>
						{available.map((item) => (
							<TabsContent
								key={item}
								value={item}
								forceMount={false}
								className="min-w-0 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
							>
								{item === grain && renderChoices()}
							</TabsContent>
						))}
					</Tabs>
				) : (
					renderChoices()
				)}
				{value && allowClear && (
					<div className="flex shrink-0 justify-end border-t border-border py-2">
						<Button size="sm" variant="ghost" onClick={() => commit(undefined)}>
							{chinese ? "清除日期" : "Clear date"}
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
