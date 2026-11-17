import { expect, test, type Locator, type Page } from "@playwright/test";

function sample(page: Page, heading: string) {
	return page
		.getByRole("heading", { name: heading, exact: true })
		.locator("xpath=following-sibling::*[.//*[@data-slot='carousel']][1]")
		.locator('[data-slot="carousel"]:visible')
		.first();
}

function displacement(carousel: Locator) {
	return carousel.locator('[data-slot="carousel-container"]').evaluate((element) => {
		const matrix = new DOMMatrix(getComputedStyle(element).transform);
		return { x: Math.round(matrix.e), y: Math.round(matrix.f) };
	});
}

function next(carousel: Locator) {
	return carousel.locator('[data-slot="carousel-next"]');
}

function previous(carousel: Locator) {
	return carousel.locator('[data-slot="carousel-previous"]');
}

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Carousel generic layouts and directional controls work in ${colorScheme} at ${width}px`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 844 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/docs/components/carousel", { waitUntil: "networkidle" });

			const single = sample(page, "Default");
			const sizes = sample(page, "Sizes");
			const spacing = sample(page, "Spacing");
			const vertical = page.getByRole("region", { name: "Vertical cards", exact: true });
			const api = sample(page, "API");

			for (const carousel of [single, sizes, spacing, vertical, api]) {
				await expect(carousel.locator('[data-slot="carousel-item"]')).toHaveCount(5);
			}
			await expect(single.locator('[data-slot="carousel-item"]').first()).toHaveCSS(
				"flex-basis",
				"100%"
			);
			await expect(sizes.locator('[data-slot="carousel-item"]').first()).toHaveCSS(
				"flex-basis",
				width === 320 ? "50%" : "33.3333%"
			);
			await expect(spacing.locator('[data-slot="carousel-item"]').first()).toHaveCSS(
				"padding-inline-start",
				"4px"
			);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);

			await expect(previous(single)).toBeDisabled();
			await next(single).press("ArrowRight");
			await expect.poll(async () => (await displacement(single)).x).toBeLessThan(-100);
			await expect(previous(single)).toBeEnabled();
			await next(single).press("ArrowLeft");
			await expect.poll(async () => (await displacement(single)).x).toBe(0);
			await expect(previous(single)).toBeDisabled();

			await expect(page.getByText("Slide 1 of 5", { exact: true })).toBeVisible();
			await next(api).click();
			await expect(page.getByText("Slide 2 of 5", { exact: true })).toBeVisible();

			await expect(vertical.locator('[data-slot="carousel-container"]')).toHaveAttribute(
				"data-orientation",
				"vertical"
			);
			await expect(next(vertical)).toHaveCSS("rotate", "90deg");
			await next(vertical).press("ArrowDown");
			await expect.poll(async () => (await displacement(vertical)).y).toBeLessThan(-80);
			await previous(vertical).press("ArrowUp");
			await expect.poll(async () => (await displacement(vertical)).y).toBe(0);
			await vertical.evaluate((element) => element.scrollIntoView({ block: "center" }));
			await next(vertical).click();
			await expect.poll(async () => (await displacement(vertical)).y).toBeLessThan(-80);
			await previous(vertical).click();
			await expect.poll(async () => (await displacement(vertical)).y).toBe(0);
		});
	}

	test(`Carousel autoplay supports hover, manual pause and focus in ${colorScheme} at 320px`, async ({
		page
	}) => {
		await page.setViewportSize({ width: 320, height: 844 });
		await page.emulateMedia({ colorScheme, reducedMotion: "no-preference" });
		await page.clock.install();
		await page.clock.pauseAt(await page.evaluate(() => Date.now() + 500));
		await page.goto("/docs/components/carousel", { waitUntil: "networkidle" });

		const demo = page.locator('[data-slot="carousel-autoplay-demo"]');
		const carousel = demo.getByRole("region", { name: "Autoplay example slides" });
		const pause = demo.getByRole("button", { name: "Pause autoplay" });
		const play = demo.getByRole("button", { name: "Play autoplay" });
		const tick = () => page.clock.runFor(2800);
		const settle = () => page.clock.runFor(1000);

		await expect(pause).toBeVisible();
		await expect(carousel).toHaveCSS("width", "160px");
		await expect(pause).toHaveAttribute("aria-controls", (await carousel.getAttribute("id"))!);
		const start = await displacement(carousel);
		await tick();
		expect(await displacement(carousel)).not.toEqual(start);

		await carousel.hover();
		await settle();
		const hovering = await displacement(carousel);
		await tick();
		expect(await displacement(carousel)).toEqual(hovering);
		await page.mouse.move(2, 2);
		await tick();
		expect(await displacement(carousel)).not.toEqual(hovering);

		await pause.press("Space");
		await expect(play).toBeFocused();
		expect(
			await play.evaluate((element) => parseFloat(getComputedStyle(element).outlineOffset))
		).toBeLessThan(0);
		await settle();
		const paused = await displacement(carousel);
		await carousel.hover();
		await page.mouse.move(2, 2);
		await tick();
		expect(await displacement(carousel)).toEqual(paused);

		await play.press("Enter");
		await expect(pause).toBeFocused();
		await tick();
		expect(await displacement(carousel)).not.toEqual(paused);

		await next(carousel).focus();
		await expect(play).toBeVisible();
		await settle();
		const duringFocus = await displacement(carousel);
		await page.keyboard.press("Tab");
		await tick();
		expect(await displacement(carousel)).toEqual(duringFocus);
	});
}

test("Carousel autoplay is static with reduced motion until explicitly started", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 844 });
	await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
	await page.clock.install();
	await page.clock.pauseAt(await page.evaluate(() => Date.now() + 500));
	await page.goto("/docs/components/carousel", { waitUntil: "networkidle" });

	const demo = page.locator('[data-slot="carousel-autoplay-demo"]');
	const carousel = demo.getByRole("region", { name: "Autoplay example slides" });
	const play = demo.getByRole("button", { name: "Play autoplay" });
	await expect(play).toBeVisible();
	const start = await displacement(carousel);
	await page.clock.runFor(2800);
	expect(await displacement(carousel)).toEqual(start);
	await play.press("Enter");
	await expect(demo.getByRole("button", { name: "Pause autoplay" })).toBeFocused();
	await page.clock.runFor(2800);
	expect(await displacement(carousel)).not.toEqual(start);
});
