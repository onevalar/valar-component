import { expect, test, type Locator } from "@playwright/test";

async function fitsViewport(menu: Locator) {
	await expect
		.poll(() =>
			menu.evaluate((element) => {
				const rect = element.getBoundingClientRect();
				return (
					rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight
				);
			})
		)
		.toBe(true);
}

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [1200, 320]) {
		test(`Context Menu retains menu layers and focus in ${colorScheme} at ${width}px`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: width === 320 ? 600 : 900 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/zh/docs/components/context-menu");
			const trigger = page.getByRole("group", { name: "Issue VLR-12" });
			const menu = page.getByRole("menu", { name: "Issue actions", exact: true });
			const status = menu.getByRole("menuitem", { name: "Status", exact: true });
			const statusMenu = page.getByRole("dialog", { name: "Issue status", exact: true });
			const search = statusMenu.getByRole("combobox", { name: "Filter statuses" });

			await trigger.click({ button: "right" });
			await expect(menu).toHaveCSS("border-radius", "12px");
			await expect(menu).toHaveCSS("animation-name", "none");
			await expect(menu).toHaveCSS(
				"background-color",
				colorScheme === "light" ? "rgb(255, 255, 255)" : "lch(12.72 0.85 272)"
			);
			await expect(menu).toHaveCSS(
				"box-shadow",
				colorScheme === "light" ? /0px 6px 18px/ : /0px 3px 8px/
			);
			await expect(status).toHaveCSS("min-height", "32px");
			await expect(status).toHaveCSS("border-radius", "8px");
			await expect(status).toHaveCSS("padding-inline-start", "8px");
			await expect(status).toHaveCSS("padding-inline-end", "12px");
			await expect(status).toHaveCSS("font-size", "13px");
			await fitsViewport(menu);
			await page.mouse.click(2, 2);
			await expect(menu).toBeHidden();

			await trigger.press("Shift+F10");
			await expect(status).toBeFocused();
			await expect(status).toHaveAttribute("aria-haspopup", "dialog");
			await page.keyboard.press("ArrowRight");
			await expect(search).toBeFocused();
			await expect(statusMenu.getByRole("option", { name: "Todo" })).toHaveAttribute(
				"aria-current",
				"true"
			);
			await expect(statusMenu.locator('[data-slot="input-group"]')).toHaveCSS("height", "36px");
			await expect(statusMenu).toHaveCSS(
				"box-shadow",
				colorScheme === "light" ? /0px 9px 48px/ : /0px 4px 40px/
			);
			if (width > 320) await expect(statusMenu).toHaveCSS("width", "175px");
			await fitsViewport(menu);
			await fitsViewport(statusMenu);
			if (width === 320) await expect(statusMenu).toHaveAttribute("data-side", /top|bottom/);
			await search.fill("unavailable");
			await expect(statusMenu.getByText("No matching statuses")).toBeVisible();
			await page.keyboard.press("Escape");
			await expect(statusMenu).toBeHidden();
			await expect(menu).toBeVisible();
			await expect(status).toBeFocused();
			await page.keyboard.press("ArrowRight");
			await expect(search).toBeFocused();
			await expect(search).toHaveValue("");
			await fitsViewport(statusMenu);
			await search.fill("progress");
			const inProgress = statusMenu.getByRole("option", { name: "In progress" });
			await expect(statusMenu.getByRole("option")).toHaveCount(1);
			await expect(inProgress).toBeVisible();
			await search.press("Enter");
			await expect(menu).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect(trigger).toContainText("In progress");

			await trigger.press("ContextMenu");
			await page.keyboard.press("End");
			const deletion = menu.getByRole("menuitem", { name: "Delete…" });
			await expect(deletion).toBeFocused();
			await expect(deletion).toHaveAttribute("data-variant", "default");
			await page.keyboard.press("Enter");
			const confirmation = page.getByRole("alertdialog", { name: "Delete issue?" });
			await expect(confirmation.getByRole("button", { name: "Cancel" })).toBeFocused();
			await page.keyboard.press("Escape");
			await expect(confirmation).toBeHidden();
			await expect(trigger).toBeFocused();

			await trigger.press("Shift+F10");
			await menu.getByRole("menuitem", { name: "Copy", exact: true }).press("ArrowRight");
			const copyMenu = page.getByRole("menu", { name: "Copy issue details" });
			await copyMenu.getByRole("menuitem", { name: "Issue ID" }).press("Enter");
			await expect(page.getByText("Issue ID: VLR-12", { exact: true })).toBeVisible();
			await expect(trigger).toBeFocused();
		});
	}
}

test("Context Menu fits a short viewport and navigates disabled, checkbox and radio items", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 290 });
	await page.goto("/docs/components/context-menu");
	const trigger = page.getByRole("group", { name: "Page actions" });
	const menu = page.getByRole("menu", { name: "Page actions" });
	await trigger.press("Shift+F10");
	await expect(menu.getByRole("menuitem", { name: /Back/ })).toBeFocused();
	await page.keyboard.press("ArrowDown");
	await expect(menu.getByRole("menuitem", { name: /Reload/ })).toBeFocused();
	await page.keyboard.press("End");
	const option = menu.getByRole("menuitemradio", { name: "Colm Tuite" });
	await expect(option).toBeFocused();
	await page.keyboard.press("Space");
	await expect(option).toHaveAttribute("aria-checked", "true");
	await fitsViewport(menu);
	await expect.poll(() => menu.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
	const checkbox = menu.getByRole("menuitemcheckbox", { name: "Show Full URLs" });
	await checkbox.press("Space");
	await expect(checkbox).toHaveAttribute("aria-checked", "true");
	await page.keyboard.press("Escape");
	await expect(trigger).toBeFocused();

	const checkboxTrigger = page.getByRole("group", { name: "Checkbox actions" });
	await checkboxTrigger.click({ button: "right" });
	const mixed = page.getByRole("menuitemcheckbox", { name: "Show Developer Tools" });
	await expect(mixed).toHaveAttribute("aria-checked", "mixed");
	await expect(mixed.locator('[data-slot="context-menu-item-indicator"] svg')).toBeVisible();
	await mixed.press("Space");
	await expect(mixed).toHaveAttribute("aria-checked", "true");
});

test.describe("Touch", () => {
	test.use({ hasTouch: true });

	test("Context Menu opens by touch long press", async ({ page, context }) => {
		await page.setViewportSize({ width: 390, height: 750 });
		await page.goto("/docs/components/context-menu");
		const trigger = page.getByRole("group", { name: "Issue VLR-12" });
		await trigger.scrollIntoViewIfNeeded();
		const bounds = (await trigger.boundingBox())!;
		const session = await context.newCDPSession(page);
		await session.send("Input.dispatchTouchEvent", {
			type: "touchStart",
			touchPoints: [{ x: bounds.x + 16, y: bounds.y + 16 }],
		});
		const menu = page.getByRole("menu", { name: "Issue actions", exact: true });
		await expect(menu).toBeVisible();
		await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
		await fitsViewport(menu);
	});
});
