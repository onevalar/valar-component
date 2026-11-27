// TickMeter was independently authored for Valar on 2026-11-07 from product requirements (MIT).
// No Arc Pro tick-ring implementation, CSS, assets or geometry was used. Not Arc Activity Rings.
import { cn } from "cn";
import React, { type ComponentProps } from "react";

export type TickMeterProps = Omit<ComponentProps<"div">, "children"> & {
	/** Finite percentage. The geometry and ARIA value clamp; the visible readout does not. */
	value: number;
	label: string;
	valueText: string;
	tone?: "accent" | "danger";
};

const ticks = Array.from({ length: 60 }, (_, index) => {
	const angle = ((index * 6 - 90) * Math.PI) / 180;
	return {
		x1: 50 + 36 * Math.cos(angle),
		y1: 50 + 36 * Math.sin(angle),
		x2: 50 + 44 * Math.cos(angle),
		y2: 50 + 44 * Math.sin(angle),
	};
});

export function TickMeter({
	value,
	label,
	valueText,
	tone = "accent",
	className,
	...props
}: TickMeterProps) {
	const bounded = Math.min(100, Math.max(0, value));
	const filled = Math.round((bounded * 60) / 100);
	const filledClass = tone === "danger" ? "stroke-destructive" : "stroke-primary";
	return (
		<div
			{...props}
			data-slot="tick-meter"
			data-tone={tone}
			role="meter"
			aria-label={label}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={bounded}
			aria-valuetext={valueText}
			className={cn("relative aspect-square w-full", className)}
		>
			<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className="block size-full">
				{ticks.map((tick, index) => (
					<line
						key={index}
						{...tick}
						data-filled={index < filled}
						strokeWidth="2.5"
						strokeLinecap="round"
						className={index < filled ? filledClass : "stroke-border"}
					/>
				))}
			</svg>
			<span
				aria-hidden="true"
				className={cn(
					"pointer-events-none absolute inset-0 grid place-content-center text-xl font-semibold tracking-tight tabular-nums",
					tone === "danger" ? "text-destructive" : "text-foreground"
				)}
			>
				{Math.round(value)}%
			</span>
		</div>
	);
}
