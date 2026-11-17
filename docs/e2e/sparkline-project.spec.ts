import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Project Sparkline preserves weekly gaps in ${colorScheme} at ${width}px`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 820 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/docs/components/sparkline", { waitUntil: "networkidle" });

			const defaultChart = page.locator(
				'[data-slot="static-sparkline"][data-appearance="default"]'
			);
			await expect(defaultChart).toHaveAttribute("viewBox", "0 0 72 40");
			await expect(defaultChart).toHaveAttribute("width", "144");
			await expect(defaultChart).toHaveAttribute("height", "80");
			await expect(defaultChart).toHaveAttribute("aria-hidden", "true");
			await expect(defaultChart.locator('[data-slot="sparkline-line"]')).toHaveAttribute(
				"d",
				"M4.00,36.00 L14.67,24.00 L25.33,28.00  M46.67,20.00 L57.33,4.00 L68.00,12.00"
			);
			await expect(defaultChart.locator("circle")).toHaveCount(6);
			await expect(defaultChart.locator('[data-slot="sparkline-area"]')).toHaveCount(0);

			const figure = page.getByRole("figure", { name: "Completed" });
			const chart = figure.locator('[data-slot="static-sparkline"][data-appearance="project"]');
			const line = chart.locator('[data-slot="sparkline-line"]');
			const area = chart.locator('[data-slot="sparkline-area"]');
			const allWeeks = figure.getByRole("button", { name: "All weeks", exact: true });
			const missingWeek = figure.getByRole("button", { name: "Missing week", exact: true });

			await expect(chart).toHaveAttribute("viewBox", "0 0 104 32");
			await expect(chart).toHaveAttribute("aria-hidden", "true");
			await expect(chart).toHaveAttribute("focusable", "false");
			await expect(chart).toHaveCSS("color", "rgb(94, 105, 209)");
			await expect(line).toHaveAttribute("stroke-width", "1.5");
			await expect(line).toHaveAttribute("stroke-linecap", "round");
			await expect(area).toHaveAttribute("d", /^M4\.00,28\.00.+V28 H4\.00 Z$/);
			await expect(chart.locator("linearGradient stop").first()).toHaveAttribute(
				"stop-opacity",
				"0.22"
			);
			await expect(chart.locator("linearGradient stop").last()).toHaveAttribute(
				"stop-opacity",
				"0"
			);
			await expect(chart.locator("circle")).toHaveCount(1);
			await expect(chart.locator("circle")).toHaveAttribute("cx", "100");
			await expect(figure.getByText("Weekly totals: 0, 3, 3, 5, 8, 11, 13")).toBeVisible();
			expect(
				await chart.evaluate((element) => element.getAnimations({ subtree: true }).length)
			).toBe(0);

			await allWeeks.focus();
			await page.keyboard.press("Tab");
			await expect(missingWeek).toBeFocused();
			await page.keyboard.press("Space");
			await expect(missingWeek).toBeFocused();
			await expect(missingWeek).toHaveAttribute("aria-pressed", "true");
			await expect(figure.getByText("Weekly totals: 0, 3, 3, missing, 8, 11, 13")).toBeVisible();
			await expect(line).toHaveAttribute("d", /^M4\.00,28\.00.+L36\.00,[^ ]+  M68\.00,.+$/);
			await expect(area).toHaveAttribute(
				"d",
				/^M4\.00,28\.00.+V28 H4\.00 Z M68\.00,.+V28 H68\.00 Z$/
			);
			await expect(chart.locator("circle")).toHaveCount(1);
			await page.keyboard.press("Shift+Tab");
			await expect(allWeeks).toBeFocused();
			await page.keyboard.press("Enter");
			await expect(allWeeks).toBeFocused();
			await expect(allWeeks).toHaveAttribute("aria-pressed", "true");
			await expect(figure.getByText("Weekly totals: 0, 3, 3, 5, 8, 11, 13")).toBeVisible();

			const [figureBox, chartBox] = await Promise.all([figure.boundingBox(), chart.boundingBox()]);
			if (!figureBox || !chartBox) throw new Error("The Project Sparkline did not render.");
			expect(chartBox.width).toBe(104);
			expect(chartBox.height).toBe(32);
			expect(chartBox.x + chartBox.width).toBeLessThan(figureBox.x + figureBox.width);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		});
	}
}
