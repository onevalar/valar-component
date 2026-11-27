import { expect, test } from "@playwright/test";

test("CheckboxGroup submits selected values, requires one item and resets to defaults", async ({
	page,
}) => {
	await page.goto("/docs/components/checkbox");
	const group = page
		.getByRole("group", { name: "Show these items on the desktop:", exact: true })
		.and(page.locator('[data-slot="checkbox-group"]'));
	const hardDisks = group.getByRole("checkbox", { name: "Hard disks", exact: true });
	const external = group.getByRole("checkbox", { name: "External disks", exact: true });
	const form = page
		.locator("form")
		.filter({ has: page.getByRole("button", { name: "Reset desktop options" }) });
	const fields = () =>
		form.evaluate((node) => new FormData(node as HTMLFormElement).getAll("desktop-items"));
	const valid = () => form.evaluate((node) => (node as HTMLFormElement).checkValidity());

	await expect(hardDisks).toBeChecked();
	await expect(external).toBeChecked();
	await expect.poll(fields).toEqual(["hard-disks", "external-disks"]);
	await hardDisks.press("Space");
	await expect.poll(fields).toEqual(["external-disks"]);
	await expect.poll(valid).toBe(true);
	await external.press("Enter");
	await expect(external).toBeChecked();
	await external.press("Space");
	await expect.poll(valid).toBe(false);
	await expect.poll(fields).toEqual([]);
	await form.getByRole("button", { name: "Reset desktop options" }).click();
	await expect.poll(fields).toEqual(["hard-disks", "external-disks"]);
});

for (const colorScheme of ["light", "dark"] as const) {
	test(`Checkbox displays selection, mixed state and linked errors in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: colorScheme === "light" ? 1200 : 390, height: 900 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/checkbox", { waitUntil: "networkidle" });

		const checkedColor = colorScheme === "light" ? "lch(46 70 267)" : "lch(48 72 267)";
		const borderColor = colorScheme === "light" ? "lch(52.04 0 282)" : "lch(48.72 1.48 272)";
		const all = page.getByRole("checkbox", { name: "Select all users", exact: true });
		const row = page.getByRole("checkbox", { name: "Select Marcus Rodriguez", exact: true });
		await expect(row).toHaveCSS("width", "14px");
		await expect(row).toHaveCSS("height", "14px");
		await expect(row).toHaveCSS("border-radius", "3px");
		await expect(row).toHaveCSS("border-top-color", borderColor);
		await expect(all).toHaveAttribute("aria-checked", "mixed");
		await expect(all).toHaveCSS("background-color", checkedColor);
		await all.press("Space");
		await expect(all).toBeChecked();
		await expect(row).toBeChecked();
		await expect(all).toHaveCSS("outline-style", "solid");
		await expect(all).toHaveCSS("outline-offset", "-2px");
		await expect(page.getByText("4 selected", { exact: true })).toBeVisible();
		await row.press("Space");
		await expect(row).not.toBeChecked();
		await expect(all).toHaveAttribute("aria-checked", "mixed");
		await all.press("Space");
		await all.press("Space");
		await expect(all).not.toBeChecked();
		await expect(page.getByText("0 selected", { exact: true })).toBeVisible();

		const submit = page.getByRole("button", { name: "Continue", exact: true });
		const form = page.locator("form").filter({ has: submit });
		const terms = form.getByRole("checkbox", { name: "Accept terms and conditions" });
		await submit.click();
		await expect(terms).toBeFocused();
		await expect(terms).toHaveAttribute("aria-invalid", "true");
		await expect(terms).toHaveAccessibleDescription("Accept the terms to continue.");
		await terms.press("Space");
		await expect(terms).toBeChecked();
		await expect(terms).not.toHaveAttribute("aria-invalid", "true");
		await expect(form.getByRole("alert")).toHaveCount(0);
		await submit.press("Enter");
		await expect(form.getByRole("status")).toHaveText("Preferences submitted.");
		const disabled = page
			.getByRole("checkbox", { name: "Enable notifications", exact: true })
			.filter({ visible: true });
		expect(
			await disabled.evaluateAll((nodes) => nodes.some((node) => node.matches(":disabled")))
		).toBe(true);
		await expect
			.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
			.toBeLessThanOrEqual(colorScheme === "light" ? 1200 : 390);
	});
}
