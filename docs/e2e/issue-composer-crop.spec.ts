import { expect, test, type Locator, type Page } from "@playwright/test";

const imageName = "crop-fixture.png";
const imageBytes = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAJYAAABgCAIAAABwqByxAAAA+UlEQVR4nO3RwQkAIBDAsBvWt8M6kUP4kEIgAxQ6ex3S5nsBjyzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDPwjwL8yzMszDvAhufTmXbouWZAAAAAElFTkSuQmCC",
	"base64"
);

async function openCrop(page: Page, menuButton: Locator) {
	await menuButton.press("Enter");
	await page.getByRole("menuitem", { name: "Crop image", exact: true }).press("Enter");
	const dialog = page.getByRole("dialog", { name: /^(Crop image|crop-fixture\.png)$/ }).filter({
		has: page.getByRole("button", { name: "Resize from left", exact: true })
	});
	await expect(dialog).toBeVisible();
	return dialog;
}

for (const colorScheme of ["light", "dark"] as const) {
	test(`Issue Composer crops inline media and retains the crop in ${colorScheme}`, async ({
		page
	}) => {
		await page.setViewportSize({
			width: colorScheme === "light" ? 1280 : 320,
			height: 820
		});
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/issue-composer", {
			waitUntil: "networkidle"
		});
		const preview = page.locator(".preview");
		const opener = preview.getByRole("button", {
			name: "New issue",
			exact: true
		});
		await opener.press("Enter");
		const composer = page.getByRole("dialog", {
			name: "New issue",
			exact: true
		});
		await composer.getByRole("textbox", { name: "Title", exact: true }).fill("Crop fixture");
		const description = composer.getByRole("textbox", {
			name: "Description",
			exact: true
		});
		await description.locator(":scope > p").last().click();
		await page.keyboard.press("/");
		const search = page.getByRole("dialog", { name: "Insert block" }).getByRole("combobox");
		await search.fill("Media");
		const chooser = page.waitForEvent("filechooser");
		await search.press("Enter");
		await (await chooser).setFiles({ name: imageName, mimeType: "image/png", buffer: imageBytes });

		const image = composer.getByRole("img", { name: imageName, exact: true });
		const dimensions = (element: Element) => {
			const picture = element as HTMLImageElement;
			return [picture.naturalWidth, picture.naturalHeight];
		};
		await expect.poll(() => image.evaluate(dimensions)).toEqual([150, 96]);
		const menuButton = composer
			.getByRole("group", { name: "Image actions", exact: true })
			.getByRole("button", { name: "Open menu", exact: true });
		let dialog = await openCrop(page, menuButton);
		const save = dialog.getByRole("button", { name: "Save", exact: true });
		await expect(save).toBeDisabled();
		const left = dialog.getByRole("button", {
			name: "Resize from left",
			exact: true
		});
		await expect(left).toHaveCSS("width", "24px");
		const before = (await left.boundingBox())!.x;
		await left.press("ArrowRight");
		const nudged = (await left.boundingBox())!.x;
		await left.press("Shift+ArrowRight");
		const shifted = (await left.boundingBox())!.x;
		expect(nudged - before).toBeGreaterThan(0);
		expect(shifted - nudged).toBeGreaterThan(nudged - before);
		await expect(left).toBeFocused();
		await expect(left).toHaveCSS("outline-offset", "-1px");
		await expect(save).toBeEnabled();
		await page.keyboard.press("Escape");
		await expect(dialog).toBeHidden();
		await expect(menuButton).toBeFocused();
		await expect.poll(() => image.evaluate(dimensions)).toEqual([150, 96]);

		dialog = await openCrop(page, menuButton);
		await left.press("Shift+ArrowRight");
		await left.press("Shift+ArrowRight");
		await save.press("Enter");
		await expect(dialog).toBeHidden();
		await expect(menuButton).toBeFocused();
		await expect.poll(async () => (await image.evaluate(dimensions))[0]).toBeLessThan(150);
		const cropped = await image.evaluate(dimensions);
		expect(cropped[0]).toBeGreaterThan(0);

		await composer.getByRole("button", { name: "Close", exact: true }).press("Enter");
		await page
			.getByRole("alertdialog", { name: "Save to drafts?", exact: true })
			.getByRole("button", { name: "Save", exact: true })
			.press("Enter");
		await expect(composer).toBeHidden();
		await expect(opener).toBeFocused();
		await opener.press("Enter");
		await expect.poll(() => image.evaluate(dimensions)).toEqual(cropped);
		await composer.getByRole("button", { name: "Create issue", exact: true }).press("Enter");
		const readonly = preview.locator('[data-slot="issue-description"]');
		await expect
			.poll(() => readonly.getByRole("img", { name: imageName, exact: true }).evaluate(dimensions))
			.toEqual(cropped);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
			colorScheme === "light" ? 1280 : 320
		);
	});
}
