import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Button matches workspace actions and keeps keyboard focus inside in ${colorScheme}`, async ({
		page,
	}) => {
		await page.emulateMedia({ colorScheme });
		await page.setViewportSize({ width: 1200, height: 900 });
		await page.goto("/docs/components/button");

		const dark = colorScheme === "dark";
		const primary = page.getByRole("button", { name: "Create team", exact: true });
		const outline = page.getByRole("button", { name: "Export CSV", exact: true });
		const ghost = page.getByRole("button", { name: "Customize sidebar", exact: true });
		const icon = page.getByRole("button", { name: "Show unread only", exact: true });
		const destructive = page.getByRole("button", { name: "Destructive", exact: true });
		await expect(primary).toHaveCSS("height", "32px");
		const radius = (el: Element) => getComputedStyle(el).borderTopLeftRadius;
		const pillRadius = await primary.evaluate(radius);
		expect(parseFloat(pillRadius)).toBeGreaterThanOrEqual(16);
		for (const label of ["Button", "Outline", "Secondary", "Ghost", "Destructive", "Link"]) {
			const example = page.getByRole("main").getByRole("button", { name: label, exact: true });
			await expect(example).toHaveCSS("border-top-left-radius", pillRadius);
		}
		await expect(outline).toHaveCSS("border-top-left-radius", pillRadius);
		await expect(ghost).toHaveCSS("border-top-left-radius", pillRadius);
		expect(
			await icon.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))
		).toBeLessThan(14);
		const grouped = page.getByRole("button", { name: "Archive", exact: true });
		await expect(grouped).toHaveCSS("border-top-right-radius", "0px");
		await expect(primary).toHaveCSS("font-size", "13px");
		await expect(primary).toHaveCSS("font-weight", "500");
		await expect(primary).toHaveCSS("padding-inline-start", "12px");
		await expect(primary).toHaveCSS(
			"background-color",
			dark ? "lch(47.918 59.303 288.421)" : "lch(53 52.26 286.91)"
		);
		await expect(outline).toHaveCSS(
			"background-color",
			dark ? "lch(10.149 0.689 272)" : "lch(99.997 0.5 282)"
		);
		await expect(ghost).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await expect(icon).toHaveCSS("width", "28px");
		await expect(icon.locator("svg")).toHaveCSS("width", "14px");
		await expect(destructive).toHaveCSS("background-color", "lch(58 73 29)");

		await primary.hover();
		await expect(primary).toHaveCSS(
			"background-color",
			dark ? "lch(52.418 61.103 288.421)" : "lch(47 50.26 286.91)"
		);
		await outline.hover();
		await expect(outline).toHaveCSS(
			"background-color",
			dark ? "lch(14.777 1.075 272)" : "lch(95.883 0.157 282)"
		);
		await page.keyboard.press("Tab");
		await primary.focus();
		await primary.press("Tab");
		await expect(outline).toBeFocused();
		await expect(outline).toHaveCSS("box-shadow", /inset/);
		const focus = await outline.evaluate((el) => {
			const style = getComputedStyle(el);
			return (
				style.outlineStyle === "none" ||
				parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset) <= 0
			);
		});
		expect(focus).toBe(true);
		await ghost.hover();
		await expect(ghost).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await icon.press("Space");
		await expect(icon).toBeFocused();
		await expect(icon).toHaveAttribute("aria-pressed", "true");
		await expect(icon).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await icon.press("Enter");
		await expect(icon).toHaveAttribute("aria-pressed", "false");

		await page.setViewportSize({ width: 390, height: 900 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await expect(primary).toHaveCSS("transition-property", "none");
		await expect
			.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
			.toBeLessThanOrEqual(390);
	});
}

test("Button loading guards native form submit and unavailable links never activate", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/docs/components/button");
	const save = page.getByRole("button", { name: "Save changes", exact: true });
	await save.focus();
	await save.press("Enter");
	const busy = page.getByRole("button", { name: "Saving", exact: true });
	await expect(busy).toBeFocused();
	await expect(busy).toHaveAttribute("aria-busy", "true");
	await expect(busy).toHaveAttribute("aria-disabled", "true");
	await expect(busy.locator('[data-slot="spinner"]')).toHaveCSS("animation-name", "none");
	await busy.press("Space");
	await expect(page.getByRole("status").filter({ hasText: "Changes saved" })).toHaveText(
		"Changes saved (1)"
	);
	await expect(save).toBeFocused();
	await expect(page.getByRole("button", { name: "Set team", exact: true })).toBeDisabled();

	const link = page.getByRole("link", { name: "Open example", exact: true });
	const unavailable = page.getByRole("link", { name: "Unavailable link", exact: true });
	await expect(unavailable).toHaveAttribute("tabindex", "-1");
	expect(await unavailable.getAttribute("href")).toBeNull();
	await expect(unavailable).toHaveCSS("opacity", "0.6");
	await unavailable.press("Enter");
	await expect(page).not.toHaveURL(/#button-link-example$/);
	await link.press("Enter");
	await expect(page).toHaveURL(/#button-link-example$/);
});
