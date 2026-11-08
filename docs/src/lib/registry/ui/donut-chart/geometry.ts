// Adapted from Arc's free DonutChart, copyright (c) 2026 Elia Kuratli (MIT, LICENSE.md).
export type DonutPart = { key: string; value: number; color: string };
const coordinate = (value: number) => (Math.round(value * 1e6) / 1e6).toString();

export function sector(
	c: number,
	outer: number,
	inner: number,
	start: number,
	end: number
): string {
	const turns = end - start;
	if (turns <= 0) return "";
	const at = (radius: number, angle: number) =>
		`${coordinate(c + radius * Math.cos(angle))} ${coordinate(c + radius * Math.sin(angle))}`;
	if (turns >= 1)
		return `M${at(outer, -Math.PI / 2)}A${outer} ${outer} 0 1 1 ${at(outer, Math.PI / 2)}A${outer} ${outer} 0 1 1 ${at(outer, -Math.PI / 2)}ZM${at(inner, -Math.PI / 2)}A${inner} ${inner} 0 1 0 ${at(inner, Math.PI / 2)}A${inner} ${inner} 0 1 0 ${at(inner, -Math.PI / 2)}Z`;
	const a0 = start * Math.PI * 2 - Math.PI / 2;
	const a1 = end * Math.PI * 2 - Math.PI / 2;
	const big = a1 - a0 > Math.PI ? 1 : 0;
	return `M${at(outer, a0)}A${outer} ${outer} 0 ${big} 1 ${at(outer, a1)}L${at(inner, a1)}A${inner} ${inner} 0 ${big} 0 ${at(inner, a0)}Z`;
}
