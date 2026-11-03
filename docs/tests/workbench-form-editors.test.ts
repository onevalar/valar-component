import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import {
	injectStyleClasses,
	mergeStyleMaps,
	parseStyleCss,
} from "@valar/svelte-parity/inject-style-classes";
import { cn } from "cn";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";
import {
	FIELD_SPEC,
	fieldOverrideClasses,
	parseFieldSource,
} from "../src/lib/features/workbench/field-tuning.js";
import {
	FORM_SPEC,
	formOverrideClasses,
	parseFormSource,
} from "../src/lib/features/workbench/form-tuning.js";
import {
	LABEL_SPEC,
	labelOverrideClasses,
	parseLabelSource,
} from "../src/lib/features/workbench/label-tuning.js";
import {
	applyStyleOverrides,
	styleOverridePayloadSchema,
} from "../src/lib/features/workbench/style-overrides.js";
import {
	versionSchemas,
	type TunerSpec,
	type TunerValues,
} from "../src/lib/features/workbench/tuner.js";

const styles = ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"];
type File = { target: string; content: string };
const existing = (style: string) =>
	readFileSync(resolve(`src/lib/registry/styles/valar/style-${style}.css`), "utf8");
function installed(component: string, style: string, css = existing(style)): File[] {
	const map = mergeStyleMaps(
		parseStyleCss(readFileSync(resolve(`src/lib/registry/styles/style-${style}.css`), "utf8")),
		parseStyleCss(css)
	);
	return readdirSync(resolve(`src/lib/registry/ui/${component}`))
		.filter((name) => name.endsWith(".svelte"))
		.map((name) => ({
			target: name,
			content: injectStyleClasses(
				readFileSync(resolve(`src/lib/registry/ui/${component}/${name}`), "utf8"),
				map
			),
		}));
}

describe("Field / Form / Label editor installation contracts", () => {
	it("reads all eight real lazy flattened baselines without a fallback", async () => {
		const groups = [20, 28, 20, 28, 16, 28, 24, 40];
		for (const [index, style] of styles.entries()) {
			const field = {
				groupGap: groups[index],
				fieldGap: [0, 2, 4].includes(index) ? 8 : 12,
				contentGap: [0, 2, 4].includes(index) ? 2 : 4,
			};
			const probe = document.createElement("div");
			expect(parseFieldSource(installed("field", style)).values).toEqual(field);
			expect((await FIELD_SPEC.readBaseline(probe, `style-${style}`)).values).toEqual(field);
			expect((await FORM_SPEC.readBaseline(probe, `style-${style}`)).values).toEqual({
				itemSpacing: 8,
			});
			expect((await LABEL_SPEC.readBaseline(probe, `style-${style}`)).values).toEqual({ gap: 8 });
		}
		for (const spec of [FIELD_SPEC, FORM_SPEC, LABEL_SPEC]) {
			await expect(
				spec.readBaseline(document.createElement("div"), "style-missing")
			).rejects.toThrow("registry");
		}
	});

	function roundtrip<V extends TunerValues>(
		component: string,
		spec: TunerSpec<V, null>,
		parse: (files: File[]) => { values: V },
		rounds: Partial<V>[],
		geometry: RegExp,
		changed: string[]
	) {
		const withoutGeometry = (source: string) =>
			source
				.replace(geometry, "")
				.replace(/"([^"\n]*)"/g, (_match, literal: string) =>
					JSON.stringify(literal.trim().replace(/\s+/g, " "))
				);
		it(`serializes partial and repeated ${component} writes through real source injection in eight styles`, () => {
			for (const style of styles) {
				let css = existing(style);
				const before = installed(component, style, css);
				let expected = parse(before).values;
				expect(spec.overrideClasses({}, null)).toEqual({});
				expect(spec.previewCss("#draft", {}, null)).toBe("");
				for (const overrides of rounds) {
					// The editor validates its partial values before the shared serializer.
					// Endpoint whitelist registration is owned by shared integration.
					css = applyStyleOverrides(css, { style, classes: spec.overrideClasses(overrides, null) });
					expected = { ...expected, ...overrides };
					const after = installed(component, style, css);
					expect(parse(after).values).toEqual(expected);
					for (const [index, file] of after.entries()) {
						expect(withoutGeometry(file.content)).toBe(withoutGeometry(before[index].content));
						if (!changed.includes(file.target)) expect(file.content).toBe(before[index].content);
						expect(() => compile(file.content, { filename: file.target })).not.toThrow();
					}
				}
			}
		}, 15_000);
	}
	roundtrip(
		"field",
		FIELD_SPEC,
		parseFieldSource,
		[
			{ groupGap: 46, fieldGap: 2, contentGap: 18 },
			{ groupGap: 6 },
			{ contentGap: 0 },
			{ groupGap: 48, fieldGap: 32, contentGap: 24 },
			{ groupGap: 0, fieldGap: 0, contentGap: 0 },
		],
		/(?<![\w:/-])gap-\d+(?:\.5)?(?![\w.-])/g,
		["field.svelte", "field-group.svelte", "field-content.svelte"]
	);
	roundtrip(
		"form",
		FORM_SPEC,
		parseFormSource,
		[{ itemSpacing: 22 }, { itemSpacing: 2 }, { itemSpacing: 24 }, { itemSpacing: 0 }],
		/(?<![\w:/-])space-y-\d+(?:\.5)?(?![\w.-])/g,
		["form-field.svelte", "form-element-field.svelte"]
	);
	roundtrip(
		"label",
		LABEL_SPEC,
		parseLabelSource,
		[{ gap: 22 }, { gap: 2 }, { gap: 24 }, { gap: 0 }],
		/(?<![\w:/-])gap-\d+(?:\.5)?(?![\w.-])/g,
		["label.svelte"]
	);

	it("fails closed for missing files, missing geometry and inconsistent Form wrappers", () => {
		for (const parse of [parseFieldSource, parseFormSource, parseLabelSource])
			expect(() => parse([])).toThrow();
		for (const [component, parse, name, geometry] of [
			["field", parseFieldSource, "field-content.svelte", "gap-0.5"],
			["form", parseFormSource, "form-field.svelte", "space-y-2"],
			["label", parseLabelSource, "label.svelte", "gap-2"],
		] as const) {
			const files = installed(component, "nova");
			expect(() => parse(files.filter((file) => file.target !== name))).toThrow();
			expect(() =>
				parse(
					files.map((file) =>
						file.target === name ? { ...file, content: file.content.replace(geometry, "") } : file
					)
				)
			).toThrow();
		}
		expect(() =>
			parseFormSource(
				installed("form", "nova").map((file) =>
					file.target === "form-field.svelte"
						? { ...file, content: file.content.replace("space-y-2", "space-y-3") }
						: file
				)
			)
		).toThrow("不一致");
	});

	it("rejects unknown, fractional, out-of-range and business values in every public output path", () => {
		for (const [spec, invalids] of [
			[
				FIELD_SPEC,
				[
					{ fieldGap: 3 },
					{ groupGap: 50 },
					{ contentGap: -2 },
					{ required: true },
					{ fieldGap: "8" },
				],
			],
			[
				FORM_SPEC,
				[{ itemSpacing: 1 }, { itemSpacing: 26 }, { labelGap: 8 }, { validators: "none" }],
			],
			[LABEL_SPEC, [{ gap: 2.5 }, { gap: 26 }, { gap: "gap-2" }, { fontSize: 16 }]],
		] as const) {
			for (const invalid of invalids) {
				expect(spec.valuesSchema.safeParse(invalid).success).toBe(false);
				expect(() => spec.overrideClasses(invalid as never, null)).toThrow();
				expect(() => spec.previewCss("#draft", invalid as never, null)).toThrow();
				expect(() => spec.pageCss?.(invalid as never, null)).toThrow();
			}
		}
		for (const classes of [
			{ "cn-field-group": "gap-12.5" },
			{ "cn-field": "text-xl" },
			{ "cn-field-content": "gap-[13px]" },
			{ "cn-form-item-layout": "space-y-6.5" },
			{ "cn-form-item-layout": "h-10" },
			{ "cn-label-layout": "text-lg" },
			{ "cn-label-layout": "gap-[12px]" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});

	it("keeps versions separate and preserves finite partial overrides", () => {
		expect(new Set([FIELD_SPEC, FORM_SPEC, LABEL_SPEC].map((spec) => spec.storageKey)).size).toBe(
			3
		);
		const versions = [FIELD_SPEC, FORM_SPEC, LABEL_SPEC].map((spec) => {
			expect(spec.storageKey).toBe(`valar.${spec.component}-styles.v2`);
			return versionSchemas<TunerValues>(spec.component, spec.valuesSchema).version;
		});
		const baseline = parseFieldSource(installed("field", "nova")).values;
		const field = {
			format: 2,
			component: "field",
			id: "5c50581d-ac44-4478-87d0-073bb3ebba49",
			name: "独立间距",
			createdAt: "2026-11-03T00:00:00.000Z",
			source: { style: "style-nova" },
			baseline,
			overrides: { fieldGap: 18 },
		};
		expect(versions[0].parse(field).overrides).toEqual({ fieldGap: 18 });
		expect(versions[1].safeParse(field).success).toBe(false);
		expect(versions[2].safeParse(field).success).toBe(false);
	});

	it("uses spacing-scaled preview CSS without replacing nested-group, orientation or label ownership", () => {
		const css = FIELD_SPEC.previewCss(
			"#draft",
			{ groupGap: 46, fieldGap: 2, contentGap: 18 },
			null
		);
		expect(css).toContain("calc(var(--spacing) * 11.5)");
		expect(css).toContain(':not([data-slot="field-group"] > *)');
		const source = installed("field", "nova").find(
			(file) => file.target === "field-group.svelte"
		)!.content;
		expect(source).toContain("*:data-[slot=field-group]:gap-4");
		expect(source).toContain("data-[slot=checkbox-group]:gap-3");
		expect(FORM_SPEC.previewCss("#draft", { itemSpacing: 22 }, null)).toContain(
			"margin-block-end: calc(calc(var(--spacing) * 5.5)"
		);
		expect(FORM_SPEC.previewCss("#draft", { itemSpacing: 22 }, null)).not.toContain("gap:");
		expect(LABEL_SPEC.previewCss("#draft", { gap: 22 }, null)).toContain(
			'[data-slot="form-label"]'
		);
		expect(LABEL_SPEC.previewCss("#draft", { gap: 22 }, null)).not.toContain(
			'[data-slot="field-label"]'
		);
		for (const spec of [FIELD_SPEC, FORM_SPEC, LABEL_SPEC]) {
			expect(spec.pageCss?.({} as never, null)).toBe("");
			for (const parameter of spec.parameters) expect(parameter.label).toContain("（基准 px）");
		}
		// Caller classes stay last in cn, including the newly introduced literal anchor.
		for (const file of installed(
			"form",
			"nova",
			applyStyleOverrides(existing("nova"), {
				style: "nova",
				classes: formOverrideClasses({ itemSpacing: 22 }),
			})
		).filter((file) => ["form-field.svelte", "form-element-field.svelte"].includes(file.target))) {
			const args = /class=\{cn\(([\s\S]*?)\)\}/.exec(file.content)![1];
			const literals = [...args.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
			expect(args.trim().endsWith("className")).toBe(true);
			expect(cn(...literals, "space-y-1")).toBe("space-y-1");
		}
		expect(fieldOverrideClasses({ fieldGap: 18 })).toEqual({ "cn-field": "gap-4.5" });
		expect(labelOverrideClasses({ gap: 22 })).toEqual({ "cn-label-layout": "gap-5.5" });
	});
});
