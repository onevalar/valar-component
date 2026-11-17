import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Progress fills from the inline start and fits at 320px in ${colorScheme}`, async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 850 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/progress", { waitUntil: "networkidle" });

		const progress = page.getByRole("progressbar", { name: "Uploading files", exact: true });
		const fill = progress.locator('[data-slot="progress-indicator"]');
		await expect(fill).toHaveCSS("transition-property", "none");
		await expect(fill).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(62 48 288.421)" : "lch(53 52.26 286.91)",
		);
		await expect(progress).toHaveCSS("height", "4px");
		await expect(progress).toHaveAttribute("aria-valuenow", "30");

		function measure(track: HTMLElement | SVGElement) {
			const trackBox = track.getBoundingClientRect();
			const fillBox = track.querySelector('[data-slot="progress-indicator"]')!.getBoundingClientRect();
			return {
				widthRatio: fillBox.width / trackBox.width,
				left: fillBox.left - trackBox.left,
				right: trackBox.right - fillBox.right
			};
		}

		const leftToRight = await progress.evaluate(measure);
		expect(leftToRight.widthRatio).toBeCloseTo(0.5, 2);
		expect(leftToRight.left).toBeCloseTo(0, 1);
		await progress.evaluate((node) => node.setAttribute("dir", "rtl"));
		const rightToLeft = await progress.evaluate(measure);
		expect(rightToLeft.widthRatio).toBeCloseTo(0.5, 2);
		expect(rightToLeft.right).toBeCloseTo(0, 1);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});

	for (const width of [1200, 390]) {
		test.describe(`${colorScheme} at ${width}px`, () => {
			test.beforeEach(async ({ page }) => {
				await page.setViewportSize({ width, height: 900 });
				await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			});

			test("Alert keeps controls inside narrow containers and preserves keyboard operation", async ({
				page,
			}) => {
				await page.goto("/docs/components/alert");
				const tip = page.getByRole("group", { name: "Triage guidance" });
				const action = tip.getByRole("button", { name: "View details" });
				await expect(tip).toHaveCSS("border-radius", "10px");
				await expect(tip).toHaveCSS(
					"background-color",
					colorScheme === "dark" ? "lch(9.232 0.85 272)" : "lch(100 0 282)"
				);
				if (width === 1200) {
					await expect(tip.locator('[data-slot="alert-action"]')).toHaveCSS(
						"grid-column-start",
						"2"
					);
				}
				// Exercise a narrow embed even in the desktop viewport.
				await tip.evaluate((node) => {
					node.style.width = "250px";
				});
				const geometry = await tip.evaluate((node) => {
					const description = node
						.querySelector('[data-slot="alert-description"]')!
						.getBoundingClientRect();
					const button = node.querySelector("button")!.getBoundingClientRect();
					const root = node.getBoundingClientRect();
					return {
						gap: button.top - description.bottom,
						remaining: root.right - button.right,
						textWidth: description.width,
					};
				});
				expect(geometry.gap).toBeGreaterThanOrEqual(8);
				expect(geometry.remaining).toBeGreaterThanOrEqual(16);
				expect(geometry.textWidth).toBeGreaterThanOrEqual(200);

				await action.focus();
				await action.press("Enter");
				await expect(tip.getByRole("button", { name: "Hide details" })).toBeFocused();
				await expect(
					page.getByText("Incoming issues stay in Triage until someone reviews them.")
				).toBeVisible();
				const connection = page.getByRole("group", { name: "Connection" });
				const retry = connection.getByRole("button", { name: "Reconnect" });
				await retry.focus();
				await expect(retry).toHaveCSS("outline-offset", "-1px");
				await retry.press("Enter");
				await expect(page.getByText("Still offline.", { exact: true })).toBeVisible();
				await page.keyboard.press("Tab");
				await expect(page.getByRole("button", { name: "Simulate recovery" })).toBeFocused();
				await page.keyboard.press("Enter");
				await expect(connection).toHaveCount(0);
				await expect(page.getByText("Connection restored.", { exact: true })).toBeVisible();
				await expect(page.getByRole("button", { name: "Simulate offline" })).toBeFocused();
				await expect(page.getByRole("group", { name: "Payment error example" })).toContainText(
					"Payment failed"
				);
			});

			test("Progress retains readable endpoints and treats bad ranges as unknown", async ({
				page,
			}) => {
				await page.goto("/docs/components/progress");
				const project = page.getByRole("progressbar", { name: "Project progress" });
				const slider = page.getByRole("slider", { name: "Adjust project progress" });
				await expect(project).toHaveText("0%");
				await expect(project).toHaveCSS("font-size", "12px");
				await expect(project).toHaveCSS(
					"color",
					colorScheme === "dark" ? "lch(90.451 1.2 272)" : "lch(19.588 1.25 282)"
				);
				await slider.press("End");
				await expect(project).toHaveText("100%");
				await expect(project).toHaveAttribute("aria-valuenow", "100");
				await slider.press("Home");
				await expect(project).toHaveText("0%");

				const middle = page.getByRole("progressbar", { name: "Uploading files", exact: true });
				await expect(middle).toHaveAttribute("aria-valuemin", "10");
				await expect(middle).toHaveAttribute("aria-valuemax", "50");
				await expect(middle).toHaveAttribute("aria-valuenow", "30");
				const fill = middle.locator('[data-slot="progress-indicator"]');
				expect(
					await fill.evaluate((node) => node.clientWidth / node.parentElement!.clientWidth)
				).toBeCloseTo(0.5, 2);
				const completed = page.getByRole("progressbar", { name: "Upload complete" });
				await expect(completed).toHaveAttribute("data-state", "loaded");
				expect(
					await completed.evaluate((track) =>
						track.querySelector('[data-slot="progress-indicator"]')!.getBoundingClientRect().width -
						track.getBoundingClientRect().width
					)
				).toBe(0);
				for (const name of ["Preparing files", "Waiting for a valid range"]) {
					const track = page.getByRole("progressbar", { name, exact: true });
					expect(await track.getAttribute("aria-valuenow")).toBeNull();
					await expect(track).toHaveAttribute("data-state", "indeterminate");
					await expect(track.locator('[data-slot="progress-indicator"]')).toHaveCSS(
						"animation-name",
						"none"
					);
				}
			});
		});
	}
}

test("Loading indicators keep their shape without motion when requested", async ({ page }) => {
	for (const [slug, animation] of [
		["skeleton", "pulse"],
		["spinner", "spin"],
	]) {
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await page.goto(`/docs/components/${slug}`);
		const indicator = page.locator(`.sample [data-slot="${slug}"]`).first();
		await expect(indicator).toBeVisible();
		await expect(indicator).toHaveCSS("animation-name", animation);
		await page.emulateMedia({ reducedMotion: "reduce" });
		await expect(indicator).toBeVisible();
		await expect(indicator).toHaveCSS("animation-name", "none");
	}
});
