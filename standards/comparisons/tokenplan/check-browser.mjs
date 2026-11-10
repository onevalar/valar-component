import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(new URL("../../../docs/package.json", import.meta.url));
const { chromium } = require("@playwright/test");
const executablePath = process.env.TOKENPLAN_TEST_BROWSER;
assert.ok(
	executablePath,
	"Set TOKENPLAN_TEST_BROWSER to the existing Chromium executable; do not install a browser."
);
const artifacts = fileURLToPath(new URL("../../../.amp/in/artifacts/", import.meta.url));
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({
	viewport: { width: 1600, height: 1800 },
	reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
	if (response.status() >= 400 && !response.url().endsWith("favicon.ico"))
		errors.push(`${response.status()} ${response.url()}`);
});
const results = [];
try {
	await page.goto(process.env.TOKENPLAN_COMPARISON_URL ?? "http://127.0.0.1:5198/");
	const cases = [
		["normal", "light", "480", "ltr"],
		["normal", "dark", "720", "ltr"],
		["zero", "light", "320", "ltr"],
		["overflow", "dark", "320", "rtl"],
		["missing", "light", "480", "ltr"],
		["disabled", "dark", "320", "ltr"],
	];
	for (const [scenario, theme, width, direction] of cases) {
		for (const [id, value] of Object.entries({ scenario, theme, width, direction }))
			await page.locator(`#${id}`).selectOption(value);
		await page.locator("#reset").click();
		await page.waitForFunction(() =>
			[...document.querySelectorAll("iframe")].every(
				(frame) =>
					frame.contentDocument?.body.dataset.ready === "ready" &&
					frame.contentWindow.location.search === new URL(frame.src).search
			)
		);
		await page
			.locator("#status")
			.filter({ hasText: "Original: ready · Migrated: ready" })
			.waitFor();
		const original = page.frame({ url: /original\.html/ });
		const target = page.frame({ url: /migrated\.html/ });
		assert.ok(original && target);
		const value = scenario === "zero" ? 0 : scenario === "overflow" ? 125 : 65;
		for (const frame of [original, target]) {
			const meter = frame.getByRole("meter").first();
			assert.equal(await meter.getAttribute("aria-valuenow"), String(Math.min(100, value)));
			assert.equal(await meter.getAttribute("aria-valuetext"), `${value}%`);
			assert.equal(await frame.locator("canvas").count(), 5);
			assert.ok(
				await frame.locator("canvas").evaluateAll(
					(nodes, value) =>
						nodes.every(
							(canvas) =>
								canvas.width > 0 &&
								canvas.height > 0 &&
								(value === 0 ||
									canvas
										.getContext("2d")
										.getImageData(0, 0, canvas.width, canvas.height)
										.data.some((n) => n > 0))
						),
					value
				)
			);
		}
		const tick = target.locator('[data-slot="tick-meter"]');
		assert.equal(await tick.locator("line").count(), 60);
		assert.equal(await tick.getAttribute("aria-valuenow"), String(Math.min(100, value)));
		assert.equal(await tick.getAttribute("aria-valuetext"), `${value}%`);
		assert.equal(
			await target.locator('[data-slot="waffle-chart"] [data-category]').count(),
			scenario === "missing" ? 0 : 100
		);
		assert.equal(
			await target.locator('[data-slot="gauge-arc"][data-missing="true"]').count(),
			scenario === "missing" ? 1 : 0
		);
		if (scenario === "disabled") {
			assert.ok(await target.getByRole("tab", { name: "Cost" }).isDisabled());
		} else if (scenario === "normal" && theme === "light") {
			for (const frame of [original, target]) {
				const reference = frame.getByRole("slider", { name: "Reference", exact: true });
				await reference.focus();
				await reference.press("ArrowRight");
				assert.equal(await reference.getAttribute("aria-valuenow"), "66");
				await frame.getByLabel("External Value").fill("82");
				assert.equal(await reference.getAttribute("aria-valuenow"), "82");
			}
			const cost = target.getByRole("tab", { name: "Cost", exact: true });
			await cost.click();
			assert.equal(await cost.getAttribute("aria-selected"), "true");
		}
		if (scenario === "overflow" || (scenario === "normal" && theme === "light")) {
			for (const frame of [original, target]) await frame.evaluate(() => window.scrollTo(0, 0));
			await page.screenshot({
				path: `${artifacts}/tokenplan-${scenario}-${theme}.png`,
				fullPage: true,
			});
		}
		results.push({ scenario, theme, width, direction, result: "pass" });
	}
	assert.deepEqual(errors, []);
	const report = {
		browser: browser.version(),
		checks: results,
		errors,
		scope:
			"Original and target graphics, textures, ruler keyboard and external updates, independent tick meter, and native target Tabs selection.",
	};
	await writeFile(`${artifacts}/tokenplan-browser.json`, `${JSON.stringify(report, null, 2)}\n`);
	console.log(JSON.stringify(report, null, 2));
} finally {
	await browser.close();
}
