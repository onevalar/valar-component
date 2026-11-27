import assert from "node:assert/strict";
import path from "node:path";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";
import { DEFAULT_PRESET_CONFIG, encodePreset } from "@valar/svelte-cli/preset";

const docs = fileURLToPath(new URL("..", import.meta.url));
const root = path.resolve(docs, "..");
// A number before the tarball filename must not be mistaken for its package version.
const temp = mkdtempSync(path.join(tmpdir(), "valar-consumer-2026-"));
const app = path.join(temp, "app");
const env = {
	...process.env,
	CI: "true",
	REGISTRY_URL: (process.env.REGISTRY_URL ?? "http://127.0.0.1:5186/registry").replace(/\/$/, ""),
};
function run(command: string, args: string[], cwd = app) {
	execFileSync(command, args, { cwd, env, stdio: "inherit", timeout: 120_000 });
}
let server: ReturnType<typeof spawn> | undefined;
try {
	const tarballs = ["@valar/svelte-cli", "@valar/svelte-primitives"].map((name) => {
		run("pnpm", ["--filter", name, "pack", "--pack-destination", temp], root);
		const prefix = `${name.slice(1).replace("/", "-")}-`;
		const file = readdirSync(temp).find((file) => file.startsWith(prefix) && file.endsWith(".tgz"));
		assert.ok(file, `No tarball produced for ${name}`);
		return path.join(temp, file);
	});
	run(
		path.join(root, "sv-addons/registry/node_modules/.bin/sv"),
		["create", app, "--types", "ts", "--template", "minimal", "--no-add-ons", "--no-install"],
		temp
	);
	const packagePath = path.join(app, "package.json");
	const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
	for (const dependency of [
		"svelte",
		"@sveltejs/kit",
		"@sveltejs/vite-plugin-svelte",
		"vite",
		"svelte-check",
		"typescript",
		"tailwindcss",
		"@tailwindcss/vite",
		"@internationalized/date",
	]) {
		pkg.devDependencies[dependency] = JSON.parse(
			readFileSync(path.join(docs, "node_modules", dependency, "package.json"), "utf8")
		).version;
	}
	pkg.devDependencies["bits-ui"] = "2.20.0";
	pkg.devDependencies["@types/node"] = JSON.parse(
		readFileSync(path.join(root, "node_modules/@types/node/package.json"), "utf8")
	).version;
	writeFileSync(packagePath, JSON.stringify(pkg));
	copyFileSync(
		path.join(docs, "e2e/fixtures/pnpm-workspace.yaml"),
		path.join(app, "pnpm-workspace.yaml")
	);
	mkdirSync(path.join(app, "patches"));
	for (const patch of ["bits-ui@2.20.0.patch", "svelte-toolbelt@0.10.6.patch"]) {
		copyFileSync(path.join(root, "patches", patch), path.join(app, "patches", patch));
	}
	for (const id of ["01", "02"]) {
		copyFileSync(
			path.join(docs, `static/avatars/${id}.png`),
			path.join(app, `static/avatar-${id}.png`)
		);
	}
	writeFileSync(path.join(app, "src/app.css"), '@import "tailwindcss";\n');
	writeFileSync(
		path.join(app, "src/routes/+layout.svelte"),
		'<script>import "../app.css"; let { children } = $props();</script>{@render children()}'
	);
	writeFileSync(
		path.join(app, "vite.config.ts"),
		'import { sveltekit } from "@sveltejs/kit/vite"; import adapter from "@sveltejs/adapter-auto"; import tailwindcss from "@tailwindcss/vite"; import { defineConfig } from "vite"; export default defineConfig({plugins: [tailwindcss(), sveltekit({adapter: adapter()})]});'
	);
	// Both packages are private. Questionnaire's declared dependency must stay on the tarball.
	run("pnpm", ["add", "-D", ...tarballs]);
	const cli = path.join(app, "node_modules/.bin/valar-svelte");
	run(cli, [
		"init",
		"--preset",
		encodePreset(DEFAULT_PRESET_CONFIG),
		"--css",
		"src/app.css",
		"--lib-alias",
		"$lib",
		"--components-alias",
		"$lib/components",
		"--utils-alias",
		"$lib/utils",
		"--hooks-alias",
		"$lib/hooks",
		"--ui-alias",
		"$lib/components/ui",
		"--reinstall",
		"--no-deps-install",
	]);
	// Inline tuner exports are version backups, not installable registry items. Use a real
	// registry item to exercise local JSON resolution relative to --cwd, not the caller.
	const itemUrl = new URL("styles/valar/questionnaire.json", `${env.REGISTRY_URL}/`);
	const itemResponse = await fetch(itemUrl);
	assert.ok(itemResponse.ok, `Failed to fetch ${itemUrl}: HTTP ${itemResponse.status}`);
	writeFileSync(path.join(app, "questionnaire.json"), await itemResponse.text());
	run(
		cli,
		[
			"add",
			"avatar",
			"number-field",
			"tags-input",
			"stepper",
			"slider",
			"questionnaire.json",
			"--cwd",
			app,
			"--yes",
		],
		temp
	);
	const { devDependencies } = JSON.parse(readFileSync(packagePath, "utf8"));
	for (const name of ["@valar/svelte-cli", "@valar/svelte-primitives"]) {
		assert.match(devDependencies[name], /^file:.*\.tgz$/, `${name} must use a local tarball`);
	}
	writeFileSync(
		path.join(app, "src/routes/+page.svelte"),
		readFileSync(path.join(docs, "e2e/fixtures/consumer.svelte"))
	);
	// Design rules travel with the installed components (indexed in AGENTS.md) and are enforced by `lint`.
	const agents = readFileSync(path.join(app, "AGENTS.md"), "utf8");
	assert.match(
		agents,
		/<!-- valar-svelte:rules:start -->[\s\S]*`button`（Button 设计规范）：`src\/lib\/components\/ui\/button\/RULES\.md`[\s\S]*<!-- valar-svelte:rules:end -->/
	);
	assert.ok(readFileSync(path.join(app, "src/lib/components/ui/button/RULES.md"), "utf8"));
	// The generated app CSS carries the global tokens; components opt in to motion tiers.
	const appCss = readFileSync(path.join(app, "src/app.css"), "utf8");
	assert.match(appCss, /--motion-duration-fast: 100ms;/);
	assert.match(appCss, /--border-width: 1px;/);
	assert.doesNotMatch(appCss, /--motion-duration-fast: var\(/);
	run(cli, ["lint"]);
	const violation = path.join(app, "src/routes/violation.svelte");
	writeFileSync(violation, '<p class="text-blue-500">x</p>');
	const lint = spawnSync(cli, ["lint"], { cwd: app, env, encoding: "utf8", timeout: 60_000 });
	assert.equal(lint.status, 1, lint.stderr);
	assert.match(lint.stdout, /violation\.svelte:1.*valar\/semantic-color/);
	rmSync(violation);
	copyFileSync(
		path.join(docs, "e2e/fixtures/consumer-types.ts"),
		path.join(app, "src/lib/consumer-types.ts")
	);
	writeFileSync(
		path.join(app, "tsconfig.json"),
		JSON.stringify({
			extends: "./.svelte-kit/tsconfig.json",
			compilerOptions: {
				allowJs: true,
				checkJs: true,
				esModuleInterop: true,
				resolveJsonModule: true,
				skipLibCheck: false,
				strict: true,
				moduleResolution: "bundler",
				types: ["node"],
			},
		})
	);
	run("pnpm", ["check"]);
	run("pnpm", ["build"]);
	server = spawn(
		process.execPath,
		[
			path.join(app, "node_modules/vite/bin/vite.js"),
			"preview",
			"--host",
			"127.0.0.1",
			"--port",
			"5199",
			"--strictPort",
		],
		{ cwd: app, env, stdio: "inherit" }
	);
	let ready = false;
	for (let attempt = 0; attempt < 80; attempt++) {
		try {
			ready = (await fetch("http://127.0.0.1:5199")).ok;
		} catch {
			/* Wait for the test server. */
		}
		if (ready) break;
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	assert.ok(ready, "consumer preview did not start");
	const browser = await chromium.launch({
		executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
	});
	try {
		const page = await browser.newPage();
		const pageErrors: Error[] = [];
		page.on("pageerror", (error) => pageErrors.push(error));
		await page.goto("http://127.0.0.1:5199", { waitUntil: "networkidle" });
		const avatarGroup = page.getByRole("group", { name: "Avatar source changes", exact: true });
		const avatar = avatarGroup.locator('[data-slot="avatar"]');
		const image = avatar.locator('[data-slot="avatar-image"]');
		const fallback = avatar.locator('[data-slot="avatar-fallback"]');
		const originalRoot = await avatar.elementHandle();
		const originalImage = await image.elementHandle();
		for (const [button, status] of [
			[null, "loaded"],
			["Break avatar", "error"],
			["Restore avatar", "loaded"],
			["Clear avatar", "error"],
			["Restore avatar", "loaded"],
		] as const) {
			if (button) await avatarGroup.getByRole("button", { name: button, exact: true }).click();
			await expect(avatar).toHaveAttribute("data-status", status);
			await expect(image).toHaveAttribute("data-status", status);
			await expect(fallback).toHaveAttribute("data-status", status);
			if (status === "loaded") {
				await expect(image).toBeVisible();
				await expect
					.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
					.toBeGreaterThan(0);
				await expect(fallback).toBeHidden();
			} else {
				await expect(image).toBeHidden();
				await expect(image).toHaveJSProperty("naturalWidth", 0);
				await expect(fallback).toBeVisible();
			}
			assert.equal(
				await avatar.evaluate((node, original) => node === original, originalRoot),
				true
			);
			assert.equal(
				await image.evaluate((node, original) => node === original, originalImage),
				true
			);
		}
		const amount = page.getByRole("spinbutton", { name: "Amount", exact: true });
		await amount.fill("1.2");
		await expect(amount).toHaveValue("1.2");
		await page.getByRole("button", { name: "Reset", exact: true }).click();
		await expect(amount).toHaveValue("0.3");
		await page.getByRole("button", { name: "Reset", exact: true }).click();
		await expect(amount).toHaveValue("0.3");
		await page.getByRole("textbox", { name: "Tags", exact: true }).fill("Valar");
		await page.getByRole("textbox", { name: "Tags", exact: true }).press("Enter");
		assert.equal(await page.locator("output").textContent(), "");
		await page.getByRole("textbox", { name: "Tags", exact: true }).press("Enter");
		await page.waitForFunction(() =>
			document.querySelector("output")?.textContent?.includes("Valar")
		);
		assert.deepEqual(JSON.parse((await page.locator("output").textContent())!), [
			["amount", "0.3"],
			["tags", "Svelte"],
			["tags", "Valar"],
		]);
		await expect(page.getByRole("slider", { name: "Volume", exact: true })).toHaveCount(1);
		const stepper = page.getByRole("group", { name: "Checkout", exact: true });
		await expect(stepper.getByRole("region", { name: "First", exact: true })).toBeVisible();
		await stepper.getByRole("button", { name: "Next", exact: true }).click();
		await expect(stepper.getByRole("region", { name: "Last", exact: true })).toBeVisible();
		const choice = page.getByRole("radio", { name: "Svelte", exact: true });
		await choice.check();
		await expect(choice).toBeChecked();
		// The fixture explicitly opts in to the motion tiers.
		assert.deepEqual(
			await page.locator("output").evaluate((node) => {
				const style = getComputedStyle(node);
				return [style.transitionDuration, style.transitionTimingFunction, style.borderTopWidth];
			}),
			["0.1s", "cubic-bezier(0.4, 0, 0.2, 1)", "1px"]
		);
		assert.deepEqual(pageErrors, []);
		console.log(
			"PASS independent CLI/primitives tarballs, named and local JSON registry installs, lint, strict check/build, same-instance Avatar, form/Slider/Stepper/Questionnaire and CSS tokens"
		);
	} finally {
		await browser.close();
	}
} finally {
	if (server && server.exitCode === null) {
		const exited = new Promise((resolve) => server!.once("exit", resolve));
		server.kill("SIGTERM");
		await exited;
	}
	rmSync(temp, { recursive: true, force: true });
}
