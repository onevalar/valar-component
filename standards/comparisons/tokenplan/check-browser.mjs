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
		["failure", "light", "480", "ltr"],
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
			assert.ok(await target.getByRole("radio", { name: "Cost" }).isDisabled());
			assert.ok(await target.getByRole("button", { name: "Remove", exact: true }).isDisabled());
		} else if (scenario === "normal" && theme === "light") {
			const idle = target.getByRole("button", { name: "Remove", exact: true });
			const hit = await idle.boundingBox();
			const group = await target.locator('[data-slot="confirm-action"]').boundingBox();
			assert.ok(
				hit.height >= 44 && Math.abs(hit.width - group.width) < 2,
				`Full-width hit area: ${JSON.stringify({ hit, group })}`
			);
			const transparency = target.getByRole("slider", { name: "Transparency" });
			await transparency.focus();
			for (const [key, next] of [
				["ArrowRight", 65],
				["ArrowUp", 70],
				["ArrowLeft", 65],
				["ArrowDown", 60],
				["Shift+ArrowRight", 70],
				["Shift+ArrowLeft", 60],
				["PageUp", 70],
				["PageDown", 60],
				["Home", 20],
				["End", 100],
			]) {
				await transparency.press(key);
				assert.equal(await transparency.getAttribute("aria-valuenow"), String(next));
			}
			assert.ok(
				await transparency.evaluate((node) =>
					["altKey", "ctrlKey", "metaKey"].every((modifier) => {
						const event = new KeyboardEvent("keydown", {
							key: "ArrowLeft",
							[modifier]: true,
							bubbles: true,
							cancelable: true,
						});
						node.dispatchEvent(event);
						return !event.defaultPrevented && node.getAttribute("aria-valuenow") === "100";
					})
				)
			);
			for (const frame of [original, target]) {
				const reference = frame.getByRole("slider", { name: "Reference", exact: true });
				await reference.focus();
				await reference.press("ArrowRight");
				assert.equal(await reference.getAttribute("aria-valuenow"), "66");
				await frame.getByLabel("External Value").fill("82");
				assert.equal(await reference.getAttribute("aria-valuenow"), "82");
				await frame.getByText("Cost", { exact: true }).click();
				await frame.getByText("Cost", { exact: true }).click();
				assert.ok((await frame.locator("#events").textContent()).includes('selection: "cost"'));
				await frame.getByRole("button", { name: "Remove", exact: true }).click();
				assert.ok(
					await frame
						.getByRole("button", { name: "Yes", exact: true })
						.evaluate((node) => node === document.activeElement)
				);
				await frame.getByRole("button", { name: "Yes", exact: true }).press("Shift+Tab");
				assert.ok(
					await frame
						.getByRole("button", { name: "Cancel", exact: true })
						.evaluate((node) => node === document.activeElement)
				);
				await page.waitForTimeout(350);
				await frame.getByRole("button", { name: "Yes", exact: true }).click();
				if (frame === target) {
					const spinner = frame.locator('[data-slot="spinner"]');
					await spinner.waitFor();
					assert.equal(
						await spinner.evaluate((node) => getComputedStyle(node).animationName),
						"none"
					);
					assert.equal(await frame.getByRole("status").textContent(), "Removing…");
				}
				await frame.getByRole("button", { name: "Undo", exact: true }).waitFor();
				await frame.getByRole("button", { name: "Undo", exact: true }).click();
				await frame.getByRole("button", { name: "Remove", exact: true }).waitFor();
			}
		} else if (scenario === "failure") {
			for (const frame of [original, target]) {
				await frame.getByRole("button", { name: "Remove", exact: true }).click();
				await page.waitForTimeout(350);
				await frame.getByRole("button", { name: "Yes", exact: true }).click();
				await frame.getByRole("button", { name: "Retry", exact: true }).waitFor();
				assert.ok((await frame.locator("#events").textContent()).includes('state: "error"'));
				await frame.getByRole("button", { name: "Retry", exact: true }).press("Escape");
				await frame.getByRole("button", { name: "Remove", exact: true }).waitFor();
			}
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
			"Real original and target mounts, five canvas textures, clamped meter ARIA with overflow valueText, 60 independent SVG ticks, boundary/disabled states, external updates, selection, scalar all-arrow/Shift/Page/Home/End keys and modifier pass-through, fullWidth idle >=44px hit area, Confirm-first/Shift+Tab Cancel focus, stopped reduced-motion pending Spinner, async success/undo/failure/Escape. No pixel-equivalence or screen-reader claim.",
	};
	await writeFile(`${artifacts}/tokenplan-browser.json`, `${JSON.stringify(report, null, 2)}\n`);
	console.log(JSON.stringify(report, null, 2));
} finally {
	await browser.close();
}
