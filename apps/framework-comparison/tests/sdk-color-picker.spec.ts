import { expect, test } from "@playwright/test";

// This standalone Svelte fixture is served by Vite dev, not the comparison site's
// production entry points. Docs also exercise the Svelte source in the workbench.
const svelteDev = process.env.VALAR_SVELTE_COLOR_URL;
const previews = {
	react: `${process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/"}?example=color-picker`,
	vue: `${process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/"}?example=color-picker`,
	...(svelteDev ? { svelte: new URL("color-picker.html", svelteDev).href } : {}),
};

for (const [framework, url] of Object.entries(previews)) {
	for (const [theme, width] of [["light", 900], ["dark", 320]] as const) {
		test(`${framework} ${theme}: Color Picker commits the same HEX to trigger, preview and form`, async ({ page }) => {
			await page.setViewportSize({ width, height: 550 });
			const preview = new URL(url);
			preview.searchParams.set("theme", theme);
			await page.goto(preview.href);
			const form = page.getByRole("form", { name: "Appearance settings" });
			const trigger = form.getByRole("button", { name: /^工作区强调色 #/ });
			const panel = page.locator('[data-slot="color-picker-content"]');
			const formValues = () => form.evaluate((element) => new FormData(element as HTMLFormElement).getAll("accent"));
			await expect.poll(formValues).toEqual(["#2563eb"]);
			await expect(trigger).toHaveCSS("height", "32px");
			await trigger.press("Enter");
			const preset = panel.getByRole("button", { name: "#0f766e" });
			await preset.click();
			await expect(preset).toHaveAttribute("aria-pressed", "true");
			await expect.poll(formValues).toEqual(["#0f766e"]);
			const hex = panel.getByRole("textbox", { name: "工作区强调色：十六进制" });
			await hex.fill("#1EF2A3");
			await expect.poll(formValues).toEqual(["#1ef2a3"]);
			await hex.fill("#n95");
			await expect(hex).toHaveAttribute("aria-invalid", "true");
			await expect(hex).toHaveAccessibleDescription(/只能输入十六进制字符/);
			await expect.poll(formValues).toEqual(["#1ef2a3"]);
			await hex.fill("#a3f");
			await hex.press("Enter");
			await expect(hex).toHaveValue("#aa33ff");
			await expect(preset).toHaveAttribute("aria-pressed", "false");
			await expect(form.getByRole("status")).toHaveText("#aa33ff");
			await expect.poll(formValues).toEqual(["#aa33ff"]);
			const bounds = await panel.boundingBox();
			expect(bounds?.x).toBeGreaterThanOrEqual(0);
			expect(bounds && bounds.x + bounds.width).toBeLessThanOrEqual(width);
			await hex.press("Escape");
			await expect(panel).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect(trigger).toHaveAccessibleName("工作区强调色 #aa33ff");
		});
	}
}
