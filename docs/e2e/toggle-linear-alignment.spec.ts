import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Linear formatting and Inbox toggles at 390 px in ${colorScheme}`, async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.emulateMedia({ colorScheme, reducedMotion: "no-preference" });
		await page.goto("/docs/components/toggle");
		const bold = page.getByRole("button", { name: "Bold", exact: true });
		const unread = page.getByRole("button", { name: "Show unreads only", exact: true });
		await expect(bold).toHaveCSS("width", "26px");
		await expect(bold).toHaveCSS("height", "26px");
		await expect(bold).toHaveCSS("border-radius", "4px");
		await expect(bold.locator("svg")).toHaveCSS("width", "16px");
		await expect(bold).toHaveCSS("transition-property", "opacity");
		await expect(bold).toHaveCSS("transition-duration", "0.1s");
		await expect(bold).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await expect(bold).toHaveCSS(
			"color",
			colorScheme === "dark" ? "lch(66.215 1.65 272)" : "lch(40 1 282)"
		);

		await page.keyboard.press("Tab");
		await bold.focus();
		await expect(bold).toHaveCSS("outline-offset", "-1px");
		await page.keyboard.press("Space");
		await expect(bold).toHaveAttribute("aria-pressed", "true");
		await expect(page.getByText("Example comment text", { exact: true })).toHaveCSS(
			"font-weight",
			"600"
		);
		await bold.hover();
		await expect(bold).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(19.133 2.2 272)" : "lch(93 0 282)"
		);
		await page.keyboard.press("Enter");
		await expect(bold).toHaveAttribute("aria-pressed", "false");
		await expect(bold).toHaveCSS("width", "26px");

		await page.keyboard.press("Tab");
		await expect(unread).toBeFocused();
		await expect(unread).toHaveCSS("outline-offset", "-1px");
		await expect(unread).toHaveCSS("width", "28px");
		await expect(unread).toHaveCSS("height", "28px");
		expect(
			await unread.evaluate((element) => Number.parseFloat(getComputedStyle(element).borderRadius))
		).toBeGreaterThanOrEqual(14);
		await expect(unread.locator("svg")).toHaveCSS("width", "14px");
		await expect(unread).toHaveCSS(
			"color",
			colorScheme === "dark" ? "lch(90.451 1.2 272)" : "lch(19.588 1.25 282)"
		);
		await page.keyboard.press("Enter");
		await expect(unread).toHaveAttribute("aria-pressed", "true");
		await expect(unread).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(18.634 1.075 272)" : "lch(94.854 0.157 282)"
		);
		await expect(unread).toHaveCSS(
			"color",
			colorScheme === "dark" ? "lch(100 0 272)" : "lch(9.794 0 282)"
		);
		await expect(page.getByText("Read · Project update", { exact: true })).toHaveCount(0);
		await page.keyboard.press("Space");
		await expect(page.getByText("Read · Project update", { exact: true })).toBeVisible();
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await expect(bold).toHaveCSS("transition-property", "none");

		for (const [name, height] of [
			["Toggle small", "28px"],
			["Toggle default", "32px"],
			["Toggle large", "36px"],
		]) {
			const textToggle = page.getByRole("button", { name, exact: true });
			await textToggle.focus();
			await expect(textToggle).toHaveCSS("height", height);
			await textToggle.press("Space");
			await expect(textToggle).toHaveAttribute("aria-pressed", "true");
			await expect(textToggle).toHaveCSS("height", height);
			await textToggle.press("Enter");
			await expect(textToggle).toHaveAttribute("aria-pressed", "false");
		}
		await expect(
			page.getByRole("button", { name: "Toggle disabled outline", exact: true })
		).toBeDisabled();
	});
}

test("Inbox uses the reviewed Toggle and restores the unfiltered list", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/zh/themes/inbox", { waitUntil: "networkidle" });
	const inbox = page.getByRole("region", { name: "通知中心", exact: true });
	const unread = inbox.getByRole("button", { name: "仅显示未读", exact: true });
	await expect(unread).toHaveAttribute("data-appearance", "toolbar");
	await expect(unread).toHaveAttribute("data-toggle-root", "");
	await expect(unread).toHaveAttribute("aria-pressed", "false");
	await unread.press("Space");
	const showRead = inbox.getByRole("button", { name: "显示已读", exact: true });
	await expect(showRead).toBeFocused();
	await expect(showRead).toHaveAttribute("aria-pressed", "true");
	await showRead.press("Enter");
	await expect(unread).toBeFocused();
	await expect(unread).toHaveAttribute("aria-pressed", "false");
});
