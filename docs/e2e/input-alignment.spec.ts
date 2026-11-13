import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Input preserves settings geometry and displays focus on invalid values in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1200, height: 800 });
		await page.emulateMedia({ colorScheme });
		await page.goto("/docs/components/input");

		const identifier = page.getByRole("textbox", { name: "Identifier", exact: true });
		const field = page.locator('[data-slot="field"]').filter({ has: identifier });
		await expect(identifier).toHaveCSS("height", "32px");
		await expect(identifier).toHaveCSS("width", "172.5px");
		await expect(identifier).toHaveCSS("padding-left", "12px");
		await expect(identifier).toHaveCSS("border-radius", "8px");
		await expect(identifier).toHaveCSS("font-size", "13px");
		await expect(identifier).toHaveCSS(
			"border-top-color",
			colorScheme === "light" ? "lch(86.5 0 282)" : "lch(30.833 1.93 272)"
		);
		await field.locator("label").click();
		await expect(identifier).toBeFocused();
		await expect(identifier).toHaveCSS("outline-offset", "-1px");
		await expect(identifier).toHaveCSS("box-shadow", "none");
		await identifier.pressSequentially("productgroup");
		await expect(identifier).toHaveValue("PRODUCT");
		await expect(identifier).toHaveAccessibleDescription(/PRODUCT-123/);

		const email = page.getByRole("textbox", { name: "Work email", exact: true });
		await expect(email).toHaveAttribute("aria-invalid", "true");
		await expect(email).toHaveAccessibleDescription("Enter a valid email address.");
		const invalidBorder = await email.evaluate(
			(element) => getComputedStyle(element).borderTopColor
		);
		await email.click();
		await expect(email).toHaveCSS("outline-style", "solid");
		await expect(email).toHaveCSS("outline-width", "1px");
		await expect(email).toHaveCSS("outline-offset", "-1px");
		await expect(email).toHaveCSS("border-top-color", invalidBorder);
		await email.fill("jordan@example.com");
		await expect(email).not.toHaveAttribute("aria-invalid", "true");
		expect(await email.getAttribute("aria-describedby")).toBeNull();
		await expect(email).toHaveCSS("box-shadow", "none");
		await expect(email).toHaveCSS(
			"outline-color",
			colorScheme === "light" ? "lch(53 52.26 286.91)" : "lch(47.918 59.303 288.421)"
		);

		await page.setViewportSize({ width: 390, height: 800 });
		await expect(field).toHaveCSS("flex-direction", "column");
		await expect(identifier).toHaveCSS("font-size", "16px");
		await expect
			.poll(() => page.evaluate(() => document.documentElement.scrollWidth))
			.toBeLessThanOrEqual(390);
	});
	test(`Inline Input Group keeps both small actions inside the field in ${colorScheme}`, async ({
		page,
	}) => {
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/input-group");
		const input = page.getByRole("textbox", { name: "Search query", exact: true });
		const group = page.locator('[data-slot="input-group"]').filter({ has: input });
		const text = group.getByRole("button", { name: "Search", exact: true });
		const icon = group.getByRole("button", { name: "Search information" });
		for (const [width, direction] of [
			[1200, "ltr"],
			[390, "rtl"],
		] as const) {
			await page.setViewportSize({ width, height: 850 });
			await group.evaluate((element, dir) => element.setAttribute("dir", dir), direction);
			await expect(group).toHaveCSS("height", "32px");
			await expect(group).toHaveCSS("border-radius", "8px");
			await expect(input).toHaveCSS("height", "30px");
			await expect(text).toHaveCSS("height", "28px");
			await expect(icon).toHaveCSS("height", "28px");
			await expect(icon).toHaveCSS("width", "28px");
			await expect(icon).toHaveCSS(
				"border-radius",
				await text.evaluate((element) => getComputedStyle(element).borderRadius)
			);
			const bounds = await group.boundingBox();
			const textBox = await text.boundingBox();
			const iconBox = await icon.boundingBox();
			for (const action of [textBox!, iconBox!]) {
				expect(action.y - bounds!.y).toBe(2);
				expect(action.x).toBeGreaterThan(bounds!.x);
				expect(action.x + action.width).toBeLessThan(bounds!.x + bounds!.width);
			}
			expect(direction === "ltr" ? iconBox!.x < textBox!.x : iconBox!.x > textBox!.x).toBe(true);
		}
		await input.focus();
		await expect(input).toBeFocused();
		await text.press("Enter");
		await expect(text).toBeFocused();
	});
}

test("Input examples keep native readonly, disabled, file and form behavior", async ({ page }) => {
	await page.goto("/docs/components/input");
	const identifier = page.getByRole("textbox", { name: "Issue ID", exact: true });
	const disabled = page.getByRole("textbox", { name: "Managed email", exact: true });
	const email = page.getByRole("textbox", { name: "Work email", exact: true });
	await expect(disabled).toBeDisabled();
	await disabled.focus();
	await expect(disabled).not.toBeFocused();
	await identifier.click();
	await identifier.press("X");
	await expect(identifier).toHaveValue("VLR-42");
	const selection = await identifier.evaluate((element: HTMLInputElement) => {
		element.select();
		return element.value.slice(element.selectionStart ?? 0, element.selectionEnd ?? 0);
	});
	expect(selection).toBe("VLR-42");
	await identifier.press("Shift+Tab");
	await expect(disabled).not.toBeFocused();
	await email.focus();
	await expect(email).toBeFocused();

	const picture = page.getByLabel("Picture", { exact: true });
	await picture.setInputFiles({
		name: "test.svg",
		mimeType: "image/svg+xml",
		buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
	});
	await expect(page.getByText("Selected test.svg", { exact: true })).toBeVisible();
	await picture.setInputFiles([]);
	await expect(page.getByText("Selected test.svg", { exact: true })).toBeHidden();

	const form = page
		.locator("form")
		.filter({ has: page.getByRole("combobox", { name: "Country" }) });
	const name = form.getByRole("textbox", { name: "Name", exact: true });
	await expect(name).toHaveAttribute("required", "");
	await form.getByRole("button", { name: "Submit" }).click();
	await expect(name).toBeFocused();
	await expect(form.getByRole("status")).toHaveCount(0);
	await name.fill("Jordan Lee");
	await form.getByRole("button", { name: "Submit" }).click();
	await expect(form.getByRole("status")).toHaveText("Preview submitted.");
	await form.getByRole("button", { name: "Reset" }).click();
	await expect(name).toHaveValue("");
	await expect(form.getByRole("status")).toHaveCount(0);
});
