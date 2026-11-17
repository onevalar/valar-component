import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Project navigation retains route, focus and overlay geometry at 320px in ${colorScheme}`, async ({
		page
	}) => {
		await page.setViewportSize({ width: 320, height: 850 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/navigation-menu", { waitUntil: "networkidle" });
		const nav = page.getByRole("navigation", { name: "Project navigation", exact: true });
		const viewport = nav.getByRole("region", { name: "Scroll project navigation", exact: true });
		const overview = nav.getByRole("link", { name: "Overview", exact: true });
		const activity = nav.getByRole("link", { name: "Activity", exact: true });
		const issues = nav.getByRole("link", { name: "Issues", exact: true });
		await expect(overview).toHaveAttribute("aria-current", "page");
		await expect(overview).toHaveCSS("height", "28px");
		expect(await overview.evaluate((link) => parseFloat(getComputedStyle(link).borderRadius))).toBeGreaterThanOrEqual(14);
		await expect(overview).toHaveCSS("padding-inline", "10px");
		await expect(overview).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(16.706 0.979 272)" : "lch(93.483 0.5 282)"
		);
		const overviewBox = (await overview.boundingBox())!;
		const activityBox = (await activity.boundingBox())!;
		expect(activityBox.x - (overviewBox.x + overviewBox.width)).toBeCloseTo(4, 1);
		await overview.press("Tab");
		await expect(activity).toBeFocused();
		await expect(activity).toHaveCSS("outline-offset", "-1px");
		await expect(activity).toHaveCSS("outline-style", "solid");
		expect(await activity.evaluate((link) => getComputedStyle(link).boxShadow)).not.toMatch(
			/\b0px 0px 0px (?:[1-9]\d*|0\.\d+)px(?:,|$)/
		);
		await activity.press("Enter");
		await expect(page).toHaveURL(/#project-view-activity$/);
		await expect(activity).toHaveAttribute("aria-current", "page");
		await expect(overview).not.toHaveAttribute("aria-current");
		await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible();

		await nav.evaluate((el) => (el.style.width = "166px"));
		await expect(viewport).toHaveCSS("scrollbar-width", "none");
		await expect
			.poll(() => viewport.evaluate((el) => el.scrollWidth - el.clientWidth))
			.toBeGreaterThan(0);
		const height = await viewport.evaluate((el) => el.clientHeight);
		await viewport.press("ArrowRight");
		await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
		await viewport.hover();
		const scrollbar = nav.locator(
			'[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]'
		);
		await expect(scrollbar).toBeVisible();
		await expect(scrollbar).toHaveCSS("position", "absolute");
		expect(await viewport.evaluate((el) => el.clientHeight)).toBe(height);
		await issues.press("Enter");
		await expect(issues).toHaveAttribute("aria-current", "page");
		await page.goBack();
		await expect(activity).toHaveAttribute("aria-current", "page");
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});

	test(`Marker thinking timing and keyboard stop work at 320px in ${colorScheme}`, async ({
		page
	}) => {
		await page.setViewportSize({ width: 320, height: 850 });
		await page.emulateMedia({ colorScheme, reducedMotion: "no-preference" });
		await page.goto("/docs/components/marker", { waitUntil: "networkidle" });
		const sample = page.getByRole("region", { name: "Agent thinking state", exact: true });
		const status = sample.getByRole("status");
		const thinking = status.locator('[data-slot="marker-content"]');
		await expect(status).toHaveText("Thinking…");
		await expect(thinking).toHaveCSS("font-size", "13px");
		await expect(thinking).toHaveCSS("font-weight", "500");
		await expect(thinking).toHaveCSS("line-height", "15.5px");
		await expect(status).toHaveCSS("animation-duration", "0.3s");
		await expect(thinking).toHaveCSS("animation-duration", "2.4s");
		await expect(thinking).toHaveCSS(
			"color",
			colorScheme === "dark" ? "rgb(92, 92, 95)" : "rgb(94, 94, 95)"
		);
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await expect(thinking).toHaveCSS("animation-name", "none");
		await expect(thinking).toHaveCSS("background-image", "none");
		await sample.getByRole("button", { name: "Stop response" }).press("Space");
		await expect(thinking).toHaveCount(0);
		await expect(status).toHaveText("Response stopped");
		const start = sample.getByRole("button", { name: "Start thinking" });
		await expect(start).toBeFocused();
		await start.press("Enter");
		await expect(thinking).toBeVisible();
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});
}

test("Navigation Menu dropdown retains the link and keyboard focus in a narrow preview", async ({
	page
}) => {
	await page.setViewportSize({ width: 320, height: 850 });
	await page.goto("/docs/components/navigation-menu", { waitUntil: "networkidle" });
	const trigger = page.getByRole("button", { name: "Getting started", exact: true });
	await trigger.press("Enter");
	const link = page.getByRole("link", { name: /Introduction/ });
	await expect(link).toBeVisible();
	const bounds = (await link.boundingBox())!;
	expect(bounds.x).toBeGreaterThanOrEqual(0);
	expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
	await link.press("Escape");
	await expect(trigger).toBeFocused();
	await expect(link).toBeHidden();
});
