import { expect, test } from "@playwright/test";

test("compound inputs keep their icon placement and feedback inside the control", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	for (const colorScheme of ["light", "dark"] as const) {
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/native-select");
		const wrapper = page.locator('.preview [data-slot="native-select-wrapper"]').first();
		const select = wrapper.locator('[data-slot="native-select"]');
		const icon = wrapper.locator('[data-slot="native-select-icon"]');
		await expect(icon).toBeVisible();
		const ltr = await icon.evaluate((e) => e.getBoundingClientRect().left);
		await wrapper.evaluate((node) => node.setAttribute("dir", "rtl"));
		await expect(select).toHaveCSS("padding-left", "32px");
		await expect(select).toHaveCSS("padding-right", "10px");
		await expect.poll(() => icon.evaluate((e) => e.getBoundingClientRect().left)).toBeLessThan(ltr);

		await page.goto("/docs/components/radio-group");
		const group = page.locator('.preview [data-slot="radio-group"]').first();
		const radios = group.getByRole("radio");
		await expect(radios.first()).toBeVisible();
		await radios.first().focus();
		await page.keyboard.press("ArrowDown");
		await expect(radios.nth(1)).toBeFocused();
		await expect(radios.nth(1)).toBeChecked();
	}
});

test("Issue Composer and Issue Detail work from their basic component pages", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
	await page.goto("/docs/components/issue-composer");
	const trigger = page.locator(".preview").getByRole("button", { name: "New issue", exact: true });
	await trigger.click();
	const composer = page.getByRole("dialog");
	const title = composer.getByRole("textbox", { name: "Title", exact: true });
	await expect(title).toBeFocused();
	await composer.getByRole("button", { name: "Create issue", exact: true }).click();
	await expect(composer.getByRole("alert")).toHaveText("Enter an issue title.");
	await title.fill("Check the component preview");
	await composer.getByRole("button", { name: "Create issue", exact: true }).click();
	await expect(composer).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(page.locator(".preview").getByRole("status")).toHaveText(
		"Created · Check the component preview"
	);

	await page.goto("/docs/components/issue-detail");
	const detail = page.locator(".preview").getByRole("region", { name: "Issue details" });
	const frame = page.locator(".preview").getByRole("region", { name: "Preview", exact: true });
	await expect(frame).toHaveCSS("scrollbar-width", "none");
	await expect
		.poll(() => frame.evaluate((node) => node.scrollHeight - node.clientHeight))
		.toBeGreaterThan(0);
	await expect
		.poll(() => detail.evaluate((node) => node.getBoundingClientRect().width))
		.toBeGreaterThan(250);
	await detail.getByRole("button", { name: "Edit title", exact: true }).click();
	const editTitle = detail.getByRole("textbox", { name: "Issue title" });
	await editTitle.fill("A revised issue title");
	await editTitle.press("Control+Enter");
	await expect(detail.getByRole("heading", { name: "A revised issue title" })).toBeVisible();
});
