import { CalendarDate, parseDate } from "@internationalized/date";

export const grains = ["day", "month", "quarter", "half", "year"] as const;
export type Grain = (typeof grains)[number];
export type Timeframe = { date: string; grain: Grain };

export function dateLabel(value: Timeframe, locale = "en") {
	const date = parseDate(value.date);
	if (value.grain === "year") return String(date.year);
	if (value.grain === "half" || value.grain === "quarter") {
		const months = value.grain === "half" ? 6 : 3;
		const prefix = value.grain === "half" ? "H" : "Q";
		return prefix + Math.ceil(date.month / months) + " " + date.year;
	}
	const options: Intl.DateTimeFormatOptions =
		value.grain === "month"
			? { month: "short", year: "numeric" }
			: { month: "short", day: "numeric" };
	return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(
		date.toDate("UTC")
	);
}

export function timeframeEnd(value: Timeframe) {
	const date = parseDate(value.date);
	const months = { day: 0, month: 1, quarter: 3, half: 6, year: 12 }[value.grain];
	if (!months) return date;
	const lastMonth = date.add({ months: months - 1 });
	return lastMonth.set({ day: lastMonth.calendar.getDaysInMonth(lastMonth) });
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

export function inferTimeframe(
	input: string,
	referenceYear = new Date().getFullYear()
): Timeframe | undefined {
	const value = input.trim();
	function parseISO(iso: string, precision: Grain): Timeframe | undefined {
		const date = parseDate(iso).toString();
		if (date === iso) return { date, grain: precision };
	}
	try {
		if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseISO(value, "day");
		const american = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
		if (american) {
			const [, month, day, year] = american;
			return parseISO(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`, "day");
		}
		if (/^\d{4}$/.test(value)) return parseISO(value + "-01-01", "year");
		if (/^\d{4}-\d{2}$/.test(value)) return parseISO(value + "-01", "month");

		const namedMonth = /^([a-z]+)\.?\s+(\d{4})$/i.exec(value);
		if (namedMonth) {
			const word = namedMonth[1].toLowerCase();
			const month = monthNames.findIndex((name) => name === word || name.slice(0, 3) === word);
			if (month !== -1)
				return parseISO(`${namedMonth[2]}-${String(month + 1).padStart(2, "0")}-01`, "month");
		}
		const period = /^(Q[1-4]|H[1-2])(?:\s+(\d{4}))?$/i.exec(value);
		if (period) {
			const unit = period[1].toUpperCase();
			const precision = unit.startsWith("Q") ? "quarter" : "half";
			const year = period[2] ? Number(period[2]) : referenceYear;
			if (year < 1 || year > 9999) return;
			const month = 1 + (Number(unit[1]) - 1) * (precision === "quarter" ? 3 : 6);
			return { date: new CalendarDate(year, month, 1).toString(), grain: precision };
		}
	} catch {
		return undefined;
	}
}
