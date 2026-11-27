"use client";

import * as React from "react";
import { cn } from "cn";
import { useDayPicker, type DropdownNavProps, type DropdownProps } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./select.tsx";

function CalendarDropdownNav({ children, ...props }: DropdownNavProps) {
	const { components } = useDayPicker();
	const controls = React.Children.toArray(children);
	// Compose the actual DayPicker children, not replacement controls. Native
	// keys also identify static captions in dropdown-months/dropdown-years mode.
	const month = controls.findIndex(
		(child) =>
			React.isValidElement(child) &&
			(child.type === components.MonthsDropdown || /(?:^|[.$:])month$/.test(String(child.key)))
	);
	const year = controls.findIndex(
		(child) =>
			React.isValidElement(child) &&
			(child.type === components.YearsDropdown || /(?:^|[.$:])year$/.test(String(child.key)))
	);
	if (month >= 0 && year >= 0 && year < month) {
		[controls[year], controls[month]] = [controls[month], controls[year]];
	}
	return <div {...props}>{controls}</div>;
}

// DayPicker still owns the options, constraints and change handler. The visible
// Select forwards the choice through the original DayPicker select contract.
function CalendarDropdown({
	kind,
	options = [],
	value,
	className,
	classNames: _classNames,
	components: _components,
	...props
}: DropdownProps & { kind: "month" | "year" }) {
	const selectRef = React.useRef<HTMLSelectElement>(null);
	const { dayPickerProps } = useDayPicker();
	const chinese = dayPickerProps.locale?.code?.toLowerCase().startsWith("zh");
	const customLabel =
		kind === "month"
			? dayPickerProps.labels?.labelMonthDropdown
			: dayPickerProps.labels?.labelYearDropdown;
	const label = customLabel
		? props["aria-label"]
		: kind === "month"
			? chinese
				? "月份"
				: "Month"
			: chinese
				? "年份"
				: "Year";
	const current = options.find((option) => option.value === Number(value));
	function choose(next: string) {
		const select = selectRef.current;
		if (!select) return;
		select.value = next;
		select.dispatchEvent(new Event("change", { bubbles: true }));
	}

	return (
		<>
			<select
				{...props}
				value={value}
				ref={selectRef}
				className="sr-only"
				tabIndex={-1}
				aria-hidden="true"
			>
				{options.map((option) => (
					<option key={option.value} value={option.value} disabled={option.disabled}>
						{option.label}
					</option>
				))}
			</select>
			<Select value={String(value)} disabled={props.disabled} onValueChange={choose}>
				<SelectTrigger
					size="sm"
					aria-label={label}
					aria-labelledby={props["aria-labelledby"]}
					data-calendar-caption={kind}
					className={cn(className, "relative h-(--cell-size)!")}
				>
					<span className="min-w-0 truncate">{current?.label ?? value}</span>
				</SelectTrigger>
				<SelectContent
					className="cn-select-content-settings max-h-[min(15rem,var(--radix-select-content-available-height,15rem))]! animate-none!"
					collisionPadding={8}
				>
					{options.map((option) => (
						<SelectItem key={option.value} value={String(option.value)} disabled={option.disabled}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	);
}

function CalendarMonthDropdown(props: DropdownProps) {
	return <CalendarDropdown {...props} kind="month" />;
}

function CalendarYearDropdown(props: DropdownProps) {
	return <CalendarDropdown {...props} kind="year" />;
}

export { CalendarDropdownNav, CalendarMonthDropdown, CalendarYearDropdown };
