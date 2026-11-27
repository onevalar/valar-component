// Adapted from Valar's StaticSparkline, via TokenPlan c588b28cc1a19a1bdd5964db5c791e2ec66d5ec4
// and the free Arc Sparkline. Copyright (c) 2026 Elia Kuratli; MIT (see LICENSE).
import { cn } from "cn";
import React, { type ComponentProps } from "react";

export type StaticSparklineProps = Omit<ComponentProps<"svg">, "children" | "values"> & {
	/** Ordered calendar slots: finite, nonnegative readings; null leaves a gap. */
	values: readonly (number | null)[];
};

export function StaticSparkline({ values, className, ...props }: StaticSparklineProps) {
	let maximum = 1;
	for (const value of values) {
		if (value !== null) maximum = Math.max(maximum, value);
	}
	const intervals = Math.max(1, values.length - 1);
	const points = values.map((value, index) =>
		value === null ? null : { x: 4 + (index / intervals) * 64, y: 36 - (value / maximum) * 32 }
	);
	const path = points
		.map((point, index) =>
			point ? `${points[index - 1] ? "L" : "M"}${point.x.toFixed(2)},${point.y.toFixed(2)}` : ""
		)
		.join(" ");
	return (
		<svg
			viewBox="0 0 72 40"
			width="50.4"
			height="28"
			{...props}
			data-slot="static-sparkline"
			aria-hidden="true"
			focusable="false"
			className={cn("text-primary", className)}
		>
			<path
				d={path}
				fill="none"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{points.map(
				(point, index) =>
					point && (
						<circle
							key={index}
							cx={point.x}
							cy={point.y}
							r={
								index === points.length - 1 || (!points[index - 1] && !points[index + 1]) ? 2 : 1.25
							}
							fill="currentColor"
						/>
					)
			)}
		</svg>
	);
}
