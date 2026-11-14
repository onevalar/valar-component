import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:5190" });

test("workspace consumer preserves public interactions without the docs runtime", async ({
	page,
}) => {
	const errors: string[] = [];
	const requests: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	page.on("request", (request) => requests.push(request.url()));
	await page.goto("/", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "增加计数", exact: true }).click();
	await expect(page.getByText("本地计数：1", { exact: true })).toBeVisible();
	await page.getByRole("textbox", { name: "你的称呼" }).fill("联动项目");
	const trigger = page.getByRole("button", { name: "打开验证对话框" });
	await trigger.click();
	const dialog = page.getByRole("dialog", { name: "焦点与键盘验证" });
	await expect(dialog).toContainText("你好，联动项目。本地计数为 1。");
	for (let i = 0; i < 3; i++) {
		await page.keyboard.press("Tab");
		await expect
			.poll(() => dialog.evaluate((node) => node.contains(document.activeElement)))
			.toBe(true);
	}
	await page.keyboard.press("Escape");
	await expect(dialog).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await trigger.click();
	await page.getByRole("button", { name: "关闭对话框", exact: true }).click();
	await expect(trigger).toBeFocused();
	await page.getByRole("button", { name: "提交答案", exact: true }).click();
	await expect(page.getByText("请选择一个答案后继续。", { exact: true })).toBeVisible();
	const result = page.getByRole("region", { name: "问卷与原语依赖" }).getByRole("status");
	await expect(result).toHaveText("尚未提交");
	await page.getByRole("radio", { name: "主题样式", exact: true }).check();
	await page.getByRole("button", { name: "提交答案", exact: true }).click();
	await expect(result).toHaveText('{"priority":"theme"}');
	await page.getByRole("button", { name: "重置问卷", exact: true }).click();
	await expect(page.getByRole("radio", { name: "主题样式", exact: true })).not.toBeChecked();
	await expect(result).toHaveText("已重置，尚未提交");
	const light = await page
		.locator("body")
		.evaluate((node) => getComputedStyle(node).backgroundColor);
	await page.getByRole("button", { name: "深色模式：关", exact: true }).click();
	await expect(page.locator("html")).toHaveClass("dark");
	await expect
		.poll(() => page.locator("body").evaluate((node) => getComputedStyle(node).backgroundColor))
		.not.toBe(light);
	await trigger.click();
	await expect(dialog).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(page.getByRole("textbox", { name: "你的称呼" })).toHaveValue("联动项目");
	await expect(page.getByText("本地计数：1", { exact: true })).toBeVisible();
	await expect(page.locator("[data-component-tuner]")).toHaveCount(0);
	expect(requests.some((url) => /:5186\/|\/workbench\/|\/src\/lib\/registry\//.test(url))).toBe(
		false
	);
	expect(errors).toEqual([]);
});

test("workspace consumer and portaled dialog fit a narrow viewport", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/", { waitUntil: "networkidle" });
	await expect
		.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
		.toBe(true);
	await page.getByRole("button", { name: "打开验证对话框" }).click();
	const dialog = page.getByRole("dialog");
	await expect(dialog).toBeVisible();
	const box = await dialog.boundingBox();
	expect(box!.x).toBeGreaterThanOrEqual(0);
	expect(box!.x + box!.width).toBeLessThanOrEqual(390);
	await page.keyboard.press("Escape");
	await expect(page.getByRole("button", { name: "打开验证对话框" })).toBeFocused();
});

test("workspace consumer renders the Linear blocks with package styles and interactions", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.setViewportSize({ width: 1042, height: 853 });
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/linear", { waitUntil: "networkidle" });

	const theme = page.getByRole("combobox", { name: "界面主题", exact: true });
	const card = page.locator('[data-slot="card"]').filter({ has: theme });
	await expect(card).toHaveCSS("background-color", "rgb(255, 255, 255)");
	await expect.poll(() => theme.evaluate((node) => node.getBoundingClientRect().height)).toBe(30);
	await theme.click();
	const darkOption = page.getByRole("option", { name: "深色", exact: true });
	await expect
		.poll(() => darkOption.evaluate((node) => Math.round(node.getBoundingClientRect().height)))
		.toBe(32);
	await darkOption.click();
	await expect(theme).toHaveText("深色");
	await expect(card).toHaveCSS("background-color", "lch(9.232 0.85 272)");
	const emoji = page.getByRole("switch", { name: "将表情符号转换为 Emoji", exact: true });
	await expect
		.poll(() => emoji.evaluate((node) => [node.offsetWidth, node.offsetHeight]))
		.toEqual([30, 20]);
	await emoji.press("Space");
	await expect(emoji).not.toBeChecked();

	await page.getByRole("tab", { name: "My issues", exact: true }).click();
	const assigned = page.getByRole("tab", { name: "分配给我", exact: true });
	await expect
		.poll(() => assigned.evaluate((node) => node.getBoundingClientRect().height))
		.toBe(28);
	await page.getByRole("tab", { name: "我订阅的", exact: true }).click();
	await expect(page.getByText("你还没有订阅问题", { exact: true })).toBeVisible();
	await page.getByRole("button", { name: "创建新问题", exact: true }).click();
	const dialog = page.getByRole("dialog", { name: "新建问题", exact: true });
	const title = dialog.getByRole("textbox", { name: "标题", exact: true });
	await expect(title).toBeFocused();
	await title.fill("通过共享包创建");
	await dialog.getByRole("button", { name: "展开编辑区", exact: true }).click();
	await expect.poll(async () => Math.round((await dialog.boundingBox())!.width)).toBe(820);
	await expect(title).toHaveValue("通过共享包创建");
	await dialog.getByRole("button", { name: "创建问题", exact: true }).click();
	await expect(page.getByRole("tab", { name: "我创建的", exact: true })).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await expect(page.getByRole("button", { name: /通过共享包创建/ })).toBeVisible();

	await page.setViewportSize({ width: 375, height: 812 });
	await page.getByRole("tab", { name: "新建 Issue", exact: true }).click();
	await page.getByRole("button", { name: "深色模式", exact: true }).click();
	const opener = page.getByRole("button", { name: "新建问题", exact: true });
	await opener.click();
	await expect.poll(async () => Math.round((await dialog.boundingBox())!.width)).toBe(351);
	await expect
		.poll(() => dialog.evaluate((node) => getComputedStyle(node).backgroundColor))
		.toBe("lch(9.232 0.85 272)");
	await page.keyboard.press("Escape");
	await expect(opener).toBeFocused();
	expect(errors).toEqual([]);
});

test("Projects filters, board and project dates work through the shared package", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.setViewportSize({ width: 1042, height: 853 });
	await page.goto("/linear", { waitUntil: "networkidle" });
	await page.getByRole("tab", { name: "Projects", exact: true }).click();

	const list = page.getByRole("table", { name: "项目列表" });
	await expect(list.getByRole("row")).toHaveCount(3);
	await page.getByRole("button", { name: "添加筛选", exact: true }).click();
	const filters = page.getByRole("dialog", { name: "项目筛选" });
	await expect(filters.getByRole("combobox")).toBeFocused();
	await filters.getByRole("option", { name: "状态", exact: true }).click();
	await filters.getByRole("option", { name: "已计划", exact: true }).click();
	await page.keyboard.press("Escape");
	await expect(page.getByText("没有符合筛选条件的项目")).toBeVisible();
	await page.getByRole("button", { name: "清除筛选", exact: true }).last().click();
	await expect(list.getByRole("row")).toHaveCount(3);

	const display = page.getByRole("button", { name: "显示选项", exact: true });
	await display.click();
	await page.getByRole("tab", { name: "看板", exact: true }).click();
	await page.keyboard.press("Escape");
	const board = page.getByRole("region", { name: "项目看板", exact: true });
	const planned = board.getByRole("region", { name: "已计划", exact: true });
	const opener = planned.getByRole("button", { name: "在此状态新建项目：已计划" });
	await opener.click();
	const form = page.getByRole("dialog", { name: "新建项目", exact: true });
	const name = form.getByRole("textbox", { name: "项目名称" });
	await expect(name).toBeFocused();
	await expect(form.getByRole("button", { name: "项目状态" })).toHaveText("已计划");
	await form.getByRole("button", { name: "创建项目", exact: true }).click();
	await expect(form.getByRole("alert")).toHaveText("请输入项目名称。");
	await expect(name).toBeFocused();
	await name.fill("项目组合验收");

	await form.getByRole("button", { name: "项目团队" }).click();
	await page
		.getByRole("dialog", { name: "项目团队" })
		.getByRole("option", { name: "工程" })
		.click();
	await page.keyboard.press("Escape");
	await form.getByRole("button", { name: "项目负责人" }).click();
	await page
		.getByRole("dialog", { name: "项目负责人" })
		.getByRole("option", { name: /Alex Rivera/ })
		.click();

	await form.getByRole("button", { name: "开始日期" }).click();
	await expect(page.getByRole("dialog", { name: "开始日期" }).getByRole("grid")).toBeVisible();
	const startInput = page.getByRole("dialog", { name: "开始日期" }).getByRole("textbox");
	await startInput.fill("2027-05-20");
	await startInput.press("Enter");
	await form.getByRole("button", { name: "目标日期" }).click();
	const target = page.getByRole("dialog", { name: "目标日期" });
	await target.getByRole("tab", { name: "季度" }).click();
	await expect(target.getByRole("button", { name: "Q1 2027", exact: true })).toBeDisabled();
	await target.getByRole("button", { name: "Q2 2027", exact: true }).click();
	await form.getByRole("button", { name: "创建项目", exact: true }).click();
	await expect(form).toBeHidden();
	await expect(opener).toBeFocused();
	const card = planned.getByRole("button", { name: /^项目组合验收/ });
	await expect(card).toBeVisible();
	await card.click();
	await expect(page.getByRole("complementary", { name: "项目详情" })).toContainText("Alex Rivera");
	await expect(page.getByRole("complementary", { name: "项目详情" })).toContainText("Q2 2027");

	await page.setViewportSize({ width: 375, height: 812 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.getByRole("button", { name: "深色模式", exact: true }).click();
	await page.getByRole("button", { name: "新建项目", exact: true }).click();
	await expect.poll(async () => Math.round((await form.boundingBox())!.width)).toBe(351);
	await expect
		.poll(() => form.evaluate((node) => getComputedStyle(node).backgroundColor))
		.toBe("lch(9.232 0.85 272)");
	await name.fill("未提交的草稿");
	await page.keyboard.press("Escape");
	const discard = page.getByRole("alertdialog");
	await expect(discard).toBeVisible();
	await discard.getByRole("button", { name: "继续编辑" }).click();
	await expect(name).toHaveValue("未提交的草稿");
	await form.getByRole("button", { name: "关闭项目表单" }).click();
	await discard.getByRole("button", { name: "丢弃", exact: true }).click();
	await expect(form).toBeHidden();
	await expect(page.getByRole("button", { name: "新建项目", exact: true })).toBeFocused();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
	expect(errors).toEqual([]);
});

test("project and milestone dates can be edited with the shared Date Picker", async ({ page }) => {
	await page.goto("/linear", { waitUntil: "networkidle" });
	await page.getByRole("tab", { name: "Projects", exact: true }).click();
	const projects = page.getByRole("region", { name: "项目", exact: true });
	const detail = projects.getByRole("complementary", { name: "项目详情" });
	await projects.getByRole("button", { name: "组件文档整理", exact: true }).click();

	const newDate = new Date();
	newDate.setUTCDate(newDate.getUTCDate() + 2);
	const iso = newDate.toISOString().slice(0, 10);
	const disclosure = detail.getByRole("button", { name: "属性", exact: true });
	const start = detail.getByRole("button", { name: "编辑开始日期" });
	await disclosure.press("Space");
	await expect(disclosure).toBeFocused();
	await expect(start).toBeHidden();
	await disclosure.press("Enter");
	await expect(start).toBeVisible();
	await start.click();
	const picker = projects.getByRole("dialog", { name: "编辑开始日期" });
	const input = picker.getByRole("textbox", { name: "输入日期" });
	await input.fill(iso);
	await input.press("Enter");
	await expect(start).toBeFocused();
	await expect(start).not.toHaveText("设置开始日期");

	await projects.getByRole("button", { name: "显示选项", exact: true }).click();
	await projects.getByRole("tab", { name: "时间线", exact: true }).click();
	await page.keyboard.press("Escape");
	const timeline = projects.getByRole("region", { name: "项目时间线" });
	await expect(timeline.locator('[data-project-bar="sample-1"]')).toHaveAttribute(
		"data-dated",
		"true"
	);
	await detail.getByRole("button", { name: "编辑前置项目" }).click();
	const blockers = projects.getByRole("dialog", { name: "编辑前置项目", exact: true });
	await blockers.getByRole("option", { name: "预览性能优化", exact: true }).click();
	await page.keyboard.press("Escape");
	const dependency = timeline.locator('[data-project-dependency="sample-2:sample-1"]');
	await expect(dependency).toHaveAttribute("data-violated", "true");
	await expect(detail.getByText("排期冲突")).toBeVisible();

	await start.click();
	const later = new Date(newDate);
	later.setUTCDate(later.getUTCDate() + 30);
	await input.fill(later.toISOString().slice(0, 10));
	await input.press("Enter");
	await expect(dependency).toHaveAttribute("data-violated", "false");
	await expect(detail.getByText("排期冲突")).toBeHidden();

	await timeline.getByRole("button", { name: "预览性能优化", exact: true }).click();
	await detail.getByRole("button", { name: "编辑前置项目" }).click();
	await expect(blockers.getByRole("option", { name: "组件文档整理", exact: true })).toHaveCount(0);
	await page.keyboard.press("Escape");
	await timeline.getByRole("button", { name: "今天", exact: true }).click();
	const milestone = timeline.getByRole("button", { name: "里程碑：预览验收" });
	await milestone.click();
	const milestonePanel = projects.getByRole("dialog", { name: "预览验收", exact: true });
	await milestonePanel.getByRole("button", { name: "编辑里程碑日期" }).click();
	const milestonePicker = projects.getByRole("dialog", { name: "编辑里程碑日期" });
	await expect(milestonePicker.getByRole("tablist")).toHaveCount(0);
	const date = milestonePicker.getByRole("textbox", { name: "输入日期" });
	const before = await milestone.evaluate((node) => node.parentElement?.style.left);
	await date.fill(iso);
	await date.press("Enter");
	await expect(milestonePicker).toBeHidden();
	await expect
		.poll(() => milestone.evaluate((node) => node.parentElement?.style.left))
		.not.toBe(before);
});

test("saved project views restore filters and display settings after reload", async ({ page }) => {
	await page.goto("/linear", { waitUntil: "networkidle" });
	const openProjects = () => page.getByRole("tab", { name: "Projects", exact: true }).click();
	await openProjects();
	const projects = page.getByRole("region", { name: "项目", exact: true });
	const display = projects.getByRole("button", { name: "显示选项", exact: true });
	await projects.getByRole("button", { name: "添加筛选", exact: true }).click();
	const filters = projects.getByRole("dialog", { name: "项目筛选" });
	await filters.getByRole("option", { name: "所属团队", exact: true }).click();
	await filters.getByRole("option", { name: "工程", exact: true }).click();
	await page.keyboard.press("Escape");
	await display.click();
	await projects.getByRole("tab", { name: "时间线", exact: true }).click();
	await projects.getByRole("switch", { name: "显示里程碑" }).click();
	await projects.getByRole("button", { name: "保存当前视图", exact: true }).click();
	const save = projects.getByRole("dialog", { name: "保存项目视图", exact: true });
	await save.getByRole("textbox", { name: "视图名称" }).fill("工程排期");
	await save.getByRole("button", { name: "保存视图", exact: true }).click();
	await expect(save).toBeHidden();

	await page.reload({ waitUntil: "networkidle" });
	await openProjects();
	const viewPicker = projects.getByRole("combobox", { name: "保存的项目视图" });
	await viewPicker.click();
	await page.getByRole("option", { name: "工程排期", exact: true }).click();
	const timeline = projects.getByRole("region", { name: "项目时间线" });
	await expect(timeline).toBeVisible();
	await expect(timeline.locator("[data-project-bar]")).toHaveCount(1);
	await expect(timeline.getByRole("button", { name: /里程碑：/ })).toHaveCount(0);
	await expect(projects.locator('[aria-label="生效的筛选"]')).toContainText("工程");
});

test("My issues saves rich descriptions and returns to the updated list", async ({ page }) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/linear", { waitUntil: "networkidle" });
	await page.getByRole("tab", { name: "My issues", exact: true }).click();
	await page.getByRole("button", { name: /VLR-103/ }).click();

	const detail = page.getByRole("region", { name: "问题详情", exact: true });
	const props = detail.getByRole("complementary", { name: "问题属性" });
	const heading = detail.getByRole("heading", { name: "补齐命令菜单的键盘导航" });
	const breadcrumb = detail.getByRole("navigation", { name: "问题路径" });
	await expect(breadcrumb.locator('[aria-current="page"]')).toContainText("VLR-103");
	await expect(heading).toBeFocused();
	expect((await props.boundingBox())!.x).toBeGreaterThan((await heading.boundingBox())!.x + 300);
	const editTitle = detail.getByRole("button", { name: "编辑标题" });
	const title = detail.getByRole("textbox", { name: "问题标题" });
	await editTitle.click();
	await expect(title).toBeFocused();
	await title.fill("先取消这一版");
	await title.press("Escape");
	await expect(heading).toBeVisible();
	await expect(editTitle).toBeFocused();

	await detail.getByRole("button", { name: "编辑描述" }).click();
	const editor = detail.getByRole("textbox", { name: "问题描述", exact: true });
	await expect(editor).toBeFocused();
	await title.fill("键盘导航验收完成");
	await editor.fill("可持久化的富文本");
	await editor.press("ControlOrMeta+a");
	await detail.getByRole("button", { name: "粗体", exact: true }).click();
	await expect(editor.locator("strong")).toHaveText("可持久化的富文本");
	await editor.press("Control+Enter");
	await expect(detail.getByRole("heading", { name: "键盘导航验收完成" })).toBeVisible();
	await expect(detail.locator('[data-slot="issue-description"] strong')).toHaveText(
		"可持久化的富文本"
	);

	await props.getByRole("button", { name: "更改状态" }).click();
	const status = page.getByRole("dialog", { name: "更改状态" });
	await expect(status.getByRole("combobox")).toBeFocused();
	await status.getByRole("combobox").fill("已完成");
	await status.getByRole("combobox").press("Enter");
	await expect(props.getByRole("button", { name: "更改状态" })).toHaveText("已完成");

	await props.getByRole("button", { name: "更改标签" }).click();
	const labels = page.getByRole("dialog", { name: "更改标签" });
	await labels.getByRole("option", { name: "无障碍" }).click();
	await labels.getByRole("option", { name: "设计" }).click();
	await page.keyboard.press("Escape");
	await expect(props.getByRole("button", { name: "更改标签" })).toContainText("无障碍、设计");

	await detail.getByRole("button", { name: "返回我的问题" }).click();
	const row = page.getByRole("button", { name: /VLR-103.*已完成.*键盘导航验收完成/ });
	await expect(row).toBeFocused();
	await expect(row).toHaveCSS("min-height", "44px");
	await row.click();
	await expect(detail.locator('[data-slot="issue-description"] strong')).toHaveText(
		"可持久化的富文本"
	);

	await page.setViewportSize({ width: 375, height: 812 });
	const updatedHeading = detail.getByRole("heading", { name: "键盘导航验收完成" });
	await expect
		.poll(async () => (await props.boundingBox())!.y > (await updatedHeading.boundingBox())!.y)
		.toBe(true);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
	await detail.getByRole("button", { name: "编辑描述" }).click();
	await editor.fill("不保存的草稿");
	await detail.getByRole("button", { name: "取消", exact: true }).click();
	await expect(detail.locator('[data-slot="issue-description"] strong')).toHaveText(
		"可持久化的富文本"
	);
	expect(errors).toEqual([]);
});

test("Inbox keeps notification state and issue edits in sync across filters and layouts", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/linear", { waitUntil: "networkidle" });
	await page.getByRole("tab", { name: "Inbox", exact: true }).click();

	const inbox = page.getByRole("region", { name: "通知中心", exact: true });
	const list = inbox.getByRole("region", { name: "通知列表", exact: true });
	const detail = inbox.getByRole("region", { name: "通知详情", exact: true });
	const rows = list.locator("[data-notification]");
	const first = list.getByRole("button", { name: /VLR-206.*分配给你/ });
	const second = list.getByRole("button", { name: /VLR-204/ });

	await expect(inbox.getByText("未选择通知")).toBeVisible();
	await expect(rows).toHaveCount(4);
	await first.focus();
	await first.press("ArrowDown");
	await expect(second).toBeFocused();
	await second.press("ControlOrMeta+f");
	const search = list.getByRole("searchbox", { name: "搜索通知" });
	await expect(search).toBeFocused();
	await search.fill("VLR-201");
	await expect(rows).toHaveCount(1);
	await search.press("Escape");
	await expect(search).toBeHidden();
	await expect(rows).toHaveCount(4);
	await list.getByRole("button", { name: "通知操作", exact: true }).click();
	await inbox.getByRole("menuitem", { name: "搜索通知" }).click();
	await expect(search).toBeFocused();
	await search.press("Escape");

	const filter = list.getByRole("button", { name: "添加筛选", exact: true });
	await filter.click();
	const filters = inbox.getByRole("dialog", { name: "筛选通知" });
	await filters.getByRole("option", { name: "通知类型" }).click();
	await filters.getByRole("option", { name: "分配", exact: true }).click();
	await expect(rows).toHaveCount(1);
	await filters.getByRole("option", { name: "提及", exact: true }).click();
	await expect(rows).toHaveCount(2);
	await page.keyboard.press("Escape");
	await expect(filter).toBeFocused();
	await list.getByRole("button", { name: "移除筛选 · 通知类型" }).click();
	await expect(rows).toHaveCount(4);

	await first.click();
	await expect(detail.getByRole("heading", { name: "核对搜索结果的键盘顺序" })).toBeFocused();
	await expect(first).toHaveAttribute("aria-current", "true");
	await expect(first).not.toContainText("未读");
	await detail.getByRole("button", { name: "编辑标题" }).click();
	const title = detail.getByRole("textbox", { name: "问题标题" });
	await title.fill("通知中的修改已同步");
	await title.press("Control+Enter");
	await expect(rows.filter({ hasText: "通知中的修改已同步" })).toHaveCount(2);

	const actions = detail.getByRole("button", { name: "当前通知操作" });
	await actions.click();
	await inbox.getByRole("menuitem", { name: "标为未读" }).click();
	await expect(first).toContainText("未读");
	await actions.click();
	const snooze = inbox.getByRole("menuitem", { name: "暂缓", exact: true });
	await snooze.press("ArrowRight");
	await inbox.getByRole("menuitem", { name: "1 小时" }).click();
	await expect(detail).toBeHidden();
	await expect(rows).toHaveCount(3);

	const display = list.getByRole("button", { name: "显示选项" });
	await display.click();
	const displayOptions = inbox.getByRole("dialog", { name: "显示选项" });
	await displayOptions.getByRole("switch", { name: "显示已暂缓" }).click();
	await expect(rows).toHaveCount(4);
	await displayOptions.getByRole("switch", { name: "启用优先收件箱" }).click();
	await page.keyboard.press("Escape");
	await expect(inbox.getByRole("tab", { name: /^优先/ })).toHaveAttribute("aria-selected", "true");
	await inbox.getByRole("tab", { name: /^其他/ }).click();
	await expect(rows).toHaveCount(1);
	await expect(list.getByRole("button", { name: /VLR-201/ })).toBeVisible();
	await inbox.getByRole("tab", { name: /^优先/ }).click();

	await page.setViewportSize({ width: 375, height: 812 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.getByRole("button", { name: "深色模式", exact: true }).click();
	await expect(inbox.getByText("未选择通知")).toBeHidden();
	await second.click();
	await expect(list).toBeHidden();
	await expect(detail).toBeVisible();
	await detail.getByRole("button", { name: "返回通知" }).click();
	await expect(second).toBeFocused();
	await list.getByRole("button", { name: "仅显示未读" }).click();
	await list.getByRole("button", { name: "通知操作", exact: true }).click();
	await inbox.getByRole("menuitem", { name: "全部标为已读" }).click();
	await expect(list.getByText("没有未读通知")).toBeVisible();
	await list.getByRole("button", { name: "显示全部通知" }).click();
	await expect(rows).toHaveCount(3);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
	expect(errors).toEqual([]);
});

test("Inbox priority rules and detail shortcuts update the shared notification list", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.clock.install();
	await page.goto("/linear", { waitUntil: "networkidle" });
	await page.getByRole("tab", { name: "Inbox", exact: true }).click();

	const inbox = page.getByRole("region", { name: "通知中心", exact: true });
	const list = inbox.getByRole("region", { name: "通知列表", exact: true });
	const detail = inbox.getByRole("region", { name: "通知详情", exact: true });
	const rows = list.locator("[data-notification]");
	const assignment = list.getByRole("button", { name: /VLR-206.*分配给你/ });
	const mention = list.getByRole("button", { name: /VLR-204/ });
	const status = list.getByRole("button", { name: /VLR-201/ });

	await list.getByRole("button", { name: "显示选项", exact: true }).click();
	const display = inbox.getByRole("dialog", { name: "显示选项", exact: true });
	await display.getByRole("switch", { name: "启用优先收件箱" }).click();
	await expect(rows).toHaveCount(3);
	await display.getByRole("button", { name: "优先筛选", exact: true }).click();
	await display.getByRole("checkbox", { name: "状态变更", exact: true }).check();
	await expect(status).toBeVisible();
	await expect(rows).toHaveCount(4);
	await display.getByRole("button", { name: "恢复优先默认规则", exact: true }).click();
	await expect(status).toHaveCount(0);
	await expect(rows).toHaveCount(3);
	await page.keyboard.press("Escape");

	await assignment.click();
	await expect(detail.getByRole("heading", { name: "核对搜索结果的键盘顺序" })).toBeFocused();
	await expect(detail.getByRole("button", { name: "上一条通知" })).toBeDisabled();
	await page.keyboard.press("j");
	const heading = detail.getByRole("heading", { name: "补齐弹层的深色主题" });
	await expect(heading).toBeFocused();
	await expect(mention).toHaveAttribute("aria-current", "true");
	await expect(mention).not.toContainText("未读");
	await heading.press("u");
	await expect(mention).toContainText("未读");
	await heading.press("h");
	await inbox.getByRole("menuitem", { name: "1 小时", exact: true }).click();
	await expect(detail).toBeHidden();
	await expect(mention).toHaveCount(0);
	await page.clock.fastForward(60 * 60 * 1000 + 1);
	await expect(mention).toBeVisible();
	await expect(mention).toContainText("未读");
	await mention.press("Alt+u");
	await expect(mention).not.toContainText("未读");
	await mention.press("Backspace");
	await expect(mention).toHaveCount(0);
	await expect(list.locator("[data-notification]").nth(1)).toBeFocused();
});

test("Agent preserves chats and attachments while streaming, stopping and scrolling", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.setViewportSize({ width: 1320, height: 860 });
	await page.goto("/linear", { waitUntil: "networkidle" });
	await page.getByRole("tab", { name: "Agent", exact: true }).click();

	const agent = page.getByRole("region", { name: "Agent 对话", exact: true });
	const compose = agent.getByRole("textbox", { name: "发送消息给 Agent" });
	const send = agent.getByRole("button", { name: "发送消息", exact: true });
	const stop = agent.getByRole("button", { name: "停止回复", exact: true });
	const viewport = agent.getByRole("region", { name: "对话消息", exact: true });
	await expect(send).toBeDisabled();
	await agent.getByRole("button", { name: /^研究一个主题/ }).click();
	await expect(agent.getByRole("heading", { name: "研究一个主题" })).toBeVisible();
	await expect(stop).toBeVisible();
	await expect(agent.getByText("思考中…")).toBeVisible();
	await expect(compose).toBeFocused();
	await expect(agent.getByText(/你想查找哪个功能/)).toBeVisible();
	await expect(stop).toBeHidden();
	await expect(agent.getByRole("button", { name: "复制回复" })).toBeVisible();

	async function attach(name: string) {
		await agent.getByRole("button", { name: "添加附件" }).click();
		const chosen = page.waitForEvent("filechooser");
		await agent.getByRole("menuitem", { name: "文件", exact: true }).click();
		await (
			await chosen
		).setFiles({ name, mimeType: "text/plain", buffer: Buffer.from("Synthetic attachment.") });
	}
	await attach("remove-me.txt");
	await agent.getByRole("button", { name: "移除 remove-me.txt" }).click();
	await expect(agent.getByText("remove-me.txt")).toBeHidden();
	await attach("review.txt");
	await expect(agent.getByText("正在准备附件…")).toBeVisible();
	await expect(send).toBeEnabled();
	await compose.fill("请给我一份评审清单");
	await compose.press("Shift+Enter");
	await expect(compose).toHaveValue("请给我一份评审清单\n");
	await compose.press("Enter");
	await expect(
		agent.getByRole("group", { name: "你的消息" }).getByText("review.txt")
	).toBeVisible();
	await expect(agent.getByRole("button", { name: /已处理 .* 秒/ })).toBeVisible();
	await agent.getByRole("button", { name: /已处理 .* 秒/ }).click();
	await expect(agent.getByText("已检查附件")).toBeVisible();
	await expect(stop).toBeHidden();
	await expect(agent.getByText("记录仍需复测的交互和环境。")).toBeAttached();

	await viewport.evaluate((node) => {
		node.scrollTop = 0;
	});
	const latest = agent.getByRole("button", { name: "跳到最新消息" });
	await expect(latest).toHaveAttribute("data-active", "true");
	await latest.click();
	await expect
		.poll(() => viewport.evaluate((node) => node.scrollHeight - node.clientHeight - node.scrollTop))
		.toBeLessThan(3);

	await agent.getByRole("button", { name: "切换对话" }).click();
	const history = agent.getByRole("dialog", { name: "对话历史" });
	await history.getByRole("option", { name: /新对话/ }).click();
	await expect(agent.getByRole("heading", { name: "新对话" })).toBeVisible();
	await expect(viewport).toBeHidden();
	await expect(compose).toBeFocused();
	await page.setViewportSize({ width: 375, height: 812 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.getByRole("button", { name: "深色模式", exact: true }).click();
	await compose.fill("用于验证取消的消息");
	await send.click();
	await stop.click();
	await expect(agent.getByText("已停止回复")).toBeVisible();
	await expect(compose).toBeFocused();
	await expect(send).toBeDisabled();
	await agent.getByRole("button", { name: "切换对话" }).click();
	await history.getByRole("option", { name: /^研究一个主题/ }).click();
	await expect(agent.getByText("记录仍需复测的交互和环境。")).toBeAttached();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
	expect(errors).toEqual([]);
});

test("Work-area overlays keep shortcuts, focus and viewport collision behavior", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto("/linear", { waitUntil: "networkidle" });
	await page.getByRole("tab", { name: "Projects" }).click();
	const projects = page.getByRole("region", { name: "项目", exact: true });
	const filter = projects.getByRole("button", { name: "添加筛选", exact: true });
	const display = projects.getByRole("button", { name: "显示选项", exact: true });
	const tooltip = projects.locator('[data-slot="tooltip-content"]');
	await filter.hover();
	await expect(tooltip).toHaveCount(0);
	await expect(tooltip).toBeVisible();
	await expect(tooltip).toContainText("F");
	await expect(tooltip).toHaveCSS("border-radius", "8px");
	await expect(tooltip).toHaveCSS("background-color", "rgb(255, 255, 255)");
	await expect(filter).toHaveCSS("width", "28px");
	await expect(filter.locator("svg")).toHaveCSS("width", "14px");
	await filter.press("f");
	const menu = projects.getByRole("dialog", { name: "项目筛选" });
	await expect(menu.getByRole("combobox")).toBeFocused();
	await expect(menu).toHaveCSS("border-radius", "12px");
	await expect(menu.getByRole("option", { name: "状态", exact: false })).toHaveCSS(
		"height",
		"32px"
	);
	await menu.getByRole("combobox").press("Escape");
	await expect(filter).toBeFocused();
	await filter.press("Shift+v");
	const options = projects.getByRole("dialog", { name: "显示选项" });
	await expect(options).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(display).toBeFocused();

	await page.setViewportSize({ width: 375, height: 812 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.getByRole("button", { name: "深色模式" }).click();
	await display.hover();
	await expect(tooltip).toBeVisible();
	await expect(tooltip).toHaveCSS("animation-name", "none");
	const tipBox = (await tooltip.boundingBox())!;
	// Allow one device-pixel rounding step at the configured collision padding.
	const pixel = await page.evaluate(() => 1 / devicePixelRatio);
	const viewport = page.viewportSize()!;
	expect(tipBox.x).toBeGreaterThanOrEqual(8 - pixel);
	expect(tipBox.x + tipBox.width).toBeLessThanOrEqual(viewport.width - 8 + pixel);
	expect(await tooltip.evaluate((node) => getComputedStyle(node).backgroundColor)).toBe(
		"lch(12.72 0.85 272)"
	);

	await page.getByRole("tab", { name: "Inbox" }).click();
	const inbox = page.getByRole("region", { name: "通知中心" });
	const unread = inbox.getByRole("button", { name: "仅显示未读" });
	await unread.click();
	await expect(inbox.getByRole("button", { name: "显示已读", exact: true })).toHaveCSS(
		"background-color",
		"lch(18.634 1.075 272)"
	);
	await inbox.getByRole("button", { name: "通知操作", exact: true }).press("Enter");
	const item = inbox.getByRole("menuitem", { name: "搜索通知" });
	await expect(item).toHaveCSS("height", "32px");
	await page.keyboard.press("Escape");
	await expect(inbox.getByRole("button", { name: "通知操作", exact: true })).toBeFocused();
});

test("Issue activity keeps comment drafts, threads and property changes scoped to an issue", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/linear", { waitUntil: "networkidle" });
	await page.getByRole("tab", { name: "My issues", exact: true }).click();
	await page.getByRole("button", { name: /VLR-103/ }).click();
	const detail = page.getByRole("region", { name: "问题详情", exact: true });
	const activity = detail.getByRole("region", { name: "问题活动", exact: true });
	const timeline = activity.getByRole("list", { name: "活动时间线" });
	const heading = (await detail.getByRole("heading", { level: 2 }).boundingBox())!;
	const description = (await detail.locator('[data-slot="issue-description"]').boundingBox())!;
	expect(description.y - heading.y - heading.height).toBeLessThanOrEqual(28);
	await expect(timeline).toContainText("创建了问题");
	const seededThread = timeline.locator('[data-slot="issue-comment-thread"]').first();
	await seededThread.getByRole("button", { name: "评论选项", exact: true }).click();
	await expect(detail.getByRole("menuitem", { name: "编辑评论", exact: true })).toHaveCount(0);
	await page.keyboard.press("Escape");

	const composer = activity.getByRole("form", { name: "新评论" });
	await expect(composer.getByRole("button", { name: "发表评论", exact: true })).toBeDisabled();
	await composer.getByRole("button", { name: "发表评论…", exact: true }).click();
	const input = composer.getByRole("textbox", { name: "评论", exact: true });
	await expect(input).toBeFocused();
	await input.fill("评论会保留");
	await input.press("ControlOrMeta+a");
	await input.press("ControlOrMeta+b");
	const chooser = page.waitForEvent("filechooser");
	await composer.getByRole("button", { name: "为评论添加附件" }).click();
	const fileChooser = await chooser;
	await fileChooser.setFiles({
		name: "notes.txt",
		mimeType: "text/plain",
		buffer: Buffer.from("Issue activity test notes"),
	});
	await expect(composer.getByRole("list", { name: "评论附件" })).toContainText("notes.txt");
	await input.press("Control+Enter");
	await expect(input).toBeFocused();
	const thread = timeline.locator('[data-slot="issue-comment-thread"]').nth(1);
	await expect(thread.locator('[data-slot="issue-comment-body"] strong')).toHaveText("评论会保留");
	await expect(thread.getByRole("list", { name: "评论附件" })).toContainText("notes.txt");
	await expect(composer.getByRole("list", { name: "评论附件" })).toHaveCount(0);
	await expect(composer.getByText("发表评论…", { exact: true })).toBeVisible();

	const options = thread.getByRole("button", { name: "评论选项", exact: true });
	await options.click();
	await detail.getByRole("menuitem", { name: "编辑评论", exact: true }).click();
	const editor = thread.getByRole("textbox", { name: "编辑评论" });
	await expect(editor).toBeFocused();
	await editor.fill("这一版将被放弃");
	await editor.press("Escape");
	const confirm = detail.getByRole("alertdialog", { name: "放弃评论修改？" });
	await expect(confirm).toBeVisible();
	await confirm.getByRole("button", { name: "继续编辑" }).click();
	await expect(editor).toBeFocused();
	await expect(editor).toHaveText("这一版将被放弃");
	await thread.getByRole("button", { name: "取消编辑", exact: true }).click();
	await confirm.getByRole("button", { name: "放弃修改" }).click();
	await expect(options).toBeFocused();
	await expect(thread).toContainText("评论会保留");
	await expect(thread.getByRole("list", { name: "评论附件" })).toContainText("notes.txt");
	await options.click();
	await detail.getByRole("menuitem", { name: "编辑评论", exact: true }).click();
	await editor.fill("评论已修改");
	await editor.press("Control+Enter");
	await expect(timeline.getByText("评论已修改", { exact: true })).toBeVisible();
	await expect(timeline.getByText("已编辑", { exact: true })).toBeVisible();

	await seededThread.getByRole("button", { name: "回复此线程…" }).click();
	const reply = seededThread.getByRole("textbox", { name: "回复", exact: true });
	await reply.fill("仅出现在原线程内");
	await reply.press("Control+Enter");
	await expect(seededThread.getByRole("list", { name: "线程回复" })).toContainText(
		"仅出现在原线程内"
	);
	await detail.getByRole("button", { name: "更改状态" }).click();
	await detail
		.getByRole("dialog", { name: "更改状态" })
		.getByRole("option", { name: "已完成" })
		.click();
	await expect(timeline).toContainText(/将状态从.+改为「已完成」/);
	await detail.getByRole("button", { name: "返回我的问题" }).click();
	await page.getByRole("button", { name: /VLR-103/ }).click();
	await expect(timeline.getByText("评论已修改")).toBeVisible();

	await page.setViewportSize({ width: 375, height: 812 });
	await page.getByRole("button", { name: "深色模式" }).click();
	await page.getByRole("tab", { name: "Inbox", exact: true }).click();
	const inbox = page.getByRole("region", { name: "通知中心" });
	await inbox.getByRole("button", { name: /VLR-206.*分配给你/ }).click();
	const inboxDetail = inbox.getByRole("region", { name: "通知详情" });
	const inboxComposer = inboxDetail.getByRole("form", { name: "新评论" });
	await inboxComposer.getByRole("button", { name: "发表评论…", exact: true }).click();
	const inboxInput = inboxComposer.getByRole("textbox", { name: "评论", exact: true });
	await inboxInput.fill("两条通知看到同一条评论");
	await inboxInput.press("Control+Enter");
	await inboxDetail.getByRole("button", { name: "返回通知" }).click();
	await inbox.getByRole("button", { name: /VLR-206.*添加了一条评论/ }).click();
	await expect(inboxDetail.getByText("两条通知看到同一条评论")).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
	expect(errors).toEqual([]);
});

test("Projects timeline and board share status changes and support mouse, keyboard and touch", async ({
	page,
	browser,
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/linear", { waitUntil: "networkidle" });
	await page.getByRole("tab", { name: "Projects", exact: true }).click();
	const projects = page.getByRole("region", { name: "项目", exact: true });
	const display = projects.getByRole("button", { name: "显示选项", exact: true });
	await display.click();
	await projects.getByRole("tab", { name: "看板", exact: true }).click();
	await page.keyboard.press("Escape");

	const board = projects.getByRole("region", { name: "项目看板" });
	const backlog = board.getByRole("region", { name: "待规划", exact: true });
	const planned = board.getByRole("region", { name: "已计划", exact: true });
	const cardName = /^预览性能优化/;
	const card = backlog.getByRole("button", { name: cardName });
	const cardBounds = (await card.boundingBox())!;
	const destination = (await planned.boundingBox())!;
	const start = { x: cardBounds.x + 85, y: cardBounds.y + 18 };
	const end = { x: destination.x + 100, y: destination.y + 120 };
	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	await page.mouse.move(end.x, end.y, { steps: 12 });
	await expect(planned).toHaveAttribute("data-drop-target", "");
	await page.keyboard.press("Escape");
	await page.mouse.up();
	await expect(card).toHaveCount(1);
	await expect(card).toBeVisible();
	await expect(backlog.locator('[data-project-card="sample-2"][data-dragging]')).toHaveCount(0);
	await expect(planned).not.toHaveAttribute("data-drop-target", "");
	await expect(planned.locator("[data-project-card]")).toHaveCount(0);

	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	await page.mouse.move(end.x, end.y, { steps: 12 });
	await expect(planned).toHaveAttribute("data-drop-target", "");
	await page.mouse.up();
	await expect(planned.getByRole("button", { name: cardName })).toBeFocused();
	await expect(card).toHaveCount(0);
	const mover = planned.getByRole("button", { name: /移动项目：预览性能优化/ });
	await mover.press("Enter");
	await projects.getByRole("menuitem", { name: "进行中", exact: true }).press("Enter");
	const active = board.getByRole("region", { name: "进行中", exact: true });
	await expect(active.getByRole("button", { name: /移动项目：预览性能优化/ })).toBeFocused();
	await expect(projects.getByRole("status")).toContainText("预览性能优化 已移至「进行中」");

	await display.click();
	await projects.getByRole("tab", { name: "时间线", exact: true }).click();
	await page.keyboard.press("Escape");
	const timeline = projects.getByRole("region", { name: "项目时间线" });
	const scrollport = timeline.getByRole("region", { name: "滚动查看项目日期" });
	const zoom = timeline.getByRole("button", { name: "时间线缩放" });
	await expect(timeline.getByRole("button", { name: /未排期/ })).toBeVisible();
	await timeline.getByRole("button", { name: "预览性能优化", exact: true }).click();
	await expect(projects.getByRole("complementary", { name: "项目详情" })).toContainText("进行中");
	await timeline.getByRole("button", { name: "今天", exact: true }).click();
	await timeline.getByRole("button", { name: "里程碑：预览验收", exact: true }).click();
	await expect(projects.getByRole("dialog", { name: "预览验收" })).toContainText("40% 完成");
	await page.keyboard.press("Escape");
	await zoom.click();
	await projects
		.getByRole("dialog", { name: "时间线缩放" })
		.getByRole("button", { name: "年", exact: true })
		.click();
	await expect(timeline).toHaveAttribute("data-scale", "year");
	await scrollport.press("w");
	await expect(timeline).toHaveAttribute("data-scale", "week");
	const previous = await scrollport.evaluate((node) => node.scrollLeft);
	await timeline.getByRole("button", { name: "下一时间段" }).click();
	await expect.poll(() => scrollport.evaluate((node) => node.scrollLeft)).not.toBe(previous);
	await scrollport.press("t");
	await expect.poll(() => scrollport.evaluate((node) => node.scrollLeft)).toBe(previous);

	await display.click();
	await projects.getByRole("switch", { name: "显示里程碑" }).click();
	await projects.getByRole("switch", { name: "显示项目列表" }).click();
	await page.keyboard.press("Escape");
	await expect(timeline.getByRole("button", { name: /里程碑：/ })).toHaveCount(0);
	await expect(timeline.getByRole("button", { name: "预览性能优化", exact: true })).toHaveCount(0);

	await projects.getByRole("button", { name: "添加筛选", exact: true }).click();
	const filters = projects.getByRole("dialog", { name: "项目筛选" });
	await filters.getByRole("option", { name: "状态", exact: true }).click();
	await filters.getByRole("option", { name: "已取消", exact: true }).click();
	await page.keyboard.press("Escape");
	await expect(timeline.getByText("没有符合筛选条件的项目")).toBeVisible();
	await expect(timeline.getByRole("button", { name: "时间线缩放" })).toBeVisible();
	await timeline.getByRole("button", { name: "清除筛选", exact: true }).click();
	await expect(timeline.locator("[data-project-bar]")).toHaveCount(2);

	await display.click();
	await projects.getByRole("tab", { name: "看板", exact: true }).click();
	await page.keyboard.press("Escape");
	const filterTrigger = projects.getByRole("button", { name: "添加筛选", exact: true });
	await filterTrigger.click();
	await filters.getByRole("option", { name: "状态", exact: true }).click();
	await filters.getByRole("option", { name: "进行中", exact: true }).click();
	await page.keyboard.press("Escape");
	await active.getByRole("button", { name: /移动项目：预览性能优化/ }).press("Enter");
	await projects.getByRole("menuitem", { name: "已完成", exact: true }).press("Enter");
	await expect(projects.getByText("没有符合筛选条件的项目")).toBeVisible();
	await expect(filterTrigger).toBeFocused();
	await projects.getByRole("button", { name: "清除筛选", exact: true }).last().click();
	await display.click();
	await projects.getByRole("tab", { name: "时间线", exact: true }).click();
	await page.keyboard.press("Escape");

	await page.setViewportSize({ width: 375, height: 812 });
	await page.getByRole("button", { name: "深色模式", exact: true }).click();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
	expect(await scrollport.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
	expect(errors).toEqual([]);

	const touchContext = await browser.newContext({
		hasTouch: true,
		viewport: { width: 860, height: 850 },
	});
	try {
		const touch = await touchContext.newPage();
		await touch.goto(new URL("/linear", page.url()).href, { waitUntil: "networkidle" });
		await touch.getByRole("tab", { name: "Projects", exact: true }).tap();
		await touch.getByRole("button", { name: "显示选项", exact: true }).tap();
		await touch.getByRole("tab", { name: "看板", exact: true }).tap();
		await touch.getByRole("heading", { name: "项目", exact: true }).tap();
		const touchBoard = touch.getByRole("region", { name: "项目看板" });
		const grip = touchBoard.locator('[data-project-card="sample-1"] .touch-none');
		const touchPlanned = touchBoard.getByRole("region", { name: "已计划", exact: true });
		const gripBounds = (await grip.boundingBox())!;
		const plannedBounds = (await touchPlanned.boundingBox())!;
		const cdp = await touchContext.newCDPSession(touch);
		const from = { x: gripBounds.x + 7, y: gripBounds.y + 7 };
		const to = { x: plannedBounds.x + 78, y: plannedBounds.y + 115 };
		await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
		await expect(
			touchBoard.locator('[data-project-card="sample-1"]:not([data-dnd-placeholder])')
		).toHaveAttribute("data-dragging", "");
		for (let step = 1; step <= 8; step++) {
			await cdp.send("Input.dispatchTouchEvent", {
				type: "touchMove",
				touchPoints: [
					{ x: from.x + ((to.x - from.x) * step) / 8, y: from.y + ((to.y - from.y) * step) / 8 },
				],
			});
		}
		await expect(touchPlanned).toHaveAttribute("data-drop-target", "");
		await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
		await expect(touchPlanned.getByRole("button", { name: /^组件文档整理/ })).toBeVisible();
	} finally {
		await touchContext.close();
	}
});

test("Issue subscriptions, emoji reactions and resolved threads survive reopening a detail", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/linear", { waitUntil: "networkidle" });
	await page.getByRole("tab", { name: "My issues", exact: true }).click();
	await page.getByRole("button", { name: /VLR-103/ }).click();

	const detail = page.getByRole("region", { name: "问题详情", exact: true });
	const activity = detail.getByRole("region", { name: "问题活动" });
	const subscribe = activity.getByRole("button", { name: "订阅", exact: true });
	const unsubscribe = activity.getByRole("button", { name: "取消订阅", exact: true });
	await subscribe.press("Shift+s");
	await expect(unsubscribe).toHaveAttribute("aria-pressed", "true");
	await activity.getByRole("button", { name: "管理订阅者", exact: true }).click();
	const subscribers = detail.getByRole("dialog", { name: "管理订阅者" });
	await expect(subscribers.getByRole("option", { name: "我", exact: true })).toHaveAttribute(
		"data-checked",
		"true"
	);
	await subscribers.getByRole("combobox").fill("Alex");
	await subscribers.getByRole("option", { name: "Alex Rivera" }).click();
	await expect(subscribers.getByRole("option", { name: "Alex Rivera" })).toHaveAttribute(
		"data-checked",
		"true"
	);
	await page.keyboard.press("Escape");

	const thread = activity.locator('[data-slot="issue-comment-thread"]').first();
	const reactToComment = thread.getByRole("button", { name: "回应评论", exact: true });
	const picker = detail.getByRole("dialog", { name: "选择表情" });
	const emojiSearch = picker.getByRole("searchbox", { name: "搜索表情" });
	await reactToComment.click();
	await expect(emojiSearch).toBeFocused();
	await emojiSearch.fill("thumbsup");
	await emojiSearch.press("ArrowDown");
	await expect(picker.getByRole("button", { name: "赞", exact: true })).toBeFocused();
	await page.keyboard.press("Enter");
	const thumbsUp = thread.getByRole("button", { name: "赞 1", exact: true });
	await expect(thumbsUp).toHaveAttribute("aria-pressed", "true");
	await thumbsUp.click();
	await expect(thumbsUp).toHaveCount(0);
	await expect(reactToComment).toBeFocused();

	await detail.getByRole("button", { name: "回应问题", exact: true }).click();
	await emojiSearch.fill("🦉");
	await emojiSearch.press("Enter");
	await expect(detail.getByRole("button", { name: "🦉 1", exact: true })).toHaveAttribute(
		"aria-pressed",
		"true"
	);

	await thread.getByRole("button", { name: "回复此线程…", exact: true }).click();
	const reply = thread.getByRole("textbox", { name: "回复", exact: true });
	await reply.fill("这是验收结论。");
	await reply.press("Control+Enter");
	const replyArticle = thread.getByRole("article", { name: "线程回复" });
	await replyArticle.getByRole("button", { name: "回应回复", exact: true }).click();
	await emojiSearch.fill("庆祝");
	await emojiSearch.press("Enter");
	await expect(replyArticle.getByRole("button", { name: "庆祝 1", exact: true })).toHaveAttribute(
		"aria-pressed",
		"true"
	);
	await replyArticle.getByRole("button", { name: "评论选项", exact: true }).click();
	await detail.getByRole("menuitem", { name: "解决线程", exact: true }).click();
	const summary = thread.getByRole("button", { name: /已解决.*2 条评论.*验收结论/ });
	await expect(summary).toBeFocused();
	await expect(summary).toHaveAttribute("aria-expanded", "false");
	await expect(replyArticle).toBeHidden();

	await detail.getByRole("button", { name: "返回我的问题" }).click();
	await page.getByRole("tab", { name: "我订阅的", exact: true }).click();
	await page.getByRole("button", { name: /VLR-103/ }).click();
	await summary.press("Enter");
	await expect(replyArticle.getByRole("button", { name: "庆祝 1", exact: true })).toBeVisible();
	const rootMenu = thread
		.getByRole("article", { name: "评论内容" })
		.getByRole("button", { name: "评论选项", exact: true });
	await rootMenu.click();
	await detail.getByRole("menuitem", { name: "重新打开线程", exact: true }).click();
	await expect(summary).toHaveCount(0);
	await expect(rootMenu).toBeFocused();
	await unsubscribe.click();
	await detail.getByRole("button", { name: "返回我的问题" }).click();
	await expect(page.getByText("你还没有订阅问题", { exact: true })).toBeVisible();

	await page.setViewportSize({ width: 375, height: 812 });
	await page.getByRole("button", { name: "深色模式" }).click();
	await page.getByRole("tab", { name: "Inbox", exact: true }).click();
	const inbox = page.getByRole("region", { name: "通知中心" });
	await inbox.getByRole("button", { name: /VLR-206.*分配给你/ }).click();
	const inboxDetail = inbox.getByRole("region", { name: "通知详情" });
	await inboxDetail.getByRole("button", { name: "订阅", exact: true }).click();
	await inboxDetail.getByRole("button", { name: "评论选项", exact: true }).click();
	await inboxDetail.getByRole("menuitem", { name: "解决线程", exact: true }).click();
	await inboxDetail.getByRole("button", { name: "返回通知" }).click();
	await inbox.getByRole("button", { name: /VLR-206.*添加了一条评论/ }).click();
	await expect(inboxDetail.getByRole("button", { name: "取消订阅", exact: true })).toBeVisible();
	await expect(inboxDetail.getByRole("button", { name: /已解决.*1 条评论/ })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
	expect(errors).toEqual([]);
});
