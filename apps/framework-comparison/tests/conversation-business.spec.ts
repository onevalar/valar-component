import { expect, test } from "@playwright/test";

for (const [framework, base] of [
	["react", process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/"],
	["vue", process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/"],
] as const) {
	test(`${framework}: attachment cancellation does not open its separate card preview`, async ({ page }) => {
		await page.goto(`${base}?example=attachment&theme=dark`);
		const cancel = page.getByRole("button", { name: "Cancel upload" });
		const preview = page.getByRole("button", { name: "Preview project notes" });
		await cancel.click();
		await expect(page.getByText("Upload cancelled")).toBeVisible();
		await expect(cancel).toBeDisabled();
		await preview.focus();
		await preview.press("Enter");
		await expect(page.getByText("Local preview opened")).toBeVisible();
	});

	test(`${framework}: a trace disclosure exposes failure details by keyboard`, async ({ page }) => {
		await page.goto(`${base}?example=trace`);
		const trigger = page.getByRole("button", { name: "Unable to load appendix" });
		const details = page.getByText("The file was not included in the local draft.");
		await expect(details).toBeHidden();
		await trigger.press("Enter");
		await expect(trigger).toHaveAttribute("aria-expanded", "true");
		await expect(details).toBeVisible();
		await trigger.press("Space");
		await expect(details).toBeHidden();
		await expect(trigger).toBeFocused();
	});

	test(`${framework}: a streamed reply does not steal the scroll position of someone reading history`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto(`${base}?example=message-scroller`);
		const viewport = page.getByRole("region", { name: "Transcript" });
		const distanceFromLatest = () => viewport.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop);
		await expect.poll(distanceFromLatest).toBeLessThan(2);
		const append = page.getByRole("button", { name: "Append reply" });
		await append.click();
		await expect(viewport.getByText("What changed this week?")).toBeInViewport();
		await viewport.hover();
		await page.mouse.wheel(0, -2000);
		const offset = () => viewport.evaluate((el) => el.scrollTop);
		await expect.poll(offset).toBe(0);
		await append.click();
		await expect(viewport.getByText(/Reply part 2/)).toHaveCount(1);
		await expect.poll(offset).toBe(0);
		await page.getByRole("button", { name: "Jump to latest" }).click();
		await expect.poll(distanceFromLatest).toBeLessThan(2);
		await expect(viewport.getByText(/Reply part 2/)).toBeInViewport();
	});

	test(`${framework}: questionnaire keeps a required answer when revisiting and skips optional text`, async ({ page }) => {
		await page.goto(`${base}?example=questionnaire`);
		const next = page.getByRole("button", { name: "Continue" });
		await next.click();
		await expect(page.getByText("Choose a format to continue.")).toBeVisible();
		await page.getByRole("radio", { name: "Checklist" }).check();
		await next.click();
		const notes = page.getByRole("textbox", { name: "Release notes emphasis" });
		await expect(notes).toBeVisible();
		await page.getByRole("button", { name: "Back" }).click();
		await expect(page.getByRole("radio", { name: "Checklist" })).toBeChecked();
		await next.click();
		await page.getByRole("button", { name: "Skip" }).click();
		await expect(page.getByLabel("Submitted answers")).toHaveText("checklist");
	});

	test(`${framework}: composer validates an empty title, returns focus, and emits the new issue`, async ({ page }) => {
		await page.goto(`${base}?example=issue-composer`);
		const opener = page.getByRole("button", { name: "New issue" });
		await opener.click();
		const dialog = page.getByRole("dialog");
		const title = dialog.getByPlaceholder("Issue title");
		const create = dialog.getByRole("button", { name: "Create issue" });
		await create.click();
		await expect(title).toBeFocused();
		await expect(title).toHaveAttribute("aria-invalid", "true");
		await title.fill("  Verify desktop shortcuts  ");
		await create.click();
		await expect(dialog).toBeHidden();
		await expect(opener).toBeFocused();
		await expect(page.getByRole("list", { name: "Created issues" })).toContainText("Verify desktop shortcuts · backlog · 0 files");
	});

	test(`${framework}: issue detail keeps canceled title changes and applies a host-owned rename`, async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 640 });
		await page.goto(`${base}?example=issue-detail&theme=dark`);
		const edit = page.getByRole("button", { name: "Edit title" });
		await edit.click();
		const title = page.getByRole("textbox", { name: "Issue title" });
		await expect(title).toBeFocused();
		await title.fill("Discard changes");
		await title.press("Escape");
		await expect(page.getByRole("heading", { name: "Review the release notes" })).toBeVisible();
		await expect(edit).toBeFocused();
		await edit.press("Enter");
		await title.fill("Review the accessibility checklist");
		await page.getByRole("button", { name: "Save" }).click();
		await expect(page.getByRole("heading", { name: "Review the accessibility checklist" })).toBeVisible();
		await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});
}
