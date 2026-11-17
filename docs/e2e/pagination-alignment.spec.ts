import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Pagination results keeps compact controls and page boundaries at 320px in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 850 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/pagination", {
			waitUntil: "networkidle",
		});
		const records = page.getByRole("region", {
			name: "Usage records",
			exact: true,
		});
		const nav = records.getByRole("navigation", {
			name: "Usage results pagination",
		});
		const back = nav.getByRole("button", { name: "Back", exact: true });
		const forward = nav.getByRole("button", { name: "Forward", exact: true });
		const count = nav.getByRole("status");
		const dark = colorScheme === "dark";

		const empty = page.getByRole("navigation", {
			name: "Empty results pagination",
		});
		await expect(empty.getByRole("status")).toHaveText("0 results");
		for (const button of await empty.getByRole("button").all()) {
			await expect(button).toBeDisabled();
			await expect(button).toHaveCSS("opacity", "0.6");
			await expect(button).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
			await expect(button).toHaveCSS("width", "24px");
			await expect(button).toHaveCSS("height", "24px");
			await expect(button.locator("svg")).toHaveCSS("width", "14px");
			await expect(button).toHaveCSS(
				"color",
				dark ? "lch(90.451 1.2 272)" : "lch(19.588 1.25 282)",
			);
		}
		await expect(empty.getByRole("button")).toHaveCount(2);

		await expect(count).toHaveText("1–3 of 7 results");
		await expect(count).toHaveCSS("font-size", "12px");
		await expect(count).toHaveCSS("line-height", "14.5px");
		await expect(count).toHaveCSS("font-weight", "450");
		await expect(count).toHaveCSS(
			"color",
			dark ? "lch(61.803 1.2 272)" : "lch(39.176 1.25 282)",
		);
		const backBox = (await back.boundingBox())!;
		const forwardBox = (await forward.boundingBox())!;
		const countBox = (await count.boundingBox())!;
		expect(forwardBox.x - backBox.x - backBox.width).toBe(2);
		expect(countBox.x - forwardBox.x - forwardBox.width).toBe(8);
		await expect(
			records.getByRole("link", { name: "Export CSV", exact: true }),
		).toHaveCSS("height", "28px");

		await expect(back).toBeDisabled();
		await expect(forward).toBeEnabled();
		await forward.focus();
		await forward.press("Shift+Tab");
		await page.keyboard.press("Tab");
		await expect(forward).toBeFocused();
		await expect(forward).toHaveCSS("outline-offset", "-1px");
		await expect(forward).toHaveCSS("outline-style", "solid");
		await forward.press("Enter");
		await expect(count).toHaveText("4–6 of 7 results");
		await expect(forward).toBeFocused();
		await expect(back).toBeEnabled();
		await expect(records.getByRole("listitem").first()).toHaveText(
			"Draft usage report",
		);
		await forward.press("Space");
		await expect(count).toHaveText("7–7 of 7 results");
		await expect(forward).toBeDisabled();
		await expect(back).toBeFocused();
		await expect(records.getByRole("listitem")).toHaveCount(1);
		await back.press("Enter");
		await expect(count).toHaveText("4–6 of 7 results");
		await back.press("Space");
		await expect(count).toHaveText("1–3 of 7 results");
		await expect(back).toBeDisabled();
		await expect(forward).toBeFocused();
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth),
		).toBe(320);
	});

	test(`Pagination numbered controls use an overlay when space runs out in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 850 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/pagination", {
			waitUntil: "networkidle",
		});
		const viewport = page.getByRole("region", { name: "Scroll page numbers" });
		const numbered = viewport.getByRole("navigation", {
			name: "Numbered pagination",
		});
		const current = numbered.getByRole("button", { name: "Page 4", exact: true });
		const previous = numbered.getByRole("button", { name: "Previous page", exact: true });
		await expect(current).toHaveAttribute("aria-current", "page");
		await expect(current).toHaveCSS("height", "32px");
		await expect(previous).toHaveCSS("height", "32px");
		expect(await current.evaluate((node) => getComputedStyle(node).borderRadius)).toBe(
			await previous.evaluate((node) => getComputedStyle(node).borderRadius),
		);
		await expect(viewport).toHaveCSS("scrollbar-width", "none");
		await expect
			.poll(() =>
				viewport.evaluate((node) => node.scrollWidth - node.clientWidth),
			)
			.toBeGreaterThan(0);
		const height = await viewport.evaluate((node) => node.clientHeight);
		await viewport.press("ArrowRight");
		await expect
			.poll(() => viewport.evaluate((node) => node.scrollLeft))
			.toBeGreaterThan(0);
		await viewport.hover();
		const bar = viewport
			.locator("xpath=ancestor::*[@data-slot='scroll-area'][1]")
			.locator(
				"[data-slot='scroll-area-scrollbar'][data-orientation='horizontal']",
			);
		await expect(bar).toBeVisible();
		await expect(bar).toHaveCSS("position", "absolute");
		expect(await viewport.evaluate((node) => node.clientHeight)).toBe(height);
		await current.press("ArrowRight");
		const nextPage = numbered.getByRole("button", { name: "Page 5", exact: true });
		await expect(nextPage).toBeFocused();
		await nextPage.press("Enter");
		await expect(nextPage).toHaveAttribute("aria-current", "page");
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth),
		).toBe(320);
	});
}
