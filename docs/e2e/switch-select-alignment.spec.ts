import { expect, test, type Locator } from "@playwright/test";

async function activeOption(trigger: Locator) {
	return trigger.getAttribute("aria-activedescendant");
}

for (const colorScheme of ["light", "dark"] as const) {
	test(`Switch has a visible inner focus in each state (${colorScheme})`, async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 900 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/switch");
		const control = page.getByRole("switch", { name: "Airplane mode", exact: true });
		const thumb = control.locator('[data-slot="switch-thumb"]');
		await expect(control).toHaveCSS("width", "30px");
		await expect(control).toHaveCSS("height", "20px");
		await expect(thumb).toHaveCSS("width", "14px");
		await expect(thumb).toHaveCSS("transition-property", "none");
		await control.press("Space");
		await expect(control).toBeChecked();
		await expect(control).toHaveCSS("outline-offset", "-1px");
		await expect(control).toHaveCSS("outline-color", "rgb(255, 255, 255)");
		await control.press("Enter");
		await expect(control).not.toBeChecked();
		await expect(control).toHaveCSS(
			"outline-color",
			colorScheme === "light" ? "lch(53 52.26 286.91)" : "lch(47.918 59.303 288.421)"
		);
		await page.locator("label").filter({ hasText: "Airplane mode" }).click();
		await expect(control).toBeChecked();

		const compact = page.getByRole("switch", { name: "Create more", exact: true });
		await expect(compact).toHaveCSS("width", "22px");
		await expect(compact).toHaveCSS("height", "14px");
		await expect(compact.locator('[data-slot="switch-thumb"]')).toHaveCSS("width", "10px");
		await compact.press("Space");
		await expect(compact).toBeChecked();
		await expect(page.getByRole("switch", { name: "Workspace alerts" })).toBeDisabled();
		await expect(page.getByRole("switch", { name: "Security notices" })).toBeDisabled();
		const invalid = page.getByRole("switch", { name: "Secure sign-in" });
		await expect(invalid).toHaveAccessibleDescription(
			"Secure sign-in is required for this workspace."
		);
		await invalid.press("Space");
		await expect(invalid).toBeChecked();
		await expect(invalid).not.toHaveAttribute("aria-invalid", "true");

		const pending = page.getByRole("switch", { name: "Product updates" });
		await pending.press("Space");
		await expect(pending).toHaveAttribute("aria-busy", "true");
		await expect(pending).toBeDisabled();
		await expect(pending).toBeEnabled();
		await expect(pending).toBeFocused();
		await expect(pending).toBeChecked();
		await expect
			.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
			.toBeLessThanOrEqual(390);
	});

	test(`Select keeps highlight, selection, and focus distinct (${colorScheme})`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 900 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/select");
		const settings = page.getByRole("combobox", { name: "Font size" });
		const normal = page.getByRole("combobox", { name: "Favorite fruit" });
		for (const trigger of [settings, normal]) {
			await expect(trigger).toHaveCSS("height", "30px");
			await expect(trigger).toHaveCSS("border-radius", "8px");
			await expect(trigger).toHaveCSS("gap", "6px");
		}
		await settings.press("ArrowDown");
		const menu = page.getByRole("listbox", { name: "Font sizes" });
		await expect(menu).toHaveCSS("border-radius", "12px");
		await expect(menu).toHaveCSS(
			"background-color",
			colorScheme === "light" ? "lch(100 0 282)" : "lch(16.433 1.3 272)"
		);
		await expect(menu).toHaveCSS("animation-name", "none");
		const first = menu.getByRole("option", { name: "Default" });
		const small = menu.getByRole("option", { name: "Small" });
		await expect(first).toHaveAttribute("aria-selected", "true");
		await expect(first).toHaveCSS("min-height", "32px");
		await expect(first).toHaveCSS("padding-inline-end", "35px");
		await settings.press("ArrowDown");
		await expect.poll(() => activeOption(settings)).toBe(await small.getAttribute("id"));
		await expect(small).toHaveCSS(
			"background-color",
			colorScheme === "light" ? "lch(95.886 0 282)" : "lch(25.69 1.975 272)"
		);
		await expect(small).toHaveAttribute("aria-selected", "false");
		await expect(first).toHaveAttribute("aria-selected", "true");
		await settings.press("Escape");
		await expect(menu).toBeHidden();
		await expect(settings).toBeFocused();
		await expect(settings).toHaveCSS("outline-offset", "-1px");
		await expect(settings).toContainText("Default");

		await expect(page.getByRole("combobox", { name: "Locked fruit" })).toBeDisabled();
		const available = page.getByRole("combobox", { name: "Available fruit" });
		await available.press("ArrowDown");
		const availableMenu = page.getByRole("listbox", { name: "Available fruit options" });
		await expect(availableMenu.getByRole("option", { name: "Grapes" })).toBeDisabled();
		await available.press("End");
		await available.press("ArrowUp");
		await expect
			.poll(() => activeOption(available))
			.toBe(await availableMenu.getByRole("option", { name: "Blueberry" }).getAttribute("id"));
		await available.press("Enter");
		await expect(available).toContainText("Blueberry");

		const required = page.getByRole("combobox", { name: "Required fruit" });
		await expect(required).toHaveAccessibleDescription("Please select a fruit.");
		await required.press("ArrowDown");
		await required.press("Enter");
		await expect(required).toHaveText("Apple");
		await expect(required).not.toHaveAttribute("aria-invalid", "true");
		await expect(page.getByText("Please select a fruit.")).toBeHidden();
	});
}

test("Select submits and resets multiple values and scrolls long options into view", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 900 });
	await page.goto("/docs/components/select");
	const multi = page.getByRole("combobox", { name: "Notifications" });
	await multi.press("ArrowDown");
	const menu = page.getByRole("listbox", { name: "Notification types" });
	await expect(menu).toHaveAttribute("aria-multiselectable", "true");
	await multi.press("Enter");
	await multi.press("ArrowDown");
	await multi.press("Enter");
	await expect(menu.getByRole("option", { selected: true })).toHaveCount(2);
	await multi.press("Escape");
	await expect(multi).toBeFocused();
	await page.getByRole("button", { name: "Save notifications" }).click();
	await expect(page.getByText("Saved issues, projects.")).toBeVisible();
	await page.getByRole("button", { name: "Reset notifications" }).click();
	await expect(multi).toHaveText("Choose notification types");

	const timeZone = page.getByRole("combobox", { name: "Time zone" });
	await timeZone.press("ArrowDown");
	const timeZoneMenu = page.getByRole("listbox", { name: "Time zones" });
	await expect(timeZoneMenu.getByRole("group", { name: "North America" })).toBeVisible();
	await timeZone.press("End");
	const last = timeZoneMenu.getByRole("option", { name: "Chile Standard Time" });
	await expect.poll(() => activeOption(timeZone)).toBe(await last.getAttribute("id"));
	await expect(last).toBeInViewport();
	await timeZone.press("Enter");
	await expect(timeZone).toHaveText("Chile Standard Time");
	await expect
		.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
		.toBeLessThanOrEqual(390);
});
