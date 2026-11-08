"use client";

import * as React from "react";
import { cn } from "cn";
import { Slider as SliderPrimitive, Slot } from "radix-ui";

type NativeSliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
	type?: "multiple";
	thumbLabels?: string[];
	largeStep?: number;
};
type ScalarSliderProps = Omit<
	NativeSliderProps,
	"type" | "value" | "defaultValue" | "onValueChange" | "onValueCommit"
> & {
	type: "single";
	value?: number;
	defaultValue?: number;
	onValueChange?: (value: number) => void;
	onValueCommit?: (value: number) => void;
};
type SliderProps = NativeSliderProps | ScalarSliderProps;

// Radix composes an unconditional keyboard handler on its root. Its public
// asChild boundary lets scalar mode replace ONLY that DOM handler, keeping the
// native pointer, focus, collection, positioning and form engines intact. This
// is important: preventDefault/stopPropagation hacks would eat app shortcuts.
function ScalarSurface({
	scalarKeyboard,
	onKeyDown: _radixKeyboard,
	asChild,
	...props
}: React.ComponentProps<"span"> & {
	scalarKeyboard: React.KeyboardEventHandler<HTMLSpanElement>;
	asChild?: boolean;
}) {
	const Comp = asChild ? Slot.Root : "span";
	return <Comp {...props} onKeyDown={scalarKeyboard} />;
}

function Slider(props: ScalarSliderProps): React.JSX.Element;
function Slider(props: NativeSliderProps): React.JSX.Element;
function Slider(all: SliderProps) {
	const {
		className,
		defaultValue,
		value,
		min = 0,
		max = 100,
		step = 1,
		type,
		thumbLabels,
		largeStep,
		children,
		asChild,
		onValueChange: _change,
		onValueCommit: _commit,
		onKeyDown,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledby,
		"aria-valuetext": ariaValueText,
		...props
	} = all;
	const [internal, setInternal] = React.useState(
		typeof defaultValue === "number" ? defaultValue : min
	);
	const scalar = typeof value === "number" ? value : internal;
	const _values =
		type === "single"
			? [scalar]
			: Array.isArray(value)
				? value
				: Array.isArray(defaultValue)
					? defaultValue
					: [min, max];

	function change(next: number[]) {
		if (all.type === "single") {
			if (all.value === undefined) setInternal(next[0]);
			all.onValueChange?.(next[0]);
		} else all.onValueChange?.(next);
	}
	function commit(next: number[]) {
		if (all.type === "single") all.onValueCommit?.(next[0]);
		else all.onValueCommit?.(next);
	}
	function keyboard(event: React.KeyboardEvent<HTMLSpanElement>) {
		onKeyDown?.(event);
		if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || props.disabled)
			return;
		const large = largeStep ?? step * 2;
		const delta = ["ArrowRight", "ArrowUp"].includes(event.key)
			? event.shiftKey
				? large
				: step
			: ["ArrowLeft", "ArrowDown"].includes(event.key)
				? -(event.shiftKey ? large : step)
				: event.key === "PageUp"
					? large
					: event.key === "PageDown"
						? -large
						: undefined;
		const wanted =
			event.key === "Home"
				? min
				: event.key === "End"
					? max
					: delta === undefined
						? undefined
						: scalar + delta;
		if (wanted === undefined) return;
		event.preventDefault();
		// Match scalar Bits normalization when max is not on the min-anchored grid.
		// Keep native array/multi-thumb Radix behavior untouched.
		const lastStep = Number(
			(min + Math.floor(Number(((max - min) / step).toFixed(10))) * step).toFixed(10)
		);
		const next =
			event.key === "Home"
				? min
				: event.key === "End"
					? lastStep
					: Math.min(
							lastStep,
							Math.max(min, Number((min + Math.round((wanted - min) / step) * step).toFixed(10)))
						);
		if (Object.is(next, scalar)) return;
		change([next]);
		commit([next]);
	}

	const content = children ?? (
		<>
			<SliderPrimitive.Track
				data-slot="slider-track"
				className="cn-slider-track relative grow overflow-hidden data-horizontal:w-full data-vertical:h-full"
			>
				<SliderPrimitive.Range
					data-slot="slider-range"
					className="cn-slider-range absolute select-none data-horizontal:h-full data-vertical:w-full"
				/>
			</SliderPrimitive.Track>
			{Array.from({ length: _values.length }, (_, index) => (
				<SliderPrimitive.Thumb
					data-slot="slider-thumb"
					key={index}
					aria-label={thumbLabels?.[index] ?? ariaLabel}
					aria-labelledby={ariaLabelledby}
					aria-valuetext={ariaValueText}
					className="cn-slider-thumb block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50"
				/>
			))}
		</>
	);

	return (
		<SliderPrimitive.Root
			{...props}
			name={props.disabled ? undefined : props.name}
			data-slot="slider"
			defaultValue={
				Array.isArray(defaultValue)
					? defaultValue
					: typeof defaultValue === "number"
						? [defaultValue]
						: undefined
			}
			value={type === "single" ? [scalar] : Array.isArray(value) ? value : undefined}
			onValueChange={change}
			onValueCommit={commit}
			onKeyDown={type === "single" ? undefined : onKeyDown}
			asChild={type === "single" || asChild}
			min={min}
			max={max}
			step={step}
			className={cn(
				"cn-slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col",
				className
			)}
		>
			{type === "single" ? (
				<ScalarSurface scalarKeyboard={keyboard} asChild={asChild}>
					{content}
				</ScalarSurface>
			) : (
				content
			)}
		</SliderPrimitive.Root>
	);
}

export { Slider };
export type { SliderProps, NativeSliderProps, ScalarSliderProps };
export { SliderPrimitive };
