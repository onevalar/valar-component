import { expect, test, type Locator } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Dropdown Menu keeps selection and keyboard highlight distinct in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: colorScheme === "light" ? 1200 : 390, height: 720 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/dropdown-menu");
		const trigger = page.getByRole("button", { name: "Display settings" });
		await trigger.press("Enter");
		const menu = page.getByRole("menu");
		const all = menu.getByRole("menuitemcheckbox", { name: "Show all panels" });
		const disabled = menu.getByRole("menuitemcheckbox", { name: "Activity Bar" });
		const panel = menu.getByRole("menuitemcheckbox", { name: "Panel", exact: true });
		const indicator = all.locator('[data-slot="dropdown-menu-checkbox-item-indicator"]');
		const highlight = colorScheme === "light" ? "lch(95 0 282)" : "lch(20.82 1.3 272)";
		await expect(all).toBeFocused();
		await expect(all).toHaveCSS("background-color", highlight);
		const choiceGeometry = [
			["height", "32px"],
			["border-radius", "8px"],
			["padding-inline-start", "8px"],
			["padding-inline-end", "32px"],
			["gap", "8px"],
		] as const;
		for (const [property, value] of choiceGeometry) await expect(all).toHaveCSS(property, value);

		await expect(all).toHaveCSS("box-shadow", "none");
		await expect(all).toHaveAttribute("aria-checked", "mixed");
		await expect(indicator.locator("svg")).toBeVisible();
		await all.press("Space");
		await expect(all).toBeChecked();
		await expect(panel).toBeChecked();
		await expect(disabled).toBeDisabled();
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("ArrowDown");
		await expect(panel).toBeFocused();
		await panel.press("Enter");
		await expect(panel).not.toBeChecked();
		await expect(all).toHaveAttribute("aria-checked", "mixed");
		await expect(all).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await page.keyboard.press("Escape");
		await expect(trigger).toBeFocused();

		const positions = page.getByRole("button", { name: "Panel position" });
		await positions.press("Enter");
		const top = menu.getByRole("menuitemradio", { name: "Top" });
		const bottom = menu.getByRole("menuitemradio", { name: "Bottom" });
		await expect(top).toBeFocused();
		for (const [property, value] of choiceGeometry) await expect(top).toHaveCSS(property, value);

		await expect(bottom).toBeChecked();
		await top.press("Space");
		await expect(top).toBeChecked();
		await expect(bottom).not.toBeChecked();
		await bottom.hover();
		await expect(bottom).toHaveCSS("background-color", highlight);
		await expect(top).toBeChecked();
		await page.keyboard.press("Escape");
		await expect(positions).toBeFocused();
	});
}

test("Dropdown Menu keeps a scrolled page and nested menus inside the narrow viewport", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 580 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/docs/components/dropdown-menu");
	const trigger = page.getByRole("button", { name: "Complex Menu" });
	await trigger.scrollIntoViewIfNeeded();
	const initialScroll = await page.evaluate(() => window.scrollY);
	expect(initialScroll).toBeGreaterThan(0);
	await trigger.press("Enter");
	const root = page.locator('[data-slot="dropdown-menu-content"]');
	const submenus = page.locator('[data-slot="dropdown-menu-sub-content"]');
	const fitsViewport = (menu: Locator) =>
		expect
			.poll(() =>
				menu.evaluate((element) => {
					const { left, top, right, bottom } = element.getBoundingClientRect();
					return left >= 0 && top >= 0 && right <= innerWidth && bottom <= innerHeight;
				})
			)
			.toBe(true);
	await fitsViewport(root);
	await page.keyboard.press("End");
	await expect(root.getByRole("menuitem", { name: /Sign Out/ })).toBeFocused();
	await expect.poll(() => root.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
	await page.keyboard.press("Home");
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("ArrowDown");
	const recent = root.getByRole("menuitem", { name: "Open Recent" });
	await expect(recent).toBeFocused();
	await page.keyboard.press("ArrowRight");
	await expect(submenus.first()).toBeVisible();
	await fitsViewport(submenus.first());
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("ArrowDown");
	const more = submenus.first().getByRole("menuitem", { name: "More Projects" });
	await expect(more).toBeFocused();
	await page.keyboard.press("ArrowRight");
	await expect(submenus).toHaveCount(2);
	await fitsViewport(submenus.nth(1));
	await fitsViewport(root);
	expect(await page.evaluate(() => window.scrollY)).toBe(initialScroll);
	await page.keyboard.press("ArrowLeft");
	await expect(more).toBeFocused();
	await page.keyboard.press("ArrowLeft");
	await expect(recent).toBeFocused();
	await page.keyboard.press("Escape");
	await expect(trigger).toBeFocused();
});

test("Dropdown Menu opens the delete confirmation from a neutral action and restores focus", async ({
	page,
}) => {
	await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
	await page.goto("/docs/components/dropdown-menu");
	const trigger = page.getByRole("button", { name: "Actions", exact: true });
	await trigger.press("Enter");
	const remove = page.getByRole("menuitem", { name: "Delete…", exact: true });
	await expect(remove).toHaveCSS("color", "lch(91.178 1.425 272)");
	await page.keyboard.press("End");
	await expect(remove).toBeFocused();
	await expect(remove).toHaveCSS("color", "rgb(255, 255, 255)");
	await page.keyboard.press("Enter");
	const dialog = page.getByRole("alertdialog", { name: "Delete issue?" });
	await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
	await page.keyboard.press("Escape");
	await expect(trigger).toBeFocused();
	await trigger.press("Enter");
	await page.keyboard.press("End");
	await page.keyboard.press("Enter");
	await dialog.getByRole("button", { name: "Delete issue" }).click();
	await expect(page.getByText("Issue deleted", { exact: true })).toBeVisible();
	await expect(trigger).toBeFocused();
	await trigger.press("Enter");
	await expect(remove).toBeDisabled();
});
