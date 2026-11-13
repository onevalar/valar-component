import { expect, test } from "@playwright/test";

for (const { colorScheme, width } of [
	{ colorScheme: "light", width: 1366 },
	{ colorScheme: "dark", width: 390 },
] as const) {
	test(`Timeline Sheet is nonmodal in ${colorScheme} at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/sheet");

		const preview = page.locator('[data-example="sheet-timeline"]');
		const trigger = preview.getByRole("button", { name: "Timeline sidebar" });
		const panel = preview.getByRole("region", { name: "Timeline insights" });
		await trigger.press("Enter");
		await expect(panel).toBeVisible();
		await expect(trigger).toBeFocused();
		await expect(trigger).toHaveAttribute("aria-controls", (await panel.getAttribute("id"))!);
		await expect(trigger).toHaveAttribute("aria-expanded", "true");
		await expect(page.locator('[data-slot="sheet-overlay"]')).toHaveCount(0);

		await page.keyboard.press("Escape");
		const completed = preview.getByRole("button", { name: "Completed" });
		await completed.click();
		await expect(completed).toHaveAttribute("aria-pressed", "true");
		await expect(panel).toBeVisible();

		await trigger.press("Tab");
		await expect(panel.getByRole("tab", { name: "Health" })).toBeFocused();
		await page.keyboard.press("ArrowRight");
		const leads = panel.getByRole("tab", { name: "Leads" });
		await expect(leads).toBeFocused();
		await expect(panel.getByRole("tabpanel").getByText("Jordan Lee").first()).toBeVisible();

		const card = panel.locator('[data-slot="sheet-header"]');
		await expect(card).toHaveCSS("border-radius", "10px");
		await expect(card).toHaveCSS("padding", "12px");
		await expect(card).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(9.232 0.85 272)" : "lch(100 0 282)"
		);
		if (width === 1366) await expect(panel).toHaveCSS("width", "400px");
		const scrollport = panel.locator('[data-slot="sheet-panel-scroll"]');
		expect(
			await scrollport.evaluate((element) => {
				element.scrollTop = element.scrollHeight;
				return element.scrollTop;
			})
		).toBeGreaterThan(0);

		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await expect
			.poll(() => panel.evaluate((element) => element.contains(document.activeElement)))
			.toBe(false);
		await leads.press("Escape");
		await expect(panel).toBeHidden();
		await expect(trigger).toBeFocused();
		await expect(trigger).toHaveAttribute("aria-expanded", "false");
	});
}

test("Modal Sheet retains focus containment and respects reduced motion", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 800 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/docs/components/sheet");

	for (const side of ["top", "right", "bottom", "left"]) {
		const trigger = page.getByRole("button", { name: side, exact: true });
		await trigger.press("Enter");
		const dialog = page.getByRole("dialog", { name: "Edit profile" });
		const overlay = page.locator('[data-slot="sheet-overlay"]');
		await expect(dialog).toHaveAttribute("data-side", side);
		await expect(dialog).toHaveAttribute("aria-modal", "true");
		await expect(dialog).toHaveCSS("animation-name", "none");
		await expect(overlay).toHaveCSS("animation-name", "none");
		await page.keyboard.press("Tab");
		await expect
			.poll(() => dialog.evaluate((element) => element.contains(document.activeElement)))
			.toBe(true);
		await page.keyboard.press("Escape");
		await expect(dialog).toBeHidden();
		await expect(trigger).toBeFocused();
	}
});
