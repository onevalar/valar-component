import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(new URL("../../../docs/package.json", import.meta.url));
const { chromium } = require("@playwright/test");
assert.ok(
	process.env.TOKENPLAN_TEST_BROWSER,
	"Use the existing Chromium147, do not install browsers."
);
const directory = new URL("../../../.amp/in/artifacts/confirm-morph/", import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.TOKENPLAN_TEST_BROWSER });
const report = {
	browser: browser.version(),
	classification: "Independent Valar visual adaptation; NOT an equivalence pass",
	traces: [],
	checks: [],
	errors: [],
};
const url = process.env.TOKENPLAN_COMPARISON_URL ?? "http://127.0.0.1:5198";
const phases = [
	["idle-confirming", "open", "confirming"],
	["confirming-pending", "confirm", "pending"],
	["pending-done", "resolve", "done"],
	["done-undo-pending", "undo", "pending"],
	["undo-pending-idle", "undo-resolve", "idle"],
	["idle-confirming-again", "open", "confirming"],
	["confirming-pending-again", "confirm", "pending"],
	["pending-error", "reject", "error"],
	["error-retry-pending", "retry", "pending"],
	["retry-pending-done", "resolve", "done"],
	["done-idle", "escape", "idle"],
];
function movement(a, b) {
	if (a.visual.length !== b.visual.length) return true;
	return (
		["width", "height", "radius"].some((key) => Math.abs(a[key] - b[key]) > 0.2) ||
		a.visual.some((item, index) => {
			const other = b.visual[index];
			return (
				item.text !== other.text ||
				["x", "y", "width", "height"].some((key) => Math.abs(item[key] - other[key]) > 0.2) ||
				Math.abs(item.opacity - other.opacity) > 0.01 ||
				Math.abs(item.blur - other.blur) > 0.1
			);
		})
	);
}
try {
	for (const theme of ["light", "dark"])
		for (const reduced of [false, true])
			for (const compact of [true, false]) {
				const context = await browser.newContext({
					viewport: { width: 480, height: 1800 },
					reducedMotion: reduced ? "reduce" : "no-preference",
				});
				for (const side of ["original", "migrated"]) {
					const page = await context.newPage();
					page.on("pageerror", (e) => report.errors.push(`${side}: ${e.message}`));
					page.on("response", (response) => {
						if (response.status() >= 400 && !response.url().endsWith("favicon.ico"))
							report.errors.push(`${side}: ${response.status()} ${response.url()}`);
					});
					await page.goto(
						`${url}/${side}.html?manual=1&compact=${compact ? "1" : "0"}&theme=${theme}&motion=${reduced ? "reduce" : "normal"}`
					);
					await page.locator('body[data-ready="ready"]').waitFor();
					const selector =
						side === "migrated" ? '[data-slot="confirm-action"]' : '[data-mode="press"]';
					const root = page.locator(selector);
					await root.scrollIntoViewIfNeeded();
					for (const [name, command, state] of phases) {
						const capture = theme === "light" && !reduced && compact && name === "idle-confirming";
						const prefix = `${side}-${theme}-${compact ? "compact" : "full"}-${reduced ? "reduce" : "normal"}-${name}`;
						const before = await root.boundingBox();
						const clip = { x: 0, y: Math.max(0, before.y - 15), width: 480, height: 130 };
						if (capture)
							await page.screenshot({
								path: fileURLToPath(new URL(prefix + "-start.png", directory)),
								clip,
							});
						await page.evaluate(
							({ selector, command }) => {
								const root = document.querySelector(selector);
								const samples = [],
									started = performance.now();
								const statuses = [];
								const status = root.querySelector('[role="status"]');
								const observer = new MutationObserver(() => statuses.push(status.textContent));
								observer.observe(status, { subtree: true, childList: true, characterData: true });
								function read(t) {
									const rect = root.getBoundingClientRect(),
										css = getComputedStyle(root);
									const visual = [...root.querySelectorAll("button,span,[data-face]")]
										.filter((node) => node.textContent.trim() && !node.closest('[role="status"]'))
										.map((node) => {
											const bounds = node.getBoundingClientRect(),
												style = getComputedStyle(node);
											let opacity = 1;
											for (
												let ancestor = node;
												ancestor && ancestor !== root;
												ancestor = ancestor.parentElement
											)
												opacity *= Number(getComputedStyle(ancestor).opacity);
											return {
												text: node.textContent.trim(),
												x: bounds.x - rect.x,
												y: bounds.y - rect.y,
												width: bounds.width,
												height: bounds.height,
												opacity,
												blur: Number(style.filter.match(/blur\(([.\d]+)px\)/)?.[1] ?? 0),
											};
										});
									const active = document.activeElement;
									return {
										t,
										width: rect.width,
										height: rect.height,
										radius: Math.min(
											parseFloat(css.borderTopLeftRadius) || 0,
											rect.width / 2,
											rect.height / 2
										),
										visual,
										state: root.dataset.state,
										active: active === root ? "root" : active.textContent.trim(),
										focusConnected: active.isConnected,
										focusHidden: !!active.closest('[aria-hidden="true"],[inert]'),
										statusCount: root.querySelectorAll('[role="status"]').length,
										morphing: root.hasAttribute("data-morphing"),
										ghost: !!root.querySelector("[data-morph-ghost]"),
										contentOpacity: root.querySelector('[data-slot="confirm-action-content"]')
											? Number(
													getComputedStyle(
														root.querySelector('[data-slot="confirm-action-content"]')
													).opacity
												)
											: null,
									};
								}
								samples.push(read(0));
								window.confirmTrace = { samples, statuses, done: false };
								const tick = () => {
									samples.push(read(performance.now() - started));
									if (performance.now() - started < 900) requestAnimationFrame(tick);
									else {
										observer.disconnect();
										window.confirmTrace.done = true;
									}
								};
								requestAnimationFrame(tick);
								const click = (label) =>
									[...root.querySelectorAll("button")]
										.find((node) => node.textContent.trim() === label)
										?.click();
								if (command === "open") click("Remove");
								else if (command === "confirm") click("Yes");
								else if (command === "undo") click("Undo");
								else if (command === "retry") click("Retry");
								else if (command === "escape")
									root.dispatchEvent(
										new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
									);
								else
									window.dispatchEvent(
										new CustomEvent(command === "undo-resolve" ? "undo-finish" : "confirm-finish", {
											detail: { ok: command !== "reject" },
										})
									);
							},
							{ selector, command }
						);
						if (capture) {
							await page.waitForTimeout(45);
							await page.screenshot({
								path: fileURLToPath(new URL(prefix + "-intermediate.png", directory)),
								clip,
							});
						}
						await page.waitForFunction(() => window.confirmTrace.done);
						const trace = await page.evaluate(() => window.confirmTrace);
						const final = trace.samples.at(-1);
						assert.equal(final.state, state, `${prefix} state`);
						report.traces.push({ side, theme, reduced, compact, name, ...trace });
						let lastChange = 0;
						for (let i = 1; i < trace.samples.length; i++)
							if (movement(trace.samples[i - 1], trace.samples[i])) lastChange = trace.samples[i].t;
						assert.ok(final.t - lastChange >= 150, `${prefix} did not settle in capture window`);
						if (side === "migrated") {
							assert.ok(
								trace.samples.every(
									(row) => row.statusCount === 1 && row.focusConnected && !row.focusHidden
								)
							);
							assert.ok(
								trace.samples.slice(1).every((row) => row.state === state),
								`${prefix} state must update on the first paint, not after the morph`
							);
							const expectedFocus =
								state === "confirming"
									? "Yes"
									: state === "done"
										? "Undo"
										: state === "error"
											? "Retry"
											: state === "idle"
												? "Remove"
												: "root";
							assert.ok(
								trace.samples.slice(1).every((row) => row.active === expectedFocus),
								`${prefix} expected focus before/during/after the morph`
							);
							if (reduced)
								assert.ok(
									trace.samples
										.slice(1)
										.every((row) => !row.morphing && !row.ghost && row.contentOpacity === 1)
								);
							else {
								assert.ok(
									trace.samples.some((row) => row.morphing && row.ghost),
									`${prefix} no native morph`
								);
								assert.ok(
									trace.samples.some(
										(row) => row.contentOpacity > 0.4 && row.contentOpacity < 0.99
									),
									`${prefix} no visible content transition`
								);
								const shapeChanges = ["width", "height", "radius"].some(
									(key) => Math.abs(trace.samples[0][key] - final[key]) > 0.4
								);
								if (shapeChanges)
									assert.ok(
										trace.samples.some(
											(row) =>
												row.t > 0 &&
												row.t < 120 &&
												["width", "height", "radius"].some(
													(key) =>
														Math.abs(row[key] - trace.samples[0][key]) > 0.2 &&
														Math.abs(row[key] - final[key]) > 0.2
												)
										),
										`${prefix} no visible intermediate geometry`
									);
							}
							assert.ok(
								trace.statuses.length <= 1,
								`${prefix} duplicate live announcement ${trace.statuses}`
							);
						}
						if (capture)
							await page.screenshot({
								path: fileURLToPath(new URL(prefix + "-end.png", directory)),
								clip,
							});
						report.traces.at(-1).observedMs = Math.round(lastChange);
						console.log(
							`${side} ${theme} ${compact ? "compact" : "full"} reduced=${reduced} ${name}: ${Math.round(lastChange)}ms`
						);
					}
					assert.equal(
						(await page.locator("#events").textContent()).split('operation: "confirm"').length - 1,
						3
					);
					assert.equal(
						(await page.locator("#events").textContent()).split('operation: "undo"').length - 1,
						1
					);
					await page.close();
				}
				await context.close();
			}
	// Fast real keyboard/pointer input while the envelope is still moving; no action awaits it.
	for (const theme of ["light", "dark"])
		for (const compact of [true, false]) {
			const page = await browser.newPage({
				viewport: { width: 480, height: 1800 },
				reducedMotion: "no-preference",
			});
			page.on("pageerror", (e) => report.errors.push(e.message));
			await page.goto(
				`${url}/migrated.html?manual=1&theme=${theme}&compact=${compact ? "1" : "0"}`
			);
			await page.locator('body[data-ready="ready"]').waitFor();
			const root = page.locator('[data-slot="confirm-action"]');
			await root.scrollIntoViewIfNeeded();
			await root.getByRole("button", { name: "Remove", exact: true }).click();
			assert.equal(await root.getAttribute("data-state"), "confirming");
			assert.ok(await root.evaluate((node) => node.hasAttribute("data-morphing")));
			assert.ok(
				await root
					.getByRole("button", { name: "Yes", exact: true })
					.evaluate((node) => node === document.activeElement)
			);
			await page.keyboard.press("Shift+Tab");
			const cancel = root.getByRole("button", { name: "Cancel", exact: true });
			assert.ok(await cancel.evaluate((node) => node === document.activeElement));
			const point = await cancel.boundingBox();
			await page.mouse.click(point.x + point.width / 2, point.y + point.height / 2);
			assert.equal(await root.getAttribute("data-state"), "idle");
			assert.ok(
				await root
					.getByRole("button", { name: "Remove", exact: true })
					.evaluate((node) => node === document.activeElement)
			);
			await page.waitForTimeout(180);
			assert.equal(await root.locator('[role="status"]').count(), 1);
			assert.equal(await root.locator("[data-morph-ghost]").count(), 0);
			// Switch the actual browser preference during another transition, then inspect the first direct frame.
			await root.getByRole("button", { name: "Remove", exact: true }).click();
			assert.ok(await root.evaluate((node) => node.hasAttribute("data-morphing")));
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.waitForFunction(
				() => !document.querySelector('[data-slot="confirm-action"]').hasAttribute("data-morphing")
			);
			const direct = await root.evaluate((node) => ({
				width: node.getBoundingClientRect().width,
				height: node.getBoundingClientRect().height,
				morphAnimations: node.getAnimations({ subtree: true }).filter((animation) => {
					const target = animation.effect.target;
					return (
						target === node ||
						target.matches('[data-slot="confirm-action-content"],[data-morph-ghost]')
					);
				}).length,
				otherAnimations: node
					.getAnimations({ subtree: true })
					.filter((animation) => animation instanceof CSSTransition)
					.map((animation) => ({
						property: animation.transitionProperty,
						target: animation.effect.target.tagName,
					})),
				opacity: getComputedStyle(node.querySelector('[data-slot="confirm-action-content"]'))
					.opacity,
			}));
			assert.equal(direct.morphAnimations, 0);
			assert.equal(direct.opacity, "1");
			assert.ok(
				await root
					.getByRole("button", { name: "Yes", exact: true })
					.evaluate((node) => node === document.activeElement)
			);
			await page.waitForTimeout(180);
			const settled = await root.boundingBox();
			assert.ok(
				Math.abs(direct.width - settled.width) < 0.1 &&
					Math.abs(direct.height - settled.height) < 0.1
			);
			report.checks.push({
				kind: "target immediate interruption/live reduced motion",
				theme,
				compact,
				direct,
				result: "pass",
			});
			await page.close();
		}
	for (const target of report.traces.filter((row) => row.side === "migrated" && !row.reduced)) {
		const source = report.traces.find(
			(row) =>
				row.side === "original" &&
				row.theme === target.theme &&
				row.compact === target.compact &&
				row.name === target.name &&
				!row.reduced
		);
		assert.ok(
			target.observedMs <= source.observedMs,
			`Target slower: ${JSON.stringify({ name: target.name, source: source.observedMs, target: target.observedMs })}`
		);
		report.checks.push({
			theme: target.theme,
			compact: target.compact,
			name: target.name,
			sourceMs: source.observedMs,
			targetMs: target.observedMs,
			result: "intentional-adaptation timing budget passed; not equivalence",
		});
	}
	assert.deepEqual(report.errors, []);
} finally {
	await writeFile(new URL("timings.json", directory), JSON.stringify(report, null, 2) + "\n");
	await browser.close();
}
