import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";
import ts from "typescript";
import { registryItemSchema, type CssSchema, type RegistryItem } from "@valar/svelte-cli/schema";
import {
	applyTokenUtilities,
	injectStyleClasses,
	mergeStyleMaps,
	parseStyleCss,
} from "@valar/svelte-parity/inject-style-classes";
import { compile } from "svelte/compiler";
import { compile as compileTailwind } from "tailwindcss";
import { describe, expect, it } from "vitest";
import {
	ACCORDION_SPEC,
	accordionOverrideClasses,
	parseAccordionSource,
} from "../src/lib/features/workbench/accordion-tuning.js";
import {
	ALERT_DIALOG_SPEC,
	alertDialogOverrideClasses,
	parseAlertDialogSource,
} from "../src/lib/features/workbench/alert-dialog-tuning.js";
import {
	ALERT_SPEC,
	alertOverrideClasses,
	parseAlertSource,
} from "../src/lib/features/workbench/alert-tuning.js";
import {
	AVATAR_SPEC,
	avatarOverrideClasses,
	parseAvatarSource,
} from "../src/lib/features/workbench/avatar-tuning.js";
import {
	BADGE_SPEC,
	badgeOverrideClasses,
	parseBadgeSource,
} from "../src/lib/features/workbench/badge-tuning.js";
import {
	parseBreadcrumbSource,
	breadcrumbOverrideClasses,
} from "../src/lib/features/workbench/breadcrumb-tuning.js";
import {
	parseButtonGroupSource,
	buttonGroupOverrideClasses,
} from "../src/lib/features/workbench/button-group-tuning.js";
import { buttonOverrideClasses } from "../src/lib/features/workbench/button-tuning.js";
import {
	CARD_SPEC,
	cardOverrideClasses,
	parseCardSource,
} from "../src/lib/features/workbench/card-tuning.js";
import {
	CHECKBOX_SPEC,
	checkboxOverrideClasses,
	parseCheckboxSource,
} from "../src/lib/features/workbench/checkbox-tuning.js";
import { CONTEXT_MENU_SPEC } from "../src/lib/features/workbench/context-menu-tuning.js";
import { heightTier } from "../src/lib/features/workbench/control-tiers.js";
import { COMPONENT_INVENTORY } from "../src/lib/features/workbench/coverage.js";
import {
	dialogOverrideClasses,
	parseDialogSource,
} from "../src/lib/features/workbench/dialog-tuning.js";
import {
	drawerOverrideClasses,
	parseDrawerSource,
} from "../src/lib/features/workbench/drawer-tuning.js";
import { DROPDOWN_MENU_SPEC } from "../src/lib/features/workbench/dropdown-menu-tuning.js";
import {
	EMPTY_SPEC,
	emptyOverrideClasses,
	parseEmptySource,
} from "../src/lib/features/workbench/empty-tuning.js";
import { buildWorkbenchRegistry } from "../src/lib/features/workbench/export.js";
import {
	hoverCardOverrideClasses,
	parseHoverCardSource,
} from "../src/lib/features/workbench/hover-card-tuning.js";
import {
	INPUT_GROUP_SPEC,
	inputGroupOverrideClasses,
	parseInputGroupSource,
} from "../src/lib/features/workbench/input-group-tuning.js";
import {
	INPUT_OTP_SPEC,
	inputOtpOverrideClasses,
	parseInputOtpSource,
} from "../src/lib/features/workbench/input-otp-tuning.js";
import { inputOverrideClasses } from "../src/lib/features/workbench/input-tuning.js";
import {
	ITEM_SPEC,
	itemOverrideClasses,
	parseItemSource,
} from "../src/lib/features/workbench/item-tuning.js";
import { parseKbdSource, kbdOverrideClasses } from "../src/lib/features/workbench/kbd-tuning.js";
import { parseMenuSource, type MenuOverrides } from "../src/lib/features/workbench/menu-tuning.js";
import {
	parseMenubarSource,
	menubarOverrideClasses,
} from "../src/lib/features/workbench/menubar-tuning.js";
import {
	COMPONENTS,
	PARAMETERS,
	defaultPreset,
	defaults,
	parseWorkbenchPreset,
	presetSchema,
} from "../src/lib/features/workbench/model.js";
import {
	NATIVE_SELECT_SPEC,
	nativeSelectOverrideClasses,
	parseNativeSelectSource,
} from "../src/lib/features/workbench/native-select-tuning.js";
import {
	parseNavigationMenuSource,
	navigationMenuOverrideClasses,
} from "../src/lib/features/workbench/navigation-menu-tuning.js";
import {
	NUMBER_FIELD_SPEC,
	numberFieldOverrideClasses,
	parseNumberFieldSource,
} from "../src/lib/features/workbench/number-field-tuning.js";
import {
	parsePaginationSource,
	paginationOverrideClasses,
} from "../src/lib/features/workbench/pagination-tuning.js";
import {
	parsePopoverSource,
	popoverOverrideClasses,
} from "../src/lib/features/workbench/popover-tuning.js";
import {
	parseProgressSource,
	progressOverrideClasses,
} from "../src/lib/features/workbench/progress-tuning.js";
import {
	RADIO_GROUP_SPEC,
	parseRadioGroupSource,
	radioGroupOverrideClasses,
} from "../src/lib/features/workbench/radio-group-tuning.js";
import { selectOverrideClasses } from "../src/lib/features/workbench/select-tuning.js";
import {
	parseSheetSource,
	sheetOverrideClasses,
} from "../src/lib/features/workbench/sheet-tuning.js";
import {
	parseSkeletonSource,
	skeletonOverrideClasses,
} from "../src/lib/features/workbench/skeleton-tuning.js";
import {
	SLIDER_FIELD_SPEC,
	parseSliderFieldSource,
	sliderFieldOverrideClasses,
} from "../src/lib/features/workbench/slider-field-tuning.js";
import {
	parseSliderSource,
	sliderOverrideClasses,
} from "../src/lib/features/workbench/slider-tuning.js";
import {
	parseSpinnerSource,
	spinnerOverrideClasses,
} from "../src/lib/features/workbench/spinner-tuning.js";
import {
	applyStyleOverrides,
	styleOverridePayloadSchema,
} from "../src/lib/features/workbench/style-overrides.js";
import { createWorkbenchCss } from "../src/lib/features/workbench/styles.js";
import {
	SWITCH_SPEC,
	parseSwitchSource,
	switchOverrideClasses,
} from "../src/lib/features/workbench/switch-tuning.js";
import {
	TABLE_SPEC,
	parseTableSource,
	tableOverrideClasses,
} from "../src/lib/features/workbench/table-tuning.js";
import {
	TABS_SPEC,
	parseTabsSource,
	tabsOverrideClasses,
} from "../src/lib/features/workbench/tabs-tuning.js";
import {
	TAGS_INPUT_SPEC,
	parseTagsInputSource,
	tagsInputOverrideClasses,
} from "../src/lib/features/workbench/tags-input-tuning.js";
import { textareaOverrideClasses } from "../src/lib/features/workbench/textarea-tuning.js";
import {
	parseToggleGroupSource,
	toggleGroupOverrideClasses,
} from "../src/lib/features/workbench/toggle-group-tuning.js";
import {
	parseToggleSource,
	toggleOverrideClasses,
} from "../src/lib/features/workbench/toggle-tuning.js";
import {
	parseTooltipSource,
	tooltipOverrideClasses,
} from "../src/lib/features/workbench/tooltip-tuning.js";

function originals(): RegistryItem[] {
	return COMPONENTS.map(({ id }) =>
		registryItemSchema.parse(
			JSON.parse(readFileSync(resolve(`static/registry/styles/vega/${id}.json`), "utf8"))
		)
	);
}
function source(registry: RegistryItem, target: string): string {
	return registry.files!.find((file) => file.target === target)!.content;
}
function declarations(css: string, selector: string): Record<string, string> {
	const result: Record<string, string> = {};
	postcss.parse(css).walkRules((rule) => {
		if (rule.selector === selector)
			rule.walkDecls((decl) => {
				result[decl.prop] = decl.value;
			});
	});
	return result;
}
function serializeCss(css: CssSchema): string {
	return Object.entries(css)
		.map(([key, value]) =>
			typeof value === "string" ? `${key}: ${value};` : `${key} { ${serializeCss(value)} }`
		)
		.join("\n");
}
function cssLeaves(css: string): string[] {
	const result: string[] = [];
	postcss.parse(css).walkDecls((decl) => {
		const path: string[] = [];
		let parent = decl.parent;
		while (parent && parent.type !== "root") {
			if (parent.type === "rule") path.unshift(parent.selector);
			if (parent.type === "atrule") path.unshift(`@${parent.name} ${parent.params}`);
			parent = parent.parent;
		}
		result.push(
			`${path.join(" > ")} | ${decl.prop}: ${decl.value}${decl.important ? " !important" : ""}`
		);
	});
	return result.sort();
}

/** Execute the installed source's real prop defaults, not a reimplementation of them.
 * Svelte compilation is checked separately; this isolates the exported prop contract
 * from DOM positioning/timing (left to the browser integration suite). */
function evaluateProps(source: string, props: Record<string, unknown>, expression: string) {
	const script = source
		.match(/<script[^>]*>([\s\S]*?)<\/script>/)![1]
		.replace(/^\s*import[\s\S]*?;\s*/gm, "");
	const js = ts
		.transpileModule(script, {
			compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
		})
		.outputText.replace(/\bexport\s*\{\s*\};?/g, "");
	return new Function("$props", "$bindable", "$derived", `${js}\nreturn (${expression});`)(
		() => props,
		(value: unknown) => value,
		(value: unknown) => value
	);
}

describe("workbench public preset contract", () => {
	it("has complete unique descriptors and independent mutable clones of immutable defaults", () => {
		expect([...COMPONENT_INVENTORY].sort()).toEqual(
			readdirSync(resolve("src/lib/registry/ui"), { withFileTypes: true })
				.filter((item) => item.isDirectory())
				.map((item) => item.name)
				.sort()
		);
		expect(COMPONENTS.every(({ id }) => COMPONENT_INVENTORY.some((name) => name === id))).toBe(
			true
		);
		expect(new Set(PARAMETERS.map((p) => p.key)).size).toBe(PARAMETERS.length);
		expect(Object.keys(defaults)).toHaveLength(PARAMETERS.length);
		expect(presetSchema.parse(defaultPreset)).toEqual(defaultPreset);
		const first = structuredClone(defaultPreset);
		first.values["button.height"] = 64;
		const second = parseWorkbenchPreset(defaultPreset);
		expect(second.values["button.height"]).toBe(40);
		expect(defaults["button.height"]).toBe(40);
		second.values["button.height"] = 48;
		expect(defaultPreset.values["button.height"]).toBe(40);
	});

	it("rejects unknown/missing keys, incorrect types, versions, malformed JSON and unsafe values", () => {
		for (const input of [
			null,
			[],
			{},
			{ ...defaultPreset, version: 2 },
			{ ...defaultPreset, extra: true },
			{ ...defaultPreset, values: {} },
			{ ...defaultPreset, name: "<script>" },
			{ ...defaultPreset, name: "" },
		]) {
			expect(presetSchema.safeParse(input).success).toBe(false);
		}
		for (const [key, value] of [
			["global.radius", "12"],
			["button.height", Infinity],
			["button.height", NaN],
			["dialog.closeOnEscape", "false"],
			["tooltip.side", "center"],
			["accordion.type", "all"],
			["dialog.easing", "cubic-bezier(0,0,0,1)"],
			["button.bg", "red; } body { display:none"],
			["unknown", 1],
		] as const) {
			expect(
				presetSchema.safeParse({ ...defaultPreset, values: { ...defaults, [key]: value } }).success,
				key
			).toBe(false);
		}
		for (const parameter of PARAMETERS.filter((p) => p.type === "number")) {
			for (const value of [parameter.min! - 1, parameter.max! + 1]) {
				expect(
					presetSchema.safeParse({
						...defaultPreset,
						values: { ...defaults, [parameter.key]: value },
					}).success,
					parameter.key
				).toBe(false);
			}
		}
		expect(() => parseWorkbenchPreset("{oops")).toThrow();
		expect(() => parseWorkbenchPreset('{"__proto__":{"polluted":true}}')).toThrow();
		expect({}).not.toHaveProperty("polluted");
	});

	it("accepts numeric picker color formats but rejects CSS injection and malformed colors", () => {
		for (const value of [
			"#abc",
			"#abcd",
			"#123456",
			"#12345678",
			"rgb(12, 24, 36)",
			"rgba(12, 24, 36, 0.5)",
			"rgb(10% 20% 30% / 80%)",
			"hsl(240 60% 50%)",
			"hsla(240deg, 60%, 50%, .5)",
			"oklch(0.65 0.2 250 / .8)",
			"oklch(65% 0.2 250deg)",
			"color(display-p3 0.2 0.3 0.4 / 1)",
		]) {
			expect(
				presetSchema.safeParse({ ...defaultPreset, values: { ...defaults, "button.bg": value } })
					.success,
				value
			).toBe(true);
		}
		for (const value of [
			"#zzzzzz",
			"rgb(1 2)",
			"rgb(1,2,3,4,5)",
			"hsl(1 2 3)",
			"var(--primary)",
			"url(https://example.com)",
			"rgb(calc(1 + 1) 0 0)",
			"color(display-p3 1 2)",
			"oklch(none 0 0)",
			"#fff</style><script>",
			"rgb(1 2 3); color: red",
			"rgb(999999999999 0 0)",
		]) {
			expect(
				presetSchema.safeParse({ ...defaultPreset, values: { ...defaults, "button.bg": value } })
					.success,
				value
			).toBe(false);
		}
	});

	it("round-trips raw JSON and the downloaded registry metadata without sharing state", () => {
		const preset = structuredClone(defaultPreset);
		preset.name = "设计方案 B";
		preset.values["dialog.width"] = 640;
		expect(parseWorkbenchPreset(JSON.stringify(preset))).toEqual(preset);
		const exported = buildWorkbenchRegistry(preset, originals());
		expect(exported.meta?.workbenchPreset).toEqual(preset);
		expect(parseWorkbenchPreset(JSON.stringify(exported))).toEqual(preset);
		preset.values["dialog.width"] = 480;
		expect(exported.meta?.workbenchPreset.values["dialog.width"]).toBe(640);
	});
});

describe("shared preview / installed CSS", () => {
	it("resolves explicit global inheritance and independent per-component overrides", () => {
		const preset = structuredClone(defaultPreset);
		Object.assign(preset.values, {
			"global.radius": 22,
			"global.motionDuration": 350,
			"global.easing": "linear",
			"global.primary": "#123456",
			"global.fontSize": 18,
		});
		let css = createWorkbenchCss(preset);
		expect(declarations(css, '[data-slot="button"]')).toMatchObject({
			"border-radius": "22px",
			"font-size": "18px",
			transition: "background-color 350ms linear, scale 350ms linear",
		});
		expect(
			declarations(css, '[data-slot="button"][data-variant="default"]')["background-color"]
		).toBe("#123456");
		for (const c of ["dialog-content", "tooltip-content", "accordion-item"]) {
			expect(declarations(css, `[data-slot="${c}"]`)["border-radius"]).toBe("22px");
		}
		expect(declarations(css, '[data-slot="tooltip-content"]')["font-size"]).toBe("12px");
		Object.assign(preset.values, {
			"button.inheritRadius": false,
			"button.radius": 4,
			"button.inheritColors": false,
			"button.bg": "rgb(24 48 96)",
			"button.text": "#abcdef",
			"button.inheritMotion": false,
			"button.duration": 90,
			"button.easing": "ease-in",
			"tooltip.inheritFontSize": true,
			"dialog.inheritRadius": false,
			"dialog.radius": 16,
			"dialog.inheritColors": false,
			"dialog.background": "#fedcba",
			"tooltip.inheritColors": false,
			"tooltip.bg": "#aabbcc",
			"tooltip.text": "#112233",
		});
		css = createWorkbenchCss(preset);
		expect(declarations(css, '[data-slot="button"]')).toMatchObject({
			"border-radius": "4px",
			transition: "background-color 90ms ease-in, scale 90ms ease-in",
		});
		expect(declarations(css, '[data-slot="button"][data-variant="default"]')).toMatchObject({
			"background-color": "rgb(24 48 96)",
			color: "#abcdef",
		});
		expect(declarations(css, '[data-slot="dialog-content"]')).toMatchObject({
			"border-radius": "16px",
			"background-color": "#fedcba",
		});
		expect(declarations(css, '[data-slot="tooltip-content"]')).toMatchObject({
			"font-size": "18px",
			"background-color": "#aabbcc",
			color: "#112233",
		});
		expect(
			declarations(css, '[data-slot="tooltip-content"] > div[data-side]')["background-color"]
		).toBe("#aabbcc");
	});

	it("uses actual Bits states, full animation shorthands, safe centering and reduced motion", () => {
		const preset = structuredClone(defaultPreset);
		Object.assign(preset.values, {
			"dialog.inheritMotion": false,
			"dialog.enterDuration": 420,
			"dialog.exitDuration": 120,
			"dialog.easing": "ease-in-out",
		});
		const css = createWorkbenchCss(preset);
		expect(declarations(css, '[data-slot="dialog-content"][data-state="open"]').animation).toBe(
			"wb-panel-in 420ms ease-in-out both"
		);
		expect(declarations(css, '[data-slot="dialog-content"][data-state="closed"]').animation).toBe(
			"wb-panel-out 120ms ease-in-out both"
		);
		expect(css).toContain('[data-state="delayed-open"]');
		expect(css).toContain('[data-state="instant-open"]');
		expect(css).toContain("height: var(--bits-accordion-content-height)");
		expect(css).toContain("prefers-reduced-motion: reduce");
		expect(css).toContain("scale: 1 !important");
		expect(css).not.toMatch(/(?:^|[;{])\s*translate\s*:/);
		expect(css).not.toContain("@layer");
	});
});

describe("installable native component bundle", () => {
	it("is a valid registry, keeps original sources and dependencies, and embeds the exact preview CSS", () => {
		const items = originals();
		items[0].dependencies = ["example-package", "example-package"];
		items[0].registryDependencies = ["utils", "dialog", "https://example.com/button.json"];
		items[0].css = { ".existing-rule": { color: "red" } };
		const before = JSON.stringify(items);
		const bundle = buildWorkbenchRegistry(defaultPreset, items);
		expect(registryItemSchema.safeParse(JSON.parse(JSON.stringify(bundle))).success).toBe(true);
		expect(bundle.type).toBe("registry:ui");
		expect(bundle.files).toHaveLength(items.reduce((count, item) => count + item.files!.length, 0));
		expect(
			bundle.files!.every(
				(file) =>
					file.type === "registry:ui" && /^(button|dialog|tooltip|accordion)\//.test(file.target)
			)
		).toBe(true);
		expect(bundle.registryDependencies).toEqual(["utils", "https://example.com/button.json"]);
		expect(bundle.dependencies).toEqual(["example-package"]);
		expect(bundle.devDependencies).toEqual([
			...new Set(items.flatMap((item) => item.devDependencies ?? [])),
		]);
		expect(bundle.devDependencies?.some((d) => d.includes("dialkit"))).toBe(false);
		expect(source(bundle, "button/button.svelte")).toBe(source(items[0], "button/button.svelte"));
		// Design rules ship with the exported component too.
		expect(source(bundle, "button/RULES.md")).toContain("Button 设计规范");
		expect(JSON.stringify(items)).toBe(before);
		const css = { ...bundle.css };
		delete css[".existing-rule"];
		expect(cssLeaves(serializeCss(css))).toEqual(cssLeaves(createWorkbenchCss(defaultPreset)));
		for (const file of bundle.files!.filter((file) => file.target.endsWith(".svelte"))) {
			expect(
				() => compile(file.content, { filename: file.target, generate: "client" }),
				file.target
			).not.toThrow();
		}
	});

	it("installs behavior defaults and preserves explicit caller overrides and bind/value contracts", () => {
		const preset = structuredClone(defaultPreset);
		Object.assign(preset.values, {
			"dialog.closeOnEscape": false,
			"dialog.closeOnOutside": false,
			"dialog.showCloseButton": false,
			"tooltip.delayDuration": 650,
			"tooltip.side": "right",
			"tooltip.sideOffset": 14,
			"accordion.type": "multiple",
			"accordion.disabled": true,
		});
		const bundle = buildWorkbenchRegistry(preset, originals());
		const dialog = source(bundle, "dialog/dialog-content.svelte");
		expect(
			evaluateProps(dialog, {}, "{showCloseButton, escapeKeydownBehavior, interactOutsideBehavior}")
		).toEqual({
			showCloseButton: false,
			escapeKeydownBehavior: "ignore",
			interactOutsideBehavior: "ignore",
		});
		expect(
			evaluateProps(
				dialog,
				{ showCloseButton: true, escapeKeydownBehavior: "close", interactOutsideBehavior: "close" },
				"{showCloseButton, escapeKeydownBehavior, interactOutsideBehavior}"
			)
		).toEqual({
			showCloseButton: true,
			escapeKeydownBehavior: "close",
			interactOutsideBehavior: "close",
		});
		const content = dialog.slice(dialog.indexOf("<DialogPrimitive.Content"));
		expect(content.indexOf("{escapeKeydownBehavior}")).toBeLessThan(
			content.indexOf("{...restProps}")
		);
		expect(content.indexOf("{interactOutsideBehavior}")).toBeLessThan(
			content.indexOf("{...restProps}")
		);
		expect(dialog).toContain("{#if showCloseButton}");
		const provider = source(bundle, "tooltip/tooltip-provider.svelte");
		expect(evaluateProps(provider, {}, "delayDuration")).toBe(650);
		expect(evaluateProps(provider, { delayDuration: 0 }, "delayDuration")).toBe(0);
		const tooltip = source(bundle, "tooltip/tooltip-content.svelte");
		expect(evaluateProps(tooltip, {}, "{side, sideOffset}")).toEqual({
			side: "right",
			sideOffset: 14,
		});
		expect(evaluateProps(tooltip, { side: "bottom", sideOffset: 0 }, "{side, sideOffset}")).toEqual(
			{ side: "bottom", sideOffset: 0 }
		);
		expect(tooltip).toContain("\t\t{sideOffset}\n\t\t{side}");
		const accordion = source(bundle, "accordion/accordion.svelte");
		expect(evaluateProps(accordion, {}, "rootProps")).toEqual({ type: "multiple", disabled: true });
		const onValueChange = () => {};
		expect(
			evaluateProps(
				accordion,
				{ type: "single", disabled: false, value: "one", onValueChange },
				"{value, rootProps}"
			)
		).toEqual({ value: "one", rootProps: { type: "single", disabled: false, onValueChange } });
		expect(evaluateProps(accordion, { type: undefined, disabled: undefined }, "rootProps")).toEqual(
			{ type: "multiple", disabled: true }
		);
		expect(accordion).toContain("bind:value={value as never}");
		expect(accordion).toContain("{...rootProps}");
	});

	it.each(["single", "multiple"])(
		"preserves discriminated Accordion prop types with %s defaults",
		(type) => {
			const preset = structuredClone(defaultPreset);
			preset.values["accordion.type"] = type;
			const accordion = source(
				buildWorkbenchRegistry(preset, originals()),
				"accordion/accordion.svelte"
			);
			const declaration = accordion.match(/type WorkbenchAccordionProps =[\s\S]*?;/)![0];
			const virtualPath = resolve("tests/workbench-props-contract.ts");
			const code = `import { Accordion as AccordionPrimitive } from "bits-ui";
${declaration}
const omitted: WorkbenchAccordionProps = { value: ${type === "single" ? '"one"' : '["one"]'} };
const single: WorkbenchAccordionProps = { type: "single", value: "one", onValueChange: (value: string) => {} };
const multiple: WorkbenchAccordionProps = { type: "multiple", value: ["one"], onValueChange: (value: string[]) => {} };
// @ts-expect-error single mode cannot receive an array
const wrongSingle: WorkbenchAccordionProps = { type: "single", value: ["one"] };
// @ts-expect-error multiple mode cannot receive a string
const wrongMultiple: WorkbenchAccordionProps = { type: "multiple", value: "one" };
// @ts-expect-error omitted type must match the preset's default branch
const wrongDefault: WorkbenchAccordionProps = { value: ${type === "single" ? '["one"]' : '"one"'} };
`;
			const options: ts.CompilerOptions = {
				target: ts.ScriptTarget.ES2022,
				module: ts.ModuleKind.NodeNext,
				moduleResolution: ts.ModuleResolutionKind.NodeNext,
				strict: true,
				skipLibCheck: true,
				noEmit: true,
				types: [],
			};
			const host = ts.createCompilerHost(options);
			const read = host.readFile.bind(host);
			host.readFile = (path) => (path === virtualPath ? code : read(path));
			const program = ts.createProgram([virtualPath], options, host);
			const diagnostics = ts
				.getPreEmitDiagnostics(program)
				.filter((d) => d.file?.fileName === virtualPath);
			expect(diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"))).toEqual(
				[]
			);
		},
		15000
	);

	it("fails clearly on missing components, source drift, path traversal and conflicting files", () => {
		expect(() => buildWorkbenchRegistry(defaultPreset, originals().slice(1))).toThrow("button");
		const drifted = originals();
		drifted[1].files!.find((file) => file.target === "dialog/dialog-content.svelte")!.content =
			"<div />";
		expect(() => buildWorkbenchRegistry(defaultPreset, drifted)).toThrow("源码锚点");
		const unsafe = originals();
		unsafe[0].files![0].target = "../outside.svelte";
		expect(() => buildWorkbenchRegistry(defaultPreset, unsafe)).toThrow("不安全");
		const conflict = originals();
		conflict[0].files!.push({ ...conflict[0].files![0], content: "<button />" });
		expect(() => buildWorkbenchRegistry(defaultPreset, conflict)).toThrow("冲突");
	});
});

describe("Button write-back into Valar style overrides", () => {
	const upstream = readFileSync(resolve("src/lib/registry/styles/style-nova.css"), "utf8");
	const buttonSource = readFileSync(resolve("src/lib/registry/ui/button/button.svelte"), "utf8");
	const sizeClasses = (css: string, size: string) =>
		injectStyleClasses(buttonSource, mergeStyleMaps(parseStyleCss(upstream), parseStyleCss(css)))
			.split("size: {")[1]!
			.match(new RegExp(`\\n\\t+"?${size}"?: "([^"]*)"`))![1]!
			.split(" ");

	it("replaces conflicting utilities in the installed source and keeps earlier write-backs", () => {
		const empty = readFileSync(resolve("src/lib/registry/styles/valar/style-nova.css"), "utf8");
		const first = applyStyleOverrides(
			empty,
			styleOverridePayloadSchema.parse({
				style: "nova",
				classes: buttonOverrideClasses({ "default.height": 44, "default.paddingX": 16 }),
			})
		);
		// A later write for another size must not drop the first one.
		const second = applyStyleOverrides(
			first,
			styleOverridePayloadSchema.parse({
				style: "nova",
				classes: buttonOverrideClasses({ "lg.height": 50, radius: "xl" }),
			})
		);
		const defaults = sizeClasses(second, "default");
		expect(defaults).toEqual(expect.arrayContaining(["h-11", "px-4", "rounded-xl", "gap-1.5"]));
		expect(defaults).not.toContain("h-8");
		expect(defaults).not.toContain("px-2.5");
		// Icon-side padding from upstream stays.
		expect(defaults).toContain("has-data-[icon=inline-start]:pl-2");
		expect(sizeClasses(second, "icon")).toEqual(expect.arrayContaining(["size-11"]));
		expect(sizeClasses(second, "lg")).toContain("h-12.5");
		expect(sizeClasses(second, "lg")).not.toContain("h-9");
		// Untouched sizes keep upstream values.
		expect(sizeClasses(second, "sm")).toContain("h-7");
		// An empty override file leaves the installed source identical to upstream.
		expect(injectStyleClasses(buttonSource, mergeStyleMaps(parseStyleCss(upstream), {}))).toBe(
			injectStyleClasses(buttonSource, parseStyleCss(upstream))
		);
	});

	it("rejects anything other than Button size and radius-level utilities", () => {
		for (const classes of [
			{ "cn-button-size-default": "h-11 bg-red-500" },
			{ "cn-button-size-default": "h-[44px]" },
			{ "cn-card": "h-11" },
			{ "cn-button": "rounded-xl } .x { color: red" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
		expect(styleOverridePayloadSchema.safeParse({ style: "../x", classes: {} }).success).toBe(
			false
		);
	});
});

describe("Dialog write-back into Valar style overrides", () => {
	const registry = (style: string) =>
		JSON.parse(readFileSync(resolve(`static/registry/styles/${style}/dialog.json`), "utf8"));
	const injected = (style: string, css: string, file: string) => {
		const map = mergeStyleMaps(
			parseStyleCss(readFileSync(resolve(`src/lib/registry/styles/style-${style}.css`), "utf8")),
			parseStyleCss(css)
		);
		const source = readFileSync(resolve(`src/lib/registry/ui/dialog/${file}`), "utf8");
		return injectStyleClasses(source, map)
			.match(/cn\(\s*"([^"]*)"/)![1]!
			.split(" ");
	};
	const write = (style: string, overrides: Parameters<typeof dialogOverrideClasses>[0]) => {
		const { context } = parseDialogSource(registry(style).files);
		return applyStyleOverrides(
			readFileSync(resolve(`src/lib/registry/styles/valar/style-${style}.css`), "utf8"),
			styleOverridePayloadSchema.parse({
				style,
				classes: dialogOverrideClasses(overrides, context),
			})
		);
	};

	it("reads each style's own baseline from the installed source", () => {
		const nova = parseDialogSource(registry("nova").files);
		expect(nova.values).toMatchObject({ padding: 16, gap: 16, overlay: 10, radius: "xl" });
		expect(nova.context).toEqual({ footerBleed: true, footerRounded: true });
		const vega = parseDialogSource(registry("vega").files);
		expect(vega.values).toMatchObject({ padding: 24, gap: 24, overlay: 10 });
		expect(vega.context).toEqual({ footerBleed: false, footerRounded: false });
		expect(parseDialogSource(registry("maia").files).values.overlay).toBe(80);
	});

	it("keeps the bleeding footer aligned with the new padding and swaps motion tiers", () => {
		const css = write("nova", { padding: 24, duration: "slow", zoom: "90", overlay: 40 });
		const content = injected("nova", css, "dialog-content.svelte");
		expect(content).toEqual(expect.arrayContaining(["p-6", "gap-4", "duration-slow"]));
		expect(content).toEqual(
			expect.arrayContaining(["data-open:zoom-in-90", "data-closed:zoom-out-90"])
		);
		expect(content).not.toContain("p-4");
		expect(content).not.toContain("data-open:zoom-in-95");
		const footer = injected("nova", css, "dialog-footer.svelte");
		expect(footer).toEqual(expect.arrayContaining(["-mx-6", "-mb-6", "p-6"]));
		expect(footer).not.toContain("-mx-4");
		const overlay = injected("nova", css, "dialog-overlay.svelte");
		expect(overlay).toEqual(expect.arrayContaining(["bg-black/40", "duration-slow"]));
		expect(overlay).not.toContain("bg-black/10");
		expect(overlay).not.toContain("duration-100");
		// Vega's footer does not bleed, so padding must not add negative margins there.
		expect(injected("vega", write("vega", { padding: 20 }), "dialog-footer.svelte")).not.toContain(
			"-mx-5"
		);
	});

	it("rejects colors, arbitrary values and utilities outside each Dialog part", () => {
		for (const classes of [
			{ "cn-dialog-content": "p-6 bg-red-500" },
			{ "cn-dialog-content": "duration-[400ms]" },
			{ "cn-dialog-overlay": "bg-black/45" },
			{ "cn-dialog-overlay": "bg-white/40" },
			{ "cn-dialog-footer": "duration-slow" },
			{ "cn-dialog-title": "p-4" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});

describe("Popover and Sheet write-back into Valar style overrides", () => {
	const registry = (style: string, component: string) =>
		JSON.parse(readFileSync(resolve(`static/registry/styles/${style}/${component}.json`), "utf8"));
	/** The component as `add` installs it: upstream style + Valar overrides, motion tokens. */
	const installed = (style: string, component: string, css: string) => {
		const map = mergeStyleMaps(
			parseStyleCss(readFileSync(resolve(`src/lib/registry/styles/style-${style}.css`), "utf8")),
			parseStyleCss(css)
		);
		const dir = resolve(`src/lib/registry/ui/${component}`);
		return readdirSync(dir).map((name) => ({
			target: name,
			content: applyTokenUtilities(injectStyleClasses(readFileSync(`${dir}/${name}`, "utf8"), map)),
		}));
	};
	const classes = (files: { target: string; content: string }[], name: string) =>
		files
			.find((file) => file.target === name)!
			.content.match(/cn\(\s*"([^"]*)"/)![1]!
			.split(" ");
	const write = (style: string, css: string, payload: Record<string, string>) =>
		applyStyleOverrides(css, styleOverridePayloadSchema.parse({ style, classes: payload }));
	const empty = (style: string) =>
		readFileSync(resolve(`src/lib/registry/styles/valar/style-${style}.css`), "utf8");

	it("reads each style's own Popover and Sheet baseline from the installed source", () => {
		expect(parsePopoverSource(registry("nova", "popover").files).values).toEqual({
			padding: 10,
			gap: 10,
			radius: "lg",
			duration: "fast",
			zoom: "95",
			slide: "8",
		});
		expect(parsePopoverSource(registry("vega", "popover").files).values).toMatchObject({
			padding: 16,
			gap: 16,
			radius: "md",
		});
		expect(parsePopoverSource(registry("lyra", "popover").files).values.radius).toBe("none");
		expect(parseSheetSource(registry("nova", "sheet").files).values).toEqual({
			width: "sm",
			padding: 16,
			gap: 16,
			overlay: 10,
			duration: "normal",
			slide: "40",
		});
		expect(parseSheetSource(registry("luma", "sheet").files).values).toMatchObject({
			padding: 24,
			gap: 0,
			overlay: 30,
		});
		expect(parseSheetSource(registry("sera", "sheet").files).values.padding).toBe(32);
	});

	it("replaces Popover's layout, zoom, slide and tier in the installed source", () => {
		const files = installed(
			"vega",
			"popover",
			write(
				"vega",
				empty("vega"),
				popoverOverrideClasses({
					padding: 12,
					slide: "16",
					zoom: "90",
					duration: "normal",
				})
			)
		);
		const content = classes(files, "popover-content.svelte");
		expect(content).toEqual(
			expect.arrayContaining([
				"p-3",
				"gap-4",
				"duration-normal",
				"data-open:zoom-in-90",
				"data-closed:zoom-out-90",
				"data-[side=bottom]:slide-in-from-top-4",
				"data-[side=left]:slide-in-from-right-4",
			])
		);
		for (const stale of [
			"p-4",
			"duration-fast",
			"data-open:zoom-in-95",
			"data-[side=top]:slide-in-from-bottom-2",
		])
			expect(content).not.toContain(stale);
		expect(parsePopoverSource(files).values).toEqual({
			padding: 12,
			gap: 16,
			radius: "md",
			duration: "normal",
			zoom: "90",
			slide: "16",
		});
	});

	it("makes Sheet's slide and overlay tier beat the component literals, and rewrites them", () => {
		const first = write(
			"nova",
			empty("nova"),
			sheetOverrideClasses({
				slide: "64",
				duration: "slow",
				overlay: 40,
				padding: 24,
				width: "lg",
			})
		);
		const files = installed("nova", "sheet", first);
		const content = classes(files, "sheet-content.svelte");
		expect(content).toEqual(
			expect.arrayContaining([
				"data-[side=right]:data-open:slide-in-from-right-16!",
				"data-[side=top]:data-closed:slide-out-to-top-16!",
				"data-[side=left]:sm:max-w-lg",
				"data-[side=right]:sm:max-w-lg",
				"duration-slow",
			])
		);
		expect(content).not.toContain("data-[side=right]:sm:max-w-sm");
		expect(content).not.toContain("duration-normal");
		const overlay = classes(files, "sheet-overlay.svelte");
		expect(overlay).toEqual(expect.arrayContaining(["bg-black/40", "duration-slow!"]));
		expect(overlay).not.toContain("bg-black/10");
		expect(classes(files, "sheet-header.svelte")).toContain("p-6");
		expect(classes(files, "sheet-footer.svelte")).toContain("p-6");
		expect(parseSheetSource(files).values).toEqual({
			width: "lg",
			padding: 24,
			gap: 16,
			overlay: 40,
			duration: "slow",
			slide: "64",
		});
		// A later write replaces the earlier distance instead of stacking a second one.
		const second = installed(
			"nova",
			"sheet",
			write("nova", first, sheetOverrideClasses({ slide: "full" }))
		);
		const slides = classes(second, "sheet-content.svelte").filter((token) => token.endsWith("!"));
		expect(slides).toContain("data-[side=right]:data-open:slide-in-from-right!");
		expect(slides).not.toContain("data-[side=right]:data-open:slide-in-from-right-16!");
		expect(parseSheetSource(second).values).toMatchObject({
			slide: "full",
			overlay: 40,
		});
	});

	it("rejects colors, arbitrary values and utilities outside each Popover and Sheet part", () => {
		for (const classes of [
			{ "cn-popover-content": "p-4 bg-red-500" },
			{ "cn-popover-content": "w-96" },
			{ "cn-popover-content": "data-[side=bottom]:slide-in-from-top-[13px]" },
			{
				"cn-sheet-content": "data-[side=right]:data-open:slide-in-from-right-16",
			},
			{
				"cn-sheet-content": "data-[side=right]:data-open:slide-in-from-right-12!",
			},
			{ "cn-sheet-content": "p-6" },
			{ "cn-sheet-overlay": "duration-slow" },
			{ "cn-sheet-overlay": "bg-black/45" },
			{ "cn-sheet-header": "gap-4" },
			{ "cn-sheet-title": "p-4" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});

describe("Input, Select and Textarea editors share Button's levels", () => {
	const styleMap = (style: string, overrides = "") =>
		mergeStyleMaps(
			parseStyleCss(readFileSync(resolve(`src/lib/registry/styles/style-${style}.css`), "utf8")),
			parseStyleCss(overrides)
		);
	// Pixel height of a `h-*` utility (optionally behind a variant) in one `cn-*` class.
	const height = (map: Record<string, string>, className: string, variant = "") =>
		Number(
			new RegExp(`(?:^|\\s)${variant.replace(/[[\]]/g, "\\$&")}h-(\\d+(?:\\.5)?)(?:\\s|$)`).exec(
				map[className]!
			)![1]
		) * 4;
	const buttonHeights = (map: Record<string, string>) => ({
		xs: height(map, "cn-button-size-xs"),
		sm: height(map, "cn-button-size-sm"),
		default: height(map, "cn-button-size-default"),
		lg: height(map, "cn-button-size-lg"),
	});
	const installed = (style: string, css: string, file: string) =>
		injectStyleClasses(
			readFileSync(resolve(`src/lib/registry/ui/${file}`), "utf8"),
			styleMap(style, css)
		)
			.match(/cn\(\s*"([^"]*)"/)![1]!
			.split(" ");
	const write = (style: string, classes: Record<string, string>, existing?: string) =>
		applyStyleOverrides(
			existing ?? readFileSync(resolve(`src/lib/registry/styles/valar/style-${style}.css`), "utf8"),
			styleOverridePayloadSchema.parse({ style, classes })
		);

	it("reads heights as Button tiers in each style and keeps off-tier values as the style's own", () => {
		for (const [style, px] of [
			["nova", 32],
			["vega", 36],
		] as const) {
			const map = styleMap(style);
			const tiers = buttonHeights(map);
			expect(height(map, "cn-input")).toBe(px);
			expect(heightTier(height(map, "cn-input"), tiers, "default")).toBe("default");
			expect(heightTier(height(map, "cn-select-trigger", "data-[size=sm]:"), tiers, "sm")).toBe(
				"sm"
			);
		}
		// After Button's default size was written back to 44px, nova's 32px Input matches no tier.
		const tuned = styleMap("nova", write("nova", buttonOverrideClasses({ "default.height": 44 })));
		expect(heightTier(32, buttonHeights(tuned), "default")).toBe("style");
		expect(heightTier(44, buttonHeights(tuned), "default")).toBe("default");
		expect(heightTier(36, buttonHeights(tuned), "default")).toBe("lg");
		// Equal tiers resolve to the component's own size name.
		const equal = { xs: 24, sm: 32, default: 32, lg: 36 };
		expect(heightTier(32, equal, "default")).toBe("default");
		expect(heightTier(32, equal, "sm")).toBe("sm");
	});

	it("writes tier heights and radius levels into the installed sources", () => {
		const context = { buttonHeights: buttonHeights(styleMap("nova")) };
		const input = write(
			"nova",
			inputOverrideClasses({ height: "lg", radius: "xl", paddingX: 12 }, context)
		);
		const both = write(
			"nova",
			selectOverrideClasses(
				{ "sm.height": "default", radius: "none", paddingStart: 12, "default.height": "style" },
				context
			),
			input
		);
		const inputClasses = installed("nova", both, "input/input.svelte");
		expect(inputClasses).toEqual(expect.arrayContaining(["h-9", "rounded-xl", "px-3", "file:h-6"]));
		for (const old of ["h-8", "rounded-lg", "px-2.5"]) expect(inputClasses).not.toContain(old);
		const trigger = installed("nova", both, "select/select-trigger.svelte");
		expect(trigger).toEqual(
			expect.arrayContaining([
				"data-[size=sm]:h-8",
				"data-[size=default]:h-8",
				"rounded-none",
				"data-[size=sm]:rounded-none",
				"pl-3",
				"pr-2",
			])
		);
		expect(trigger).not.toContain("data-[size=sm]:h-7");
		expect(trigger).not.toContain("data-[size=sm]:rounded-[min(var(--radius-md),10px)]");
		// "样式自带" is never written.
		expect(selectOverrideClasses({ radius: "style", "sm.height": "style" }, context)).toEqual({});
		const textarea = installed(
			"vega",
			write("vega", textareaOverrideClasses({ radius: "xl", paddingY: 12 })),
			"textarea/textarea.svelte"
		);
		expect(textarea).toEqual(expect.arrayContaining(["rounded-xl", "py-3", "px-2.5", "min-h-16"]));
		expect(textarea).not.toContain("rounded-md");
		expect(textarea).not.toContain("py-2");
	});

	it("rejects colors, arbitrary values and utilities the editors do not produce", () => {
		for (const classes of [
			{ "cn-input": "h-9 bg-red-500" },
			{ "cn-input": "h-[40px]" },
			{ "cn-input": "rounded-[12px]" },
			{ "cn-select-trigger": "data-[size=lg]:h-9" },
			{ "cn-select-trigger": "pr-4" },
			{ "cn-select-trigger": "h-9" },
			{ "cn-textarea": "min-h-20" },
			{ "cn-textarea": "h-9" },
			{ "cn-select-content": "rounded-xl" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});

/** Installed source of one UI file for `style` with the given Valar override CSS. */
function installed(component: string, style: string, css: string, file: string): string {
	const map = mergeStyleMaps(
		parseStyleCss(readFileSync(resolve(`src/lib/registry/styles/style-${style}.css`), "utf8")),
		parseStyleCss(css)
	);
	return injectStyleClasses(
		readFileSync(resolve(`src/lib/registry/ui/${component}/${file}`), "utf8"),
		map
	);
}
const classList = (source: string) => source.match(/cn\(\s*"([^"]*)"/)![1]!.split(" ");
const registryFiles = (component: string, style: string) =>
	JSON.parse(readFileSync(resolve(`static/registry/styles/${style}/${component}.json`), "utf8"))
		.files as { target: string; content: string }[];
const emptyOverrides = (style: string) =>
	readFileSync(resolve(`src/lib/registry/styles/valar/style-${style}.css`), "utf8");

describe("P2 parallel editor installation contracts", () => {
	function roundtrip<T extends Record<string, unknown>, C>(
		component: string,
		parse: (files: { target: string; content: string }[]) => { values: T; context: C },
		classes: (values: Partial<T>, context: C) => Record<string, string>,
		rounds: T[]
	) {
		it(`roundtrips ${component} geometry across all eight installed styles`, () => {
			for (const style of ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"]) {
				let css = emptyOverrides(style);
				const sources = () =>
					readdirSync(resolve(`src/lib/registry/ui/${component}`))
						.filter((file) => file.endsWith(".svelte"))
						.map((file) => ({ target: file, content: installed(component, style, css, file) }));
				let context = parse(sources()).context;
				expect(classes({}, context)).toEqual({});
				for (const values of rounds) {
					css = applyStyleOverrides(
						css,
						styleOverridePayloadSchema.parse({ style, classes: classes(values, context) })
					);
					const files = sources();
					expect(parse(files).values).toEqual(values);
					context = parse(files).context;
					for (const file of files)
						expect(() => compile(file.content, { filename: file.target })).not.toThrow();
				}
			}
			expect(() => parse([])).toThrow();
		});
	}
	roundtrip("button-group", parseButtonGroupSource, buttonGroupOverrideClasses, [
		{ textPaddingX: 22, textGap: 2, joinedRadius: "none" },
		{ textPaddingX: 0, textGap: 16, joinedRadius: "full" },
	]);
	roundtrip("breadcrumb", parseBreadcrumbSource, breadcrumbOverrideClasses, [
		{ listGap: 22, wideListGap: 2, itemGap: 14 },
		{ listGap: 0, wideListGap: 24, itemGap: 0 },
	]);
	roundtrip("pagination", parsePaginationSource, paginationOverrideClasses, [
		{ contentGap: 14, ellipsisSize: 22 },
		{ contentGap: 0, ellipsisSize: 48 },
	]);
	roundtrip("progress", parseProgressSource, progressOverrideClasses, [
		{ height: 14, radius: "none" },
		{ height: 2, radius: "full" },
	]);
	roundtrip("skeleton", parseSkeletonSource, skeletonOverrideClasses, [
		{ radius: "none" },
		{ radius: "full" },
	]);
	roundtrip("spinner", parseSpinnerSource, spinnerOverrideClasses, [
		{ size: "32" },
		{ size: "12" },
	]);
	roundtrip("kbd", parseKbdSource, kbdOverrideClasses, [
		{ height: 30, paddingX: 2, radius: "none", groupGap: 14 },
		{ height: 16, paddingX: 12, radius: "full", groupGap: 0 },
	]);
	roundtrip("menubar", parseMenubarSource, menubarOverrideClasses, [
		{
			padding: 10,
			minWidth: 304,
			radius: "none",
			itemPaddingX: 18,
			itemPaddingY: 4,
			itemGap: 14,
			itemRadius: "none",
		},
		{
			padding: 0,
			minWidth: 96,
			radius: "full",
			itemPaddingX: 4,
			itemPaddingY: 12,
			itemGap: 4,
			itemRadius: "full",
		},
	]);
	roundtrip("navigation-menu", parseNavigationMenuSource, navigationMenuOverrideClasses, [
		{
			gap: 22,
			triggerPaddingX: 30,
			triggerRadius: "none",
			contentPadding: 22,
			panelRadius: "none",
		},
		{ gap: 0, triggerPaddingX: 0, triggerRadius: "full", contentPadding: 0, panelRadius: "full" },
	]);
	it("rejects out-of-contract P2 utilities", () => {
		for (const classes of [
			{ "cn-spinner": "size-7" },
			{ "cn-progress": "h-5" },
			{ "cn-kbd": "px-4" },
			{ "cn-skeleton": "w-32" },
			{ "cn-breadcrumb-list": "gap-3" },
			{ "cn-pagination-ellipsis": "size-[24px]" },
			{ "cn-button-group-text": "h-8" },
			{ "cn-button-group-orientation-horizontal": "[&>*]:rounded-full!" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
	it("roundtrips Tags Input outer geometry without changing tags, input or business props", () => {
		for (const style of ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"]) {
			let css = emptyOverrides(style);
			const baseline = installed("tags-input", style, css, "tags-input.svelte");
			expect(
				parseTagsInputSource([{ target: "tags-input.svelte", content: baseline }]).values
			).toEqual({
				padding: 6,
				gap: 6,
				radius: "md",
			});
			for (const values of [
				{ padding: 14, gap: 2, radius: "none" },
				{ padding: 0, gap: 16, radius: "full" },
			] as const) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({ style, classes: tagsInputOverrideClasses(values) })
				);
				const content = installed("tags-input", style, css, "tags-input.svelte");
				expect(parseTagsInputSource([{ target: "tags-input.svelte", content }]).values).toEqual(
					values
				);
				expect(() => compile(content, { filename: "tags-input.svelte" })).not.toThrow();
				// Everything after the tag list starts is outside the tunable root geometry.
				expect(content.slice(content.indexOf("\t<ul"))).toBe(
					baseline.slice(baseline.indexOf("\t<ul"))
				);
			}
		}
		expect(tagsInputOverrideClasses({ radius: "style" })).toEqual({});
		expect(TAGS_INPUT_SPEC.pageCss!({}, null)).toBe("");
		expect(() => parseTagsInputSource([])).toThrow();
		for (const values of [{ padding: 3 }, { gap: 18 }, { max: 5 }])
			expect(() => TAGS_INPUT_SPEC.overrideClasses(values as never, null)).toThrow();
		for (const classes of [
			{ "cn-tags-input": "h-8" },
			{ "cn-tags-input": "p-[12px]" },
			{ "cn-tags-input": "gap-4.5" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});

describe("Number Field and Slider Field editor installation contracts", () => {
	it("roundtrips outer Button heights and linked internal geometry without changing numeric behavior", () => {
		const context = { buttonHeights: { xs: 24, sm: 28, default: 32, lg: 36 }, borderY: 2 };
		for (const style of ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"]) {
			const baseline = installed(
				"number-field",
				style,
				emptyOverrides(style),
				"number-field.svelte"
			);
			expect(
				parseNumberFieldSource([{ target: "number-field.svelte", content: baseline }], context)
					.values
			).toEqual({ height: "style", radius: "md", paddingX: 8 });
			let css = emptyOverrides(style);
			for (const values of [
				{ height: "lg", radius: "none", paddingX: 0 },
				{ height: "xs", radius: "full", paddingX: 14 },
			] as const) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({
						style,
						classes: numberFieldOverrideClasses(values, context),
					})
				);
				const content = installed("number-field", style, css, "number-field.svelte");
				expect(
					parseNumberFieldSource([{ target: "number-field.svelte", content }], context).values
				).toEqual(values);
				expect(() => compile(content, { filename: "number-field.svelte" })).not.toThrow();
			}
		}
		expect(numberFieldOverrideClasses({ height: "style", radius: "style" }, undefined)).toEqual({});
		expect(NUMBER_FIELD_SPEC.pageCss!({}, undefined as never)).toBe("");
		for (const values of [{ paddingX: 3 }, { height: "42" }, { step: 2 }])
			expect(() => NUMBER_FIELD_SPEC.overrideClasses(values as never, context)).toThrow();
		for (const classes of [
			{ "cn-number-field": "bg-red-500" },
			{ "cn-number-field-input": "px-4.5" },
			{ "cn-number-field-increment": "size-[40px]" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});

	it("roundtrips layout alone across all styles while preserving both child controls", () => {
		for (const style of ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"]) {
			let css = emptyOverrides(style);
			const source = installed("slider-field", style, css, "slider-field.svelte");
			expect(
				parseSliderFieldSource([{ target: "slider-field.svelte", content: source }]).values
			).toEqual({ columnGap: 12, rowGap: 8, valueWidth: 128 });
			for (const values of [
				{ columnGap: 0, rowGap: 22, valueWidth: 192 },
				{ columnGap: 30, rowGap: 0, valueWidth: 104 },
			] as const) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({ style, classes: sliderFieldOverrideClasses(values) })
				);
				const content = installed("slider-field", style, css, "slider-field.svelte");
				expect(parseSliderFieldSource([{ target: "slider-field.svelte", content }]).values).toEqual(
					values
				);
				expect(() => compile(content, { filename: "slider-field.svelte" })).not.toThrow();
				for (const child of ["number-field", "slider"])
					expect(installed(child, style, css, `${child}.svelte`)).toBe(
						installed(child, style, emptyOverrides(style), `${child}.svelte`)
					);
			}
		}
		for (const values of [{ valueWidth: 100 }, { columnGap: 33 }, { min: 5 }])
			expect(() => SLIDER_FIELD_SPEC.overrideClasses(values as never, null)).toThrow();
		expect(sliderFieldOverrideClasses({})).toEqual({});
		expect(() => parseSliderFieldSource([])).toThrow();
		for (const classes of [
			{ "cn-slider-field": "gap-4" },
			{ "cn-slider-field-value": "h-8" },
			{ "cn-slider-field-value": "w-[128px]" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});

describe("Avatar editor installation contract", () => {
	it("roundtrips asymmetric sizes with matching count, badge and radius without accumulating offsets", () => {
		for (const style of ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"]) {
			const original = registryFiles("avatar", style);
			expect(parseAvatarSource(original).values).toEqual({
				"sm.size": 24,
				"default.size": 32,
				"lg.size": 40,
				radius: "full",
			});
			let css = emptyOverrides(style);
			for (const values of [
				{ "sm.size": 64, "default.size": 20, "lg.size": 36, radius: "none" },
				{ "sm.size": 28, "default.size": 60, "lg.size": 20, radius: "md" },
			] as const) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({ style, classes: avatarOverrideClasses(values) })
				);
				const files = original
					.filter((f) => f.target.endsWith(".svelte"))
					.map((f) => ({
						target: f.target,
						content: installed("avatar", style, css, f.target.split("/").at(-1)!),
					}));
				expect(parseAvatarSource(files).values).toEqual(values);
				for (const file of files)
					expect(() => compile(file.content, { filename: file.target })).not.toThrow();
				expect(installed("avatar", style, css, "avatar-group.svelte")).toBe(
					installed("avatar", style, emptyOverrides(style), "avatar-group.svelte")
				);
			}
		}
		for (const size of Array.from({ length: 12 }, (_, i) => 20 + i * 4))
			expect(
				styleOverridePayloadSchema.safeParse({
					style: "nova",
					classes: avatarOverrideClasses({
						"sm.size": size,
						"default.size": size,
						"lg.size": size,
					}),
				}).success
			).toBe(true);
		for (const values of [
			{ "sm.size": 22 },
			{ "lg.size": 68 },
			{ "default.size": 16 },
			{ overlap: 4 },
		])
			expect(() => AVATAR_SPEC.overrideClasses(values as never, null)).toThrow();
		for (const classes of [
			{ "cn-avatar": "size-17" },
			{ "cn-avatar-badge": "group-data-[size=sm]/avatar:size-2" },
			{ "cn-avatar-badge": "bg-primary" },
			{ "cn-avatar-group-count": "text-xl" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
		expect(avatarOverrideClasses({ radius: "style" })).toEqual({});
		expect(() => parseAvatarSource([])).toThrow();
	});
});

describe("Item editor installation contract", () => {
	it("preserves independent size density, dropdown padding and all child component styles", () => {
		for (const style of ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"]) {
			const original = registryFiles("item", style);
			const baseline = parseItemSource(original).values;
			expect(baseline["default.paddingX"]).toBe(["nova", "lyra", "mira"].includes(style) ? 12 : 16);
			let css = emptyOverrides(style);
			for (const values of [
				{
					"default.paddingX": 30,
					"default.paddingY": 0,
					"default.gap": 22,
					"sm.paddingX": 6,
					"sm.paddingY": 14,
					"sm.gap": 2,
					"xs.paddingX": 18,
					"xs.paddingY": 24,
					"xs.gap": 0,
					radius: "full",
				},
				{
					"default.paddingX": 0,
					"default.paddingY": 22,
					"default.gap": 4,
					"sm.paddingX": 32,
					"sm.paddingY": 2,
					"sm.gap": 24,
					"xs.paddingX": 4,
					"xs.paddingY": 0,
					"xs.gap": 18,
					radius: "none",
				},
			] as const) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({ style, classes: itemOverrideClasses(values) })
				);
				const content = installed("item", style, css, "item.svelte");
				expect(parseItemSource([{ target: "item.svelte", content }]).values).toEqual(values);
				expect(content).toContain("in-data-[slot=dropdown-menu-content]:p-0");
				expect(() => compile(content, { filename: "item.svelte" })).not.toThrow();
				for (const file of original.filter(
					(f) => f.target.endsWith(".svelte") && !f.target.endsWith("/item.svelte")
				)) {
					const name = file.target.split("/").at(-1)!;
					expect(installed("item", style, css, name)).toBe(
						installed("item", style, emptyOverrides(style), name)
					);
				}
			}
		}
		for (const values of [
			{ "sm.gap": 3 },
			{ "xs.paddingY": 26 },
			{ "default.paddingX": -2 },
			{ fontSize: 14 },
		])
			expect(() => ITEM_SPEC.overrideClasses(values as never, null)).toThrow();
		for (const classes of [
			{ "cn-item": "bg-primary" },
			{ "cn-item-size-sm": "px-8.5" },
			{ "cn-item-size-xs": "py-6.5" },
			{ "cn-item-content": "gap-2" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
		expect(itemOverrideClasses({ radius: "style" })).toEqual({});
		expect(() => parseItemSource([])).toThrow();
	});
});

describe("Accordion editor installation contract", () => {
	it("keeps title and animated content aligned across all styles and successive asymmetric changes", () => {
		const styles = ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"];
		for (const [index, style] of styles.entries()) {
			expect(parseAccordionSource(registryFiles("accordion", style)).values).toEqual({
				triggerPaddingY: [10, 16, 10, 16, 8, 16, 16, 16][index],
				paddingX: [0, 0, 0, 16, 8, 16, 16, 0][index],
				contentPaddingBottom: [10, 16, 10, 16, 16, 16, 16, 16][index],
			});
			let css = emptyOverrides(style);
			for (const values of [
				{ triggerPaddingY: 32, paddingX: 0, contentPaddingBottom: 38 },
				{ triggerPaddingY: 0, paddingX: 30, contentPaddingBottom: 2 },
			]) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({ style, classes: accordionOverrideClasses(values) })
				);
				const files = ["accordion-trigger.svelte", "accordion-content.svelte"].map((target) => ({
					target,
					content: installed("accordion", style, css, target),
				}));
				expect(parseAccordionSource(files).values).toEqual(values);
				const trigger = files[0].content;
				expect(classList(trigger).filter((word) => !/^(?:p|px|py)-/.test(word))).toEqual(
					classList(
						installed("accordion", style, emptyOverrides(style), "accordion-trigger.svelte")
					).filter((word) => !/^(?:p|px|py)-/.test(word))
				);
				expect(trigger).toContain("group-aria-expanded/accordion-trigger:hidden");
				const content = files[1].content;
				expect(content).toContain(
					"data-open:animate-accordion-down data-closed:animate-accordion-up"
				);
				expect(content).toContain("pt-0");
				expect(content).toContain("[&_p:not(:last-child)]:mb-4");
				for (const file of files)
					expect(() => compile(file.content, { filename: file.target })).not.toThrow();
				expect(installed("accordion", style, css, "accordion-item.svelte")).toBe(
					installed("accordion", style, emptyOverrides(style), "accordion-item.svelte")
				);
			}
		}
		for (const classes of [
			{ "cn-accordion-trigger": "p-4" },
			{ "cn-accordion-trigger": "px-8.5" },
			{ "cn-accordion-content": "duration-fast" },
			{ "cn-accordion-content-inner": "pt-2" },
			{ "cn-accordion-content-inner": "pb-10.5" },
			{ "cn-accordion-item": "bg-primary" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
		for (const values of [
			{ paddingX: 3 },
			{ triggerPaddingY: 34 },
			{ contentPaddingBottom: -2 },
			{ duration: "fast" },
		])
			expect(() => ACCORDION_SPEC.overrideClasses(values as never, null)).toThrow();
		expect(accordionOverrideClasses({})).toEqual({});
		expect(() => parseAccordionSource([])).toThrow();
	});
});

describe("Alert Dialog editor installation contracts", () => {
	it("roundtrips both sizes without changing confirmation semantics, media or footer layout", () => {
		const styles = ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"];
		const widths = ["sm", "lg", "sm", "md", "sm", "md", "md", "md"];
		const radii = ["xl", "xl", "none", "4xl", "xl", "4xl", "style", "none"];
		for (const [index, style] of styles.entries()) {
			const baseline = parseAlertDialogSource(registryFiles("alert-dialog", style));
			expect(baseline.values).toEqual({
				width: widths[index],
				padding: ["nova", "lyra", "mira"].includes(style) ? 16 : 24,
				gap: style === "mira" ? 12 : ["nova", "lyra"].includes(style) ? 16 : 24,
				radius: radii[index],
				overlay: [10, 10, 10, 80, 80, 30, 30, 20][index],
				duration: "fast",
				zoom: "95",
			});
			expect(baseline.context).toEqual({
				footerBleed: style === "nova",
				footerRounded: style === "nova",
			});
			let css = emptyOverrides(style);
			for (const change of [
				{
					width: "2xl",
					padding: 46,
					gap: 6,
					radius: "none",
					duration: "slow",
					overlay: 40,
					zoom: "90",
				},
				{
					width: "sm",
					padding: 10,
					gap: 38,
					radius: "lg",
					duration: "normal",
					overlay: 0,
					zoom: "100",
				},
			] as const) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({
						style,
						classes: alertDialogOverrideClasses(change, baseline.context),
					})
				);
				const files = readdirSync(resolve("src/lib/registry/ui/alert-dialog")).map((target) => ({
					target,
					content: applyTokenUtilities(installed("alert-dialog", style, css, target)),
				}));
				expect(parseAlertDialogSource(files)).toEqual({
					values: change,
					context: baseline.context,
				});
				const content = files.find((f) => f.target === "alert-dialog-content.svelte")!.content;
				expect(content).toContain(
					style === "mira" ? "data-[size=sm]:max-w-64" : "data-[size=sm]:max-w-xs"
				);
				for (const file of [
					"alert-dialog-action.svelte",
					"alert-dialog-cancel.svelte",
					"alert-dialog-header.svelte",
					"alert-dialog-media.svelte",
					"alert-dialog-description.svelte",
					"alert-dialog-title.svelte",
				])
					expect(installed("alert-dialog", style, css, file)).toBe(
						installed("alert-dialog", style, emptyOverrides(style), file)
					);
				const footer = files.find((f) => f.target === "alert-dialog-footer.svelte")!.content;
				if (style === "nova")
					expect(classList(footer)).toEqual(
						expect.arrayContaining([
							`-mx-${change.padding / 4}`,
							`-mb-${change.padding / 4}`,
							`p-${change.padding / 4}`,
							`rounded-b-${change.radius}`,
						])
					);
				else expect(footer).not.toContain("-mx-");
				expect(footer).toContain("flex-col-reverse");
				expect(footer).toContain("group-data-[size=sm]/alert-dialog-content:grid-cols-2");
				expect(() => compile(content, { filename: "alert-dialog-content.svelte" })).not.toThrow();
			}
		}
	});
	it("rejects other sizes, colors, button styles and free-form motion", () => {
		for (const classes of [
			{ "cn-alert-dialog-content": "sm:max-w-lg" },
			{ "cn-alert-dialog-content": "data-[size=sm]:max-w-lg" },
			{ "cn-alert-dialog-content": "p-12.5" },
			{ "cn-alert-dialog-content": "gap-10.5" },
			{ "cn-alert-dialog-content": "bg-red-500" },
			{ "cn-alert-dialog-overlay": "bg-black/45" },
			{ "cn-alert-dialog-action": "h-10" },
			{ "cn-alert-dialog-header": "gap-4" },
			{ "cn-alert-dialog-content": "duration-[600ms]" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
		for (const input of [{ padding: 9 }, { gap: 42 }, { overlay: 35 }, { size: "sm" }])
			expect(() =>
				ALERT_DIALOG_SPEC.overrideClasses(input as never, {
					footerBleed: false,
					footerRounded: false,
				})
			).toThrow();
		expect(alertDialogOverrideClasses({}, undefined)).toEqual({});
		expect(alertDialogOverrideClasses({ radius: "style" }, undefined)).toEqual({});
		expect(() => parseAlertDialogSource([])).toThrow();
	});
});

describe("Alert and Empty editor installation contracts", () => {
	const styles = ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"];
	it("replaces Alert row geometry without changing icon columns, action reserves or alert semantics", () => {
		const x = [10, 16, 10, 16, 8, 16, 16, 16];
		const y = [8, 12, 8, 12, 6, 12, 12, 12];
		const radii = ["lg", "lg", "none", "lg", "lg", "2xl", "2xl", "style"];
		for (const [index, style] of styles.entries()) {
			expect(parseAlertSource(registryFiles("alert", style)).values).toEqual({
				paddingX: x[index],
				paddingY: y[index],
				rowGap: style === "sera" ? 4 : 2,
				radius: radii[index],
			});
			const original = installed("alert", style, emptyOverrides(style), "alert.svelte");
			const untouched = (source: string) =>
				source
					.match(/base:\s*"([^"]*)"/)![1]
					.split(/\s+/)
					.filter((word) => !/^(?:px|py|gap-y|rounded)-/.test(word));
			let css = emptyOverrides(style);
			for (const change of [
				{ paddingX: 32, paddingY: 0, rowGap: 16, radius: "xl" },
				{ paddingX: 0, paddingY: 24, rowGap: 0, radius: "none" },
			] as const) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({
						style,
						classes: alertOverrideClasses(change),
					})
				);
				const source = installed("alert", style, css, "alert.svelte");
				expect(parseAlertSource([{ target: "alert.svelte", content: source }]).values).toEqual(
					change
				);
				expect(untouched(source)).toEqual(untouched(original));
				expect(source.slice(source.indexOf("variants:"))).toBe(
					original.slice(original.indexOf("variants:"))
				);
				expect(source).toContain('role="alert"');
				expect(source).toContain("has-data-[slot=alert-action]:pr-18");
				expect(installed("alert", style, css, "alert-action.svelte")).toBe(
					installed("alert", style, emptyOverrides(style), "alert-action.svelte")
				);
				expect(() => compile(source, { filename: "alert.svelte" })).not.toThrow();
			}
		}
		expect(alertOverrideClasses({ radius: "style" })).toEqual({});
	});

	it("roundtrips Empty root spacing while preserving media, content widths and inner hierarchy", () => {
		const radii = ["xl", "lg", "none", "lg", "xl", "2xl", "3xl", "style"];
		for (const [index, style] of styles.entries()) {
			expect(parseEmptySource(registryFiles("empty", style)).values).toEqual({
				padding: ["nova", "lyra", "mira"].includes(style) ? 24 : 48,
				gap: 16,
				radius: radii[index],
			});
			let css = emptyOverrides(style);
			for (const change of [
				{ padding: 64, gap: 0, radius: "xl" },
				{ padding: 8, gap: 32, radius: "none" },
			] as const) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({
						style,
						classes: emptyOverrideClasses(change),
					})
				);
				const source = installed("empty", style, css, "empty.svelte");
				expect(parseEmptySource([{ target: "empty.svelte", content: source }]).values).toEqual(
					change
				);
				for (const file of [
					"empty-header.svelte",
					"empty-content.svelte",
					"empty-media.svelte",
					"empty-title.svelte",
					"empty-description.svelte",
				])
					expect(installed("empty", style, css, file)).toBe(
						installed("empty", style, emptyOverrides(style), file)
					);
				expect(() => compile(source, { filename: "empty.svelte" })).not.toThrow();
			}
		}
		expect(emptyOverrideClasses({ radius: "style" })).toEqual({});
	});

	it("rejects non-contract geometry and keeps colors, action layout and child controls out of writeback", () => {
		for (const classes of [
			{ "cn-alert": "px-8.5" },
			{ "cn-alert": "py-6.5" },
			{ "cn-alert": "gap-y-4.5" },
			{ "cn-alert": "gap-4" },
			{ "cn-alert": "gap-x-2" },
			{ "cn-alert": "pr-0" },
			{ "cn-alert": "bg-primary" },
			{ "cn-alert-action": "right-0" },
			{ "cn-empty": "p-1.5" },
			{ "cn-empty": "p-16.5" },
			{ "cn-empty": "gap-8.5" },
			{ "cn-empty": "max-w-md" },
			{ "cn-empty": "p-[18px]" },
			{ "cn-empty-media-icon": "size-8" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
		for (const [spec, invalid] of [
			[ALERT_SPEC, { paddingX: 3 }],
			[ALERT_SPEC, { rowGap: 18 }],
			[ALERT_SPEC, { variant: "warning" }],
			[EMPTY_SPEC, { padding: 6 }],
			[EMPTY_SPEC, { gap: 33 }],
			[EMPTY_SPEC, { buttonHeight: 40 }],
		] as const)
			expect(() => spec.overrideClasses(invalid as never, null)).toThrow();
		expect(alertOverrideClasses({})).toEqual({});
		expect(emptyOverrideClasses({})).toEqual({});
		expect(() => parseAlertSource([])).toThrow();
		expect(() => parseEmptySource([])).toThrow();
	});
});

describe("Badge and basic Table editor installation contracts", () => {
	const styles = ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"];
	it("roundtrips Badge geometry without changing native height, icon insets, typography or variants", () => {
		const radii = ["4xl", "4xl", "none", "4xl", "full", "3xl", "2xl", "none"];
		for (const [index, style] of styles.entries()) {
			expect(parseBadgeSource(registryFiles("badge", style)).values).toEqual({
				paddingX: style === "sera" ? 0 : 8,
				gap: style === "sera" ? 6 : 4,
				radius: radii[index],
			});
			const original = installed("badge", style, emptyOverrides(style), "badge.svelte");
			const untouched = (source: string) =>
				source
					.match(/base:\s*"([^"]*)"/)![1]
					.split(/\s+/)
					.filter((word) => !/^(?:px|gap|rounded)-/.test(word));
			let css = emptyOverrides(style);
			for (const change of [
				{ paddingX: 24, gap: 0, radius: "xl" },
				{ paddingX: 0, gap: 16, radius: "none" },
			] as const) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({ style, classes: badgeOverrideClasses(change) })
				);
				const source = installed("badge", style, css, "badge.svelte");
				expect(parseBadgeSource([{ target: "badge.svelte", content: source }]).values).toEqual(
					change
				);
				expect(untouched(source)).toEqual(untouched(original));
				expect(source.slice(source.indexOf("variants:"))).toBe(
					original.slice(original.indexOf("variants:"))
				);
				expect(() => compile(source, { filename: "badge.svelte" })).not.toThrow();
			}
		}
		expect(badgeOverrideClasses({ radius: "style" })).toEqual({});
	});

	it("keeps table semantics and checkbox insets while replacing asymmetric cell spacing repeatedly", () => {
		for (const style of styles) {
			const spacious = ["maia", "luma", "sera"].includes(style);
			expect(parseTableSource(registryFiles("table", style)).values).toEqual({
				headHeight: spacious ? 48 : 40,
				headPaddingX: spacious ? 12 : 8,
				cellPaddingX: spacious ? 12 : 8,
				cellPaddingY: spacious ? 12 : 8,
			});
			let css = emptyOverrides(style);
			for (const change of [
				{ headHeight: 64, headPaddingX: 0, cellPaddingX: 32, cellPaddingY: 2 },
				{ headHeight: 24, headPaddingX: 30, cellPaddingX: 0, cellPaddingY: 24 },
			] as const) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({ style, classes: tableOverrideClasses(change) })
				);
				const files = ["table-head.svelte", "table-cell.svelte"].map((file) => ({
					target: file,
					content: installed("table", style, css, file),
				}));
				expect(parseTableSource(files).values).toEqual(change);
				for (const file of files) {
					const untouched = (source: string) =>
						classList(source).filter((word) => !/^(?:h|p|px|py)-/.test(word));
					expect(untouched(file.content)).toEqual(
						untouched(installed("table", style, emptyOverrides(style), file.target))
					);
					expect(file.content).toContain("[&:has([role=checkbox])]:pr-0");
					expect(() => compile(file.content, { filename: file.target })).not.toThrow();
				}
				for (const file of [
					"table.svelte",
					"table-row.svelte",
					"table-caption.svelte",
					"table-footer.svelte",
				])
					expect(installed("table", style, css, file)).toBe(
						installed("table", style, emptyOverrides(style), file)
					);
			}
		}
		expect(tableOverrideClasses({})).toEqual({});
	});

	it("rejects out-of-contract geometry, business behavior, colors and arbitrary CSS", () => {
		for (const classes of [
			{ "cn-badge": "px-6.5" },
			{ "cn-badge": "gap-4.5" },
			{ "cn-badge": "h-6" },
			{ "cn-badge": "has-data-[icon=inline-start]:pl-2" },
			{ "cn-badge": "bg-primary" },
			{ "cn-table-head": "h-5.5" },
			{ "cn-table-head": "h-16.5" },
			{ "cn-table-head": "px-8.5" },
			{ "cn-table-head": "text-right" },
			{ "cn-table-cell": "py-6.5" },
			{ "cn-table-cell": "p-4" },
			{ "cn-table-cell": "px-[13px]" },
			{ "cn-table": "table-fixed" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
		for (const [spec, invalid] of [
			[BADGE_SPEC, { paddingX: 3 }],
			[BADGE_SPEC, { gap: 18 }],
			[TABLE_SPEC, { headHeight: 22 }],
			[TABLE_SPEC, { cellPaddingY: 25 }],
			[TABLE_SPEC, { sortable: true }],
		] as const)
			expect(() => spec.overrideClasses(invalid as never, null)).toThrow();
		expect(() => parseBadgeSource([])).toThrow();
		expect(() => parseTableSource([])).toThrow();
	});
});

describe("Native Select, Input Group and Input OTP editor installation contracts", () => {
	const styles = ["nova", "vega", "lyra", "maia", "mira", "luma", "rhea", "sera"];
	const contextFor = (style: string) => {
		const map = parseStyleCss(
			readFileSync(resolve(`src/lib/registry/styles/style-${style}.css`), "utf8")
		);
		return {
			buttonHeights: Object.fromEntries(
				["xs", "sm", "default", "lg"].map((size) => [
					size,
					Number(/(?:^|\s)h-(\d+(?:\.\d+)?)/.exec(map[`cn-button-size-${size}`])![1]) * 4,
				])
			) as { xs: number; sm: number; default: number; lg: number },
		};
	};
	const custom = { buttonHeights: { xs: 17, sm: 27, default: 45, lg: 61 } };
	const write = (style: string, classes: Record<string, string>, css = emptyOverrides(style)) =>
		applyStyleOverrides(css, styleOverridePayloadSchema.parse({ style, classes }));
	const filesAfter = (component: string, style: string, css: string) =>
		registryFiles(component, style)
			.filter((file) => file.target.endsWith(".svelte"))
			.map((file) => ({
				target: file.target,
				content: installed(component, style, css, file.target.split("/").at(-1)!),
			}));

	it("keeps native sizes, small-radius differences and the untouched arrow inset", () => {
		const radii = ["style", "md", "none", "4xl", "md", "3xl", "2xl", "none"];
		for (const [index, style] of styles.entries()) {
			const baseline = parseNativeSelectSource(
				registryFiles("native-select", style),
				contextFor(style)
			);
			expect(baseline.values).toEqual({
				"default.height": "default",
				"sm.height": "sm",
				radius: radii[index],
				paddingStart: [10, 10, 10, 12, 8, 12, 10, 0][index],
			});
			expect(
				parseNativeSelectSource(registryFiles("native-select", style), custom).values[
					"default.height"
				]
			).toBe("style");
			const original = registryFiles("native-select", style).find((file) =>
				file.target.endsWith("/native-select.svelte")
			)!.content;
			let css = emptyOverrides(style);
			for (const paddingStart of [46, 2]) {
				const change = {
					"default.height": "default",
					"sm.height": "sm",
					radius: "xl",
					paddingStart,
				} as const;
				css = write(style, nativeSelectOverrideClasses(change, custom), css);
				const files = filesAfter("native-select", style, css);
				expect(parseNativeSelectSource(files, custom).values).toEqual(change);
				const source = files.find((file) => file.target.endsWith("/native-select.svelte"))!.content;
				expect(source).toContain("data-[size=default]:h-11.25");
				expect(source).toContain("data-[size=sm]:h-6.75");
				expect(source.match(/(?<![\w:-])pr-[\w.]+/g)).toEqual(
					original.match(/(?<![\w:-])pr-[\w.]+/g)
				);
				expect(source).toContain("data-[size=sm]:rounded-xl");
			}
		}
		expect(nativeSelectOverrideClasses({ radius: "style", "sm.height": "style" }, custom)).toEqual(
			{}
		);
	});

	it("roundtrips all addon positions without taking over nested input, textarea or button geometry", () => {
		for (const [index, style] of styles.entries()) {
			const context = contextFor(style);
			expect(parseInputGroupSource(registryFiles("input-group", style), context).values).toEqual({
				height: "default",
				radius: ["lg", "md", "none", "style", "md", "style", "2xl", "none"][index],
				inlinePadding: [8, 8, 8, 12, 8, 12, 8, 0][index],
				blockPaddingX: [10, 10, 10, 12, 8, 12, 10, 0][index],
				addonGap: style === "mira" ? 4 : 8,
			});
			let css = emptyOverrides(style);
			for (const [inlinePadding, blockPaddingX] of [
				[46, 2],
				[2, 38],
			]) {
				const change = {
					height: "lg",
					radius: "md",
					inlinePadding,
					blockPaddingX,
					addonGap: 14,
				} as const;
				css = write(style, inputGroupOverrideClasses(change, custom), css);
				const files = filesAfter("input-group", style, css);
				expect(parseInputGroupSource(files, custom).values).toEqual(change);
				const root = files.find((file) => file.target.endsWith("/input-group.svelte"))!.content;
				expect(root).toContain("h-15.25");
				expect(root).toContain("has-[>textarea]:h-auto");
				expect(root).toContain("has-[>[data-align=block-end]]:h-auto");
				expect(root).toContain("has-[textarea]:rounded-md");
				for (const name of [
					"input-group-input.svelte",
					"input-group-textarea.svelte",
					"input-group-button.svelte",
				])
					expect(files.find((file) => file.target.endsWith(`/${name}`))!.content).toBe(
						installed("input-group", style, emptyOverrides(style), name)
					);
			}
		}
		expect(inputGroupOverrideClasses({ height: "style", radius: "style" }, custom)).toEqual({});
	});

	it("installs OTP root gap and square slots while preserving per-style slot spacing and endpoint rules", () => {
		for (const [index, style] of styles.entries()) {
			expect(
				parseInputOtpSource(registryFiles("input-otp", style), contextFor(style)).values
			).toEqual({
				slotSize: "default",
				groupGap: 8,
				radius: ["lg", "md", "none", "4xl", "md", "3xl", "2xl", "none"][index],
			});
			let css = emptyOverrides(style);
			for (const groupGap of [22, 2]) {
				const change = { slotSize: "default", groupGap, radius: "xl" } as const;
				css = write(style, inputOtpOverrideClasses(change, custom), css);
				const files = filesAfter("input-otp", style, css);
				expect(parseInputOtpSource(files, custom).values).toEqual(change);
				expect(files.find((file) => file.target.endsWith("/input-otp.svelte"))!.content).toContain(
					`gap-${groupGap / 4}`
				);
				const slots = files.find((file) => file.target.endsWith("/input-otp-slot.svelte"))!.content;
				expect(slots).toContain("size-11.25");
				expect(slots).toContain("first:rounded-l-xl");
				expect(slots).toContain("last:rounded-r-xl");
				expect(slots).toContain("first:last:rounded-xl");
				const group = files.find((file) =>
					file.target.endsWith("/input-otp-group.svelte")
				)!.content;
				expect(group.includes("gap-1")).toBe(style === "sera");
			}
		}
		expect(inputOtpOverrideClasses({ slotSize: "style", radius: "style" }, custom)).toEqual({});
	});

	it("rejects non-visual or cross-component writes and invalid parameter values", () => {
		for (const classes of [
			{ "cn-native-select": "pr-4" },
			{ "cn-native-select": "h-9" },
			{ "cn-native-select": "bg-red-500" },
			{ "cn-input-group": "[&>textarea]:h-full" },
			{ "cn-input-group-addon": "py-4" },
			{ "cn-input-group-addon-align-inline-start": "px-4" },
			{ "cn-input-group-addon-align-block-end": "px-12.5" },
			{ "cn-input-otp": "gap-[13px]" },
			{ "cn-input-otp-group": "gap-4" },
			{ "cn-input-otp-slot": "h-9" },
			{ "cn-input-otp-slot": "data-[active=true]:bg-primary" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
		for (const [spec, invalid] of [
			[NATIVE_SELECT_SPEC, { paddingStart: 3 }],
			[INPUT_GROUP_SPEC, { inlinePadding: 49 }],
			[INPUT_GROUP_SPEC, { blockPaddingX: 3 }],
			[INPUT_OTP_SPEC, { groupGap: 25 }],
		] as const)
			expect(() => spec.overrideClasses(invalid as never, custom)).toThrow();
	});
});

describe("Toggle, Toggle Group and Slider editors preserve shared and directional geometry", () => {
	it("roundtrips joined Group contours without owning shared Toggle sizes or icon insets", () => {
		for (const [style, padding, radius] of [
			["nova", 8, "style"],
			["vega", 8, "md"],
			["lyra", 8, "none"],
			["maia", 12, "style"],
			["mira", 8, "style"],
			["luma", 12, "3xl"],
			["rhea", 8, "2xl"],
			["sera", 24, "none"],
		] as const) {
			expect(parseToggleGroupSource(registryFiles("toggle-group", style)).values).toEqual({
				joinedPaddingX: padding,
				joinedRadius: radius,
			});
			expect(toggleGroupOverrideClasses({ joinedRadius: "style" })).toEqual({});
			let css = emptyOverrides(style);
			for (const joinedPaddingX of [46, 2]) {
				const changes = { joinedPaddingX, joinedRadius: "xl" } as const;
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({
						style,
						classes: toggleGroupOverrideClasses(changes),
					})
				);
				const files = ["toggle-group", "toggle-group-item"].map((name) => ({
					target: `${name}.svelte`,
					content: installed("toggle-group", style, css, `${name}.svelte`),
				}));
				expect(parseToggleGroupSource(files).values).toEqual(changes);
				expect(files[1].content).toContain(
					"group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-xl"
				);
				expect(files[1].content).toContain("has-data-[icon=inline-start]:pl-");
				expect(
					parseToggleSource([
						{ target: "toggle.svelte", content: installed("toggle", style, css, "toggle.svelte") },
					]).values
				).toEqual(parseToggleSource(registryFiles("toggle", style)).values);
			}
		}
	});

	it("reads all Toggle sizes and writes shared geometry without removing icon insets", () => {
		for (const [style, heights, padding, radius] of [
			["nova", [28, 32, 36], [10, 10, 10], "style"],
			["vega", [32, 36, 40], [10, 10, 10], "md"],
			["lyra", [28, 32, 36], [10, 10, 10], "none"],
			["maia", [32, 36, 40], [12, 12, 16], "4xl"],
			["mira", [24, 28, 32], [8, 8, 10], "style"],
			["luma", [32, 36, 40], [12, 12, 16], "3xl"],
			["rhea", [28, 32, 36], [10, 10, 10], "2xl"],
			["sera", [36, 40, 44], [16, 24, 32], "none"],
		] as const) {
			const baseline = parseToggleSource(registryFiles("toggle", style)).values;
			for (const [i, size] of ["sm", "default", "lg"].entries()) {
				expect(baseline[`${size}.height` as keyof typeof baseline]).toBe(heights[i]);
				expect(baseline[`${size}.paddingX` as keyof typeof baseline]).toBe(padding[i]);
			}
			expect(baseline.radius).toBe(radius);
			expect(baseline.gap).toBe(style === "sera" ? 6 : 4);
			expect(toggleOverrideClasses({ radius: "style" })).toEqual({});
			const changes = {
				"sm.height": 22,
				"default.height": 46,
				"lg.paddingX": 18,
				gap: 10,
				radius: "xl",
			} as const;
			const css = applyStyleOverrides(
				emptyOverrides(style),
				styleOverridePayloadSchema.parse({
					style,
					classes: toggleOverrideClasses(changes),
				})
			);
			const content = installed("toggle", style, css, "toggle.svelte");
			expect(parseToggleSource([{ target: "toggle.svelte", content }]).values).toEqual({
				...baseline,
				...changes,
			});
			expect(content).toContain("min-w-5.5");
			expect(content).toContain("min-w-11.5");
			expect(content).toContain(
				`has-data-[icon=inline-start]:pl-${style === "sera" ? 5 : style === "maia" || style === "luma" ? 3 : 2}`
			);
			expect(content).toContain("data-size={size}");
			// A shared Toggle write must not replace Group's joined treatment.
			expect(installed("toggle-group", style, css, "toggle-group-item.svelte")).toContain(
				"group-data-[spacing=0]/toggle-group:rounded-none"
			);
			const second = applyStyleOverrides(
				css,
				styleOverridePayloadSchema.parse({
					style,
					classes: toggleOverrideClasses({ "default.height": 24 }),
				})
			);
			expect(
				parseToggleSource([
					{ target: "toggle.svelte", content: installed("toggle", style, second, "toggle.svelte") },
				]).values
			).toEqual({ ...baseline, ...changes, "default.height": 24 });
		}
	});

	it("roundtrips Slider extremes and Luma's long side in both orientations without accumulating offsets", () => {
		for (const [style, thickness, thumb, radius] of [
			["nova", 4, 12, "full"],
			["vega", 6, 16, "full"],
			["lyra", 4, 12, "none"],
			["maia", 12, 16, "4xl"],
			["mira", 4, 12, "md"],
			["luma", 8, 16, "full"],
			["rhea", 4, 16, "2xl"],
			["sera", 2, 12, "style"],
		] as const) {
			let baseline = parseSliderSource(registryFiles("slider", style));
			expect(baseline.values).toEqual({
				trackThickness: thickness,
				thumbSize: thumb,
				trackRadius: radius,
				thumbRadius: radius,
			});
			expect(baseline.context.thumbSizeDelta).toBe(style === "luma" ? 8 : 0);
			let css = emptyOverrides(style);
			for (const [size, track] of [
				[32, 14],
				[12, 2],
			]) {
				const changes = {
					thumbSize: size,
					trackThickness: track,
					trackRadius: "md",
					thumbRadius: "none",
				} as const;
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({
						style,
						classes: sliderOverrideClasses(changes, baseline.context),
					})
				);
				const content = installed("slider", style, css, "slider.svelte");
				baseline = parseSliderSource([{ target: "slider.svelte", content }]);
				expect(baseline.values).toEqual(changes);
				expect(baseline.context).toEqual({ thumbSizeDelta: style === "luma" ? 8 : 0 });
				if (style === "luma") {
					expect(content).toContain(`data-vertical:w-${size / 4}`);
					expect(content).toContain(`data-vertical:h-${(size + 8) / 4}`);
				} else expect(content).toContain(`size-${size / 4}`);
				expect(content).toContain(`data-horizontal:h-${track / 4}`);
				expect(content).toContain(`data-vertical:w-${track / 4}`);
				expect(content).toContain("bg-primary");
				expect(content).toContain("focus-visible:");
			}
		}
	});

	it("rejects unrelated state, business and arbitrary utilities", () => {
		for (const classes of [
			{ "cn-toggle": "bg-red-500" },
			{ "cn-toggle-size-sm": "h-999" },
			{ "cn-toggle-size-default": "px-[7px]" },
			{ "cn-toggle": "data-[state=on]:bg-primary" },
			{ "cn-toggle-group": "gap-4" },
			{ "cn-toggle-group-item": "group-data-[spacing=0]/toggle-group:px-[7px]" },
			{ "cn-toggle-group-item": "h-12" },
			{ "cn-slider": "min-h-80" },
			{ "cn-slider-range": "bg-muted" },
			{ "cn-slider-track": "h-2" },
			{ "cn-slider-thumb": "translate-x-3" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});

describe("Selection control write-back preserves state styling and linked geometry", () => {
	it("resizes Checkbox and its check/minus icons without replacing style-owned radii", () => {
		for (const style of ["nova", "vega", "maia", "mira", "lyra", "luma", "rhea", "sera"]) {
			const baseline = parseCheckboxSource(registryFiles("checkbox", style));
			expect(baseline.values).toEqual({
				size: style === "sera" ? 18 : 16,
				radius: ["lyra", "sera"].includes(style) ? "none" : "style",
			});
			const delta = style === "sera" ? 4 : 2;
			expect(baseline.context).toEqual({ iconSizeDelta: delta });
			const write = (css: string, size: number) =>
				applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({
						style,
						classes: checkboxOverrideClasses({ size, radius: "md" }, baseline.context),
					})
				);
			let css = emptyOverrides(style);
			for (const size of [22, 12]) {
				css = write(css, size);
				const content = installed("checkbox", style, css, "checkbox.svelte");
				expect(parseCheckboxSource([{ target: "ui/checkbox.svelte", content }])).toEqual({
					values: { size, radius: "md" },
					context: { iconSizeDelta: delta },
				});
				expect(content).toContain(`[&>svg]:size-${(size - delta) / 4}`);
				for (const utility of [
					"data-checked:bg-primary",
					"aria-invalid:border-destructive",
					"disabled:opacity-50",
				])
					expect(content).toContain(utility);
				expect(compile(content, { generate: "client" }).warnings).toEqual([]);
			}
			expect(checkboxOverrideClasses({ radius: "style" }, baseline.context)).toEqual({});
		}
	});

	it("resizes Radio Group dots in both themes and keeps repeated writes stable", () => {
		for (const style of ["nova", "vega", "maia", "mira", "lyra", "luma", "rhea", "sera"]) {
			const baseline = parseRadioGroupSource(registryFiles("radio-group", style));
			expect(baseline.values).toEqual({
				size: style === "sera" ? 18 : 16,
				gap: ["nova", "lyra"].includes(style) ? 8 : 12,
			});
			const context = {
				dotOffset: style === "sera" ? -1 : 0,
				darkDotOffset: ["luma", "rhea"].includes(style) ? 2 : null,
			};
			expect(baseline.context).toEqual(context);
			let css = emptyOverrides(style);
			for (const size of [22, 12]) {
				css = applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({
						style,
						classes: radioGroupOverrideClasses({ size, gap: 18 }, context),
					})
				);
				const files = ["radio-group", "radio-group-item"].map((name) => ({
					target: `ui/${name}.svelte`,
					content: installed("radio-group", style, css, `${name}.svelte`),
				}));
				expect(parseRadioGroupSource(files)).toEqual({ values: { size, gap: 18 }, context });
				expect(files[1].content).toContain(`size-${(size / 2 + context.dotOffset) / 4}`);
				if (context.darkDotOffset !== null)
					expect(files[1].content).toContain(`dark:size-${(size / 2 + 2) / 4}`);
				for (const utility of [
					"rounded-full",
					"aria-invalid:border-destructive",
					"disabled:opacity-50",
				])
					expect(files[1].content).toContain(utility);
				for (const file of files)
					expect(compile(file.content, { generate: "client" }).warnings).toEqual([]);
			}
		}
	});

	it("keeps Switch geometry aligned and write-back utilities compilable after repeated writes", async () => {
		for (const [
			style,
			height,
			width,
			thumbHeight,
			thumbWidth,
			smallHeight,
			smallWidth,
			smallThumbHeight,
			smallThumbWidth,
			radius,
			nextHeight,
			nextWidth,
		] of [
			["nova", 18.4, 32, 16, 16, 14, 24, 12, 12, "full", 22.4, 40],
			["vega", 18.4, 32, 16, 16, 14, 24, 12, 12, "full", 22.4, 40],
			["maia", 18.4, 32, 16, 16, 14, 24, 12, 12, "full", 22.4, 40],
			["mira", 16.6, 28, 14, 14, 14, 24, 12, 12, "full", 22.6, 40],
			["lyra", 18.4, 32, 16, 16, 14, 24, 12, 12, "full", 22.4, 40],
			["luma", 20, 44, 16, 24, 16, 28, 12, 16, "full", 24, 52],
			["rhea", 20, 32, 16, 16, 16, 24, 12, 12, "2xl", 24, 40],
			["sera", 18, 33, 14, 14, 14, 25, 10, 10, "style", 24, 45],
		] as const) {
			const baseline = parseSwitchSource(registryFiles("switch", style));
			expect(baseline).toEqual({
				values: { thumbHeight, smallThumbHeight, radius, duration: "style" },
				context: {
					default: { height, width, thumbHeight, thumbWidth },
					sm: {
						height: smallHeight,
						width: smallWidth,
						thumbHeight: smallThumbHeight,
						thumbWidth: smallThumbWidth,
					},
				},
			});
			const css = applyStyleOverrides(
				emptyOverrides(style),
				styleOverridePayloadSchema.parse({
					style,
					classes: switchOverrideClasses(
						{ thumbHeight: 20, smallThumbHeight: 10, radius: "md", duration: "slow" },
						baseline.context
					),
				})
			);
			const content = installed("switch", style, css, "switch.svelte");
			const after = parseSwitchSource([{ target: "ui/switch.svelte", content }]);
			expect(after.values).toEqual({
				thumbHeight: 20,
				smallThumbHeight: 10,
				radius: "md",
				duration: "slow",
			});
			expect(after.context.default).toEqual({
				height: nextHeight,
				width: nextWidth,
				thumbHeight: 20,
				thumbWidth: style === "luma" ? 28 : 20,
			});
			// An edit to default must never change the small variant's independent dimensions.
			const next = applyStyleOverrides(
				css,
				styleOverridePayloadSchema.parse({
					style,
					classes: switchOverrideClasses({ thumbHeight: 12 }, after.context),
				})
			);
			const nextSource = installed("switch", style, next, "switch.svelte");
			const twice = parseSwitchSource([{ target: "ui/switch.svelte", content: nextSource }]);
			expect(twice.values).toEqual({ ...after.values, thumbHeight: 12 });
			expect(twice.context.sm).toEqual(after.context.sm);
			expect(twice.context.default.width - 2 * twice.context.default.thumbWidth).toBe(
				width - 2 * thumbWidth
			);
			for (const utility of [
				"data-checked:bg-primary",
				"data-unchecked:translate-x-",
				"focus-visible:ring-",
				"after:-inset-x-3",
			])
				expect(nextSource).toContain(utility);
			expect(compile(nextSource, { generate: "client" }).warnings).toEqual([]);
			expect(
				switchOverrideClasses({ radius: "style", duration: "style" }, baseline.context)
			).toEqual({});
			for (let size = 10; size <= 24; size += 2) {
				const classes = switchOverrideClasses(
					{ thumbHeight: size, smallThumbHeight: size },
					baseline.context
				);
				styleOverridePayloadSchema.parse({ style, classes });
				// Test the actual @apply contract: preview pixels alone cannot catch invalid utilities.
				await compileTailwind(
					`@theme { --spacing: 0.25rem; } ${Object.values(classes)
						.map((utilities, i) => `.control-${i} { @apply ${utilities}; }`)
						.join("\n")}`
				);
			}
		}
	});

	it("rejects invalid sizes, colors and free-form control CSS", () => {
		for (const [spec, valid, invalid] of [
			[
				CHECKBOX_SPEC,
				{ size: 16, radius: "style" },
				[{ size: 11 }, { size: 30 }, { size: 15 }, { radius: "4px" }],
			],
			[
				RADIO_GROUP_SPEC,
				{ size: 16, gap: 8 },
				[{ size: 10 }, { gap: 25 }, { gap: 3 }, { radius: "md" }],
			],
			[
				SWITCH_SPEC,
				{ thumbHeight: 16, smallThumbHeight: 12, radius: "full", duration: "style" },
				[{ thumbHeight: 9 }, { smallThumbHeight: 26 }, { thumbHeight: 15 }, { duration: "200ms" }],
			],
		] as const)
			for (const bad of invalid)
				expect(spec.valuesSchema.safeParse({ ...valid, ...bad }).success).toBe(false);
		for (const classes of [
			{ "cn-checkbox": "bg-red-500" },
			{ "cn-checkbox-indicator": "[&>svg]:size-[20px]" },
			{ "cn-radio-group-item": "rounded-none" },
			{ "cn-radio-group-indicator-icon": "dark:bg-white" },
			{ "cn-switch": "data-[size=default]:h-5.6" },
			{ "cn-switch": "data-[size=default]:h-[22.3px]" },
			{ "cn-switch": "data-[size=default]:h-[28.4px]" },
			{ "cn-switch": "data-[size=default]:w-[22.4px]" },
			{ "cn-switch": "data-[size=lg]:h-6" },
			{ "cn-switch-thumb": "translate-x-4" },
			{ "cn-switch-thumb": "group-data-[size=default]/switch:w-5!" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});

describe("Card write-back preserves shared spacing and part radii", () => {
	it("reads all styles and replaces both size variables without flattening conditional layouts", () => {
		for (const [style, spacing, smallSpacing, headerGap, radius] of [
			["nova", 16, 12, 4, "xl"],
			["vega", 24, 16, 4, "xl"],
			["maia", 24, 16, 8, "2xl"],
			["mira", 16, 12, 4, "lg"],
			["lyra", 16, 12, 4, "none"],
			["luma", 24, 16, 6, "4xl"],
			["rhea", 20, 16, 6, "style"],
			["sera", 32, 20, 6, "style"],
		] as const) {
			expect(parseCardSource(registryFiles("card", style)).values).toEqual({
				spacing,
				smallSpacing,
				headerGap,
				radius,
			});
			const write = (css: string, overrides: Parameters<typeof cardOverrideClasses>[0]) =>
				applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({ style, classes: cardOverrideClasses(overrides) })
				);
			const css = write(emptyOverrides(style), {
				spacing: 22,
				smallSpacing: 10,
				headerGap: 12,
				radius: "md",
			});
			const files = ["card", "card-header", "card-footer"].map((part) => ({
				target: `${part}.svelte`,
				content: installed("card", style, css, `${part}.svelte`),
			}));
			expect(parseCardSource(files).values).toEqual({
				spacing: 22,
				smallSpacing: 10,
				headerGap: 12,
				radius: "md",
			});
			const root = classList(files[0].content);
			expect(root).not.toContain(`[--card-spacing:--spacing(${spacing / 4})]`);
			expect(root).not.toContain(`data-[size=sm]:[--card-spacing:--spacing(${smallSpacing / 4})]`);
			for (const utility of [
				"gap-(--card-spacing)",
				"py-(--card-spacing)",
				"has-[>img:first-child]:pt-0",
				"*:[img:first-child]:rounded-t-md",
				"*:[img:last-child]:rounded-b-md",
			])
				expect(root).toContain(utility);
			expect(classList(files[1].content)).toContain("rounded-t-md");
			expect(classList(files[1].content)).toContain("[.border-b]:pb-(--card-spacing)");
			expect(classList(files[2].content)).toContain("rounded-b-md");
			const second = write(css, { spacing: 30 });
			const updated = installed("card", style, second, "card.svelte");
			expect(classList(updated)).not.toContain("[--card-spacing:--spacing(5.5)]");
			expect(parseCardSource([{ target: "card.svelte", content: updated }]).values).toMatchObject({
				spacing: 30,
				smallSpacing: 10,
				radius: "md",
			});
		}
	});

	it("allows only the bounded Card variable and rejects arbitrary properties or colors", () => {
		expect(cardOverrideClasses({ radius: "style" })).toEqual({});
		for (const spacing of [0, 48])
			expect(
				styleOverridePayloadSchema.safeParse({
					style: "nova",
					classes: cardOverrideClasses({ spacing, smallSpacing: spacing }),
				}).success
			).toBe(true);
		for (const value of [
			"[--card-spacing:22px]",
			"[--card-spacing:--spacing(12.5)]",
			"[--card-spacing:--spacing(-1)]",
			"[--radius:--spacing(4)]",
			"bg-red-500",
			"p-4",
			"rounded-[12px]",
			"data-[size=lg]:[--card-spacing:--spacing(4)]",
		])
			expect(
				styleOverridePayloadSchema.safeParse({ style: "nova", classes: { "cn-card": value } })
					.success
			).toBe(false);
		for (const values of [
			{ spacing: -2 },
			{ smallSpacing: 50 },
			{ headerGap: 3 },
			{ radius: "12px" },
		])
			expect(
				CARD_SPEC.valuesSchema.safeParse({
					spacing: 16,
					smallSpacing: 12,
					headerGap: 4,
					radius: "xl",
					...values,
				}).success
			).toBe(false);
	});
});

describe("Tabs write-back preserves variant and orientation contracts", () => {
	it("reads mixed geometry as style-owned and roundtrips explicit uniform choices in all styles", () => {
		for (const [style, height, listPadding, listRadius, paddingY, triggerRadius] of [
			["nova", "32", "3", "lg", "2", "md"],
			["vega", "36", "3", "lg", "4", "md"],
			["maia", "36", "3", "style", "style", "xl"],
			["mira", "32", "3", "lg", "style", "md"],
			["lyra", "32", "3", "none", "style", "none"],
			["luma", "36", "4", "style", "style", "style"],
			["rhea", "32", "style", "2xl", "2", "2xl"],
			["sera", "40", "4", "style", "style", "style"],
		] as const) {
			expect(parseTabsSource(registryFiles("tabs", style)).values).toEqual({
				listHeight: height,
				contentGap: 8,
				listPadding,
				listRadius,
				triggerPaddingX: "style",
				triggerPaddingY: paddingY,
				triggerRadius,
			});
			const write = (css: string, overrides: Parameters<typeof tabsOverrideClasses>[0]) =>
				applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({ style, classes: tabsOverrideClasses(overrides) })
				);
			const draft = {
				listHeight: "40",
				contentGap: 14,
				listPadding: "4",
				listRadius: "sm",
				triggerPaddingX: "14",
				triggerPaddingY: "6",
				triggerRadius: "lg",
			} as const;
			const css = write(emptyOverrides(style), draft);
			const files = ["tabs", "tabs-list", "tabs-trigger"].map((part) => ({
				target: `tabs/${part}.svelte`,
				content: installed("tabs", style, css, `${part}.svelte`),
			}));
			expect(parseTabsSource(files).values).toEqual(draft);
			const trigger = classList(files[2].content);
			for (const utility of [
				"px-3.5",
				"group-data-vertical/tabs:px-3.5",
				"has-data-[icon=inline-start]:pl-3.5",
				"has-data-[icon=inline-end]:pr-3.5",
				"group-data-vertical/tabs:py-1.5",
				"group-data-vertical/tabs:rounded-lg",
				"disabled:pointer-events-none",
			])
				expect(trigger).toContain(utility);
			expect(files[2].content).toContain(
				"group-data-[variant=line]/tabs-list:data-active:after:opacity-100"
			);
			const list = files[1].content;
			expect(list).toContain("data-[variant=default]:rounded-sm");
			expect(list).toContain("group-data-vertical/tabs:data-[variant=default]:rounded-sm");
			if (height !== "40")
				expect(list).not.toContain(`group-data-horizontal/tabs:h-${Number(height) / 4}`);
			const second = write(css, { listHeight: "32", triggerPaddingX: "4", triggerRadius: "none" });
			const output = installed("tabs", style, second, "tabs-trigger.svelte");
			expect(classList(output)).not.toContain("px-3.5");
			expect(classList(output)).not.toContain("group-data-vertical/tabs:rounded-lg");
		}
	});

	it("rejects unrelated component parts and arbitrary or behavioral overrides", () => {
		expect(
			tabsOverrideClasses({
				listPadding: "style",
				listRadius: "style",
				triggerPaddingX: "style",
				triggerPaddingY: "style",
				triggerRadius: "style",
			})
		).toEqual({});
		for (const classes of [
			{ "cn-tabs": "flex-row" },
			{ "cn-tabs-list": "rounded-xl" },
			{ "cn-tabs-list": "h-12" },
			{ "cn-tabs-trigger": "bg-red-500" },
			{ "cn-tabs-trigger": "px-[12px]" },
			{ "cn-tabs-content": "gap-4" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
		const baseline = parseTabsSource(registryFiles("tabs", "nova")).values;
		for (const values of [
			{ listHeight: "44" },
			{ contentGap: 3 },
			{ triggerPaddingX: "18" },
			{ listPadding: "0" },
		])
			expect(TABS_SPEC.valuesSchema.safeParse({ ...baseline, ...values }).success).toBe(false);
	});
});

describe("Dropdown Menu write-back into Valar style overrides", () => {
	const write = (style: string, overrides: MenuOverrides) => {
		const { context } = parseMenuSource("dropdown-menu", registryFiles("dropdown-menu", style));
		return applyStyleOverrides(
			emptyOverrides(style),
			styleOverridePayloadSchema.parse({
				style,
				classes: DROPDOWN_MENU_SPEC.overrideClasses(overrides, context),
			})
		);
	};
	const part = (style: string, css: string, file: string) =>
		classList(installed("dropdown-menu", style, css, `dropdown-menu-${file}.svelte`));

	it("reads each style's own baseline from the installed source", () => {
		const nova = parseMenuSource("dropdown-menu", registryFiles("dropdown-menu", "nova"));
		expect(nova.values).toEqual({
			padding: 4,
			minWidth: 128,
			radius: "lg",
			itemPaddingX: 6,
			itemPaddingY: 4,
			itemGap: 6,
			itemRadius: "md",
			duration: "fast",
			zoom: "95",
			slide: "8",
		});
		expect(nova.context).toMatchObject({ inset: 28, choicePaddingY: 4, separatorBleed: true });
		const vega = parseMenuSource("dropdown-menu", registryFiles("dropdown-menu", "vega"));
		expect(vega.values).toMatchObject({
			radius: "md",
			itemPaddingX: 8,
			itemPaddingY: 6,
			itemGap: 8,
			itemRadius: "sm",
		});
		expect(vega.context.inset).toBe(32);
		// Lyra has no panel padding but its separators still use -mx-1: they do not bleed.
		const lyra = parseMenuSource("dropdown-menu", registryFiles("dropdown-menu", "lyra"));
		expect(lyra.values.padding).toBe(0);
		expect(lyra.context.separatorBleed).toBe(false);
		expect(
			parseMenuSource("dropdown-menu", registryFiles("dropdown-menu", "luma")).values
		).toMatchObject({
			padding: 6,
			minWidth: 192,
			radius: "3xl",
		});
	});

	it("writes panel, item, inset and separator utilities that stay aligned", () => {
		const css = write("nova", {
			padding: 8,
			minWidth: 160,
			itemPaddingX: 10,
			itemGap: 8,
			duration: "slow",
			zoom: "90",
			slide: "16",
		});
		const content = part("nova", css, "content");
		expect(content).toEqual(
			expect.arrayContaining([
				"p-2",
				"min-w-40",
				"duration-slow",
				"data-open:zoom-in-90",
				"data-[side=bottom]:slide-in-from-top-4",
				"data-[side=left]:slide-in-from-right-4",
			])
		);
		for (const stale of [
			"p-1",
			"min-w-32",
			"duration-100",
			"data-open:zoom-in-95",
			"data-[side=bottom]:slide-in-from-top-2",
		])
			expect(content).not.toContain(stale);
		expect(part("nova", css, "sub-content")).toEqual(
			expect.arrayContaining([
				"p-2",
				"duration-slow",
				"data-closed:zoom-out-90",
				"min-w-[96px]",
				"data-[side=right]:slide-in-from-left-4",
			])
		);
		expect(part("nova", css, "sub-content")).not.toContain(
			"data-[side=right]:slide-in-from-left-2"
		);
		// Inset rows keep lining up with icon rows: 10px padding + 16px icon + 8px gap = 34px.
		const item = part("nova", css, "item");
		expect(item).toEqual(expect.arrayContaining(["px-2.5", "gap-2", "data-inset:pl-8.5", "py-1"]));
		expect(item).not.toContain("data-inset:pl-7");
		const checkbox = part("nova", css, "checkbox-item");
		// Checkbox rows move only their leading padding; the indicator side stays.
		expect(checkbox).toEqual(expect.arrayContaining(["pl-2.5", "pr-8", "data-inset:pl-8.5"]));
		expect(part("nova", css, "label")).toEqual(
			expect.arrayContaining(["px-2.5", "data-inset:pl-8.5"])
		);
		expect(part("nova", css, "separator")).toContain("-mx-2");
		expect(part("nova", css, "separator")).not.toContain("-mx-1");
		// Mira's checkbox rows sit 2px taller than plain rows; the offset survives.
		const mira = write("mira", { itemPaddingY: 8 });
		expect(part("mira", mira, "item")).toContain("py-2");
		expect(part("mira", mira, "checkbox-item")).toContain("py-2.5");
		// Lyra's separators do not bleed, so panel padding leaves them alone.
		expect(part("lyra", write("lyra", { padding: 8 }), "separator")).toContain("-mx-1");
	});

	it("rejects colors, arbitrary values and utilities outside each Dropdown Menu part", () => {
		for (const classes of [
			{ "cn-dropdown-menu-content": "p-2 bg-red-500" },
			{ "cn-dropdown-menu-content": "min-w-[200px]" },
			{ "cn-dropdown-menu-content": "data-[side=bottom]:slide-in-from-top-[13px]" },
			{ "cn-dropdown-menu-sub-content": "data-[side=bottom]:slide-in-from-top-6" },
			{ "cn-dropdown-menu-sub-content": "min-w-40" },
			{ "cn-dropdown-menu-item": "text-sm" },
			{ "cn-dropdown-menu-checkbox-item": "pr-2" },
			{ "cn-dropdown-menu-label": "py-2" },
			{ "cn-dropdown-menu-separator": "my-2" },
			{ "cn-dropdown-menu-shortcut": "px-2" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});

describe("Tooltip write-back into Valar style overrides", () => {
	const write = (style: string, overrides: Parameters<typeof tooltipOverrideClasses>[0]) =>
		applyStyleOverrides(
			emptyOverrides(style),
			styleOverridePayloadSchema.parse({ style, classes: tooltipOverrideClasses(overrides) })
		);

	it("reads each style's own baseline, including the show delay", () => {
		expect(parseTooltipSource(registryFiles("tooltip", "nova")).values).toEqual({
			paddingX: 12,
			paddingY: 6,
			radius: "md",
			delay: 0,
			duration: "style",
			zoom: "95",
		});
		expect(parseTooltipSource(registryFiles("tooltip", "maia")).values.radius).toBe("2xl");
		expect(parseTooltipSource(registryFiles("tooltip", "lyra")).values.radius).toBe("none");
		// A written delay is read back from the flattened provider.
		const provider = installed(
			"tooltip",
			"nova",
			write("nova", { delay: 350 }),
			"tooltip-provider.svelte"
		);
		expect(
			parseTooltipSource([{ target: "tooltip/tooltip-provider.svelte", content: provider }]).values
				.delay
		).toBe(350);
	});

	it("installs the written delay as the Provider default; callers still override it", () => {
		const css = write("nova", { delay: 300, paddingX: 16, duration: "normal", zoom: "90" });
		const provider = installed("tooltip", "nova", css, "tooltip-provider.svelte");
		expect(evaluateProps(provider, {}, "delayDuration")).toBe(300);
		expect(evaluateProps(provider, { delayDuration: 0 }, "delayDuration")).toBe(0);
		expect(() => compile(provider, { generate: "client" })).not.toThrow();
		// Without a write-back the installed default stays upstream's 0.
		const untouched = installed(
			"tooltip",
			"nova",
			emptyOverrides("nova"),
			"tooltip-provider.svelte"
		);
		expect(evaluateProps(untouched, {}, "delayDuration")).toBe(0);
		const content = classList(installed("tooltip", "nova", css, "tooltip-content.svelte"));
		expect(content).toEqual(
			expect.arrayContaining([
				"px-4",
				"py-1.5",
				"duration-normal",
				"data-open:zoom-in-90",
				"data-[state=delayed-open]:zoom-in-90",
				"data-closed:zoom-out-90",
			])
		);
		for (const stale of ["px-3", "data-open:zoom-in-95", "data-[state=delayed-open]:zoom-in-95"])
			expect(content).not.toContain(stale);
	});

	it("rejects colors, type sizes, arbitrary delays and other Tooltip parts", () => {
		for (const classes of [
			{ "cn-tooltip-content": "px-4 bg-red-500" },
			{ "cn-tooltip-content": "text-sm" },
			{ "cn-tooltip-content": "duration-[400ms]" },
			{ "cn-tooltip-provider": "delay-[300ms]" },
			{ "cn-tooltip-provider": "delay-300 px-2" },
			{ "cn-tooltip-provider": "delay-99999" },
			{ "cn-tooltip-arrow": "size-3" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});

describe("Drawer write-back preserves directional and inset surfaces", () => {
	const write = (
		style: string,
		overrides: Parameters<typeof drawerOverrideClasses>[0],
		css = emptyOverrides(style)
	) =>
		applyStyleOverrides(
			css,
			styleOverridePayloadSchema.parse({
				style,
				classes: drawerOverrideClasses(
					overrides,
					parseDrawerSource(registryFiles("drawer", style)).context
				),
			})
		);
	const files = (style: string, css: string) =>
		["content", "header", "footer", "overlay"].map((part) => ({
			target: `drawer-${part}.svelte`,
			content: installed("drawer", style, css, `drawer-${part}.svelte`),
		}));

	it("reads all styles including pseudo-element surfaces and custom radius", () => {
		for (const style of ["nova", "vega", "lyra", "maia", "mira", "luma", "sera", "rhea"]) {
			const { values, context } = parseDrawerSource(registryFiles("drawer", style));
			expect(values).toEqual({
				headerPadding: 16,
				footerPadding: 16,
				footerGap: 8,
				radius: (
					{
						nova: "xl",
						vega: "xl",
						lyra: "none",
						maia: "4xl",
						mira: "xl",
						luma: "4xl",
						sera: "none",
						rhea: "style",
					} as Record<string, string>
				)[style],
				overlay:
					({ maia: 80, mira: 80, luma: 30, sera: 20, rhea: 30 } as Record<string, number>)[style] ??
					10,
			});
			expect(context.insetSurface).toBe(["maia", "mira", "luma", "rhea"].includes(style));
		}
	});

	it("writes and rereads the real surface without flattening its style or changing Vaul motion", () => {
		for (const style of ["nova", "vega", "lyra", "maia", "rhea"]) {
			const css = write(style, {
				headerPadding: 22,
				footerPadding: 30,
				footerGap: 14,
				radius: "lg",
				overlay: 40,
			});
			const output = files(style, css);
			const part = (name: string) =>
				classList(output.find((f) => f.target === `drawer-${name}.svelte`)!.content);
			expect(part("header")).toContain("p-5.5");
			expect(part("header")).not.toContain("p-4");
			expect(part("footer")).toEqual(expect.arrayContaining(["p-7.5", "gap-3.5"]));
			expect(part("footer")).not.toContain("gap-2");
			expect(part("overlay")).toContain("bg-black/40");
			const inset = ["maia", "rhea"].includes(style);
			if (inset) {
				expect(part("content")).toEqual(
					expect.arrayContaining(["before:rounded-lg", "bg-transparent", "before:inset-2"])
				);
				expect(part("content").filter((c) => c.startsWith("before:rounded-"))).toEqual([
					"before:rounded-lg",
				]);
			} else {
				for (const [side, edge] of [
					["bottom", "t"],
					["top", "b"],
					["left", "r"],
					["right", "l"],
				])
					expect(part("content")).toContain(
						`data-[vaul-drawer-direction=${side}]:rounded-${edge}-lg`
					);
			}
			expect(parseDrawerSource(output).values).toEqual({
				headerPadding: 22,
				footerPadding: 30,
				footerGap: 14,
				radius: "lg",
				overlay: 40,
			});
			expect(part("content").some((c) => /duration-|slide-/.test(c))).toBe(false);
			const second = files(style, write(style, { radius: "sm", footerGap: 0 }, css));
			expect(parseDrawerSource(second).values).toMatchObject({
				radius: "sm",
				footerGap: 0,
				headerPadding: 22,
				overlay: 40,
			});
		}
	});

	it("rejects unsupported motion, arbitrary values and unrelated Drawer parts", () => {
		for (const classes of [
			{ "cn-drawer-content": "duration-slow" },
			{ "cn-drawer-content": "rounded-lg" },
			{ "cn-drawer-content": "before:rounded-[20px]" },
			{ "cn-drawer-header": "gap-4" },
			{ "cn-drawer-footer": "text-sm" },
			{ "cn-drawer-overlay": "bg-black/45" },
			{ "cn-drawer-title": "p-4" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});

describe("Hover Card write-back", () => {
	it("reads each style and roundtrips layout and motion through installed source", () => {
		for (const [style, padding, radius] of [
			["nova", 10, "lg"],
			["vega", 16, "lg"],
			["lyra", 10, "none"],
		] as const) {
			expect(parseHoverCardSource(registryFiles("hover-card", style)).values).toMatchObject({
				padding,
				radius,
				slide: "8",
				duration: "fast",
			});
			const write = (css: string, overrides: Parameters<typeof hoverCardOverrideClasses>[0]) =>
				applyStyleOverrides(
					css,
					styleOverridePayloadSchema.parse({ style, classes: hoverCardOverrideClasses(overrides) })
				);
			const css = write(emptyOverrides(style), {
				padding: 22,
				radius: "sm",
				duration: "slow",
				zoom: "90",
				slide: "16",
			});
			const content = applyTokenUtilities(
				installed("hover-card", style, css, "hover-card-content.svelte")
			);
			expect(
				parseHoverCardSource([{ target: "hover-card-content.svelte", content }]).values
			).toEqual({ padding: 22, radius: "sm", duration: "slow", zoom: "90", slide: "16" });
			const classes = classList(content);
			expect(classes).toContain("w-64");
			for (const stale of [
				`p-${padding / 4}`,
				"duration-fast",
				"data-open:zoom-in-95",
				"data-[side=right]:slide-in-from-left-2",
			])
				expect(classes).not.toContain(stale);
			const second = applyTokenUtilities(
				installed("hover-card", style, write(css, { slide: "0" }), "hover-card-content.svelte")
			);
			expect(classList(second)).not.toContain("data-[side=right]:slide-in-from-left-4");
			expect(
				parseHoverCardSource([{ target: "hover-card-content.svelte", content: second }]).values
			).toMatchObject({ padding: 22, slide: "0" });
		}
	});

	it("rejects caller props, nonexistent gap and invalid motion utilities", () => {
		for (const value of [
			"w-80",
			"gap-4",
			"p-[13px]",
			"bg-red-500",
			"duration-[500ms]",
			"data-[side=right]:slide-in-from-left-6",
		]) {
			expect(
				styleOverridePayloadSchema.safeParse({
					style: "nova",
					classes: { "cn-hover-card-content": value },
				}).success
			).toBe(false);
		}
	});
});

describe("Context Menu write-back uses its own source and shared menu contract", () => {
	it("preserves per-style alignment and roundtrips panel and item values", () => {
		for (const style of ["nova", "vega", "mira", "lyra"]) {
			const { values, context } = parseMenuSource(
				"context-menu",
				registryFiles("context-menu", style)
			);
			expect(values.minWidth).toBe(style === "mira" ? 128 : 144);
			expect(values.itemPaddingX).toBe(style === "nova" ? 6 : 8);
			const css = applyStyleOverrides(
				emptyOverrides(style),
				styleOverridePayloadSchema.parse({
					style,
					classes: CONTEXT_MENU_SPEC.overrideClasses(
						{
							padding: 8,
							minWidth: 208,
							itemPaddingX: 10,
							itemPaddingY: 8,
							itemGap: 8,
							slide: "16",
							duration: "slow",
						},
						context
					),
				})
			);
			const files = [
				"content",
				"sub-content",
				"item",
				"sub-trigger",
				"checkbox-item",
				"radio-item",
				"label",
				"group-heading",
				"separator",
			].map((part) => ({
				target: `context-menu-${part}.svelte`,
				content: applyTokenUtilities(
					installed("context-menu", style, css, `context-menu-${part}.svelte`)
				),
			}));
			expect(parseMenuSource("context-menu", files).values).toMatchObject({
				padding: 8,
				minWidth: 208,
				itemPaddingX: 10,
				itemPaddingY: 8,
				itemGap: 8,
				slide: "16",
				duration: "slow",
			});
			const part = (name: string) =>
				classList(files.find((f) => f.target === `context-menu-${name}.svelte`)!.content);
			expect(part("sub-content")).toEqual(
				expect.arrayContaining(["p-2", "duration-slow", "data-[side=right]:slide-in-from-left-4"])
			);
			expect(part("sub-content")).not.toContain("data-[side=right]:slide-in-from-left-2");
			expect(part("checkbox-item")).toEqual(
				expect.arrayContaining(["pl-2.5", "pr-8", style === "mira" ? "py-2.5" : "py-2"])
			);
			expect(part("group-heading")).toEqual(
				expect.arrayContaining([
					"px-2.5",
					`data-inset:pl-${style === "mira" ? "8" : style === "lyra" ? "7.5" : "8.5"}`,
				])
			);
			expect(part("separator")).toContain(style === "lyra" ? "-mx-1" : "-mx-2");
		}
	});

	it("rejects changes outside the Context Menu parameter contract", () => {
		for (const classes of [
			{ "cn-context-menu-content": "bg-red-500" },
			{ "cn-context-menu-content": "min-w-[200px]" },
			{ "cn-context-menu-sub-content": "min-w-40" },
			{ "cn-context-menu-checkbox-item": "pr-2" },
			{ "cn-context-menu-label": "py-2" },
			{ "cn-context-menu-trigger": "p-4" },
		])
			expect(styleOverridePayloadSchema.safeParse({ style: "nova", classes }).success).toBe(false);
	});
});
