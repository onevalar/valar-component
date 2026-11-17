import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`agent question commits a choice and focuses the composer at ${width}px in ${colorScheme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 800 });
			await page.emulateMedia({ colorScheme });
			await page.goto("/docs/components/questionnaire", { waitUntil: "networkidle" });

			const form = page.getByRole("form", { name: "Agent questionnaire preview" });
			const question = form.getByRole("group", { name: "Which report format would you like? (Required)" });
			const title = question.locator("legend");
			const group = question.locator('[data-slot="questionnaire-agent-choices"]');
			const choices = question.getByRole("button");
			const summary = question.getByRole("button", { name: "Summary" });
			const checklist = question.getByRole("button", { name: "Checklist" });
			const composer = form.getByRole("textbox", { name: "Additional instructions" });
			const skip = form.getByRole("button", { name: "Skip", exact: true });
			const status = form.getByRole("status");
			await expect(choices).toHaveText(["Summary", "Checklist", "Timeline", "Do nothing"]);
			await expect(composer).toHaveCount(0);
			await expect(title).toHaveCSS("font-size", "15px");
			await expect(title).toHaveCSS("font-weight", "450");
			await expect(title).toHaveCSS("padding-inline-start", "10px");
			await expect(group).toHaveCSS("flex-wrap", "wrap");
			await expect(group).toHaveCSS("gap", "6px");
			await expect(group).toHaveCSS("padding-inline-start", "10px");
			await expect(summary).toHaveCSS("height", "32px");
			await expect(summary).toHaveCSS("font-size", "13px");
			await expect(summary).toHaveCSS("font-weight", "500");
			await expect(summary).toHaveCSS(
				"color",
				colorScheme === "dark" ? "lch(90.826 1.425 272)" : "lch(20 1 282)"
			);
			await expect(summary).toHaveCSS(
				"background-color",
				colorScheme === "dark" ? "lch(13.861 1.139 272)" : "rgb(255, 255, 255)"
			);

			const boundaries = await Promise.all((await choices.all()).map(async (choice) => (await choice.boundingBox())!));
			const groupBounds = (await group.boundingBox())!;
			expect(boundaries[0].x - groupBounds.x).toBe(10);
			expect(boundaries[1].x - boundaries[0].x - boundaries[0].width).toBe(6);
			expect(Math.max(...boundaries.map(({ x, width }) => x + width))).toBeLessThanOrEqual(groupBounds.x + groupBounds.width - 10);
			if (width === 320) expect(boundaries[3].y).toBeGreaterThan(boundaries[0].y);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);

			await summary.focus();
			await expect(summary).toHaveCSS("outline-offset", "-1px");
			await expect(summary).toHaveCSS("outline-style", "solid");
			await page.keyboard.press("Tab");
			await expect(checklist).toBeFocused();
			await page.keyboard.press("Enter");
			await expect(choices).toHaveText(["Checklist"]);
			await expect(checklist).toBeDisabled();
			await expect(checklist).toHaveAttribute("aria-pressed", "true");
			await expect(checklist.locator("svg")).toBeVisible();
			await expect(checklist).toHaveCSS("opacity", "1");
			await expect(checklist).toHaveCSS(
				"background-color",
				colorScheme === "dark" ? "lch(18.49 1.525 272)" : "lch(94.85 0.5 282)"
			);
			await expect(composer).toBeFocused();
			await composer.fill("Include the dates.");
			await composer.press("Enter");
			await expect(status).toHaveText("Checklist · Include the dates.");
			await expect(status).toBeFocused();

			await form.getByRole("button", { name: "Restart preview" }).click();
			await expect(summary).toBeFocused();
			await expect(choices).toHaveCount(4);
			await expect(composer).toHaveCount(0);
			await page.keyboard.press("Space");
			await expect(composer).toBeFocused();
			await skip.click();
			await expect(status).toHaveText("Summary");
		});
	}
}
