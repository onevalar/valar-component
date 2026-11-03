import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { applyStyleOverrides } from "../src/lib/features/workbench/style-overrides.js";

async function setNumber(page: Page, label: string, value: number) {
	const control = page.getByRole("slider", { name: label, exact: true });
	await control.scrollIntoViewIfNeeded();
	await control.press("Enter");
	const input = page.getByRole("textbox", { name: `${label} value`, exact: true });
	await input.fill(String(value));
	await input.press("Enter");
}

const components = [
	["tags-input", "Tags Input", "外层留白（px）", 14, "tags-input", "padding-left", "14px"],
	[
		"button-group",
		"Button Group",
		"Text 水平留白（px）",
		22,
		"button-group-text",
		"padding-left",
		"22px",
	],
	["breadcrumb", "Breadcrumb", "宽屏列表间距（≥640px）", 22, "breadcrumb-list", "gap", "22px"],
	["pagination", "Pagination", "省略号占位尺寸（px）", 46, "pagination-ellipsis", "width", "46px"],
	["progress", "Progress", "轨道高度（px）", 14, "progress", "height", "14px"],
	["kbd", "Kbd", "按键高度（px）", 30, "kbd", "height", "30px"],
] as const;

for (const [slug, title, label, value, slot, property, result] of components) {
	test(`${title} editor isolates drafts and preserves its real canvas interaction`, async ({
		page,
	}) => {
		test.setTimeout(60_000);
		await page.goto(`/docs/components/${slug}`, { waitUntil: "networkidle" });
		const opener = page.getByRole("button", { name: `微调 ${title}`, exact: true });
		await opener.click();
		const editor = page.getByRole("dialog", { name: `${title} · 组件参数`, exact: true });
		await expect(editor.getByTestId(`${slug}-dials`)).toBeVisible();
		const current = editor.locator("[data-tuning-current]");
		const target = current.locator(`[data-slot="${slot}"]`).first();
		const baseline = await target.evaluate(
			(element, key) => getComputedStyle(element).getPropertyValue(key),
			property
		);
		await setNumber(page, label, value);
		await expect(target).toHaveCSS(property, result);
		await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
		const before = editor.locator("[data-tuning-before]");
		await expect(before.locator(`[data-slot="${slot}"]`).first()).toHaveCSS(property, baseline);

		if (slug === "tags-input") {
			const input = current.getByRole("textbox", { name: "中文与长标签", exact: true });
			await input.fill("新增标签，");
			await expect(current.getByText("新增标签", { exact: true })).toBeVisible();
			await expect(before.getByText("新增标签", { exact: true })).toHaveCount(0);
			const limited = current.getByRole("textbox", { name: "验证、重复与上限", exact: true });
			await limited.fill("新");
			await limited.press("Enter");
			await expect(current.getByText("请至少输入两个字。", { exact: true })).toBeVisible();
			const required = current.getByRole("textbox", { name: "必填标签", exact: true });
			await required.fill("已确认");
			await required.press("Enter");
			await current.getByRole("button", { name: "提交本画布表单", exact: true }).click();
			await expect(current.locator("output")).toHaveText("尚未提交。");
			await limited.fill("有效标签");
			await limited.press("Enter");
			await current.getByRole("button", { name: "提交本画布表单", exact: true }).click();
			await expect(current.locator("output")).toContainText('"必填标签":["已确认"]');
			await expect(current.locator("output")).toContainText('"禁用标签":[]');
			await current.getByRole("button", { name: "重置演示标签", exact: true }).click();
			await expect(current.getByText("新增标签", { exact: true })).toHaveCount(0);
		} else if (slug === "button-group") {
			await current.getByRole("textbox", { name: "文稿名称", exact: true }).fill("新设计稿");
			await current
				.getByRole("group", { name: "命名文稿", exact: true })
				.getByRole("button", { name: "保存", exact: true })
				.click();
			await expect(current.getByRole("status")).toContainText("已保存「新设计稿」第 1 次");
			await expect(before.getByRole("status")).toContainText("尚未执行操作");
			await current.getByRole("combobox", { name: "导出格式", exact: true }).click();
			await page.getByRole("option", { name: "SVG", exact: true }).click();
			await current.getByRole("button", { name: "确认", exact: true }).click();
			await expect(current.getByRole("status")).toContainText("使用 SVG 格式");
		} else if (slug === "breadcrumb") {
			await current.getByRole("button", { name: "展开中间路径", exact: true }).click();
			await page.getByRole("menuitem", { name: "组件库", exact: true }).click();
			await expect(page).toHaveURL(/#.*current-library$/);
			await expect(current.locator('[aria-current="page"]')).toHaveCount(2);
		} else if (slug === "pagination") {
			await current.getByRole("button", { name: /下一页|next/i }).click();
			const heading = current.getByRole("heading", { name: "资源列表 · 第 2 页", exact: true });
			await expect(heading).toBeFocused();
			await expect(current.getByText("设计资源 006", { exact: true })).toBeVisible();
			await expect(
				before.getByRole("heading", { name: "资源列表 · 第 1 页", exact: true })
			).toBeVisible();
		} else if (slug === "progress") {
			await expect(
				current.getByRole("progressbar", { name: "正在导入 · 42%", exact: true })
			).toHaveAttribute("aria-valuenow", "42");
			await expect(
				current.getByRole("progressbar", { name: "准备中 · 进度未知", exact: true })
			).not.toHaveAttribute("aria-valuenow");
			await current.getByRole("button", { name: "模拟导入", exact: true }).click();
			await expect(current.getByRole("status")).toHaveText("演示数据已导入，可重新运行。");
			await expect(
				before.getByRole("heading", { name: "本地模拟导入 · 0%", exact: true })
			).toBeVisible();
		} else if (slug === "kbd") {
			const practice = current.getByRole("button", { name: "快捷键练习 K", exact: true });
			await practice.focus();
			await practice.press("Shift+K");
			await expect(current.getByRole("status")).toHaveText("已执行 1 次 · Shift + K");
			await expect(before.getByRole("status")).toHaveText("已执行 0 次 · 尚未执行");
			// Leave the focused Tooltip trigger before testing the outer editor's Escape.
			await practice.press("Tab");
		}
		await page.setViewportSize({ width: 390, height: 844 });
		await expect
			.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
			.toBe(true);
		await page.keyboard.press("Escape");
		await expect(opener).toBeFocused();
	});
}

test("Spinner default-size previews never replace explicit same-size callers", async ({ page }) => {
	await page.goto("/docs/components/spinner", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Spinner", exact: true }).click();
	const editor = page.getByRole("dialog", { name: "Spinner · 组件参数", exact: true });
	const current = editor.locator("[data-tuning-current]");
	await editor.getByRole("button", { name: /^默认尺寸（px）/ }).click();
	await page.getByRole("option", { name: "32px", exact: true }).click();
	await expect(current.locator('[data-slot="spinner"]').first()).toHaveCSS("width", "32px");
	await expect(
		current.getByRole("status", { name: "固定 16 像素加载指示", exact: true })
	).toHaveCSS("width", "16px");
	await expect(
		current.getByRole("status", { name: "固定 24 像素加载指示", exact: true })
	).toHaveCSS("width", "24px");
	await current.getByRole("button", { name: "模拟保存", exact: true }).click();
	await expect(current.getByRole("button", { name: "保存中…", exact: true })).toBeDisabled();
	await expect(current.getByRole("button", { name: "模拟保存", exact: true })).toBeEnabled();
	await expect(current.getByRole("status").last()).toHaveText("演示已保存，无网络请求。");
});

test("Skeleton adjusts only radius and keeps loading state isolated", async ({ page }) => {
	await page.goto("/docs/components/skeleton", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Skeleton", exact: true }).click();
	const editor = page.getByRole("dialog", { name: "Skeleton · 组件参数", exact: true });
	const current = editor.locator("[data-tuning-current]");
	await editor.getByRole("button", { name: /^圆角档位/ }).click();
	await page.getByRole("option", { name: "none · 直角", exact: true }).click();
	await expect(current.locator('[data-slot="skeleton"]').first()).toHaveCSS("border-radius", "0px");
	await expect(current.locator('[data-slot="skeleton"]').first()).toHaveCSS("width", "48px");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	await current.getByRole("button", { name: "显示真实内容", exact: true }).click();
	await expect(current.getByRole("region", { name: "成员资料", exact: true })).toHaveAttribute(
		"aria-busy",
		"false"
	);
	await expect(
		editor.locator("[data-tuning-before]").getByRole("region", { name: "成员资料", exact: true })
	).toHaveAttribute("aria-busy", "true");
});

test("Menubar retains keyboard switching, choices, submenu and narrow Sheet actions", async ({
	page,
}) => {
	test.setTimeout(90_000);
	await page.setViewportSize({ width: 1920, height: 1080 });
	await page.goto("/docs/components/menubar", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Menubar", exact: true }).click();
	const editor = page.getByRole("dialog", { name: "Menubar · 组件参数", exact: true });
	const current = editor.locator("[data-tuning-current]");
	await setNumber(page, "菜单项横向内边距（px）", 20);
	const file = current.getByRole("menuitem", { name: "文件", exact: true });
	await file.focus();
	await file.press("ArrowDown");
	await expect(current.getByRole("menuitem", { name: "新建文稿", exact: true })).toBeVisible();
	await current.getByRole("menuitem", { name: "新建文稿", exact: true }).press("ArrowRight");
	await expect(current.getByRole("menuitem", { name: "复制标题", exact: true })).toBeVisible();
	await current.getByRole("menuitem", { name: "视图", exact: true }).hover();
	const choice = current.getByRole("menuitemcheckbox", { name: "显示状态栏", exact: true });
	await expect(choice).toBeChecked();
	await choice.click();
	await expect(choice).not.toBeChecked();
	await expect(choice.locator('[data-slot="menubar-checkbox-item-indicator"]')).toHaveCSS(
		"left",
		"20px"
	);
	await current.getByRole("menuitemradio", { name: "125%", exact: true }).click();
	await expect(current.getByRole("menuitemradio", { name: "125%", exact: true })).toBeChecked();
	await file.hover();
	await current.getByRole("menuitem", { name: "打开最近文稿", exact: true }).hover();
	await current.getByRole("menuitem", { name: "设计说明", exact: true }).click();
	await expect(current.getByRole("status")).toContainText("已打开：设计说明 · 文稿缩放 125%");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	await expect(editor.locator("[data-tuning-before]").getByRole("status")).toContainText(
		"尚未执行操作 · 文稿缩放 100%"
	);
	await page.setViewportSize({ width: 390, height: 844 });
	await current.getByRole("button", { name: "文件／编辑／视图", exact: true }).click();
	const sheet = current.getByRole("dialog", { name: "文稿操作", exact: true });
	await sheet.getByRole("button", { name: "保存副本", exact: true }).click();
	await expect(sheet.getByRole("status")).toHaveText("已在画布中保存副本");
	await page.keyboard.press("Escape");
	await expect(sheet).not.toBeVisible();
	await expect(editor).toBeVisible();
	await expect
		.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
		.toBe(true);
});

test("Navigation Menu preserves viewport modes, local links and narrow site navigation", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.setViewportSize({ width: 1920, height: 1080 });
	await page.goto("/docs/components/navigation-menu", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Navigation Menu", exact: true }).click();
	const editor = page.getByRole("dialog", { name: "Navigation Menu · 组件参数", exact: true });
	const current = editor.locator("[data-tuning-current]");
	await setNumber(page, "面板内边距（px）", 22);
	for (const name of ["共享 viewport 示例", "独立面板示例"]) {
		const example = current.getByRole("region", { name, exact: true });
		const guide = example.getByRole("button", { name: "指南", exact: true });
		await guide.hover();
		await expect(example.getByRole("link", { name: "使用指南", exact: true })).toBeVisible();
		await expect(
			example.locator('[data-slot="navigation-menu-content"][data-state="open"]')
		).toHaveCSS("padding-left", "22px");
		await example.getByRole("button", { name: "组件", exact: true }).hover();
		await expect(example.getByRole("link", { name: "组件目录", exact: true })).toBeVisible();
		await example.getByRole("link", { name: "组件目录", exact: true }).click();
		await expect(page).toHaveURL(/#.*current-components$/);
	}
	await page.setViewportSize({ width: 390, height: 844 });
	await current.getByRole("button", { name: "打开站点导航", exact: true }).click();
	const sheet = current.getByRole("dialog", { name: "站点导航", exact: true });
	await sheet.getByRole("link", { name: "安装步骤", exact: true }).click();
	await expect(page).toHaveURL(/#.*current-setup$/);
	await expect(sheet).not.toBeVisible();
	await expect(editor).toBeVisible();
	await expect
		.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
		.toBe(true);
});

// Writes local development sources; run explicitly against dev with --workers 1.
test("Tags Input writeback renders installed geometry in the reopened editor, not raw literals", async ({
	page,
}) => {
	test.skip(process.env.E2E_WRITEBACK !== "1", "Requires explicit development-source write opt-in");
	test.setTimeout(120_000);
	const file = resolve("src/lib/registry/styles/valar/style-nova.css");
	const original = readFileSync(file, "utf8");
	const written = applyStyleOverrides(original, {
		style: "nova",
		classes: { "cn-tags-input": "p-3.5" },
	});
	try {
		await page.goto("/docs/components/tags-input", { waitUntil: "networkidle" });
		const opener = page.getByRole("button", { name: "微调 Tags Input", exact: true });
		await opener.click();
		await setNumber(page, "外层留白（px）", 14);
		await page.getByRole("button", { name: "写回组件库…", exact: true }).click();
		const response = page.waitForResponse(
			(r) => r.url().endsWith("/__valar/style-overrides") && r.request().method() === "POST"
		);
		await page.getByRole("button", { name: "确认写回", exact: true }).click();
		expect((await response).status()).toBe(200);
		expect(readFileSync(file, "utf8")).toBe(written);
		await expect(opener).toBeEnabled({ timeout: 30_000 });
		await expect(page.locator('.sample [data-slot="tags-input"]').first()).toHaveCSS(
			"padding-left",
			"14px"
		);
		await opener.click();
		await expect(page.getByRole("slider", { name: "外层留白（px）", exact: true })).toHaveAttribute(
			"aria-valuenow",
			"14"
		);
		const root = page
			.getByRole("dialog", { name: "Tags Input · 组件参数", exact: true })
			.locator('[data-tuning-current] [data-slot="tags-input"]')
			.first();
		await expect(root).toHaveCSS("padding-left", "14px");
		await setNumber(page, "外层留白（px）", 2);
		await expect(root).toHaveCSS("padding-left", "2px");
	} finally {
		expect([original, written], "Concurrent edit detected; refusing to overwrite").toContain(
			readFileSync(file, "utf8")
		);
		writeFileSync(file, original);
		execFileSync("pnpm", ["build:registry"], { stdio: "pipe" });
	}
});
