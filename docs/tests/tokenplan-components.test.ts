import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { StaticDonut } from "../src/lib/registry/ui/donut-chart/index.js";
import { Gauge, GaugeArc } from "../src/lib/registry/ui/gauge/index.js";
import { RulerSlider } from "../src/lib/registry/ui/ruler-slider/index.js";
import { StaticSparkline } from "../src/lib/registry/ui/sparkline/index.js";
import { TickMeter } from "../src/lib/registry/ui/tick-meter/index.js";
import { WaffleChart } from "../src/lib/registry/ui/waffle-chart/index.js";

// Exercise the actual Spinner with the same Lucide replacement as registry packaging.
vi.mock("$lib/components/icon-placeholder/icon-placeholder.svelte", async () => ({
	default: (await import("@lucide/svelte/icons/loader-circle")).default,
}));

globalThis.ResizeObserver ??= class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof ResizeObserver;

let app: ReturnType<typeof mount> | undefined;
beforeEach(() => {
	vi.stubGlobal("matchMedia", () => Object.assign(new EventTarget(), { matches: true }));
	vi.useFakeTimers({
		toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "performance"],
	});
});
afterEach(async () => {
	if (app) await unmount(app);
	app = undefined;
	document.body.innerHTML = "";
	vi.useRealTimers();
	vi.unstubAllGlobals();
});
it("bounds gauge geometry/range but preserves overflow text and forwards native onclick", () => {
	const onclick = vi.fn();
	app = mount(Gauge, {
		target: document.body,
		props: { value: 125, label: "Quota", valueText: "125 percent used", onclick },
	});
	flushSync();
	const meter = document.querySelector<HTMLElement>('[role="meter"]')!;
	expect(meter.getAttribute("aria-valuenow")).toBe("100");
	expect(meter.getAttribute("aria-valuetext")).toBe("125 percent used");
	expect(meter.textContent).toContain("125");
	expect(meter.querySelectorAll("path")).toHaveLength(2);
	meter.click();
	expect(onclick).toHaveBeenCalledTimes(1);
});

it("draws only a dashed missing GaugeArc track", () => {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	document.body.append(svg);
	app = mount(GaugeArc, { target: svg, props: { value: null, radius: 28 } });
	flushSync();
	expect(svg.querySelectorAll("path")).toHaveLength(1);
	expect(svg.querySelector("path")?.getAttribute("stroke-dasharray")).toBe("3 6");
	expect(svg.querySelector("path")?.getAttribute("d")).toContain("A 28 28");
});

it.each([
	[0, 0],
	[50, 30],
	[100, 60],
	[140, 60],
	[-10, 0],
])("independent tick meter %s has sixty lines and %s filled", (value, filled) => {
	app = mount(TickMeter, {
		target: document.body,
		props: { value, label: "Quota", valueText: `${value}%`, tone: "danger" },
	});
	flushSync();
	expect(document.querySelectorAll("line")).toHaveLength(60);
	expect(document.querySelectorAll('line[data-filled="true"]')).toHaveLength(filled);
	expect(document.querySelector('[role="meter"]')?.getAttribute("aria-valuenow")).toBe(
		String(Math.min(100, Math.max(0, value)))
	);
	expect(document.querySelector('[role="meter"]')?.getAttribute("aria-valuetext")).toBe(
		`${value}%`
	);
	expect(document.body.textContent).toContain(`${value}%`);
	expect(document.querySelector("mask, animate, circle")).toBeNull();
});

it("allocates 100 waffle cells stably and starts at bottom-left", () => {
	app = mount(WaffleChart, {
		target: document.body,
		props: {
			label: "Exact values below",
			data: ["a", "b", "c"].map((key) => ({ key, value: 1, color: "var(--primary)" })),
		},
	});
	flushSync();
	expect(document.querySelectorAll("[data-category]")).toHaveLength(100);
	expect(document.querySelectorAll('[data-category="a"]')).toHaveLength(34);
	const first = document.querySelector<HTMLElement>("[data-category]")!;
	expect(first.style.gridColumn).toBe("1");
	expect(first.style.gridRow).toBe("10");
});

it("does not invent waffle cells for empty/zero/negative data", () => {
	app = mount(WaffleChart, {
		target: document.body,
		props: {
			label: "No records",
			data: [
				{ key: "zero", value: 0, color: "red" },
				{ key: "negative", value: -3, color: "blue" },
			],
		},
	});
	flushSync();
	expect(document.querySelectorAll("[data-category]")).toHaveLength(0);
});

it("keeps the donut's fixed denominator and represents a full turn without a seam", () => {
	app = mount(StaticDonut, {
		target: document.body,
		props: {
			total: 100,
			parts: [
				{ key: "a", value: 25, color: "red" },
				{ key: "b", value: 0, color: "blue" },
			],
		},
	});
	flushSync();
	expect(document.querySelector('[data-part="a"]')?.getAttribute("data-end")).toBe("0.25");
	expect(document.querySelector('[data-part="b"]')?.getAttribute("d")).toBe("");
	expect(document.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
});

it("sparkline leaves null calendar gaps and retains a zero/isolated point", () => {
	app = mount(StaticSparkline, { target: document.body, props: { values: [0, null, 2] } });
	flushSync();
	expect(document.querySelector("path")?.getAttribute("d")).toBe("M4.00,36.00  M68.00,4.00");
	expect(document.querySelectorAll("circle")).toHaveLength(2);
	expect(document.querySelector("circle")?.getAttribute("r")).toBe("2");
});

it("ruler tape submits a number, localizes spoken values and commits keyboard edits", () => {
	const form = document.createElement("form");
	document.body.append(form);
	const change = vi.fn();
	const commit = vi.fn();
	app = mount(RulerSlider, {
		target: form,
		props: {
			label: "Reference",
			value: 20,
			name: "budget",
			min: 0,
			max: 100,
			step: 0.5,
			majorEvery: 10,
			unit: "USD",
			format: (n) => `$${n}`,
			onValueChange: change,
			onValueCommit: commit,
		},
	});
	flushSync();
	const slider = form.querySelector<HTMLElement>('[role="slider"]')!;
	expect(slider.getAttribute("aria-valuetext")).toBe("$20 USD");
	slider.dispatchEvent(
		new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
	);
	flushSync();
	expect(change).toHaveBeenLastCalledWith(20.5);
	expect(commit).toHaveBeenLastCalledWith(20.5);
	expect(new FormData(form).get("budget")).toBe("20.5");
	slider.dispatchEvent(
		new KeyboardEvent("keydown", { key: "PageUp", bubbles: true, cancelable: true })
	);
	flushSync();
	expect(new FormData(form).get("budget")).toBe("25.5");
});

it("disabled ruler cannot change or submit", () => {
	const form = document.createElement("form");
	document.body.append(form);
	const change = vi.fn();
	app = mount(RulerSlider, {
		target: form,
		props: { label: "Reference", value: 25, name: "budget", disabled: true, onValueChange: change },
	});
	flushSync();
	form
		.querySelector('[role="slider"]')!
		.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true, cancelable: true }));
	flushSync();
	expect(change).not.toHaveBeenCalled();
	expect(new FormData(form).has("budget")).toBe(false);
});
