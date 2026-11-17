import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Alert workflow error stays visible and recovers in ${colorScheme} at ${width}px`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 850 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/docs/components/alert", { waitUntil: "networkidle" });
			const alert = page
				.getByRole("alert")
				.filter({ hasText: "Could not verify the import source" });
			const form = page
				.locator("form")
				.filter({ has: page.getByRole("heading", { name: "Import data", exact: true }) });
			const title = alert.locator('[data-slot="alert-title"]');
			const panel = alert.locator('[data-slot="alert-description"]');
			const help = alert.getByRole("link", { name: "review the form field guide", exact: true });
			const back = form.getByRole("button", { name: "Back", exact: true });
			const next = form.getByRole("button", { name: "Next", exact: true });
			await expect(alert).toBeVisible();
			await expect(next).toBeDisabled();
			await expect(title).toHaveCSS("font-size", "15px");
			await expect(title).toHaveCSS("line-height", "23px");
			await expect(title).toHaveCSS(
				"color",
				colorScheme === "dark" ? "lch(63.304 1.425 272)" : "lch(40 1 282)"
			);
			await expect(panel).toHaveCSS("border-radius", "6px");
			await expect(panel).toHaveCSS(
				"background-color",
				colorScheme === "dark" ? "lch(11.033 1.3 272)" : "lch(94.5 0 282)"
			);
			const box = await alert.evaluate((root) => {
				const icon = root.querySelector("svg")!.getBoundingClientRect();
				const title = root.querySelector('[data-slot="alert-title"]')!.getBoundingClientRect();
				const panel = root
					.querySelector('[data-slot="alert-description"]')!
					.getBoundingClientRect();
				const footer = root.querySelector('[data-slot="alert-action"]')!;
				return {
					iconWidth: icon.width,
					iconToTitle: title.left - icon.right,
					titleToPanel: panel.top - title.bottom,
					footerBorder: getComputedStyle(footer).borderTopWidth,
					footerPadding: parseFloat(getComputedStyle(footer).paddingInlineStart),
					panelFits: panel.right <= root.getBoundingClientRect().right + 0.5
				};
			});
			expect(box).toEqual({
				iconWidth: 16,
				iconToTitle: 14,
				titleToPanel: 16,
				footerBorder: "1px",
				footerPadding: width === 320 ? 16 : 28,
				panelFits: true
			});
			await help.focus();
			await expect(help).toHaveCSS("outline-offset", "-1px");
			await page.keyboard.press("Tab");
			await expect(back).toBeFocused();
			await back.press("Enter");
			const source = form.getByRole("textbox", { name: "Source settings", exact: true });
			await expect(source).toBeFocused();
			await expect(alert).toBeHidden();
			await source.fill("invalid");
			await next.press("Enter");
			await expect(alert).toBeVisible();
			await expect(back).toBeFocused();
			await expect(next).toBeDisabled();
			await back.press("Enter");
			await source.fill("demo");
			await source.press("Enter");
			await expect(form.getByRole("status")).toHaveText("Source verified.");
			await expect(form.getByRole("status")).toBeFocused();
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		});
	}
}
