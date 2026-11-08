import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import { scalarKeyValue } from "../dist/ui/slider/scalar-keyboard.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");

test("scalar keyboard contract covers four arrows, Shift/Page, min-relative snapping and grid bounds", () => {
	const key = (key: string, shiftKey = false, value = 37) =>
		scalarKeyValue({ key, shiftKey }, value, -20, 80, 3);
	assert.equal(key("ArrowRight"), 40);
	assert.equal(key("ArrowUp"), 40);
	assert.equal(key("ArrowLeft"), 34);
	assert.equal(key("ArrowDown"), 34);
	assert.equal(key("ArrowUp", true), 43);
	assert.equal(key("ArrowDown", true), 31);
	assert.equal(key("PageUp"), 43);
	assert.equal(key("PageDown"), 31);
	assert.equal(key("Home"), -20);
	assert.equal(key("End"), 79);
	assert.equal(key("ArrowRight", false, 79), 79);
	assert.equal(key("ArrowLeft", false, -20), -20);
	assert.equal(scalarKeyValue({ key: "ArrowUp" }, 0.2, 0, 1, 0.1), 0.3);
	assert.equal(scalarKeyValue({ key: "PageUp" }, 37, -20, 80, 3, 12), 49);
});

test("scalar End and commits cannot expose an off-grid maximum", () => {
	assert.equal(scalarKeyValue({ key: "End" }, 37, -20, 80, 3), 79);
	assert.equal(scalarKeyValue({ key: "PageUp" }, 76, -20, 80, 3), 79);
	assert.equal(scalarKeyValue({ key: "End" }, 3, 0, 10, 4), 8);
	assert.equal(scalarKeyValue({ key: "End" }, 3, 0, 12, 4), 12);
	assert.equal(scalarKeyValue({ key: "End" }, 0.1, 0, 0.3, 0.1), 0.3);
	assert.equal(scalarKeyValue({ key: "End" }, 0.2, -0.2, 0.8, 0.3), 0.7);
});

test("scalar browser/app modifiers and prior cancellation remain untouched", () => {
	for (const modifier of ["altKey", "ctrlKey", "metaKey", "defaultPrevented"]) {
		assert.equal(
			scalarKeyValue({ key: "ArrowRight", [modifier]: true }, 37, -20, 80, 3),
			undefined
		);
	}
	assert.equal(scalarKeyValue({ key: "Enter" }, 37), undefined);
});

test("every distributed Vue template compiles after shared style injection", () => {
	const files = fs
		.readdirSync(dist, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith(".vue"));
	assert.ok(files.length > 40);
	for (const entry of files) {
		const filename = path.join(entry.parentPath, entry.name);
		const source = fs.readFileSync(filename, "utf8");
		const { descriptor, errors } = parse(source, { filename });
		assert.deepEqual(errors, [], filename);
		if (descriptor.template) {
			const compiled = compileTemplate({
				source: descriptor.template.content,
				filename,
				id: filename,
				compilerOptions: { expressionPlugins: ["typescript"] },
			});
			assert.deepEqual(compiled.errors, [], filename);
		}
	}
});

test("distribution has closed relative dependencies, public component paths and no source runtime", () => {
	const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
	assert.equal(manifest.private, true);
	for (const name of [
		"button",
		"input",
		"checkbox",
		"select",
		"dialog",
		"calendar",
		"range-calendar",
		"slider",
		"chart",
		"popover",
	]) {
		assert.ok(fs.existsSync(path.join(dist, "ui", name, "index.ts")), name);
	}
	for (const entry of fs
		.readdirSync(dist, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile() && /\.(ts|vue)$/.test(entry.name))) {
		const filename = path.join(entry.parentPath, entry.name);
		const source = fs.readFileSync(filename, "utf8");
		assert.doesNotMatch(
			source,
			/@\/registry\/|\$lib\/|\bcn-[\w-]+|from ["'](?:svelte|bits-ui)/,
			filename
		);
		for (const match of source.matchAll(/(?:from\s+|import\s*)["'](\.[^"']+)["']/g)) {
			const target = path.resolve(path.dirname(filename), match[1]);
			assert.ok(
				[target, `${target}.ts`, `${target}/index.ts`].some((candidate) =>
					fs.existsSync(candidate)
				),
				`${filename} -> ${target}`
			);
		}
	}
	assert.match(fs.readFileSync(path.join(dist, "theme.css"), "utf8"), /@source "\.\/ui"/);
	assert.match(fs.readFileSync(path.join(dist, "LICENSE"), "utf8"), /Copyright \(c\) 2023 unovue/);
	assert.ok(!Object.keys(manifest.dependencies).some((name) => name.includes("svelte")));
});
