import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createThemeCss, getValarStyleMap, styleSource } from "../../../scripts/valar-style.ts";

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(pkg, "../..");
const source = path.join(pkg, "src");
const output = path.join(pkg, "dist");
const map = getValarStyleMap(root);
const upstream = new Set([
	"button",
	"input",
	"checkbox",
	"select",
	"dialog",
	"calendar",
	"slider",
	"chart",
	"popover",
]);
const generated = new Map<string, string>();

for (const name of fs.readdirSync(source).sort()) {
	if (!/\.tsx?$/.test(name)) continue;
	const component = path.parse(name).name;
	const notice = upstream.has(component)
		? `// Adapted from shadcn-ui/ui apps/v4/registry/bases/radix/ui/${name}\n// SHA 42f3bb63b46a69e52a24bd005cdc9ec15ba7a7b9; Copyright (c) 2023 shadcn; MIT (see LICENSE).\n`
		: "// Valar React adaptation. See NOTICE.md for source provenance.\n";
	const content = styleSource(fs.readFileSync(path.join(source, name), "utf8"), map);
	if (content.includes("@/") || /\bfrom\s+["'](?:svelte|bits-ui|\$lib)/.test(content)) {
		throw new Error(`Unresolved host/runtime dependency in ${name}`);
	}
	generated.set(name, notice + content);
}
generated.set("theme.css", createThemeCss(root, ["./**/*.{ts,tsx}"]));

fs.mkdirSync(output, { recursive: true });
for (const [name, content] of generated) {
	const file = path.join(output, name);
	if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) continue;
	fs.writeFileSync(file, content);
}
for (const name of fs.readdirSync(output)) {
	if (!generated.has(name)) fs.rmSync(path.join(output, name));
}
console.log(`[react-ui] Generated ${generated.size} self-contained native source/style files`);
