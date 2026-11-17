import { expect, test, type Locator } from "@playwright/test";

async function checkRatio(frame: Locator, image: Locator, width: number, ratio: number) {
	await expect(frame).toHaveCSS("border-radius", "6px");
	await expect(frame).toHaveCSS("overflow", "hidden");
	await expect(image).toHaveCSS("object-fit", "contain");
	await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
		.toBeGreaterThan(0);
	const box = (await frame.boundingBox())!;
	const imageBox = (await image.boundingBox())!;
	expect(box.width / box.height).toBeCloseTo(ratio, 2);
	expect(imageBox.width).toBeCloseTo(box.width, 2);
	expect(imageBox.height).toBeCloseTo(box.height, 2);
	expect(box.width).toBeLessThanOrEqual(width);
	return box.width;
}

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Aspect Ratio media fits without cropping and switches by keyboard at ${width}px in ${colorScheme}`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 850 });
			await page.emulateMedia({ colorScheme });
			await page.goto("/docs/components/aspect-ratio");

			const sample = page.getByRole("group", { name: "Issue description media" });
			const frame = sample.locator('[data-slot="aspect-ratio"][data-appearance="media"]');
			const landscape = sample.getByRole("button", { name: "Landscape", exact: true });
			const square = sample.getByRole("button", { name: "Square", exact: true });
			await expect(landscape).toHaveAttribute("aria-pressed", "true");

			const landscapeWidth = await checkRatio(
				frame,
				sample.getByRole("img", { name: "Landscape test image" }),
				320,
				16 / 9
			);
			if (width === 320) {
				expect(landscapeWidth).toBeLessThan(320);
			} else {
				expect(landscapeWidth).toBe(320);
			}
			await landscape.press("Tab");
			await expect(square).toBeFocused();
			await page.keyboard.press("Enter");
			await expect(square).toHaveAttribute("aria-pressed", "true");
			await expect(square).toBeFocused();
			await checkRatio(frame, sample.getByRole("img", { name: "Square test image" }), 160, 1);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		});
	}
}
