import { flushSync, mount, unmount } from "svelte";
import { afterEach, expect, it, vi } from "vitest";
import { Slider } from "../src/lib/registry/ui/slider/index.js";

// jsdom lacks the layout observer used by the real Bits UI primitive.
globalThis.ResizeObserver ??= class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof ResizeObserver;

let app: ReturnType<typeof mount> | undefined;
afterEach(async () => {
	if (app) await unmount(app);
	app = undefined;
	document.body.innerHTML = "";
});
const thumb = () => document.querySelector<HTMLElement>('[role="slider"]')!;
function key(key: string, options: KeyboardEventInit = {}) {
	const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...options });
	thumb().dispatchEvent(event);
	flushSync();
	return event;
}

it("opt-in scalar sliders support every arrow, Shift/Page double steps, Home/End and one callback per edit", () => {
	const change = vi.fn(),
		commit = vi.fn();
	app = mount(Slider, {
		target: document.body,
		props: {
			type: "single",
			value: 60,
			min: 20,
			max: 100,
			step: 5,
			largeStep: 10,
			"aria-label": "Transparency",
			onValueChange: change,
			onValueCommit: commit,
		},
	});
	flushSync();
	for (const [name, value, shiftKey] of [
		["ArrowRight", 65],
		["ArrowUp", 70],
		["ArrowLeft", 65],
		["ArrowDown", 60],
		["ArrowRight", 70, true],
		["ArrowLeft", 60, true],
		["PageUp", 70],
		["PageDown", 60],
		["Home", 20],
		["End", 100],
	] as const) {
		const count = change.mock.calls.length;
		expect(key(name, { shiftKey }).defaultPrevented).toBe(true);
		expect(thumb().getAttribute("aria-valuenow")).toBe(String(value));
		expect(change).toHaveBeenCalledTimes(count + 1);
		expect(commit).toHaveBeenCalledTimes(count + 1);
		expect(change).toHaveBeenLastCalledWith(value);
		expect(commit).toHaveBeenLastCalledWith(value);
	}
	key("End");
	expect(change).toHaveBeenCalledTimes(10);
});

it("opt-in modified slider navigation bubbles unchanged for application/browser shortcuts", () => {
	const change = vi.fn(),
		observed: boolean[] = [];
	app = mount(Slider, {
		target: document.body,
		props: { type: "single", value: 60, step: 5, largeStep: 10, onValueChange: change },
	});
	flushSync();
	const listener = (event: KeyboardEvent) => observed.push(event.defaultPrevented);
	window.addEventListener("keydown", listener);
	try {
		for (const modifier of ["altKey", "metaKey", "ctrlKey"])
			for (const name of ["ArrowLeft", "ArrowDown", "Home", "PageUp"]) {
				expect(key(name, { [modifier]: true }).defaultPrevented).toBe(false);
				expect(thumb().getAttribute("aria-valuenow")).toBe("60");
			}
		expect(observed).toEqual(Array(12).fill(false));
		expect(change).not.toHaveBeenCalled();
	} finally {
		window.removeEventListener("keydown", listener);
	}
});

it("custom scalar largeStep is honored while multiple-thumb keyboard logic remains Bits-owned", async () => {
	app = mount(Slider, {
		target: document.body,
		props: { type: "single", value: 20, step: 0.5, largeStep: 5 },
	});
	flushSync();
	key("PageUp");
	expect(thumb().getAttribute("aria-valuenow")).toBe("25");
	await unmount(app);
	document.body.innerHTML = "";
	const change = vi.fn();
	app = mount(Slider, {
		target: document.body,
		props: { type: "multiple", value: [20, 80], step: 1, onValueChange: change },
	});
	flushSync();
	key("ArrowRight");
	expect(change).toHaveBeenLastCalledWith([21, 80]);
	expect(change).toHaveBeenCalledTimes(1);
});

it("default scalar navigation retains Bits UI keyboard behavior", () => {
	const change = vi.fn();
	app = mount(Slider, {
		target: document.body,
		props: { type: "single", value: 60, min: 20, max: 100, step: 5, onValueChange: change },
	});
	flushSync();
	expect(key("PageUp").defaultPrevented).toBe(false);
	expect(change).not.toHaveBeenCalled();
	key("ArrowRight", { shiftKey: true });
	expect(change).toHaveBeenLastCalledWith(65);
});
