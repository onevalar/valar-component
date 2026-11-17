import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Slider settings contrast retains geometry and keyboard behavior in ${colorScheme} at ${width}px`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 820 });
			await page.emulateMedia({ colorScheme });
			await page.goto("/docs/components/slider", { waitUntil: "networkidle" });

			const setting = page.locator('[data-slot="theme-contrast-setting"]');
			const label = setting.getByText("Contrast", { exact: true });
			const slider = setting.getByRole("slider", { name: "Contrast", exact: true });
			const root = setting.locator('[data-slot="slider"][data-appearance="settings"]');
			const track = root.locator('[data-slot="slider-track"]');
			const readout = setting.locator('[data-slot="theme-contrast-value"]');
			await expect(slider).toHaveAttribute("aria-valuemin", "15");
			await expect(slider).toHaveAttribute("aria-valuemax", "100");
			await expect(slider).toHaveAttribute("aria-valuenow", "30");
			await expect(readout).toHaveText("30");
			await expect(root).toHaveCSS("height", "32px");
			await expect(track).toHaveCSS("height", "6px");
			await expect(track).toHaveCSS("background-color", colorScheme === "light" ? "rgb(227, 227, 227)" : "rgb(47, 49, 47)");
			await expect(root.locator('[data-slot="slider-range"]')).toHaveCount(0);
			await expect(slider).toHaveCSS("width", "20px");
			await expect(slider).toHaveCSS("height", "20px");
			await expect(slider).toHaveCSS("background-color", "rgb(255, 255, 255)");
			await expect(label).toHaveCSS("font-size", "13px");
			await expect(label).toHaveCSS("color", colorScheme === "light" ? "rgb(94, 94, 95)" : "rgb(154, 156, 154)");
			await expect(readout).toHaveCSS("color", colorScheme === "light" ? "rgb(48, 48, 49)" : "rgb(228, 229, 227)");

			const trackBox = (await track.boundingBox())!;
			const settingBox = (await setting.boundingBox())!;
			const labelBox = (await label.boundingBox())!;
			const readoutBox = (await readout.boundingBox())!;
			expect(readoutBox.x - (trackBox.x + trackBox.width)).toBeCloseTo(12, 1);
			expect(trackBox.y + trackBox.height / 2).toBeCloseTo(readoutBox.y + readoutBox.height / 2, 1);
			expect(readoutBox.x + readoutBox.width).toBeLessThanOrEqual(settingBox.x + settingBox.width);
			if (width === 320) {
				expect(trackBox.y).toBeGreaterThan(labelBox.y + labelBox.height);
				expect(trackBox.width).toBeGreaterThan(80);
			} else {
				expect(settingBox.width).toBe(640);
				expect(settingBox.height).toBeCloseTo(64, 1);
				expect(trackBox.width).toBeGreaterThan(215);
				expect(trackBox.width).toBeLessThan(227);
				expect(trackBox.y + trackBox.height / 2).toBeCloseTo(labelBox.y + labelBox.height / 2, 1);
			}
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);

			await slider.press("ArrowRight");
			await expect(slider).toBeFocused();
			await expect(slider).toHaveAttribute("aria-valuenow", "31");
			await expect(readout).toHaveText("31");
			await expect(slider).toHaveCSS("outline-style", "solid");
			await expect(slider).toHaveCSS("outline-width", "1px");
			await expect(slider).toHaveCSS("outline-offset", "-1px");
			await expect(slider).toHaveCSS("outline-color", "rgb(109, 119, 212)");
			await slider.press("Home");
			await expect(readout).toHaveText("15");
			await slider.press("ArrowLeft");
			await expect(readout).toHaveText("15");
			await slider.press("End");
			await expect(readout).toHaveText("100");
			await slider.press("ArrowRight");
			await expect(readout).toHaveText("100");

			await track.scrollIntoViewIfNeeded();
			const latestTrack = (await track.boundingBox())!;
			await page.mouse.click(latestTrack.x + latestTrack.width / 2, latestTrack.y + latestTrack.height / 2);
			const pointerValue = Number(await slider.getAttribute("aria-valuenow"));
			expect(pointerValue).toBeGreaterThan(53);
			expect(pointerValue).toBeLessThan(62);
			await expect(readout).toHaveText(String(pointerValue));
		});
	}
}
