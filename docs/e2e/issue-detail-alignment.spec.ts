import { expect, test, type Locator } from "@playwright/test";

async function selectDescriptionWord(editor: Locator) {
	const paragraph = editor.locator("p").first();
	await paragraph.click({ position: { x: 1, y: 8 } });
	await expect
		.poll(() =>
			paragraph.evaluate((line) => {
				const selection = window.getSelection();
				return selection?.isCollapsed && line.contains(selection.anchorNode)
					? selection.anchorOffset
					: -1;
			})
		)
		.toBe(0);
	for (let character = 0; character < 5; character++) await editor.press("Shift+ArrowRight");
	await expect.poll(() => editor.evaluate(() => window.getSelection()?.toString())).toBe("Check");
}

for (const { width, colorScheme } of [
	{ width: 390, colorScheme: "dark" },
	{ width: 1440, colorScheme: "light" },
] as const) {
	test(`Issue Detail keeps inline comments and separate drafts at ${width}px in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 884 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/issue-detail", { waitUntil: "networkidle" });

		const detail = page.locator(".preview").getByRole("region", { name: "Issue details" });
		const readOnlyBody = detail.locator('[data-slot="issue-description"]');
		await expect(readOnlyBody).toHaveCSS("font-size", "15px");
		await expect(readOnlyBody).toHaveCSS("line-height", "24px");
		await expect(detail).toHaveCSS("color-scheme", colorScheme);

		const codeViewport = readOnlyBody.getByRole("region", { name: "Code content" });
		await expect(codeViewport).toHaveCSS("scrollbar-width", "none");
		const codeBox = await codeViewport.evaluate((element) => ({
			scrollWidth: element.scrollWidth,
			clientWidth: element.clientWidth,
			clientHeight: element.clientHeight,
		}));
		if (width < 500) {
			expect(codeBox.scrollWidth).toBeGreaterThan(codeBox.clientWidth);
			const scrollbar = readOnlyBody.locator(
				'[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]'
			);
			await page.mouse.move(1, 1);
			await expect(scrollbar).toBeHidden();
			await codeViewport.hover();
			await expect(scrollbar).toBeVisible();
			await expect(scrollbar).toHaveCSS("position", "absolute");
			await expect(codeViewport).toHaveJSProperty("clientHeight", codeBox.clientHeight);
			await codeViewport.press("ArrowRight");
			await expect
				.poll(() => codeViewport.evaluate((element) => element.scrollLeft))
				.toBeGreaterThan(0);
			await codeViewport.click({ position: { x: 8, y: 8 } });
			await expect(
				detail.getByRole("textbox", { name: "Issue description", exact: true })
			).toHaveCount(0);
		}

		const editDescription = detail.getByRole("button", { name: "Edit description", exact: true });
		await readOnlyBody.getByText("Check focus restoration after closing the menu.").click();
		const description = detail.getByRole("textbox", { name: "Issue description", exact: true });
		await expect(description).toBeFocused();

		await selectDescriptionWord(description);
		const actions = detail.getByRole("group", { name: "Selected text actions" });
		const comment = actions.getByRole("button", { name: "Comment", exact: true });
		await expect(actions).toHaveCSS("height", "34px");
		await expect(detail.getByRole("button", { name: "Bold", exact: true })).toHaveCount(1);
		await expect(comment).toHaveCSS("width", "26px");
		await expect(comment).toHaveCSS("border-radius", "4px");
		await comment.press("Enter");

		const panel = detail.getByRole("dialog", { name: "Comment on selected text" });
		const draft = panel.getByRole("textbox", { name: "Comment", exact: true });
		await expect(draft).toBeFocused();
		const highlight = description.locator('[data-slot="issue-description-comment-highlight"]');
		await expect(highlight).toHaveText("Check");
		await draft.fill("A note to discard.");
		await draft.press("Escape");
		const confirmation = detail.getByRole("alertdialog", { name: "Discard comment?" });
		await expect(confirmation).toBeVisible();
		await confirmation.getByRole("button", { name: "Discard changes" }).press("Enter");
		await expect(panel).toHaveCount(0);
		await expect(description).toBeFocused();
		await expect(highlight).toHaveCount(0);

		await selectDescriptionWord(description);
		await comment.press("Enter");
		await expect(draft).toBeFocused();
		await draft.fill("This line could mention keyboard focus.");
		await draft.press("Control+Enter");
		await expect(panel).toHaveCount(0);
		await expect(description).toBeFocused();
		const activity = detail.getByRole("region", { name: "Issue activity" });
		await expect(activity.locator('[data-slot="issue-comment-excerpt"]')).toHaveText("Check");
		await expect(activity.getByText("This line could mention keyboard focus.")).toBeVisible();

		await description.fill("A description that will be discarded.");
		await description.press("Escape");
		await expect(editDescription).toBeFocused();
		await expect(readOnlyBody).toContainText("Check focus restoration");
		await editDescription.press("Enter");
		await expect(description).toBeFocused();
		await description.fill("A description saved with the keyboard.");
		await description.press("Control+Enter");
		await expect(editDescription).toBeFocused();
		await expect(readOnlyBody).toHaveText("A description saved with the keyboard.");

		const status = detail.getByRole("button", { name: "Change status", exact: true });
		await status.press("Enter");
		const statusDialog = detail.getByRole("dialog", { name: "Change status" });
		await expect(statusDialog.getByRole("combobox")).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(status).toBeFocused();
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			width
		);
	});
}
