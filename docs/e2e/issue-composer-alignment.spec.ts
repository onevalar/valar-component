import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Issue Composer properties, rich drafts and overlay scroll at 390 px in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/issue-composer");
		const opener = page.locator(".preview").getByRole("button", { name: "New issue", exact: true });
		await opener.press("Enter");
		const composer = page.getByRole("dialog", { name: "New issue", exact: true });
		const title = composer.getByRole("textbox", { name: "Title", exact: true });
		const description = composer.getByRole("textbox", { name: "Description", exact: true });
		const body = composer.getByRole("region", { name: "Form fields", exact: true });
		const submit = composer.getByRole("button", { name: "Create issue", exact: true });
		await expect(title).toBeFocused();
		await expect(description).toHaveCSS("font-size", "15px");
		await expect(description).toHaveCSS("line-height", "22.5px");
		await expect(composer).toHaveCSS(
			"background-color",
			colorScheme === "light" ? "lch(100 0 282)" : "lch(9.232 0.85 272)"
		);
		await title.fill("Draft check");

		await description.press("/");
		const blockMenu = page.getByRole("dialog", { name: "Insert block", exact: true });
		const blockSearch = blockMenu.getByRole("combobox");
		await expect(blockSearch).toBeFocused();
		await blockSearch.fill("Code block");
		await blockSearch.press("Enter");
		await expect(blockMenu).toBeHidden();
		await expect(description).toBeFocused();
		await page.keyboard.insertText("const sample = 42;");
		await expect(description.locator("pre code")).toHaveText("const sample = 42;");

		const team = composer.getByRole("button", { name: /^Set team ·/ });
		await expect(team).toHaveCSS("height", "24px");
		await team.press("Enter");
		const teamSearch = page
			.getByRole("dialog", { name: "Set team", exact: true })
			.getByRole("combobox");
		await expect(teamSearch).toBeFocused();
		await teamSearch.fill("Operations");
		await teamSearch.press("Enter");
		await expect(team).toHaveAccessibleName("Set team · Operations");
		await expect(team).toBeFocused();
		const assignee = composer.getByRole("button", { name: /^Assignee ·/ });
		await assignee.press("Enter");
		const assigneeMenu = page.getByRole("dialog", { name: "Assignee", exact: true });
		const assigneeSearch = assigneeMenu.getByRole("combobox");
		await expect(assigneeSearch).toBeFocused();
		await expect(
			assigneeMenu.getByRole("option", { name: "No assignee", exact: true })
		).toBeVisible();
		await expect(assigneeMenu.getByRole("option", { name: "Jordan", exact: true })).toHaveCount(0);
		await assigneeSearch.fill("Morgan");
		await assigneeSearch.press("Enter");
		await expect(assignee).toHaveAccessibleName("Assignee · Morgan");

		const project = composer.getByRole("button", { name: /^Project ·/ });
		await project.press("Enter");
		const projectSearch = page
			.getByRole("dialog", { name: "Project", exact: true })
			.getByRole("combobox");
		await projectSearch.fill("Launch");
		await projectSearch.press("Enter");
		await expect(project).toHaveAccessibleName("Project · Launch");

		const labels = composer.getByRole("button", { name: /^Labels ·/ });
		await labels.press("Enter");
		const labelsMenu = page.getByRole("dialog", { name: "Labels", exact: true });
		const labelSearch = labelsMenu.getByRole("combobox");
		await expect(labelSearch).toBeFocused();
		for (const name of ["Bug", "Feedback"]) {
			await labelSearch.fill(name);
			await labelSearch.press("Enter");
			await expect(labelsMenu).toBeVisible();
			await expect(labelsMenu.getByRole("option", { name, exact: true })).toHaveAttribute(
				"aria-checked",
				"true"
			);
		}
		await labelSearch.press("Escape");
		await expect(labelsMenu).toBeHidden();
		await expect(labels).toBeFocused();
		await expect(labels).toHaveAccessibleName("Labels · Bug, Feedback");

		const close = composer.getByRole("button", { name: "Close", exact: true });
		await close.press("Enter");
		const confirm = page.getByRole("alertdialog", { name: "Save to drafts?", exact: true });
		const save = confirm.getByRole("button", { name: "Save", exact: true });
		await expect(save).toBeFocused();
		await confirm.getByRole("button", { name: "Cancel", exact: true }).press("Enter");
		await expect(confirm).toBeHidden();
		await expect(close).toBeFocused();
		await close.press("Enter");
		await save.press("Enter");
		await expect(composer).toBeHidden();
		await expect(opener).toBeFocused();
		await expect(page.getByRole("status").filter({ hasText: "Draft saved" })).toHaveText(
			"Draft saved · Draft check"
		);
		await opener.press("Enter");
		await expect(title).toHaveValue("Draft check");
		await expect(description.locator("pre code")).toHaveText("const sample = 42;");
		await expect(labels).toHaveAccessibleName("Labels · Bug, Feedback");

		await description.press("End");
		await page.keyboard.insertText(
			Array.from({ length: 40 }, (_, index) => `\nLine ${index}`).join("")
		);
		await expect
			.poll(() => body.evaluate((element) => element.scrollHeight - element.clientHeight))
			.toBeGreaterThan(0);
		await expect(body).toHaveCSS("scrollbar-width", "none");
		await expect(submit).toBeInViewport();
		const initialWidth = await body.evaluate((element) => element.clientWidth);
		const rail = body.locator("..").locator(':scope > [data-slot="scroll-area-scrollbar"]');
		await body.hover();
		await expect(rail).toBeVisible();
		await expect(rail).toHaveCSS("position", "absolute");
		expect(await body.evaluate((element) => element.clientWidth)).toBe(initialWidth);
		await body.press("Home");
		await expect.poll(() => body.evaluate((element) => element.scrollTop)).toBe(0);
		await body.press("End");
		await expect.poll(() => body.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
		await expect(submit).toBeInViewport();
		await submit.press("Enter");
		await expect(opener).toBeFocused();
		await expect(page.locator(".preview").getByRole("status")).toHaveText("Created · Draft check");
		await expect(
			page.getByText("Operations · Morgan · Launch · Bug · Feedback", { exact: true })
		).toBeVisible();
	});
}

test("composer slash actions reuse the attachment chooser and preserve checklist state in a draft", async ({
	page,
}) => {
	await page.setViewportSize({ width: 320, height: 602 });
	await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
	await page.goto("/docs/components/issue-composer");
	const opener = page.locator(".preview").getByRole("button", { name: "New issue", exact: true });
	const composer = page.getByRole("dialog", { name: "New issue", exact: true });
	const description = composer.getByRole("textbox", { name: "Description", exact: true });
	const blockSearch = page
		.getByRole("dialog", { name: "Insert block", exact: true })
		.getByRole("combobox");
	await opener.press("Enter");
	await composer.getByRole("textbox", { name: "Title", exact: true }).fill("Checklist draft");
	await description.press("/");
	await expect(blockSearch).toBeFocused();
	await blockSearch.fill("Attach files");
	const [chooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		blockSearch.press("Enter"),
	]);
	await chooser.setFiles({
		name: "sample.txt",
		mimeType: "text/plain",
		buffer: Buffer.from("Sample"),
	});
	await expect(composer.getByRole("list", { name: "Attachments" })).toContainText("sample.txt");
	await expect(description).toBeFocused();
	await description.press("/");
	await blockSearch.fill("Checklist");
	await blockSearch.press("Enter");
	await expect(description).toBeFocused();
	await page.keyboard.insertText("Verify alignment");
	const checkbox = description.getByRole("checkbox", { name: "Checklist item Verify alignment" });
	await checkbox.press("Space");
	await expect(checkbox).toBeChecked();
	const close = composer.getByRole("button", { name: "Close", exact: true });
	const confirm = page.getByRole("alertdialog", { name: "Save to drafts?", exact: true });
	await close.press("Enter");
	await confirm.getByRole("button", { name: "Save", exact: true }).press("Enter");
	await opener.press("Enter");
	await expect(checkbox).toBeChecked();
	const remove = composer.getByRole("button", {
		name: "Remove attachment sample.txt",
		exact: true,
	});
	await remove.press("Enter");
	await expect(remove).toBeHidden();
	await expect(composer.getByRole("button", { name: "Add attachment", exact: true })).toBeFocused();
	await close.press("Enter");
	await confirm.getByRole("button", { name: "Discard", exact: true }).press("Enter");
	await opener.press("Enter");
	await expect(checkbox).toBeHidden();
	await expect(composer.getByRole("textbox", { name: "Title", exact: true })).toHaveValue("");
});
