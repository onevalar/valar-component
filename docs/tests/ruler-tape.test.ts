import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RulerSlider, type RulerSliderProps } from "../src/lib/registry/ui/ruler-slider/index.js";

let app: ReturnType<typeof mount> | undefined;
let frames: Map<number, FrameRequestCallback>, nextFrame: number;
let preference: EventTarget & { matches: boolean };
const slider = () => document.querySelector<HTMLDivElement>('[role="slider"]')!;
const tape = () => document.querySelector<HTMLElement>('[data-slot="ruler-slider-tape"]')!;
const value = () => Number(slider().getAttribute("aria-valuenow"));
const offset = () => Number(tape().style.transform.match(/translateX\(([-.\d]+)px\)/)![1]);
beforeEach(() => {
	vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
	frames = new Map();
	nextFrame = 0;
	vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
		frames.set(++nextFrame, callback);
		return nextFrame;
	});
	vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
	preference = Object.assign(new EventTarget(), { matches: false });
	vi.stubGlobal("matchMedia", () => preference);
});
afterEach(async () => {
	if (app) await unmount(app);
	app = undefined;
	document.body.innerHTML = "";
	vi.useRealTimers();
	vi.unstubAllGlobals();
});
function render(props: Partial<RulerSliderProps> = {}) {
	const change = vi.fn(),
		commit = vi.fn();
	app = mount(RulerSlider, {
		target: document.body,
		props: {
			label: "Reference",
			defaultValue: 50,
			spacing: 2,
			onValueChange: change,
			onValueCommit: commit,
			...props,
		},
	});
	flushSync();
	vi.spyOn(slider(), "getBoundingClientRect").mockReturnValue({ left: 0, width: 400 } as DOMRect);
	return { change, commit };
}
function advance(milliseconds: number) {
	for (let remaining = milliseconds; remaining > 0; remaining -= 16) {
		vi.advanceTimersByTime(Math.min(16, remaining));
		const callbacks = [...frames.values()];
		frames.clear();
		for (const callback of callbacks) callback(performance.now());
		flushSync();
	}
}
function pointer(type: string, x: number, pointerId = 1) {
	const event = new MouseEvent(type, { clientX: x, button: 0, bubbles: true });
	Object.defineProperties(event, {
		isPrimary: { value: true },
		pointerId: { value: pointerId },
		timeStamp: { value: performance.now() },
	});
	slider().dispatchEvent(event);
	flushSync();
}
function wheel(x: number, y = 0) {
	const event = new WheelEvent("wheel", { deltaX: x, deltaY: y, bubbles: true, cancelable: true });
	slider().dispatchEvent(event);
	flushSync();
	return event;
}

it("moves the tape inversely by spacing, not absolute slider width; commits only on release", () => {
	const { change, commit } = render();
	pointer("pointerdown", 200);
	advance(100);
	pointer("pointermove", 180);
	expect(value()).toBe(60);
	expect(offset()).toBe(-120);
	expect(change).toHaveBeenLastCalledWith(60);
	expect(commit).not.toHaveBeenCalled();
	advance(80);
	pointer("pointerup", 180);
	advance(2500);
	expect(value()).toBe(60);
	expect(commit).toHaveBeenCalledExactlyOnceWith(60);
});

it("flicks through ticks with one delayed final commit and can catch the moving tape", () => {
	const { change, commit } = render();
	pointer("pointerdown", 200);
	advance(32);
	pointer("pointermove", 192);
	advance(32);
	pointer("pointermove", 184);
	pointer("pointerup", 184);
	expect(value()).toBe(58);
	expect(commit).not.toHaveBeenCalled();
	advance(160);
	expect(value()).toBeGreaterThan(58);
	expect(change.mock.calls.length).toBeGreaterThan(2);
	const caught = offset();
	pointer("pointerdown", 200);
	advance(200);
	expect(offset()).toBe(caught);
	expect(commit).not.toHaveBeenCalled();
	pointer("pointermove", 190);
	expect(offset()).toBeCloseTo(caught - 10, 6);
	pointer("pointercancel", 190);
	advance(3000);
	expect(commit).toHaveBeenCalledTimes(1);
	expect(offset()).toBe(-value() * 2);
});

it.each(["pointercancel", "lostpointercapture"])(
	"rubber-bands without overflowing ARIA and %s settles at boundary without a flick",
	(end) => {
		const { commit } = render({ defaultValue: 0 });
		pointer("pointerdown", 200);
		advance(32);
		pointer("pointermove", 300);
		expect(value()).toBe(0);
		expect(offset()).toBeGreaterThan(0);
		expect(offset()).toBeLessThan(44);
		pointer(end, 300);
		expect(commit).not.toHaveBeenCalled();
		advance(2500);
		expect(offset()).toBe(0);
		expect(commit).toHaveBeenCalledExactlyOnceWith(0);
	}
);

it("tap has 4px slop and glides the tapped tick to the fixed center with immediate target commit", () => {
	const { change, commit } = render();
	pointer("pointerdown", 220);
	pointer("pointermove", 222);
	pointer("pointerup", 222);
	expect(value()).toBe(61);
	expect(commit).toHaveBeenCalledExactlyOnceWith(61);
	expect(offset()).toBe(-100);
	advance(800);
	expect(offset()).toBe(-122);
	expect(change).toHaveBeenCalledTimes(1);
});

it("horizontal-dominant wheel accumulates fractional ticks and commits once after 120ms; vertical scroll passes untouched", () => {
	const { change, commit } = render();
	expect(wheel(1, 20).defaultPrevented).toBe(false);
	expect(wheel(20, 20).defaultPrevented).toBe(false);
	expect(value()).toBe(50);
	expect(change).not.toHaveBeenCalled();
	expect(wheel(7, 1).defaultPrevented).toBe(true);
	expect(value()).toBe(54);
	advance(80);
	wheel(7);
	expect(value()).toBe(57);
	advance(119);
	expect(commit).not.toHaveBeenCalled();
	advance(1);
	expect(commit).toHaveBeenCalledExactlyOnceWith(57);
	advance(500);
	expect(offset()).toBe(-114);
});

it("reduced motion keeps drag, tap and wheel input but suppresses elasticity and inertia", () => {
	preference.matches = true;
	const { commit } = render({ defaultValue: 0 });
	pointer("pointerdown", 200);
	advance(32);
	pointer("pointermove", 300);
	expect(offset()).toBe(0);
	pointer("pointerup", 300);
	expect(commit).toHaveBeenCalledExactlyOnceWith(0);
	pointer("pointerdown", 200);
	advance(32);
	pointer("pointermove", 180);
	pointer("pointerup", 180);
	expect(value()).toBe(10);
	expect(offset()).toBe(-20);
	expect(frames.size).toBe(0);
	wheel(11);
	advance(120);
	expect(offset()).toBe(-32);
	expect(frames.size).toBe(0);
});

it("unmount removes wheel/gesture listeners and cancels queued frames and commits", async () => {
	const { change, commit } = render();
	const node = slider();
	wheel(10);
	pointer("pointerdown", 200);
	advance(20);
	pointer("pointermove", 180);
	pointer("pointerup", 180);
	expect(frames.size).toBeGreaterThan(0);
	await unmount(app!);
	app = undefined;
	const count = change.mock.calls.length;
	advance(4000);
	node.dispatchEvent(new WheelEvent("wheel", { deltaX: 80 }));
	expect(frames.size).toBe(0);
	expect(commit).not.toHaveBeenCalled();
	expect(change).toHaveBeenCalledTimes(count);
});
