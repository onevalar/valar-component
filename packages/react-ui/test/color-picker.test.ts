import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
	ColorPicker,
	formatColor,
	hexToRgba,
	isLightColor,
	normalizeHex,
	normalizeHexColor,
	parseColorInput,
	rgbaToHex,
	rgbaToOklcha,
	oklchaToRgba,
} from "@valar/react-ui/color-picker";

test("React ColorPicker preserves strict normalizeHex and supports alpha/multi-format parsing", () => {
	assert.equal(normalizeHex("#09f"), "#0099ff");
	assert.equal(normalizeHex("#2563eb80"), undefined);
	assert.equal(normalizeHexColor("#2563ebff", true), "#2563eb");
	assert.equal(normalizeHexColor("#2563eb80", true), "#2563eb80");
	assert.equal(normalizeHexColor("#2563eb80", false), undefined);

	const parsed = parseColorInput("rgb(37 99 235 / 50%)", true);
	assert.ok(parsed);
	assert.equal(rgbaToHex(parsed, true), "#2563eb80");
	assert.equal(formatColor(parsed, "rgb", true), "rgb(37 99 235 / 50%)");

	const oklch = rgbaToOklcha({ r: 37, g: 99, b: 235, a: 1 });
	const roundtrip = oklchaToRgba(oklch);
	assert.ok(Math.abs(roundtrip.r - 37) <= 2);
	assert.ok(Math.abs(roundtrip.g - 99) <= 2);
	assert.ok(Math.abs(roundtrip.b - 235) <= 2);

	assert.equal(isLightColor(hexToRgba("#ffffff")!), true);
	assert.equal(isLightColor(hexToRgba("#18181b")!), false);
});

test("React ColorPicker renders cleanly on the server with translucent values and alpha badge", () => {
	const html = renderToStaticMarkup(
		React.createElement(ColorPicker, {
			label: "品牌色",
			name: "brand",
			value: "#2563eb80",
			presets: ["#2563eb", "#0f766e"],
		})
	);
	assert.match(html, /data-slot="color-picker"/);
	assert.match(html, /#2563eb80/);
	assert.match(html, /50%/);
	assert.match(html, /name="brand"/);
});
