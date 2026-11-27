// Ported from Valar's Gauge, adapted from the free Arc Gauge.
// Copyright (c) 2026 Elia Kuratli, MIT. See NOTICE.md.
import { cn } from "cn";
import React, { type ComponentProps } from "react";

type Tone = "accent" | "danger";

export type GaugeArcProps = Omit<ComponentProps<"g">, "children"> & {
	value: number | null;
	radius?: number;
	tone?: Tone;
};

export type GaugeProps = Omit<ComponentProps<"div">, "children"> & {
	value: number;
	label: string;
	valueText: string;
	tone?: Tone;
};

function arcFor(sweep: number, radius: number) {
	const start = -135;
	const end = start + 270 * sweep;
	const at = (angle: number) =>
		`${(50 + radius * Math.sin((angle * Math.PI) / 180)).toFixed(3)} ${(50 - radius * Math.cos((angle * Math.PI) / 180)).toFixed(3)}`;
	return `M ${at(start)} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${at(end)}`;
}

/** Read-only arc for a 100-unit SVG; null draws only the missing-data track. */
export function GaugeArc({
	value,
	radius = 42,
	tone = "accent",
	className,
	...props
}: GaugeArcProps) {
	const missing = value === null;
	const percentage = missing ? 0 : Math.min(1, Math.max(0, value / 100));
	return (
		<g
			data-slot="gauge-arc"
			data-tone={tone}
			data-missing={missing}
			className={cn("fill-none stroke-9 [stroke-linecap:round]", className)}
			{...props}
		>
			<path
				d={arcFor(1, radius)}
				className="stroke-border"
				strokeDasharray={missing ? "3 6" : undefined}
				strokeLinecap={missing ? "butt" : undefined}
			/>
			{percentage > 0 && (
				<path
					d={arcFor(percentage, radius)}
					opacity={Math.min(1, percentage / 0.02)}
					className={tone === "danger" ? "stroke-destructive" : "stroke-primary"}
				/>
			)}
		</g>
	);
}

export function Gauge({
	value,
	label,
	valueText,
	tone = "accent",
	className,
	...props
}: GaugeProps) {
	return (
		<div
			data-slot="gauge"
			data-tone={tone}
			role="meter"
			aria-label={label}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.min(100, Math.max(0, value))}
			aria-valuetext={valueText}
			className={cn("relative aspect-[100/90] w-full", className)}
			{...props}
		>
			<svg
				viewBox="0 0 100 90"
				aria-hidden="true"
				focusable="false"
				className="block size-full overflow-visible"
			>
				<GaugeArc value={value} tone={tone} />
			</svg>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 top-0 grid aspect-square place-content-center"
			>
				<span
					className={cn(
						"text-xl font-semibold tracking-tight tabular-nums",
						tone === "danger" ? "text-destructive" : "text-foreground"
					)}
				>
					{Math.round(value)}
					<span className="ms-px text-[0.5em]">%</span>
				</span>
			</div>
		</div>
	);
}
