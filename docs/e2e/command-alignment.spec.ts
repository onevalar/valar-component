import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Command dialog keeps the search visible when navigating long results in ${colorScheme}`, async ({
		page,
	}) => {
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.setViewportSize({ width: 320, height: 420 });
		await page.goto("/zh/docs/components/command");

		const opener = page.getByRole("button", { name: "Open Menu", exact: true }).last();
		await opener.click();
		const dialog = page.getByRole("dialog", { name: "命令面板", exact: true });
		const search = dialog.getByRole("combobox");
		await expect(search).toBeFocused();
		await expect(dialog).toHaveCSS("border-radius", "12px");
		await expect(dialog).toHaveCSS(
			"background-color",
			colorScheme === "light" ? "lch(100 0 282)" : "lch(12.72 0.85 272)"
		);
		await search.press("End");
		const active = dialog.getByRole("option", { selected: true });
		await expect(active).toHaveText("Code Editor");
		await expect(active).toBeInViewport({ ratio: 1 });
		await expect(search).toBeInViewport({ ratio: 1 });
		await expect(search).toBeFocused();
		await expect
			.poll(() => dialog.locator('[data-slot="command-list"]').evaluate((el) => el.scrollTop))
			.toBeGreaterThan(0);
		await search.press("Home");
		await expect(active).toContainText("Home");
		await expect(search).toBeInViewport({ ratio: 1 });
		await search.press("Escape");
		await expect(dialog).toHaveCount(0);
		await expect(opener).toBeFocused();
	});

	test(`Compact Command filters load, skip disabled items, and restore focus in ${colorScheme}`, async ({
		page,
	}) => {
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.setViewportSize({ width: 320, height: 640 });
		await page.clock.install();
		await page.goto("/zh/docs/components/command");

		const opener = page.getByRole("button", { name: "Filter work", exact: true });
		await opener.press("Enter");
		const panel = page.getByRole("dialog", { name: "Work filters", exact: true });
		const search = panel.getByRole("combobox", { name: "Work filters" });
		const loading = panel.getByRole("progressbar", { name: "Loading..." });
		await expect(search).toBeFocused();
		await expect(loading).toHaveText("Loading more filters…");
		await expect(panel.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
		await page.clock.fastForward(700);
		await expect(panel.getByRole("option", { name: "Labels" })).toBeVisible();
		await expect(loading).toBeHidden();

		await search.press("End");
		const active = panel.getByRole("option", { selected: true });
		await expect(active).toHaveText("Labels");
		await expect(panel.getByRole("option", { name: "Team" })).toHaveAttribute(
			"aria-disabled",
			"true"
		);
		await expect(search).toHaveCSS("height", "36px");
		await expect(active).toHaveCSS("min-height", "32px");
		await expect(active).toHaveCSS(
			"background-color",
			colorScheme === "light" ? "lch(95 0 282)" : "lch(20.82 1.3 272)"
		);
		await expect(active).toHaveCSS("border-radius", "8px");
		await expect(search).toBeFocused();
		await search.fill("does not exist");
		await expect(panel.getByText("No matching filters.")).toBeVisible();
		await search.press("Enter");
		await expect(panel).toBeVisible();
		await search.fill("label");
		await search.press("Enter");
		await expect(panel).toBeHidden();
		await expect(opener).toBeFocused();
		await expect(page.getByText("Selected Labels")).toBeVisible();
	});
}
