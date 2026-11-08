import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createThemeCss, getValarStyleMap, styleSource } from "../../../scripts/valar-style.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const packageRoot = path.join(root, "packages/vue-ui");
const sourceRoot = path.join(packageRoot, "src");
const output = path.join(packageRoot, "dist");
const files = fs
	.readdirSync(sourceRoot, { recursive: true, withFileTypes: true })
	.filter((entry) => entry.isFile())
	.map((entry) => path.join(entry.parentPath, entry.name))
	.sort();

// Valar style declarations originate in Bits UI. Only adapt the actual native
// Reka names for these controls; do not replace Reka's inline geometry/engine.
export function nativeStyle(source: string): string {
	return (
		source
			.replaceAll("--bits-select-", "--reka-select-")
			.replaceAll("--bits-popover-", "--reka-popover-")
			.replaceAll("data-[highlighted=true]", "data-[highlighted]")
			.replaceAll("data-[checked=true]", "data-[state=checked]")
			// These are valid unquoted CSS identifiers. Removing the optional quotes
			// keeps injected utilities valid in Vue's single-quoted JS class literals.
			.replace(/\[class\*='size-'\]/g, "[class*=size-]")
	);
}

const styleMap = Object.fromEntries(
	Object.entries(getValarStyleMap(root)).map(([key, value]) => [key, nativeStyle(value)])
);
const generated = new Map<string, string>();
for (const file of files) {
	const relative = path.relative(sourceRoot, file);
	let source = fs.readFileSync(file, "utf8");
	source = source.replace(
		/(["'])@\/registry\/bases\/reka\/(ui\/[^"']+|components\/icon-placeholder(?:\/IconPlaceholder.vue)?)\1/g,
		(_, quote: string, dependency: string) => {
			const target = dependency.startsWith("components/") ? "lib/Icon.vue" : dependency;
			let specifier = path.relative(path.dirname(relative), target).split(path.sep).join("/");
			if (!specifier.startsWith(".")) specifier = `./${specifier}`;
			return `${quote}${specifier}${quote}`;
		}
	);
	// Named placeholder imports in upstream are normalized to this local default.
	source = source.replace(
		/import \{ IconPlaceholder \} from (["'][^"']*lib\/Icon.vue["'])/g,
		"import IconPlaceholder from $1"
	);
	source = nativeStyle(styleSource(source, styleMap))
		.replace(/\bcn-rtl-flip\b/g, "rtl:rotate-180")
		// Reka Select/Popover positions use cardinal sides, not Bits logical sides.
		.replace(/\bcn-[\w-]+-logical\b/g, "");
	if (source.includes("@/registry/") || /\bcn-[\w-]+/.test(source)) {
		throw new Error(`Unresolved upstream dependency or style marker: ${relative}`);
	}
	generated.set(path.join(output, relative), source);
}
generated.set(path.join(output, "theme.css"), createThemeCss(root, ["./ui", "./lib"]));
for (const name of ["LICENSE", "PROVENANCE.md"]) {
	generated.set(path.join(output, name), fs.readFileSync(path.join(packageRoot, name), "utf8"));
}
// Complete all transformations before replacing the last working output.
fs.mkdirSync(output, { recursive: true });
for (const [file, source] of generated) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, source);
}
for (const entry of fs.readdirSync(output, { recursive: true, withFileTypes: true })) {
	const file = path.join(entry.parentPath, entry.name);
	if (entry.isFile() && !generated.has(file)) fs.rmSync(file);
}
console.log(`[vue-ui] ${files.length} native source modules + shared Valar theme`);
