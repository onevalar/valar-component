import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Insights chart connects marks and keyboard detail at ${width}px in ${colorScheme}`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 850 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/docs/components/chart", { waitUntil: "networkidle" });
			const sample = page.getByRole("region", { name: "Issue insights", exact: true });
			const chart = sample.locator('[data-slot="chart"][data-appearance="insights"]');
			const noPriorityMark = chart.locator('[data-insights-mark="todo-none"]');
			const reviewMark = chart.locator('[data-insights-mark="review-none"]');
			const tooltip = page.locator('[data-slot="chart-tooltip"][data-appearance="insights"]');
			const table = sample.getByRole("table", { name: "Issue counts by status and priority" });
			const todo = table.getByRole("button", { name: "Todo · No priority: 108 issues" });
			const review = table.getByRole("button", { name: "In Review · No priority: 8 issues" });
			await expect(chart).toHaveCSS("height", "281px");
			await expect(chart.locator(".placement-right .lc-axis-tick-label")).toHaveText(
				["0", "25", "50", "75", "100", "125", "150"]
			);
			await expect(chart.locator(".placement-bottom foreignObject")).toHaveText(
				["Todo", "In Progress", "In Review"]
			);
			await expect(chart.locator(".lc-grid-y-rule")).toHaveCount(7);
			await expect(noPriorityMark).toHaveAttribute("width", "10");
			await expect(noPriorityMark).toHaveCSS("fill", "rgb(106, 106, 115)");
			await expect(chart.locator("[data-insights-mark]")).toHaveCount(11);
			await expect(chart.locator('[data-insights-mark="review-medium"]')).toHaveCount(0);
			await expect(table.getByRole("row", { name: "Total 141 61 10" })).toBeVisible();
			await noPriorityMark.hover();
			await expect(tooltip).toBeVisible();
			await expect(tooltip).toHaveCSS("border-radius", "4px");
			await expect(tooltip).toHaveCSS("padding-block", "4px");
			await expect(tooltip).toHaveCSS("padding-inline", "12px");
			await expect(tooltip).toHaveCSS(
				"background-color",
				colorScheme === "dark" ? "lch(17.873 1.93 272)" : "lch(100 0 282)"
			);
			await expect(tooltip).toContainText("76.6%");
			await expect(tooltip).toContainText("7.8%");
			const swatches = tooltip.locator("[data-insights-swatch]");
			await expect(swatches.first()).toHaveAttribute("data-insights-swatch", "low");
			await expect(swatches.first()).toHaveCSS("width", "6px");
			await expect(swatches.first()).toHaveCSS("background-color", "rgb(84, 201, 210)");
			await expect(reviewMark).toHaveAttribute("opacity", "0.28");
			await expect(todo.locator("..")).toHaveAttribute("data-active", "true");
			const tooltipBounds = (await tooltip.boundingBox())!;
			expect(tooltipBounds.x).toBeGreaterThanOrEqual(0);
			expect(tooltipBounds.x + tooltipBounds.width).toBeLessThanOrEqual(width + 1);

			await noPriorityMark.click();
			let detail = sample.getByRole("complementary", { name: "Todo · No priority" });
			await expect(detail).toContainText("108 matching issues");
			await expect(chart).toBeVisible();
			const close = detail.getByRole("button", { name: "Close panel" });
			await expect(close).toBeFocused();
			await close.press("Enter");
			await expect(detail).toHaveCount(0);
			await expect(todo).toBeFocused();
			await review.press("Enter");
			detail = sample.getByRole("complementary", { name: "In Review · No priority" });
			await expect(detail).toContainText("8 matching issues");
			await expect(review).toHaveAttribute("aria-expanded", "true");
			await detail.getByRole("button", { name: "Close panel" }).press("Space");
			await expect(review).toBeFocused();
			await expect(review).toHaveAttribute("aria-expanded", "false");

			const viewport = sample.getByRole("region", { name: "Scroll insight counts" });
			await expect(viewport).toHaveCSS("scrollbar-width", "none");
			if (width === 320) {
				const scrollbar = sample.locator(
					'[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]'
				);
				await expect(scrollbar).toHaveCSS("position", "absolute");
				expect(await viewport.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeGreaterThan(0);
			}
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		});
	}
}
