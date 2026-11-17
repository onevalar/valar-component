import { expect, test } from "@playwright/test";

const openPanel = '[data-slot="menubar-content"][data-appearance="navigation"][data-state="open"]';

for (const colorScheme of ["light", "dark"] as const) {
	test(`Navigation menubar fits at 320px and preserves keyboard commands in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 850 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/menubar", { waitUntil: "networkidle" });

		const menubar = page.getByRole("menubar", { name: "Workspace navigation", exact: true });
		const workspace = menubar.getByRole("menuitem", { name: "Workspace", exact: true });
		const resources = menubar.getByRole("menuitem", { name: "Resources", exact: true });
		await workspace.focus();
		await expect(workspace).toHaveCSS("height", "32px");
		await expect(workspace).toHaveCSS("font-size", "13px");
		await expect(workspace).toHaveCSS("font-weight", "400");
		await expect(workspace).toHaveCSS("padding-inline", "12px");
		await expect(workspace).toHaveCSS("outline-offset", "-1px");
		await expect(workspace).toHaveCSS("outline-style", "solid");
		expect(
			await workspace.evaluate((element) => parseFloat(getComputedStyle(element).borderRadius))
		).toBeGreaterThanOrEqual(16);
		const workspaceBox = (await workspace.boundingBox())!;
		const resourcesBox = (await resources.boundingBox())!;
		expect(resourcesBox.x - (workspaceBox.x + workspaceBox.width)).toBeCloseTo(4, 1);
		if (colorScheme === "dark") await expect(workspace).toHaveCSS("color", "rgb(202, 205, 209)");

		await workspace.press("Enter");
		const panel = page.locator(openPanel);
		await expect(panel.getByRole("menuitem", { name: "Issue board", exact: true })).toBeVisible();
		await expect(panel).toHaveCSS("border-radius", "14px");
		await expect(panel).toHaveCSS("border-top-width", "1px");
		await expect(panel).toHaveCSS("animation-name", "none");
		if (colorScheme === "dark")
			await expect(panel).toHaveCSS("background-color", "rgba(8, 9, 10, 0.9)");
		else await expect(panel).not.toHaveCSS("background-color", "rgba(8, 9, 10, 0.9)");

		await page.keyboard.press("ArrowRight");
		const guide = panel.getByRole("menuitem", { name: "Component guide", exact: true });
		await expect(guide).toBeVisible();
		await expect(resources).toHaveAttribute("aria-expanded", "true");
		const panelBox = (await panel.boundingBox())!;
		expect(panelBox.x).toBeGreaterThanOrEqual(7.5);
		expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(312.5);
		await expect(
			panel.getByRole("menuitem", { name: "Export workspace", exact: true })
		).toHaveAttribute("aria-disabled", "true");

		await page.keyboard.press("Escape");
		await expect(panel).toBeHidden();
		await expect(resources).toBeFocused();
		await resources.press("Enter");
		await guide.press("Enter");
		await expect(page.getByText("Current view: Component guide", { exact: true })).toBeVisible();
		await expect(panel).toBeHidden();
		await expect(resources).toBeFocused();
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});
}

test("Navigation menubar switches on hover, animates and opens a keyboard submenu", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.emulateMedia({ colorScheme: "dark", reducedMotion: "no-preference" });
	await page.goto("/docs/components/menubar", { waitUntil: "networkidle" });

	const menubar = page.getByRole("menubar", { name: "Workspace navigation", exact: true });
	const workspace = menubar.getByRole("menuitem", { name: "Workspace", exact: true });
	const resources = menubar.getByRole("menuitem", { name: "Resources", exact: true });
	const panel = page.locator(openPanel);
	await expect(workspace).toHaveCSS("transition-duration", "0.1s");
	const resting = await workspace.evaluate((element) => getComputedStyle(element).backgroundColor);
	await workspace.hover();
	await expect(workspace).not.toHaveCSS("background-color", resting);
	await workspace.click();
	await expect(
		panel.getByRole("menuitem", { name: "Project overview", exact: true })
	).toBeVisible();
	await expect(panel).toHaveCSS("animation-duration", "0.22s");
	await expect(panel).not.toHaveCSS("animation-name", "none");

	await resources.hover();
	const submenuTrigger = panel.getByRole("menuitem", { name: "Keyboard help", exact: true });
	await expect(submenuTrigger).toBeVisible();
	await submenuTrigger.press("ArrowRight");
	const submenu = page.locator('[data-slot="menubar-sub-content"][data-appearance="navigation"]');
	await expect(submenu).toBeVisible();
	await expect(submenu).toHaveCSS("border-radius", "14px");
	await submenu.getByRole("menuitem", { name: "Navigation shortcuts", exact: true }).press("Enter");
	await expect(page.getByText("Current view: Navigation shortcuts", { exact: true })).toBeVisible();
	await expect(submenu).toBeHidden();
	await expect(panel).toBeHidden();
	await expect(resources).toBeFocused();
});
