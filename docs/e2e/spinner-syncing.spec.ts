import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Circular loading preserves button alignment and focus in ${colorScheme}`, async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 850 });
		await page.emulateMedia({ colorScheme, reducedMotion: "no-preference" });
		await page.goto("/docs/components/spinner", { waitUntil: "networkidle" });
		await page.clock.install();
		await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));

		const sample = page.getByRole("region", { name: "Button loading example" });
		const button = sample.getByRole("button", { name: "Refresh list" });
		const status = sample.getByRole("status");
		const sizeBefore = await button.boundingBox();
		await button.press("Enter");
		const spinner = button.locator('[data-slot="spinner"]');
		await expect(button).toHaveAttribute("aria-busy", "true");
		await expect(button).toBeFocused();
		await expect(status).toHaveText("Updating…");
		await expect(status).toHaveCount(1);
		await expect(spinner).toHaveAttribute("aria-hidden", "true");
		await expect(spinner).toHaveCSS("height", "14px");
		await expect(spinner).toHaveCSS("width", "14px");
		await expect(spinner).toHaveCSS("animation-name", "spin");
		const sizeDuring = await button.boundingBox();
		expect(sizeDuring?.width).toBe(sizeBefore?.width);
		expect(sizeDuring?.height).toBe(sizeBefore?.height);

		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await expect(spinner).toHaveCSS("animation-name", "none");
		await page.clock.runFor(700);
		await button.press("Space");
		await page.clock.runFor(550);
		await expect(status).toHaveText("List updated.");
		await expect(button).not.toHaveAttribute("aria-busy");
		await expect(button).toBeFocused();
	});

	for (const width of [320, 1280]) {
		test(`Sync spinner keeps the inline row and keyboard focus at ${width}px in ${colorScheme}`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 800 });
			await page.emulateMedia({ colorScheme, reducedMotion: "no-preference" });
			await page.goto("/docs/components/spinner", { waitUntil: "networkidle" });
			await page.clock.install();
			await page.clock.pauseAt(Date.now() + 1000);

			const sample = page.getByRole("region", { name: "Sync indicator example", exact: true });
			const button = sample.getByRole("button", { name: "Sync changes", exact: true });
			const status = sample.getByRole("status");
			await button.focus();
			const row = await status.boundingBox();
			await button.press("Enter");
			await expect(button).toBeFocused();
			await expect(button).toHaveAttribute("aria-disabled", "true");
			await expect(status).toHaveCount(1);
			const spinner = status.locator('[data-slot="spinner"][data-appearance="dots"]');
			const label = spinner.locator('[data-slot="spinner-label"]');
			const dots = spinner.locator('[data-slot="spinner-dot"]');
			await expect(label).toHaveText("Syncing");
			await expect(status).toMatchAriaSnapshot("- status: Syncing");
			await expect(spinner).toHaveCSS("height", "24px");
			await expect(label).toHaveCSS("font-size", "12px");
			await expect(label).toHaveCSS("font-weight", "500");
			await expect(label).toHaveCSS(
				"color",
				colorScheme === "dark" ? "lch(100 0 272)" : "lch(9.444 0 282)"
			);
			await expect(dots).toHaveText([".", ".", "."]);
			await expect(dots.first().locator("..")).toHaveAttribute("aria-hidden", "true");
			await expect(dots.first()).toHaveCSS("font-family", /mono/i);
			expect((await dots.first().boundingBox())!.width).toBeCloseTo(4.8, 1);
			expect((await dots.first().locator("..").boundingBox())!.width).toBeCloseTo(14.4, 1);
			await expect(dots.first()).toHaveCSS("animation-duration", "1s");
			await expect(dots.nth(1)).toHaveCSS("animation-delay", "0.166s");
			await expect(dots.nth(2)).toHaveCSS("animation-delay", "0.332s");
			expect(await status.boundingBox()).toEqual(row);

			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			for (const dot of await dots.all()) {
				await expect(dot).toHaveCSS("animation-name", "none");
				await expect(dot).toHaveCSS("opacity", "1");
			}

			await page.clock.runFor(100);
			await button.press("Space");
			await page.clock.runFor(2100);
			await expect(status).toHaveText("Synced");
			await expect(status).toMatchAriaSnapshot("- status: Synced");
			await expect(spinner).toHaveCount(0);
			await expect(button).toBeEnabled();
			await expect(button).toBeFocused();
			expect(await status.boundingBox()).toEqual(row);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		});
	}
}
