import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 820 } });
test.beforeEach(async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
});

test("Collapsible keeps the Properties layout and the composed trigger contract", async ({
	page,
}) => {
	await page.goto("/docs/components/collapsible");
	const properties = page.getByRole("button", { name: "Properties", exact: true });
	const lock = page.getByRole("button", { name: "Lock properties", exact: true });
	await expect(properties).toHaveCSS("height", "28px");
	await expect(properties).toHaveCSS("column-gap", "3px");
	await expect(properties.locator('[data-slot="collapsible-indicator"]')).toHaveCSS(
		"transition-property",
		"none"
	);
	const panel = properties.locator('xpath=following-sibling::*[@data-slot="collapsible-content"]');
	await expect(panel).toBeVisible();
	await properties.press("Enter");
	await expect(panel).toBeHidden();
	await expect(panel.getByText("Avery Chen")).toBeAttached();
	await expect(properties).toBeFocused();
	await properties.press("Space");
	await expect(panel).toBeVisible();
	await expect
		.poll(
			async () =>
				(await lock.boundingBox())!.y -
				((await panel.boundingBox())!.y + (await panel.boundingBox())!.height)
		)
		.toBeGreaterThanOrEqual(0);
	await lock.click();
	await expect(properties).toBeDisabled();
	await expect(properties).toHaveAttribute("aria-expanded", "true");

	const composed = page.getByRole("button", { name: "Toggle details", exact: true });
	await expect(composed).toHaveAttribute("data-slot", "collapsible-trigger");
	await expect(composed).toHaveAttribute("aria-expanded", "false");
	await composed.press("Space");
	await expect(composed).toHaveAttribute("aria-expanded", "true");
	await expect(page.getByText("Shipping address", { exact: true }).first()).toBeVisible();
});

test("Accordion navigation skips disabled items and reduced motion keeps content usable", async ({
	page,
}) => {
	await page.goto("/docs/components/accordion");
	const first = page.getByRole("button", { name: "Can I access my account history?", exact: true });
	const disabled = page.getByRole("button", { name: "Premium feature information", exact: true });
	const last = page.getByRole("button", { name: "How do I update my email address?", exact: true });
	await expect(disabled).toBeDisabled();
	await first.press("ArrowDown");
	await expect(last).toBeFocused();
	await last.press("ArrowDown");
	await expect(first).toBeFocused();
	await first.press("End");
	await expect(last).toBeFocused();
	await last.press("Space");
	await expect(last).toHaveAttribute("aria-expanded", "true");
	const panel = page.getByRole("region", { name: "How do I update my email address?" });
	await expect(panel).toBeVisible();
	await expect(panel).toHaveAttribute("data-slot", "accordion-content");
	await expect(panel).toHaveCSS("animation-name", "none");
	await last.press("Home");
	await expect(first).toBeFocused();
	await first.press("Enter");
	await expect(first).toHaveAttribute("aria-expanded", "true");
	await expect(last).toHaveAttribute("aria-expanded", "false");
});
