import { expect, test } from "@playwright/test";

for (const { width, colorScheme } of [
	{ width: 320, colorScheme: "dark" },
	{ width: 390, colorScheme: "light" },
	{ width: 400, colorScheme: "dark" },
	{ width: 802, colorScheme: "dark" },
	{ width: 1200, colorScheme: "light" },
] as const) {
	test(`Range Calendar captions and dates fit in ${colorScheme} at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 710 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/zh/docs/components/calendar");

		const cards = page.locator('[data-slot="card"]').filter({
			has: page.locator('[data-slot="calendar"], [data-slot="range-calendar"]'),
		});
		await expect(cards).toHaveCount(5);
		for (const card of await cards.all()) {
			expect((await card.boundingBox())!.width).toBeGreaterThanOrEqual(196);
		}

		const calendar = page
			.locator('[data-slot="range-calendar"]')
			.filter({
				has: page.locator('[data-calendar-caption="month"]'),
			})
			.first();
		await calendar.scrollIntoViewIfNeeded();
		const prev = calendar.locator("[data-range-calendar-prev-button]");
		const next = calendar.locator("[data-range-calendar-next-button]");
		const month = calendar.getByRole("combobox", { name: "月份" });
		const year = calendar.getByRole("combobox", { name: "年份" });
		await prev.hover({ timeout: 3000 });

		const [prevBox, monthBox, yearBox, nextBox] = await Promise.all(
			[prev, month, year, next].map((control) => control.boundingBox())
		);
		const gap = (a: typeof prevBox, b: typeof prevBox) =>
			Math.max(b!.x - a!.x - a!.width, b!.y - a!.y - a!.height, a!.y - b!.y - b!.height);
		expect(gap(prevBox, monthBox)).toBeGreaterThanOrEqual(7.5);
		expect(gap(monthBox, yearBox)).toBeGreaterThanOrEqual(7.5);
		expect(gap(yearBox, nextBox)).toBeGreaterThanOrEqual(7.5);
		for (const control of [prev, month, year, next]) {
			expect(
				await control.evaluate((element) => {
					const { left, right, top, height } = element.getBoundingClientRect();
					return [left + 2, right - 2].every((x) =>
						element.contains(document.elementFromPoint(x, top + height / 2))
					);
				})
			).toBe(true);
		}

		const row = calendar
			.locator("[data-range-calendar-grid-body] [data-range-calendar-grid-row]")
			.first();
		const weekdays = calendar.getByRole("columnheader");
		const calendarBox = (await calendar.boundingBox())!;
		if (width < 400) {
			expect(monthBox!.y - (prevBox!.y + prevBox!.height)).toBeGreaterThanOrEqual(7.5);
		} else {
			expect(Math.abs(monthBox!.y - prevBox!.y)).toBeLessThan(1);
		}
		const days = row.locator("[data-range-calendar-day]");
		await expect(days).toHaveCount(7);
		for (const [index, day] of (await days.all()).entries()) {
			const dayBox = (await day.boundingBox())!;
			const weekdayBox = (await weekdays.nth(index).boundingBox())!;
			expect(dayBox.x).toBeGreaterThanOrEqual(calendarBox.x);
			expect(dayBox.x + dayBox.width).toBeLessThanOrEqual(calendarBox.x + calendarBox.width);
			expect(
				Math.abs(dayBox.x + dayBox.width / 2 - weekdayBox.x - weekdayBox.width / 2)
			).toBeLessThan(1);
		}

		await year.click();
		const years = page.getByRole("listbox");
		await expect(years).toBeVisible();
		expect((await years.boundingBox())!.height).toBeLessThanOrEqual(241);
		await page.keyboard.press("Escape");
		await expect(years).toBeHidden();
		await expect(year).toBeFocused();
		const currentYear = (await year.innerText()).trim();
		const nextYear = String(Number(currentYear.replace("年", "")) + 1) + "年";
		await year.press("Enter");
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");
		await expect(year).toHaveText(nextYear);
		await expect(year).toBeFocused();
		await month.click();
		await page.getByRole("listbox").getByRole("option", { name: "二月", exact: true }).click();
		await expect(month).toHaveText("二月");
		await next.click();
		await expect(month).toHaveText("三月");
		await prev.click();
		await expect(month).toHaveText("二月");
		const currentMonth = calendar.locator("[data-range-calendar-day]:not([data-outside-month])");
		await currentMonth.nth(8).click();
		await expect(currentMonth.nth(8)).toHaveAttribute("data-range-start", "");
		await currentMonth.nth(8).press("ArrowRight");
		await expect(currentMonth.nth(9)).toBeFocused();
		await page.keyboard.press("Enter");
		await expect(currentMonth.nth(9)).toHaveAttribute("data-range-end", "");
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
	});
}
