// Adapted from Valar Svelte's docs/src/lib/registry/ui/date-picker/date-value.ts
// (onevalar/valar-component, cfd989c9f63156774dbfb3871cc1fa1774e62ee5; MIT, see LICENSE).
// Keep the React and Vue copies of this dependency-free civil-date logic in sync.

export const grains = ["day", "month", "quarter", "half", "year"] as const;
export type Grain = (typeof grains)[number];
export type Timeframe = { date: string; grain: Grain };

const monthsPerPeriod: Record<Grain, number> = { day: 0, month: 1, quarter: 3, half: 6, year: 12 };

export const labels: Record<Grain, [string, string]> = {
	day: ["日", "Day"],
	month: ["月", "Month"],
	quarter: ["季度", "Quarter"],
	half: ["半年", "Half-year"],
	year: ["年", "Year"],
};

export const examples: Record<Grain, string> = {
	day: "YYYY-MM-DD",
	month: "YYYY-MM",
	quarter: "Q2 2027",
	half: "H1 2027",
	year: "2027",
};

export function dateLabel(value: Timeframe, locale = "en") {
	const [year, month] = value.date.split("-").map(Number);
	if (value.grain === "year") return String(year);
	if (value.grain === "half" || value.grain === "quarter") {
		const prefix = value.grain === "half" ? "H" : "Q";
		return `${prefix}${Math.ceil(month / monthsPerPeriod[value.grain])} ${year}`;
	}
	const options: Intl.DateTimeFormatOptions =
		value.grain === "month"
			? { month: "short", year: "numeric" }
			: { month: "short", day: "numeric" };
	return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(
		utcDate(value.date)
	);
}

export function utcDate(iso: string) {
	return new Date(`${iso}T00:00:00.000Z`);
}

/** Inclusive end of the timeframe as a YYYY-MM-DD civil date. */
export function timeframeEnd(value: Timeframe): string {
	const months = monthsPerPeriod[value.grain];
	if (!months) return value.date;
	const date = utcDate(value.date);
	date.setUTCMonth(date.getUTCMonth() + months, 0);
	return date.toISOString().slice(0, 10);
}

const monthNames = [
	"january",
	"february",
	"march",
	"april",
	"may",
	"june",
	"july",
	"august",
	"september",
	"october",
	"november",
	"december",
];

export function parseTimeframe(input: string, grain: Grain): Timeframe | undefined {
	const parsed = inferTimeframe(input);
	return parsed?.grain === grain ? parsed : undefined;
}

export function inferTimeframe(input: string, referenceYear = new Date().getFullYear()) {
	const value = input.trim();
	function parseISO(iso: string, grain: Grain): Timeframe | undefined {
		const date = utcDate(iso);
		if (date.getUTCFullYear() > 0 && date.toISOString().slice(0, 10) === iso) {
			return { date: iso, grain };
		}
	}
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseISO(value, "day");
	const american = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
	if (american) {
		const [, month, day, year] = american;
		return parseISO(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`, "day");
	}
	if (/^\d{4}$/.test(value)) return parseISO(`${value}-01-01`, "year");
	if (/^\d{4}-\d{2}$/.test(value)) return parseISO(`${value}-01`, "month");

	const namedMonth = /^([a-z]+)\.?\s+(\d{4})$/i.exec(value);
	if (namedMonth) {
		const word = namedMonth[1].toLowerCase();
		const month = monthNames.findIndex((name) => name === word || name.slice(0, 3) === word);
		if (month !== -1) {
			return parseISO(`${namedMonth[2]}-${String(month + 1).padStart(2, "0")}-01`, "month");
		}
	}
	const cycle = /^(Q[1-4]|H[1-2])(?:\s+(\d{4}))?$/i.exec(value);
	if (cycle) {
		const [, unit, year] = cycle;
		const periodYear = year ? Number(year) : referenceYear;
		if (!Number.isInteger(periodYear) || periodYear < 1 || periodYear > 9999) return;
		return period(
			periodYear,
			Number(unit[1]) - 1,
			unit[0].toUpperCase() === "Q" ? "quarter" : "half"
		);
	}
}

function period(year: number, index: number, grain: Exclude<Grain, "day">): Timeframe {
	const month = 1 + index * monthsPerPeriod[grain];
	return { date: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`, grain };
}

export function periodOptions(year: number, grain: Grain, locale: string) {
	if (grain === "day") return [];
	const month = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
	return [year, year + 1, year + 2]
		.filter((item) => item <= 9999)
		.map((item) => ({
			year: item,
			options: Array.from({ length: 12 / monthsPerPeriod[grain] }, (_, index) => {
				const value = period(item, index, grain);
				const label = dateLabel(value, locale);
				return {
					value,
					label,
					text: grain === "month" ? month.format(utcDate(value.date)) : label.split(" ")[0],
				};
			}),
		}));
}

export function inputValue(value: Timeframe) {
	const year = value.date.slice(0, 4);
	switch (value.grain) {
		case "day":
			return value.date;
		case "month":
			return value.date.slice(0, 7);
		case "year":
			return year;
		default:
			return `${dateLabel(value).split(" ")[0]} ${year}`;
	}
}

export function rangeError(
	value: Timeframe,
	min: string | undefined,
	max: string | undefined,
	chinese: boolean
) {
	if (min && max && min > max) return chinese ? "没有可选日期。" : "No dates are available.";
	if (min && timeframeEnd(value) < min)
		return chinese
			? "日期不能早于最早可选日期。"
			: "Date cannot precede the earliest available date.";
	if (max && value.date > max)
		return chinese ? "日期不能晚于最晚可选日期。" : "Date cannot follow the latest available date.";
	return "";
}
