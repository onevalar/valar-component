import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Trace retry keeps keyboard focus in a 320 px ${colorScheme} preview`, async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 844 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/trace", { waitUntil: "networkidle" });
		await page.clock.install();

		const example = page.getByRole("region", {
			name: "Local tool retry example",
			exact: true
		});
		const disclosure = example.getByRole("button", {
			name: "Issue search failed",
			exact: true
		});
		const retry = example.getByRole("button", {
			name: "Retry search",
			exact: true
		});
		const feedback = example.getByRole("status");
		const link = example.getByRole("link", {
			name: "Read about tool states",
			exact: true
		});
		await expect(retry).toBeHidden();
		await disclosure.press("Space");
		await expect(disclosure).toHaveAttribute("aria-expanded", "true");
		await expect(disclosure).toBeFocused();
		await page.keyboard.press("Tab");
		await expect(retry).toBeFocused();
		await expect(retry).toHaveCSS("height", "24px");
		const idleWidth = (await retry.boundingBox())!.width;
		const spinner = retry.locator('[data-slot="spinner"]');
		await expect(retry).toHaveCSS("box-shadow", /inset/);
		const outlineOffset = await retry.evaluate((node) => getComputedStyle(node).outlineOffset);
		expect(parseFloat(outlineOffset)).toBeLessThanOrEqual(0);
		await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));

		await retry.press("Enter");
		await expect(retry).toHaveAttribute("aria-busy", "true");
		await expect(retry).toHaveAttribute("aria-disabled", "true");
		await expect(spinner).toHaveCSS("width", "14px");
		await expect(spinner).toHaveCSS("animation-name", "none");
		await expect(spinner).toHaveAttribute("aria-hidden", "true");
		expect((await retry.boundingBox())!.width).toBe(idleWidth);
		await expect(feedback).toHaveText("Retrying search…");
		await retry.press("Space");
		await disclosure.press("Enter");
		await page.clock.runFor(100);
		await expect(disclosure).toHaveAttribute("aria-expanded", "false");
		await expect(retry).toBeHidden();
		await disclosure.press("Space");
		await page.clock.runFor(100);
		await expect(feedback).toHaveText("Retrying search…");
		await page.keyboard.press("Tab");
		await expect(retry).toBeFocused();
		await page.clock.runFor(701);
		await expect(feedback).toHaveText("Retry failed. Try again.");
		await expect(feedback).toHaveClass(/text-destructive/);
		await expect(retry).toBeFocused();
		await expect(retry).not.toHaveAttribute("aria-disabled");

		await retry.press("Space");
		await expect(feedback).toHaveText("Retrying search…");
		await page.clock.runFor(701);
		await expect(feedback).toHaveText("Search retried successfully.");
		await expect(spinner).toHaveCount(0);
		await expect(retry).toHaveAttribute("aria-disabled", "true");
		await expect(retry).not.toHaveAttribute("aria-busy");
		await expect(retry).toBeFocused();
		await retry.press("Enter");
		await expect(feedback).toHaveText("Search retried successfully.");

		expect(
			await example.evaluate((node) => node.scrollWidth - node.clientWidth)
		).toBeLessThanOrEqual(0);
		await page.keyboard.press("Tab");
		await expect(link).toBeFocused();
		await expect(link).toHaveAttribute("href", "#status");
		await link.press("Enter");
		await expect(page).toHaveURL(/#status$/);
	});
}
