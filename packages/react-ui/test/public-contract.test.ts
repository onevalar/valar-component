import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import * as Public from "@valar/react-ui";
import * as React from "react";
import { Button, buttonVariants } from "@valar/react-ui/button";
import { Calendar } from "@valar/react-ui/calendar";
import { Input } from "@valar/react-ui/input";
import { RangeCalendar } from "@valar/react-ui/range-calendar";
import { renderToStaticMarkup } from "react-dom/server";

const output = path.resolve(import.meta.dirname, "../dist");

test("public source distribution is native, self-contained and scans its own styles", () => {
	const manifest = JSON.parse(fs.readFileSync(path.join(output, "../package.json"), "utf8"));
	assert.equal(manifest.private, true);
	assert.equal(manifest.exports["./theme.css"], "./dist/theme.css");
	assert.equal(manifest.exports["./*"], "./dist/*.tsx");
	assert.equal(manifest.dependencies.svelte, undefined);
	assert.equal(manifest.dependencies["@valar/svelte-ui"], undefined);
	for (const file of fs.readdirSync(output).filter((name) => /\.tsx?$/.test(name))) {
		const source = fs.readFileSync(path.join(output, file), "utf8");
		assert.doesNotMatch(source, /from ["'](?:\$lib|@\/|svelte|bits-ui|@valar\/svelte)/);
		assert.doesNotMatch(source, /cn-button-(?:variant|size)-/);
		for (const match of source.matchAll(/from ["'](\.\/[^"']+)["']/g)) {
			assert.ok(
				fs.existsSync(path.join(output, match[1])),
				`${file} has a missing relative dependency`
			);
		}
	}
	assert.match(
		fs.readFileSync(path.join(output, "theme.css"), "utf8"),
		/@source "\.\/\*\*\/\*\.\{ts,tsx\}"/
	);
});

test("Button defaults to a non-submit control and keeps deliberate shape overrides", () => {
	const html = renderToStaticMarkup(React.createElement(Button, null, "保存"));
	assert.match(html, /type="button"/);
	assert.match(
		renderToStaticMarkup(React.createElement(Button, { type: "submit" }, "提交")),
		/type="submit"/
	);
	assert.match(buttonVariants({ size: "icon" }), /rounded-full/);
	assert.doesNotMatch(buttonVariants({ size: "icon", shape: "square" }), /rounded-full/);
	assert.match(buttonVariants({ shape: "pill" }), /rounded-full/);
});

test("disabled href and disabled asChild anchors cannot retain navigation", () => {
	const href = renderToStaticMarkup(
		React.createElement(Button, { href: "/settings", disabled: true }, "设置")
	);
	assert.doesNotMatch(href, /href=/);
	assert.match(href, /aria-disabled="true"/);
	assert.match(href, /tabindex="-1"/);
	const slotted = renderToStaticMarkup(
		React.createElement(
			Button,
			{ asChild: true, disabled: true },
			React.createElement("a", { href: "/settings" }, "设置")
		)
	);
	assert.doesNotMatch(slotted, /href=/);
	assert.match(slotted, /role="link"/);
});

test("Input retains native form attributes and Unicode values in server rendering", () => {
	const html = renderToStaticMarkup(
		React.createElement(Input, {
			name: "name",
			defaultValue: "名称🌱",
			required: true,
			disabled: true,
			"aria-describedby": "error",
		})
	);
	assert.match(html, /name="name"/);
	assert.match(html, /value="名称🌱"/);
	assert.match(html, /required=""/);
	assert.match(html, /disabled=""/);
	assert.match(html, /aria-describedby="error"/);
});

test("native calendars render on the server and retain the public mode/formatting contract", () => {
	const month = new Date(2026, 10, 1);
	const selected = new Date(2026, 10, 12);
	const html = renderToStaticMarkup(
		React.createElement(Calendar, {
			mode: "single",
			month,
			selected,
			today: selected,
			captionLayout: "dropdown",
		})
	);
	assert.match(html, /data-slot="calendar"/);
	assert.match(html, /--cell-size:/);
	assert.match(html, /2026/);
	const range = renderToStaticMarkup(
		React.createElement(RangeCalendar, {
			month,
			selected: { from: selected, to: new Date(2026, 10, 14) },
			today: selected,
		})
	);
	assert.match(range, /data-slot="range-calendar"/);
});

test("calendar dropdowns compose month before year and keep formatter/component overrides", () => {
	const month = new Date(2026, 10, 1);
	for (const calendar of [
		React.createElement(Calendar, { month, today: month, captionLayout: "dropdown" }),
		React.createElement(RangeCalendar, { month, today: month, captionLayout: "dropdown" }),
	]) {
		const html = renderToStaticMarkup(calendar);
		assert.ok(html.indexOf('aria-label="选择月份"') < html.indexOf('aria-label="选择年份"'));
		assert.match(html, /2026年/);
	}
	const custom = renderToStaticMarkup(
		React.createElement(Calendar, {
			month,
			captionLayout: "dropdown",
			formatters: { formatYearDropdown: (date) => `Year ${date.getFullYear()}` },
			components: {
				DropdownNav: ({ children, ...props }) =>
					React.createElement("div", { ...props, "data-custom-nav": "yes" }, children),
			},
		})
	);
	assert.match(custom, /data-custom-nav="yes"/);
	assert.match(custom, /Year 2026/);
});

test("calendar captions allow the source's future years and preserve explicit native limits", () => {
	const month = new Date(2026, 11, 1);
	for (const render of [
		(limits: { startMonth?: Date; endMonth?: Date; fromYear?: number; toYear?: number }) =>
			renderToStaticMarkup(
				React.createElement(Calendar, { month, today: month, captionLayout: "dropdown", ...limits })
			),
		(limits: { startMonth?: Date; endMonth?: Date; fromYear?: number; toYear?: number }) =>
			renderToStaticMarkup(
				React.createElement(RangeCalendar, {
					month,
					today: month,
					captionLayout: "dropdown",
					...limits,
				})
			),
	]) {
		const defaults = render({});
		assert.match(defaults, /<option value="2027"/);
		assert.match(
			defaults,
			new RegExp(`<option value="${Math.max(2026, new Date().getFullYear()) + 10}"`)
		);
		const constrained = render({ startMonth: new Date(2025, 0), endMonth: new Date(2026, 11) });
		assert.match(constrained, /<option value="2025"/);
		assert.doesNotMatch(constrained, /<option value="2024"|<option value="2027"/);
		const deprecated = render({ fromYear: 2025, toYear: 2026 });
		assert.match(deprecated, /<option value="2025"/);
		assert.doesNotMatch(deprecated, /<option value="2024"|<option value="2027"/);
	}
});

test("RangeCalendar owns its source geometry while public style/component overrides remain effective", () => {
	const month = new Date(2026, 10, 1);
	const html = renderToStaticMarkup(React.createElement(RangeCalendar, { month, today: month }));
	assert.match(html, /data-slot="range-calendar"[^>]*class="[^"]*\bp-3\b/);
	assert.match(html, /<table[^>]*class="[^"]*mt-4 flex w-full border-collapse flex-col gap-1/);
	const custom = renderToStaticMarkup(
		React.createElement(RangeCalendar, {
			month,
			className: "p-1",
			classNames: { month_grid: "custom-range-grid" },
			components: {
				Root: ({ rootRef, ...props }) =>
					React.createElement("article", { ...props, ref: rootRef, "data-custom-range": "yes" }),
			},
		})
	);
	assert.match(custom, /<article[^>]*class="[^"]*\bp-1\b/);
	assert.doesNotMatch(custom, /class="[^"]*\bp-3\b/);
	assert.match(custom, /<table[^>]*class="custom-range-grid"/);
	assert.match(custom, /data-custom-range="yes"/);
});

test("upstream compositions remain public instead of being replaced by fixture-only APIs", () => {
	for (const name of [
		"Checkbox",
		"Select",
		"SelectContent",
		"SelectGroup",
		"SelectItem",
		"SelectLabel",
		"SelectScrollDownButton",
		"SelectScrollUpButton",
		"SelectSeparator",
		"SelectTrigger",
		"SelectValue",
		"Dialog",
		"DialogClose",
		"DialogContent",
		"DialogDescription",
		"DialogFooter",
		"DialogHeader",
		"DialogOverlay",
		"DialogPortal",
		"DialogTitle",
		"DialogTrigger",
		"Calendar",
		"CalendarDayButton",
		"RangeCalendar",
		"Slider",
		"SliderPrimitive",
		"ChartContainer",
		"ChartTooltip",
		"ChartTooltipContent",
		"ChartLegend",
		"ChartLegendContent",
		"ChartStyle",
	])
		assert.ok(name in Public, `missing public composition: ${name}`);
});
