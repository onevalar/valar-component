"use client";

import * as React from "react";
import { cn } from "cn";
import {
	getDefaultClassNames,
	type PropsRange,
	type PropsRangeRequired,
	type PropsBase,
} from "react-day-picker";
import { Calendar, type CalendarProps } from "./calendar.tsx";

type RangeCalendarProps = PropsBase &
	(Omit<PropsRange, "mode"> | Omit<PropsRangeRequired, "mode">) & {
		mode?: "range";
		buttonVariant?: CalendarProps["buttonVariant"];
	};

function RangeCalendar({
	className,
	classNames,
	components,
	resetOnSelect = true,
	...props
}: RangeCalendarProps) {
	const defaultClassNames = getDefaultClassNames();
	return (
		<Calendar
			{...({ ...props, mode: "range", resetOnSelect } as CalendarProps)}
			className={cn("cn-range-calendar-geometry p-3", className)}
			classNames={{
				// The Svelte range composition differs from its single calendar:
				// padding 12px, a 16px grid margin and a 4px head/body grid gap.
				month: cn("flex w-full flex-col", defaultClassNames.month),
				month_caption: cn(
					"flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
					defaultClassNames.month_caption
				),
				month_grid: cn(
					"mt-4 flex w-full border-collapse flex-col gap-1",
					defaultClassNames.month_grid
				),
				...classNames,
			}}
			components={{
				Root: ({ className, rootRef, ...rootProps }) => (
					<div {...rootProps} data-slot="range-calendar" ref={rootRef} className={className} />
				),
				...components,
			}}
		/>
	);
}

export { RangeCalendar };
export type { RangeCalendarProps };
