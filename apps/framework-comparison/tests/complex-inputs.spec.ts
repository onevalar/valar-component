import { expect, test } from "@playwright/test";

for (const [framework, base] of [
	["react", process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/"],
	["vue", process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/"],
]) {
	test(`${framework}: Command IME confirmation keeps the dialog open and normal Enter selects`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=command&theme=dark`);
		const opener = page.getByRole("button", { name: "Open commands" });
		await opener.click();
		const dialog = page.getByRole("dialog", { name: "Workspace commands" });
		const search = dialog.getByRole("combobox", { name: "Search commands" });
		await expect(search).toBeFocused();
		await search.fill("新建问题");
		await expect(dialog.getByRole("option", { name: "New issue" })).toBeVisible();
		await expect(dialog.getByRole("option", { name: "Archive workspace" })).toHaveCount(0);
		await search.dispatchEvent("keydown", { key: "Enter", isComposing: true, bubbles: true });
		await expect(dialog).toBeVisible();
		await search.press("Enter");
		await expect(dialog).toBeHidden();
		await expect(opener).toBeFocused();
		await expect(page.getByRole("status")).toHaveText("New issue selected");
	});

	test(`${framework}: Combobox separates highlight from selection and restores trigger focus`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=combobox`);
		const primary = page.getByRole("button", { name: /^Primary project/ });
		await primary.press("Enter");
		const search = page.getByRole("combobox");
		await expect(search).toBeFocused();
		await search.fill("发布");
		await expect(page.getByRole("option")).toHaveCount(1);
		await search.press("Enter");
		await expect(search).toBeHidden();
		await expect(primary).toHaveAccessibleName("Primary project: Launch plan");
		await expect(primary).toBeFocused();
		const related = page.getByRole("button", { name: /^Related projects:/ });
		await related.click();
		const launch = page.getByRole("option", { name: "Launch plan" });
		const design = page.getByRole("option", { name: "Design systems" });
		await expect(launch).toHaveAttribute("aria-selected", "true");
		await search.press("Home");
		await search.press("ArrowDown");
		await expect(search).toHaveAttribute(
			"aria-activedescendant",
			(await design.getAttribute("id"))!
		);
		await expect(design).toHaveAttribute("aria-selected", "false");
		await search.press("Enter");
		await expect(design).toHaveAttribute("aria-selected", "true");
		await expect(search).toBeFocused();
		await page.getByRole("button", { name: "Clear related projects" }).click();
		await expect(launch).toHaveAttribute("aria-selected", "false");
		await expect(design).toHaveAttribute("aria-selected", "false");
		await search.press("Escape");
		await expect(search).toBeHidden();
		await expect(page.getByRole("button", { name: "Related projects", exact: true })).toBeFocused();
	});

	test(`${framework}: native form associates its error, submits the corrected value and resets`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=forms`);
		const form = page.getByRole("form", { name: "Profile settings" });
		const name = form.getByRole("textbox", { name: "Display name" });
		const status = form.getByRole("status");
		await name.fill(" z ");
		await form.getByRole("button", { name: "Save profile" }).click();
		await expect(form.getByRole("alert")).toHaveText("Enter a display name of 2 to 50 characters.");
		await expect(name).toBeFocused();
		await expect(name).toHaveAccessibleDescription(
			"This name appears on your workspace profile. Enter a display name of 2 to 50 characters."
		);
		await expect(status).toBeEmpty();
		await name.fill("  Mira 梁  ");
		await name.press("Enter");
		await expect(status).toHaveText("Saved: Mira 梁");
		await expect(name).toHaveAttribute("aria-invalid", "false");
		await expect(form.getByRole("alert")).toHaveCount(0);
		await form.getByRole("button", { name: "Reset" }).click();
		await expect(name).toHaveValue("");
		await expect(status).toBeEmpty();
	});

	test(`${framework}: Date Picker rejects invalid days and accepts overlapping periods`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 580 });
		await page.goto(`${base}?example=date-picker&theme=dark`);
		const trigger = page.getByRole("button", { name: "Target date", exact: true });
		await trigger.press("Enter");
		const dialog = page.getByRole("dialog", { name: "Target date" });
		const date = dialog.getByRole("textbox", { name: "Enter date" });
		await expect(date).toBeFocused();
		await expect
			.poll(() =>
				dialog.getByRole("tab", { name: "Half-year" }).evaluate(async (tab) => {
					await document.fonts.ready;
					const range = document.createRange();
					range.selectNodeContents(tab);
					return range.getClientRects().length;
				})
			)
			.toBe(1);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
		await date.fill("2027-02-29");
		await date.press("Enter");
		await expect(dialog.getByRole("alert")).toHaveText("Enter a valid date.");
		await date.fill("2027-05-11");
		await date.press("Enter");
		await expect(dialog.getByRole("alert")).toHaveText(
			"Date cannot precede the earliest available date."
		);
		await date.fill("Q4 2027");
		await date.dispatchEvent("keydown", { key: "Enter", isComposing: true, bubbles: true });
		await expect(dialog).toBeVisible();
		await date.press("Enter");
		await expect(dialog).toBeHidden();
		await expect(trigger).toBeFocused();
		await expect(page.getByRole("status")).toHaveText("2027-10-01 · quarter");
		await trigger.click();
		await expect(dialog.getByRole("tab", { name: "Quarter" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		await dialog.getByRole("button", { name: "Clear date" }).click();
		await expect(trigger).toBeFocused();
		await expect(page.getByRole("status")).toHaveText("No target date");
	});

	test(`${framework}: Number Field commits localized drafts to the min-relative grid and submits a scalar`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=number-field`);
		const hours = page.getByRole("spinbutton", { name: "Estimated hours" });
		const status = page.getByRole("status");
		await expect(hours).toHaveValue("1,25");
		await hours.fill("-");
		await hours.press("Enter");
		await expect(hours).toHaveValue("-");
		await expect(hours).toHaveAttribute("aria-invalid", "true");
		await expect(status).toBeEmpty();
		await hours.fill("1,6");
		await hours.press("Enter");
		await expect(hours).toHaveValue("1,75");
		await expect(status).toHaveText("Submitted: 1.75");
		await page.getByRole("button", { name: "Reset" }).click();
		await expect(hours).toHaveValue("1,25");
		await hours.press("ArrowDown");
		await expect(hours).toHaveValue("0,75");
	});

	test(`${framework}: Slider Field preserves the thumb during rejected edits and shares accepted values`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=slider-field`);
		const input = page.getByRole("spinbutton", { name: "Row spacing" });
		const thumb = page.getByRole("slider", { name: "Row spacing" });
		const status = page.getByRole("status");
		await input.fill("-");
		await expect(thumb).toHaveAttribute("aria-valuenow", "18");
		await input.fill("76");
		await expect(status).toHaveText("18 pixels");
		await expect(input).toHaveAttribute("aria-invalid", "true");
		await input.press("Enter");
		await expect(thumb).toHaveAttribute("aria-valuenow", "54");
		await thumb.press("ArrowLeft");
		await expect(input).toHaveValue("51");
		await expect(status).toHaveText("51 pixels");
	});

	test(`${framework}: OTP uses one input and replaces the selected digits after paste`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=input-otp&theme=dark`);
		const region = page.getByRole("region", { name: "Account verification" });
		const code = region.getByRole("textbox", { name: "Verification code" });
		await expect(region.getByRole("textbox")).toHaveCount(1);
		await expect(code).toHaveAttribute("autocomplete", "one-time-code");
		await code.fill("025817");
		await code.evaluate((element: HTMLInputElement) => {
			element.setSelectionRange(1, 4);
			const clipboardData = new DataTransfer();
			clipboardData.setData("text/plain", "7-3 9");
			element.dispatchEvent(
				new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true })
			);
		});
		await expect(code).toHaveValue("073917");
		await expect(region.getByRole("status")).toHaveText("Code ready to verify");
		await code.press("Backspace");
		await expect(code).toHaveValue("07317");
		await expect(region.getByRole("status")).toBeEmpty();
	});

	test(`${framework}: Tags Input retains rejected tags and returns focus after removal`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=tags-input`);
		const input = page.getByRole("textbox", { name: "Labels" });
		await input.fill("Design");
		await input.press("Enter");
		await expect(input).toHaveValue("Design");
		await expect(page.getByText("This label already exists.")).toBeVisible();
		await input.fill("Docs");
		await input.dispatchEvent("keydown", { key: "Enter", isComposing: true, bubbles: true });
		const docs = page.getByRole("button", { name: "Remove Docs" });
		await expect(docs).toHaveCount(0);
		await input.press("Enter");
		await expect(docs).toBeVisible();
		await docs.click();
		await expect(input).toBeFocused();
		await expect(page.getByRole("button", { name: "Remove Design" })).toBeVisible();
		await expect(docs).toHaveCount(0);
	});

	test(`${framework}: Stepper blocks a skipped step, preserves data on back and focuses the new panel`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 360, height: 550 });
		await page.goto(`${base}?example=stepper&theme=dark`);
		await expect(page.getByRole("button", { name: "Done", exact: true })).toBeDisabled();
		const next = page.getByRole("button", { name: "Continue" });
		await next.press("Enter");
		await expect(page.getByRole("alert")).toHaveText("Enter at least two characters to continue.");
		const name = page.getByRole("textbox", { name: "Workspace name" });
		await name.fill("Design team");
		await next.press("Enter");
		const review = page.getByRole("region", { name: "Review" });
		await expect(review).toBeFocused();
		await expect(review.getByText("Workspace: Design team")).toBeVisible();
		await expect(page.getByRole("button", { name: "Review", exact: true })).toHaveAttribute(
			"aria-current",
			"step"
		);
		await review.getByRole("button", { name: "Back" }).click();
		await expect(name).toHaveValue("Design team");
	});

	test(`${framework}: Color Picker does not commit invalid HEX and retains focus on dismissal`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=color-picker`);
		const trigger = page.getByRole("button", { name: /^工作区强调色 #/ });
		await trigger.click();
		const panel = page.getByRole("dialog", { name: "工作区强调色" });
		const preset = panel.getByRole("button", { name: "#0f766e" });
		await preset.click();
		await expect(preset).toHaveAttribute("aria-pressed", "true");
		const hex = panel.getByRole("textbox", { name: "工作区强调色：十六进制" });
		await hex.fill("#n95");
		await expect(hex).toHaveAttribute("aria-invalid", "true");
		await expect(page.getByRole("status")).toHaveText("#0f766e");
		await hex.fill("#a3f");
		await hex.press("Enter");
		await expect(hex).toHaveValue("#aa33ff");
		await hex.press("Escape");
		await expect(panel).toBeHidden();
		await expect(trigger).toBeFocused();
		await expect(page.getByRole("status")).toHaveText("#aa33ff");
	});

	test(`${framework}: a narrow settings table keeps columns, keyboard scroll and row selection`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 550 });
		await page.goto(`${base}?example=table&theme=dark`);
		const scroll = page.getByRole("region", { name: "Scroll issue labels" });
		const table = scroll.getByRole("table", { name: "Workspace issue labels" });
		await expect(table.getByRole("columnheader", { name: "Name" })).toHaveCSS("height", "32px");
		await expect(table.getByRole("cell", { name: "Design", exact: true })).toHaveCSS(
			"height",
			"44px"
		);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
		await page.keyboard.press("Tab");
		await expect(scroll).toBeFocused();
		await page.keyboard.press("ArrowRight");
		await expect.poll(() => scroll.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
		const select = scroll.getByRole("checkbox", { name: "Select Design" });
		await select.press("Space");
		await expect(select).toBeChecked();
		const selection = page.getByRole("status");
		await expect(selection).toHaveText("1 of 2 labels selected");
		await expect(scroll.getByRole("status")).toHaveCount(0);
		await expect(scroll.getByRole("checkbox", { name: "Select Bug" })).not.toBeChecked();
	});

	test(`${framework}: Data Table composes sort, filter, stable selection, pagination and column visibility`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 840, height: 640 });
		await page.goto(`${base}?example=data-table`);
		const email = page.getByRole("columnheader", { name: "Sort by email" });
		const row = (address: string) => page.getByRole("cell", { name: address, exact: true });
		await expect(row("mira@example.com")).toBeVisible();
		await page.getByRole("button", { name: "Sort by email" }).press("Enter");
		await expect(email).toHaveAttribute("aria-sort", "ascending");
		await expect(row("lin@example.com")).toBeVisible();
		await expect(row("mira@example.com")).toHaveCount(0);
		await page.getByRole("checkbox", { name: "Select abe@example.com" }).check();
		await expect(page.getByRole("checkbox", { name: "Select this page" })).toHaveAttribute(
			"aria-checked",
			"mixed"
		);
		await page.getByRole("button", { name: "Next page" }).click();
		await expect(row("zoe@example.com")).toBeVisible();
		await expect(page.getByRole("status")).toHaveText("1 selected");
		await page.getByRole("button", { name: "Previous page" }).click();
		await expect(page.getByRole("checkbox", { name: "Select abe@example.com" })).toBeChecked();
		await page.getByRole("checkbox", { name: "Show amount" }).uncheck();
		await expect(page.getByRole("columnheader", { name: "Amount" })).toHaveCount(0);
		const filter = page.getByRole("textbox", { name: "Filter by email" });
		await filter.fill("zoe");
		await expect(row("zoe@example.com")).toBeVisible();
		await expect(row("lin@example.com")).toHaveCount(0);
		await filter.fill("missing");
		await expect(page.getByText("No matching payments")).toBeVisible();
		await page.getByRole("button", { name: "Clear filter" }).click();
		await expect(filter).toHaveValue("");
		await expect(row("abe@example.com")).toBeVisible();
	});
}
