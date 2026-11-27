import { expect, test } from "@playwright/test";

test("Radio Group choice cards expose separate names and descriptions and select from label clicks", async ({
	page,
}) => {
	await page.goto("/docs/components/radio-group", { waitUntil: "networkidle" });

	const plans = page.getByRole("radiogroup", { name: "Plan", exact: true });
	const plus = plans.getByRole("radio", { name: "Plus", exact: true });
	const pro = plans.getByRole("radio", { name: "Pro", exact: true });

	await expect(plus).toBeChecked();
	await expect(pro).toHaveAccessibleDescription("For growing businesses.");
	await plans.getByText("For growing businesses.", { exact: true }).click();
	await expect(pro).toBeChecked();
	await expect(plus).not.toBeChecked();
});
