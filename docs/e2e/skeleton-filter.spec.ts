import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Skeleton filter placeholders reserve the issue rows at ${width}px in ${colorScheme}`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 800 });
			await page.emulateMedia({ colorScheme, reducedMotion: "no-preference" });
			await page.goto("/docs/components/skeleton", { waitUntil: "networkidle" });
			await page.clock.install();
			await page.clock.pauseAt(Date.now() + 1000);
			const sample = page.getByRole("region", { name: "Issue filter placeholders" });
			const trigger = sample.getByRole("button", { name: "Generate filters" });
			const filters = sample.getByRole("group", { name: "Issue filters" });
			const status = sample.getByRole("status");
			const issues = sample.getByRole("list", { name: "Issues" });
			await trigger.focus();
			const listBounds = (await issues.boundingBox())!;
			await trigger.press("Enter");
			await expect(trigger).toBeFocused();
			await expect(filters).toHaveAttribute("aria-busy", "true");
			await expect(status).toHaveText("Generating filters…");
			const shapes = filters.locator('[data-slot="skeleton"][data-appearance="filter"]');
			await expect(shapes).toHaveCount(3);
			await expect(shapes.first()).toHaveAttribute("aria-hidden", "true");
			await expect(shapes.first()).toHaveCSS("height", "24px");
			await expect(shapes.first()).toHaveCSS("border-radius", "8px");
			await expect(shapes.first()).toHaveCSS("border-width", "0px");
			await expect(shapes.first()).toHaveCSS("background-image", "none");
			await expect(shapes.first()).toHaveCSS(
				"background-color",
				colorScheme === "dark" ? "lch(7.32 0.85 272)" : "lch(92.44 0.5 282)"
			);
			await expect(shapes.first()).toHaveCSS("animation-duration", "1.2s, 2s");
			await expect(shapes.first()).toHaveCSS("animation-iteration-count", "1, infinite");
			await expect(shapes.nth(1)).toHaveCSS("animation-delay", "0.25s, 1.45s");
			await expect(shapes.nth(2)).toHaveCSS("animation-delay", "0.5s, 1.7s");
			const pendingBounds = await Promise.all((await shapes.all()).map((shape) => shape.boundingBox()));
			expect(pendingBounds[1]!.x - pendingBounds[0]!.x - pendingBounds[0]!.width).toBe(8);
			expect(pendingBounds[2]!.x - pendingBounds[1]!.x - pendingBounds[1]!.width).toBe(8);
			expect(pendingBounds[2]!.x + pendingBounds[2]!.width).toBeLessThanOrEqual(width);
			expect(await issues.boundingBox()).toEqual(listBounds);
			await expect(sample.locator('[data-slot="skeleton"][tabindex]')).toHaveCount(0);

			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await expect(shapes.first()).toHaveCSS("animation-name", "none");
			await expect(shapes.first()).toHaveCSS("opacity", "1");
			await page.clock.fastForward(2600);
			await expect(filters).toHaveAttribute("aria-busy", "false");
			await expect(status).toHaveText("3 filters applied");
			await expect(shapes).toHaveCount(0);
			const chips = filters.locator('[data-slot="badge"]');
			await expect(chips).toHaveCount(3);
			await expect(chips.first()).toHaveText("Status is In progress");
			expect(await Promise.all((await chips.all()).map((chip) => chip.boundingBox()))).toEqual(
				pendingBounds
			);
			expect(await issues.boundingBox()).toEqual(listBounds);
			await expect(trigger).toBeFocused();
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		});
	}
}
