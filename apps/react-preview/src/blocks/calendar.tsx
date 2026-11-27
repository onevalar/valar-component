"use client";

import { Button } from "@valar/react-ui/button";
import { Calendar, CalendarDayButton } from "@valar/react-ui/calendar";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@valar/react-ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@valar/react-ui/chart";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@valar/react-ui/drawer";
import { Input } from "@valar/react-ui/input";
import { Label } from "@valar/react-ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@valar/react-ui/popover";
import { RangeCalendar } from "@valar/react-ui/range-calendar";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@valar/react-ui/select";
import { en, zh } from "chrono-node";
import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { enUS, es, zhCN } from "react-day-picker/locale";
import { Bar, BarChart, XAxis } from "recharts";

type Props = { block: string; chinese?: boolean };
type Range = ComponentProps<typeof RangeCalendar>["selected"];
type OptionalRangeProps = Extract<ComponentProps<typeof RangeCalendar>, { required?: false }>;

const date = (day: number, month = 6) => new Date(2025, month - 1, day);
const shortDate = { day: "2-digit", month: "short", year: "numeric" } as const;
const longDate = { day: "2-digit", month: "long", year: "numeric" } as const;
const weekend = (day: Date) => day.getDay() === 0 || day.getDay() === 6;
const framed = "w-fit! max-w-full rounded-lg border-[0.5px] shadow-sm";
const plain = "w-fit! bg-transparent p-0!";
const panel = "w-auto max-w-[calc(100vw-1rem)] overflow-auto p-0!";
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

const rangeSamples = {
	"calendar-04": { from: date(9), to: date(26) },
	"calendar-05": { from: date(12), to: date(15, 7) },
	"calendar-06": { from: date(12), to: date(26) },
	"calendar-07": { from: date(18), to: date(7, 7) },
	"calendar-09": { from: date(17), to: date(20) },
	"calendar-11": { from: date(17), to: date(20) },
	"calendar-12": { from: date(9, 9), to: date(17, 9) },
	"calendar-21": { from: date(12), to: date(17) },
	"calendar-27": { from: date(5), to: date(20) },
	"calendar-30": { from: date(4), to: date(10) },
};

function Icon({ name }: { name: "chevron" | "clock" | "calendar" | "calendar-plus" | "plus" }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4 shrink-0"
		>
			{name === "chevron" ? (
				<path d="m6 9 6 6 6-6" />
			) : name === "clock" ? (
				<>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 6v6l4 2" />
				</>
			) : name === "plus" ? (
				<path d="M12 5v14M5 12h14" />
			) : (
				<>
					<rect x="3" y="5" width="18" height="16" rx="2" />
					<path d="M16 3v4M8 3v4M3 10h18" />
					{name === "calendar-plus" && <path d="M12 13v5m-2.5-2.5h5" />}
				</>
			)}
		</svg>
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
	const id = useId();
	return (
		<div className="flex min-w-0 flex-col gap-3">
			<Label htmlFor={id} className={hidden}>
				{label}
			</Label>
			<div className="relative">
				{clock && (
					<span className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
						<Icon name="clock" />
					</span>
				)}
				<Input
					id={id}
					aria-label={hidden === "invisible" ? label : undefined}
					type="time"
					step="1"
					defaultValue={end ? "12:30:00" : "10:30:00"}
					className={`${timeInput} ${clock ? "ps-8" : ""}`}
				/>
			</div>
		</div>
	);
}

function PricedDay({ children, className, ...props }: ComponentProps<typeof CalendarDayButton>) {
	const price = weekend(props.day.date) ? "$220" : "$100";
	return (
		<CalendarDayButton
			{...props}
			className={`gap-0.5 ${className ?? ""}`}
			aria-label={`${props["aria-label"] ?? children}${props.modifiers.outside ? "" : `, ${price}`}`}
		>
			{children}
			{!props.modifiers.outside && <span aria-hidden="true">{price}</span>}
		</CalendarDayButton>
	);
}

export default function CalendarBlock({ block, chinese }: Props) {
	return <CalendarDemo key={block} block={block} chinese={chinese} />;
}

function CalendarDemo({ block, chinese = false }: Props) {
	const id = useId();
	const t = (en: string, zh: string) => (chinese ? zh : en);
	const locale = chinese ? zhCN : enUS;
	const language = chinese ? "zh-CN" : "en-US";
	const [appointmentLanguage, setAppointmentLanguage] = useState<"es" | "en">("es");
	const [caption, setCaption] = useState<(typeof captionOptions)[number]>("dropdown");
	const [selected, setSelected] = useState<Date | undefined>(() => {
		if (block === "calendar-28") return date(1);
		if (block === "calendar-29") {
			const next = new Date();
			next.setDate(next.getDate() + 2);
			return next;
		}
		return /^calendar-(?:0[1-9]|1[0-9]|20|21|31)$/.test(block) ? date(12) : undefined;
	});
	const [month, setMonth] = useState(date(12));
	const [several, setSeveral] = useState<Date[]>([date(12), date(24, 7)]);
	const [range, setRange] = useState<Range>(() => rangeSamples[block as keyof typeof rangeSamples]);
	const [time, setTime] = useState("10:00");
	const [open, setOpen] = useState(false);
	const [endOpen, setEndOpen] = useState(false);
	const [endDate, setEndDate] = useState<Date>();
	const format = (value: Date | undefined, options?: Intl.DateTimeFormatOptions) =>
		value?.toLocaleDateString(language, options) ?? "";
	const [input, setInput] = useState(() =>
		block === "calendar-29" ? t("In 2 days", "两天后") : format(selected, longDate)
	);
	const selectDate = t("Select date", "选择日期");
	const from = t("From", "开始时间");
	const to = t("To", "结束时间");
	const birthday = t("Date of birth", "出生日期");
	const stay = t("Select your stay", "选择入住日期");
	const common = { locale, weekStartsOn: 1 as const };

	function single(options: Partial<ComponentProps<typeof Calendar>> = {}) {
		return (
			<Calendar
				{...options}
				{...common}
				mode="single"
				selected={selected}
				onSelect={setSelected}
				month={month}
				onMonthChange={setMonth}
			/>
		);
	}
	function rangeCalendar(options: Partial<OptionalRangeProps> = {}) {
		return (
			<RangeCalendar
				{...common}
				selected={range}
				onSelect={setRange}
				defaultMonth={range?.from ?? (block === "calendar-27" ? date(1) : undefined)}
				{...options}
			/>
		);
	}
	function jump(days: number) {
		const next = new Date();
		next.setDate(next.getDate() + days);
		setMonth(next);
		setSelected(next);
	}
	function rangeLabel(compact = false) {
		if (!range?.from || !range.to) return undefined;
		return compact
			? new Intl.DateTimeFormat(language, shortDate).formatRange(range.from, range.to)
			: `${format(range.from)} – ${format(range.to)}`;
	}
	function singlePicker(
		label: string,
		width: string,
		end = false,
		options: Intl.DateTimeFormatOptions | undefined = undefined
	) {
		const current = end ? endDate : selected;
		const toggle = end ? setEndOpen : setOpen;
		const bound = block === "calendar-22" ? new Date() : undefined;
		const control = `${id}-${end ? "end" : "start"}`;
		return (
			<div className="flex min-w-0 flex-col gap-3">
				<Label htmlFor={control} className="px-1">
					{label}
				</Label>
				<Popover open={end ? endOpen : open} onOpenChange={toggle}>
					<PopoverTrigger asChild>
						<Button
							id={control}
							variant="outline"
							className={`${width} max-w-full justify-between font-normal`}
						>
							{format(current, options) || selectDate}
							<Icon name="chevron" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className={panel} align="start">
						<Calendar
							{...common}
							mode="single"
							captionLayout="dropdown"
							defaultMonth={current ?? (end ? selected : undefined)}
							selected={current}
							endMonth={bound}
							disabled={
								bound ? { after: bound } : end && selected ? { before: selected } : undefined
							}
							onSelect={(value) => {
								if (end) setEndDate(value);
								else {
									setSelected(value);
									if (value && endDate && endDate < value) setEndDate(undefined);
								}
								toggle(false);
							}}
						/>
					</PopoverContent>
				</Popover>
			</div>
		);
	}

	let demo: ReactNode;
	switch (block) {
		case "calendar-01":
		case "calendar-02":
		case "calendar-08":
		case "calendar-14":
		case "calendar-15":
		case "calendar-18": {
			const booked = block === "calendar-14";
			const weeks = block === "calendar-15";
			demo = single({
				className: `${framed} ${block === "calendar-18" ? "[--cell-size:min(44px,calc((100cqw-18px)/7))]! md:[--cell-size:min(48px,calc((100cqw-18px)/7))]!" : ""}`,
				numberOfMonths: block === "calendar-02" ? 2 : 1,
				startMonth: block === "calendar-08" ? date(1) : undefined,
				disabled:
					block === "calendar-08"
						? { before: date(12) }
						: booked
							? { from: date(15), to: date(26) }
							: undefined,
				modifiers: booked ? { booked: { from: date(15), to: date(26) } } : undefined,
				modifiersClassNames: booked ? { booked: "[&_button]:line-through" } : undefined,
				showWeekNumber: weeks,
				ISOWeek: weeks,
				components: weeks
					? {
							WeekNumberHeader: (props) => (
								<th
									{...props}
									scope="col"
									aria-label={t("Week", "周")}
									className={`${props.className ?? ""} text-[0.8rem] font-normal text-muted-foreground`}
								>
									{t("Wk", "周")}
								</th>
							),
							WeekNumber: ({ week, className, ...props }) => (
								<th
									{...props}
									scope="row"
									aria-label={t(`Week ${week.weekNumber}`, `第 ${week.weekNumber} 周`)}
									className={`${className ?? ""} grid size-(--cell-size) shrink-0 place-items-center font-normal tabular-nums`}
								/>
							),
						}
					: undefined,
			});
			break;
		}
		case "calendar-03":
			demo = (
				<Calendar
					{...common}
					mode="multiple"
					max={5}
					selected={several}
					onSelect={(next) => setSeveral(next ?? [])}
					defaultMonth={date(12)}
					numberOfMonths={2}
					className={framed}
				/>
			);
			break;
		case "calendar-04":
		case "calendar-05":
		case "calendar-06":
		case "calendar-07":
		case "calendar-09":
		case "calendar-11": {
			const note =
				block === "calendar-06"
					? t("A minimum of 5 days is required", "至少需要选择 5 天")
					: block === "calendar-07"
						? t("Your stay must be between 2 and 20 nights", "入住须为 2 至 20 晚")
						: block === "calendar-09"
							? t("Your stay cannot extend through the weekend", "入住日期不能跨越周末")
							: block === "calendar-11"
								? t("We are open in June and July only.", "我们仅在六月和七月开放。")
								: undefined;
			demo = (
				<div className="flex max-w-full flex-col items-center gap-2">
					{rangeCalendar({
						className: framed,
						numberOfMonths: ["calendar-04", "calendar-06"].includes(block) ? 1 : 2,
						// Bits counts both endpoints; DayPicker counts nights between them.
						min: block === "calendar-06" ? 4 : block === "calendar-07" ? 1 : undefined,
						max: block === "calendar-07" ? 19 : undefined,
						disabled:
							block === "calendar-09"
								? weekend
								: block === "calendar-11"
									? [{ before: date(1) }, { after: date(31, 7) }]
									: undefined,
						excludeDisabled: block === "calendar-09",
						startMonth: block === "calendar-11" ? date(1) : undefined,
						endMonth: block === "calendar-11" ? date(1, 7) : undefined,
					})}
					{note && <div className="text-center text-xs text-muted-foreground">{note}</div>}
				</div>
			);
			break;
		}
		case "calendar-10":
			demo = (
				<Card className="w-fit">
					<CardHeader>
						<CardTitle>{t("Appointment", "预约")}</CardTitle>
						<CardDescription>{t("Find a date.", "选择日期。")}</CardDescription>
						<CardAction>
							<Button size="sm" variant="outline" onClick={() => jump(0)}>
								{t("Today", "今天")}
							</Button>
						</CardAction>
					</CardHeader>
					<CardContent>{single({ className: plain })}</CardContent>
				</Card>
			);
			break;
		case "calendar-12": {
			const spanish = appointmentLanguage === "es";
			demo = (
				<Card className="w-fit max-w-full">
					<CardHeader>
						<CardTitle>{spanish ? "Reserva una cita" : "Book an appointment"}</CardTitle>
						<CardDescription>
							{spanish
								? "Selecciona las fechas para tu cita"
								: "Select the dates for your appointment"}
						</CardDescription>
						<CardAction>
							<Select
								value={appointmentLanguage}
								onValueChange={(value) => setAppointmentLanguage(value === "es" ? "es" : "en")}
							>
								<SelectTrigger className="w-[100px]" aria-label={t("Select language", "选择语言")}>
									{spanish ? "Español" : "English"}
								</SelectTrigger>
								<SelectContent align="end">
									<SelectItem value="en">English</SelectItem>
									<SelectItem value="es">Español</SelectItem>
								</SelectContent>
							</Select>
						</CardAction>
					</CardHeader>
					<CardContent>
						{rangeCalendar({
							className: plain,
							locale: spanish ? es : enUS,
							numberOfMonths: 2,
							buttonVariant: "outline",
						})}
					</CardContent>
				</Card>
			);
			break;
		}
		case "calendar-13": {
			const labels: Record<(typeof captionOptions)[number], string> = {
				dropdown: t("Month and Year", "月份和年份"),
				"dropdown-months": t("Month Only", "仅月份"),
				"dropdown-years": t("Year Only", "仅年份"),
			};
			demo = (
				<div className="flex max-w-full flex-col gap-4">
					{single({ className: framed, captionLayout: caption })}
					<div className="flex flex-col gap-3">
						<Label htmlFor={`${id}-caption`} className="px-1">
							{t("Dropdown", "下拉选项")}
						</Label>
						<Select
							value={caption}
							onValueChange={(value) => {
								if (captionOptions.some((option) => option === value))
									setCaption(value as typeof caption);
							}}
						>
							<SelectTrigger id={`${id}-caption`} size="sm" className="w-full bg-background">
								{labels[caption]}
							</SelectTrigger>
							<SelectContent>
								{captionOptions.map((option) => (
									<SelectItem key={option} value={option}>
										{labels[option]}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			);
			break;
		}
		case "calendar-16":
		case "calendar-17": {
			const stacked = block === "calendar-16";
			demo = (
				<Card className="w-fit max-w-full py-4">
					<CardContent className="px-4">
						{single({
							className: `${plain} ${stacked ? "" : "[--cell-size:min(42px,calc((100cqw-34px)/7))]!"}`,
						})}
					</CardContent>
					<CardFooter
						className={
							stacked
								? "grid gap-6 border-t px-4 pt-4!"
								: "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 border-t px-4 pt-4!"
						}
					>
						<TimeField
							label={t("Start Time", "开始时间")}
							clock={stacked}
							hidden={stacked ? undefined : "sr-only"}
						/>
						{!stacked && <span aria-hidden="true">-</span>}
						<TimeField
							label={t("End Time", "结束时间")}
							end
							clock={stacked}
							hidden={stacked ? undefined : "sr-only"}
						/>
					</CardFooter>
				</Card>
			);
			break;
		}
		case "calendar-19": {
			const presets = [
				[0, t("Today", "今天")],
				[1, t("Tomorrow", "明天")],
				[3, t("In 3 days", "3 天后")],
				[7, t("In a week", "一周后")],
				[14, t("In 2 weeks", "两周后")],
			] as const;
			demo = (
				<Card className="w-fit max-w-[min(300px,100%)] py-4">
					<CardContent className="px-4">
						{single({ className: `${plain} [--cell-size:min(38px,calc((100cqw-34px)/7))]!` })}
					</CardContent>
					<CardFooter className="flex-wrap gap-2 border-t px-4 pt-4!">
						{presets.map(([days, label]) => (
							<Button
								key={days}
								variant="outline"
								size="sm"
								className="flex-1"
								onClick={() => jump(days)}
							>
								{label}
							</Button>
						))}
					</CardFooter>
				</Card>
			);
			break;
		}
		case "calendar-20":
			demo = (
				<Card className="w-fit max-w-full gap-0 p-0">
					<CardContent className="relative p-0 @xl/preview:pe-48">
						<div className="p-6">
							{single({
								className: `${plain} [--cell-size:min(40px,calc((100cqw-50px)/7))]! @xl/preview:[--cell-size:48px]!`,
								showOutsideDays: false,
								disabled: { from: date(17), to: date(19) },
								modifiers: { booked: { from: date(17), to: date(19) } },
								modifiersClassNames: { booked: "[&_button]:line-through" },
							})}
						</div>
						<div
							className="grid max-h-72 gap-2 overflow-y-auto border-t p-6 @xl/preview:absolute @xl/preview:inset-y-0 @xl/preview:end-0 @xl/preview:max-h-none @xl/preview:w-48 @xl/preview:border-s @xl/preview:border-t-0"
							aria-label={t("Meeting times", "会议时间")}
							role="group"
						>
							{times.map((slot) => (
								<Button
									key={slot}
									aria-pressed={time === slot}
									variant={time === slot ? "default" : "outline"}
									onClick={() => setTime(slot)}
									className="w-full shadow-none"
								>
									{slot}
								</Button>
							))}
						</div>
					</CardContent>
					<CardFooter className="flex-col gap-4 border-t px-6 py-5! @xl/preview:flex-row">
						<div aria-live="polite" className="text-sm">
							{selected ? (
								chinese ? (
									<>
										会议已预约在{" "}
										<strong>
											{format(selected, { weekday: "long", day: "numeric", month: "short" })} {time}
										</strong>
										。
									</>
								) : (
									<>
										Your meeting is booked for{" "}
										<strong>
											{format(selected, { weekday: "long", day: "numeric", month: "short" })}
										</strong>{" "}
										at <strong>{time}</strong>.
									</>
								)
							) : (
								t("Select a date and time for your meeting.", "请选择会议日期和时间。")
							)}
						</div>
						<Button
							disabled={!selected}
							className="w-full @xl/preview:ms-auto @xl/preview:w-auto"
							variant="outline"
						>
							{t("Continue", "继续")}
						</Button>
					</CardFooter>
				</Card>
			);
			break;
		case "calendar-21":
			demo = rangeCalendar({
				className: `${framed} [--cell-size:min(44px,calc((100cqw-26px)/7))]! md:[--cell-size:min(52px,calc((100cqw-26px)/7))]!`,
				captionLayout: "dropdown",
				components: { DayButton: PricedDay },
				formatters: {
					formatMonthDropdown: (day) => day.toLocaleDateString(language, { month: "long" }),
				},
			});
			break;
		case "calendar-22":
			demo = singlePicker(birthday, "w-48");
			break;
		case "calendar-23":
		case "calendar-30":
			demo = (
				<div className="flex flex-col gap-3">
					<Label htmlFor={`${id}-stay`} className="px-1">
						{stay}
					</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								id={`${id}-stay`}
								variant="outline"
								className="w-56 max-w-full justify-between font-normal"
							>
								{rangeLabel(block === "calendar-30") ?? selectDate}
								<Icon name="chevron" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className={panel} align="start">
							{rangeCalendar({ captionLayout: "dropdown" })}
						</PopoverContent>
					</Popover>
				</div>
			);
			break;
		case "calendar-24":
			demo = (
				<div className="grid max-w-full grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-4">
					{singlePicker(t("Date", "日期"), "w-32")}
					<TimeField label={t("Time", "时间")} />
				</div>
			);
			break;
		case "calendar-25":
			demo = (
				<div className="grid max-w-full gap-6">
					{singlePicker(t("Date", "日期"), "w-full")}
					<div className="grid grid-cols-2 gap-4">
						<TimeField label={from} />
						<TimeField label={to} end />
					</div>
				</div>
			);
			break;
		case "calendar-26":
			demo = (
				<div className="grid max-w-full gap-6">
					<div className="grid grid-cols-2 gap-4">
						{singlePicker(t("Check-in", "入住"), "w-full", false, shortDate)}
						<TimeField label={from} hidden="invisible" />
					</div>
					<div className="grid grid-cols-2 gap-4">
						{singlePicker(t("Check-out", "退房"), "w-full", true, shortDate)}
						<TimeField label={to} end hidden="invisible" />
					</div>
				</div>
			);
			break;
		case "calendar-27": {
			const visitors = t("Visitors", "访客");
			const chart = traffic.filter(
				({ day }) =>
					!range?.from || !range.to || (range.from.getDate() <= day && day <= range.to.getDate())
			);
			demo = (
				<Card className="@container/card w-full max-w-xl">
					<CardHeader className="flex flex-col border-b @md/card:grid">
						<CardTitle>{t("Web Analytics", "网站分析")}</CardTitle>
						<CardDescription>
							{t("Showing total visitors for this month.", "显示本月访客总数。")}
						</CardDescription>
						<CardAction className="mt-2 @md/card:mt-0">
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="outline">
										<Icon name="calendar" />
										{rangeLabel() ?? t("June 2025", "2025 年 6 月")}
									</Button>
								</PopoverTrigger>
								<PopoverContent className={panel} align="end">
									{rangeCalendar({
										fixedWeeks: true,
										startMonth: date(1),
										endMonth: date(1),
										disabled: [{ before: date(1) }, { after: date(30) }],
									})}
								</PopoverContent>
							</Popover>
						</CardAction>
					</CardHeader>
					<CardContent className="px-4">
						<ChartContainer
							config={{ visitors: { label: visitors, color: "var(--primary)" } }}
							className="aspect-auto h-[250px] w-full"
						>
							<BarChart accessibilityLayer data={chart}>
								<XAxis dataKey="day" axisLine={false} tickLine={false} minTickGap={8} />
								<ChartTooltip
									content={
										<ChartTooltipContent
											labelFormatter={(value) =>
												typeof value === "number" || typeof value === "string"
													? format(date(Number(value)), longDate)
													: undefined
											}
										/>
									}
								/>
								<Bar
									dataKey="visitors"
									name={visitors}
									fill="var(--color-visitors)"
									radius={4}
									isAnimationActive="auto"
								/>
							</BarChart>
						</ChartContainer>
					</CardContent>
					<CardFooter className="border-t text-sm">
						<span>
							{t("You had", "六月共有")} <strong>{total.toLocaleString(language)}</strong>{" "}
							{t("visitors for the month of June.", "位访客。")}
						</span>
					</CardFooter>
				</Card>
			);
			break;
		}
		case "calendar-28":
		case "calendar-29": {
			const natural = block === "calendar-29";
			const placeholder = natural
				? t("Tomorrow or next week", "明天或下周三")
				: format(date(1), longDate);
			demo = (
				<div className="flex max-w-full flex-col gap-3">
					<Label htmlFor={`${id}-date`} className="px-1">
						{natural ? t("Schedule Date", "发布日期") : t("Subscription Date", "订阅日期")}
					</Label>
					<div className="relative flex gap-2">
						<Input
							id={`${id}-date`}
							value={input}
							placeholder={placeholder}
							className="bg-background pe-10"
							onChange={(event) => {
								const text = event.currentTarget.value;
								setInput(text);
								const iso = /^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?$/.exec(text.trim());
								const next = iso
									? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
									: natural
										? ((chinese ? zh.hans.parseDate(text) : null) ?? en.parseDate(text))
										: new Date(text);
								if (next && !Number.isNaN(+next)) {
									if (
										iso &&
										(next.getMonth() !== Number(iso[2]) - 1 || next.getDate() !== Number(iso[3]))
									)
										return;
									setSelected(next);
								}
							}}
							onKeyDown={(event) => {
								if (event.key === "ArrowDown" && !event.nativeEvent.isComposing) {
									event.preventDefault();
									setOpen(true);
								}
							}}
						/>
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									size="icon-xs"
									variant="ghost"
									aria-label={selectDate}
									className="absolute end-2 top-1/2 -translate-y-1/2"
								>
									<Icon name="calendar" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className={panel} align="end" alignOffset={-8} sideOffset={10}>
								<Calendar
									{...common}
									mode="single"
									selected={selected}
									defaultMonth={selected}
									captionLayout="dropdown"
									onSelect={(next) => {
										setSelected(next);
										setInput(format(next, longDate));
										setOpen(false);
									}}
								/>
							</PopoverContent>
						</Popover>
					</div>
					{natural && (
						<div className="px-1 text-sm text-muted-foreground" aria-live="polite">
							{t("Your post will be published on", "文章将发布于")}{" "}
							<strong>{format(selected, longDate)}</strong>
							{t(".", "。")}
						</div>
					)}
				</div>
			);
			break;
		}
		case "calendar-31":
			demo = (
				<Card className="w-fit max-w-full py-4">
					<CardContent className="px-4">{single({ className: plain, required: true })}</CardContent>
					<CardFooter className="flex-col items-start gap-3 border-t px-4 pt-4!">
						<div className="flex w-full items-center justify-between px-1">
							<div className="text-sm font-medium">
								{format(selected, { ...longDate, day: "numeric" })}
							</div>
							<Button
								aria-label={t("Add Event", "添加活动")}
								title={t("Add Event", "添加活动")}
								variant="ghost"
								size="icon-xs"
							>
								<Icon name="plus" />
							</Button>
						</div>
						<div className="flex w-full flex-col gap-2">
							{events.map(([en, zh, start, end]) => (
								<div
									key={en}
									className="relative rounded-md bg-muted p-2 ps-6 text-sm after:absolute after:inset-y-2 after:start-2 after:w-1 after:rounded-full after:bg-primary/70"
								>
									<div className="font-medium">{t(en, zh)}</div>
									<div className="text-xs text-muted-foreground">
										{new Intl.DateTimeFormat(language, {
											month: "short",
											day: "numeric",
											hour: "numeric",
											minute: "numeric",
										}).formatRange(
											new Date(`2025-06-12T${start}:00`),
											new Date(`2025-06-12T${end}:00`)
										)}
									</div>
								</div>
							))}
						</div>
					</CardFooter>
				</Card>
			);
			break;
		case "calendar-32":
			demo = (
				<div className="flex flex-col gap-3">
					<Label htmlFor={`${id}-drawer`} className="px-1">
						{birthday}
					</Label>
					<Drawer open={open} onOpenChange={setOpen}>
						<DrawerTrigger asChild>
							<Button
								id={`${id}-drawer`}
								variant="outline"
								className="w-48 max-w-full justify-between font-normal"
							>
								{format(selected) || selectDate}
								<Icon name="calendar-plus" />
							</Button>
						</DrawerTrigger>
						<DrawerContent className="overflow-auto p-0">
							<DrawerHeader className="sr-only">
								<DrawerTitle>{selectDate}</DrawerTitle>
								<DrawerDescription>
									{t("Set your date of birth", "设置你的出生日期")}
								</DrawerDescription>
							</DrawerHeader>
							<Calendar
								{...common}
								className="mx-auto w-fit! [--cell-size:clamp(28px,calc(100vw/7.5),52px)]!"
								mode="single"
								selected={selected}
								defaultMonth={selected}
								captionLayout="dropdown"
								onSelect={(next) => {
									setSelected(next);
									if (next) setOpen(false);
								}}
							/>
						</DrawerContent>
					</Drawer>
					<div className="px-1 text-sm text-muted-foreground">
						{t("This example works best on mobile.", "此示例在移动设备上的体验最佳。")}
					</div>
				</div>
			);
			break;
		default:
			return null;
	}
	return (
		<div className="@container/preview w-full min-w-0">
			<div className="flex justify-center">{demo}</div>
		</div>
	);
}
