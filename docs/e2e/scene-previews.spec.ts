import { expect, test, type Locator, type Page } from "@playwright/test";

async function expectInsideViewport(element: Locator) {
	await expect(element).toBeVisible();
	await expect
		.poll(() =>
			element.evaluate((node) => {
				const { top, right, bottom, left } = node.getBoundingClientRect();
				return left >= -1 && right <= innerWidth + 1 && top >= -1 && bottom <= innerHeight + 1;
			})
		)
		.toBe(true);
}

async function openAndDismiss(page: Page, trigger: Locator, popup: Locator, focus?: Locator) {
	await trigger.press("Enter");
	await expectInsideViewport(popup);
	if (focus) await expect(focus).toBeFocused();
	await page.keyboard.press("Escape");
	await expect(popup).toBeHidden();
	await expect(trigger).toBeFocused();
}

const path = "/zh/themes";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [375, 1280]) {
		test.describe(`${colorScheme} · ${width}px`, () => {
			test.beforeEach(async ({ page }) => {
				await page.setViewportSize({ width, height: 900 });
				await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			});
			test.afterEach(async ({ page }) => {
				expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
			});

			test("Settings preserves row spacing and opens the theme menu within the viewport", async ({
				page,
			}) => {
				await page.goto(`${path}/settings`);
				const trigger = page.getByRole("combobox", { name: "界面主题", exact: true });
				const row = page.locator('[data-slot="field"]').filter({ has: trigger });
				const card = page.locator('[data-slot="card"]').filter({ has: row });
				await expect(trigger).toHaveCSS("height", "30px");
				await expect(row).toHaveCSS("padding-inline-start", "16px");
				await expect(row).toHaveCSS("padding-inline-end", "16px");
				await expect(row).toHaveCSS("gap", "12px");
				const description = row.getByText("选择偏好选项。");
				const [fieldBox, triggerBox] = await Promise.all([
					description.boundingBox(),
					trigger.boundingBox(),
				]);
				expect(fieldBox).not.toBeNull();
				expect(triggerBox).not.toBeNull();
				const gap =
					width < 768
						? triggerBox!.y - fieldBox!.y - fieldBox!.height
						: triggerBox!.x - fieldBox!.x - fieldBox!.width;
				expect(gap).toBeGreaterThanOrEqual(11);
				const themes = {
					light: {
						label: "浅色",
						card: "rgb(255, 255, 255)",
						menu: "rgb(255, 255, 255)",
						border: "lch(86.5 0 282)",
					},
					dark: {
						label: "深色",
						card: "lch(9.232 0.85 272)",
						menu: "lch(16.433 1.3 272)",
						border: "lch(38.032 2.38 272)",
					},
				};
				const current = themes[colorScheme];
				const next = themes[colorScheme === "light" ? "dark" : "light"];
				await expect(card).toHaveCSS("background-color", current.card);
				const options = page.getByRole("listbox");
				await openAndDismiss(page, trigger, options);
				await trigger.press("Enter");
				await expect(options).toHaveCSS("background-color", current.menu);
				await expect(options).toHaveCSS("border-top-color", current.border);
				await options.getByRole("option", { name: next.label, exact: true }).click();
				await expect(trigger).toBeFocused();
				await expect(card).toHaveCSS("background-color", next.card);
				await expect(page.locator("html")).toHaveCSS("color-scheme", colorScheme);
				await trigger.press("Enter");
				await expectInsideViewport(options);
				await expect(options).toHaveCSS("background-color", next.menu);
				await expect(options).toHaveCSS("border-top-color", next.border);
				await page.keyboard.press("Escape");
				await expect(trigger).toBeFocused();
			});

			test("My issues restores filter and issue detail focus", async ({ page }) => {
				await page.goto(`${path}/my-issues`);
				const filter = page.getByRole("button", { name: "添加筛选", exact: true });
				const popup = page.getByRole("dialog", { name: "筛选问题" });
				await openAndDismiss(page, filter, popup, popup.getByRole("combobox"));
				const issue = page.getByRole("button", { name: /VLR-103/ });
				await issue.press("Enter");
				const detail = page.getByRole("region", { name: "问题详情" });
				await expect(detail.getByRole("heading", { name: "补齐命令菜单的键盘导航" })).toBeFocused();
				await detail.getByRole("button", { name: "编辑标题" }).press("Enter");
				const title = detail.getByRole("textbox", { name: "问题标题" });
				await expect(title).toBeFocused();
				await title.press("Escape");
				await expect(detail.getByRole("button", { name: "编辑标题" })).toBeFocused();
				await detail.getByRole("button", { name: "返回我的问题" }).press("Enter");
				await expect(issue).toBeFocused();
			});

			test("New Issue keeps its editor and actions separated and returns focus through two layers", async ({
				page,
			}) => {
				await page.goto(`${path}/new-issue`);
				const opener = page.getByRole("button", { name: "新建问题", exact: true });
				await opener.press("Enter");
				const dialog = page.getByRole("dialog", { name: "新建问题", exact: true });
				await expectInsideViewport(dialog);
				const title = dialog.getByRole("textbox", { name: "标题", exact: true });
				const description = dialog.getByRole("textbox", { name: "描述", exact: true });
				const submit = dialog.getByRole("button", { name: "创建问题", exact: true });
				await expect(title).toBeFocused();
				await expect(submit).toHaveCSS("height", "28px");
				const titleBox = (await title.boundingBox())!;
				const descriptionBox = (await description.boundingBox())!;
				const submitBox = (await submit.boundingBox())!;
				expect(descriptionBox.y - titleBox.y - titleBox.height).toBeGreaterThanOrEqual(5);
				expect(submitBox.y).toBeGreaterThan(descriptionBox.y + descriptionBox.height);
				const status = dialog.getByRole("button", { name: /^状态 ·/ });
				const options = page.getByRole("dialog", { name: "状态", exact: true });
				await openAndDismiss(page, status, options, options.getByRole("combobox"));
				await page.keyboard.press("Escape");
				await expect(dialog).toBeHidden();
				await expect(opener).toBeFocused();
			});

			test("Projects keeps the date panel in the viewport and restores focus to the form", async ({
				page,
			}) => {
				await page.goto(`${path}/projects`);
				const opener = page.getByRole("button", { name: "新建项目", exact: true });
				await opener.press("Enter");
				const form = page.getByRole("dialog", { name: "新建项目", exact: true });
				await expectInsideViewport(form);
				const name = form.getByRole("textbox", { name: "项目名称" });
				await expect(name).toBeFocused();
				const date = form.getByRole("button", { name: "开始日期" });
				const datePanel = page.getByRole("dialog", { name: "开始日期" });
				await openAndDismiss(page, date, datePanel, datePanel.getByRole("textbox"));
				await page.keyboard.press("Escape");
				await expect(form).toBeHidden();
				await expect(opener).toBeFocused();
			});

			test("Inbox and Agent keep toolbar menus within the viewport and restore focus", async ({
				page,
			}) => {
				await page.goto(`${path}/inbox`);
				const inbox = page.getByRole("region", { name: "通知中心" });
				const inboxMenu = inbox.getByRole("menu");
				await openAndDismiss(
					page,
					inbox.getByRole("button", { name: "通知操作", exact: true }),
					inboxMenu,
					inboxMenu.getByRole("menuitem", { name: "搜索通知" })
				);
				await page.goto(`${path}/agent`);
				const agent = page.getByRole("region", { name: "Agent 对话" });
				const agentMenu = agent.getByRole("menu");
				await openAndDismiss(
					page,
					agent.getByRole("button", { name: "添加附件", exact: true }),
					agentMenu,
					agentMenu.getByRole("menuitem", { name: "文件" })
				);
			});

			test("Palette can switch appearance and display the current theme tokens", async ({
				page,
			}) => {
				await page.goto(`${path}/palette`);
				const mode = page.getByRole("group", { name: "预览模式" });
				const preview = page.getByRole("region", { name: "中性色组件预览" });
				const surface = () => preview.evaluate((node) => getComputedStyle(node).backgroundColor);
				await mode.getByRole("button", { name: "浅色" }).press("Enter");
				const light = await surface();
				await mode.getByRole("button", { name: "深色" }).press("Enter");
				expect(await surface()).not.toBe(light);
				const defaults = page.getByRole("tab", { name: "当前默认主题" });
				await defaults.press("Enter");
				await expect(defaults).toHaveAttribute("aria-selected", "true");
				await expect(
					page.getByRole("tabpanel").getByRole("button", { name: /--background/ })
				).toBeVisible();
			});
		});
	}
}
