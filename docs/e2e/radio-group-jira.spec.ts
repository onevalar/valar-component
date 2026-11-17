import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Jira Radio Group uses measured default states in ${colorScheme} at ${width}px`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 820 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/docs/components/radio-group", { waitUntil: "networkidle" });

			const group = page.getByRole("radiogroup", { name: "Jira data source", exact: true });
			const credentials = group.getByRole("radio", {
				name: "Provide API credentials",
				exact: true
			});
			const csv = group.getByRole("radio", { name: "Upload a CSV", exact: true });
			const credentialLabel = group.getByText("Provide API credentials", { exact: true });
			const csvLabel = group.getByText("Upload a CSV", { exact: true });
			const rows = group.locator('[data-slot="jira-source-option"]');
			const selected = (option: typeof credentials) =>
				option.locator('[data-slot="radio-group-indicator"] svg');
			const dark = colorScheme === "dark";
			const accent = dark ? "lch(47.918 59.303 288.421)" : "lch(53 52.26 286.91)";
			const border = dark ? "lch(20.032 1.93 272)" : "lch(86.5 0 282)";
			const dot = dark ? "lch(100 5 288.421)" : "lch(100 5 286.91)";

			await expect(group).toHaveCSS("row-gap", "16px");
			await expect(credentials).toBeChecked();
			await expect(csv).not.toBeChecked();
			for (const option of [credentials, csv]) {
				await expect(option).toHaveCSS("width", "16px");
				await expect(option).toHaveCSS("height", "16px");
				await expect(option).toHaveCSS("border-width", "1px");
				await expect(option).toHaveCSS("box-shadow", "none");
				await expect(option).toHaveCSS("transition-duration", "0s");
				expect(
					await option.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius))
				).toBeGreaterThanOrEqual(8);
			}
			await expect(credentials).toHaveCSS("border-color", accent);
			await expect(credentials).toHaveCSS("background-color", accent);
			await expect(selected(credentials)).toHaveCSS("width", "4px");
			await expect(selected(credentials)).toHaveCSS("height", "4px");
			await expect(selected(credentials)).toHaveCSS("background-color", dot);
			await expect(selected(csv)).toHaveCount(0);
			await expect(csv).toHaveCSS("border-color", border);
			await expect(csv).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
			await expect(credentialLabel).toHaveCSS("font-size", "13px");
			await expect(credentialLabel).toHaveCSS("font-weight", "500");
			await expect(credentialLabel).toHaveCSS("color", dark ? "lch(100 0 272)" : "lch(10 0 282)");

			const [radioBox, labelBox, firstRow, secondRow] = await Promise.all([
				credentials.boundingBox(),
				credentialLabel.boundingBox(),
				rows.first().boundingBox(),
				rows.nth(1).boundingBox()
			]);
			expect(labelBox!.x - radioBox!.x - radioBox!.width).toBeCloseTo(12, 1);
			expect(secondRow!.y - firstRow!.y - firstRow!.height).toBeCloseTo(16, 1);

			await credentials.press("ArrowDown");
			await expect(csv).toBeFocused();
			await expect(csv).toBeChecked();
			await expect(credentials).not.toBeChecked();
			await expect(csv).toHaveCSS("outline-style", "solid");
			await expect(csv).toHaveCSS("outline-width", "1px");
			await expect(csv).toHaveCSS("outline-offset", "-1px");
			await expect(csv).toHaveCSS("outline-color", dot);
			await expect(csv).toHaveCSS("box-shadow", "none");
			await csv.press("ArrowUp");
			await expect(credentials).toBeFocused();
			await expect(credentials).toBeChecked();
			await csvLabel.click();
			await expect(csv).toBeChecked();

			if (width === 320) {
				await group.evaluate((el) => (el.style.maxWidth = "128px"));
				await expect(credentials).toHaveCSS("width", "16px");
				await expect(credentials).toHaveCSS("height", "16px");
				expect((await credentialLabel.boundingBox())!.height).toBeGreaterThan(labelBox!.height);
				expect(await group.evaluate((el) => el.scrollWidth)).toBe(128);
			}
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await expect(csv).toHaveCSS("transition-property", "background-color, border-color");
			await expect(csv).toHaveCSS("transition-duration", "0.08s");
		});
	}
}
