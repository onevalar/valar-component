import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import {
	injectStyleClasses,
	mergeStyleMaps,
	parseStyleCss,
} from "@valar/svelte-parity/inject-style-classes";
import { compile } from "svelte/compiler";
import { compile as compileTailwind } from "tailwindcss";
import { describe, expect, it } from "vitest";
import {
	MARKER_SPEC,
	markerOverrideClasses,
	parseMarkerSource,
} from "../src/lib/features/workbench/marker-tuning.js";
import {
	MESSAGE_SCROLLER_SPEC,
	messageScrollerOverrideClasses,
	parseMessageScrollerSource,
} from "../src/lib/features/workbench/message-scroller-tuning.js";
import { applyStyleOverrides } from "../src/lib/features/workbench/style-overrides.js";
import { versionSchemas } from "../src/lib/features/workbench/tuner.js";

const styles = ["valar"] as const;
type Files = { target: string; content: string }[];
function registry(component: string, style: string): Files {
	return JSON.parse(
		readFileSync(resolve(`src/__registry__/json/styles/${style}/${component}.json`), "utf8")
	).files;
}
const existing = (style: string) =>
	readFileSync(resolve(`src/lib/registry/styles/valar/style-${style}.css`), "utf8");
function installed(component: string, style: string, css: string): Files {
	const dir = resolve(`src/lib/registry/ui/${component}`);
	const map = mergeStyleMaps(
		parseStyleCss(readFileSync(resolve(`src/lib/registry/styles/style-${style}.css`), "utf8")),
		parseStyleCss(css)
	);
	return readdirSync(dir)
		.filter((name) => name.endsWith(".svelte"))
		.map((name) => ({
			target: name,
			content: injectStyleClasses(readFileSync(resolve(dir, name), "utf8"), map),
		}));
}
const sourceFile = (files: Files, name: string) =>
	files.find((file) => file.target.split("/").at(-1) === name)!.content;
const withoutOwnedSpacing = (source: string) =>
	source
		.replace(/(?<![\w:/-])(?:gap|p|px|py|pb)-\d+(?:\.5)?\s*/g, "")
		.replace(/"([^"]*)"/g, (_match, literal: string) => `"${literal.trim()}"`)
		.replace(/\s+/g, " ");

describe("Message Scroller and Marker source-backed editor contracts", () => {
	it.each(styles)("reads the real lazy %s baselines without touching defaults", async (style) => {
		const probe = document.createElement("div");
		const scroller = parseMessageScrollerSource(registry("message-scroller", style));
		expect(scroller.values).toEqual({
			gap: 24,
			paddingX: 0,
			paddingY: 0,
		});
		expect(await MESSAGE_SCROLLER_SPEC.readBaseline(probe, `style-${style}`)).toEqual(scroller);
		const marker = parseMarkerSource(registry("marker", style));
		expect(marker.values).toEqual({
			defaultGap: 8,
			separatorGap: 8,
			borderGap: 8,
			borderPaddingBottom: 8,
		});
		expect(await MARKER_SPEC.readBaseline(probe, `style-${style}`)).toEqual(marker);
		expect(messageScrollerOverrideClasses({})).toEqual({});
		expect(markerOverrideClasses({})).toEqual({});
		expect(MESSAGE_SCROLLER_SPEC.previewCss(".pane", {}, null)).toBe("");
		expect(MARKER_SPEC.previewCss(".pane", {}, null)).toBe("");
		expect(MESSAGE_SCROLLER_SPEC.pageCss!({}, null)).toBe("");
		expect(MARKER_SPEC.pageCss!({}, null)).toBe("");
	});

	it.each(styles)("roundtrips repeated asymmetric and partial Content writes in %s", (style) => {
		let css = existing(style);
		const baselineFiles = installed("message-scroller", style, css);
		let expected = parseMessageScrollerSource(baselineFiles).values;
		const unrelated = parseStyleCss(css);
		for (const overrides of [
			{ gap: 46, paddingX: 2, paddingY: 38 },
			{ paddingX: 30 },
			{ gap: 0, paddingY: 4 },
			{ paddingY: 48 },
			{ paddingX: 0, paddingY: 0 },
		]) {
			css = applyStyleOverrides(css, { style, classes: messageScrollerOverrideClasses(overrides) });
			expected = { ...expected, ...overrides };
			const files = installed("message-scroller", style, css);
			expect(parseMessageScrollerSource(files).values).toEqual(expected);
			for (const file of files) {
				const original = sourceFile(baselineFiles, file.target);
				if (file.target === "message-scroller-content.svelte")
					expect(withoutOwnedSpacing(file.content)).toBe(withoutOwnedSpacing(original));
				else expect(file.content).toBe(original);
				expect(compile(file.content, { filename: file.target }).warnings).toEqual([]);
			}
			for (const [key, value] of Object.entries(unrelated))
				if (key !== "cn-message-scroller-content") expect(parseStyleCss(css)[key]).toBe(value);
		}
	});

	it.each(styles)(
		"roundtrips variant-independent Marker writes and retains pseudo-lines in %s",
		(style) => {
			let css = existing(style);
			const baselineFiles = installed("marker", style, css);
			let expected = parseMarkerSource(baselineFiles).values;
			const unrelated = parseStyleCss(css);
			for (const overrides of [
				{ defaultGap: 22, separatorGap: 2, borderGap: 14, borderPaddingBottom: 6 },
				{ separatorGap: 24 },
				{ borderPaddingBottom: 0 },
				{ defaultGap: 0, borderGap: 4 },
				{ borderPaddingBottom: 24 },
			]) {
				css = applyStyleOverrides(css, { style, classes: markerOverrideClasses(overrides) });
				expected = { ...expected, ...overrides };
				const files = installed("marker", style, css);
				expect(parseMarkerSource(files).values).toEqual(expected);
				for (const file of files) {
					const original = sourceFile(baselineFiles, file.target);
					if (file.target === "marker.svelte") {
						expect(withoutOwnedSpacing(file.content)).toBe(withoutOwnedSpacing(original));
						for (const token of [
							"before:h-px",
							"before:flex-1",
							"before:bg-border",
							"after:h-px",
							"after:flex-1",
							"after:bg-border",
							"before:mr-1",
							"after:ml-1",
							"border-b",
							"border-border",
						])
							expect(file.content).toContain(token);
					} else expect(file.content).toBe(original);
					expect(compile(file.content, { filename: file.target }).warnings).toEqual([]);
				}
				for (const [key, value] of Object.entries(unrelated))
					if (!key.startsWith("cn-marker-variant-")) expect(parseStyleCss(css)[key]).toBe(value);
			}
		}
	);

	it("aggregates every Content cn literal and resolves independent padding axes", () => {
		const files = registry("message-scroller", "valar").map((file) => ({
			...file,
			content: file.content.replace(
				/class=\{cn\("[^"]*", className\)\}/,
				'class={cn("gap-2 p-3 flex", "gap-7 px-0.5 py-4 h-max min-h-full flex-col", className)}'
			),
		}));
		expect(parseMessageScrollerSource(files).values).toEqual({
			gap: 28,
			paddingX: 2,
			paddingY: 16,
		});
	});

	it("rejects absent, broken and non-finite source instead of inventing defaults", async () => {
		expect(() => parseMessageScrollerSource([])).toThrow();
		expect(() => parseMarkerSource([])).toThrow();
		expect(() =>
			parseMessageScrollerSource([
				{ target: "message-scroller-content.svelte", content: "<div />" },
			])
		).toThrow();
		expect(() => parseMarkerSource([{ target: "marker.svelte", content: "<div />" }])).toThrow();
		for (const bad of ["gap-[12px]", "gap-NaN", "gap-13", "gap-0.25", "gap-99", "gap--1"]) {
			expect(() =>
				parseMessageScrollerSource(
					registry("message-scroller", "valar").map((file) => ({
						...file,
						content: file.content.replace(/gap-6/g, bad),
					}))
				)
			).toThrow();
			expect(() =>
				parseMarkerSource(
					registry("marker", "valar").map((file) => ({
						...file,
						content: file.content.replace(/gap-2/g, bad),
					}))
				)
			).toThrow();
		}
		const marker = registry("marker", "valar");
		for (const pattern of [/separator:\s*"[^"]*",/, /pb-2/, /gap-2/])
			expect(() =>
				parseMarkerSource(
					marker.map((file) => ({ ...file, content: file.content.replace(pattern, "") }))
				)
			).toThrow();
		expect(() =>
			parseMessageScrollerSource(
				registry("message-scroller", "valar").map((file) => ({
					...file,
					content: file.content.replace(/gap-6/, ""),
				}))
			)
		).toThrow();
		await expect(
			MESSAGE_SCROLLER_SPEC.readBaseline(document.createElement("div"), "style-absent")
		).rejects.toThrow();
		await expect(
			MARKER_SPEC.readBaseline(document.createElement("div"), "style-absent")
		).rejects.toThrow();
	});

	it("strictly validates full baselines and partial v2 versions, never accepting scroll or global tokens", () => {
		for (const spec of [MESSAGE_SCROLLER_SPEC, MARKER_SPEC]) {
			const baseline =
				spec.component === "marker"
					? parseMarkerSource(registry("marker", "valar")).values
					: parseMessageScrollerSource(registry("message-scroller", "valar")).values;
			const schemas = versionSchemas<Record<string, number>>(spec.component, spec.valuesSchema);
			const record = {
				format: 2,
				component: spec.component,
				id: "49765b92-3c6f-4cd1-ad39-75f89bb3cfed",
				name: "局部间距",
				createdAt: "2026-11-03T00:00:00.000Z",
				source: { style: "style-valar" },
				baseline,
				overrides: {},
			};
			expect(schemas.version.safeParse(record).success).toBe(true);
			expect(schemas.version.safeParse({ ...record, baseline: {} }).success).toBe(false);
			for (const parameter of spec.parameters) {
				if (parameter.kind !== "number") throw new Error("unexpected non-spacing control");
				expect(parameter.label).toContain("（基准 px）");
				for (const value of [NaN, Infinity, -Infinity, -2, 1, parameter.max + 2, "8", null])
					expect(
						schemas.version.safeParse({ ...record, overrides: { [parameter.key]: value } }).success
					).toBe(false);
				for (let value = parameter.min; value <= parameter.max; value += parameter.step!)
					expect(
						schemas.version.safeParse({ ...record, overrides: { [parameter.key]: value } }).success
					).toBe(true);
			}
			for (const key of [
				"autoScroll",
				"scrollMargin",
				"scrollPreviousItemPeek",
				"height",
				"buttonSize",
				"color",
				"fontSize",
				"unknown",
			])
				expect(schemas.version.safeParse({ ...record, overrides: { [key]: 8 } }).success).toBe(
					false
				);
		}
		expect(() => messageScrollerOverrideClasses({ gap: Infinity })).toThrow();
		expect(() => markerOverrideClasses({ defaultGap: NaN })).toThrow();
		expect(MESSAGE_SCROLLER_SPEC.storageKey).toBe("valar.message-scroller-styles.v2");
		expect(MARKER_SPEC.storageKey).toBe("valar.marker-styles.v2");
	});

	it("uses the same spacing calc as actual Tailwind utilities, with scoped partial CSS", async () => {
		const compiler = await compileTailwind("@theme { --spacing: 0.25rem; } @tailwind utilities;");
		const css = compiler.build(["gap-5.5", "px-0.5", "py-9.5", "pb-1.5"]);
		for (const value of ["5.5", "0.5", "9.5", "1.5"])
			expect(css).toContain(`calc(var(--spacing) * ${value})`);
		const preview = MESSAGE_SCROLLER_SPEC.previewCss(
			".pane",
			{ gap: 22, paddingX: 2, paddingY: 38 },
			null
		);
		expect(preview).toContain('.pane [data-slot="message-scroller-content"]');
		expect(preview).toContain("gap: calc(var(--spacing) * 5.5)");
		expect(preview).toContain("padding-inline: calc(var(--spacing) * 0.5)");
		expect(preview).toContain("padding-block: calc(var(--spacing) * 9.5)");
		expect(MARKER_SPEC.previewCss(".pane", { borderPaddingBottom: 6 }, null)).toBe(
			'.pane [data-slot="marker"][data-variant="border"] { padding-bottom: calc(var(--spacing) * 1.5); }'
		);
		expect(messageScrollerOverrideClasses({ paddingX: 2 })).toEqual({
			"cn-message-scroller-content": "px-0.5",
		});
		expect(markerOverrideClasses({ separatorGap: 22 })).toEqual({
			"cn-marker-variant-separator": "gap-5.5",
		});
		for (const spec of [MESSAGE_SCROLLER_SPEC, MARKER_SPEC])
			expect(spec.pageCss!({}, null)).toBe("");
		expect(MESSAGE_SCROLLER_SPEC.pageCss!({ gap: 2 }, null)).toContain(
			":not([data-component-tuner]):not([data-component-tuner] *)"
		);
		expect(MARKER_SPEC.pageCss!({ defaultGap: 2 }, null)).toContain(
			":not([data-component-tuner]):not([data-component-tuner] *)"
		);
	});

	it.each(["message-scroller", "marker"])(
		"compiles the %s canvas for client and SSR with no warnings",
		(component) => {
			const filename = resolve(`src/lib/features/workbench/${component}-tuner.svelte`);
			const source = readFileSync(filename, "utf8");
			for (const generate of ["client", "server"] as const)
				expect(compile(source, { filename, generate }).warnings).toEqual([]);
		}
	);
});
