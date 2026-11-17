// Adapted from Arc's free Gauge, copyright (c) 2026 Elia Kuratli (MIT, LICENSE.md).
export function arcFor(sweep: number, radius = 42, center = 50, angle = 270): string {
	const start = -angle / 2;
	const end = start + angle * Math.min(1, Math.max(0, sweep));
	const at = (angle: number) =>
		`${(center + radius * Math.sin((angle * Math.PI) / 180)).toFixed(3)} ${(center - radius * Math.cos((angle * Math.PI) / 180)).toFixed(3)}`;
	return `M ${at(start)} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${at(end)}`;
}
