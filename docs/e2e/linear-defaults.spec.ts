import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test.describe(colorScheme, () => {
		test("the six basic component demos use the Linear defaults", async ({ page }) => {
			test.setTimeout(60_000);
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			const slot = (name: string) => page.locator(`[data-slot="${name}"]`).first();
			const visit = async (name: string) => {
				await page.goto(`/zh/docs/components/${name}`);
				await expect(page.locator("html")).toHaveCSS("color-scheme", colorScheme);
				await expect(page.getByRole("button", { name: "样式调节器", exact: true })).toBeEnabled();
			};
			const focusColor =
				colorScheme === "light" ? "lch(53 52.26 286.91)" : "lch(47.918 59.303 288.421)";
			const radius = (name: string, value: string) =>
				expect(slot(name)).toHaveCSS("border-top-left-radius", value);
			const surface = async (name: string, value: string) => {
				await radius(name, value);
				await expect(slot(name)).toHaveCSS(
					"background-color",
					colorScheme === "light" ? "rgb(255, 255, 255)" : "lch(12.72 0.85 272)"
				);
				await expect(slot(name)).toHaveCSS("animation-name", "none");
			};

			await visit("card");
			await radius("card", "10px");
			await expect(slot("card")).toHaveCSS("row-gap", "16px");

			await visit("select");
			const select = slot("select-trigger");
			await expect(select).toHaveCSS("height", "30px");
			await radius("select-trigger", "8px");
			await select.press("ArrowDown");
			await surface("select-content", "12px");
			await expect(slot("select-item")).toHaveCSS("min-height", "32px");
			await page.keyboard.press("Enter");
			await expect(select).toHaveText("Apple");
			await expect(select).toBeFocused();
			await expect(select).toHaveCSS("outline-color", focusColor);

			await visit("switch");
			const control = slot("switch");
			await expect(control).toHaveCSS("width", "30px");
			const off = await control.evaluate((el) => getComputedStyle(el).backgroundColor);
			await control.press("Space");
			await expect(control).toBeChecked();
			await expect(control).not.toHaveCSS("background-color", off);
			await expect(control).toHaveCSS("outline-width", "1px");
			await expect(control).toHaveCSS("outline-color", "rgb(255, 255, 255)");
			await expect(slot("switch-thumb")).toHaveCSS(
				"background-color",
				colorScheme === "light" ? "lch(100 5 286.91)" : "lch(100 5 288.421)"
			);
			await expect(slot("switch-thumb")).toHaveCSS("transition-property", "none");

			await visit("dropdown-menu");
			const menuTrigger = slot("dropdown-menu-trigger");
			await menuTrigger.press("Enter");
			await surface("dropdown-menu-content", "12px");
			await expect(slot("dropdown-menu-item")).toHaveCSS("min-height", "32px");
			await slot("dropdown-menu-sub-trigger").press("ArrowRight");
			await surface("dropdown-menu-sub-content", "12px");
			await page.keyboard.press("ArrowLeft");
			await page.keyboard.press("Escape");
			await expect(menuTrigger).toBeFocused();

			await visit("popover");
			const popoverTrigger = page.getByRole("button", { name: "Open popover", exact: true });
			await popoverTrigger.click();
			await surface("popover-content", "12px");
			await slot("popover-content").locator("input").first().fill("80%");
			await page.keyboard.press("Escape");
			await expect(popoverTrigger).toBeFocused();

			await visit("tooltip");
			await slot("tooltip-trigger").hover();
			await surface("tooltip-content", "8px");
			await expect(slot("tooltip-content")).toHaveCSS("padding-top", "5px");
			await expect(slot("tooltip-content").locator(".cn-tooltip-arrow")).toHaveCount(0);
			await page.mouse.move(0, 0);
			await expect(slot("tooltip-content")).toBeHidden();
		});

		test("Kbd covers keycaps, menu shortcuts and tooltip shortcuts", async ({ page }) => {
			await page.setViewportSize({ width: colorScheme === "light" ? 1200 : 390, height: 900 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/zh/docs/components/kbd");
			const regular = page.locator('kbd[data-appearance="default"]').first();
			await expect(regular).toHaveCSS("min-width", "20px");
			await expect(regular).toHaveCSS("border-radius", "3px");
			await expect(regular).toHaveCSS("font-weight", "450");

			const help = page.getByRole("button", { name: "Help", exact: true });
			await help.press("Shift+s");
			await expect(page.getByText("Shortcuts are shown", { exact: true })).toBeVisible();
			await help.press("ArrowDown");
			const item = page.getByRole("menuitem", { name: /Hide shortcuts/ });
			const hint = item.locator('kbd[data-appearance="inline"]').first();
			await expect(hint).toHaveCSS("border-top-width", "0px");
			await expect(hint).toHaveCSS("font-weight", "500");
			await expect(hint).toHaveCSS(
				"color",
				colorScheme === "light" ? "lch(40 1 282)" : "lch(64.714 1.425 272)"
			);
			await item.press("Enter");
			await expect(page.getByText("Shortcuts are hidden", { exact: true })).toBeVisible();

			const trigger = page.getByRole("button", { name: "Display options", exact: true });
			await trigger.scrollIntoViewIfNeeded();
			await trigger.hover();
			const tooltip = page.locator('[data-slot="tooltip-content"]');
			const keys = tooltip.locator('kbd[data-appearance="compact"]');
			await expect(keys).toHaveCount(2);
			await expect(keys.first()).toHaveCSS("min-width", "18px");
			await expect(keys.first()).toHaveCSS("border-radius", "4px");
			await expect(keys.first()).toHaveCSS("font-weight", "400");
			await trigger.press("Shift+v");
			await expect(trigger).toHaveAttribute("aria-pressed", "true");
			await trigger.press("Escape");
			await expect(tooltip).toBeHidden();

			await page.getByRole("button", { name: "Accept", exact: true }).press("Enter");
			await expect(page.getByText("Accepted", { exact: true })).toBeVisible();
			const input = page.getByRole("textbox", { name: "Search", exact: true });
			await input.fill("Design");
			await input.press("Escape");
			await expect(input).toHaveValue("");
		});

		test("Separator renders both axes and keeps decorative lines out of the accessibility tree", async ({ page }) => {
			await page.setViewportSize({ width: colorScheme === "light" ? 1200 : 390, height: 900 });
			await page.emulateMedia({ colorScheme });
			await page.goto("/zh/docs/components/separator");
			const lines = page.locator('main section [data-slot="separator"]');
			const horizontal = lines.and(page.locator('[data-orientation="horizontal"]')).first();
			const vertical = lines.and(page.locator('[data-orientation="vertical"]')).first();
			const decorative = lines.and(page.locator('[role="none"],[role="presentation"]')).first();
			const color = colorScheme === "light" ? "lch(0 0 0 / 0.088)" : "lch(100 0 0 / 0.083)";
			await expect(horizontal).toHaveCSS("height", "0.5px");
			await expect(vertical).toHaveCSS("width", "0.5px");
			await expect(horizontal).toHaveCSS("background-color", color);
			await expect(vertical).toHaveCSS("background-color", color);
			await expect(decorative).toBeVisible();
			await expect(decorative).not.toHaveRole("separator");
		});

		test("Tooltip keeps delayed hover, keyboard focus and long text within the viewport", async ({ page }) => {
			const width = colorScheme === "light" ? 1200 : 390;
			await page.setViewportSize({ width, height: 900 });
			await page.emulateMedia({ colorScheme });
			await page.goto("/zh/docs/components/tooltip");
			const content = page.locator('[data-slot="tooltip-content"]');
			const hover = page.getByRole("button", { name: "Hover", exact: true });
			await hover.scrollIntoViewIfNeeded();
			await expect(hover).toHaveAttribute("data-delay-duration", "500");
			await hover.hover();
			await expect(content).toHaveCount(0);
			await expect(content).toBeVisible();
			await expect(content).toHaveCSS("animation-duration", "0s");
			await page.mouse.move(0, 0);
			await expect(content).toBeHidden();

			for (const side of ["top", "right", "bottom", "left"]) {
				const trigger = page.getByRole("button", { name: side, exact: true });
				await trigger.scrollIntoViewIfNeeded();
				await trigger.focus();
				await expect(content).toBeVisible();
				const direction = side === "left" || side === "right" ? /^(left|right)$/ : /^(top|bottom)$/;
				await expect(content).toHaveAttribute("data-side", colorScheme === "light" ? side : direction);
				await trigger.press("Escape");
				await expect(content).toBeHidden();
				await expect(trigger).toBeFocused();
			}
			const save = page.getByRole("button", { name: "Save changes", exact: true });
			await save.scrollIntoViewIfNeeded();
			await save.hover();
			await expect(content.locator('kbd[data-appearance="compact"]')).toHaveCount(2);
			await save.press("Shift+s");
			await expect(page.getByText("Saved 1", { exact: true })).toBeVisible();
			await save.press("Escape");
			await expect(content).toBeHidden();
			const disabled = page.getByRole("button", { name: "Disabled", exact: true });
			await expect(disabled).toBeDisabled();
			const wrapper = page.locator('[data-slot="tooltip-trigger"]').filter({ has: disabled });
			await wrapper.scrollIntoViewIfNeeded();
			await wrapper.hover();
			await expect(content).toBeVisible();
			await expect(content).toContainText("Check your workspace settings");
			const bounds = await content.boundingBox();
			expect(bounds).not.toBeNull();
			expect(bounds!.x).toBeGreaterThanOrEqual(0);
			expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
		});
	});
}
