import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import {
	injectStyleClasses,
	mergeStyleMaps,
	parseStyleCss,
} from "@valar/svelte-parity/inject-style-classes";
import { cn } from "cn";
import { flushSync, mount, unmount } from "svelte";
import { compile } from "svelte/compiler";
import { compile as compileTailwind } from "tailwindcss";
import { describe, expect, it } from "vitest";
import {
	ASPECT_RATIO_SPEC,
	aspectRatioOverrideClasses,
	parseAspectRatioSource,
} from "../src/lib/features/workbench/aspect-ratio-tuning.js";
import {
	COLLAPSIBLE_SPEC,
	collapsibleOverrideClasses,
	parseCollapsibleSource,
} from "../src/lib/features/workbench/collapsible-tuning.js";
import {
	SEPARATOR_SPEC,
	separatorOverrideClasses,
	parseSeparatorSource,
} from "../src/lib/features/workbench/separator-tuning.js";
import { applyStyleOverrides } from "../src/lib/features/workbench/style-overrides.js";
import { versionSchemas } from "../src/lib/features/workbench/tuner.js";
import { AspectRatio } from "../src/lib/registry/ui/aspect-ratio/index.js";
import { Separator } from "../src/lib/registry/ui/separator/index.js";

const styles = ["valar"];
const separatorColors = [
	"bg-[color:var(--valar-separator,var(--valar-separator-base,lch(0%_0_0_/_8.8%)))]",
	"dark:[--valar-separator-base:lch(100%_0_0_/_8.3%)]",
];
const read = (path: string) => readFileSync(resolve(path), "utf8");
const registryFiles = (component: string, style: string): { target: string; content: string }[] =>
	JSON.parse(read(`src/__registry__/json/styles/${style}/${component}.json`)).files;
const installed = (component: string, style: string, css: string) => {
	const map = mergeStyleMaps(
		parseStyleCss(read(`src/lib/registry/styles/style-${style}.css`)),
		parseStyleCss(css)
	);
	return readdirSync(resolve(`src/lib/registry/ui/${component}`)).map((target) => ({
		target,
		content: injectStyleClasses(read(`src/lib/registry/ui/${component}/${target}`), map),
	}));
};
const classArgs = (source: string) => {
	const args = /class=\{cn\(([\s\S]*?)\)\}/.exec(source)?.[1];
	if (args === undefined) throw new Error("Missing cn class arguments");
	return [...args.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
};

describe("layout editor baseline and installable geometry contracts", () => {
	it.each(styles)(
		"reads %s's actual flattened registry and preserves the unedited markup",
		async (style) => {
			expect(parseCollapsibleSource(registryFiles("collapsible", style)).values).toEqual({
				paddingX: 0,
				paddingY: 0,
			});
			expect(parseAspectRatioSource(registryFiles("aspect-ratio", style)).values).toEqual({
				radius: "style",
				clipping: "style",
			});
			expect(parseSeparatorSource(registryFiles("separator", style)).values).toEqual({
				horizontalThickness: 0.5,
				verticalThickness: 0.5,
			});
			for (const spec of [COLLAPSIBLE_SPEC, ASPECT_RATIO_SPEC, SEPARATOR_SPEC]) {
				const actual = await spec.readBaseline(document.createElement("div"), `style-${style}`);
				const parse =
					spec.component === "collapsible"
						? parseCollapsibleSource
						: spec.component === "aspect-ratio"
							? parseAspectRatioSource
							: parseSeparatorSource;
				expect(actual).toEqual(parse(registryFiles(spec.component, style)));
			}
			const collapsible = installed("collapsible", style, "");
			const aspect = installed("aspect-ratio", style, "");
			const separator = installed("separator", style, "");
			expect(parseCollapsibleSource(collapsible).values).toEqual({ paddingX: 0, paddingY: 0 });
			expect(parseAspectRatioSource(aspect).values).toEqual({ radius: "style", clipping: "style" });
			expect(parseSeparatorSource(separator).values).toEqual({
				horizontalThickness: 0.5,
				verticalThickness: 0.5,
			});
			for (const [files, file] of [
				[collapsible, "collapsible-content.svelte"],
				[aspect, "aspect-ratio.svelte"],
			] as const) {
				const source = files.find((entry) => entry.target === file)!.content;
				expect(cn(...classArgs(source))).toBe("");
				expect(source).not.toMatch(/(?:p[xy]?|bg|border|rounded|overflow)-/);
				expect(source).toContain("{...restProps}");
			}
			for (const file of ["collapsible.svelte", "collapsible-trigger.svelte"])
				expect(collapsible.find((entry) => entry.target === file)!.content).toBe(
					registryFiles("collapsible", style).find((entry) => entry.target.endsWith(`/${file}`))!
						.content.replaceAll("$UTILS$.js", "$lib/utils.js")
				);
			const separatorClasses = cn(
				...classArgs(separator.find((entry) => entry.target === "separator.svelte")!.content)
			);
			expect(separatorClasses.split(" ")).toEqual(
				expect.arrayContaining([
					...separatorColors,
					"shrink-0",
					"data-horizontal:w-full",
					"data-vertical:self-stretch",
					"data-horizontal:h-[0.5px]",
					"data-vertical:w-[0.5px]",
				])
			);
		}
	);

	it.each(styles)(
		"roundtrips repeated asymmetric and partial edits through real %s injection and merge",
		(style) => {
			let css = read(`src/lib/registry/styles/valar/style-${style}.css`);
			const original = parseStyleCss(css);
			for (const [collapsible, aspect, separator, expected] of [
				[
					{ paddingX: 30, paddingY: 6 },
					{ radius: "xl", clipping: "hidden" },
					{ horizontalThickness: 3, verticalThickness: 7 },
					[
						{ paddingX: 30, paddingY: 6 },
						{ radius: "xl", clipping: "hidden" },
						{ horizontalThickness: 3, verticalThickness: 7 },
					],
				],
				[
					{ paddingX: 0 },
					{ radius: "none" },
					{ horizontalThickness: 1 },
					[
						{ paddingX: 0, paddingY: 6 },
						{ radius: "none", clipping: "hidden" },
						{ horizontalThickness: 1, verticalThickness: 7 },
					],
				],
				[
					{ paddingY: 32 },
					{ clipping: "visible" },
					{ verticalThickness: 2 },
					[
						{ paddingX: 0, paddingY: 32 },
						{ radius: "none", clipping: "visible" },
						{ horizontalThickness: 1, verticalThickness: 2 },
					],
				],
			] as const) {
				css = applyStyleOverrides(css, {
					style,
					classes: {
						...collapsibleOverrideClasses(collapsible),
						...aspectRatioOverrideClasses(aspect),
						...separatorOverrideClasses(separator),
					},
				});
				const groups = [
					installed("collapsible", style, css),
					installed("aspect-ratio", style, css),
					installed("separator", style, css),
				];
				expect(parseCollapsibleSource(groups[0]).values).toEqual(expected[0]);
				expect(parseAspectRatioSource(groups[1]).values).toEqual(expected[1]);
				expect(parseSeparatorSource(groups[2]).values).toEqual(expected[2]);
				for (const group of groups)
					for (const file of group.filter((entry) => entry.target.endsWith(".svelte"))) {
						expect(() =>
							compile(file.content, { filename: file.target, generate: "server" })
						).not.toThrow();
					}
				const separatorSource = groups[2].find(
					(file) => file.target === "separator.svelte"
				)!.content;
				expect(cn(...classArgs(separatorSource)).split(" ")).toEqual(
					expect.arrayContaining([
						...separatorColors,
						"data-horizontal:w-full",
						"data-vertical:self-stretch",
					])
				);
				expect(separatorSource).not.toMatch(/decorative\s*=|orientation\s*=/);
				for (const [key, value] of Object.entries(original))
					expect(parseStyleCss(css)[key]).toBe(value);
			}
		}
	);

	it("uses finite strict partial schemas, separate v2 stores and no accidental defaults", () => {
		const specs = [COLLAPSIBLE_SPEC, ASPECT_RATIO_SPEC, SEPARATOR_SPEC];
		expect(new Set(specs.map((spec) => spec.storageKey)).size).toBe(3);
		for (const spec of specs) {
			expect(spec.storageKey).toBe(`valar.${spec.component}-styles.v2`);
			expect(spec.overrideClasses({}, null)).toEqual({});
			expect(spec.previewCss("[data-canvas]", {}, null)).toBe("");
			expect(spec.pageCss?.({}, null)).toBe("");
			for (const bad of [
				{ unknown: 1 },
				{ ratio: 1.5 },
				{ orientation: "vertical" },
				{ decorative: true },
			]) {
				expect(() => spec.overrideClasses(bad as never, null)).toThrow();
				expect(() => spec.previewCss("#canvas", bad as never, null)).toThrow();
			}
		}
		for (const bad of [NaN, Infinity, -Infinity, -2, 3, 34, "8"])
			expect(() => collapsibleOverrideClasses({ paddingX: bad } as never)).toThrow();
		for (const bad of [NaN, Infinity, -Infinity, 0, 9, 1.25, "2"])
			expect(() => separatorOverrideClasses({ horizontalThickness: bad } as never)).toThrow();
		for (const bad of [{ radius: "xxl" }, { clipping: "auto" }, { ratio: 16 / 9 }])
			expect(() => aspectRatioOverrideClasses(bad as never)).toThrow();
		expect(aspectRatioOverrideClasses({ radius: "style", clipping: "style" })).toEqual({});
		const version = versionSchemas("aspect-ratio", ASPECT_RATIO_SPEC.valuesSchema).version;
		const saved = {
			format: 2,
			component: "aspect-ratio",
			id: "11111111-1111-4111-8111-111111111111",
			name: "边界",
			createdAt: "2026-11-03T00:00:00.000Z",
			source: { style: "style-valar" },
			baseline: { radius: "style", clipping: "style" },
			overrides: { clipping: "hidden" },
		};
		expect(version.safeParse(saved).success).toBe(true);
		expect(version.safeParse({ ...saved, overrides: { ratio: 1 } }).success).toBe(false);
	});

	it("fails on missing primitives, unrecognizable class inputs and missing directional thickness", async () => {
		for (const parse of [parseCollapsibleSource, parseAspectRatioSource, parseSeparatorSource])
			expect(() => parse([])).toThrow();
		for (const spec of [COLLAPSIBLE_SPEC, ASPECT_RATIO_SPEC, SEPARATOR_SPEC])
			await expect(
				spec.readBaseline(document.createElement("div"), "style-missing")
			).rejects.toThrow();
		for (const [component, file, parse] of [
			["collapsible", "collapsible-content.svelte", parseCollapsibleSource],
			["aspect-ratio", "aspect-ratio.svelte", parseAspectRatioSource],
		] as const) {
			const source = installed(component, "valar", "").find(
				(entry) => entry.target === file
			)!.content;
			expect(() =>
				parse([
					{
						target: file,
						content: source.replace(/class=\{cn\([\s\S]*?\)\}/, 'class="unreadable"'),
					},
				])
			).toThrow();
			expect(() =>
				parse([
					{
						target: file,
						content: source.replace(/class=\{cn\([\s\S]*?\)\}/, "class={cn(unknownClasses)}"),
					},
				])
			).toThrow();
			expect(() =>
				parse([{ target: file, content: source.replace(/data-slot="[^"]+"/, "") }])
			).toThrow();
		}
		const separator = installed("separator", "valar", "").find(
			(file) => file.target === "separator.svelte"
		)!;
		expect(() =>
			parseSeparatorSource([
				{ ...separator, content: separator.content.replace("data-vertical:w-[0.5px]", "") },
			])
		).toThrow();
		expect(() =>
			parseSeparatorSource([
				{
					...separator,
					content: separator.content.replace("data-horizontal:h-[0.5px]", "data-horizontal:h-[3px]"),
				},
			])
		).toThrow();
	});

	it("mirrors Tailwind's token-based spacing and keeps page CSS out of editor panes", async () => {
		const compiler = await compileTailwind("@theme { --spacing: 0.25rem; } @tailwind utilities;");
		const classes = {
			...collapsibleOverrideClasses({ paddingX: 30, paddingY: 6 }),
			...separatorOverrideClasses({ horizontalThickness: 3, verticalThickness: 1 }),
		};
		const utilities = Object.values(classes).flatMap((value) => value.split(" "));
		const css = compiler.build(utilities);
		for (const value of ["7.5", "1.5", "0.75"])
			expect(css).toContain(`calc(var(--spacing) * ${value})`);
		expect(css).toContain("width: 1px");
		const preview = COLLAPSIBLE_SPEC.previewCss("#canvas", { paddingX: 30, paddingY: 6 }, null);
		expect(preview).toContain("padding-inline: calc(7.5 * var(--spacing))");
		expect(preview).toContain("padding-block: calc(1.5 * var(--spacing))");
		const separator = SEPARATOR_SPEC.previewCss(
			"#canvas",
			{ horizontalThickness: 3, verticalThickness: 1 },
			null
		);
		expect(separator).toContain(
			'[data-orientation="horizontal"] { height: calc(0.75 * var(--spacing))'
		);
		expect(separator).toContain('[data-orientation="vertical"] { width: 1px; }');
		expect(ASPECT_RATIO_SPEC.previewCss("#canvas", { radius: "lg" }, null)).not.toContain(
			"overflow:"
		);
		expect(ASPECT_RATIO_SPEC.previewCss("#canvas", { clipping: "hidden" }, null)).not.toContain(
			"border-radius:"
		);
		for (const spec of [COLLAPSIBLE_SPEC, ASPECT_RATIO_SPEC, SEPARATOR_SPEC]) {
			const overrides =
				spec.component === "collapsible"
					? { paddingX: 2 }
					: spec.component === "separator"
						? { horizontalThickness: 2 }
						: { radius: "lg" };
			expect(spec.pageCss?.(overrides as never, null)).toContain(
				":not([data-component-tuner]):not([data-component-tuner] *)"
			);
		}
	});

	it("keeps caller classes last after flattened write-back", () => {
		const css = applyStyleOverrides("", {
			style: "valar",
			classes: {
				...collapsibleOverrideClasses({ paddingX: 30, paddingY: 6 }),
				...aspectRatioOverrideClasses({ radius: "xl", clipping: "hidden" }),
				...separatorOverrideClasses({ horizontalThickness: 3, verticalThickness: 7 }),
			},
		});
		for (const [component, file, local, expected] of [
			["collapsible", "collapsible-content.svelte", "px-2 py-4", ["px-2", "py-4"]],
			[
				"aspect-ratio",
				"aspect-ratio.svelte",
				"rounded-none overflow-visible",
				["rounded-none", "overflow-visible"],
			],
			[
				"separator",
				"separator.svelte",
				"data-horizontal:h-px data-vertical:w-0.5",
				["data-horizontal:h-px", "data-vertical:w-0.5"],
			],
		] as const) {
			const source = installed(component, "valar", css).find(
				(entry) => entry.target === file
			)!.content;
			expect(source).toMatch(/className\s*\)\}/);
			expect(cn(...classArgs(source), local).split(" ")).toEqual(
				expect.arrayContaining([...expected])
			);
			expect(source).toContain("{...restProps}");
		}
	});
});

describe("layout primitive runtime defaults and caller props", () => {
	it("keeps semantic/decorative separator orientation and caller class/style", async () => {
		for (const orientation of ["horizontal", "vertical"] as const)
			for (const decorative of [false, true]) {
				const target = document.createElement("div");
				const app = mount(Separator, {
					target,
					props: {
						orientation,
						decorative,
						class: "data-horizontal:h-2 data-vertical:w-2",
						style: "opacity: 0.6",
					},
				});
				try {
					flushSync();
					const element = target.querySelector<HTMLElement>('[data-slot="separator"]')!;
					expect(element.getAttribute("role")).toBe(decorative ? "none" : "separator");
					expect(element.getAttribute("aria-hidden")).toBe(decorative ? "true" : null);
					expect(element.getAttribute("aria-orientation")).toBe(orientation);
					expect(element.dataset.orientation).toBe(orientation);
					expect([...element.classList]).toEqual(expect.arrayContaining(separatorColors));
					expect(element.classList.contains("data-horizontal:h-[0.5px]")).toBe(false);
					expect(element.classList.contains("data-vertical:w-[0.5px]")).toBe(false);
					expect(element.style.opacity).toBe("0.6");
				} finally {
					await unmount(app);
				}
			}
	});

	it("leaves ratio to Bits UI and does not add radius, clipping or padding by default", async () => {
		for (const ratio of [16 / 9, 1, 3 / 4]) {
			const target = document.createElement("div");
			const app = mount(AspectRatio, {
				target,
				props: { ratio, class: "caller-media", style: "border-radius: 19px; overflow: visible" },
			});
			try {
				flushSync();
				const element = target.querySelector<HTMLElement>('[data-slot="aspect-ratio"]')!;
				expect(Number.parseFloat(element.parentElement!.style.paddingBottom)).toBeCloseTo(
					100 / ratio
				);
				expect(element.classList.contains("caller-media")).toBe(true);
				expect(element.className).not.toMatch(/rounded-|overflow-|p[xy]?-/);
				expect(element.style.borderRadius).toBe("19px");
				expect(element.style.overflow).toBe("visible");
			} finally {
				await unmount(app);
			}
		}
	});
});
