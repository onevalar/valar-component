import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(new URL("../../../docs/package.json", import.meta.url));
const { chromium, webkit } = require("@playwright/test");
assert.ok(process.env.TOKENPLAN_TEST_BROWSER);
const url = process.env.TOKENPLAN_COMPARISON_URL ?? "http://127.0.0.1:5198";
const report = { checks: [], sourceIssues: [], errors: [] };
for (const [engine, launch] of [
	[chromium, { executablePath: process.env.TOKENPLAN_TEST_BROWSER }],
	[
		webkit,
		{
			executablePath:
				process.env.TOKENPLAN_TEST_WEBKIT ??
				`${process.env.HOME}/Library/Caches/ms-playwright/webkit-2370/pw_run.sh`,
		},
	],
]) {
	const browser = await engine.launch(launch);
	try {
		for (const theme of ["light", "dark"])
			for (const reduced of [false, true]) {
				const context = await browser.newContext({
					viewport: { width: 480, height: 1800 },
					reducedMotion: reduced ? "reduce" : "no-preference",
				});
				for (const side of ["original", "migrated"]) {
					console.log(`Checking ${engine.name()} ${side} ${theme} reduced=${reduced}`);
					const page = await context.newPage();
					page.on("pageerror", (e) => report.errors.push(`${side}: ${e.message}`));
					page.on("response", (r) => {
						if (r.status() >= 400 && !r.url().endsWith("favicon.ico"))
							report.errors.push(`${side}: ${r.status()} ${r.url()}`);
					});
					await page.goto(
						`${url}/${side}.html?manual=1&theme=${theme}&confirmMode=hold&motion=${reduced ? "reduce" : "no-preference"}`
					);
					await page.locator('body[data-ready="ready"]').waitFor();
					const start = page.getByRole("region", { name: "Focus Start" });
					const close = page.getByRole("button", { name: "Close Fixture", exact: true });
					if (engine.name() === "webkit" && side === "migrated") {
						await close.evaluate((node) => node.removeAttribute("tabindex"));
						await start.focus();
						await page.keyboard.press("Tab");
						assert.ok(await close.evaluate((node) => node !== document.activeElement));
						await start.focus();
						await close.click();
						assert.ok(await close.evaluate((node) => node !== document.activeElement));
						await close.evaluate((node) => node.setAttribute("tabindex", "0"));
					}
					await start.focus();
					await page.keyboard.press("Tab");
					assert.ok(await close.evaluate((n) => n === document.activeElement));
					await page.keyboard.press("Tab");
					assert.ok(
						await page
							.getByRole("button", { name: "Next Fixture", exact: true })
							.evaluate((n) => n === document.activeElement)
					);
					await start.focus();
					await close.click();
					assert.ok(await close.evaluate((n) => n === document.activeElement));
					const idle = page.getByRole("button", { name: "Remove", exact: true });
					const hit = await idle.boundingBox();
					const root =
						side === "migrated"
							? page.locator('[data-slot="confirm-action"]')
							: page.locator('[data-mode="hold"]');
					const zone = await root.boundingBox();
					assert.ok(
						Math.abs(zone.width - hit.width) < 2 && hit.height >= 44,
						JSON.stringify({ side, zone, hit })
					);
					await idle.click();
					const yes = page.getByRole("button", { name: "Yes", exact: true });
					await yes.waitFor();
					assert.ok(await yes.evaluate((n) => n === document.activeElement));
					await page.keyboard.press("Shift+Tab");
					const cancelFocused = await page
						.getByRole("button", { name: "Cancel", exact: true })
						.evaluate((n) => n === document.activeElement);
					if (!cancelFocused && side === "original" && engine.name() === "webkit")
						report.sourceIssues.push({
							engine: "webkit",
							theme,
							reduced,
							name: "Original ConfirmMorph native Cancel lacks explicit tabindex and is skipped by macOS WebKit Tab preference; migrated Cancel remains reachable",
						});
					else assert.ok(cancelFocused);
					await yes.focus();
					await page.waitForTimeout(350);
					await page.keyboard.down("Space");
					await page.waitForTimeout(300);
					await page.keyboard.up("Space");
					await page.waitForTimeout(600);
					assert.ok(await yes.isVisible());
					assert.ok(!(await page.locator("#events").textContent()).includes('state: "pending"'));
					await page.keyboard.down("Space");
					await page.waitForFunction(() =>
						document.querySelector("#events").textContent.includes('state: "pending"')
					);
					const busy = await root.getAttribute("aria-busy");
					assert.equal(busy, "true");
					let animation;
					if (side === "migrated") {
						const spinner = page.locator('[data-slot="spinner"]');
						await spinner.waitFor();
						animation = await spinner.evaluate((n) => getComputedStyle(n).animationName);
						assert.ok(reduced ? animation === "none" : animation !== "none");
						assert.equal(await page.getByRole("status").textContent(), "Removing…");
					}
					await page.keyboard.up("Space");
					assert.equal(
						(await page.locator("#events").textContent()).split('operation: "confirm"').length - 1,
						1
					);
					await page.evaluate(() =>
						window.dispatchEvent(new CustomEvent("confirm-finish", { detail: { ok: true } }))
					);
					await page.getByRole("button", { name: "Undo", exact: true }).waitFor();
					assert.equal(
						(await page.locator("#events").textContent()).split('state: "pending"').length - 1,
						1
					);
					await page.getByRole("button", { name: "Undo", exact: true }).click();
					await page.waitForFunction(() =>
						document.querySelector("#events").textContent.includes('operation: "undo"')
					);
					await page.evaluate(() =>
						window.dispatchEvent(new CustomEvent("undo-finish", { detail: { ok: true } }))
					);
					await idle.waitFor();
					report.checks.push({
						engine: engine.name(),
						version: browser.version(),
						theme,
						reduced,
						side,
						hit,
						zone,
						spinnerAnimation: animation,
						result: "pass",
					});
					await page.close();
				}
				await context.close();
			}
	} finally {
		await browser.close();
	}
}
assert.deepEqual(report.errors, []);
const directory = new URL("../../../.amp/in/artifacts/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(
	new URL("confirm-focus-browser.json", directory),
	JSON.stringify(report, null, 2) + "\n"
);
console.log(JSON.stringify(report, null, 2));
