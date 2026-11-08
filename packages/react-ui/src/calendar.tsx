"use client";

import * as React from "react";
import { cn } from "cn";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from "react-day-picker";
import { zhCN } from "react-day-picker/locale";
import { Button, buttonVariants } from "./button.tsx";
import {
	CalendarDropdownNav,
	CalendarMonthDropdown,
	CalendarYearDropdown,
} from "./calendar-dropdown.tsx";

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
	buttonVariant?: React.ComponentProps<typeof Button>["variant"];
};

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	captionLayout = "label",
	buttonVariant = "ghost",
	locale = zhCN,
	formatters,
	components,
	startMonth,
	endMonth,
	...props
}: CalendarProps) {
	const defaultClassNames = getDefaultClassNames();
	const [captionBounds] = React.useState(() => {
		// Match Bits' defaultYears: anchor to the initial displayed year and the
		// current year, spanning latest-100 through latest+10 (including old views).
		const initialYear = (
			props.month ??
			props.defaultMonth ??
			props.today ??
			new Date()
		).getFullYear();
		const latestYear = Math.max(initialYear, new Date().getFullYear());
		const earliestYear = initialYear < latestYear - 100 ? initialYear - 10 : latestYear - 100;
		return { start: new Date(earliestYear, 0, 1), end: new Date(latestYear + 10, 11, 31) };
	});
	const hasYearDropdown = captionLayout === "dropdown" || captionLayout === "dropdown-years";

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn(
				"cn-calendar group/calendar bg-background in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
				"cn-calendar-geometry",
				String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
				String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
				className
			)}
			captionLayout={captionLayout}
			locale={locale}
			startMonth={
				startMonth ??
				(hasYearDropdown && props.fromMonth === undefined && props.fromYear === undefined
					? captionBounds.start
					: undefined)
			}
			endMonth={
				endMonth ??
				(hasYearDropdown && props.toMonth === undefined && props.toYear === undefined
					? captionBounds.end
					: undefined)
			}
			formatters={{
				formatWeekdayName: (date) => date.toLocaleString(locale?.code, { weekday: "short" }),
				formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: "short" }),
				formatYearDropdown: (date) => date.toLocaleString(locale?.code, { year: "numeric" }),
				...formatters,
			}}
			classNames={{
				root: cn("w-full", defaultClassNames.root),
				months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
				month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
				nav: cn(
					"absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
					defaultClassNames.nav
				),
				button_previous: cn(
					buttonVariants({ variant: buttonVariant }),
					"size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
					defaultClassNames.button_previous
				),
				button_next: cn(
					buttonVariants({ variant: buttonVariant }),
					"size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
					defaultClassNames.button_next
				),
				month_caption: cn(
					"flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
					defaultClassNames.month_caption
				),
				dropdowns: cn(
					"flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
					defaultClassNames.dropdowns
				),
				dropdown_root: cn(
					"cn-calendar-dropdown-root relative rounded-(--cell-radius)",
					defaultClassNames.dropdown_root
				),
				dropdown: cn("absolute inset-0 bg-popover opacity-0", defaultClassNames.dropdown),
				caption_label: cn(
					"font-medium select-none",
					captionLayout === "label"
						? "cn-calendar-caption text-sm"
						: "cn-calendar-caption-label flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
					defaultClassNames.caption_label
				),
				month_grid: cn("flex w-full border-collapse flex-col", defaultClassNames.month_grid),
				weekdays: cn("flex", defaultClassNames.weekdays),
				weekday: cn(
					"w-(--cell-size) rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
					defaultClassNames.weekday
				),
				week: cn("mt-2 flex w-full", defaultClassNames.week),
				week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
				week_number: cn(
					"text-[0.8rem] text-muted-foreground select-none",
					defaultClassNames.week_number
				),
				day: cn(
					"group/day relative size-(--cell-size) rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
					props.showWeekNumber
						? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
						: "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
					defaultClassNames.day
				),
				range_start: cn(
					"relative isolate z-0 rounded-l-(--cell-radius) bg-accent after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-accent",
					defaultClassNames.range_start
				),
				range_middle: cn(
					"rounded-none bg-accent text-accent-foreground",
					defaultClassNames.range_middle
				),
				range_end: cn(
					"relative isolate z-0 rounded-r-(--cell-radius) bg-accent after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-accent",
					defaultClassNames.range_end
				),
				today: cn(
					"rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none data-[selected=true]:bg-accent",
					defaultClassNames.today
				),
				outside: cn(
					"text-muted-foreground aria-selected:text-muted-foreground",
					defaultClassNames.outside
				),
				disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
				hidden: cn("invisible", defaultClassNames.hidden),
				...classNames,
			}}
			components={{
				DropdownNav: CalendarDropdownNav,
				MonthsDropdown: CalendarMonthDropdown,
				YearsDropdown: CalendarYearDropdown,
				Root: ({ className, rootRef, ...props }) => {
					return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
				},
				Chevron: ({ className, orientation, ...props }) => {
					if (orientation === "left") {
						return <ChevronLeftIcon className={cn("cn-rtl-flip size-4", className)} {...props} />;
					}

					if (orientation === "right") {
						return <ChevronRightIcon className={cn("cn-rtl-flip size-4", className)} {...props} />;
					}

					return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
				},
				DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
				WeekNumber: ({ children, ...props }) => {
					return (
						<td {...props}>
							<div className="flex size-(--cell-size) items-center justify-center text-center">
								{children}
							</div>
						</td>
					);
				},
				...components,
			}}
			{...props}
		/>
	);
}

function CalendarDayButton({
	className,
	day,
	modifiers,
	locale,
	...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
	const defaultClassNames = getDefaultClassNames();

	const ref = React.useRef<HTMLButtonElement>(null);
	React.useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);

	return (
		<Button
			ref={ref}
			variant="ghost"
			size="icon"
			shape="square"
			data-day={day.date.toLocaleDateString(locale?.code)}
			data-selected-single={
				modifiers.selected &&
				!modifiers.range_start &&
				!modifiers.range_end &&
				!modifiers.range_middle
			}
			data-range-start={modifiers.range_start}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			className={cn(
				"cn-calendar-day-button relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-middle=true]:hover:bg-accent data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground dark:data-[range-middle=true]:hover:bg-accent [&>span]:text-xs [&>span]:opacity-70",
				defaultClassNames.day,
				className
			)}
			{...props}
		/>
	);
}

export { Calendar, CalendarDayButton };
export type { CalendarProps };
