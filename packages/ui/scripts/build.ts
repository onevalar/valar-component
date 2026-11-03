import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PRESET_STYLES } from "@valar/svelte-cli/preset";
import {
	transform,
	transformIcons,
	transformMenu,
	transformFont,
} from "@valar/svelte-cli/transformers";
import {
	applyTokenUtilities,
	injectStyleClasses,
	mergeStyleMaps,
	parseStyleCss,
} from "@valar/svelte-parity/inject-style-classes";
import { BASE_THEMES } from "../../../docs/src/lib/registry/themes.ts";
import { DEFAULT_CONFIG } from "../../cli/src/utils/config/schema.ts";
import { transformCss } from "../../cli/src/utils/transform-css.ts";

const script = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(script), "../../..");
const registry = path.join(root, "docs/src/lib/registry");
const output = path.join(root, "packages/ui/dist");
const styles = path.join(registry, "styles");
const utilities = path.join(root, "packages/cli/src/tailwind.css");

function files(directory: string): string[] {
	return fs
		.readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => path.join(entry.parentPath, entry.name))
		.sort();
}

async function build() {
	const generated = new Map<string, string>();
	const sources = ["ui", "hooks", "lib"]
		.flatMap((directory) => files(path.join(registry, directory)))
		.filter((file) => /\.(svelte|ts|md|json)$/.test(file));
	const config = {
		...DEFAULT_CONFIG,
		sveltekit: false,
		resolvedPaths: {
			cwd: root,
			tailwindCss: "",
			utils: "",
			components: "",
			hooks: "",
			ui: "",
			lib: "",
		},
	};
	// Convert icons once. All styles use Lucide; none import the docs icon provider.
	const prepared = await Promise.all(
		sources.map(async (file) => {
			const content = fs.readFileSync(file, "utf8");
			return [
				file,
				(await transform({ content, filePath: file, config }, [transformIcons])).content,
			] as const;
		})
	);
	const theme = BASE_THEMES.find((theme) => theme.name === "neutral")!;
	const themeCss =
		transformCss(
			'@import "tw-animate-css";\n@custom-variant dark (&:is(.dark *));\n@source "./ui";\n@source "./hooks";\n@source "./lib";\n@theme inline { --font-heading: var(--font-sans); }\n',
			{
				cssVars: theme.cssVars,
				css: {
					"@layer base": {
						"*": { "@apply border-border outline-ring/50": {} },
						body: { "@apply bg-background text-foreground": {} },
					},
				},
			}
		) +
		"\n" +
		fs.readFileSync(utilities, "utf8");

	for (const style of PRESET_STYLES) {
		const styleMap = mergeStyleMaps(
			parseStyleCss(fs.readFileSync(path.join(styles, `style-${style}.css`), "utf8")),
			parseStyleCss(fs.readFileSync(path.join(styles, "valar", `style-${style}.css`), "utf8"))
		);
		for (const [file, source] of prepared) {
			const relative = path.relative(registry, file);
			const target = path.join(output, style, relative);
			let content = source;
			if (/\.(svelte|ts)$/.test(file)) {
				content = applyTokenUtilities(injectStyleClasses(content, styleMap));
				content = (
					await transform(
						{ content, filePath: file, config, supportedFontMarkers: ["cn-font-heading"] },
						[transformMenu, transformFont]
					)
				).content;
				// Only rewrite module specifiers, not snippets or user-facing text.
				content = content.replace(
					/(\bfrom\s*|\bimport\s*\(\s*)(["'])\$lib\/(registry\/)?([^"']+)\2/g,
					(_, statement, quote, prefix, name) => {
						const dependency = !prefix && name === "utils.js" ? "lib/utils.js" : name;
						let specifier = path
							.relative(path.dirname(relative), dependency)
							.split(path.sep)
							.join("/");
						if (!specifier.startsWith(".")) specifier = `./${specifier}`;
						return `${statement}${quote}${specifier}${quote}`;
					}
				);
				if (content.includes("$lib/") || content.includes("IconPlaceholder")) {
					throw new Error(`Unresolved docs dependency in ${file}`);
				}
			}
			generated.set(target, content);
		}
		generated.set(path.join(output, style, "theme.css"), themeCss);
	}
	// Finish transforming before touching the last working output. Unchanged modules
	// keep their timestamps so unrelated components do not trigger HMR/reset state.
	let changed = 0;
	for (const [file, content] of generated) {
		if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) continue;
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.writeFileSync(`${file}.tmp`, content);
		fs.renameSync(`${file}.tmp`, file);
		changed++;
	}
	if (fs.existsSync(output))
		for (const file of files(output)) {
			if (!generated.has(file)) {
				fs.rmSync(file);
				changed++;
			}
		}
	console.log(
		`[ui] ${PRESET_STYLES.length} styles, ${sources.length} source files; ${changed} outputs changed`
	);
}

if (process.argv.includes("--watch")) {
	let child: ReturnType<typeof spawn> | undefined;
	let pending = false;
	let timer: ReturnType<typeof setTimeout>;
	function rebuild() {
		if (child) {
			pending = true;
			return;
		}
		// A fresh process also reloads themes.ts's JSON token import on every save.
		child = spawn(process.execPath, ["--import", "tsx", script], { stdio: "inherit" });
		child.on("exit", (code) => {
			child = undefined;
			if (code !== 0 && code !== null)
				console.error("[ui] Build failed; fix the source and save to retry");
			if (pending) {
				pending = false;
				rebuild();
			}
		});
	}
	const watchers = [
		...["ui", "hooks", "lib", "styles"].map((directory) =>
			fs.watch(path.join(registry, directory), { recursive: true }, schedule)
		),
		...[
			path.join(registry, "themes.ts"),
			utilities,
			path.join(root, "docs/src/lib/features/workbench/token-overrides.ts"),
		].map((file) =>
			fs.watch(path.dirname(file), (_, name) => {
				if (name === path.basename(file)) schedule();
			})
		),
	];
	function schedule() {
		clearTimeout(timer);
		timer = setTimeout(rebuild, 100);
	}
	for (const signal of ["SIGINT", "SIGTERM"] as const)
		process.on(signal, () => {
			clearTimeout(timer);
			watchers.forEach((watcher) => watcher.close());
			pending = false;
			child?.kill(signal);
		});
	rebuild();
} else {
	await build();
}
