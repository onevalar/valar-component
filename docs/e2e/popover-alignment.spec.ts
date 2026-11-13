import { expect, test, type Locator } from "@playwright/test";

async function fitsViewport(panel: Locator) {
	await expect
		.poll(() =>
			panel.evaluate((el) => {
				const rect = el.getBoundingClientRect();
				return (
					rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight
				);
			})
		)
		.toBe(true);
}

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [1200, 320]) {
		test(`Popover options and generic forms work in ${colorScheme} at ${width}px`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: width === 320 ? 450 : 900 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/zh/docs/components/popover");
			await expect(page.locator("html")).toHaveCSS("color-scheme", colorScheme);

			const trigger = page.getByRole("button", { name: "Display options", exact: true });
			await trigger.scrollIntoViewIfNeeded();
			const before = await page.evaluate(() => scrollY);
			await trigger.press("Enter");
			const panel = page.getByRole("dialog", { name: "Display options", exact: true });
			await expect(panel).toHaveCSS("border-radius", "12px");
			await expect(panel).toHaveCSS("animation-name", "none");
			await expect(panel).toHaveCSS(
				"background-color",
				colorScheme === "light" ? "rgb(255, 255, 255)" : "lch(12.72 0.85 272)"
			);
			if (width > 320) await expect(panel).toHaveCSS("width", "330px");
			await fitsViewport(panel);
			expect(await page.evaluate(() => scrollY)).toBe(before);

			const grouping = panel.getByRole("combobox", { name: "Grouping", exact: true });
			await expect(grouping).toHaveCSS("height", "24px");
			await grouping.press("ArrowDown");
			await expect(page.getByRole("option", { name: "Lead", exact: true })).toBeVisible();
			await fitsViewport(page.locator('[data-slot="select-content"]'));
			await page.keyboard.press("Escape");
			await expect(page.getByRole("option", { name: "Lead", exact: true })).toBeHidden();
			await expect(grouping).toBeFocused();
			await expect(panel).toBeVisible();
			await grouping.press("ArrowDown");
			await page.getByRole("option", { name: "Lead", exact: true }).click();
			await expect(grouping).toHaveText("Lead");

			const weeks = panel.getByRole("checkbox", { name: "Show week numbers" });
			await weeks.press("Space");
			await expect(weeks).toBeChecked();
			await panel.getByRole("button", { name: "Reset" }).press("Enter");
			await expect(weeks).not.toBeChecked();
			await expect(grouping).toHaveText("No grouping");
			await panel.getByRole("button", { name: "Done" }).press("Enter");
			await expect(panel).toBeHidden();
			await expect(trigger).toBeFocused();

			const plain = page.getByRole("button", { name: "Open popover", exact: true }).first();
			await plain.scrollIntoViewIfNeeded();
			await plain.press("Enter");
			const form = page.locator('[data-slot="popover-content"][data-appearance="default"]');
			await fitsViewport(form);
			const field = form.getByRole("textbox", { name: "Width", exact: true });
			await field.fill("80%");
			await expect(field).toHaveValue("80%");
			await page.keyboard.press("Escape");
			await expect(form).toBeHidden();
			await expect(plain).toBeFocused();

			await plain.click();
			await expect(form).toBeVisible();
			await page.mouse.click(0, 0);
			await expect(form).toBeHidden();

			for (const align of ["start", "center", "end"]) {
				const alignTrigger = page.getByRole("button", { name: align, exact: true });
				const aligned = form.filter({ hasText: `Aligned to ${align}` });
				await alignTrigger.press("Enter");
				await expect(aligned).toHaveText(`Aligned to ${align}`);
				await fitsViewport(aligned);
				if (width > 320) await expect(aligned).toHaveAttribute("data-align", align);
				await page.keyboard.press("Escape");
				await expect(aligned).toBeHidden();
				await expect(alignTrigger).toBeFocused();
			}

			if (width === 320) {
				await page.setViewportSize({ width, height: 235 });
				await trigger.scrollIntoViewIfNeeded();
				await trigger.press("Enter");
				await fitsViewport(panel);
				await expect
					.poll(() => panel.evaluate((el) => el.scrollHeight - el.clientHeight))
					.toBeGreaterThan(0);
				await panel.getByRole("button", { name: "Done" }).focus();
				await expect.poll(() => panel.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
				await page.keyboard.press("Enter");
				await expect(trigger).toBeFocused();
			}
		});
	}
}
