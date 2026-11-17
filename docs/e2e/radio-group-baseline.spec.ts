import { expect, test } from "@playwright/test";
import { tunerButton } from "./tuner.js";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Radio Group has labeled options and an overlay scrollbar at 320px in ${colorScheme}`, async ({
		page
	}) => {
		await page.setViewportSize({ width: 320, height: 820 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/radio-group", { waitUntil: "networkidle" });
		const density = page.getByRole("radiogroup", { name: "Display density", exact: true });
		const compact = density.getByRole("radio", { name: "Compact", exact: true });
		await density.getByText("Compact", { exact: true }).click();
		await expect(compact).toBeChecked();
		await compact.press("ArrowUp");
		const comfortable = density.getByRole("radio", { name: "Comfortable", exact: true });
		await expect(comfortable).toBeFocused();
		await expect(comfortable).toBeChecked();
		await expect(comfortable).toHaveCSS("width", "16px");
		await expect(comfortable).toHaveCSS("outline-style", "solid");
		await expect(comfortable).toHaveCSS("outline-offset", "-1px");

		const spacing = page.getByRole("radiogroup", { name: "Spacing presets", exact: true });
		await expect(
			spacing.getByRole("radio", { name: "Default", exact: true })
		).toHaveAccessibleDescription("Standard spacing for most use cases.");
		const plans = page.getByRole("radiogroup", { name: "Workspace plan", exact: true });
		const pro = plans.getByRole("radio", { name: "Pro", exact: true });
		await expect(pro).toHaveAccessibleDescription("For growing businesses.");
		await plans.getByText("For growing businesses.", { exact: true }).click();
		await expect(pro).toBeChecked();
		const subscription = page.getByRole("radiogroup", { name: "Subscription Plan", exact: true });
		await expect(subscription).toHaveAccessibleDescription(
			"Yearly and lifetime plans offer significant savings."
		);
		const disabled = page.getByRole("radiogroup", { name: "Available options", exact: true });
		await disabled.getByRole("radio", { name: "Option 3", exact: true }).press("ArrowDown");
		await expect(disabled.getByRole("radio", { name: "Option 2", exact: true })).toBeFocused();
		await expect(disabled.getByRole("radio", { name: "Disabled", exact: true })).toBeDisabled();
		const invalid = page.getByRole("radiogroup", { name: "Notification Preferences", exact: true });
		await expect(invalid).toHaveAttribute("aria-invalid", "true");
		await expect(
			invalid.getByRole("radio", { name: "Email only", exact: true })
		).toHaveAccessibleDescription("The selected notification method is unavailable.");
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);

		const opener = tunerButton(page, "Radio Group");
		await opener.click();
		const editor = page.getByRole("dialog", { name: "Radio Group · 组件参数" });
		const viewport = editor.getByRole("region", { name: "横向通知频率选项", exact: true });
		await expect(viewport).toHaveCSS("scrollbar-width", "none");
		await expect
			.poll(() => viewport.evaluate((node) => node.scrollWidth - node.clientWidth))
			.toBeGreaterThan(0);
		const track = viewport
			.locator("..")
			.locator('[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]');
		const height = await viewport.evaluate((node) => node.clientHeight);
		await viewport.hover();
		await expect(track).toHaveCSS("position", "absolute");
		await expect(viewport).toHaveJSProperty("clientHeight", height);
		await viewport.press("ArrowRight");
		await expect.poll(() => viewport.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
		const horizontal = viewport.getByRole("radiogroup", { name: "通知频率 · 横向", exact: true });
		await horizontal.getByRole("radio", { name: "每天汇总", exact: true }).press("ArrowRight");
		await expect(horizontal.getByRole("radio", { name: "每周汇总", exact: true })).toBeFocused();
		await expect(horizontal.getByRole("radio", { name: "每周汇总", exact: true })).toBeChecked();
		await page.keyboard.press("Escape");
		await expect(editor).toHaveCount(0);
		await expect(opener).toBeFocused();
	});
}
