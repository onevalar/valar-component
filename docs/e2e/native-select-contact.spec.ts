import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`contact select keeps native selection and its icon geometry at ${width}px in ${colorScheme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 720 });
			await page.emulateMedia({ colorScheme });
			await page.goto("/docs/components/native-select", { waitUntil: "networkidle" });

			const form = page.getByRole("form", { name: "Company size preview" });
			const select = form.getByRole("combobox", { name: "Company size" });
			const icon = form.locator('[data-slot="native-select-icon"]');
			const submit = form.getByRole("button", { name: "Preview selection" });
			const status = form.getByRole("status");

			await expect(select).toHaveAttribute("data-appearance", "contact");
			expect(await select.evaluate((element) => element instanceof HTMLSelectElement)).toBe(true);
			await expect(select).toHaveJSProperty("required", true);
			await expect(select).toHaveValue("20-199");
			await expect(select.locator("option")).toHaveCount(5);
			await expect(select).toHaveCSS("height", "40px");
			await expect(select).toHaveCSS("border-radius", "8px");
			await expect(select).toHaveCSS("border-width", "1px");
			await expect(select).toHaveCSS("font-size", width === 320 ? "16px" : "14px");
			await expect(select).toHaveCSS("line-height", width === 320 ? "24px" : "21px");
			await expect(select).toHaveCSS("font-weight", "400");
			await expect(select).toHaveCSS("padding-inline-start", "10px");
			await expect(select).toHaveCSS("padding-inline-end", "32px");
			await expect(select).toHaveCSS("color-scheme", colorScheme);
			await expect(select).toHaveCSS(
				"color",
				colorScheme === "dark" ? "rgb(247, 248, 248)" : "lch(19.588 1.25 282)"
			);
			const quietSurface = await select.evaluate((element) => getComputedStyle(element).backgroundColor);
			await expect(select).toHaveCSS(
				"background-color",
				colorScheme === "dark" ? /0\.05\)$/ : "lch(96.5 0 282)"
			);
			await expect(select).toHaveCSS(
				"border-top-color",
				colorScheme === "dark" ? /0\.05\)$/ : "lch(91.9 0 282)"
			);
			await select.hover();
			await expect(select).toHaveCSS("background-color", quietSurface);

			await expect(icon).toHaveAttribute("aria-hidden", "true");
			await expect(icon).toHaveCSS("pointer-events", "none");
			await expect(icon).toHaveCSS("width", "16px");
			await expect(icon).toHaveCSS("height", "16px");
			const selectBox = (await select.boundingBox())!;
			const iconBox = (await icon.boundingBox())!;
			expect(selectBox.x + selectBox.width - (iconBox.x + iconBox.width)).toBe(10);
			expect(selectBox.y + (selectBox.height - iconBox.height) / 2).toBe(iconBox.y);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);

			await form.evaluate((element) => element.setAttribute("dir", "rtl"));
			const rtlIcon = (await icon.boundingBox())!;
			expect(rtlIcon.x - selectBox.x).toBe(10);
			await expect(select).toHaveCSS("padding-inline-end", "32px");
			await form.evaluate((element) => element.setAttribute("dir", "ltr"));

			await select.focus();
			await page.keyboard.press("Shift");
			await expect(select).toBeFocused();
			await expect(select).toHaveCSS("outline-style", "solid");
			await expect(select).toHaveCSS("outline-color", "rgb(94, 105, 209)");
			await expect(select).toHaveCSS("outline-offset", "-1px");
			await page.keyboard.press("1");
			await expect(select).toHaveValue(/^(1-19|10,000\+)$/);
			const selection = await select.inputValue();
			await page.keyboard.press("Tab");
			await expect(submit).toBeFocused();
			await page.keyboard.press("Enter");
			await expect(status).toHaveText(`Previewed company size: ${selection}`);
		});
	}
}
