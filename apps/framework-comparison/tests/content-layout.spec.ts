import { expect, test } from "@playwright/test";

const examples = [
	["accordion", "Accordion"],
	["alert", "Alert"],
	["aspect-ratio", "Aspect Ratio"],
	["avatar", "Avatar"],
	["badge", "Badge"],
	["breadcrumb", "Breadcrumb"],
	["card", "Card"],
	["carousel", "Carousel"],
	["collapsible", "Collapsible"],
	["empty", "Empty"],
	["item", "Item"],
	["page-layout", "Page Layout"],
	["pagination", "Pagination"],
	["progress", "Progress"],
	["resizable", "Resizable"],
	["scroll-area", "Scroll Area"],
	["skeleton", "Skeleton"],
	["spinner", "Spinner"],
] as const;

for (const [framework, base] of [
	["react", process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/"],
	["vue", process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/"],
]) {
	for (const [theme, width] of [
		["light", 900],
		["dark", 320],
	] as const) {
		test.describe(`${framework} ${theme} ${width}: content and layout`, () => {
			test.use({ viewport: { width, height: 720 } });
			const fixture = (slug: string) => `${base}?example=${slug}&theme=${theme}`;

			test("all fixtures render without page overflow or script errors", async ({ page }) => {
				const errors: string[] = [];
				page.on("pageerror", (error) => errors.push(error.message));
				for (const [slug, title] of examples) {
					await page.goto(fixture(slug));
					await expect(
						page.getByRole("region", { name: `${title} examples`, exact: true })
					).toBeVisible();
					expect(
						await page.evaluate(() => document.documentElement.scrollWidth),
						`${slug} overflows the document`
					).toBeLessThanOrEqual(width);
				}
				await page.goto(fixture("typography"));
				await expect(
					page.getByRole("article", { name: "Typography example" }).getByRole("heading", {
						name: "Workspace release notes",
						level: 1,
					})
				).toBeVisible();
				expect(errors).toEqual([]);
			});

			test("disclosure uses keyboard selection and keeps focus on the trigger", async ({
				page,
			}) => {
				await page.goto(fixture("accordion"));
				const access = page.getByRole("button", { name: "Workspace access", exact: true });
				const notifications = page.getByRole("button", { name: "Notifications", exact: true });
				await expect(page.getByRole("button", { name: "Billing", exact: true })).toBeDisabled();
				await access.focus();
				await access.press("ArrowDown");
				await expect(notifications).toBeFocused();
				await notifications.press("Space");
				await expect(notifications).toHaveAttribute("aria-expanded", "true");
				await expect(access).toHaveAttribute("aria-expanded", "false");

				await page.goto(fixture("collapsible"));
				const properties = page.getByRole("button", { name: "Properties", exact: true });
				await expect(properties).toHaveCSS("height", "28px");
				await expect(properties).toHaveAttribute("aria-expanded", "false");
				await properties.press("Enter");
				await expect(properties).toHaveAttribute("aria-expanded", "true");
				await properties.press("Space");
				await expect(properties).toHaveAttribute("aria-expanded", "false");
				await expect(properties).toBeFocused();
			});

			test("carousel and pagination honor their boundaries and current state", async ({ page }) => {
				await page.goto(fixture("carousel"));
				const previous = page.getByRole("button", { name: "Previous slide", exact: true });
				const next = page.getByRole("button", { name: "Next slide", exact: true });
				await expect(previous).toBeDisabled();
				await next.press("ArrowRight");
				await expect(previous).toBeEnabled();
				await next.click();
				await expect(next).toBeDisabled();
				await previous.click();
				await expect(next).toBeEnabled();

				await page.goto(fixture("pagination"));
				const pages = page.getByRole("navigation", { name: "Issues pages" });
				const current = pages.locator('[aria-current="page"]');
				await expect(current).toHaveText("2");
				await pages.getByRole("button", { name: /next/i }).click();
				await expect(current).toHaveText("3");
				await pages.getByRole("button", { name: /previous/i }).press("Enter");
				await expect(current).toHaveText("2");
			});

			test("progress exposes the real range; avatar falls back", async ({ page }) => {
				await page.goto(fixture("progress"));
				const progress = page.getByRole("progressbar", { name: "Import progress", exact: true });
				await expect(progress).toHaveAttribute("aria-valuemin", "10");
				await expect(progress).toHaveAttribute("aria-valuemax", "60");
				await expect(progress).toHaveAttribute("aria-valuenow", "35");
				const unknown = page.getByRole("progressbar", { name: "Duplicate check", exact: true });
				await expect(unknown).not.toHaveAttribute("aria-valuenow", /.+/);
				const indicator = unknown.locator('[data-slot="progress-indicator"]');
				await page.emulateMedia({ reducedMotion: "no-preference" });
				await expect(indicator).toHaveCSS("animation-name", "pulse");
				await page.emulateMedia({ reducedMotion: "reduce" });
				await expect(indicator).toHaveCSS("animation-name", "none");

				await page.goto(fixture("avatar"));
				await expect(
					page.locator('[data-slot="avatar-fallback"]').filter({ hasText: /^JD$/ }).first()
				).toBeVisible();
			});

			test("keyboard resizing and scrolling change actual layout geometry", async ({ page }) => {
				await page.goto(fixture("resizable"));
				const handle = page.getByRole("separator", { name: "Project panel size", exact: true });
				await expect(handle).toHaveAttribute("aria-orientation", "vertical");
				const group = handle.locator('xpath=ancestor::*[@data-slot="resizable-pane-group"][1]');
				const left = group.locator('[data-slot="resizable-pane"]').first();
				await expect(left).toBeVisible();
				const initial = (await left.boundingBox())!.width;
				await handle.press("ArrowRight");
				await expect
					.poll(async () => (await left.boundingBox())!.width)
					.toBeGreaterThan(initial + 1);
				await expect(handle).toBeFocused();

				await page.goto(fixture("scroll-area"));
				const viewport = page.getByRole("region", { name: "Recent activity", exact: true });
				await viewport.press("PageDown");
				await expect
					.poll(() => viewport.evaluate((element) => element.scrollTop))
					.toBeGreaterThan(0);
				await expect(viewport).toBeFocused();
			});
		});
	}
}
