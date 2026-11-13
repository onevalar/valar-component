import { expect, test } from "@playwright/test";

for (const { theme, width } of [
	{ theme: "light", width: 1200 },
	{ theme: "dark", width: 320 },
] as const) {
	test(`Combobox keeps the selected assignee distinct from the active option in ${theme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 640 });
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		await page.goto("/docs/components/combobox");
		await page.getByRole("button", { name: "Assignee: Unassigned" }).press("Enter");
		const dialog = page.getByRole("dialog", { name: "Choose an assignee" });
		const input = dialog.getByRole("combobox", { name: "Choose an assignee" });
		const unassigned = dialog.getByRole("option", { name: "Unassigned" });
		const ada = dialog.getByRole("option", { name: /Ada Chen/ });

		await expect(input).toBeFocused();
		await expect(input).toHaveCSS("height", "36px");
		await expect(input).toHaveCSS("padding-inline-start", "14px");
		await expect(dialog).toHaveCSS("width", "207px");
		await expect(dialog).toHaveCSS("border-radius", "12px");
		await expect(dialog).toHaveCSS(
			"background-color",
			theme === "dark" ? "lch(12.72 0.85 272)" : "rgb(255, 255, 255)"
		);
		await expect(unassigned).toHaveCSS("min-height", "32px");
		await expect(unassigned).toHaveAttribute("aria-selected", "true");

		await input.press("ArrowDown");
		await expect(input).toHaveAttribute("aria-activedescendant", (await ada.getAttribute("id"))!);
		await expect(ada).toHaveAttribute("aria-selected", "false");
		await expect(unassigned).toHaveAttribute("aria-selected", "true");
		await expect
			.poll(() => ada.evaluate((element) => getComputedStyle(element, "::before").backgroundColor))
			.toBe(theme === "dark" ? "lch(20.82 1.3 272)" : "lch(95 0 282)");

		await input.fill("not a member");
		await expect(dialog.getByText("No matching assignees.")).toBeVisible();
		await input.fill("morgan");
		await expect(dialog.getByRole("option")).toHaveCount(1);
		await input.press("Enter");
		const trigger = page.getByRole("button", { name: "Assignee: Morgan Lee" });
		await expect(trigger).toBeFocused();
		await expect(dialog).toBeHidden();

		await trigger.press("Space");
		await expect(input).toHaveValue("");
		await expect(dialog.getByRole("option", { name: /Morgan Lee/ })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		await unassigned.click();
		await expect(page.getByRole("button", { name: "Assignee: Unassigned" })).toBeFocused();
	});
}

test("Combobox multi-select skips disabled options and fits a narrow viewport", async ({
	page,
}) => {
	await page.setViewportSize({ width: 320, height: 380 });
	await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
	await page.goto("/docs/components/combobox");
	const trigger = page.getByRole("button", { name: /^Choose labels/ });
	await trigger.press("Enter");
	const dialog = page.getByRole("dialog", { name: "Choose labels" });
	const input = dialog.getByRole("combobox");
	const design = dialog.getByRole("option", { name: "Design" });
	const accessibility = dialog.getByRole("option", { name: "Accessibility" });
	const platform = dialog.getByRole("option", { name: "Platform" });

	await expect(dialog.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
	await expect(design).toHaveAttribute("aria-selected", "true");
	await expect(dialog.getByRole("option", { name: "Archived label" })).toBeDisabled();
	await input.press("ArrowDown");
	await input.press("Enter");
	await expect(accessibility).toHaveAttribute("aria-selected", "true");
	await expect(input).toBeFocused();
	await input.press("ArrowDown");
	await expect(input).toHaveAttribute(
		"aria-activedescendant",
		(await platform.getAttribute("id"))!
	);
	await expect
		.poll(() =>
			dialog.evaluate((element) => {
				const box = element.getBoundingClientRect();
				return box.x >= 0 && box.y >= 0 && box.right <= innerWidth && box.bottom <= innerHeight;
			})
		)
		.toBe(true);

	await input.fill("a11y");
	await expect(dialog.getByRole("option")).toHaveCount(1);
	await expect(accessibility).toHaveAttribute("aria-selected", "true");
	await input.press("Enter");
	await expect(accessibility).toHaveAttribute("aria-selected", "false");
	await dialog.getByRole("button", { name: "Clear labels" }).click();
	await input.press("Escape");
	await expect(dialog).toBeHidden();
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveText("Choose labels");
});

test("Combobox async results, failure recovery, and invalid and disabled triggers", async ({
	page,
}) => {
	await page.goto("/docs/components/combobox");
	await expect(page.getByRole("button", { name: "Framework unavailable" })).toBeDisabled();
	const invalid = page.getByRole("button", { name: /^Required framework/ });
	await expect(invalid).toHaveAttribute("aria-invalid", "true");
	await expect(invalid).toHaveAccessibleDescription("Choose a framework to continue.");
	await invalid.press("Enter");
	await page.getByRole("option", { name: "SvelteKit", exact: true }).click();
	await expect(invalid).toHaveAttribute("aria-invalid", "false");

	const trigger = page.getByRole("button", { name: /^Find project/ });
	await trigger.press("Enter");
	const dialog = page.getByRole("dialog", { name: "Find project" });
	const input = dialog.getByRole("combobox");
	await input.fill("support");
	await expect(dialog.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
	await expect(dialog.getByRole("status")).toHaveText("Looking up projects…");
	await expect(dialog.getByRole("alert")).toHaveText("Could not load projects.");
	await dialog.getByRole("button", { name: "Retry lookup" }).click();
	await expect(dialog.getByRole("option")).toHaveText("Support Tools");
	await input.fill("empty search");
	await expect(dialog.getByRole("status")).toHaveText("No matching projects.");
	await input.fill("design");
	await expect(dialog.getByRole("option")).toHaveText("Design Systems");
	await input.press("Enter");
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveText("Design Systems");
});
