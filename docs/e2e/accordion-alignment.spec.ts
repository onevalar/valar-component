import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Accordion document sections fit and toggle in ${colorScheme} at ${width}px`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 844 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
				await page.goto("/docs/components/accordion", { waitUntil: "networkidle" });

			const sections = page.getByRole("group", { name: "Document sections", exact: true });
			const first = sections.getByRole("button", { name: "Implementation notes" });
			const second = sections.getByRole("button", {
				name: "Additional validation notes for reviewing the narrow layout",
			});
			const firstBody = sections.getByText("Check inputs before saving.");
			const secondBody = sections.getByText(
				"Open the section with the keyboard and check that its content aligns with the title."
			);
			const firstItem = sections.locator('[data-slot="accordion-item"]').first();
			const indicator = first.locator('[data-slot="accordion-section-indicator"]');
			const icon = first.locator('[data-slot="accordion-section-icon"]');
			const bodySlot = firstItem.locator('[data-slot="accordion-content"]');

			await expect(sections).toHaveCSS("color-scheme", colorScheme);
			await expect(first).toHaveCSS("line-height", "22.5px");
			await expect(first).toHaveCSS("gap", "3px");
			await expect(first).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
			await expect(firstItem).toHaveCSS("border-bottom-width", "0px");
			await expect(indicator).toHaveCSS("width", "21px");
			await expect(indicator).toHaveCSS("height", "20px");
			await expect(icon).toHaveCSS("width", "16px");
			await expect(icon).toHaveCSS("rotate", "90deg");
			await expect(firstBody).toHaveCSS("line-height", "22.5px");
			await expect(bodySlot).toHaveCSS("animation-name", "none");
			await expect(first).toHaveAttribute("aria-expanded", "true");
			await expect(second).toHaveAttribute("aria-expanded", "false");

			const [trigger, title, body] = await Promise.all([
				first.boundingBox(),
				first.getByText("Implementation notes").boundingBox(),
				firstBody.boundingBox(),
			]);
			expect(Math.abs(title!.x - trigger!.x - 24)).toBeLessThan(1);
			expect(Math.abs(body!.x - title!.x)).toBeLessThan(1);
			expect(Math.abs(body!.y - trigger!.y - trigger!.height - 16)).toBeLessThan(1);

			if (width === 320) {
				expect((await second.boundingBox())!.height).toBeGreaterThan(22.5);
				expect(await sections.evaluate((node) => node.scrollWidth)).toBeLessThanOrEqual(
					await sections.evaluate((node) => node.clientWidth)
				);
			}
			const viewport = sections.locator('xpath=ancestor::*[@data-slot="scroll-area-viewport"][1]');
			await expect(viewport).toHaveCSS("scrollbar-width", "none");

			await first.focus();
			await first.press("ArrowDown");
			await expect(second).toBeFocused();
			await expect(second).toHaveCSS("box-shadow", /inset/);
			await second.press("Enter");
			await expect(second).toHaveAttribute("aria-expanded", "true");
			await expect(first).toHaveAttribute("aria-expanded", "true");
			await expect(secondBody).toBeVisible();
			await expect(second).toBeFocused();

			await second.press("Home");
			await expect(first).toBeFocused();
			await first.press("Space");
			await expect(first).toHaveAttribute("aria-expanded", "false");
			await expect(icon).toHaveCSS("rotate", "none");
			await expect(firstBody).toBeHidden();
			await expect(second).toHaveAttribute("aria-expanded", "true");
			await expect(first).toBeFocused();
		});
	}
}
