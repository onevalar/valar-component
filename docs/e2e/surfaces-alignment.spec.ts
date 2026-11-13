import { expect, test, type Locator, type Page } from "@playwright/test";

const zh = "/zh/docs/components";
const slot = (target: Locator | Page, name: string) => target.locator(`[data-slot="${name}"]`);
const rect = async (locator: Locator) => {
	const box = await locator.boundingBox();
	expect(box).not.toBeNull();
	return box!;
};

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [1200, 360]) {
		test.describe(`${colorScheme} at ${width}px`, () => {
			test.beforeEach(async ({ page }) => {
				await page.setViewportSize({ width, height: 790 });
				await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			});

			test("Card preserves settings spacing and keeps header actions clear of the title", async ({
				page,
			}) => {
				await page.goto(`${zh}/card`);
				const card = slot(page, "card")
					.filter({ has: page.getByText("Login to your account") })
					.first();
				const title = slot(card, "card-title");
				const action = card.getByRole("button", { name: "Sign Up" });
				await expect(action).toHaveCSS("height", "28px");
				const [c, t, a] = await Promise.all([rect(card), rect(title), rect(action)]);
				expect(a.x).toBeGreaterThanOrEqual(c.x + 12);
				expect(a.x + a.width).toBeLessThanOrEqual(c.x + c.width - 12);
				if (width === 360) {
					const description = await rect(slot(card, "card-description"));
					expect(a.y - (description.y + description.height)).toBeGreaterThanOrEqual(8);
				} else {
					expect(a.x - (t.x + t.width)).toBeGreaterThanOrEqual(12);
				}
				await action.focus();
				await expect(action).toHaveCSS("outline-offset", "-2px");

				const small = page.locator('[data-slot="card"][data-size="sm"]').first();
				await expect(small).toHaveCSS("row-gap", "12px");
				const eventTitle = page.getByText("Design systems meetup", { exact: true });
				const event = slot(page, "card").filter({ has: eventTitle });
				const [eventDescription, badge] = await Promise.all([
					rect(slot(event, "card-description")),
					rect(event.getByText("Featured", { exact: true })),
				]);
				if (width === 360) {
					expect(badge.y).toBeGreaterThanOrEqual(eventDescription.y + eventDescription.height + 8);
				}
				const settings = page.locator('[data-slot="card"][data-size="settings"]');
				await expect(settings).toHaveCSS("border-radius", "10px");
				await expect(settings).toHaveCSS(
					"background-color",
					colorScheme === "dark" ? "lch(9.232 0.85 272)" : "rgb(255, 255, 255)"
				);
				await expect(settings).toHaveCSS("padding-block-start", "0px");
				const setting = slot(settings, "field").first();
				await expect(setting).toHaveCSS("padding-inline-start", "16px");
				await expect(setting).toHaveCSS("gap", "12px");
				const control = settings.getByRole("switch", {
					name: "Desktop notifications",
				});
				const label = settings.getByText("Show updates when this workspace is open.");
				const [desc, toggle] = await Promise.all([rect(label), rect(control)]);
				if (width === 360) expect(toggle.y - (desc.y + desc.height)).toBeGreaterThanOrEqual(12);
				await control.press("Space");
				await expect(control).toBeChecked();
				const reset = settings.getByRole("button", {
					name: "Reset preferences",
				});
				await reset.press("Enter");
				await expect(control).not.toBeChecked();
				await expect(reset).toBeDisabled();
			});

			test("Hover Card respects viewport edges and the profile is available from its link", async ({
				page,
			}) => {
				await page.goto(`${zh}/hover-card`);
				const trigger = page.getByRole("link", {
					name: "Jordan Lee",
					exact: true,
				});
				await trigger.hover();
				const card = page.locator('[data-slot="hover-card-content"][data-appearance="profile"]');
				await expect(card).toBeVisible();
				await expect(card).toHaveCSS("animation-name", "none");
				await expect(card).toHaveCSS("border-radius", "8px");
				await expect(card).toHaveCSS("padding-block-start", "5px");
				await expect(card).toHaveCSS("padding-inline-start", "8px");
				await expect(card).toHaveCSS(
					"background-color",
					colorScheme === "dark" ? "lch(12.72 0.85 272)" : "lch(100 0 282)"
				);
				const b = await rect(card);
				expect(b.width).toBe(197);
				expect(b.height).toBeGreaterThanOrEqual(170);
				expect(b.height).toBeLessThanOrEqual(180);
				expect(b.x).toBeGreaterThanOrEqual(7);
				expect(b.x + b.width).toBeLessThanOrEqual(width - 7);
				expect(b.y + b.height).toBeLessThanOrEqual(783);
				await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, {
					steps: 12,
				});
				await expect(card.getByText("Workspace member")).toBeVisible();
				await page.keyboard.press("Escape");
				await expect(card).toBeHidden();
				await trigger.press("Enter");
				await expect(page.getByRole("region", { name: "Jordan Lee profile" })).toBeVisible();
			});

			test("Table sorts, selects, handles an empty filter, and scrolls without widening the page", async ({
				page,
			}) => {
				await page.goto(`${zh}/table`);
				const columns = page.getByRole("region", { name: "Label columns" });
				const table = columns.getByRole("table", { name: "Issue labels" });
				const name = table.getByRole("columnheader", { name: "Name" });
				await expect(name).toHaveCSS("height", "32px");
				await expect(name.getByRole("button")).toHaveCSS("height", "24px");
				await name.getByRole("button").press("Enter");
				await expect(name).toHaveAttribute("aria-sort", "descending");
				await expect(table.locator("tbody tr").first()).toContainText("Improvement");
				const select = table.getByRole("checkbox", {
					name: "Select Improvement",
				});
				await select.press("Space");
				await expect(select).toBeChecked();
				await expect(table.locator("tbody tr").first()).toHaveCSS("height", "44px");
				await expect(table.locator("tbody tr").first()).toHaveCSS(
					"background-color",
					colorScheme === "dark" ? "lch(12.141 17.792 286.445)" : "lch(92.254 5.903 282.518)"
				);
				if (width === 360) {
					await expect(columns).toHaveAttribute("tabindex", "0");
					await columns.press("ArrowRight");
					await expect.poll(() => columns.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
					expect(
						await page.evaluate(() => document.documentElement.scrollWidth)
					).toBeLessThanOrEqual(width);
					await columns.press("ArrowLeft");
					await expect.poll(() => columns.evaluate((el) => el.scrollLeft)).toBe(0);
				}
				const filter = page.getByRole("searchbox", { name: "Filter labels" });
				await filter.fill("unmatched");
				await expect(table.getByText("No matching labels")).toBeInViewport();
				await filter.clear();
				await expect(select).toBeChecked();
			});

			test("Avatar separates member and subscriber sizes and restores the photo after initials", async ({
				page,
			}) => {
				await page.goto(`${zh}/avatar`);
				const subscriber = page.locator('[data-slot="avatar"][data-appearance="subscriber"]');
				const member = page.locator('[data-slot="avatar"][data-appearance="member"]');
				await expect(subscriber).toHaveCSS("width", "18px");
				await expect(member).toHaveCSS("width", "24px");
				await expect(slot(member, "avatar-fallback")).toHaveCSS("font-size", "11px");
				expect(await member.evaluate((el) => getComputedStyle(el, "::after").display)).toBe("none");
				await expect(slot(subscriber, "avatar-image")).toBeVisible();
				const change = page.getByRole("button", { name: "Use initials" });
				await change.press("Enter");
				await expect(slot(subscriber, "avatar-fallback")).toHaveText("AC");
				await expect(slot(subscriber, "avatar-fallback")).toHaveCSS("font-size", "9px");
				await page.getByRole("button", { name: "Restore photo" }).press("Enter");
				await expect(slot(subscriber, "avatar-image")).toBeVisible();
				const group = page.getByRole("group", { name: "Collaborators" });
				await expect(group.getByRole("img", { name: "3 more collaborators" })).toBeVisible();
				await expect(group).toHaveCSS("flex-wrap", "wrap");
			});

			test("Scroll Area supports both axes, wheel, keyboard, and a draggable thin thumb", async ({
				page,
			}) => {
				await page.goto(`${zh}/scroll-area`);
				const settings = page.getByRole("region", {
					name: "Settings navigation",
				});
				await settings.scrollIntoViewIfNeeded();
				await settings.hover();
				await page.mouse.wheel(0, 90);
				await expect.poll(() => settings.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
				await settings.press("Home");
				await expect.poll(() => settings.evaluate((el) => el.scrollTop)).toBe(0);
				await expect(settings).toHaveCSS("outline-offset", "-1px");
				await expect(settings).toHaveCSS("box-shadow", "none");
				const vertical = settings
					.locator("..")
					.locator('[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]');
				const thumb = slot(vertical, "scroll-area-thumb");
				await expect(thumb).toHaveCSS(
					"background-color",
					colorScheme === "dark" ? "lch(37.275 1.2 272)" : "lch(64.94 1.25 282)"
				);
				const b = await rect(thumb);
				await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
				await page.mouse.down();
				await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 + 32, {
					steps: 8,
				});
				await page.mouse.up();
				await expect.poll(() => settings.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);

				const gallery = page.getByRole("region", { name: "Artwork gallery" });
				await gallery.scrollIntoViewIfNeeded();
				await expect
					.poll(() => gallery.evaluate((el) => el.scrollWidth - el.clientWidth))
					.toBeGreaterThan(100);
				await gallery.press("ArrowRight");
				await expect.poll(() => gallery.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
				const timeline = page.getByRole("region", { name: "Timeline tracks" });
				await timeline.scrollIntoViewIfNeeded();
				await timeline.press("ArrowDown");
				await timeline.press("ArrowRight");
				await expect
					.poll(() => timeline.evaluate((el) => Math.min(el.scrollLeft, el.scrollTop)))
					.toBeGreaterThan(0);
				await expect(timeline).toHaveCSS("overscroll-behavior", "contain");
				await expect(slot(timeline.locator(".."), "scroll-area-thumb")).toHaveCount(2);
				expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
					width
				);
			});
		});
	}
}

test("a touch user can open the complete member profile from the link", async ({ browser }) => {
	const context = await browser.newContext({
		hasTouch: true,
		isMobile: true,
		viewport: { width: 360, height: 790 },
	});
	try {
		const page = await context.newPage();
		await page.goto(`${zh}/hover-card`);
		await page.getByRole("link", { name: "Jordan Lee", exact: true }).tap();
		await expect(page.getByRole("region", { name: "Jordan Lee profile" })).toBeVisible();
	} finally {
		await context.close();
	}
});

test("a profile card scrolls inside a short viewport instead of being clipped", async ({
	page,
}) => {
	await page.setViewportSize({ width: 360, height: 290 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto(`${zh}/hover-card`);
	const trigger = page.getByRole("link", { name: "Jordan Lee", exact: true });
	await trigger.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
	await trigger.hover();
	const card = page.locator('[data-slot="hover-card-content"][data-appearance="profile"]');
	await expect(card).toBeVisible();
	await expect
		.poll(() => card.evaluate((el) => el.scrollHeight - el.clientHeight))
		.toBeGreaterThan(0);
	const { x, y, width, height } = await rect(card);
	expect(y).toBeGreaterThanOrEqual(7);
	expect(y + height).toBeLessThanOrEqual(283);
	await page.mouse.move(x + width / 2, y + height / 2, { steps: 10 });
	await page.mouse.wheel(0, 80);
	await expect.poll(() => card.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
});
