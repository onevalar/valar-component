import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Field aligns settings rows and links live validation in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1200, height: 900 });
		await page.emulateMedia({ colorScheme });
		await page.goto("/docs/components/field");
		const theme = page.getByRole("combobox", { name: "Interface theme", exact: true });
		const row = page.locator('[data-slot="field"]').filter({ has: theme });
		const label = row.locator('[data-slot="field-label"]');
		const help = row.locator('[data-slot="field-description"]');
		await expect(row).toHaveCSS("padding", "16px");
		await expect(row).toHaveCSS("gap", "12px");
		await expect(row).toHaveCSS("flex-direction", "row");
		await expect(row.locator('[data-slot="field-content"]')).toHaveCSS("gap", "3px");
		await expect(label).toHaveCSS("font-size", "13px");
		await expect(label).toHaveCSS("font-weight", "500");
		await expect(help).toHaveCSS("font-size", "12px");
		await expect(help).toHaveCSS("font-weight", "450");
		await expect(help).toHaveCSS(
			"color",
			colorScheme === "light" ? "lch(40 1 282)" : "lch(63.304 1.425 272)"
		);
		await expect(theme).toHaveAccessibleDescription("Choose your preferred appearance.");
		await theme.press("ArrowDown");
		await expect(page.getByRole("option", { name: "Dark", exact: true })).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(theme).toBeFocused();

		const identifier = page.getByRole("textbox", { name: "Identifier", exact: true });
		const identifierRow = page.locator('[data-slot="field"]').filter({ has: identifier });
		await expect(identifier).toHaveAttribute("required", "");
		await identifier.fill("?");
		await identifier.press("Tab");
		await expect(identifierRow.getByRole("alert")).toHaveText("Use 2 to 7 letters or numbers.");
		await expect(identifier).toHaveAccessibleDescription(/Use 2 to 7 letters or numbers/);
		await identifier.fill("eng");
		await expect(identifier).toHaveValue("ENG");
		await expect(identifierRow.getByRole("alert")).toHaveCount(0);
		await expect(identifier).toHaveAccessibleDescription(/ENG-123/);
		const locked = page.getByRole("group", { name: "Parent team", exact: true });
		await expect(locked).toContainText("Available on the Business plan");
		await expect(locked.locator("input,button,label")).toHaveCount(0);

		await page.setViewportSize({ width: 390, height: 900 });
		await expect(row).toHaveCSS("flex-direction", "column");
		await expect(identifierRow).toHaveCSS("flex-direction", "column");
		await expect
			.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
			.toBeLessThanOrEqual(390);
	});

	test(`Label activates only its associated control in ${colorScheme}`, async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 900 });
		await page.emulateMedia({ colorScheme });
		await page.goto("/docs/components/label");
		const name = page.getByRole("textbox", { name: "Display name", exact: true });
		const label = page.locator('label[data-appearance="settings"]');
		await expect(label).toHaveCSS("font-size", "13px");
		await expect(label).toHaveCSS("font-weight", "500");
		await expect(label).toHaveCSS(
			"color",
			colorScheme === "light" ? "lch(10 0 282)" : "lch(100 0 272)"
		);
		await label.click();
		await expect(name).toBeFocused();
		await expect(name).toHaveCSS("outline-offset", "-1px");
		const email = page.getByRole("textbox", { name: "Email", exact: true });
		await name.press("Tab");
		await expect(email).toBeFocused();
		await expect(email).toHaveAttribute("required", "");
		await expect(page.locator('[data-slot="label-required"]')).toHaveAttribute(
			"aria-hidden",
			"true"
		);
		const disabled = page.getByRole("textbox", { name: "Workspace ID", exact: true });
		await expect(disabled).toBeDisabled();
		await expect(page.locator('label[data-disabled="true"]')).toHaveCSS(
			"opacity",
			"0.5"
		);
		const updates = page.getByRole("checkbox", { name: "Receive product updates", exact: true });
		await email.press("Tab");
		await expect(updates).toBeFocused();
		await page.locator("label").filter({ hasText: "Receive product updates" }).click();
		await expect(updates).toBeChecked();
		await updates.press("Space");
		await expect(updates).not.toBeChecked();
	});
}
