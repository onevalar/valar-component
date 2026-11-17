import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Usage chart retains the empty axis and keyboard period at ${width}px in ${colorScheme}`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 850 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/docs/components/chart", { waitUntil: "networkidle" });
			const sample = page.getByRole("region", { name: "AI credit usage", exact: true });
			const chart = sample.locator('[data-slot="chart"][data-appearance="usage"]');
			const values = chart.locator(".placement-right .lc-axis-tick-label");
			const dates = chart.locator(".placement-bottom .lc-axis-tick-label");
			const grid = chart.locator(".lc-grid-y-rule");
			await expect(chart).toHaveCSS("height", "320px");
			await expect(chart).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
			await expect(values).toHaveText(["$0", "$0.2", "$0.4", "$0.6", "$0.8", "$1"]);
			await expect(values.first()).toHaveCSS("font-size", "11px");
			await expect(values.first()).toHaveCSS("font-weight", "450");
			await expect(values.first()).toHaveCSS(
				"fill",
				colorScheme === "dark" ? "lch(61.803 1.2 272)" : "lch(39.176 1.25 282)"
			);
			await expect(dates.first()).toHaveCSS("font-size", "12px");
			await expect(grid).toHaveCount(6);
			await expect(grid.first()).toHaveCSS("stroke-dasharray", "4px, 4px");
			expect(await grid.first().getAttribute("y1")).toBe("280");
			expect(await grid.last().getAttribute("y1")).toBe("0");
			await expect(chart.locator(".lc-bars, [data-slot=chart-tooltip], [tabindex]")).toHaveCount(0);
			const initialTicks = await dates.allTextContents();

			const trigger = sample.getByRole("combobox", { name: "Usage period" });
			await trigger.press("Enter");
			await expect(page.getByRole("option", { name: "Last 30 days" })).toHaveAttribute(
				"data-highlighted", ""
			);
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Enter");
			await expect(trigger).toHaveText("Last 90 days");
			await expect(trigger).toBeFocused();
			await expect(sample.getByRole("status")).toContainText("Total $0");
			expect(await dates.allTextContents()).not.toEqual(initialTicks);
			const chartBounds = (await chart.boundingBox())!;
			for (const tick of await values.all()) {
				const tickBounds = (await tick.boundingBox())!;
				expect(tickBounds.x + tickBounds.width).toBeLessThanOrEqual(
					chartBounds.x + chartBounds.width + 1
				);
			}
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		});
	}
}
