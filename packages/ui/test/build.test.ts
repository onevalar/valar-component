import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { PRESET_STYLES } from "@valar/svelte-cli/preset";
import { compile } from "svelte/compiler";
import { sharedBlocks } from "../../../docs/scripts/shared-blocks.js";

const ui = fileURLToPath(new URL("..", import.meta.url));
const root = path.resolve(ui, "../..");
const registry = path.join(root, "docs/src/lib/registry");
const components = fs.readdirSync(path.join(registry, "ui"));

test("all component exports compile without docs aliases or undeclared runtime dependencies", () => {
	const pkg = JSON.parse(fs.readFileSync(path.join(ui, "package.json"), "utf8"));
	const dependencies = new Set([
		...Object.keys(pkg.dependencies),
		...Object.keys(pkg.peerDependencies),
	]);
	for (const style of PRESET_STYLES) {
		for (const component of components) {
			const entry = fileURLToPath(
				import.meta.resolve(`@valar/svelte-ui/styles/${style}/${component}`)
			);
			assert.ok(fs.existsSync(entry), `${style}/${component} has no public entry`);
		}
		const directory = path.join(ui, "dist", style);
		for (const file of fs
			.readdirSync(directory, { recursive: true })
			.filter((file) => /\.(ts|svelte)$/.test(file))) {
			const filename = path.join(directory, file);
			const source = fs.readFileSync(filename, "utf8");
			assert.doesNotMatch(source, /\$lib\/|IconPlaceholder/);
			if (file.endsWith(".svelte")) {
				assert.deepEqual(compile(source, { filename, generate: "server" }).warnings, []);
			}
			for (const match of source.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)["']([^"']+)["']/g)) {
				const specifier = match[1]!;
				if (specifier.startsWith(".")) {
					const target = path.resolve(path.dirname(filename), specifier);
					assert.ok(
						fs.existsSync(target) || fs.existsSync(target.replace(/\.js$/, ".ts")),
						`${filename}: ${specifier}`
					);
					assert.ok(
						target.startsWith(directory + path.sep),
						`runtime import escapes package: ${target}`
					);
				} else {
					const name = specifier
						.split("/")
						.slice(0, specifier.startsWith("@") ? 2 : 1)
						.join("/");
					assert.ok(dependencies.has(name), `undeclared dependency ${specifier}`);
				}
			}
		}
	}
	assert.equal(
		import.meta.resolve("@valar/svelte-ui/button"),
		import.meta.resolve("@valar/svelte-ui/styles/valar/button")
	);
	for (const block of sharedBlocks) {
		const entry = fileURLToPath(import.meta.resolve(`@valar/svelte-ui/blocks/${block}`));
		assert.ok(fs.existsSync(entry), `${block} has no public entry`);
	}
	const theme = fs.readFileSync(
		fileURLToPath(import.meta.resolve("@valar/svelte-ui/theme.css")),
		"utf8"
	);
	assert.match(theme, /@source "\.\/blocks";/);
});

test(
	"watch updates source, saved styles and tokens, prunes deleted files and recovers after invalid source",
	{ timeout: 90_000 },
	async () => {
		const temporary = fs.mkdtempSync(path.join(tmpdir(), "valar-workspace-ui-"));
		fs.copyFileSync(path.join(root, "package.json"), path.join(temporary, "package.json"));
		const fixtureUi = path.join(temporary, "packages/ui");
		const fixtureRegistry = path.join(temporary, "docs/src/lib/registry");
		fs.mkdirSync(path.join(fixtureUi, "scripts"), { recursive: true });
		fs.copyFileSync(path.join(ui, "scripts/build.ts"), path.join(fixtureUi, "scripts/build.ts"));
		fs.copyFileSync(path.join(ui, "package.json"), path.join(fixtureUi, "package.json"));
		const fixtureScripts = path.join(temporary, "docs/scripts");
		fs.mkdirSync(fixtureScripts, { recursive: true });
		fs.copyFileSync(
			path.join(root, "docs/scripts/shared-blocks.ts"),
			path.join(fixtureScripts, "shared-blocks.ts")
		);
		fs.symlinkSync(path.join(ui, "node_modules"), path.join(fixtureUi, "node_modules"), "dir");
		fs.mkdirSync(path.join(temporary, "scripts"), { recursive: true });
		fs.copyFileSync(
			path.join(root, "scripts/valar-style.ts"),
			path.join(temporary, "scripts/valar-style.ts")
		);
		for (const name of ["cli", "parity"])
			fs.symlinkSync(
				path.join(root, "packages", name),
				path.join(temporary, "packages", name),
				"dir"
			);
		fs.mkdirSync(fixtureRegistry, { recursive: true });
		for (const directory of [
			"ui",
			"hooks",
			"lib",
			"styles",
			...sharedBlocks.map((block) => `blocks/${block}`),
		])
			fs.cpSync(path.join(registry, directory), path.join(fixtureRegistry, directory), {
				recursive: true,
			});
		fs.copyFileSync(path.join(registry, "themes.ts"), path.join(fixtureRegistry, "themes.ts"));
		fs.symlinkSync(
			path.join(root, "docs/node_modules"),
			path.join(temporary, "docs/node_modules"),
			"dir"
		);
		const helpers = path.join(temporary, "docs/src/lib/features/workbench");
		fs.mkdirSync(helpers, { recursive: true });
		fs.copyFileSync(
			path.join(root, "docs/src/lib/features/workbench/token-overrides.ts"),
			path.join(helpers, "token-overrides.ts")
		);
		const child = spawn(process.execPath, ["--import", "tsx", "scripts/build.ts", "--watch"], {
			cwd: fixtureUi,
			stdio: ["ignore", "pipe", "pipe"],
		});
		let log = "";
		child.stdout.on("data", (chunk) => {
			log += chunk;
		});
		child.stderr.on("data", (chunk) => {
			log += chunk;
		});
		async function until(check: () => boolean) {
			const deadline = Date.now() + 15_000;
			while (!check()) {
				assert.equal(child.exitCode, null, log);
				assert.ok(Date.now() < deadline, log);
				await new Promise((resolve) => setTimeout(resolve, 50));
			}
		}
		const read = (file: string) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "");
		try {
			const button = path.join(fixtureRegistry, "ui/button/button.svelte");
			const output = path.join(fixtureUi, "dist/valar/ui/button/button.svelte");
			await until(() => log.includes("outputs changed"));
			const original = read(button);
			fs.writeFileSync(
				button,
				original.replace('data-slot="button"', 'data-slot="button" data-live-probe="updated"')
			);
			await until(() => read(output).includes('data-live-probe="updated"'));
			const blockSource = path.join(fixtureRegistry, "blocks/new-issue-01/+page.svelte");
			const blockOutput = path.join(fixtureUi, "dist/valar/blocks/new-issue-01/+page.svelte");
			const originalBlock = read(blockSource);
			assert.ok(read(blockOutput));
			fs.writeFileSync(
				blockSource,
				originalBlock.replace("<section", '<section data-live-probe="block"')
			);
			await until(() => read(blockOutput).includes('data-live-probe="block"'));
			const style = path.join(fixtureRegistry, "styles/valar/style-valar.css");
			fs.appendFileSync(
				style,
				"\n.style-valar { .cn-button-size-default { @apply h-14 px-7; } }\n"
			);
			await until(
				() => /default: "[^"]*h-14/.test(read(output)) && /default: "[^"]*px-7/.test(read(output))
			);
			fs.writeFileSync(
				path.join(fixtureRegistry, "styles/valar/tokens.json"),
				JSON.stringify({ neutral: { light: { radius: "1rem" }, theme: { "text-sm": "1.125rem" } } })
			);
			const css = path.join(fixtureUi, "dist/valar/theme.css");
			await until(
				() => /--radius:\s*1rem/.test(read(css)) && /--text-sm:\s*1.125rem/.test(read(css))
			);
			const probe = path.join(fixtureRegistry, "ui/button/live-probe.ts");
			const generatedProbe = path.join(fixtureUi, "dist/valar/ui/button/live-probe.ts");
			fs.writeFileSync(probe, "export const probe = 1;\n");
			await until(() => fs.existsSync(generatedProbe));
			fs.rmSync(probe);
			await until(() => !fs.existsSync(generatedProbe));
			const working = read(output);
			fs.writeFileSync(button, '<script lang="ts">this is invalid Svelte</script>');
			await until(() => log.includes("Build failed;"));
			assert.equal(read(output), working);
			fs.writeFileSync(button, original);
			await until(() => !read(output).includes('data-live-probe="updated"'));
		} finally {
			if (child.exitCode === null && child.signalCode === null) {
				const stopped = new Promise((resolve) => child.once("exit", resolve));
				child.kill("SIGTERM");
				await stopped;
			}
			fs.rmSync(temporary, { recursive: true, force: true });
		}
	}
);
