import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	injectStyleClasses,
	mergeStyleMaps,
	parseStyleCss,
} from "@valar/svelte-parity/inject-style-classes";
import { cn } from "cn";
import { compile } from "svelte/compiler";
import { compile as compileTailwind } from "tailwindcss";
import { describe, expect, it } from "vitest";
import {
	RESIZABLE_SPEC,
	parseResizableSource,
	resizableOverrideClasses,
} from "../src/lib/features/workbench/resizable-tuning.js";
import {
	SCROLL_AREA_SPEC,
	parseScrollAreaSource,
	scrollAreaOverrideClasses,
} from "../src/lib/features/workbench/scroll-area-tuning.js";
import { RADIUS_LEVELS, versionSchemas } from "../src/lib/features/workbench/tuner.js";

const styles = ["nova", "vega", "maia", "lyra", "mira", "rhea", "luma", "sera"] as const;
const read = (path: string) => readFileSync(resolve(import.meta.dirname, "..", path), "utf8");
type File = { target: string; content: string };
const registryFiles = (component: string, style: string): File[] =>
	JSON.parse(read(`src/__registry__/json/styles/${style}/${component}.json`)).files;
const source = (component: string, file: string) =>
	read(`src/lib/registry/ui/${component}/${file}`);
const styleMap = (style: string) =>
	mergeStyleMaps(
		parseStyleCss(read(`src/lib/registry/styles/style-${style}.css`)),
		parseStyleCss(read(`src/lib/registry/styles/valar/style-${style}.css`))
	);
function install(component: string, file: string, map: Record<string, string>): File[] {
	return [
		{
			target: `ui/${component}/${file}`,
			content: injectStyleClasses(source(component, file), map),
		},
	];
}
function classesAt(content: string, slot: string): string {
	const classValue = new RegExp(
		`data-slot="${slot}"[\\s\\S]*?class=(?:"([^"]*)"|\\{cn\\(([\\s\\S]*?)\\)\\})`
	).exec(content);
	if (!classValue) throw new Error(`missing ${slot}`);
	return classValue[1] ?? cn(...[...classValue[2].matchAll(/"([^"]*)"/g)].map((match) => match[1]));
}

describe("Resizable / Scroll Area finite geometry editors", () => {
	it.each(styles)(
		"reads actual %s flattened baselines lazily without changing defaults",
		async (style) => {
			const resizable = registryFiles("resizable", style);
			const scroll = registryFiles("scroll-area", style);
			expect(parseResizableSource(resizable).values).toEqual({
				horizontalThickness: 1,
				verticalThickness: 1,
			});
			expect(parseScrollAreaSource(scroll).values).toEqual({
				verticalThickness: 10,
				horizontalThickness: 10,
				thumbRadius: ["lyra", "sera"].includes(style) ? "none" : "full",
			});
			const probe = document.createElement("div");
			expect(await RESIZABLE_SPEC.readBaseline(probe, `style-${style}`)).toEqual(
				parseResizableSource(resizable)
			);
			expect(await SCROLL_AREA_SPEC.readBaseline(probe, `style-${style}`)).toEqual(
				parseScrollAreaSource(scroll)
			);
			expect(
				parseResizableSource(install("resizable", "resizable-handle.svelte", styleMap(style)))
			).toEqual(parseResizableSource(resizable));
			expect(
				parseScrollAreaSource(
					install("scroll-area", "scroll-area-scrollbar.svelte", styleMap(style))
				)
			).toEqual(parseScrollAreaSource(scroll));
		}
	);

	it.each(styles)(
		"roundtrips asymmetric and repeated partial Resizable writes for %s, preserving hit regions and grip",
		(style) => {
			const base = styleMap(style);
			const first = mergeStyleMaps(
				base,
				resizableOverrideClasses({ horizontalThickness: 4, verticalThickness: 2 })
			);
			const second = mergeStyleMaps(first, resizableOverrideClasses({ horizontalThickness: 3 }));
			const files = install("resizable", "resizable-handle.svelte", second);
			expect(parseResizableSource(files).values).toEqual({
				horizontalThickness: 3,
				verticalThickness: 2,
			});
			const before = classesAt(
				install("resizable", "resizable-handle.svelte", base)[0].content,
				"resizable-handle"
			).split(/\s+/);
			const after = classesAt(files[0].content, "resizable-handle").split(/\s+/);
			for (const utility of before.filter(
				(utility) => utility !== "w-px" && utility !== "data-[direction=vertical]:h-px"
			))
				expect(after).toContain(utility);
			expect(after).toContain("w-0.75");
			expect(after).toContain("data-[direction=vertical]:h-0.5");
			expect(after).not.toContain("w-px");
			expect(after).not.toContain("w-1");
			expect(after).not.toContain("data-[direction=vertical]:h-px");
			expect(files[0].content.match(/<div class="([^"]*)"/g)).toEqual(
				install("resizable", "resizable-handle.svelte", base)[0].content.match(
					/<div class="([^"]*)"/g
				)
			);
			// This is the same cn(defaults, className) precedence used by the wrapper.
			expect(cn(after.join(" "), "w-2 data-[direction=vertical]:h-2")).not.toContain("w-0.75");
			expect(cn(after.join(" "), "w-2 data-[direction=vertical]:h-2")).not.toContain(
				"data-[direction=vertical]:h-0.5"
			);
			compile(files[0].content, { filename: "resizable-handle.svelte", generate: "server" });
		}
	);

	it.each(styles)(
		"roundtrips asymmetric and repeated partial Scroll Area writes for %s, preserving structural classes",
		(style) => {
			const base = styleMap(style);
			const first = mergeStyleMaps(
				base,
				scrollAreaOverrideClasses({
					verticalThickness: 24,
					horizontalThickness: 6,
					thumbRadius: "md",
				})
			);
			const second = mergeStyleMaps(first, scrollAreaOverrideClasses({ verticalThickness: 14 }));
			const files = install("scroll-area", "scroll-area-scrollbar.svelte", second);
			expect(parseScrollAreaSource(files).values).toEqual({
				verticalThickness: 14,
				horizontalThickness: 6,
				thumbRadius: "md",
			});
			const before = classesAt(
				install("scroll-area", "scroll-area-scrollbar.svelte", base)[0].content,
				"scroll-area-scrollbar"
			).split(/\s+/);
			const after = classesAt(files[0].content, "scroll-area-scrollbar").split(/\s+/);
			for (const utility of before.filter(
				(utility) => !/^data-(?:horizontal:h|vertical:w)-/.test(utility)
			))
				expect(after).toContain(utility);
			expect(after).toContain("data-vertical:w-3.5");
			expect(after).toContain("data-horizontal:h-1.5");
			expect(after).not.toContain("data-vertical:w-6");
			expect(after).not.toContain("data-horizontal:h-2.5");
			expect(classesAt(files[0].content, "scroll-area-thumb").split(/\s+/)).toEqual(
				expect.arrayContaining(["relative", "flex-1", "bg-border", "rounded-md"])
			);
			expect(cn(after.join(" "), "data-vertical:w-8")).not.toContain("data-vertical:w-3.5");
			const radiusOnly = install(
				"scroll-area",
				"scroll-area-scrollbar.svelte",
				mergeStyleMaps(base, scrollAreaOverrideClasses({ thumbRadius: "sm" }))
			);
			expect(parseScrollAreaSource(radiusOnly).values).toEqual({
				...parseScrollAreaSource(registryFiles("scroll-area", style)).values,
				thumbRadius: "sm",
			});
			const barOnly = install(
				"scroll-area",
				"scroll-area-scrollbar.svelte",
				mergeStyleMaps(base, scrollAreaOverrideClasses({ horizontalThickness: 18 }))
			);
			expect(parseScrollAreaSource(barOnly).values).toEqual({
				...parseScrollAreaSource(registryFiles("scroll-area", style)).values,
				horizontalThickness: 18,
			});
			compile(files[0].content, { filename: "scroll-area-scrollbar.svelte", generate: "server" });
		}
	);

	it("handles every finite size and radius choice without stale values", () => {
		for (let horizontalThickness = 1; horizontalThickness <= 4; horizontalThickness++) {
			for (let verticalThickness = 1; verticalThickness <= 4; verticalThickness++) {
				const values = { horizontalThickness, verticalThickness };
				expect(
					parseResizableSource(
						install(
							"resizable",
							"resizable-handle.svelte",
							mergeStyleMaps(styleMap("nova"), resizableOverrideClasses(values))
						)
					).values
				).toEqual(values);
			}
		}
		for (let verticalThickness = 6; verticalThickness <= 24; verticalThickness += 2) {
			for (const thumbRadius of RADIUS_LEVELS) {
				const values = {
					verticalThickness,
					horizontalThickness: 30 - verticalThickness,
					thumbRadius,
				};
				expect(
					parseScrollAreaSource(
						install(
							"scroll-area",
							"scroll-area-scrollbar.svelte",
							mergeStyleMaps(styleMap("nova"), scrollAreaOverrideClasses(values))
						)
					).values
				).toEqual(values);
			}
		}
	});

	it("aggregates later class literals and treats unrepresented radius as style-owned", () => {
		const files = registryFiles("scroll-area", "nova").map((file) => ({
			...file,
			content: file.content
				.replace("className\n", '"data-vertical:w-4 data-horizontal:h-3",\n\t\tclassName\n')
				.replace("rounded-full", "rounded-[13px]"),
		}));
		expect(parseScrollAreaSource(files).values).toEqual({
			verticalThickness: 16,
			horizontalThickness: 12,
			thumbRadius: "style",
		});
		expect(scrollAreaOverrideClasses({ thumbRadius: "style" })).toEqual({});
		expect(resizableOverrideClasses({})).toEqual({});
		expect(scrollAreaOverrideClasses({})).toEqual({});
		expect(RESIZABLE_SPEC.previewCss(".draft", {}, null)).toBe("");
		expect(SCROLL_AREA_SPEC.previewCss(".draft", { thumbRadius: "style" }, null)).toBe("");
	});

	it("rejects missing registry geometry and unknown styles instead of inventing defaults", async () => {
		for (const parse of [parseResizableSource, parseScrollAreaSource])
			expect(() => parse([])).toThrow();
		expect(() =>
			parseResizableSource(
				registryFiles("resizable", "nova").map((file) => ({
					...file,
					content: file.content.replace("w-px", ""),
				}))
			)
		).toThrow();
		expect(() =>
			parseScrollAreaSource(
				registryFiles("scroll-area", "nova").map((file) => ({
					...file,
					content: file.content.replace("data-vertical:w-2.5", ""),
				}))
			)
		).toThrow();
		expect(() =>
			parseScrollAreaSource(
				registryFiles("scroll-area", "nova").map((file) => ({
					...file,
					content: file.content.replace('data-slot="scroll-area-thumb"', ""),
				}))
			)
		).toThrow();
		for (const spec of [RESIZABLE_SPEC, SCROLL_AREA_SPEC])
			await expect(
				spec.readBaseline(document.createElement("div"), "style-missing")
			).rejects.toThrow();
	});

	it("strictly rejects non-finite, fractional, out-of-range and behavioral persistence", () => {
		for (const value of [NaN, Infinity, -Infinity, -1, 0, 1.5, 5, "2", null]) {
			expect(() => resizableOverrideClasses({ horizontalThickness: value } as never)).toThrow();
			expect(() =>
				RESIZABLE_SPEC.previewCss(".draft", { verticalThickness: value } as never, null)
			).toThrow();
		}
		for (const value of [NaN, Infinity, 0, 5, 7, 25, "10", null])
			expect(() => scrollAreaOverrideClasses({ verticalThickness: value } as never)).toThrow();
		for (const spec of [RESIZABLE_SPEC, SCROLL_AREA_SPEC]) {
			expect(spec.storageKey).toBe(`valar.${spec.component}-styles.v2`);
			const schemas = versionSchemas(spec.component, spec.valuesSchema);
			for (const key of [
				"direction",
				"autoSaveId",
				"sizes",
				"width",
				"height",
				"scrollTop",
				"scrollBehavior",
				"class",
			]) {
				expect(() => spec.overrideClasses({ [key]: 20 }, null)).toThrow();
				const baseline =
					spec.component === "resizable"
						? { horizontalThickness: 1, verticalThickness: 1 }
						: { horizontalThickness: 10, verticalThickness: 10, thumbRadius: "full" };
				expect(
					schemas.version.safeParse({
						format: 2,
						component: spec.component,
						id: "4b346fcb-663d-4f2c-8f6b-a879f96f72c6",
						name: "Geometry",
						createdAt: "2026-11-03T00:00:00.000Z",
						source: { style: "style-nova" },
						baseline,
						overrides: { [key]: 20 },
					}).success
				).toBe(false);
			}
		}
		expect(() => scrollAreaOverrideClasses({ thumbRadius: "13px" } as never)).toThrow();
	});

	it("uses spacing calculations matching compiled utilities, with no important or container/behavior CSS", async () => {
		const resizable = RESIZABLE_SPEC.previewCss(
			".draft",
			{ horizontalThickness: 3, verticalThickness: 4 },
			null
		);
		const scroll = SCROLL_AREA_SPEC.previewCss(
			".draft",
			{ horizontalThickness: 14, verticalThickness: 24, thumbRadius: "sm" },
			null
		);
		expect(resizable).toContain(
			'data-direction="horizontal"] { width: calc(0.75 * var(--spacing))'
		);
		expect(resizable).toContain('data-direction="vertical"] { height: calc(1 * var(--spacing))');
		expect(scroll).toContain('data-orientation="horizontal"] { height: calc(3.5 * var(--spacing))');
		expect(scroll).toContain('data-orientation="vertical"] { width: calc(6 * var(--spacing))');
		const utilities = [
			...Object.values(resizableOverrideClasses({ horizontalThickness: 3, verticalThickness: 4 })),
			...Object.values(
				scrollAreaOverrideClasses({
					horizontalThickness: 14,
					verticalThickness: 24,
					thumbRadius: "sm",
				})
			),
		]
			.join(" ")
			.split(/\s+/);
		const compiler = await compileTailwind(
			"@theme { --spacing: 0.25rem; --radius-sm: 0.125rem; } @tailwind utilities;"
		);
		const compiled = compiler.build(utilities);
		// Tailwind simplifies multiplication by one to the spacing variable itself.
		expect(compiled).toContain("height: var(--spacing);");
		for (const value of ["0.75", "3.5", "6"])
			expect(compiled).toContain(`calc(var(--spacing) * ${value})`);
		expect(resizable + scroll + utilities.join(" ")).not.toMatch(
			/!important|!|scroll-behavior|overflow|autoSaveId|pane-group/
		);
		expect(RESIZABLE_SPEC.pageCss!({ horizontalThickness: 3 }, null)).toContain(
			":not([data-component-tuner] *)"
		);
		expect(SCROLL_AREA_SPEC.pageCss!({ verticalThickness: 12 }, null)).toContain(
			":not([data-component-tuner] *)"
		);
	});
});
