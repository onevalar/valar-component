import { expect, test, type Locator } from "@playwright/test";

function box(element: Locator) {
	return element.evaluate((node) => {
		const { x, y, width, height, right, bottom } = node.getBoundingClientRect();
		return { x, y, width, height, right, bottom };
	});
}

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [1200, 390]) {
		test.describe(`${colorScheme} at ${width}px`, () => {
			test.beforeEach(async ({ page }) => {
				await page.setViewportSize({ width, height: 900 });
				await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			});

			test("Badge shows status and keeps a long linked label accessible", async ({ page }) => {
				await page.goto("/docs/components/badge");
				const status = page.getByText("Completed", { exact: true }).first();
				await expect(status).toHaveCSS("height", "20px");
				await expect(status.locator("svg")).toHaveCSS("width", "12px");
				const label = page.getByRole("link", { name: "Accessibility and keyboard navigation" });
				await expect(label).toHaveCSS("height", "24px");
				await expect(label).toHaveCSS("max-width", "100%");
				const text = label.locator("span.truncate");
				await expect(text).toHaveCSS("text-overflow", "ellipsis");
				expect(await text.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
				await expect(label.locator('[data-slot="badge-label-marker"]')).toHaveCSS("width", "14px");
				await page.keyboard.press("Tab");
				await label.focus();
				await expect(label).toHaveCSS("text-decoration-line", "underline");
				await expect(label).toHaveCSS("box-shadow", /inset/);
				await label.press("Enter");
				await expect(page).toHaveURL(/#/);
			});

			test("Button Group lines up mixed controls and restores menu focus", async ({ page }) => {
				await page.goto("/docs/components/button-group");
				const group = page.getByRole("group", { name: "Issue prompt actions" });
				const action = group.getByRole("button", { name: "Prepare issue prompt" });
				const menu = group.getByRole("button", { name: "Choose coding tool" });
				for (const button of [action, menu]) {
					await expect(button).toHaveCSS("width", "28px");
					await expect(button).toHaveCSS("height", "28px");
				}
				await expect(action).toHaveCSS("padding-inline-start", "2px");
				await expect(menu).toHaveCSS("padding-inline-end", "2px");
				await action.focus();
				await page.keyboard.press("Tab");
				await expect(menu).toBeFocused();
				await menu.press("Enter");
				const terminal = page.getByRole("menuitemradio", { name: "Terminal" });
				await expect(terminal).toBeVisible();
				await terminal.press("Enter");
				await expect(menu).toBeFocused();
				await action.press("Enter");
				await expect(page.getByText("Issue prompt prepared for Terminal.")).toBeVisible();
				const payment = page.getByRole("group", { name: "Payment amount" });
				await payment.evaluate((node) => node.setAttribute("dir", "rtl"));
				const amount = payment.getByRole("textbox", { name: "Amount" });
				const trigger = payment.getByRole("combobox", { name: "Currency" });
				const currency = await box(trigger);
				const field = await box(amount);
				expect(currency.height).toBe(field.height);
				expect(Math.abs(field.right - currency.x)).toBeLessThanOrEqual(1);
				expect(field.x).toBeGreaterThanOrEqual(0);
				await expect(amount).toHaveCSS("border-top-right-radius", "0px");
				await expect(amount).toHaveCSS("border-top-left-radius", "8px");
				await expect(trigger).toHaveCSS("border-top-right-radius", "8px");
			});

			test("Toggle Group supports single selection, multi-selection and disabled skipping", async ({
				page,
			}) => {
				await page.goto("/docs/components/toggle-group");
				const toolbar = page.getByRole("group", { name: "Text formatting" });
				const bold = toolbar.getByRole("button", { name: "Bold", exact: true });
				const italic = toolbar.getByRole("button", { name: "Italic", exact: true });
				await expect(bold).toHaveCSS("height", "26px");
				await expect(bold).toHaveCSS("border-radius", "4px");
				await expect(bold.locator("svg")).toHaveCSS("width", "16px");
				await expect(toolbar).toHaveCSS("gap", "6px");
				const off = await bold.evaluate((node) => getComputedStyle(node).backgroundColor);
				await bold.press("Space");
				await bold.press("ArrowRight");
				await expect(italic).toBeFocused();
				await expect(italic).toHaveCSS("outline-offset", "-1px");
				await italic.press("Space");
				await expect(bold).not.toHaveCSS("background-color", off);
				await expect(bold).toHaveAttribute("aria-pressed", "true");
				await expect(italic).toHaveAttribute("aria-pressed", "true");
				await expect(toolbar.getByRole("button", { name: "Underline" })).toBeDisabled();
				await italic.press("ArrowRight");
				await expect(bold).toBeFocused();
				const normal = page.getByRole("radio", { name: "Normal", exact: true });
				const medium = page.getByRole("radio", { name: "Medium", exact: true });
				await normal.press("ArrowRight");
				await expect(medium).toBeFocused();
				await medium.press("Space");
				await expect(medium).toHaveAttribute("aria-checked", "true");
				await expect(normal).toHaveAttribute("aria-checked", "false");
				expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
			});

			test("Resizable describes both axes and respects limits and locking", async ({ page }) => {
				await page.goto("/docs/components/resizable");
				const inbox = page.getByRole("separator", { name: "Resize Inbox and details" });
				await expect(inbox).toHaveAttribute("aria-orientation", "vertical");
				const original = await box(inbox);
				await inbox.press("ArrowRight");
				expect((await box(inbox)).x).toBeGreaterThan(original.x);
				const vertical = page.getByRole("separator", { name: "Resize header and content" });
				await expect(vertical).toHaveAttribute("aria-orientation", "horizontal");
				const offset = () =>
					vertical.evaluate((node) => {
						return (
							node.getBoundingClientRect().top - node.parentElement!.getBoundingClientRect().top
						);
					});
				const initial = await offset();
				expect(initial).toBeGreaterThan(50);
				await vertical.press("ArrowDown");
				await expect.poll(offset).toBeGreaterThan(initial);
				for (let i = 0; i < 6; i++) await vertical.press("ArrowDown");
				const maximum = await offset();
				await vertical.press("ArrowDown");
				expect(await offset()).toBe(maximum);
				const lock = page.getByRole("button", { name: "Lock divider" });
				await lock.press("Enter");
				await expect(vertical).toHaveAttribute("aria-disabled", "true");
				await expect(vertical).toHaveAttribute("tabindex", "-1");
				await vertical.press("ArrowUp");
				expect(await offset()).toBe(maximum);
				await lock.press("Enter");
				await vertical.press("ArrowUp");
				await expect.poll(offset).toBeLessThan(maximum);
				await vertical.scrollIntoViewIfNeeded();
				const handle = await box(vertical);
				const x = handle.x + handle.width / 2;
				const y = handle.y + handle.height / 2;
				await page.mouse.move(x, y);
				await page.mouse.down();
				await page.mouse.move(x, y - 260, { steps: 4 });
				await page.mouse.up();
				await expect.poll(offset).toBeLessThan(initial);
				expect(await offset()).toBeGreaterThanOrEqual(50);
			});

			test("Sonner replaces pending feedback and stacks errors with undo", async ({ page }) => {
				await page.goto("/docs/components/sonner");
				const actions = page.getByRole("group", { name: "Workspace notifications" });
				const toaster = page.locator('[data-valar-appearance="workspace"]');
				const current = toaster.locator('[data-sonner-toast]:not([data-removed="true"])');
				await actions.getByRole("button", { name: "Save changes", exact: true }).click();
				await expect(current).toContainText("Saving changes…");
				await expect(current).toContainText("Changes saved");
				await expect(current).toHaveCount(1);
				await actions.getByRole("button", { name: "Show save error" }).click();
				await expect(current).toContainText("Could not save changes");
				const archive = actions.getByRole("button", { name: "Archive issue" });
				await archive.click();
				await expect(archive).toBeDisabled();
				await expect(current).toHaveCount(2);
				const undo = toaster.getByRole("button", { name: "Undo", exact: true });
				await page.keyboard.press("Tab");
				await undo.focus();
				await expect(undo).toHaveCSS("box-shadow", /inset/);
				await undo.press("Enter");
				await expect(archive).toBeEnabled();
				await expect(toaster.getByText("Issue restored")).toBeVisible();
				const bounds = await box(current.first());
				expect(bounds.x).toBeGreaterThanOrEqual(0);
				expect(bounds.right).toBeLessThanOrEqual(width + 1);
				await expect(current.first()).toHaveCSS("border-radius", "12px");
			});
		});
	}
}
