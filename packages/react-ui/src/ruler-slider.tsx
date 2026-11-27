"use client";

import * as React from "react";
import { cn } from "cn";
import {
	createRulerMotion,
	formatRulerValue,
	rulerMarks,
	snapRulerValue,
} from "./ruler-slider-motion.ts";

export type RulerSliderProps = Omit<React.ComponentProps<"div">, "children"> & {
	label: string;
	value?: number;
	defaultValue?: number;
	onValueChange?: (value: number) => void;
	onValueCommit?: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	largeStep?: number;
	majorEvery?: number;
	spacing?: number;
	format?: (value: number) => string;
	/** The tape moves; the readout is synchronous. Rolling digits are not supported. */
	animateReadout?: false;
	unit?: string;
	name?: string;
	disabled?: boolean;
};

export function RulerSlider({
	label,
	value: controlled,
	defaultValue,
	onValueChange,
	onValueCommit,
	min = 0,
	max = 100,
	step = 1,
	largeStep,
	majorEvery = 10,
	spacing = 10,
	format,
	animateReadout: _animateReadout,
	unit,
	name,
	disabled = false,
	className,
	"aria-label": ariaLabel,
	"aria-labelledby": labelledBy,
	"aria-describedby": describedBy,
	"aria-errormessage": errorMessage,
	"aria-invalid": invalid,
	...props
}: RulerSliderProps) {
	const labelId = `${React.useId()}-label`;
	const [local, setLocal] = React.useState(defaultValue ?? min);
	const safeStep = step > 0 ? step : 1;
	const current = snapRulerValue(controlled ?? local, min, max, safeStep);
	const [position, setPosition] = React.useState(current);
	const [dragging, setDragging] = React.useState(false);
	const [settlement, settled] = React.useReducer((count) => count + 1, 0);
	const viewport = React.useRef<HTMLDivElement>(null);
	const motion = React.useRef<ReturnType<typeof createRulerMotion>>(null);
	const settings = {
		min,
		max,
		step: safeStep,
		spacing,
		largeStep: largeStep ?? safeStep * majorEvery,
		disabled,
	};
	const latest = React.useRef({ current, settings, controlled, onValueChange, onValueCommit });
	React.useLayoutEffect(() => {
		latest.current = { current, settings, controlled, onValueChange, onValueCommit };
	});
	React.useLayoutEffect(() => {
		const controller = createRulerMotion(viewport.current!, latest.current.current, {
			get: () => latest.current.settings,
			position: setPosition,
			dragging: setDragging,
			change(next) {
				const props = latest.current;
				if (props.controlled === undefined) setLocal(next);
				props.onValueChange?.(next);
			},
			commit(next) {
				latest.current.onValueCommit?.(next);
				// Reconcile a rejected controlled proposal after the parent's render.
				if (latest.current.controlled !== undefined) settled();
			},
		});
		motion.current = controller;
		return () => {
			controller.destroy();
			motion.current = null;
		};
	}, []);
	React.useLayoutEffect(() => {
		motion.current?.sync(current);
	}, [current, disabled, min, max, safeStep, spacing, settlement]);

	const readout = React.useMemo(
		() => (format ? format(current) : formatRulerValue(current, min, safeStep)),
		[format, current, min, safeStep]
	);
	const majorSpacing = spacing * majorEvery;
	const labels = React.useMemo(
		() =>
			rulerMarks(min, max, safeStep, majorEvery).map(({ value, text }, index) => (
				<span
					key={index}
					className="absolute top-8 -translate-x-1/2 font-mono text-[11px] whitespace-nowrap text-muted-foreground tabular-nums"
					style={{ left: index * majorSpacing }}
				>
					{format ? format(value) : text}
				</span>
			)),
		[min, max, safeStep, majorEvery, majorSpacing, format]
	);

	return (
		<div
			{...props}
			data-slot="ruler-slider"
			data-disabled={disabled || undefined}
			data-dragging={dragging || undefined}
			className={cn(
				"grid w-full min-w-0 justify-items-center gap-1 text-[13px] text-foreground select-none data-disabled:opacity-50",
				className
			)}
		>
			<span id={labelId} className="text-[13px] font-medium text-muted-foreground">
				{label}
			</span>
			<div
				aria-hidden="true"
				className="mb-2.5 inline-flex items-baseline gap-[0.25em] text-xl leading-[1.15] font-semibold tracking-tight tabular-nums"
			>
				<span>{readout}</span>
				{unit && <span className="text-xs font-normal text-muted-foreground">{unit}</span>}
			</div>
			<div
				ref={viewport}
				data-slot="ruler-slider-viewport"
				role="slider"
				tabIndex={disabled ? -1 : 0}
				aria-label={ariaLabel}
				aria-labelledby={labelledBy ?? (ariaLabel ? undefined : labelId)}
				aria-describedby={describedBy}
				aria-errormessage={errorMessage}
				aria-invalid={invalid}
				aria-valuemin={min}
				aria-valuemax={max}
				aria-valuenow={current}
				aria-valuetext={unit ? `${readout} ${unit}` : readout}
				aria-orientation="horizontal"
				aria-disabled={disabled || undefined}
				className="relative h-16 w-full cursor-grab touch-pan-y overflow-hidden rounded-[10px] border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white outline-none [-webkit-tap-highlight-color:transparent] focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid in-data-[disabled]:cursor-not-allowed in-data-[dragging]:cursor-grabbing dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)]"
			>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_right,transparent,#000_22%,#000_78%,transparent)]"
				>
					<div
						data-slot="ruler-slider-tape"
						className="absolute inset-y-0 left-[calc(50%-0.5px)] will-change-transform"
						style={{
							width: ((max - min) * spacing) / safeStep + 1,
							transform: `translateX(${(-(position - min) * spacing) / safeStep}px)`,
						}}
					>
						<span
							className="absolute inset-x-0 top-0 h-7"
							style={{
								backgroundImage:
									"linear-gradient(to right, color-mix(in oklab, var(--foreground) 48%, transparent) 0 1px, transparent 1px), linear-gradient(to right, color-mix(in oklab, var(--foreground) 20%, transparent) 0 1px, transparent 1px), linear-gradient(to right, color-mix(in oklab, var(--foreground) 20%, transparent) 0 1px, transparent 1px)",
								backgroundRepeat: "repeat-x",
								backgroundSize: `${majorSpacing}px 1.75rem, ${majorEvery % 2 === 0 ? majorSpacing / 2 : 0}px 1.25rem, ${spacing}px 0.75rem`,
							}}
						/>
						{labels}
					</div>
				</div>
				<span
					aria-hidden="true"
					data-slot="ruler-slider-needle"
					className="pointer-events-none absolute top-0 left-[calc(50%-1px)] h-9 w-0.5 rounded-b-full bg-primary"
				/>
			</div>
			{name && <input type="hidden" name={name} value={current} disabled={disabled} />}
		</div>
	);
}
