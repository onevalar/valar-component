import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Slider Field readout fits and retains focus in ${colorScheme} at ${width}px`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 820 });
			await page.emulateMedia({ colorScheme });
			await page.goto("/docs/components/slider-field", { waitUntil: "networkidle" });

			const row = page.locator(
				'[data-slot="slider-field"][data-appearance="readout"]:not([data-disabled])'
			);
			const label = row.getByText("Contrast", { exact: true });
			const control = row.locator('[data-slot="slider-field-control"]');
			const slider = row.getByRole("slider", { name: "Contrast", exact: true });
			const track = row.locator('[data-slot="slider-track"]');
			const readout = row.locator('[data-slot="slider-field-readout"]');
			const disabledRow = page.locator(
				'[data-slot="slider-field"][data-appearance="readout"][data-disabled]'
			);
			const disabled = disabledRow.getByRole("slider", {
				name: "Contrast (disabled)",
				exact: true
			});

			await expect(row).toHaveCSS("padding-inline-start", "16px");
			await expect(control).toHaveCSS("height", "32px");
			await expect(control).toHaveCSS("column-gap", "8px");
			await expect(label).toHaveCSS("font-size", "13px");
			await expect(label).toHaveCSS("font-weight", "450");
			await expect(readout).toHaveCSS("font-size", "13px");
			await expect(readout).toHaveCSS("font-weight", "500");
			await expect(readout).toHaveCSS("padding-inline-start", "4px");
			await expect(label).toHaveCSS(
				"color",
				colorScheme === "light" ? "rgb(94, 94, 95)" : "rgb(154, 156, 154)"
			);
			await expect(readout).toHaveCSS(
				"color",
				colorScheme === "light" ? "rgb(48, 48, 49)" : "rgb(228, 229, 227)"
			);
			await expect(track).toHaveCSS("height", "6px");
			await expect(track).toHaveCSS(
				"background-color",
				colorScheme === "light" ? "rgb(227, 227, 227)" : "rgb(47, 49, 47)"
			);
			await expect(row.locator('[data-slot="slider-range"]')).toHaveCount(0);
			await expect(slider).toHaveCSS("width", "20px");
			await expect(slider).toHaveCSS("height", "20px");
			await expect(row.getByRole("spinbutton")).toHaveCount(0);
			await expect(readout).toHaveText("30");

			const [rowBox, labelBox, controlBox, trackBox, readoutBox] = await Promise.all(
				[row, label, control, track, readout].map((part) => part.boundingBox())
			);
			if (!rowBox || !labelBox || !controlBox || !trackBox || !readoutBox)
				throw new Error("The Slider Field layout did not render.");
			expect(readoutBox.x - (trackBox.x + trackBox.width)).toBeCloseTo(8, 1);
			expect(
				Math.abs(trackBox.y + trackBox.height / 2 - (readoutBox.y + readoutBox.height / 2))
			).toBeLessThan(1);
			expect(controlBox.x + controlBox.width).toBeLessThan(rowBox.x + rowBox.width);
			if (width === 320) {
				expect(controlBox.y).toBeGreaterThan(labelBox.y + labelBox.height);
				expect(trackBox.width).toBeGreaterThan(80);
			} else {
				expect(rowBox.width).toBe(640);
				expect(rowBox.height).toBe(64);
				expect(controlBox.width).toBe(250);
				expect(
					Math.abs(controlBox.y + controlBox.height / 2 - (labelBox.y + labelBox.height / 2))
				).toBeLessThan(1);
			}
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);

			await slider.press("ArrowRight");
			await expect(slider).toBeFocused();
			await expect(slider).toHaveAttribute("aria-valuenow", "31");
			await expect(readout).toHaveText("31");
			await expect(slider).toHaveCSS("outline-width", "1px");
			await expect(slider).toHaveCSS("outline-offset", "-1px");
			await slider.press("ArrowLeft");
			await expect(readout).toHaveText("30");
			await slider.press("Home");
			await expect(readout).toHaveText("15");
			await slider.press("End");
			await expect(readout).toHaveText("100");
			await expect(slider).toBeFocused();

			await track.scrollIntoViewIfNeeded();
			const box = (await track.boundingBox())!;
			await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
			const pointerValue = Number(await slider.getAttribute("aria-valuenow"));
			expect(pointerValue).toBeGreaterThan(53);
			expect(pointerValue).toBeLessThan(62);
			await expect(readout).toHaveText(String(pointerValue));
			await expect(disabled).toHaveAttribute("data-disabled", "");
			await expect(disabled).toHaveAttribute("aria-valuenow", "30");
			await expect(disabledRow.locator('[data-slot="slider-field-readout"]')).toHaveText("30");
			await page.keyboard.press("Tab");
			await expect(readout).not.toBeFocused();
			await expect(disabled).not.toBeFocused();
		});
	}
}
