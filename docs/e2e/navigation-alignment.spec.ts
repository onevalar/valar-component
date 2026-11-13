import { expect, test, type Locator, type Page } from "@playwright/test";

const base = "/zh/docs/components";
const slot = (scope: Locator | Page, name: string) => scope.locator(`[data-slot="${name}"]`);

async function noPageOverflow(page: Page) {
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
		page.viewportSize()!.width
	);
}

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [1200, 360]) {
		test.describe(`${colorScheme} at ${width}px`, () => {
			test.beforeEach(async ({ page }) => {
				await page.setViewportSize({ width, height: 850 });
				await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			});

			test("workspace sidebar scrolls and keeps focus through both collapsed layouts", async ({
				page,
			}) => {
				await page.goto(`${base}/sidebar`);
				const opener = page.getByRole("button", { name: "Toggle sidebar", exact: true });
				const nav = page.getByRole("navigation", { name: "Workspace navigation", exact: true });
				if (width === 360) {
					await opener.press("Enter");
					await expect(page.getByRole("dialog", { name: "Workspace navigation" })).toBeVisible();
					await expect(opener).toHaveAttribute("aria-expanded", "true");
				} else {
					const sidebar = slot(page, "sidebar-container").filter({ has: nav });
					await expect(sidebar).toHaveCSS("width", "192px");
					await opener.press("Enter");
					await expect(sidebar).toHaveCSS("width", "48px");
					await expect(nav.getByRole("button", { name: "My issues" })).toBeVisible();
					await opener.press("Enter");
					await expect(sidebar).toHaveCSS("width", "192px");
				}
				const current = nav.getByRole("button", { name: "My issues", exact: true });
				await expect(current).toHaveAttribute("aria-current", "page");
				await expect(current).toHaveCSS("height", "28px");
				await expect(current).toHaveCSS("gap", "6px");
				await expect(current).toHaveCSS(
					"background-color",
					colorScheme === "dark" ? "lch(13.845 1.3 272)" : "lch(89.54 0.5 282)"
				);
				const group = nav.getByRole("button", { name: "Workspace", exact: true });
				await group.press("Space");
				await expect(group).toHaveAttribute("aria-expanded", "false");
				await expect(group).toHaveCSS("outline-offset", "-1px");
				await expect(nav.getByRole("button", { name: "Projects", exact: true })).toBeHidden();
				await group.press("Enter");
				const projects = nav.getByRole("button", { name: "Projects", exact: true });
				await expect(projects).toHaveAttribute("data-size", "sm");
				for (const property of [
					"height",
					"border-radius",
					"padding-inline-start",
					"padding-inline-end",
					"gap",
				])
					await expect(projects).toHaveCSS(
						property,
						await current.evaluate(
							(el, property) => getComputedStyle(el).getPropertyValue(property),
							property
						)
					);
				await projects.press("Enter");
				await expect(projects).toHaveAttribute("aria-current", "page");
				await expect(current).not.toHaveAttribute("aria-current", "page");
				const notifications = nav.getByRole("button", { name: "Notifications", exact: true });
				const badge = slot(notifications.locator(".."), "sidebar-menu-badge");
				await expect(notifications).toHaveCSS("padding-inline-end", "32px");
				await expect(badge).toHaveCSS("top", "4px");
				const scroller = nav.locator("..");
				await expect(scroller).toHaveCSS("scrollbar-width", "thin");
				if (width === 1200) {
					await scroller.hover();
					await page.mouse.wheel(0, 90);
					await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
				} else {
					await page.keyboard.press("Escape");
					await expect(page.getByRole("dialog", { name: "Workspace navigation" })).toBeHidden();
					await expect(opener).toBeFocused();
					await opener.press("Enter");
					await nav.getByRole("button", { name: "Inbox", exact: true }).focus();
					await page.getByRole("button", { name: "Close sidebar", exact: true }).click();
					await expect(opener).toBeFocused();
				}
				await noPageOverflow(page);
			});

			test("workspace breadcrumb keeps all levels reachable and clips long labels locally", async ({
				page,
			}) => {
				await page.goto(`${base}/breadcrumb`);
				const nav = page.getByRole("navigation", { name: "Issue location" });
				const list = slot(nav, "breadcrumb-list");
				await expect(list).toHaveCSS("height", "34px");
				const current = slot(nav, "breadcrumb-page");
				await expect(current).toHaveAttribute("aria-current", "page");
				await expect(current).toHaveCSS("text-overflow", "ellipsis");
				if (width === 360) {
					expect(await current.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
					expect(await list.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(
						await list.evaluate((el) => el.clientWidth)
					);
				}
				for (const name of ["My issues", "Workspace navigation"]) {
					const link = nav.getByRole("link", { name, exact: true });
					await expect(link).toHaveCSS("height", "24px");
					await link.focus();
					await expect(link).toHaveCSS("outline-offset", "-1px");
					await link.press("Enter");
					await expect(current).toHaveText(name);
					const openIssue = page.getByRole("button", { name: /VLR-12/ });
					await expect(openIssue).toBeFocused();
					await openIssue.press("Enter");
					await expect(nav.getByRole("link", { name: "My issues", exact: true })).toBeFocused();
				}
				await noPageOverflow(page);
			});

			test("properties disclosure preserves its inner focus, spacing and disabled state", async ({
				page,
			}) => {
				await page.goto(`${base}/collapsible`);
				const root = page.locator('[data-slot="collapsible"][data-appearance="properties"]');
				const trigger = root.getByRole("button", { name: "Properties", exact: true });
				const indicator = slot(root, "collapsible-indicator");
				const lead = root.getByText("Avery Chen");
				await expect(trigger).toHaveCSS("height", "28px");
				await expect(trigger).toHaveCSS("gap", "3px");
				await expect(indicator).toHaveCSS("width", "16px");
				await expect(indicator).toHaveCSS("transition-property", "none");
				await expect(trigger).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
				await expect(lead).toBeVisible();
				await trigger.press("Space");
				await expect(trigger).toHaveAttribute("aria-expanded", "false");
				await expect(trigger).toHaveCSS("outline-offset", "-1px");
				await expect(lead).toBeHidden();
				const lock = page.getByRole("button", { name: "Lock properties" });
				await lock.press("Enter");
				await expect(trigger).toBeDisabled();
				await expect(trigger).toHaveAttribute("aria-expanded", "false");
				await lock.press("Enter");
				await trigger.press("Enter");
				await expect(lead).toBeVisible();
				await expect(trigger).toBeFocused();

				const standard = page.getByRole("button", { name: "Toggle details" });
				await standard.press("Enter");
				await expect(page.getByText("Shipping address", { exact: true })).toBeVisible();
				await noPageOverflow(page);
			});

			test("issue item truncates the title and exposes the detail and unavailable states", async ({
				page,
			}) => {
				await page.goto(`${base}/item`);
				const list = page.getByRole("list", { name: "Created issues" });
				const row = list.getByRole("link", { name: /DS-42/ });
				await expect(row).toHaveCSS("min-height", "44px");
				await expect(row).toHaveCSS("gap", "8px");
				const title = slot(row, "item-title");
				await expect(title).toHaveCSS("text-overflow", "ellipsis");
				const date = row.locator("time");
				const [label, end] = await Promise.all([title.boundingBox(), date.boundingBox()]);
				expect(end!.x - (label!.x + label!.width)).toBeGreaterThanOrEqual(8);
				if (width === 360)
					expect(await title.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
				await row.focus();
				await expect(row).toHaveCSS("outline-offset", "-1px");
				await row.press("Enter");
				await expect(row).toHaveAttribute("aria-current", "true");
				const details = page.getByRole("region", { name: /Review menu keyboard/ });
				await expect(details).toBeFocused();
				await expect(details).toContainText("In progress");
				const archived = slot(list, "item").filter({ hasText: "Archived issue" });
				await expect(archived).toHaveAttribute("aria-disabled", "true");
				await expect(archived.getByRole("link")).toHaveCount(0);
				await noPageOverflow(page);
			});

			test("empty states have distinct hierarchy and recover after clearing filters", async ({
				page,
			}) => {
				await page.goto(`${base}/empty`);
				const filter = page.getByRole("button", { name: "Urgent priority filter" });
				const assigned = page.locator('[data-appearance="issue-list"]');
				const filtered = page.locator('[data-appearance="filtered-list"]');
				await expect(slot(assigned, "empty-title")).toHaveCSS("font-size", "13px");
				await filter.press("Enter");
				await expect(slot(filtered, "empty-title")).toHaveCSS("font-size", "15px");
				await expect(slot(filtered, "empty-title")).toHaveCSS("font-weight", "600");
				await expect(slot(filtered, "empty-title")).toHaveCSS(
					"color",
					colorScheme === "dark" ? "lch(61.803 1.2 272)" : "lch(39.176 1.25 282)"
				);
				const clear = filtered.getByRole("button", { name: "Clear Filters" });
				await expect(clear).toBeFocused();
				await expect(clear).toHaveCSS("height", "24px");
				await expect(clear).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
				await clear.press("Enter");
				await expect(filter).toBeFocused();
				await expect(filter).toHaveAttribute("aria-pressed", "false");
				await expect(assigned.getByText("No issues assigned to you")).toBeVisible();
				await noPageOverflow(page);
			});
		});
	}
}
