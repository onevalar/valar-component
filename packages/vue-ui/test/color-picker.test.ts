import assert from "node:assert/strict";
import test from "node:test";
import {
	formatColor,
	hexToRgba,
	isLightColor,
	normalizeHex,
	normalizeHexColor,
	oklchaToRgba,
	parseColorInput,
	rgbaToHex,
	rgbaToOklcha,
} from "../dist/ui/color-picker/color.ts";

test("Vue ColorPicker color engine preserves strict normalizeHex and supports alpha/multi-format parsing", () => {
	assert.equal(normalizeHex("#09f"), "#0099ff");
	assert.equal(normalizeHex("#2563eb80"), undefined);
	assert.equal(normalizeHexColor("#2563ebff", true), "#2563eb");
	assert.equal(normalizeHexColor("#2563eb80", true), "#2563eb80");
	assert.equal(normalizeHexColor("#2563eb80", false), undefined);

	const parsed = parseColorInput("hsl(221 83% 53% / 50%)", true);
	assert.ok(parsed);
	assert.match(rgbaToHex(parsed, true), /^#[\da-f]{6}80$/);
	assert.match(formatColor(parsed, "hsl", true), /^hsl\(.*50%\)$/);

	const oklch = rgbaToOklcha({ r: 37, g: 99, b: 235, a: 1 });
	const roundtrip = oklchaToRgba(oklch);
	assert.ok(Math.abs(roundtrip.r - 37) <= 2);
	assert.ok(Math.abs(roundtrip.g - 99) <= 2);
	assert.ok(Math.abs(roundtrip.b - 235) <= 2);

	assert.equal(isLightColor(hexToRgba("#f8fafc")!), true);
	assert.equal(isLightColor(hexToRgba("#0f172a")!), false);
});
