import { expect, test, type Locator, type Page } from "@playwright/test";

async function chooseBlock(page: Page, description: Locator, choice: string) {
	await description.locator(":scope > p").last().click();
	await page.keyboard.press("/");
	const menu = page.getByRole("dialog", { name: "Insert block", exact: true });
	const search = menu.getByRole("combobox");
	await expect(search).toBeFocused();
	await search.fill(choice);
	await search.press("Enter");
	await expect(menu).toBeHidden();
}

const png = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGP4z8DA0PAfAAgAAn+cRUBOAAAAAElFTkSuQmCC",
	"base64"
);

for (const colorScheme of ["light", "dark"] as const) {
	test(`Issue Composer stores Mermaid, LaTeX, collapsible sections and inline media in ${colorScheme}`, async ({
		page,
	}) => {
		test.setTimeout(60_000);
		await page.setViewportSize({ width: colorScheme === "dark" ? 320 : 1280, height: 820 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/issue-composer", { waitUntil: "networkidle" });
		const opener = page.locator(".preview").getByRole("button", { name: "New issue", exact: true });
		await opener.press("Enter");
		const composer = page.getByRole("dialog", { name: "New issue", exact: true });
		const description = composer.getByRole("textbox", { name: "Description", exact: true });
		await composer
			.getByRole("textbox", { name: "Title", exact: true })
			.fill("Rich description sample");

		await chooseBlock(page, description, "Diagram");
		const diagram = composer.locator('[data-slot="issue-source-block"][data-kind="diagram"]');
		const diagramSource = diagram.getByRole("textbox", {
			name: "Mermaid diagram source",
			exact: true,
		});
		const showDiagram = diagram.getByRole("button", { name: "Show diagram", exact: true });
		await expect(diagramSource).toBeFocused();
		await expect(diagramSource).toHaveCSS("font-size", "13px");
		await expect(showDiagram).toBeDisabled();
		await expect(diagram.getByRole("group", { name: "Diagram actions", exact: true })).toHaveCSS(
			"height",
			"31px"
		);
		await diagramSource.fill("flowchart LR\nA[Start] --> B[Done]");
		await showDiagram.press("Enter");
		const diagramImage = diagram.getByRole("img", { name: "Mermaid diagram", exact: true });
		await expect(diagramImage).toBeVisible();
		await expect
			.poll(() => diagramImage.evaluate((element) => (element as HTMLImageElement).naturalWidth))
			.toBeGreaterThan(0);
		const diagramViewport = diagram.getByRole("region", { name: "Diagram", exact: true });
		await expect(diagramViewport).toHaveCSS("scrollbar-width", "none");
		const fullScreen = diagram.getByRole("button", { name: "Full screen", exact: true });
		await fullScreen.press("Enter");
		const zoomed = page.getByRole("dialog", { name: "Diagram", exact: true });
		await expect(zoomed.getByRole("img", { name: "Mermaid diagram", exact: true })).toBeVisible();
		expect(
			await zoomed.evaluate((element) => {
				const { top, right, bottom, left } = element.getBoundingClientRect();
				return top >= 0 && bottom <= innerHeight && left >= 0 && right <= innerWidth;
			})
		).toBe(true);
		await page.keyboard.press("Escape");
		await expect(zoomed).toBeHidden();
		await expect(fullScreen).toBeFocused();
		await diagram.getByRole("button", { name: "Show source", exact: true }).press("Enter");
		await expect(diagramSource).toBeFocused();
		await expect(diagramSource).toHaveValue("flowchart LR\nA[Start] --> B[Done]");

		await chooseBlock(page, description, "LaTeX");
		const formula = composer.locator('[data-slot="issue-source-block"][data-kind="formula"]');
		const formulaSource = formula.getByRole("textbox", {
			name: "LaTeX formula source",
			exact: true,
		});
		await expect(formulaSource).toBeFocused();
		await formulaSource.fill("\\notAnActualCommand");
		await formula.getByRole("button", { name: "Show formula", exact: true }).press("Enter");
		await expect(
			formula.getByText("Unable to render the formula. Check the LaTeX syntax.")
		).toBeVisible();
		await formula.getByRole("button", { name: "Show source", exact: true }).press("Enter");
		await formulaSource.fill("E = mc^2");
		await formula.getByRole("button", { name: "Show formula", exact: true }).press("Enter");
		await expect(formula.locator("math mrow").first()).toBeVisible();

		await chooseBlock(page, description, "Collapsible section");
		const section = composer.locator('[data-issue-block="section"]');
		const sectionTitle = section.locator('[data-slot="issue-section-title"]');
		const sectionBody = section.locator("p").first();
		await expect(sectionTitle).toHaveCSS("line-height", "22.5px");
		await expect
			.poll(() => sectionTitle.evaluate((element) => getComputedStyle(element, "::before").content))
			.toBe('"Add section title…"');
		await sectionTitle.click();
		await page.keyboard.insertText("Implementation notes");
		await sectionBody.click();
		await page.keyboard.insertText("A separately editable body.");
		const disclosure = section.getByRole("button", { name: /section · Implementation notes/ });
		await expect(disclosure).toHaveAttribute("aria-expanded", "true");
		await expect(disclosure).toHaveCSS("height", "20px");
		await disclosure.press("Space");
		await expect(sectionBody).toBeHidden();
		await expect(disclosure).toBeFocused();
		await disclosure.press("Enter");
		await expect(sectionBody).toBeVisible();

		const chooser = page.waitForEvent("filechooser");
		await chooseBlock(page, description, "Media");
		await (
			await chooser
		).setFiles({ name: "inline-sample.png", mimeType: "image/png", buffer: png });
		const inlineImage = composer.getByRole("img", { name: "inline-sample.png", exact: true });
		await expect(inlineImage).toHaveCSS("border-radius", "6px");
		await expect
			.poll(() => inlineImage.evaluate((element) => (element as HTMLImageElement).naturalWidth))
			.toBe(2);
		await expect(composer.getByRole("list", { name: "Attachments", exact: true })).toBeHidden();
		const imageActions = composer.getByRole("group", { name: "Image actions", exact: true });
		await expect(imageActions).toHaveCSS("height", "31px");
		const imageFullScreen = imageActions.getByRole("button", { name: "Full screen", exact: true });
		const mediaMenu = imageActions.getByRole("button", { name: "Open menu", exact: true });
		if (colorScheme === "dark") {
			await expect(imageActions.getByRole("button")).toHaveCount(1);
			await mediaMenu.press("Enter");
			await page.getByRole("menuitem", { name: "Full screen", exact: true }).press("Enter");
		} else {
			await imageFullScreen.press("Enter");
		}
		await expect(
			page.getByRole("dialog", { name: "inline-sample.png", exact: true }).getByRole("img")
		).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(colorScheme === "dark" ? mediaMenu : imageFullScreen).toBeFocused();

		await composer.getByRole("button", { name: "Close", exact: true }).press("Enter");
		await page
			.getByRole("alertdialog", { name: "Save to drafts?", exact: true })
			.getByRole("button", { name: "Save", exact: true })
			.press("Enter");
		await expect(composer).toBeHidden();
		await expect(opener).toBeFocused();
		await opener.press("Enter");
		await expect(diagramSource).toHaveValue("flowchart LR\nA[Start] --> B[Done]");
		await expect(formula).toBeVisible();
		const savedFormulaSource = formula.getByRole("button", { name: "Show source", exact: true });
		if (await savedFormulaSource.isVisible()) await savedFormulaSource.press("Enter");
		await expect(formulaSource).toHaveValue("E = mc^2");
		await expect(sectionBody).toHaveText("A separately editable body.");
		await expect(inlineImage).toBeVisible();
		await composer.getByRole("button", { name: "Create issue", exact: true }).press("Enter");
		const created = page.locator(".preview").locator('[data-slot="issue-description"]');
		await expect(
			created.getByRole("img", { name: "inline-sample.png", exact: true })
		).toBeVisible();
		await expect(created.getByRole("img", { name: "Mermaid diagram", exact: true })).toBeVisible();
		await expect(created.locator("math mrow").first()).toBeVisible();
		const createdSection = created.getByRole("button", {
			name: "Implementation notes",
			exact: true,
		});
		await createdSection.press("Space");
		await expect(created.getByText("A separately editable body.")).toBeHidden();
	});
}

test("cancelled media leaves the document unchanged, and unreadable inline media can be removed", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
	await page.goto("/docs/components/issue-composer", { waitUntil: "networkidle" });
	await page
		.locator(".preview")
		.getByRole("button", { name: "New issue", exact: true })
		.press("Enter");
	const composer = page.getByRole("dialog", { name: "New issue", exact: true });
	const description = composer.getByRole("textbox", { name: "Description", exact: true });
	let chooser = page.waitForEvent("filechooser");
	await chooseBlock(page, description, "Media");
	await (await chooser).setFiles([]);
	await expect(description.locator('[data-issue-block="media"]')).toHaveCount(0);
	chooser = page.waitForEvent("filechooser");
	await chooseBlock(page, description, "Media");
	await (
		await chooser
	).setFiles({
		name: "unreadable.png",
		mimeType: "image/png",
		buffer: Buffer.from("not an image"),
	});
	const unavailable = composer.getByText("Media unavailable · unreadable.png", { exact: true });
	await expect(unavailable).toBeVisible();
	const actions = composer.getByRole("group", { name: "Image actions", exact: true });
	await actions.getByRole("button", { name: "Open menu", exact: true }).press("Enter");
	await expect(page.getByRole("menuitem", { name: "Full screen", exact: true })).toBeDisabled();
	await page.keyboard.press("End");
	await expect(page.getByRole("menuitem", { name: "Delete", exact: true })).toBeFocused();
	await page.keyboard.press("Enter");
	await expect(unavailable).toBeHidden();
	await expect(description).toBeFocused();
});
