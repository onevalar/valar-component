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

		test(`${framework} ${theme}: upgraded board, hue, alpha, format switcher and recent swatches work without overflow`, async ({
			page,
		}) => {
			await page.setViewportSize({ width, height: 600 });
			const preview = new URL(url);
			preview.searchParams.set("theme", theme);
			await page.goto(preview.href);
			await page.evaluate(() => localStorage.removeItem("valar-color-picker-recent"));
			await page.reload();
			const form = page.getByRole("form", { name: "Appearance settings" });
			const trigger = form.getByRole("button", { name: /^工作区强调色 #/ });
			const panel = page.locator('[data-slot="color-picker-content"]');
			const formValues = () =>
				form.evaluate((element) => new FormData(element as HTMLFormElement).getAll("accent"));

			await trigger.click();
			await expect(panel).toBeVisible();

			// Zero vertical/horizontal overflow in popover panel.
			const overflow = await panel.evaluate((el) => ({
				scrollH: el.scrollHeight,
				clientH: el.clientHeight,
				scrollW: el.scrollWidth,
				clientW: el.clientWidth,
			}));
			expect(overflow.scrollH).toBeLessThanOrEqual(overflow.clientH + 1);
			expect(overflow.scrollW).toBeLessThanOrEqual(overflow.clientW + 1);

			// 1. 2D Saturation/Value board keyboard interaction.
			const area = panel.locator('[data-slot="color-picker-area"]');
			await area.focus();
			await area.press("Shift+ArrowLeft");
			const afterArea = (await formValues())[0];
			expect(afterArea).not.toBe("#2563eb");

			// 2. Hue slider keyboard interaction.
			const hueSlider = panel.locator('[data-slot="color-picker-hue"]');
			await hueSlider.focus();
			await hueSlider.press("Shift+ArrowRight");
			const afterHue = (await formValues())[0];
			expect(afterHue).not.toBe(afterArea);

			// 3. Alpha slider keyboard interaction -> #rrggbbaa in form & % badge on trigger.
			const alphaSlider = panel.locator('[data-slot="color-picker-alpha"]');
			await alphaSlider.focus();
			await alphaSlider.press("Shift+ArrowLeft");
			await alphaSlider.press("Shift+ArrowLeft");
			const translucent = String((await formValues())[0] ?? "");
			expect(translucent).toMatch(/^#[\da-f]{8}$/);
			await expect(trigger).toContainText("%");

			// 4. Format switcher (RGB / HSL / OKLCH / HEX) & channel editing.
			const formats = panel.getByRole("group", { name: "工作区强调色：色值格式" });
			await formats.getByRole("button", { name: "RGB", exact: true }).click();
			const redInput = panel.getByRole("spinbutton", { name: "工作区强调色：R" });
			await expect(redInput).toBeVisible();
			await redInput.fill("255");
			await redInput.press("Tab");
			await expect.poll(async () => String((await formValues())[0] ?? "")).toMatch(/^#ff/);

			await formats.getByRole("button", { name: "HSL", exact: true }).click();
			await expect(panel.getByRole("spinbutton", { name: "工作区强调色：H" })).toBeVisible();

			await formats.getByRole("button", { name: "OKLCH", exact: true }).click();
			await expect(panel.getByRole("spinbutton", { name: "工作区强调色：OKLCH L" })).toBeVisible();

			await formats.getByRole("button", { name: "HEX", exact: true }).click();
			const hex = panel.getByRole("textbox", { name: "工作区强调色：十六进制" });
			await hex.fill("oklch(0.6 0.2 260 / 50%)");
			await hex.press("Enter");
			await expect.poll(async () => String((await formValues())[0] ?? "")).toMatch(/^#[\da-f]{8}$/);

			// 5. Recent swatches tab appears and switches cleanly without height jump.
			const recentTab = panel.getByRole("button", { name: /最近使用/ });
			await expect(recentTab).toBeVisible();
			await recentTab.click();
			await expect(panel.getByRole("group", { name: "工作区强调色：最近使用" })).toBeVisible();
			const boundsAfter = await panel.boundingBox();
			expect(boundsAfter?.x).toBeGreaterThanOrEqual(0);
			expect(boundsAfter && boundsAfter.x + boundsAfter.width).toBeLessThanOrEqual(width);
		});
	}
}
