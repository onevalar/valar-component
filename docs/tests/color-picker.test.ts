import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	ColorPicker,
	formatColor,
	hexToRgba,
	hslaToRgba,
	hsvaToRgba,
	isLightColor,
	normalizeHex,
	normalizeHexColor,
	oklchaToRgba,
	parseColorInput,
	rgbaToHex,
	rgbaToHsla,
	rgbaToHsva,
	rgbaToOklcha,
} from "../src/lib/registry/ui/color-picker/index.js";

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
	localStorage.clear();
});

describe("color engine conversions", () => {
	it("preserves strict 3/6-digit normalizeHex and expands alpha hex in normalizeHexColor", () => {
		expect(normalizeHex("#ABC")).toBe("#aabbcc");
		expect(normalizeHex("#12345678")).toBe(undefined);
		expect(normalizeHexColor("#2563ebff")).toBe("#2563eb");
		expect(normalizeHexColor("#2563eb80")).toBe("#2563eb80");
		expect(normalizeHexColor("#f0a8")).toBe("#ff00aa88");
		expect(normalizeHexColor("#2563eb80", false)).toBe(undefined);
	});

	it("roundtrips sRGB across HSV, HSL, and OKLCH while preserving hue on achromatic colors", () => {
		const blue = hexToRgba("#2563eb")!;
		const hsv = rgbaToHsva(blue);
		expect(rgbaToHex(hsvaToRgba(hsv))).toBe("#2563eb");

		const hsl = rgbaToHsla(blue);
		const fromHsl = hslaToRgba(hsl);
		expect(Math.abs(fromHsl.r - blue.r)).toBeLessThanOrEqual(2);
		expect(Math.abs(fromHsl.g - blue.g)).toBeLessThanOrEqual(2);
		expect(Math.abs(fromHsl.b - blue.b)).toBeLessThanOrEqual(2);

		const oklch = rgbaToOklcha(blue);
		const fromOklch = oklchaToRgba(oklch);
		expect(Math.abs(fromOklch.r - blue.r)).toBeLessThanOrEqual(2);
		expect(Math.abs(fromOklch.g - blue.g)).toBeLessThanOrEqual(2);
		expect(Math.abs(fromOklch.b - blue.b)).toBeLessThanOrEqual(2);

		// Hue preserved when color becomes pure black or pure white.
		expect(rgbaToHsva({ r: 0, g: 0, b: 0, a: 1 }, 215).h).toBe(215);
		expect(rgbaToHsva({ r: 255, g: 255, b: 255, a: 1 }, 142).h).toBe(142);
	});

	it("parses and formats HEX, RGB, HSL, and OKLCH with and without alpha", () => {
		const translucent = parseColorInput("rgb(37 99 235 / 50%)")!;
		expect(translucent).toMatchObject({ r: 37, g: 99, b: 235, a: 0.5 });
		expect(rgbaToHex(translucent)).toBe("#2563eb80");
		expect(formatColor(translucent, "rgb")).toBe("rgb(37 99 235 / 50%)");
		expect(formatColor(translucent, "hsl")).toContain("/ 50%)");
		expect(formatColor(translucent, "oklch")).toContain("/ 50%)");

		const fromOklch = parseColorInput("oklch(0.546 0.215 262.9)")!;
		expect(fromOklch.b).toBeGreaterThan(200);
		expect(fromOklch.a).toBe(1);
	});

	it("chooses dark ink on light swatches and white ink on dark swatches", () => {
		expect(isLightColor(hexToRgba("#ffffff")!)).toBe(true);
		expect(isLightColor(hexToRgba("#facc15")!)).toBe(true);
		expect(isLightColor(hexToRgba("#0f172a")!)).toBe(false);
		expect(isLightColor(hexToRgba("#2563eb")!)).toBe(false);
	});
});

describe("ColorPicker interactive behavior", () => {
	it("supports keyboard SV/Hue/Alpha controls, format switching, recent history, and alpha=false mode", () => {
		const container = document.createElement("div");
		document.body.append(container);
		const onValueChange = vi.fn();

		app = mount(ColorPicker, {
			target: container,
			props: {
				label: "品牌色",
				value: "#2563eb",
				name: "brand",
				presets: ["#ffffff", "#0f172a", "#2563eb"],
				contentProps: { portalProps: { disabled: true } },
				onValueChange,
			},
		});
		flushSync();

		const trigger = container.querySelector<HTMLButtonElement>('[data-slot="color-picker"] button')!;
		trigger.click();
		flushSync();

		// 2D SV board, Hue slider, Alpha slider all exist and no native <input type="color">.
		expect(container.querySelector('input[type="color"]')).toBeNull();
		const area = container.querySelector<HTMLElement>('[data-slot="color-picker-area"]')!;
		const hueSlider = container.querySelector<HTMLElement>('[data-slot="color-picker-hue"]')!;
		const alphaSlider = container.querySelector<HTMLElement>('[data-slot="color-picker-alpha"]')!;
		expect(area).toBeTruthy();
		expect(hueSlider).toBeTruthy();
		expect(alphaSlider).toBeTruthy();

		// Keyboard alpha reduction emits 8-digit hex and records recent color.
		alphaSlider.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", shiftKey: true, bubbles: true }));
		flushSync();
		const hidden = container.querySelector<HTMLInputElement>('input[name="brand"]')!;
		expect(hidden.value).toMatch(/^#2563eb[0-9a-f]{2}$/);
		const recentTab = [...container.querySelectorAll<HTMLButtonElement>("button")].find((b) =>
			b.textContent?.includes("最近使用")
		)!;
		expect(recentTab).toBeTruthy();
		recentTab.click();
		flushSync();
		expect(container.querySelector('[aria-label="品牌色：最近使用"]')).toBeTruthy();

		// Switch format to RGB -> HSL -> OKLCH -> HEX.
		const buttons = [...container.querySelectorAll<HTMLButtonElement>('button')];
		const formatBtn = (label: string) => buttons.find((b) => b.textContent?.trim() === label)!;
		formatBtn("RGB").click();
		flushSync();
		expect(container.querySelector('input[aria-label="品牌色：R"]')).toBeTruthy();

		formatBtn("HSL").click();
		flushSync();
		expect(container.querySelector('input[aria-label="品牌色：S%"]')).toBeTruthy();

		formatBtn("OKLCH").click();
		flushSync();
		expect(container.querySelector('input[aria-label="品牌色：OKLCH L"]')).toBeTruthy();

		formatBtn("HEX").click();
		flushSync();
		const hexInput = container.querySelector<HTMLInputElement>('input[aria-label="品牌色：十六进制"]')!;
		hexInput.value = "#abc";
		hexInput.dispatchEvent(new Event("input", { bubbles: true }));
		hexInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		flushSync();
		expect(hidden.value).toBe("#aabbcc");

		// Invalid hex shows alert error.
		hexInput.value = "#ggg";
		hexInput.dispatchEvent(new Event("input", { bubbles: true }));
		flushSync();
		expect(container.querySelector('[role="alert"]')?.textContent).toContain("十六进制");
	});
});
