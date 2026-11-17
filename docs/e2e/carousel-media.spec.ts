import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`full-screen carousel navigates and restores focus at ${width}px in ${colorScheme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 720 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/docs/components/carousel", { waitUntil: "networkidle" });

			const wideThumbnail = page.getByRole("button", { name: "Open wide image" });
			const squareThumbnail = page.getByRole("button", { name: "Open square image" });
			await wideThumbnail.focus();
			await page.keyboard.press("Enter");

			const viewer = page.getByRole("dialog", { name: "Image viewer" });
			const toolbar = viewer.getByRole("group", { name: "Image controls" });
			const zoom = toolbar.getByRole("button", { name: "Zoom image" });
			const next = toolbar.getByRole("button", { name: "Next image" });
			const previous = toolbar.getByRole("button", { name: "Previous image" });
			const close = toolbar.getByRole("button", { name: "Close image viewer" });
			const wideImage = viewer.getByRole("img", { name: "Wide image" });
			const squareImage = viewer.getByRole("img", { name: "Square image" });
			const status = viewer.getByRole("status");
			await expect(viewer).toBeVisible();
			await expect(status).toHaveText("Image 1 of 2");
			await expect(zoom).toBeFocused();
			await expect(previous).toBeDisabled();
			await expect(previous).toHaveCSS("opacity", "0.6");
			await expect(next).toBeEnabled();
			await expect(wideImage).toHaveCSS("width", "160px");
			await expect(wideImage).toHaveCSS("height", "90px");
			await expect(squareImage).toHaveCount(0);
			await expect(toolbar).toHaveCSS("height", "40px");
			await expect(toolbar).toHaveCSS("padding-inline-start", "8px");
			await expect(toolbar).toHaveCSS("padding-block-start", "6px");
			await expect(toolbar).toHaveCSS("background-color", colorScheme === "light" ? "lch(97.94 0.5 282)" : "lch(5.52 0.4 272)");
			await expect(next).toHaveCSS("width", "28px");
			await expect(next).toHaveCSS("height", "28px");
			await expect(next.locator("svg")).toHaveCSS("width", "14px");
			await expect(next.locator("svg")).toHaveCSS(
				"color",
				colorScheme === "light" ? "lch(19.588 1.25 282)" : "lch(90.451 1.2 272)"
			);
			await expect(toolbar.locator('[data-slot="button-group-separator"]')).toHaveCSS("width", "0.5px");

			const bounds = (await viewer.boundingBox())!;
			expect(bounds).toEqual({ x: 0, y: 0, width, height: 720 });
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
			const viewport = viewer.locator('[data-slot="carousel-content"]');
			expect((await viewport.boundingBox())!.y).toBe(44);
			await expect(viewport).toHaveCSS("overflow-x", "hidden");
			const nextBounds = (await next.boundingBox())!;
			const previousBounds = (await previous.boundingBox())!;
			const closeBounds = (await close.boundingBox())!;
			expect(previousBounds.x - nextBounds.x - nextBounds.width).toBe(0.5);
			expect(closeBounds.x - previousBounds.x - previousBounds.width).toBe(4);

			await page.keyboard.press("ArrowUp");
			await expect(status).toHaveText("Image 1 of 2");
			await zoom.press("Space");
			await expect(zoom).toBeFocused();
			await expect(zoom).toHaveAttribute("aria-pressed", "true");
			await expect(zoom).toHaveText("200%");
			await expect(wideImage).toHaveCSS("width", "320px");
			await zoom.press("Space");
			await expect(wideImage).toHaveCSS("width", "160px");

			await zoom.click();
			await next.click();
			await expect(status).toHaveText("Image 2 of 2");
			await expect(zoom).toHaveText("100%");
			await expect(squareImage).toHaveCSS("width", "80px");
			await expect(wideImage).toHaveCount(0);
			await expect(next).toBeDisabled();
			await expect(next).toBeFocused();
			await page.keyboard.press("ArrowRight");
			await page.keyboard.press("Enter");
			await expect(status).toHaveText("Image 2 of 2");
			await page.keyboard.press("Shift");
			await expect(next).toHaveCSS("outline-style", "solid");
			await expect(next).toHaveCSS("outline-offset", "-1px");
			await page.keyboard.press("ArrowLeft");
			await expect(status).toHaveText("Image 1 of 2");
			await page.keyboard.press("ArrowDown");
			await expect(status).toHaveText("Image 2 of 2");
			await page.keyboard.press("Escape");
			await expect(viewer).toHaveCount(0);
			await expect(wideThumbnail).toBeFocused();

			await squareThumbnail.focus();
			await page.keyboard.press("Space");
			await expect(status).toHaveText("Image 2 of 2");
			await page.keyboard.press("ArrowUp");
			await expect(status).toHaveText("Image 1 of 2");
			await close.click();
			await expect(viewer).toHaveCount(0);
			await expect(squareThumbnail).toBeFocused();
		});
	}
}

test("media carousel preserves the selected slide and endpoint controls after resizing", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 720 });
	await page.emulateMedia({ reducedMotion: "no-preference" });
	await page.goto("/docs/components/carousel", { waitUntil: "networkidle" });
	const thumbnail = page.getByRole("button", { name: "Open square image" });
	await thumbnail.click();

	const viewer = page.getByRole("dialog", { name: "Image viewer" });
	const next = viewer.getByRole("button", { name: "Next image" });
	const previous = viewer.getByRole("button", { name: "Previous image" });
	const status = viewer.getByRole("status");
	await expect(status).toHaveText("Image 2 of 2");
	await expect(next).toBeDisabled();
	await page.setViewportSize({ width: 320, height: 720 });
	await expect(status).toHaveText("Image 2 of 2");
	await expect(next).toBeDisabled();
	await expect(previous).toBeEnabled();
	await previous.click();
	await expect(status).toHaveText("Image 1 of 2");
	await expect(previous).toBeDisabled();
	await expect(next).toBeEnabled();

	const wideImage = viewer.getByRole("img", { name: "Wide image" });
	await expect.poll(async () => (await wideImage.boundingBox())!.x).toBeCloseTo(80, 0);
	await page.keyboard.press("Escape");
	await expect(thumbnail).toBeFocused();
});
