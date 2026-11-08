import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(new URL("../../../docs/package.json", import.meta.url));
const { chromium } = require("@playwright/test");
assert.ok(
	process.env.TOKENPLAN_TEST_BROWSER,
	"Use the installed Chromium 147; no browser download."
);
const browser = await chromium.launch({
	executablePath: process.env.TOKENPLAN_TEST_BROWSER,
	headless: true,
});
const artifacts = new URL("../../../.amp/in/artifacts/", import.meta.url);
await mkdir(artifacts, { recursive: true });
const report = { browser: browser.version(), checks: [], sourceIssues: [], errors: [] };
const url = process.env.TOKENPLAN_COMPARISON_URL ?? "http://127.0.0.1:5198";
const slider = (page) => page.getByRole("slider", { name: "Reference", exact: true });
async function state(page) {
	return slider(page).evaluate((node) => {
		const tape =
			node.querySelector('[data-slot="ruler-slider-tape"]') ??
			node.firstElementChild.firstElementChild;
		const transform = getComputedStyle(tape).transform;
		return {
			value: Number(node.getAttribute("aria-valuenow")),
			x: transform === "none" ? 0 : new DOMMatrix(transform).m41,
			events: document.querySelector("#events").textContent.trim().split("\n").filter(Boolean),
		};
	});
}
const commits = (result) => result.events.filter((row) => row.startsWith("commit:"));
async function reset(page, value = 400) {
	await page.getByLabel("External Value").fill(String(value));
	await page.waitForTimeout(850);
	await page.locator("#events").evaluate((node) => (node.textContent = ""));
}
async function down(page, relative = 0) {
	const node = slider(page);
	await node.scrollIntoViewIfNeeded();
	const box = await node.boundingBox();
	await node.evaluate((node) =>
		node.addEventListener(
			"pointerdown",
			(event) => {
				window.rulerDown = {
					x: event.clientX,
					y: event.clientY,
					t: event.timeStamp,
					id: event.pointerId,
				};
			},
			{ capture: true, once: true }
		)
	);
	await page.mouse.move(box.x + box.width / 2 + relative, box.y + 20);
	await page.mouse.down();
}
async function pointer(page, type, dx, time) {
	await slider(page).evaluate(
		(node, { type, dx, time }) => {
			const base = window.rulerDown;
			const event = new PointerEvent(type, {
				pointerId: base.id,
				isPrimary: true,
				clientX: base.x + dx,
				clientY: base.y,
				button: 0,
				buttons: type === "pointermove" ? 1 : 0,
				bubbles: true,
			});
			Object.defineProperty(event, "timeStamp", { value: base.t + time });
			node.dispatchEvent(event);
		},
		{ type, dx, time }
	);
	await page.waitForTimeout(20); // each framework commits its public props before observation
}
async function wheel(page, x, y = 0) {
	return slider(page).evaluate(
		(node, { x, y }) => {
			const event = new WheelEvent("wheel", {
				deltaX: x,
				deltaY: y,
				bubbles: true,
				cancelable: true,
			});
			node.dispatchEvent(event);
			return event.defaultPrevented;
		},
		{ x, y }
	);
}
try {
	for (const reduced of [false, true]) {
		const context = await browser.newContext({
			viewport: { width: 480, height: 1800 },
			reducedMotion: reduced ? "reduce" : "no-preference",
		});
		const pages = await Promise.all(
			["original", "migrated"].map(async (side) => {
				const page = await context.newPage();
				page.on("pageerror", (error) => report.errors.push(`${side}: ${error.message}`));
				page.on("response", (response) => {
					if (response.status() >= 400 && !response.url().endsWith("favicon.ico"))
						report.errors.push(`${side}: ${response.status()} ${response.url()}`);
				});
				await page.goto(
					`${url}/${side}.html?seed=400&max=2000&spacing=2&majorEvery=50&motion=${reduced ? "reduce" : "no-preference"}`
				);
				await page.locator('body[data-ready="ready"]').waitFor();
				return page;
			})
		);
		async function check(name, exercise, compare, kind = "equivalence") {
			const results = [];
			for (const page of pages) {
				await reset(page);
				results.push(await exercise(page));
			}
			compare(results[0], results[1]);
			report.checks.push({
				name,
				reduced,
				kind,
				original: results[0],
				migrated: results[1],
				result: "pass",
			});
			console.log(`PASS ${name} reduced=${reduced}`);
		}
		await check(
			"spacing-scaled slow drag",
			async (page) => {
				await down(page);
				await pointer(page, "pointermove", -40, 100);
				const during = await state(page);
				assert.equal(during.value, 420);
				assert.deepEqual(commits(during), []);
				await pointer(page, "pointerup", -40, 200);
				await page.mouse.up();
				await page.waitForTimeout(700);
				return { during, final: await state(page) };
			},
			(a, b) => {
				assert.deepEqual(a.final.events, b.final.events);
				assert.equal(b.during.x, a.during.x);
				assert.equal(b.final.x, -840);
			}
		);
		await check(
			"tap target and spring",
			async (page) => {
				await down(page, 24);
				await page.mouse.up();
				await page.waitForTimeout(25);
				const during = await state(page);
				assert.equal(during.value, 412);
				assert.deepEqual(commits(during), ["commit: 412"]);
				if (!reduced) assert.ok(during.x > -824 && during.x < -800);
				await page.waitForTimeout(700);
				return { during, final: await state(page) };
			},
			(a, b) => {
				assert.deepEqual(a.final.events, b.final.events);
				assert.equal(b.final.x, a.final.x);
			}
		);
		await check(
			"sampled flick and delayed settle commit",
			async (page) => {
				await down(page);
				await pointer(page, "pointermove", -8, 40);
				await pointer(page, "pointermove", -16, 80);
				await pointer(page, "pointerup", -16, 80);
				await page.mouse.up();
				const released = await state(page);
				if (!reduced) assert.deepEqual(commits(released), []);
				await page.waitForTimeout(200);
				const coast = await state(page);
				if (!reduced) assert.ok(coast.value > 408);
				await page.waitForTimeout(2600);
				const final = await state(page);
				assert.deepEqual(commits(final), [`commit: ${reduced ? 408 : 450}`]);
				return { released, coast, final };
			},
			(a, b) => {
				assert.equal(a.final.value, b.final.value);
				assert.equal(a.final.x, b.final.x);
			}
		);
		for (const end of ["pointercancel", "lostpointercapture"])
			await check(
				`elastic boundary ${end}`,
				async (page) => {
					await reset(page, 0);
					await down(page);
					await pointer(page, "pointermove", 100, 80);
					const during = await state(page);
					assert.equal(during.value, 0);
					assert.ok(reduced ? during.x === 0 : during.x > 0 && during.x < 44);
					await pointer(page, end, 100, 80);
					await page.mouse.up();
					const released = await state(page);
					if (!reduced) assert.deepEqual(commits(released), []);
					await page.waitForTimeout(1500);
					return { during, final: await state(page) };
				},
				(a, b) => {
					assert.ok(Math.abs(a.during.x - b.during.x) < 0.001);
					assert.deepEqual(a.final.events, b.final.events);
					assert.equal(b.final.x, 0);
				}
			);
		await check(
			"horizontal wheel debounce and vertical pass-through",
			async (page) => {
				assert.equal(await wheel(page, 1, 30), false);
				assert.equal(await wheel(page, 10, 10), false);
				assert.equal((await state(page)).value, 400);
				assert.equal(await wheel(page, 7, 1), true);
				await page.waitForTimeout(50);
				await wheel(page, 7);
				await page.waitForTimeout(30);
				const during = await state(page);
				assert.deepEqual(commits(during), []);
				await page.waitForTimeout(600);
				return { during, final: await state(page) };
			},
			(a, b) => {
				assert.deepEqual(a.final.events, b.final.events);
				assert.equal(b.final.value, 407);
				assert.equal(b.final.x, a.final.x);
			}
		);
		await check(
			"external retarget interrupts coast without stale commit",
			async (page) => {
				await down(page);
				await pointer(page, "pointermove", -16, 80);
				await pointer(page, "pointerup", -16, 80);
				await page.mouse.up();
				await page.waitForTimeout(60);
				const released = await state(page);
				await page.waitForTimeout(40);
				const beforeReset = await state(page);
				if (!reduced) {
					assert.ok(beforeReset.x < released.x, "Reset must interrupt an actually moving tape");
					assert.deepEqual(commits(beforeReset), [], "Coast must not have committed before reset");
				}
				await page.getByRole("button", { name: "Reset Reference To 600" }).click();
				await page.waitForTimeout(2600);
				const final = await state(page);
				const resetIndex = final.events.indexOf("reset: 600");
				assert.ok(resetIndex >= 0, "Record the external reset before its prop update");
				return { released, beforeReset, final, afterReset: final.events.slice(resetIndex + 1) };
			},
			(a, b) => {
				assert.equal(b.final.value, 600);
				assert.equal(b.final.x, -1200);
				assert.deepEqual(
					b.afterReset,
					[],
					"No stale value or commit may follow the external reset"
				);
				assert.deepEqual(commits(b.final), reduced ? ["commit: 408"] : []);
				if (a.final.value !== 600)
					report.sourceIssues.push({
						reduced,
						name: "Source external reset during coast is overwritten by a final Motion update while stopping; native target honors 600",
						original: a,
						migrated: b,
					});
			},
			reduced ? "equivalence" : "intentional-deviation"
		);
		await check(
			"all arrows Shift Page Home End",
			async (page) => {
				const values = [];
				for (const key of [
					"ArrowRight",
					"ArrowUp",
					"ArrowLeft",
					"ArrowDown",
					"Shift+ArrowRight",
					"Shift+ArrowLeft",
					"PageUp",
					"PageDown",
					"Home",
					"End",
				]) {
					await slider(page).press(key);
					values.push((await state(page)).value);
				}
				await page.waitForTimeout(800);
				return { values, final: await state(page) };
			},
			(a, b) => {
				assert.deepEqual(a.values, b.values);
				assert.deepEqual(a.final.events, b.final.events);
			}
		);
		await check(
			"real mouse drag and browser wheel",
			async (page) => {
				await down(page);
				const base = await page.evaluate(() => window.rulerDown);
				await page.mouse.move(base.x - 40, base.y, { steps: 8 });
				await page.waitForTimeout(100);
				await page.mouse.up();
				await page.waitForTimeout(150);
				assert.equal((await state(page)).value, 420);
				await page.mouse.wheel(20, 0);
				await page.waitForTimeout(750);
				return state(page);
			},
			(a, b) => {
				assert.equal(b.value, 430);
				assert.equal(a.x, b.x);
				assert.deepEqual(commits(a), commits(b));
			}
		);
		await check(
			"catch moving tape and continue inverse drag",
			async (page) => {
				await down(page);
				await pointer(page, "pointermove", -16, 80);
				await pointer(page, "pointerup", -16, 80);
				await page.mouse.up();
				await page.waitForTimeout(150);
				await down(page);
				await page.waitForTimeout(40); // allow the source Motion's final scheduled style paint after stop
				const caught = await state(page);
				await page.waitForTimeout(180);
				assert.equal((await state(page)).x, caught.x);
				await pointer(page, "pointermove", -10, 200);
				const during = await state(page);
				assert.ok(Math.abs(during.x - (caught.x - 10)) < 0.002);
				await pointer(page, "pointercancel", -10, 200);
				await page.mouse.up();
				await page.waitForTimeout(2600);
				const final = await state(page);
				assert.equal(final.x, -2 * final.value);
				assert.equal(commits(final).length, reduced ? 2 : 1);
				return { caught, during, final };
			},
			(a, b) => {
				assert.ok(a.final.value > 408 && b.final.value > 408);
			}
		);
		await check(
			"disabled ignores pointer wheel key",
			async (page) => {
				await page.goto(
					`${url}/${page === pages[0] ? "original" : "migrated"}.html?seed=400&max=2000&spacing=2&scenario=disabled&motion=${reduced ? "reduce" : "no-preference"}`
				);
				await page.locator('body[data-ready="ready"]').waitFor();
				assert.equal(await wheel(page, 80), false);
				await slider(page).dispatchEvent("keydown", { key: "End" });
				await down(page);
				await pointer(page, "pointermove", -80, 80);
				await page.mouse.up();
				return state(page);
			},
			(a, b) => {
				assert.equal(b.value, 400);
				assert.deepEqual(a.events, b.events);
			}
		);
		await context.close();
	}
	assert.deepEqual(report.errors, []);
	await writeFile(new URL("ruler-browser.json", artifacts), JSON.stringify(report, null, 2) + "\n");
} finally {
	await browser.close();
}
