/** One serializable baseline for all three real native consumer applications. */
export const fixture = {
	date: "2026-11-12",
	month: "2026-11-01",
	range: { start: "2026-11-10", end: "2026-11-14" },
	options: [
		{ value: "claude", label: "Claude" },
		{ value: "codex", label: "Codex" },
		{ value: "cursor", label: "Cursor" },
	],
	slider: { initial: 37, min: -20, max: 80, step: 3, largeStep: 6 },
	chart: [
		{ label: "一", value: 0 },
		{ label: "二", value: 17 },
		{ label: "三", value: null },
		{ label: "四", value: 9 },
		{ label: "五", value: 31 },
		{ label: "六", value: 4 },
		{ label: "日", value: 22 },
	],
};
