import { flushSync, mount, unmount } from "svelte";
import { afterEach, expect, it } from "vitest";
import { StaticSparkline } from "../src/lib/registry/ui/sparkline/index.js";

const apps: ReturnType<typeof mount>[] = [];
afterEach(async () => {
	for (const app of apps.splice(0)) await unmount(app);
});

function render(values: (number | null)[]) {
	const target = document.createElement("div");
	apps.push(mount(StaticSparkline, { target, props: { values, appearance: "project" } }));
	flushSync();
	return target;
}

it("fills connected runs to zero and preserves missing weeks and isolated points", () => {
	const chart = render([0, 2, null, 4, 5, null, 3, null]);
	expect(chart.querySelector('[data-slot="sparkline-line"]')?.getAttribute("d")).toBe(
		"M4.00,28.00 L17.71,18.40  M45.14,8.80 L58.86,4.00  M86.29,13.60 "
	);
	expect(chart.querySelector('[data-slot="sparkline-area"]')?.getAttribute("d")).toBe(
		"M4.00,28.00 L17.71,18.40 V28 H4.00 Z M45.14,8.80 L58.86,4.00 V28 H45.14 Z"
	);
	expect(Array.from(chart.querySelectorAll("circle"), (point) => point.getAttribute("cx"))).toEqual(
		[String(4 + (6 / 7) * 96)]
	);
});

it("does not fill an all-zero or empty series", () => {
	for (const values of [[], [0, 0], [null, NaN, -1]]) {
		const chart = render(values);
		expect(chart.querySelector('[data-slot="sparkline-area"]')).toBeNull();
	}
});

it("gives each rendered fade its own gradient reference", () => {
	const charts = [render([1, 2]), render([1, 2])];
	const gradients = charts.map((chart) => chart.querySelector("linearGradient")?.id);
	expect(gradients[0]).toBeTruthy();
	expect(gradients[1]).toBeTruthy();
	expect(gradients[0]).not.toBe(gradients[1]);
	for (const [index, chart] of charts.entries()) {
		expect(chart.querySelector('[data-slot="sparkline-area"]')?.getAttribute("fill")).toBe(
			`url(#${gradients[index]})`
		);
	}
});
