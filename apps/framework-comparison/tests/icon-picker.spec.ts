import { expect, test } from "@playwright/test";

const apps = [
	["React", process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/"],
	["Vue", process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/"],
	["Svelte", new URL("svelte.html", process.env.VALAR_SVELTE_URL ?? "http://127.0.0.1:5212/").href],
] as const;

for (const [framework, url] of apps) {
	for (const [width, theme] of [
		[720, "light"],
		[320, "dark"],
	] as const) {
		test(`${framework} icon picker · ${theme}`, async ({ page }) => {
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			await page.setViewportSize({ width, height: 480 });
			await page.goto(`${url}?example=icon-picker&theme=${theme}`);
			const trigger = page.getByRole("button", { name: "Choose project icon" });
			const panel = page.getByRole("dialog", { name: "Choose project icon" });
			const search = panel.getByRole("searchbox", { name: "Search icons" });
			const status = page.getByRole("status");
			const icon = (name: string) => panel.getByRole("button", { name, exact: true });
			await expect(status).toHaveText("Selected icon: Folder");
			await trigger.press("Enter");
			await expect(search).toBeFocused();
			await expect(icon("Folder")).toHaveAttribute("aria-pressed", "true");
			await expect(panel.locator('button[tabindex="0"]')).toHaveCount(1);
			const box = (await panel.boundingBox())!;
			const anchor = (await trigger.boundingBox())!;
			const label = (await status.boundingBox())!;
			expect(anchor.x - label.x - label.width).toBeGreaterThanOrEqual(12);
			expect(box.y).toBeGreaterThan(label.y + label.height);
			expect(anchor.width).toBe(28);
			expect(box.x).toBeGreaterThanOrEqual(8);
			expect(box.x + box.width).toBeLessThanOrEqual(width - 8);
			expect(box.y - anchor.y - anchor.height).toBeCloseTo(8, 0);
			await search.press("ArrowDown");
			await expect(icon("Folder")).toBeFocused();
			await page.keyboard.press("ArrowRight");
			await expect(icon("Star")).toBeFocused();
			await page.keyboard.press("ArrowDown");
			await expect(icon("Lightbulb")).toBeFocused();
			await expect(icon("Lightbulb")).toHaveAttribute("aria-pressed", "false");
			await page.keyboard.press("Enter");
			await expect(panel).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect(status).toHaveText("Selected icon: Lightbulb");

			await trigger.click();
			await expect(search).toBeFocused();
			await search.fill("zzzz");
			await expect(panel.getByText("No icons found")).toBeVisible();
			await search.press("ArrowDown");
			await search.press("Enter");
			await expect(search).toBeFocused();
			await search.fill(" LAUNCH ");
			await expect(icon("Rocket")).toBeVisible();
			await search.dispatchEvent("keydown", { key: "Enter", isComposing: true });
			await expect(search).toBeFocused();
			await expect(status).toHaveText("Selected icon: Lightbulb");
			await search.press("Escape");
			await expect(panel).toBeHidden();
			await expect(trigger).toBeFocused();
			await trigger.click();
			await icon("Rocket").click();
			await expect(status).toHaveText("Selected icon: Rocket");
			await expect(trigger).toBeFocused();
			await trigger.click();
			await expect(search).toHaveValue("");
			await search.fill("favorite");
			await search.press("Enter");
			await expect(status).toHaveText("Selected icon: Star");
			await expect(trigger).toBeFocused();
			await trigger.click();
			await page.getByRole("heading", { name: "Project settings" }).click();
			await expect(panel).toBeHidden();
			expect(errors).toEqual([]);
		});
	}
}
