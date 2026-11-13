import { expect, test } from "@playwright/test";

for (const { colorScheme, width } of [
	{ colorScheme: "light", width: 802 },
	{ colorScheme: "dark", width: 802 },
	{ colorScheme: "dark", width: 320 },
] as const) {
	test(`Calendar keeps day states and keyboard navigation distinct in ${colorScheme} at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 680 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/zh/docs/components/calendar");
		const project = page.locator('[data-slot="calendar"][data-appearance="project-date"]').first();
		const grid = project.getByRole("grid");
		await expect(grid.getByRole("columnheader").first()).toHaveText("Mo");
		await expect(grid.locator("[data-calendar-grid-body] tr")).toHaveCount(6);
		const chosen = project.locator("[data-calendar-day][data-selected]");
		const today = project.locator("[data-calendar-day][data-today]");
		const accent = colorScheme === "dark" ? "lch(47.918 59.303 288.421)" : "lch(53 52.26 286.91)";
		await expect(chosen).toHaveCSS("width", "26px");
		await expect(chosen).toHaveCSS("background-color", accent);
		await expect(today).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(20.032 1.93 272)" : "lch(90.55 0 282)"
		);
		await chosen.press("ArrowRight");
		const focused = project.locator("[data-calendar-day]:focus");
		await expect(focused).toBeFocused();
		await expect(focused).toHaveCSS("outline-offset", "-1px");
		await expect(focused).not.toHaveAttribute("data-selected", "");
		await page.keyboard.press("Enter");
		await expect(chosen).toBeFocused();
		await expect(chosen).toHaveCSS("background-color", accent);
		const next = project.locator("[data-calendar-next-button]");
		const original = await grid.getAttribute("aria-label");
		await next.press("Enter");
		await expect(grid).not.toHaveAttribute("aria-label", original ?? "");

		const ordinary = page
			.locator('[data-slot="calendar"]')
			.filter({
				has: page.locator('[data-calendar-caption="year"]'),
			})
			.first();
		const month = ordinary.getByRole("combobox", { name: "月份" });
		const year = ordinary.getByRole("combobox", { name: "年份" });
		const previousMonth = ordinary.locator("[data-calendar-prev-button]");
		const nextMonth = ordinary.locator("[data-calendar-next-button]");
		await previousMonth.hover();
		const controls = [previousMonth, month, year, nextMonth];
		const [prevBox, monthBox, yearBox, nextBox] = await Promise.all(
			controls.map((control) => control.boundingBox())
		);
		expect(monthBox!.x - (prevBox!.x + prevBox!.width)).toBeGreaterThanOrEqual(7.5);
		expect(yearBox!.x - (monthBox!.x + monthBox!.width)).toBeGreaterThanOrEqual(7.5);
		expect(nextBox!.x - (yearBox!.x + yearBox!.width)).toBeGreaterThanOrEqual(7.5);
		for (const control of controls) {
			expect(
				await control.evaluate((element) => {
					const { left, right, top, height } = element.getBoundingClientRect();
					const y = top + height / 2;
					return [left + 2, right - 2].every((x) =>
						element.contains(document.elementFromPoint(x, y))
					);
				}),
				`The edges of ${await control.getAttribute("aria-label")} must be clickable`
			).toBe(true);
		}
		const firstWeekday = (await ordinary.getByRole("columnheader").first().boundingBox())!;
		const firstDay = (await ordinary.locator("[data-calendar-day]").first().boundingBox())!;
		expect(
			Math.abs(firstWeekday.x + firstWeekday.width / 2 - firstDay.x - firstDay.width / 2)
		).toBeLessThan(1);
		await month.click();
		await page.getByRole("listbox").getByRole("option", { name: "2月", exact: true }).click();
		await expect(month).toHaveText("2月");

		const currentYear = (await year.innerText()).trim();
		const nextYear = String(Number(currentYear.replace("年", "")) + 1) + "年";
		await year.press("Enter");
		const years = page.getByRole("listbox");
		await expect(years).toBeVisible();
		await expect(years).toHaveCSS("border-radius", "12px");
		await expect(years.getByRole("option", { name: currentYear, exact: true })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		const size = (await years.boundingBox())!;
		expect(size.height).toBeLessThanOrEqual(241);
		expect(size.y).toBeGreaterThanOrEqual(0);
		expect(size.y + size.height).toBeLessThanOrEqual(680);
		await page.keyboard.press("Escape");
		await expect(years).toBeHidden();
		await expect(year).toBeFocused();

		await year.press("Enter");
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");
		await expect(year).toHaveText(nextYear);
		await expect(year).toBeFocused();
		await expect(ordinary.locator("[data-calendar-day][data-value]").first()).toHaveAttribute(
			"data-value",
			new RegExp(`^${nextYear.replace("年", "")}-`)
		);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
	});
}

test("A calendar year menu inside a date popover closes before its parent", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 640 });
	await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
	await page.goto("/zh/docs/components/date-picker");
	const trigger = page.locator('button[id="date"]');
	await trigger.scrollIntoViewIfNeeded();
	await trigger.press("Enter");
	const panel = page.locator('[data-slot="popover-content"]').filter({
		has: page.locator('[data-calendar-caption="year"]'),
	});
	const year = panel.getByRole("combobox", { name: "年份" });
	await year.press("Enter");
	const list = page.locator('[data-calendar-caption-options="year"]');
	await expect(list).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(list).toBeHidden();
	await expect(panel).toBeVisible();
	await expect(year).toBeFocused();
	await page.keyboard.press("Escape");
	await expect(panel).toBeHidden();
	await expect(trigger).toBeFocused();
});
