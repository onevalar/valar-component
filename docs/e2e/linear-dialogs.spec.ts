import { expect, test, type Locator, type Page } from "@playwright/test";

async function openWithKeyboard(page: Page, name: string) {
	const trigger = page.getByRole("button", { name, exact: true });
	await trigger.press("Enter");
	return trigger;
}

async function escapeAndRestore(page: Page, modal: Locator, trigger: Locator) {
	await page.keyboard.press("Escape");
	await expect(modal).toHaveCount(0);
	await expect(trigger).toBeFocused();
}

for (const { colorScheme, width, height } of [
	{ colorScheme: "light", width: 1280, height: 720 },
	{ colorScheme: "dark", width: 375, height: 568 },
] as const) {
	test.describe(`${colorScheme} · ${width}px`, () => {
		test.use({ colorScheme, viewport: { width, height }, reducedMotion: "reduce" });

		test("Alert Dialog keeps confirmation focus inside, supports sizes, and retries in place", async ({
			page,
		}) => {
			await page.goto("/docs/components/alert-dialog", { waitUntil: "networkidle" });
			const confirmation = page.getByRole("alertdialog");
			const draft = await openWithKeyboard(page, "Close draft");
			const keepEditing = confirmation.getByRole("button", { name: "Keep editing" });
			await expect(keepEditing).toBeFocused();
			await expect(keepEditing).toHaveCSS("height", "32px");
			await expect(confirmation).toHaveCSS("width", `${Math.min(width - 32, 480)}px`);
			await expect(confirmation).toHaveCSS("border-radius", "12px");
			await page.locator('[data-slot="alert-dialog-overlay"]').click({ position: { x: 4, y: 4 } });
			await expect(keepEditing).toBeFocused();
			await page.keyboard.press("Tab");
			await expect(confirmation.getByRole("button", { name: "Save draft" })).toBeFocused();
			await page.keyboard.press("Tab");
			await expect(confirmation.getByRole("button", { name: "Discard draft" })).toBeFocused();
			await escapeAndRestore(page, confirmation, draft);

			const publish = await openWithKeyboard(page, "Publish update");
			await expect(confirmation).toHaveAttribute("data-appearance", "default");
			await confirmation.getByRole("button", { name: "Publish", exact: true }).click();
			await expect(confirmation).toHaveCount(0);
			await expect(publish).toBeFocused();

			for (const trigger of await page
				.getByRole("button", { name: "Show Dialog", exact: true })
				.all()) {
				await trigger.press("Enter");
				await expect(confirmation).toHaveAttribute("data-size", "sm");
				await expect(confirmation).toHaveCSS("width", `${Math.min(width - 32, 320)}px`);
				await confirmation.getByRole("button", { name: "Allow", exact: true }).press("Enter");
				await expect(confirmation).toHaveCount(0);
				await expect(trigger).toBeFocused();
			}
			const media = await openWithKeyboard(page, "Share Project");
			await expect(confirmation.locator('[data-slot="alert-dialog-media"] svg')).toHaveCSS(
				"width",
				"16px"
			);
			await expect(confirmation).toBeFocused();
			await escapeAndRestore(page, confirmation, media);

			const remove = await openWithKeyboard(page, "Delete example issue");
			await expect(confirmation.getByRole("button", { name: "Cancel" })).toBeFocused();
			await page.mouse.move(0, 0);
			await page.keyboard.press("Tab");
			const action = confirmation.locator('[data-slot="alert-dialog-action"]');
			await expect(action).toBeFocused();
			await expect(action).toHaveCSS("background-color", "lch(58 73 29)");
			await expect(action).toHaveCSS("box-shadow", /inset/);
			await page.keyboard.press("Enter");
			await expect(action).toBeDisabled();
			await expect(action).toBeFocused();
			await page.keyboard.press("Enter");
			await page.keyboard.press("Escape");
			await expect(confirmation.getByRole("alert")).toContainText("Could not delete");
			await expect(action).toBeFocused();
			await action.press("Enter");
			await expect(confirmation).toHaveCount(0);
			await expect(remove).toBeFocused();
			await expect(page.getByText("Example issue deleted.")).toBeVisible();
		});

		test("Dialog preserves keyboard editing, async recovery, and a pinned footer on narrow screens", async ({
			page,
		}) => {
			await page.goto("/docs/components/dialog", { waitUntil: "networkidle" });
			const modal = page.getByRole("dialog");
			const editor = await openWithKeyboard(page, "Edit draft");
			await expect(modal).toHaveAttribute("data-appearance", "editor");
			await expect(modal).toHaveCSS("border-radius", "21px");
			const title = modal.getByRole("textbox", { name: "Title" });
			await expect(title).toBeFocused();
			await title.clear();
			const save = modal.getByRole("button", { name: "Save changes" });
			await expect(save).toBeDisabled();
			await title.fill("New draft title");
			await save.press("Enter");
			await expect(modal).toHaveCount(0);
			await expect(editor).toBeFocused();
			await expect(page.getByText("Saved: New draft title")).toBeVisible();

			const settings = await openWithKeyboard(page, "Edit settings");
			await expect(modal).toHaveAttribute("data-appearance", "default");
			await expect(modal).toHaveCSS("width", `${Math.min(width - 32, 480)}px`);
			await expect(modal).toHaveCSS("border-radius", "12px");
			await expect(modal).toHaveCSS(
				"background-color",
				colorScheme === "dark" ? "lch(9.232 0.85 272)" : "rgb(255, 255, 255)"
			);
			const name = modal.getByRole("textbox", { name: "Project name" });
			await expect(name).toBeFocused();
			await name.fill("A new project name");
			await page.keyboard.press("Tab");
			await expect(modal.getByRole("button", { name: "Cancel" })).toBeFocused();
			await page.keyboard.press("Tab");
			const submit = modal.getByRole("button", { name: /^(Save|Saving…|Retry save)$/ });
			await expect(submit).toBeFocused();
			await page.keyboard.press("Enter");
			await expect(submit).toBeDisabled();
			await expect(submit).toBeFocused();
			await page.keyboard.press("Escape");
			await expect(modal.getByRole("alert")).toContainText("Could not save");
			await expect(name).toHaveValue("A new project name");
			await submit.press("Enter");
			await expect(modal).toHaveCount(0);
			await expect(settings).toBeFocused();
			await expect(page.getByText("Saved settings for A new project name.")).toBeVisible();
			await settings.press("Enter");
			await name.fill("Unsaved value");
			await page.locator('[data-slot="dialog-overlay"]').click({ position: { x: 4, y: 4 } });
			await expect(modal).toHaveCount(0);
			await expect(settings).toBeFocused();
			await settings.press("Enter");
			await expect(name).toHaveValue("A new project name");
			await escapeAndRestore(page, modal, settings);

			for (const example of ["Sticky Footer", "Scrollable Content", "No Close Button"]) {
				const trigger = await openWithKeyboard(page, example);
				await expect(modal.getByRole("heading", { name: example })).toBeVisible();
				if (example !== "No Close Button") {
					const body = modal.locator(".overflow-y-auto");
					expect(
						await body.evaluate((element) => {
							element.scrollTop = element.scrollHeight;
							return element.scrollTop;
						})
					).toBeGreaterThan(0);
					if (example === "Sticky Footer")
						await expect(
							modal.getByRole("button", { name: "Close", exact: true })
						).toBeInViewport();
				}
				await escapeAndRestore(page, modal, trigger);
			}
		});
	});
}
