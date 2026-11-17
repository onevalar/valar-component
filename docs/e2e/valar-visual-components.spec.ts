import { expect, test, type Page } from "@playwright/test";

async function fitPage(page: Page, href: string, width: number, colorScheme: "light" | "dark") {
	await page.setViewportSize({ width, height: 835 });
	await page.goto(href, { waitUntil: "networkidle" });
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	await expect(page.locator('[data-alignment-status="valar"]')).toBeVisible();
	if (colorScheme === "dark") await expect(page.locator("html")).toHaveClass(/\bdark\b/);
	else await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
		width + 1
	);
}

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test.describe(`${colorScheme} at ${width}px`, () => {
			test.beforeEach(async ({ page }) => {
				await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			});

			test("Ruler Slider fits its field, supports bounds and skips the disabled budget", async ({
				page,
			}) => {
				await fitPage(page, "/docs/components/ruler-slider", width, colorScheme);
				const ruler = page.getByRole("slider", { name: "Reference budget" });
				await ruler.focus();
				await ruler.press("ArrowRight");
				await expect(ruler).toHaveAttribute("aria-valuenow", "51");
				await expect(ruler).toHaveCSS("outline-offset", "-1px");
				await ruler.press("End");
				await expect(ruler).toHaveAttribute("aria-valuenow", "100");
				await ruler.press("Home");
				await expect(ruler).toHaveAttribute("aria-valuenow", "0");
				await ruler.scrollIntoViewIfNeeded();
				const rulerBox = (await ruler.boundingBox())!;
				const needle = (await ruler.locator('[data-slot="ruler-slider-needle"]').boundingBox())!;
				const center = rulerBox.x + rulerBox.width / 2;
				const y = rulerBox.y + rulerBox.height / 2;
				expect(Math.abs(needle.x + needle.width / 2 - center)).toBeLessThan(1);
				await expect(ruler).toHaveCSS("height", "64px");
				await page.mouse.move(center, y);
				await page.mouse.down();
				await page.mouse.move(center - 20, y, { steps: 4 });
				await page.mouse.up();
				await expect(ruler).toHaveAttribute("aria-valuenow", "2");

				const budget = page.getByRole("slider", { name: "Daily budget limit" });
				await budget.press("End");
				await expect(budget).toHaveAttribute("aria-valuenow", "24.75");
				await expect(page.getByRole("slider", { name: "Team limit" })).toHaveAttribute(
					"tabindex",
					"-1"
				);
				await budget.press("Tab");
				const save = page.getByRole("button", { name: "Save", exact: true });
				await expect(save).toBeFocused();
				await save.press("Enter");
				await expect(page.getByText("Saved 24.75 USD")).toBeVisible();
			});

			test("Texture Fill renders the bounded keyboard-controlled value and keeps its canvas decorative", async ({
				page,
			}) => {
				await fitPage(page, "/docs/components/texture-fill", width, colorScheme);
				const slider = page.getByRole("slider", { name: "Fill amount" });
				const fills = page.locator('[data-slot="texture-fill"]');
				await expect(fills).toHaveCount(5);
				await expect(fills.first()).toHaveAttribute("aria-hidden", "true");
				await expect(fills.first()).toHaveCSS("height", "16px");
				const solid = page.locator('[data-slot="texture-fill"][data-texture="solid"] canvas');
				const canvasAlpha = () =>
					solid.evaluate((canvas: HTMLCanvasElement) => {
						const context = canvas.getContext("2d")!;
						const y = Math.floor(canvas.height / 2);
						return [
							context.getImageData(0, y, 1, 1).data[3],
							context.getImageData(canvas.width - 1, y, 1, 1).data[3],
						];
					});
				await expect.poll(canvasAlpha).toEqual([255, 0]);
				await slider.press("Home");
				await expect(slider).toHaveAttribute("aria-valuenow", "0");
				await expect.poll(canvasAlpha).toEqual([0, 0]);
				await slider.press("End");
				await expect(slider).toHaveAttribute("aria-valuenow", "100");
				await expect(fills.first().locator("..").getByText("100%", { exact: true })).toBeVisible();
				await expect.poll(canvasAlpha).toEqual([255, 255]);
			});

			test("read-only charts show their real values, empty states and overflow without tab stops", async ({
				page,
			}) => {
				await fitPage(page, "/docs/components/tick-meter", width, colorScheme);
				const unused = page.getByRole("meter", { name: "Unused" });
				const over = page.getByRole("meter", { name: "Over limit" });
				await expect(unused.locator('[data-filled="true"]')).toHaveCount(0);
				await expect(
					page.getByRole("meter", { name: "Partly used" }).locator('[data-filled="true"]')
				).toHaveCount(30);
				await expect(over.locator('[data-filled="true"]')).toHaveCount(60);
				await expect(over).toHaveAttribute("aria-valuenow", "100");
				await expect(over).toHaveAttribute("aria-valuetext", "125% used");
				await expect(over.locator('[data-slot="tick-meter-readout"]')).toHaveText("125%");
				await expect(over).not.toHaveAttribute("tabindex");
				await expect(over.locator("[tabindex]")).toHaveCount(0);

				await fitPage(page, "/docs/components/donut-chart", width, colorScheme);
				const donuts = page.locator('[data-slot="static-donut"]');
				await expect(donuts.first().locator('[data-part="in-progress"]')).toHaveAttribute(
					"data-end",
					"0.7"
				);
				await expect(donuts.last().locator('[data-slot="static-donut-track"]')).toBeVisible();
				await expect(donuts.last().locator("[data-part]")).toHaveCount(0);
				await expect(page.getByText("36 · 30%", { exact: true })).toBeVisible();

				await fitPage(page, "/docs/components/waffle-chart", width, colorScheme);
				const waffles = page.locator('[data-slot="waffle-chart"]');
				await expect(waffles.first().locator('[data-category="feature"]')).toHaveCount(65);
				await expect(waffles.last()).toHaveAttribute("data-empty", "");
				await expect(waffles.last().locator("[data-category]")).toHaveCount(0);
				await expect(page.getByText("646 · 64.6%", { exact: true })).toBeVisible();
				await expect(page.locator('[data-slot="waffle-chart"][tabindex]')).toHaveCount(0);
			});
		});
	}
}
