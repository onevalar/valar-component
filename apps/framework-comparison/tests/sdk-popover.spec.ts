import { expect, test } from "@playwright/test";

const react = process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/";

for (const backend of ["radix", "ui-sdk"]) {
	test.describe(`React Popover · ${backend}`, () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(`${react}?example=popover&backend=${backend}`);
		});

		test("defaultOpen initializes an uncontrolled popup", async ({ page }) => {
			await page.goto(`${react}?example=popover&backend=${backend}&options=open`);
			const trigger = page.getByRole("button", { name: "Display options" });
			const panel = page.getByRole("dialog", { name: "Display options" });
			await expect(trigger).toHaveAttribute("aria-expanded", "true");
			await panel.getByRole("button", { name: "Done" }).click();
			await expect(panel).toBeHidden();
		});

		test("form preserves the existing call site and restores focus", async ({ page }) => {
			const trigger = page.getByRole("button", { name: "Edit profile" });
			const panel = page.getByRole("dialog", { name: "Edit profile" });
			const input = panel.getByRole("textbox", { name: "Display name" });
			await expect(trigger.locator("button")).toHaveCount(0);
			await expect(trigger).toHaveAttribute("aria-expanded", "false");
			await trigger.press("Enter");
			await expect(trigger).toHaveAttribute("aria-expanded", "true");
			await expect(panel).toHaveAccessibleDescription("Set your display name.");
			await expect(input).toBeFocused();
			await input.fill("");
			await panel.getByRole("button", { name: "Save profile" }).click();
			await expect(panel).toBeVisible();
			await input.fill("Unsaved draft");
			await panel.getByRole("button", { name: "Cancel" }).click();
			await expect(panel).toBeHidden();
			await expect(trigger).toBeFocused();
			await trigger.click();
			await expect(input).toHaveValue("Valar");
			await input.fill("团队 Valar");
			await input.press("Enter");
			await expect(panel).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect(page.getByLabel("Saved display name")).toHaveText("团队 Valar");
			await trigger.click();
			await expect(panel).toBeVisible();
			await page.mouse.click(4, 400);
			await expect(panel).toBeHidden();
		});

		test("checks that the UI SDK Select coexists cleanly with its parent Popover", async ({
			page,
		}) => {
			const trigger = page.getByRole("button", { name: "Display options" });
			const panel = page.getByRole("dialog", { name: "Display options" });
			const grouping = panel.getByRole("combobox", { name: "Grouping" });
			const list = page.getByRole("listbox");
			await trigger.click();
			await expect(trigger).toHaveAttribute("aria-expanded", "true");
			await grouping.press("ArrowDown");
			await expect(list).toBeVisible();
			await page.keyboard.press("Escape");
			await expect(list).toBeHidden();
			await expect(panel).toBeVisible();
			await expect(grouping).toBeFocused();
			await grouping.click();
			await page.getByRole("option", { name: "Lead", exact: true }).click();
			await expect(panel).toBeVisible();
			await expect(grouping).toHaveText("Lead");
			await expect(grouping).toBeFocused();
			await page.keyboard.press("Escape");
			await expect(panel).toBeHidden();
			await expect(trigger).toBeFocused();
		});
	});
}
