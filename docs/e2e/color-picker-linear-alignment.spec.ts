import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Color Picker fits and supports keyboard color selection in ${colorScheme} at ${width}px`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 820 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/docs/components/color-picker", { waitUntil: "networkidle" });

			const trigger = page.getByRole("button", { name: /^Label color #/ });
			const hiddenColor = page.locator('input[name="label-color"]');
			const popover = page.locator(
				'[data-slot="color-picker-content"][data-color-picker-appearance="label"]'
			);
			const grey = popover.getByRole("button", { name: "Grey", exact: true });
			const darkGrey = popover.getByRole("button", { name: "Dark Grey", exact: true });
			const custom = popover.getByRole("button", { name: "Set custom color", exact: true });
			const palette = popover.getByRole("button", { name: "Select default color", exact: true });
			await expect(trigger).toHaveCSS("width", "25px");
			await expect(trigger).toHaveCSS("height", "25px");
			await expect(trigger.locator('[data-slot="color-picker-swatch"]')).toHaveCSS("width", "9px");
			await expect(page.getByRole("button", { name: /^Locked label color #/ })).toBeDisabled();
			await trigger.press("Enter");
			await expect(grey).toBeFocused();
			await expect(grey).toHaveCSS("width", "22px");
			await expect(grey).toHaveCSS("outline-offset", "-1px");
			await expect(popover.getByRole("button", { name: "Red", exact: true })).toHaveAttribute(
				"aria-pressed",
				"true"
			);
			await expect(popover).toHaveCSS("border-radius", "6px");
			await expect(popover).toHaveCSS(
				"background-color",
				colorScheme === "dark" ? "lch(12.72 0.85 272)" : "rgb(255, 255, 255)"
			);
			const paletteBounds = (await popover.boundingBox())!;
			expect(paletteBounds.x).toBeGreaterThanOrEqual(0);
			expect(paletteBounds.x + paletteBounds.width).toBeLessThanOrEqual(width);
			if (width > 320) {
				await expect(popover).toHaveCSS("width", "414px");
				expect((await darkGrey.boundingBox())!.x - (await grey.boundingBox())!.x).toBe(38);
			}
			await page.keyboard.press("ArrowRight");
			await expect(grey).toBeFocused();
			await page.keyboard.press("Tab");
			await expect(darkGrey).toBeFocused();
			await page.keyboard.press("Space");
			await expect(popover).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect(hiddenColor).toHaveValue("#95a2b3");

			await trigger.press("Enter");
			await custom.press("Enter");
			await expect(palette).toBeFocused();
			const area = popover.getByRole("button", { name: /^Saturation and brightness:/ });
			const hue = popover.getByRole("slider", { name: "Hue" });
			const hex = popover.getByRole("textbox", { name: "HEX", exact: true });
			await expect(area).toHaveCSS("height", "100px");
			await expect(hue).toHaveCSS("width", "6px");
			if (width > 320) await expect(area).toHaveCSS("width", "350px");
			await page.keyboard.press("Tab");
			await expect(area).toBeFocused();
			await page.keyboard.press("ArrowRight");
			await expect(hex).not.toHaveValue("#95a2b3");
			await page.keyboard.press("Tab");
			await expect(hue).toBeFocused();
			await page.keyboard.press("Home");
			await expect(hue).toHaveAttribute("aria-valuenow", "0");
			await page.keyboard.press("ArrowUp");
			await expect(hue).toHaveAttribute("aria-valuenow", "1");
			await hex.fill("#zzzzzz");
			await hex.press("Enter");
			await expect(hex).toHaveAttribute("aria-invalid", "true");
			await expect(popover.getByRole("alert")).toHaveText("Enter a valid hex color.");
			await hex.fill("#AaBbCc");
			await hex.press("Enter");
			await expect(popover).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect(hiddenColor).toHaveValue("#aabbcc");
			await trigger.press("Enter");
			await custom.press("Enter");
			await palette.press("Enter");
			await expect(custom).toBeFocused();
			await page.keyboard.press("Escape");
			await expect(trigger).toBeFocused();
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		});
	}

	test(`Color Picker uses the floating scrollbar in a short ${colorScheme} viewport`, async ({
		page
	}) => {
		await page.setViewportSize({ width: 320, height: 300 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/color-picker", { waitUntil: "networkidle" });
		const trigger = page.locator('.sample [data-slot="color-picker"] button').first();
		await trigger.press("Enter");
		const panel = page.locator('[data-slot="color-picker-content"]:visible').first();
		const viewport = panel.locator('[data-slot="scroll-area-viewport"]');
		await expect(viewport).toBeVisible();
		await expect(panel).toHaveCSS("overflow-y", "hidden");
		const width = await viewport.evaluate((node) => node.clientWidth);
		await viewport.hover();
		await page.mouse.wheel(0, 140);
		await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
		await expect(panel.locator('[data-slot="scroll-area-scrollbar"]')).toHaveCSS(
			"position",
			"absolute"
		);
		expect(await viewport.evaluate((node) => node.clientWidth)).toBe(width);
		await page.keyboard.press("Escape");
		await expect(trigger).toBeFocused();
	});
}
