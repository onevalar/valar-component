// Adapted from Arc's free WaffleChart, copyright (c) 2026 Elia Kuratli (MIT, LICENSE.md).
export type WaffleCategory = { key: string; value: number; color: string };

/** Largest remainders; equal shares preserve source order. Zero total has no cells. */
export function allocate(data: WaffleCategory[]): number[] {
	const weights = data.map(({ value }) => (Number.isFinite(value) && value > 0 ? value : 0));
	const maximum = weights.reduce((largest, weight) => Math.max(largest, weight), 0);
	if (maximum === 0) return weights;
	// Scale first so that even very large finite categories have a finite sum.
	const scaled = weights.map((weight) => weight / maximum);
	const total = scaled.reduce((sum, weight) => sum + weight, 0);
	const exact = scaled.map((weight) => (weight / total) * 100);
	const counts = exact.map(Math.floor);
	const left = 100 - counts.reduce((sum, count) => sum + count, 0);
	const order = exact
		.map((value, index) => ({ index, rest: value - Math.floor(value) }))
		.sort((a, b) => b.rest - a.rest);
	for (let k = 0; k < left && k < order.length; k++) counts[order[k].index]++;
	return counts;
}
