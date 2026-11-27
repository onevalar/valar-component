import { expect, test } from "@playwright/test";

for (const [framework, base] of [
	["react", process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/"],
	["vue", process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/"],
]) {
	test.describe(`${framework} navigation and overlays`, () => {
		const fixture = (slug: string, theme = "light") => `${base}?example=${slug}&theme=${theme}`;

		test("confirmation focuses Cancel and changes data only on commit", async ({ page }) => {
			await page.setViewportSize({ width: 320, height: 560 });
			await page.goto(fixture("alert-dialog", "dark"));
			const trigger = page.getByRole("button", { name: "Delete draft" });
			const dialog = page.getByRole("alertdialog", { name: "Delete the launch checklist draft?" });
			const cancel = dialog.getByRole("button", { name: "Cancel" });
			await trigger.press("Enter");
			await expect(cancel).toBeFocused();
			await page.mouse.click(4, 4);
			await expect(dialog).toBeVisible();
			await cancel.press("Enter");
			await expect(dialog).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect(page.getByRole("status")).toContainText("Unpublished draft");
			await trigger.press("Enter");
			await expect(cancel).toBeFocused();
			await dialog.getByRole("button", { name: "Delete draft" }).press("Enter");
			await expect(page.getByRole("status")).toHaveText("Launch checklist draft deleted.");
		});

		test("context Escape unwinds one submenu, while a dropdown check keeps the menu open", async ({
			page,
		}) => {
			await page.setViewportSize({ width: 320, height: 520 });
			await page.goto(fixture("context-menu", "dark"));
			const issue = page.getByRole("group", { name: "Issue VAL-42" });
			await issue.press("Shift+F10");
			const move = page.getByRole("menuitem", { name: "Move to", exact: true });
			await move.press("ArrowRight");
			const done = page.getByRole("menuitem", { name: "Done", exact: true });
			await expect(done).toBeVisible();
			const box = (await done.boundingBox())!;
			expect(box.x).toBeGreaterThanOrEqual(0);
			expect(box.x + box.width).toBeLessThanOrEqual(320);
			await done.press("Escape");
			await expect(done).toBeHidden();
			await expect(move).toBeFocused();
			await move.press("Escape");
			await expect(issue).toBeFocused();

			await page.goto(fixture("dropdown-menu"));
			const trigger = page.getByRole("button", { name: "View options" });
			await trigger.press("Enter");
			const option = page.getByRole("menuitemcheckbox", { name: "Show completed" });
			await expect(option).toHaveAttribute("aria-checked", "false");
			await option.press("Space");
			await expect(option).toHaveAttribute("aria-checked", "true");
			await page.getByRole("menuitem", { name: "Refresh issues" }).press("Enter");
			await expect(option).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect(page.getByText("Confirm launch date")).toBeVisible();
		});

		test("profile link opens a preview, keyboard switches Menubar siblings and Navigation marks the current link", async ({
			page,
		}) => {
			await page.setViewportSize({ width: 320, height: 560 });
			await page.goto(fixture("hover-card"));
			const profile = page.getByRole("link", { name: "Jordan Davis" });
			await profile.focus();
			await expect(page.locator('[data-slot="hover-card-content"]')).toContainText(
				"Design Systems · Project lead"
			);
			await expect(profile).toHaveAttribute("href", /^#/);
			await page.goto(fixture("menubar"));
			await page.getByRole("menubar").getByRole("menuitem", { name: "File" }).press("ArrowDown");
			const create = page.getByRole("menuitem", { name: "New note" });
			await expect(create).toBeFocused();
			await create.press("ArrowRight");
			await expect(page.getByRole("menuitemcheckbox", { name: "Show outline" })).toBeVisible();
			await page.goto(fixture("navigation-menu", "dark"));
			const nav = page.getByRole("navigation", { name: "Workspace navigation" });
			await expect(nav.getByRole("link", { name: "Overview" })).toHaveAttribute(
				"aria-current",
				"page"
			);
			await nav.getByRole("button", { name: "Projects" }).press("Enter");
			await expect(nav.getByRole("link", { name: "All projects" })).toBeVisible();
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
		});

		test("Sheet traps focus only when modal and restores it from either mode", async ({ page }) => {
			await page.setViewportSize({ width: 320, height: 560 });
			await page.goto(fixture("sheet", "dark"));
			const modalTrigger = page.getByRole("button", { name: "Open project details" });
			const inlineTrigger = page.getByRole("button", { name: "Project activity" });
			await inlineTrigger.click();
			const region = page.getByRole("region", { name: "Project activity" });
			await modalTrigger.press("Escape");
			await expect(region).toBeVisible();
			await region.getByRole("button", { name: "Pin update" }).press("Escape");
			await expect(region).toBeHidden();
			await expect(inlineTrigger).toBeFocused();
			await modalTrigger.press("Enter");
			const dialog = page.getByRole("dialog", { name: "Project details" });
			await expect(dialog).toHaveAccessibleDescription("Launch plan for the Design Systems team.");
			const focusInside = () =>
				dialog.evaluate((element) => element.contains(document.activeElement));
			await expect.poll(focusInside).toBe(true);
			for (let step = 0; step < 3; step++) {
				await page.keyboard.press("Tab");
				expect(await focusInside()).toBe(true);
			}
			await page.keyboard.press("Escape");
			await expect(dialog).toBeHidden();
			await expect(modalTrigger).toBeFocused();
		});

		test("sidebar gives the main content room without taking editor shortcuts", async ({
			page,
		}) => {
			await page.setViewportSize({ width: 900, height: 640 });
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.goto(fixture("sidebar"));
			const trigger = page.getByRole("button", { name: "Toggle workspace navigation" });
			const issue = page
				.getByRole("navigation", { name: "Workspace" })
				.getByRole("link", { name: "My issues" });
			const main = page.getByRole("main");
			await expect(issue).toHaveAttribute("aria-current", "page");
			await expect(issue).toHaveCSS("height", "28px");
			await expect(issue).toHaveCSS("column-gap", "6px");
			const inset = (await main.boundingBox())!.x;
			await expect(trigger).toHaveAttribute("aria-expanded", "true");

			await page.getByRole("button", { name: "Refresh issues" }).press("Enter");
			await expect(main.getByRole("status")).toHaveText("Issues refreshed (1)");

			for (const editor of ["Issue title", "Issue notes"]) {
				const field = page.getByRole("textbox", { name: editor });
				await field.focus();
				const notCanceled = await field.evaluate((element) =>
					(element.querySelector("span") ?? element).dispatchEvent(
						new KeyboardEvent("keydown", {
							key: "b",
							ctrlKey: true,
							bubbles: true,
							cancelable: true,
						})
					)
				);
				expect(notCanceled).toBe(true);
				await expect(trigger).toHaveAttribute("aria-expanded", "true");
			}
			expect(
				(await page.context().cookies()).find(({ name }) => name === "sidebar_state")
			).toBeUndefined();
			await trigger.press("Control+b");
			await expect(trigger).toHaveAttribute("aria-expanded", "false");
			await expect.poll(async () => inset - (await main.boundingBox())!.x).toBeGreaterThan(110);
			await expect(page.locator('[data-sidebar="menu-badge"]')).toBeHidden();
			await issue.focus();
			const tooltip = page.locator('[data-slot="tooltip-content"]');
			await expect(tooltip).toBeVisible();
			await expect(issue).toHaveAccessibleDescription("My issues");
			const tipBox = (await tooltip.boundingBox())!;
			const titleBox = (await main
				.locator("label")
				.filter({ hasText: "Issue title" })
				.boundingBox())!;
			expect(tipBox.y + tipBox.height).toBeLessThanOrEqual(titleBox.y);
			expect(
				(await page.context().cookies()).find(({ name }) => name === "sidebar_state")?.value
			).toBe("false");

			await page.getByRole("checkbox", { name: "Enable sidebar keyboard shortcut" }).uncheck();
			await trigger.press("Control+b");
			await expect(trigger).toHaveAttribute("aria-expanded", "false");
			expect(
				(await page.context().cookies()).find(({ name }) => name === "sidebar_state")?.value
			).toBe("false");
			await trigger.press("Space");
			await expect(trigger).toHaveAttribute("aria-expanded", "true");
		});

		test("mobile sidebar is named, fits the screen and restores its opener", async ({ page }) => {
			await page.setViewportSize({ width: 320, height: 640 });
			await page.goto(fixture("sidebar", "dark"));
			const trigger = page.getByRole("button", { name: "Toggle workspace navigation" });
			await expect(trigger).toHaveAttribute("aria-expanded", "false");
			await trigger.press("Enter");
			const dialog = page.getByRole("dialog", { name: "Workspace navigation" });
			await expect(dialog).toBeVisible();
			await expect(dialog).toHaveAccessibleDescription("Jump between your issues and inbox.");
			await expect(dialog).toHaveCSS("width", "288px");
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
			const inbox = dialog.getByRole("link", { name: "Inbox" });
			await inbox.press("Enter");
			await expect(inbox).toHaveAttribute("aria-current", "page");
			await page.keyboard.press("Escape");
			await expect(dialog).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect(trigger).toHaveAttribute("aria-expanded", "false");
			expect(
				(await page.context().cookies()).find(({ name }) => name === "sidebar_state")
			).toBeUndefined();
		});

		test("drawer supports keyboard focus and directional drag dismissal", async ({ page }) => {
			await page.setViewportSize({ width: 390, height: 700 });
			await page.goto(fixture("drawer"));
			const open = page.getByRole("button", { name: "Open filters", exact: true });
			await open.press("Enter");
			const bottom = page.getByRole("dialog", { name: "Issue filters" });
			await expect(bottom).toBeVisible();
			await expect(bottom).toHaveAccessibleDescription("Choose the issue groups to show.");
			await expect
				.poll(() => bottom.evaluate((element) => element.contains(document.activeElement)))
				.toBe(true);
			const handle = bottom.locator('[data-slot="drawer-handle"]');
			await expect(handle).toBeVisible();
			await expect
				.poll(async () => {
					const box = (await bottom.boundingBox())!;
					return Math.round(box.y + box.height);
				})
				.toBe(700);
			const box = (await handle.boundingBox())!;
			const x = box.x + box.width / 2;
			const y = box.y + box.height / 2;
			await page.mouse.move(x, y);
			await page.mouse.down();
			await page.mouse.move(x, Math.min(y + 190, 699), { steps: 12 });
			await page.mouse.up();
			await expect(bottom).toBeHidden();
			await expect(open).toBeFocused();

			const activity = page.getByRole("button", { name: "Open activity" });
			await activity.click();
			const right = page.getByRole("dialog", { name: "Recent activity" });
			await expect(right).toBeVisible();
			await expect(right.locator('[data-slot="drawer-handle"]')).toBeHidden();
			await right.getByRole("button", { name: "Close activity" }).press("Enter");
			await expect(right).toBeHidden();
			await expect(activity).toBeFocused();
		});

		test("notifications replace by ID, expose Undo and follow the live theme", async ({ page }) => {
			await page.setViewportSize({ width: 320, height: 640 });
			await page.goto(fixture("sonner"));
			const archive = page.getByRole("button", { name: "Archive issue" });
			await archive.click();
			await archive.click();
			const notice = page.locator("[data-sonner-toast]").filter({ hasText: "Issue archived" });
			await expect(notice).toHaveCount(1);
			await expect(page.getByText("Workspace filters · Archived")).toBeVisible();
			await expect(notice).toHaveCSS("border-radius", "12px");
			const toaster = page.locator("[data-sonner-toaster]");
			await expect(toaster).toHaveAttribute("data-sonner-theme", "light");
			await page.evaluate(() => document.documentElement.classList.add("dark"));
			await expect(toaster).toHaveAttribute("data-sonner-theme", "dark");
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
			await notice.getByRole("button", { name: "Undo" }).click();
			await expect(page.getByText("Workspace filters · Open")).toBeVisible();
			await expect(notice).toBeHidden();
		});
	});
}
