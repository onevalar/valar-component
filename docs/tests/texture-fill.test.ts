import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createTextureFill, textures } from "../src/lib/registry/ui/texture-fill/canvas.js";

let renderer: ReturnType<typeof createTextureFill> | undefined;
let frames: Map<number, FrameRequestCallback>;
let frameId: number;
let now: number;
let resize: ResizeObserverCallback;
let recolor: MutationCallback;
let motion: EventTarget & { matches: boolean };
let disconnect: ReturnType<typeof vi.fn>;
let mutationDisconnect: ReturnType<typeof vi.fn>;
let paint: ReturnType<typeof vi.fn>;
let el: HTMLSpanElement;
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

beforeEach(() => {
	frames = new Map();
	frameId = 0;
	now = 0;
	disconnect = vi.fn();
	mutationDisconnect = vi.fn();
	paint = vi.fn();
	context = {
		fillStyle: "",
		fillRect: vi.fn(),
		getImageData: () => ({ data: new Uint8ClampedArray([12, 34, 56, 255]) }),
		createImageData: (width: number, height: number) => ({
			width,
			height,
			data: new Uint8ClampedArray(width * height * 4),
		}),
		putImageData: paint,
	} as unknown as CanvasRenderingContext2D;
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
	vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
		x: 0,
		y: 0,
		width: 32,
		height: 8,
		top: 0,
		left: 0,
		right: 32,
		bottom: 8,
		toJSON() {},
	});
	motion = Object.assign(new EventTarget(), { matches: true });
	vi.stubGlobal("matchMedia", () => motion);
	vi.stubGlobal("devicePixelRatio", 4);
	vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
		frames.set(++frameId, callback);
		return frameId;
	});
	vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
	vi.stubGlobal(
		"ResizeObserver",
		class {
			constructor(callback: ResizeObserverCallback) {
				resize = callback;
			}
			observe() {}
			disconnect = disconnect;
		}
	);
	vi.stubGlobal(
		"MutationObserver",
		class {
			constructor(callback: MutationCallback) {
				recolor = callback;
			}
			observe() {}
			disconnect = mutationDisconnect;
		}
	);
	el = document.createElement("span");
	canvas = document.createElement("canvas");
	el.append(canvas);
	document.body.append(el);
});
afterEach(() => {
	renderer?.destroy();
	renderer = undefined;
	document.body.innerHTML = "";
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function lastImage(): ImageData {
	return paint.mock.calls.at(-1)![0] as ImageData;
}
function frame() {
	const entries = [...frames.entries()];
	frames.clear();
	now += 16;
	for (const [, callback] of entries) callback(now);
}

it.each([...textures, "solid"] as const)(
	"renders %s at bounded values, DPR cap and resizes without motion",
	(texture) => {
		renderer = createTextureFill(el, canvas, texture, 140, true);
		expect(canvas.width).toBe(96);
		expect(canvas.height).toBe(24);
		expect(
			lastImage()
				.data.filter((_, index) => index % 4 === 3)
				.every((alpha) => alpha === 255)
		).toBe(true);
		expect(frames.size).toBe(0); // intro is suppressed and no one-frame animation in reduced mode.
		renderer.update(-5);
		expect(lastImage().data[3]).toBeLessThan(255);
		const before = paint.mock.calls.length;
		resize([], {} as ResizeObserver);
		expect(paint.mock.calls.length).toBeGreaterThan(before);
	}
);

it("animates intro/updates only when allowed and live preference snaps and cancels RAF", () => {
	motion.matches = false;
	renderer = createTextureFill(el, canvas, "dither", 75, true);
	expect(frames.size).toBe(1);
	for (let i = 0; i < 10; i++) frame();
	expect(frames.size).toBe(1);
	motion.matches = true;
	motion.dispatchEvent(new Event("change"));
	expect(frames.size).toBe(0);
	renderer.update(100);
	expect(lastImage().data[3]).toBe(255);
	const count = paint.mock.calls.length;
	recolor([], {} as MutationObserver);
	expect(paint).toHaveBeenCalledTimes(count + 1);
});

it("disconnects observers/media and drops frames on destroy", () => {
	motion.matches = false;
	const remove = vi.spyOn(motion, "removeEventListener");
	renderer = createTextureFill(el, canvas, "hatch", 60, true);
	expect(frames.size).toBe(1);
	renderer.destroy();
	expect(disconnect).toHaveBeenCalledTimes(1);
	expect(mutationDisconnect).toHaveBeenCalledTimes(1);
	expect(remove).toHaveBeenCalledWith("change", expect.any(Function));
	expect(frames.size).toBe(0);
	const count = paint.mock.calls.length;
	renderer.update(100);
	recolor([], {} as MutationObserver);
	expect(paint).toHaveBeenCalledTimes(count);
	renderer = undefined;
});

it("throws explicitly when Canvas 2D is unavailable", () => {
	vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
	expect(() => createTextureFill(el, canvas, "solid", 50, false)).toThrow(
		"requires a Canvas 2D context"
	);
});
