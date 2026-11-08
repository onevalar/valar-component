import { flushSync, mount, tick, unmount } from "svelte";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ControlledAction from "./fixtures/controlled-confirm-action.svelte";
import { ConfirmAction } from "../src/lib/registry/ui/confirm-action/index.js";
import { StaticDonut } from "../src/lib/registry/ui/donut-chart/index.js";
import { Gauge, GaugeArc } from "../src/lib/registry/ui/gauge/index.js";
import { RulerSlider } from "../src/lib/registry/ui/ruler-slider/index.js";
import { SegmentedControl } from "../src/lib/registry/ui/segmented-control/index.js";
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
const button = (text: string) =>
	Array.from(document.querySelectorAll("button")).find(
		(node) => node.textContent?.trim() === text
	)!;
const action = () => document.querySelector<HTMLElement>('[data-slot="confirm-action"]')!;
const settle = async () => {
	flushSync();
	await tick();
	flushSync();
};
const ask = async () => {
	button("Remove").click();
	await settle();
	vi.advanceTimersByTime(300);
};

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

it("segmented selection cannot clear, skips disabled options and follows keyboard focus", () => {
	const change = vi.fn();
	const intent = vi.fn();
	app = mount(SegmentedControl, {
		target: document.body,
		props: {
			label: "Measure",
			value: "a",
			options: [
				{ value: "a", label: "A" },
				{ value: "x", label: "Unavailable", disabled: true },
				{ value: "b", label: "B" },
			],
			onValueChange: change,
			onOptionIntent: intent,
		},
	});
	flushSync();
	button("A").click();
	flushSync();
	// Bits UI uses single-selection radio semantics rather than React's pressed buttons.
	expect(button("A").getAttribute("aria-checked")).toBe("true");
	expect(change).not.toHaveBeenCalled();
	button("A").dispatchEvent(
		new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
	);
	flushSync();
	expect(button("A").getAttribute("aria-checked")).toBe("true");
	button("A").dispatchEvent(
		new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
	);
	flushSync();
	expect(change).toHaveBeenLastCalledWith("b");
	expect(button("B").getAttribute("aria-checked")).toBe("true");
	expect(document.activeElement).toBe(button("B"));
	button("B").dispatchEvent(
		new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true })
	);
	flushSync();
	expect(change).toHaveBeenLastCalledWith("a");
	expect(intent).toHaveBeenCalledWith("b");
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

it("confirms once, announces localized pending/result and offers undo", async () => {
	let resolve!: () => void;
	const onConfirm = vi.fn(
		() =>
			new Promise<void>((done) => {
				resolve = done;
			})
	);
	const onUndo = vi.fn();
	app = mount(ConfirmAction, {
		target: document.body,
		props: {
			label: "Remove",
			confirmLabel: "Yes",
			pendingLabel: "正在移除",
			doneLabel: "已移除",
			onConfirm,
			onUndo,
		},
	});
	await settle();
	await ask();
	button("Yes").click();
	button("Yes")?.click();
	await settle();
	expect(onConfirm).toHaveBeenCalledTimes(1);
	expect(action().dataset.state).toBe("pending");
	expect(document.activeElement).toBe(action());
	expect(action().textContent).toContain("正在移除");
	resolve();
	await settle();
	expect(action().dataset.state).toBe("done");
	button("Undo").click();
	await settle();
	expect(onUndo).toHaveBeenCalledTimes(1);
	expect(action().dataset.state).toBe("idle");
});

it("shows rejection, retries the failed operation, and respects disabled on a confirming face", async () => {
	const onConfirm = vi.fn().mockRejectedValueOnce(new Error("No")).mockResolvedValueOnce(undefined);
	app = mount(ConfirmAction, {
		target: document.body,
		props: { label: "Remove", confirmLabel: "Yes", onConfirm, errorLabel: "失败" },
	});
	await settle();
	await ask();
	button("Yes").click();
	await settle();
	expect(action().dataset.state).toBe("error");
	expect(action().textContent).toContain("失败");
	button("Retry").click();
	await settle();
	expect(action().dataset.state).toBe("done");
	expect(onConfirm).toHaveBeenCalledTimes(2);
});

it("Escape and outside pointer cancel, restore focus without firing confirm", async () => {
	const onConfirm = vi.fn();
	const onCancel = vi.fn();
	app = mount(ConfirmAction, {
		target: document.body,
		props: { label: "Remove", onConfirm, onCancel },
	});
	await settle();
	await ask();
	action().dispatchEvent(
		new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
	);
	await settle();
	expect(action().dataset.state).toBe("idle");
	expect(document.activeElement).toBe(button("Remove"));
	await ask();
	document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
	await settle();
	expect(onCancel).toHaveBeenCalledTimes(2);
	expect(onConfirm).not.toHaveBeenCalled();
});

it("does not activate an initially disabled confirming action", async () => {
	const onConfirm = vi.fn();
	app = mount(ConfirmAction, {
		target: document.body,
		props: {
			label: "Remove",
			confirmLabel: "Yes",
			defaultState: "confirming",
			disabled: true,
			onConfirm,
		},
	});
	await settle();
	button("Yes").click();
	await settle();
	expect(onConfirm).not.toHaveBeenCalled();
	expect(button("Yes").disabled).toBe(true);
});

it("pauses the unanswered timeout through focus moves and expires after leaving", async () => {
	const onCancel = vi.fn();
	app = mount(ConfirmAction, {
		target: document.body,
		props: { label: "Remove", defaultState: "confirming", confirmTimeout: 500, onCancel },
	});
	await settle();
	button("Delete").focus();
	flushSync();
	vi.advanceTimersByTime(2000);
	await settle();
	expect(onCancel).not.toHaveBeenCalled();
	button("Cancel").focus();
	flushSync();
	vi.advanceTimersByTime(1000);
	await settle();
	expect(onCancel).not.toHaveBeenCalled();
	button("Cancel").blur();
	flushSync();
	vi.advanceTimersByTime(501);
	await settle();
	expect(onCancel).toHaveBeenCalledTimes(1);
});

it("cancels countdown and incomplete holds without submitting", async () => {
	const onConfirm = vi.fn();
	app = mount(ConfirmAction, {
		target: document.body,
		props: {
			label: "Remove",
			confirmLabel: "Yes",
			confirmMode: "countdown",
			countdown: 2,
			onConfirm,
		},
	});
	await settle();
	await ask();
	button("Yes").click();
	await settle();
	expect(action().dataset.face).toBe("counting");
	vi.advanceTimersByTime(1000);
	await settle();
	button("Cancel").click();
	await settle();
	vi.advanceTimersByTime(3000);
	await settle();
	expect(onConfirm).not.toHaveBeenCalled();
});

it("ignores late async completions after controlled reset and still accepts subsequent work", async () => {
	let resolve!: () => void;
	const onConfirm = vi.fn(
		() =>
			new Promise<void>((done) => {
				resolve = done;
			})
	);
	app = mount(ControlledAction, { target: document.body, props: { onConfirm } });
	await settle();
	await ask();
	button("Yes").click();
	await settle();
	expect(action().dataset.state).toBe("pending");
	button("Reset").click();
	await settle();
	resolve();
	await settle();
	expect(action().dataset.state).toBe("idle");
	await ask();
	button("Yes").click();
	await settle();
	resolve();
	await settle();
	expect(action().dataset.state).toBe("done");
});

it("teardown invalidates unresolved promises", async () => {
	let resolve!: () => void;
	const change = vi.fn();
	app = mount(ConfirmAction, {
		target: document.body,
		props: {
			label: "Remove",
			confirmLabel: "Yes",
			onConfirm: () =>
				new Promise<void>((done) => {
					resolve = done;
				}),
			onStateChange: change,
		},
	});
	await settle();
	await ask();
	button("Yes").click();
	await settle();
	await unmount(app);
	app = undefined;
	const calls = change.mock.calls.length;
	resolve();
	await settle();
	expect(change).toHaveBeenCalledTimes(calls);
});
