import { expect, test } from "@playwright/test";

const versions = [
	{ id: "react", url: process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/" },
	{ id: "vue", url: process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/" },
];

for (const { id, url } of versions) {
	for (const { theme, width } of [
		{ theme: "light", width: 900 },
		{ theme: "dark", width: 320 },
	]) {
		test(`${id} ${theme} ${width}: native Popover form, nesting, focus and collision`, async ({
			page,
		}) => {
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			await page.setViewportSize({ width, height: 540 });
			await page.goto(`${url}?example=popover&theme=${theme}`);
			const edit = page.getByRole("button", { name: "Edit profile" });
			const profile = page.getByRole("dialog", { name: "Edit profile", exact: true });
			const displayName = profile.getByRole("textbox", { name: "Display name" });
			const saved = page.getByLabel("Saved display name");
			await expect(edit).toHaveAttribute("aria-expanded", "false");
			await edit.focus();
			await page.keyboard.press("Enter");
			await expect(edit).toHaveAttribute("aria-expanded", "true");
			await expect(profile).toHaveCSS("border-radius", "12px");
			await expect(profile).toHaveCSS("padding-top", "10px");
			await expect(profile).toHaveAccessibleDescription("Set your display name.");
			await expect(displayName).toBeFocused();
			await displayName.fill("");
			await profile.getByRole("button", { name: "Save profile" }).click();
			await expect(profile).toBeVisible();
			expect(
				await displayName.evaluate((input: HTMLInputElement) => input.validity.valueMissing)
			).toBe(true);
			await displayName.fill("Unsaved draft");
			await profile.getByRole("button", { name: "Cancel" }).click();
			await expect(profile).toBeHidden();
			await expect(edit).toBeFocused();
			await expect(saved).toHaveText("Valar");
			await edit.click();
			await expect(displayName).toHaveValue("Valar");
			await displayName.fill("团队 Valar");
			await displayName.press("Enter");
			await expect(profile).toBeHidden();
			await expect(edit).toBeFocused();
			await expect(saved).toHaveText("团队 Valar");
			await edit.click();
			await expect(profile).toBeVisible();
			await page.mouse.click(width - 4, 350);
			await expect(profile).toBeHidden();

			const trigger = page.getByRole("button", { name: "Display options" });
			const options = page.getByRole("dialog", { name: "Display options" });
			await trigger.click();
			const grouping = options.getByRole("combobox", { name: "Grouping" });
			const weeks = options.getByRole("checkbox", { name: "Show week numbers" });
			const projects = options.getByRole("checkbox", { name: "Show project list" });
			const reset = options.getByRole("button", { name: "Reset" });
			const done = options.getByRole("button", { name: "Done" });
			await expect(options).toHaveCSS("width", width === 320 ? "304px" : "330px");
			await expect(options).toHaveCSS("padding-top", "0px");
			await expect(options).toHaveCSS("animation-name", "none");
			await expect(options).toHaveCSS(
				"background-color",
				theme === "light" ? "rgb(255, 255, 255)" : "lch(12.72 0.85 272)"
			);
			await expect(options.getByText("Timeline options").locator("..")).toHaveCSS(
				"padding",
				"8px 16px"
			);
			await expect(options.locator("label").last()).toHaveCSS("height", "32px");
			await expect(grouping).toHaveCSS("height", "24px");
			await expect(options.locator('[data-slot="separator"]')).toHaveCount(2);
			await expect(options.getByRole("separator")).toHaveCount(0);
			const box = (await options.boundingBox())!;
			const anchor = (await trigger.boundingBox())!;
			expect(box.x).toBeGreaterThanOrEqual(7.5);
			expect(box.x + box.width).toBeLessThanOrEqual(width - 7.5);
			expect(box.y - anchor.y - anchor.height).toBeCloseTo(4, 0);
			await grouping.press("ArrowDown");
			const list = page.getByRole("listbox");
			await expect(list).toBeVisible();
			await expect(list).toHaveCSS(
				"background-color",
				theme === "light" ? "rgb(255, 255, 255)" : "lch(12.72 0.85 272)"
			);
			await page.keyboard.press("Escape");
			await expect(list).toBeHidden();
			await expect(options).toBeVisible();
			await expect(grouping).toBeFocused();
			await page.keyboard.press("Escape");
			await expect(options).toBeHidden();
			await expect(trigger).toBeFocused();

			await trigger.press("Enter");
			await expect(reset).toBeDisabled();
			await grouping.click();
			await page.getByRole("option", { name: "Lead", exact: true }).click();
			await weeks.press("Space");
			await projects.press("Space");
			await done.press("Enter");
			await expect(options).toBeHidden();
			await expect(trigger).toBeFocused();
			await trigger.press("Enter");
			await expect(grouping).toHaveText("Lead");
			await expect(weeks).toBeChecked();
			await expect(projects).not.toBeChecked();
			await reset.press("Enter");
			await expect(grouping).toHaveText("No grouping");
			await expect(weeks).not.toBeChecked();
			await expect(projects).toBeChecked();

			if (width === 320) {
				await page.setViewportSize({ width, height: 184 });
				await expect
					.poll(async () => (await options.boundingBox())!.height)
					.toBeLessThanOrEqual(168);
				expect(await options.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeGreaterThan(
					0
				);
				await done.focus();
				await expect.poll(() => options.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
			}
			await done.press("Enter");
			await expect(options).toBeHidden();
			await expect(trigger).toBeFocused();
			expect(errors).toEqual([]);
		});
	}
}
