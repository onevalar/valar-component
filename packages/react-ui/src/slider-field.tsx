"use client";

import * as React from "react";
import { cn } from "cn";
import { NumberField } from "./number-field.tsx";
import { Slider } from "./slider.tsx";

export type SliderFieldProps = Omit<React.ComponentProps<"div">, "children"> & {
	/** Visible label; also names the slider and the number input. */
	label: string;
	value?: number;
	defaultValue?: number;
	min?: number;
	max?: number;
	step?: number;
	/** Shown after the number, e.g. "px". Not part of the value. */
	unit?: string;
	disabled?: boolean;
	name?: string;
	onValueChange?: (value: number) => void;
};

export function SliderField({
	label,
	value: controlledValue,
	defaultValue = 0,
	min = 0,
	max = 100,
	step = 1,
	unit,
	disabled = false,
	name,
	onValueChange,
	id,
	className,
	...props
}: SliderFieldProps) {
	const generatedId = React.useId();
	const inputId = `${id ?? generatedId}-input`;
	const [local, setLocal] = React.useState(defaultValue);
	const value = controlledValue ?? local;

	function change(next: number | undefined) {
		// Reject draft candidates without moving the slider or changing its submitted value.
		if (
			next === undefined ||
			!Number.isFinite(next) ||
			next < min ||
			next > max ||
			Object.is(next, value)
		)
			return;
		if (controlledValue === undefined) setLocal(next);
		onValueChange?.(next);
	}

	return (
		<div
			{...props}
			id={id}
			data-slot="slider-field"
			data-disabled={disabled || undefined}
			className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2", className)}
		>
			<label
				htmlFor={inputId}
				className="col-span-2 text-[13px] leading-[17px] font-medium text-foreground"
			>
				{label}
			</label>
			<Slider
				type="single"
				value={value}
				onValueChange={change}
				min={min}
				max={max}
				step={step}
				disabled={disabled}
				aria-label={label}
			/>
			<div className="flex items-center gap-1.5">
				<NumberField
					id={inputId}
					name={name}
					value={value}
					onValueChange={change}
					min={min}
					max={max}
					step={step}
					disabled={disabled}
					className="w-32"
					decrementLabel={`减小${label}`}
					incrementLabel={`增大${label}`}
				/>
				{unit && <span className="text-xs text-muted-foreground tabular-nums">{unit}</span>}
			</div>
		</div>
	);
}
