// Adapted from Arc's free Gauge, copyright (c) 2026 Elia Kuratli (MIT, LICENSE.md).
export function arcFor(sweep: number, radius = 42): string {
	const start = -135;
	const end = start + 270 * Math.min(1, Math.max(0, sweep));
	const at = (angle: number) =>
		`${(50 + radius * Math.sin((angle * Math.PI) / 180)).toFixed(3)} ${(50 - radius * Math.cos((angle * Math.PI) / 180)).toFixed(3)}`;
	return `M ${at(start)} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${at(end)}`;
}
