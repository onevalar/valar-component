import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Cycle Range Calendar keeps linked dates and focus in ${colorScheme} at ${width}px`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 820 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/docs/components/range-calendar", {
				waitUntil: "networkidle"
			});

			const sample = page.locator('[data-slot="cycle-date-sample"]');
			const calendar = sample.locator('[data-slot="range-calendar"][data-appearance="cycle"]');
			const months = calendar.locator('[data-slot="range-calendar-month"]');
			const month = months.first();
			const narrow = width === 320;
			const endMonth = months.nth(narrow ? 0 : 1);
			const day = (date: string) =>
				calendar.locator(
					`[data-range-calendar-day][data-value="${date}"]:not([data-outside-month])`
				);
			const previous = calendar.locator("[data-range-calendar-prev-button]");
			const next = calendar.locator("[data-range-calendar-next-button]");
			const title = month.locator("[data-range-calendar-header]");
			const start = day("2026-11-20");
			const middle = day("2026-11-21");
			const end = day("2026-12-03");
			const disabled = day("2026-11-16");
			const selectedColor = colorScheme === "dark" ? "lch(100 5 288.421)" : "lch(100 5 286.91)";
			const accent = colorScheme === "dark" ? "lch(47.918 59.303 288.421)" : "lch(53 52.26 286.91)";
			const band = colorScheme === "dark" ? "lch(16.32 1.48 272)" : "lch(90.55 0 282)";

			await expect(months).toHaveCount(narrow ? 1 : 2);
			await expect(title).toHaveText("November 2026");
			await expect(title).toHaveCSS("height", "36px");
			await expect(title).toHaveCSS("font-size", "12px");
			await expect(title).toHaveCSS("padding-inline", "8px");
			await expect(month.locator("[data-range-calendar-grid]")).toHaveCSS("height", "221.5px");
			await expect(previous).toBeDisabled();
			await expect(next).toBeEnabled();
			await expect(next).toHaveCSS("height", "28px");
			await expect(next).toHaveCSS("width", "28px");
			await expect(next.locator("svg")).toHaveCSS("height", "14px");

			await expect(disabled.locator("..")).toHaveAttribute("aria-disabled", "true");
			await expect(disabled).toHaveCSS(
				"color",
				colorScheme === "dark" ? "lch(39.452 1.425 272)" : "lch(66 1 282)"
			);
			await expect(start).toHaveCSS("width", "26px");
			await expect(start).toHaveCSS("height", "26px");
			await expect(start).toHaveCSS("font-size", "13px");
			await expect(start).toHaveCSS("background-color", accent);
			await expect(start).toHaveCSS("color", selectedColor);
			await expect(
				month.locator('[data-range-calendar-day][data-value="2026-12-03"][data-outside-month]')
			).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
			await expect(start).toHaveAttribute("data-range-start", "");
			await expect(middle).toHaveAttribute("data-range-middle", "");
			const middleCell = middle.locator("..");
			expect(
				await middleCell.evaluate((el) => getComputedStyle(el, "::before").backgroundColor)
			).toBe(band);

			const left = (await month.boundingBox())!;
			const startBox = (await start.boundingBox())!;
			const middleBox = (await middle.boundingBox())!;
			const previousBox = (await previous.boundingBox())!;
			const nextBox = (await next.boundingBox())!;
			const titleBox = (await title.boundingBox())!;
			const saturdayBox = (await month.getByRole("columnheader").last().boundingBox())!;
			expect(nextBox.x - (previousBox.x + previousBox.width)).toBeCloseTo(4, 1);
			expect(titleBox.y).toBeLessThan(startBox.y);
			expect(saturdayBox.x + saturdayBox.width / 2).toBeCloseTo(
				middleBox.x + middleBox.width / 2,
				1
			);
			expect(previousBox.y - titleBox.y).toBeCloseTo(4, 1);
			if (narrow) {
				expect(left.width).toBeGreaterThanOrEqual(196);
				await expect(end).toHaveCount(0);
				await next.press("Enter");
				await expect(next).toBeFocused();
			} else {
				const right = (await endMonth.boundingBox())!;
				expect(left.width).toBe(246);
				expect(right.width).toBe(246);
				expect(right.x - left.x).toBe(246);
				expect(middleBox.x - startBox.x).toBe(34);
				expect(right.y).toBe(left.y);
			}
			await expect(endMonth.locator("[data-range-calendar-header]")).toHaveText("December 2026");
			await expect(end).toHaveCSS("background-color", accent);
			await expect(end).toHaveAttribute("data-range-end", "");
			if (narrow) {
				await expect(months).toHaveCount(1);
				await previous.press("Enter");
				await expect(title).toHaveText("November 2026");
			}
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);

			await start.hover();
			await expect(start).toHaveCSS("color", selectedColor);
			await start.press("ArrowRight");
			await expect(middle).toBeFocused();
			await expect(middle).toHaveCSS("outline-style", "solid");
			await expect(middle).toHaveCSS("outline-width", "1px");
			await expect(middle).toHaveCSS("outline-offset", "-1px");
			await expect(middle).toHaveCSS("outline-color", accent);
			await middle.press("Enter");
			await expect(sample.getByText("Starts 2026-11-21. Choose an end date.")).toBeVisible();
			await middle.press("ArrowRight");
			const newEnd = day("2026-11-22");
			await expect(newEnd).toBeFocused();
			await newEnd.press("Enter");
			await expect(sample.getByText("Cycle dates: 2026-11-21 – 2026-11-22")).toBeVisible();
			await expect(middle).toHaveAttribute("data-range-start", "");
			await expect(newEnd).toHaveAttribute("data-range-end", "");
		});
	}
}
