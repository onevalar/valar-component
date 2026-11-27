// Ported from Valar's StaticDonut, adapted from the free Arc DonutChart.
// Copyright (c) 2026 Elia Kuratli, MIT. See NOTICE.md.
import React, { type ComponentProps } from "react";

export type DonutPart = { key: string; value: number; color: string };
export type StaticDonutProps = Omit<ComponentProps<"svg">, "children"> & {
	parts: readonly DonutPart[];
	total: number;
};

function sector(start: number, end: number) {
	const turns = end - start;
	if (turns <= 0) return "";
	const outer = 97;
	const inner = 73;
	const coordinate = (value: number) => Math.round(value * 1e6) / 1e6;
	const at = (radius: number, angle: number) =>
		`${coordinate(104 + radius * Math.cos(angle))} ${coordinate(104 + radius * Math.sin(angle))}`;
	if (turns >= 1) {
		const top = -Math.PI / 2;
		const bottom = Math.PI / 2;
		return `M${at(outer, top)}A97 97 0 1 1 ${at(outer, bottom)}A97 97 0 1 1 ${at(outer, top)}ZM${at(inner, top)}A73 73 0 1 0 ${at(inner, bottom)}A73 73 0 1 0 ${at(inner, top)}Z`;
	}
	const a0 = start * Math.PI * 2 - Math.PI / 2;
	const a1 = end * Math.PI * 2 - Math.PI / 2;
	const largeArc = a1 - a0 > Math.PI ? 1 : 0;
	return `M${at(outer, a0)}A97 97 0 ${largeArc} 1 ${at(outer, a1)}L${at(inner, a1)}A73 73 0 ${largeArc} 0 ${at(inner, a0)}Z`;
}

/** Decorative fixed-denominator chart. Provide a text legend for exact values. */
export function StaticDonut({ parts, total, ...props }: StaticDonutProps) {
	let used = 0;
	return (
		<svg
			data-slot="static-donut"
			viewBox="0 0 208 208"
			aria-hidden="true"
			focusable="false"
			{...props}
		>
			{parts.map(({ key, value, color }) => {
				const start = used / total;
				used += value;
				const end = used / total;
				return (
					<path
						key={key}
						data-part={key}
						data-start={start}
						data-end={end}
						data-value={value}
						d={sector(start, end)}
						fill={color}
					/>
				);
			})}
		</svg>
	);
}
