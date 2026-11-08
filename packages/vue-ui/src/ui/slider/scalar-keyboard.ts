export interface ScalarKey {
	key: string;
	shiftKey?: boolean;
	altKey?: boolean;
	ctrlKey?: boolean;
	metaKey?: boolean;
	defaultPrevented?: boolean;
}

/** Final scalar values stay on the min-relative step grid, including End. */
export function scalarKeyValue(
	event: ScalarKey,
	value: number,
	min = 0,
	max = 100,
	step = 1,
	largeStep = step * 2
): number | undefined {
	if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
	// Round floating-point division noise before flooring (e.g. 0.3 / 0.1).
	const lastStep = Math.floor(Number(((max - min) / step).toFixed(10)));
	const gridMax = Number((min + lastStep * step).toFixed(10));
	const delta = ["ArrowRight", "ArrowUp"].includes(event.key)
		? event.shiftKey
			? largeStep
			: step
		: ["ArrowLeft", "ArrowDown"].includes(event.key)
			? -(event.shiftKey ? largeStep : step)
			: event.key === "PageUp"
				? largeStep
				: event.key === "PageDown"
					? -largeStep
					: undefined;
	if (event.key === "Home") return min;
	if (event.key === "End") return gridMax;
	if (delta === undefined) return;
	return Math.min(
		gridMax,
		Math.max(min, Number((min + Math.round((value + delta - min) / step) * step).toFixed(10)))
	);
}
