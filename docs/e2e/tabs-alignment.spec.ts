import { expect, test, type Locator } from "@playwright/test";

const scrollLeft = (list: Locator) => list.evaluate((element) => element.scrollLeft);

for (const colorScheme of ["light", "dark"] as const) {
	test(`Tabs keeps keyboard focus visible across variants in ${colorScheme}`, async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 850 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/tabs");

		const capsule = page.getByRole("tablist", { name: "Project breakdown" });
		const health = capsule.getByRole("tab", { name: "Health" });
		const leads = capsule.getByRole("tab", { name: "Leads" });
		await expect(capsule).toHaveCSS("height", "32px");
		await expect(capsule).toHaveCSS("border-radius", "5px");
		await expect(health).toHaveCSS("height", "28px");
		await expect(health).toHaveCSS("font-size", "12px");
		await expect(health).toHaveCSS("gap", "6px");
		await expect(health).toHaveCSS(
			"background-color",
			colorScheme === "light" ? "lch(95.543 0 282)" : "lch(20.418 1.429 272)"
		);
		await expect(leads).toHaveCSS(
			"background-color",
			colorScheme === "light" ? "rgb(255, 255, 255)" : "lch(13.861 1.043 272)"
		);
		await leads.hover();
		await expect(leads).toHaveCSS(
			"background-color",
			colorScheme === "light" ? "lch(96.914 0 282)" : "lch(17.718 1.043 272)"
		);
		await page.mouse.move(0, 0);
		await health.focus();
		await page.keyboard.press("ArrowRight");
		await expect(leads).toBeFocused();
		await expect(leads).toHaveAttribute("aria-selected", "false");
		await expect(health).toHaveAttribute("aria-selected", "true");
		await expect(leads).toHaveCSS("outline-width", "1px");
		await expect(leads).toHaveCSS("outline-offset", "-1px");
		await expect(leads).toHaveCSS(
			"outline-color",
			colorScheme === "light" ? "lch(53 52.26 286.91)" : "lch(47.918 59.303 288.421)"
		);
		await expect(leads).toHaveCSS("transition-property", "none");
		await page.keyboard.press("Space");
		await expect(leads).toHaveAttribute("aria-selected", "true");
		await expect(page.getByRole("tabpanel", { name: "Leads" })).toContainText(
			"Project lead assigned"
		);
		await leads.press("Home");
		await expect(health).toBeFocused();
		await expect(leads).toHaveAttribute("aria-selected", "true");
		await page.keyboard.press("Enter");
		await expect(health).toHaveAttribute("aria-selected", "true");

		const line = page.getByRole("tablist", { name: "Project information" });
		const first = line.getByRole("tab", { name: "Project overview" });
		const last = line.getByRole("tab", { name: "Upcoming milestones" });
		await expect(first).toHaveCSS("height", "28px");
		await first.focus();
		expect(await scrollLeft(line)).toBe(0);
		await expect
			.poll(() => line.evaluate((element) => element.scrollWidth > element.clientWidth))
			.toBe(true);
		await page.keyboard.press("End");
		await expect(last).toBeFocused();
		await expect(last).toHaveAttribute("aria-selected", "true");
		await expect.poll(() => scrollLeft(line)).toBeGreaterThan(0);
		await expect(page.getByRole("tabpanel", { name: "Upcoming milestones" })).toContainText(
			"Check deadlines"
		);
		await expect
			.poll(() =>
				last.evaluate((element) => {
					const marker = getComputedStyle(element, "::after");
					return [marker.opacity, marker.bottom, marker.transitionProperty];
				})
			)
			.toEqual(["1", "0px", "none"]);
		await page.keyboard.press("Home");
		await expect(first).toBeFocused();
		await expect.poll(() => scrollLeft(line)).toBe(0);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

		const vertical = page.getByRole("tablist", { name: "Preferences" });
		await expect(vertical).toHaveAttribute("aria-orientation", "vertical");
		await vertical.getByRole("tab", { name: "Account" }).focus();
		await page.keyboard.press("ArrowDown");
		await expect(vertical.getByRole("tab", { name: "Password" })).toBeFocused();
		await expect(page.getByRole("tabpanel", { name: "Password" })).toContainText(
			"Update your password"
		);

		const disabled = page.getByRole("tablist", { name: "Workspace access" });
		await expect(disabled.getByRole("tab", { name: "Billing" })).toBeDisabled();
		await disabled.getByRole("tab", { name: "Home" }).focus();
		await page.keyboard.press("ArrowRight");
		await expect(disabled.getByRole("tab", { name: "Members" })).toBeFocused();
		await expect(page.getByRole("tabpanel", { name: "Members" })).toContainText(
			"See who has access"
		);

		await page.setViewportSize({ width: 1200, height: 900 });
		const normal = page.getByRole("tablist", { name: "Project dashboard" });
		const reports = normal.getByRole("tab", { name: "Reports" });
		await expect(reports).toHaveCSS("height", "28px");
		await reports.click();
		await expect(page.getByRole("tabpanel", { name: "Reports", exact: true })).toContainText(
			"5 reports"
		);
	});
}
