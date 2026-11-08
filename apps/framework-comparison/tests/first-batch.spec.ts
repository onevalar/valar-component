import { expect, test, type Page } from "@playwright/test";

const versions = [
	{ id: "svelte", url: "http://127.0.0.1:5212/svelte.html" },
	{ id: "react", url: process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/" },
	{ id: "vue", url: process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/" },
];
async function open(page: Page, url: string, theme = "light", disabled = false) {
	// Use the same date while allowing timestamps to advance. Freezing Date.now
	// makes Vue's event-attachment guard reject later events as already handled.
	await page.clock.setSystemTime(new Date("2026-11-12T12:00:00+08:00"));
	await page.goto(`${url}?theme=${theme}&disabled=${disabled ? 1 : 0}`);
	await expect(page.locator('[data-ready="true"]')).toBeVisible();
	await page.evaluate(() => document.fonts.ready);
}

function activeOption(page: Page) {
	return page.evaluate(() => {
		const active = document.activeElement;
		const id = active?.getAttribute("aria-activedescendant");
		return (id ? document.getElementById(id) : active)?.textContent?.trim();
	});
}

for (const version of versions) {
	for (const theme of ["light", "dark"])
		for (const width of [390, 900]) {
			test(`${version.id} ${theme} ${width}: native controls, keyboard, forms and reset`, async ({
				page,
			}) => {
				await page.setViewportSize({ width, height: 900 });
				const errors: string[] = [];
				page.on("pageerror", (error) => errors.push(error.message));
				await open(page, version.url, theme);
				await expect(page.locator("[data-demo]")).toHaveCount(9);
				await expect(page.getByRole("button", { name: "保存", exact: true })).toHaveCSS(
					"height",
					"32px"
				);
				await page.getByRole("button", { name: "保存", exact: true }).click();
				await expect(page.locator('[data-result="button"]')).toHaveText("1");
				await page
					.locator('[data-demo="input"]')
					.getByRole("textbox", { name: "名称" })
					.fill("你好 Valar 🪴");
				const checkbox = page.getByRole("checkbox", { name: "同意" });
				await checkbox.focus();
				await page.keyboard.press("Space");
				await expect(checkbox).toBeChecked();
				const select = page.getByRole("combobox", { name: "服务商" });
				await select.focus();
				await page.keyboard.press("ArrowDown");
				await expect(page.getByRole("option", { name: "Claude", exact: true })).toBeVisible();
				await expect.poll(() => activeOption(page)).toBe("Claude");
				await page.keyboard.press("End");
				// Native primitives commit focus on different render schedules. Wait for
				// the actual active option (DOM focus or aria-activedescendant), not time.
				await expect.poll(() => activeOption(page)).toBe("Cursor");
				await page.keyboard.press("Enter");
				await expect(page.locator('[data-result="select"]')).toHaveText("cursor");
				const trigger = page.getByRole("button", { name: "打开弹窗" });
				await trigger.click();
				const dialog = page.getByRole("dialog", { name: "编辑设置" });
				await expect(dialog).toBeVisible();
				await expect(dialog.getByRole("textbox", { name: "名称" })).toBeFocused();
				await page.keyboard.press("Shift+Tab");
				await expect(dialog.getByRole("button", { name: "关闭", exact: true })).toBeFocused();
				await page.keyboard.press("Escape");
				await expect(dialog).toBeHidden();
				await expect(trigger).toBeFocused();
				const slider = page.getByRole("slider", { name: "额度" });
				await slider.focus();
				await page.keyboard.press("ArrowRight");
				await expect(slider).toHaveAttribute("aria-valuenow", "40");
				await page.keyboard.press("Shift+ArrowUp");
				await expect(slider).toHaveAttribute("aria-valuenow", "46");
				await page.keyboard.press("Home");
				await expect(slider).toHaveAttribute("aria-valuenow", "-20");
				await page.keyboard.press("End");
				// min=-20 + 33 steps × 3 = 79; 80 is outside the permitted step grid.
				await expect(slider).toHaveAttribute("aria-valuenow", "79");
				await page.getByRole("button", { name: "提交", exact: true }).click();
				await expect
					.poll(async () => JSON.parse(await page.locator('[data-result="form"]').innerText()))
					.toEqual({ name: "你好 Valar 🪴", agree: "on", provider: "cursor", quota: "79" });
				await page.getByRole("button", { name: "重置", exact: true }).click();
				await expect(page.locator('[data-result="button"]')).toHaveText("0");
				await expect(checkbox).not.toBeChecked();
				await expect(select).toContainText("Claude");
				await expect(slider).toHaveAttribute("aria-valuenow", "37");
				await expect(page.locator('[data-result="calendar"]')).toHaveText("2026-11-12");
				await expect(page.locator('[data-result="range-calendar"]')).toHaveText(
					"2026-11-10 – 2026-11-14"
				);
				await expect(page.locator('[data-demo="chart"] svg').first()).toBeVisible();
				expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
					true
				);
				expect(errors).toEqual([]);
			});
		}
	test(`${version.id}: disabled controls cannot edit or submit`, async ({ page }) => {
		await open(page, version.url, "light", true);
		await expect(page.getByRole("button", { name: "保存", exact: true })).toBeDisabled();
		await expect(page.locator('[data-demo="input"] input')).toBeDisabled();
		await expect(page.getByRole("checkbox", { name: "同意" })).toBeDisabled();
		await expect(page.getByRole("combobox", { name: "服务商" })).toBeDisabled();
		await expect(page.getByRole("button", { name: "打开弹窗" })).toBeDisabled();
		await expect(page.getByRole("button", { name: "提交", exact: true })).toBeDisabled();
		expect(
			await page
				.locator("form")
				.evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form)))
		).toEqual({});
	});
	test(`${version.id}: calendar choices and fresh two-click range`, async ({ page }) => {
		await open(page, version.url);
		const calendar = page.locator('[data-demo="calendar"]');
		await calendar.getByRole("button", { name: /2026年11月17日/ }).click();
		await expect(page.locator('[data-result="calendar"]')).toHaveText("2026-11-17");
		await page.keyboard.press("ArrowRight");
		await page.keyboard.press("Enter");
		await expect(page.locator('[data-result="calendar"]')).toHaveText("2026-11-18");
		await calendar.getByRole("button", { name: "选择月份", exact: true }).click();
		await expect(page.getByRole("button", { name: /^(?:[1-9]|1[0-2])月$/ })).toHaveCount(12);
		await page.getByRole("button", { name: "12月", exact: true }).click();
		await calendar.getByRole("button", { name: /2026年12月17日/ }).click();
		await expect(page.locator('[data-result="calendar"]')).toHaveText("2026-12-17");
		await calendar.getByRole("button", { name: "选择年份", exact: true }).click();
		await expect(page.getByRole("button", { name: /^20[0-9]{2}年$/ })).toHaveCount(12);
		await page.getByRole("button", { name: "2027年", exact: true }).click();
		await calendar.getByRole("button", { name: /2027年12月17日/ }).click();
		await expect(page.locator('[data-result="calendar"]')).toHaveText("2027-12-17");
		const range = page.locator('[data-demo="range-calendar"]');
		await range.getByRole("button", { name: /2026年11月18日/ }).click();
		await expect(page.locator('[data-result="range-calendar"]')).toHaveText("2026-11-18 –");
		await range.getByRole("button", { name: /2026年11月20日/ }).click();
		await expect(page.locator('[data-result="range-calendar"]')).toHaveText(
			"2026-11-18 – 2026-11-20"
		);
	});
	test(`${version.id}: scalar directions, modifiers and pointer update`, async ({ page }) => {
		await open(page, version.url);
		const slider = page.getByRole("slider", { name: "额度" });
		await slider.focus();
		for (const [key, value] of [
			["ArrowUp", "40"],
			["ArrowLeft", "37"],
			["ArrowDown", "34"],
			["PageUp", "40"],
			["PageDown", "34"],
		]) {
			await page.keyboard.press(key);
			await expect(slider).toHaveAttribute("aria-valuenow", value);
		}
		await page.evaluate(() => {
			(window as unknown as { shortcut?: boolean }).shortcut = undefined;
			document.body.addEventListener("keydown", (event) => {
				if (event.altKey && event.key === "ArrowRight")
					(window as unknown as { shortcut?: boolean }).shortcut = !event.defaultPrevented;
			});
		});
		await page.keyboard.press("Alt+ArrowRight");
		await expect(slider).toHaveAttribute("aria-valuenow", "34");
		expect(await page.evaluate(() => (window as unknown as { shortcut?: boolean }).shortcut)).toBe(
			true
		);
		const root = page.locator('[data-demo="slider"] [data-slot="slider"]');
		await root.scrollIntoViewIfNeeded();
		const box = await root.boundingBox();
		expect(box).not.toBeNull();
		await page.mouse.click(box!.x + box!.width * 0.75, box!.y + box!.height / 2);
		await expect
			.poll(async () => Number(await slider.getAttribute("aria-valuenow")))
			.toBeGreaterThan(34);
	});
	for (const theme of ["light", "dark"])
		test(`${version.id} ${theme}: real chart preserves zero, null gap and hover values`, async ({
			page,
		}) => {
			await page.setViewportSize({ width: 390, height: 900 });
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			await open(page, version.url, theme);
			const chart = page.locator('[data-demo="chart"]');
			await chart.scrollIntoViewIfNeeded();
			const selectors =
				version.id === "svelte"
					? {
							line: ".lc-path",
							points: ".lc-circle.lc-point",
							tooltip: '[data-slot="chart-tooltip"]',
						}
					: version.id === "react"
						? {
								line: ".recharts-line-curve",
								points: ".recharts-line-dot",
								tooltip: ".recharts-tooltip-wrapper",
							}
						: {
								line: '[class$="-linePath"]',
								points: 'g[class$="-point"]',
								tooltip: 'div[class^="unovis-"][class*="-tooltip"]',
							};
			await expect(chart.locator(selectors.points)).toHaveCount(6);
			if (version.id === "react") {
				const clippedTicks = await chart.locator("text").evaluateAll((elements) =>
					elements
						.filter((element) => /^\d+$/.test(element.textContent ?? ""))
						.filter(
							(element) =>
								element.getBoundingClientRect().left <
								element.ownerSVGElement!.getBoundingClientRect().left
						)
						.map((element) => element.textContent)
				);
				expect(clippedTicks, "all numeric axis labels fit inside the SVG").toEqual([]);
			}
			const path = await chart.locator(selectors.line).getAttribute("d");
			expect(path?.match(/M/g)).toHaveLength(2);
			expect(path).not.toMatch(/NaN/);
			// Capture positions before hovering: Unovis raises the active point and
			// legitimately changes SVG node order. The data order remains x-sorted.
			const points = await chart.locator(selectors.points).evaluateAll((elements) =>
				elements
					.map((element) => {
						const box = element.getBoundingClientRect();
						return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
					})
					.sort((a, b) => a.x - b.x)
			);
			const step = points[1].x - points[0].x;
			expect((points[2].x - points[1].x) / step).toBeCloseTo(2, 1);
			expect(points[0].y).toBeGreaterThan(points[2].y);
			for (const [index, value] of [
				[0, "0"],
				[2, "9"],
			] as const) {
				// LayerChart portals the tooltip outside the chart; query the real
				// document, as for native popup controls, rather than its visual parent.
				const tooltip = page.locator(selectors.tooltip).filter({ hasText: "用量" });
				// LayerChart loads its hit-testing engine lazily after the marks. Keep
				// exercising a real hover until the requested value is painted, not
				// merely until a previous tooltip or transparent container exists.
				await expect
					.poll(async () => {
						await page.mouse.move(points[index].x + 2, points[index].y - 2);
						await page.mouse.move(points[index].x + 1, points[index].y - 1);
						return tooltip.evaluateAll(
							(elements, expected) =>
								elements.some(
									(element) =>
										getComputedStyle(element).opacity === "1" &&
										getComputedStyle(element).visibility === "visible" &&
										[...element.querySelectorAll("span")].some(
											(span) => span.textContent === expected
										)
								),
							value
						);
					})
					.toBe(true);
				await expect(
					tooltip.locator("span").filter({ hasText: new RegExp(`^${value}$`) })
				).toBeVisible();
				await expect(tooltip).toHaveCSS("opacity", "1");
			}
			// Wednesday is a genuine null between Tuesday and Thursday. Hovering
			// its x-column must not format null as a number or retain a stale value.
			await page.mouse.move((points[1].x + points[2].x) / 2, points[2].y - 1);
			await page.evaluate(
				() =>
					new Promise<void>((resolve) =>
						requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
					)
			);
			const missingTooltip = page.locator(selectors.tooltip).filter({ hasText: "用量" });
			await expect(missingTooltip.locator("span").filter({ hasText: /^(0|9)$/ })).not.toBeVisible();
			expect(errors).toEqual([]);
		});
}

test("same theme and public-control geometry across native frameworks", async ({ browser }) => {
	for (const theme of ["light", "dark"]) {
		const metrics = [];
		for (const version of versions) {
			const page = await browser.newPage({
				viewport: { width: 390, height: 900 },
				locale: "zh-CN",
			});
			await open(page, version.url, theme);
			metrics.push(
				await page.evaluate(() => {
					const selectors = [
						'[data-demo="button"] button',
						'[data-demo="input"] input',
						'[role="checkbox"]',
						'[data-demo="select"] [role="combobox"]',
					];
					return selectors.map((selector) => {
						const element = document.querySelector(selector)!;
						const style = getComputedStyle(element),
							box = element.getBoundingClientRect();
						return {
							height: box.height,
							radius: style.borderRadius,
							font: style.font,
							color: style.color,
							background: style.backgroundColor,
							padding: style.padding,
						};
					});
				})
			);
			await page.close();
		}
		expect(metrics[1], `React ${theme}`).toEqual(metrics[0]);
		expect(metrics[2], `Vue ${theme}`).toEqual(metrics[0]);
	}
});

test("calendar geometry and Chinese weekdays match across native frameworks", async ({
	browser,
}) => {
	const metrics = [];
	for (const version of versions) {
		const page = await browser.newPage({ viewport: { width: 390, height: 900 }, locale: "zh-CN" });
		await open(page, version.url);
		// The shared theme reserves a native scrollbar gutter. Its width depends
		// on browser/system settings; the fixture still has 24px padding per side.
		const contentWidth = await page.evaluate(
			() => document.body.getBoundingClientRect().width - 48
		);
		const calendars = [];
		for (const id of ["calendar", "range-calendar"]) {
			const section = page.locator(`[data-demo="${id}"]`);
			const root = await section.locator(`[data-slot="${id}"]`).boundingBox();
			const day = await section.getByRole("button", { name: /2026年11月17日/ }).boundingBox();
			expect(day?.width).toBe(36);
			expect(day?.height).toBe(36);
			expect(root?.width).toBe(contentWidth);
			// DayPicker hides its visual weekday row from accessibility because
			// each date already has a full label. This check compares rendered copy.
			const weekdays = await section.locator('[role="columnheader"], thead th').allTextContents();
			expect(weekdays.map((text) => text.trim())).toEqual([
				"周一",
				"周二",
				"周三",
				"周四",
				"周五",
				"周六",
				"周日",
			]);
			calendars.push({ root, day, height: (await section.boundingBox())?.height });
		}
		metrics.push(calendars);
		await page.close();
	}
	expect(metrics[1], "React calendar layout").toEqual(metrics[0]);
	expect(metrics[2], "Vue calendar layout").toEqual(metrics[0]);
});

test("comparison runs three isolated implementations, rejects wrong sender, resets all", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto("http://127.0.0.1:5212/");
	for (const version of versions)
		await expect(page.locator(`[data-status="${version.id}"]`)).toHaveText("已挂载");
	const svelte = page.frameLocator('iframe[title^="Svelte"]');
	const react = page.frameLocator('iframe[title^="React"]');
	await svelte.getByRole("button", { name: "保存", exact: true }).click();
	await expect(svelte.locator('[data-result="button"]')).toHaveText("1");
	await expect(react.locator('[data-result="button"]')).toHaveText("0");
	await page.getByRole("button", { name: "重置三个版本" }).click();
	await expect(svelte.locator('[data-result="button"]')).toHaveText("0");
	await page.getByRole("combobox", { name: "外观" }).click();
	await page.getByRole("option", { name: "深色", exact: true }).click();
	for (const title of ["Svelte", "React", "Vue"])
		await expect(page.frameLocator(`iframe[title^="${title}"]`).locator("html")).toHaveClass(
			"dark"
		);
	await page.evaluate(() =>
		window.postMessage(
			{ protocol: "valar-frameworks-v1", framework: "other", status: "ready" },
			location.origin
		)
	);
	await expect(page.locator('[data-status="other"]')).toHaveCount(0);
	await page.setViewportSize({ width: 390, height: 900 });
	const boxes = await page
		.locator("iframe")
		.evaluateAll((frames) =>
			frames.map((frame) => ({ x: frame.getBoundingClientRect().x, width: frame.clientWidth }))
		);
	for (const box of boxes) {
		expect(box.x).toBeGreaterThanOrEqual(0);
		expect(box.x + box.width).toBeLessThanOrEqual(390);
	}
});
