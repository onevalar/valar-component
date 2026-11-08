"use client";

import * as React from "react";
import { cn } from "cn";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useDayPicker, type DropdownNavProps, type DropdownProps } from "react-day-picker";
import { Button } from "./button.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx";

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

// DayPicker still owns options, constraints, locale formatting and navigation.
// A real select dispatches its native change event; the popover only supplies
// the Valar choice UI used by the existing Svelte month/year selectors.
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
	const [open, setOpen] = React.useState(false);
	const [start, setStart] = React.useState<number | null>(null);
	const current = options.find((option) => option.value === Number(value));
	const at = Math.max(
		0,
		options.findIndex((option) => option.value === Number(value))
	);
	const last = Math.max(0, options.length - 12);
	const first = Math.min(Math.max(0, start ?? at - 5), last);
	const shown = kind === "month" ? options : options.slice(first, first + 12);

	function choose(next: number) {
		const select = selectRef.current;
		if (!select) return;
		select.value = String(next);
		select.dispatchEvent(new Event("change", { bubbles: true }));
		setOpen(false);
	}

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (next) setStart(null);
			}}
		>
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
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					disabled={props.disabled}
					aria-label={props["aria-label"] ?? (kind === "month" ? "选择月份" : "选择年份")}
					aria-labelledby={props["aria-labelledby"]}
					className={cn("relative h-(--cell-size) gap-1 ps-2 pe-1.5 font-medium", className)}
				>
					{current?.label ?? value}
					<ChevronDownIcon className="size-3.5 text-muted-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className={kind === "month" ? "w-52 p-2" : "w-60 gap-2 p-2"}>
				{kind === "year" && (
					<div className="flex items-center justify-between">
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="前 12 年"
							disabled={first === 0}
							onClick={() => setStart(Math.max(0, first - 12))}
						>
							<ChevronLeftIcon />
						</Button>
						<span className="text-sm font-medium">
							{shown[0]?.label} – {shown.at(-1)?.label}
						</span>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="后 12 年"
							disabled={first >= last}
							onClick={() => setStart(Math.min(last, first + 12))}
						>
							<ChevronRightIcon />
						</Button>
					</div>
				)}
				<div className="grid grid-cols-3 gap-1">
					{shown.map((option) => (
						<Button
							key={option.value}
							variant={option.value === Number(value) ? "default" : "ghost"}
							size="sm"
							aria-pressed={option.value === Number(value)}
							disabled={option.disabled}
							onClick={() => choose(option.value)}
						>
							{option.label}
						</Button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}

function CalendarMonthDropdown(props: DropdownProps) {
	return <CalendarDropdown {...props} kind="month" />;
}

function CalendarYearDropdown(props: DropdownProps) {
	return <CalendarDropdown {...props} kind="year" />;
}

export { CalendarDropdownNav, CalendarMonthDropdown, CalendarYearDropdown };
