import { expect, test, type Locator } from "@playwright/test";

function readFocusStyles(control: Locator) {
	return control.evaluate((element) => {
		const { borderTopColor, boxShadow, outlineOffset, outlineStyle, outlineWidth } =
			getComputedStyle(element);
		// A spread-only shadow draws a ring. Leave normal surface shadows out of the comparison.
		const outerRings = boxShadow
			.split(/,\s*(?![^()]*\))/)
			.filter((shadow) => !shadow.includes("inset") && /\b0px 0px 0px [1-9]\d*px\b/.test(shadow));
		return {
			borderTopColor,
			boxShadow,
			outerRings,
			outsideOutline:
				outlineStyle !== "none" && parseFloat(outlineOffset) + parseFloat(outlineWidth) > 0,
		};
	});
}

test("keyboard focus remains visible inside buttons, inputs and compound controls", async ({
	page,
}) => {
	test.setTimeout(60_000);
	for (const colorScheme of ["light", "dark"] as const) {
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		for (const [slug, selector, focusSurface] of [
			["button", "[data-tuning-current] button", "self"],
			["input", '[data-tuning-current] [data-slot="input"]', "self"],
			["input-group", '[data-tuning-current] [data-slot="input-group-control"]', "parent"],
			["switch", '[data-tuning-current] [data-slot="switch"]', "self"],
			["slider", '[data-tuning-current] [role="slider"]', "self"],
		] as const) {
			await page.goto(`/zh/docs/components/${slug}`);
			await expect(page.locator("html")).toHaveCSS("color-scheme", colorScheme);
			const control = page.locator(selector).first();
			await expect(control).toBeEnabled({ timeout: 15_000 });
			const surface =
				focusSurface === "parent" ? page.locator('[data-slot="input-group"]').first() : control;
			const before = await readFocusStyles(surface);
			// Tab establishes keyboard focus before moving focus to the specimen.
			await page.keyboard.press("Tab");
			await control.focus();
			await expect(control).toBeFocused();
			await expect
				.poll(() => readFocusStyles(surface))
				.toMatchObject({
					outerRings: before.outerRings,
					outsideOutline: false,
				});
			if (slug === "input-group") {
				await expect
					.poll(() => readFocusStyles(surface))
					.not.toMatchObject({
						borderTopColor: before.borderTopColor,
					});
			} else if (slug === "input" || slug === "switch") {
				await expect(surface).toHaveCSS("outline-style", "solid");
				await expect(surface).toHaveCSS("outline-offset", "-1px");
				if (slug === "input") {
					await expect(surface).toHaveCSS(
						"outline-color",
						colorScheme === "light" ? "lch(53 52.26 286.91)" : "lch(47.918 59.303 288.421)"
					);
					await expect(surface).toHaveCSS("box-shadow", "none");
				}
			} else {
				await expect(surface).toHaveCSS("box-shadow", /inset/);
			}
		}

		await page.goto("/zh/docs/components/input-otp");
		const otp = page.locator('input[data-slot="input-otp"]').first();
		await otp.click();
		await otp.press("Home");
		const activeCell = page.locator('[data-slot="input-otp-slot"][data-active="true"]').first();
		await expect(activeCell).toHaveCSS("box-shadow", /inset/);
		await expect.poll(() => readFocusStyles(activeCell)).toMatchObject({ outerRings: [] });

		await page.goto("/zh/docs/components/card");
		const link = page.getByRole("link", { name: "Forgot your password?" }).first();
		await page.keyboard.press("Tab");
		await link.focus();
		await expect(link).toHaveCSS("outline-width", "1px");
		await expect(link).toHaveCSS("outline-offset", "-2px");
	}
});

test("toast actions place their focus shadow inside the button", async ({ page }) => {
	await page.goto("/zh/docs/components/sonner");
	await page.getByRole("button", { name: "Show Toast", exact: true }).first().click();
	const action = page.getByRole("button", { name: "Undo", exact: true });
	await expect(action).toBeVisible();
	await page.keyboard.press("Tab");
	await action.focus();
	await expect(action).toBeFocused();
	await expect(action).toHaveCSS("box-shadow", /inset/);
	await expect
		.poll(() => readFocusStyles(action))
		.toMatchObject({
			outerRings: [],
			outsideOutline: false,
		});
});
