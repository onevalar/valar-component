import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { compileScript, parse, registerTS } from "@vue/compiler-sfc";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import type { Component } from "vue";

const dist = new URL("../dist/", import.meta.url);
const entries = {
	label: ["Label"],
	field: [
		"Field",
		"FieldContent",
		"FieldDescription",
		"FieldError",
		"FieldGroup",
		"FieldLabel",
		"FieldLegend",
		"FieldSeparator",
		"FieldSet",
		"FieldTitle",
	],
	textarea: ["Textarea"],
	switch: ["Switch"],
	tabs: ["Tabs", "TabsList", "TabsTrigger", "TabsContent"],
	kbd: ["Kbd", "KbdGroup"],
	tooltip: [
		"Tooltip",
		"TooltipProvider",
		"TooltipTrigger",
		"TooltipContent",
		"TooltipPortal",
		"TooltipHint",
	],
	"radio-group": ["RadioGroup", "RadioGroupItem"],
	"native-select": ["NativeSelect", "NativeSelectOption", "NativeSelectOptGroup"],
	"input-group": [
		"InputGroup",
		"InputGroupAddon",
		"InputGroupButton",
		"InputGroupInput",
		"InputGroupText",
		"InputGroupTextarea",
	],
	toggle: ["Toggle"],
	"toggle-group": ["ToggleGroup", "ToggleGroupItem"],
	"button-group": ["ButtonGroup", "ButtonGroupSeparator", "ButtonGroupText"],
	accordion: ["Accordion", "AccordionTrigger", "AccordionContent"],
	alert: ["Alert", "AlertAction"],
	"aspect-ratio": ["AspectRatio"],
	avatar: ["Avatar", "AvatarFallback", "AvatarGroupCount"],
	badge: ["Badge"],
	breadcrumb: ["Breadcrumb", "BreadcrumbLink", "BreadcrumbPage"],
	card: ["Card", "CardHeader", "CardAction"],
	carousel: ["Carousel", "CarouselItem", "CarouselPrevious", "CarouselNext"],
	collapsible: ["Collapsible", "CollapsibleTrigger", "CollapsibleContent"],
	empty: ["Empty", "EmptyMedia"],
	item: ["Item", "ItemGroup", "ItemSeparator"],
	"page-layout": ["PageLayout", "PageLayoutPropertyList", "PageLayoutPropertyRow"],
	pagination: ["Pagination", "PaginationLink", "PaginationPrevious", "PaginationNext"],
	progress: ["Progress"],
	resizable: ["ResizablePaneGroup", "ResizablePane", "ResizableHandle"],
	"scroll-area": ["ScrollArea", "ScrollAreaScrollbar"],
	skeleton: ["Skeleton"],
	spinner: ["Spinner"],
};

test("component groups are exported from both their public subpaths and the root", () => {
	const root = readFileSync(new URL("index.ts", dist), "utf8");
	for (const [path, names] of Object.entries(entries)) {
		assert.ok(root.includes(`export * from "./ui/${path}";`), path);
		const subpath = readFileSync(new URL(`ui/${path}/index.ts`, dist), "utf8");
		const source = ts.createSourceFile(`${path}.ts`, subpath, ts.ScriptTarget.Latest);
		const exported = source.statements.flatMap((statement) => {
			if (
				!ts.isExportDeclaration(statement) ||
				!statement.exportClause ||
				!ts.isNamedExports(statement.exportClause)
			)
				return [];
			return statement.exportClause.elements.map((specifier) => specifier.name.text);
		});
		assert.deepEqual(
			names.filter((name) => !exported.includes(name)),
			[],
			path
		);
	}
});

test("the distributed wave compiles SFC runtime props and event declarations", () => {
	registerTS(() => ts);
	for (const path of Object.keys(entries)) {
		const subpath = new URL(`ui/${path}/`, dist);
		for (const name of readdirSync(subpath).filter((file) => file.endsWith(".vue"))) {
			const url = new URL(name, subpath);
			const filename = fileURLToPath(url);
			const { descriptor, errors } = parse(readFileSync(url, "utf8"), { filename });
			assert.deepEqual(errors, [], filename);
			if (!descriptor.scriptSetup && !descriptor.script) continue;
			assert.doesNotThrow(
				() =>
					compileScript(descriptor, {
						id: filename,
						inlineTemplate: true,
						fs: { fileExists: existsSync, readFile: (file) => readFileSync(file, "utf8") },
					}),
				filename
			);
		}
	}
});

async function renderFieldError(props: object, slots?: { default: () => string }) {
	const url = new URL("ui/field/FieldError.vue", dist);
	const filename = fileURLToPath(url);
	const source = readFileSync(url, "utf8");
	const { descriptor } = parse(source, { filename });
	const { content } = compileScript(descriptor, {
		id: "valar-field-error",
		inlineTemplate: true,
		templateOptions: { ssr: true },
	});
	const { outputText } = ts.transpileModule(content, {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
	});
	const exports: { default?: Component } = {};
	new Function("require", "exports", outputText)(createRequire(url), exports);
	assert.ok(exports.default);
	return renderToString(createSSRApp({ render: () => h(exports.default!, props, slots) }));
}

test("FieldError omits empty alerts, trims and deduplicates messages, and prefers a slot", async () => {
	assert.doesNotMatch(
		await renderFieldError({ errors: [null, {}, { message: "  " }] }),
		/role="alert"/
	);
	const errors = [{ message: " Missing name " }, { message: "Missing name" }];
	const single = await renderFieldError({ id: "error", errors });
	assert.match(single, /role="alert"/);
	assert.match(single, /id="error"/);
	assert.equal(single.match(/Missing name/g)?.length, 1);
	assert.doesNotMatch(single, /<ul/);
	assert.match(
		await renderFieldError({ errors: [...errors, { message: "Try again" }] }),
		/<li>Missing name<\/li><li>Try again<\/li>/
	);
	const custom = await renderFieldError({ errors }, { default: () => "Use a different name" });
	assert.match(custom, /Use a different name/);
	assert.doesNotMatch(custom, /Missing name/);
});
