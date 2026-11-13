import { expect, test } from "@playwright/test";

test("the basic Date Picker keeps precision and enforces date bounds", async ({ page }) => {
	await page.goto("/zh/docs/components/date-picker", { waitUntil: "networkidle" });
	const start = page.getByRole("button", { name: "Start date", exact: true }).first();
	const target = page.getByRole("button", { name: "Target date", exact: true }).first();
	await start.click();
	const startPicker = page.getByRole("dialog", { name: "Start date", exact: true });
	const startInput = startPicker.getByRole("textbox", { name: "Enter date" });
	await expect(startInput).toBeFocused();
	await startInput.fill("2027-05-20");
	await startInput.press("Enter");
	await expect(start).toBeFocused();
	await expect(start).toHaveCSS("outline-offset", "-1px");

	await target.click();
	const targetPicker = page.getByRole("dialog", { name: "Target date", exact: true });
	await targetPicker.getByRole("tab", { name: "Quarter", exact: true }).click();
	await expect(targetPicker.getByRole("button", { name: "Q1 2027", exact: true })).toBeDisabled();
	const targetInput = targetPicker.getByRole("textbox", { name: "Enter date" });
	await targetInput.fill("Q1 2027");
	await targetInput.press("Enter");
	await expect(targetPicker.getByRole("alert")).toContainText("earliest available date");
	await targetInput.fill("Q2 2027");
	await targetInput.press("Enter");
	await expect(target).toHaveText("Q2 2027");
	await expect(target).toBeFocused();

	await start.click();
	await startInput.fill("2027-07-01");
	await startInput.press("Enter");
	await expect(startPicker.getByRole("alert")).toContainText("latest available date");
	await startInput.press("Escape");
	await expect(start).toHaveText("May 20");
	await expect(start).toBeFocused();
});

for (const colorScheme of ["light", "dark"] as const) {
	test(`Date Picker matches the project panel and accepts direct dates in ${colorScheme}`, async ({
		page,
	}) => {
		const width = colorScheme === "dark" ? 320 : 1280;
		await page.setViewportSize({ width, height: 620 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/zh/docs/components/date-picker");
		const trigger = page.getByRole("button", { name: "Target date", exact: true }).first();
		await trigger.press("Enter");
		const panel = page.getByRole("dialog", { name: "Target date", exact: true });
		const input = panel.getByRole("textbox", { name: "Enter date" });
		await expect(input).toBeFocused();
		await expect(input).toHaveCSS("height", "32px");
		await expect(input).toHaveCSS("font-size", "12px");
		await expect(panel).toHaveCSS("border-radius", "8px");
		await expect(panel).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(16.433 1.3 272)" : "rgb(255, 255, 255)"
		);
		await expect(panel.getByRole("tab", { name: "Day" })).toHaveCSS("height", "28px");
		await expect(panel.getByRole("tablist")).toHaveCSS("height", "32px");
		await expect
			.poll(() =>
				panel.evaluate((el) => {
					const rect = el.getBoundingClientRect();
					return (
						rect.left >= 0 &&
						rect.right <= innerWidth &&
						rect.top >= 0 &&
						rect.bottom <= innerHeight
					);
				})
			)
			.toBe(true);
		const day = panel.getByRole("tab", { name: "Day" });
		await day.press("ArrowRight");
		await expect(panel.getByRole("tab", { name: "Month" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		await expect(panel.getByRole("tabpanel")).toBeVisible();

		await input.fill("2027-02-29");
		await input.press("Enter");
		await expect(input).toHaveAccessibleDescription("Enter a valid date.");
		await expect(input).toBeFocused();
		await input.fill("May 2027");
		await input.press("Enter");
		await expect(trigger).toHaveText("May 2027");
		await expect(trigger).toBeFocused();
		await trigger.press("Enter");
		await expect(panel.getByRole("tab", { name: "Month" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		await expect(panel.getByRole("button", { name: "May 2027", exact: true })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
		await input.fill("");
		await input.press("Enter");
		await expect(trigger).toHaveText("Target date");
		await expect(trigger).toBeFocused();
		await trigger.press("Enter");
		await input.fill("H2 2027");
		await input.press("Enter");
		await expect(trigger).toHaveText("H2 2027");
		await trigger.press("Enter");
		await panel.getByRole("button", { name: "Clear date" }).press("Enter");
		await expect(trigger).toHaveText("Target date");
		await expect(trigger).toBeFocused();
	});
}
