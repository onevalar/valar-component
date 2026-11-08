// Adapted from Arc's free WaffleChart, copyright (c) 2026 Elia Kuratli (MIT, LICENSE.md).
export type WaffleCategory = { key: string; value: number; color: string };

/** Largest remainders; equal shares preserve source order. Zero total has no cells. */
export function allocate(data: WaffleCategory[]): number[] {
	const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);
	if (total <= 0) return data.map(() => 0);
	const exact = data.map((item) => (Math.max(0, item.value) / total) * 100);
	const counts = exact.map(Math.floor);
	const left = 100 - counts.reduce((sum, count) => sum + count, 0);
	const order = exact
		.map((value, index) => ({ index, rest: value - Math.floor(value) }))
		.sort((a, b) => b.rest - a.rest);
	for (let k = 0; k < left && k < order.length; k++) counts[order[k].index]++;
	return counts;
}
