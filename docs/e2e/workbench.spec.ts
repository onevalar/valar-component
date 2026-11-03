import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect, devices, type Page } from "@playwright/test";
import { applyStyleOverrides } from "../src/lib/features/workbench/style-overrides.js";

async function setNumber(page: Page, label: string, value: number) {
	const control = page.getByRole("slider", { name: label, exact: true });
	await control.scrollIntoViewIfNeeded();
	await control.press("Enter");
	const input = page.getByRole("textbox", { name: `${label} value`, exact: true });
	await input.fill(String(value));
	await input.press("Enter");
}

for (const sample of [
	{
		slug: "field",
		title: "Field",
		label: "字段组间距（基准 px）",
		value: 46,
		selector: '[data-slot="field-group"]',
		property: "row-gap",
		baseline: "20px",
	},
	{
		slug: "form",
		title: "Form",
		label: "表单项内部间距（基准 px）",
		value: 22,
		selector: '[data-slot="form-item"] > label',
		property: "margin-bottom",
		baseline: "8px",
	},
	{
		slug: "label",
		title: "Label",
		label: "图文间距（基准 px）",
		value: 22,
		selector: '[data-slot="label"]',
		property: "column-gap",
		baseline: "8px",
	},
	{
		slug: "collapsible",
		title: "Collapsible",
		label: "内容横向留白（px 基准）",
		value: 30,
		selector: '[data-slot="collapsible-content"]',
		property: "padding-left",
		baseline: "0px",
	},
	{
		slug: "separator",
		title: "Separator",
		label: "横向粗细（px 基准）",
		value: 7,
		selector: '[data-slot="separator"][data-orientation="horizontal"]',
		property: "height",
		baseline: "1px",
	},
	{
		slug: "resizable",
		title: "Resizable",
		label: "左右分栏线宽（px）",
		value: 3,
		selector: '[data-slot="resizable-handle"]',
		property: "width",
		baseline: "1px",
	},
	{
		slug: "scroll-area",
		title: "Scroll Area",
		label: "纵向滚动条宽（px）",
		value: 22,
		selector: '[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]',
		property: "width",
		baseline: "10px",
	},
	{
		slug: "message-scroller",
		title: "Message Scroller",
		label: "消息间距（基准 px）",
		value: 46,
		selector: '[data-slot="message-scroller-content"]',
		property: "row-gap",
		baseline: "32px",
	},
	{
		slug: "marker",
		title: "Marker",
		label: "Border 底部留白（基准 px）",
		value: 22,
		selector: '[data-slot="marker"][data-variant="border"]',
		property: "padding-bottom",
		baseline: "8px",
	},
] as const) {
	test(`E14 ${sample.title} editor previews isolated geometry and restores versions`, async ({
		page,
	}) => {
		test.setTimeout(60_000);
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		const route = sample.slug === "form" ? "/docs/forms" : `/docs/components/${sample.slug}`;
		await page.goto(route, { waitUntil: "networkidle" });
		const opener = page.getByRole("button", { name: `微调 ${sample.title}`, exact: true }).first();
		await opener.click();
		const editor = page.getByRole("dialog", { name: `${sample.title} · 组件参数`, exact: true });
		await expect(editor.getByTestId(`${sample.slug}-dials`)).toBeVisible();
		const current = editor.locator("[data-tuning-current]");
		const subject = current.locator(sample.selector).first();
		await expect(subject).toHaveCSS(sample.property, sample.baseline);
		await setNumber(page, sample.label, sample.value);
		await expect(subject).toHaveCSS(sample.property, `${sample.value}px`);
		await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
		await expect(editor.locator("[data-tuning-before]").locator(sample.selector).first()).toHaveCSS(
			sample.property,
			sample.baseline
		);
		await editor.getByRole("radio", { name: "深色", exact: true }).click();
		await page.setViewportSize({ width: 390, height: 1000 });
		await expect(subject).toHaveCSS(sample.property, `${sample.value}px`);
		expect(await current.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
			true
		);
		await editor
			.getByRole("textbox", { name: `${sample.title} 版本名称`, exact: true })
			.fill("E14 宽松");
		await editor.getByRole("button", { name: "保存版本", exact: true }).click();
		await expect(
			editor.getByRole("status").filter({ hasText: "已保存「E14 宽松」" })
		).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(opener).toBeFocused();
		await page.reload({ waitUntil: "networkidle" });
		await page
			.getByRole("combobox", { name: `${sample.title} 使用版本`, exact: true })
			.first()
			.selectOption({ label: "E14 宽松" });
		await opener.click();
		await expect(editor.getByRole("slider", { name: sample.label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			String(sample.value)
		);
		await expect(
			editor.locator("[data-tuning-current]").locator(sample.selector).first()
		).toHaveCSS(sample.property, `${sample.value}px`);
		expect(errors).toEqual([]);
	});
}

test("E14 Aspect Ratio separates saved boundaries from temporary aspect ratios", async ({
	page,
}) => {
	await page.goto("/docs/components/aspect-ratio", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Aspect Ratio", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Aspect Ratio · 组件参数", exact: true });
	const current = editor.locator("[data-tuning-current]");
	const ratio = current.locator('[data-slot="aspect-ratio"]');
	await expect(ratio).toHaveCSS("overflow", "visible");
	await editor.getByRole("button", { name: /^容器圆角/ }).click();
	await page.getByRole("option", { name: "lg · 1 × 基数", exact: true }).click();
	await expect(ratio).toHaveCSS("border-top-left-radius", "10px");
	await expect(ratio).toHaveCSS("overflow", "visible");
	await editor.getByRole("button", { name: /^内容裁切/ }).click();
	await page.getByRole("option", { name: "裁切溢出内容", exact: true }).click();
	await expect(ratio).toHaveCSS("overflow", "hidden");
	await current.getByLabel("场景宽高比（不保存）").selectOption({ label: "1:1 方形" });
	const square = await ratio.boundingBox();
	expect(Math.abs(square!.width - square!.height)).toBeLessThan(1);
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator('[data-tuning-before] [data-slot="aspect-ratio"]');
	await expect(before).toHaveCSS("overflow", "visible");
	await expect(before).toHaveCSS("border-top-left-radius", "0px");
	await editor
		.getByRole("textbox", { name: "Aspect Ratio 版本名称", exact: true })
		.fill("E14 媒体边界");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await page.keyboard.press("Escape");
	await expect(opener).toBeFocused();
	await page.reload({ waitUntil: "networkidle" });
	await page
		.getByRole("combobox", { name: "Aspect Ratio 使用版本", exact: true })
		.selectOption({ label: "E14 媒体边界" });
	await opener.click();
	await expect(ratio).toHaveCSS("overflow", "hidden");
	await expect(ratio).toHaveCSS("border-top-left-radius", "10px");
	await expect(current.getByLabel("场景宽高比（不保存）")).toHaveValue("0");
});

test("E14 Form uses real local validation, accessible errors and independent resets", async ({
	page,
}) => {
	await page.goto("/docs/forms", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Form", exact: true }).click();
	const editor = page.getByRole("dialog", { name: "Form · 组件参数", exact: true });
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const current = editor.locator("[data-tuning-current]");
	const before = editor.locator("[data-tuning-before]");
	const name = current.getByRole("textbox", { name: "联系人姓名（必填）", exact: true });
	await current.getByRole("button", { name: "本地校验并提交", exact: true }).click();
	await expect(name).toHaveAttribute("aria-invalid", "true");
	await expect(
		current.getByText("请填写至少两个字符的联系人姓名。", { exact: true })
	).toBeVisible();
	await expect(
		before.getByRole("textbox", { name: "联系人姓名（必填）", exact: true })
	).not.toHaveAttribute("aria-invalid", "true");
	await name.fill("本地联系人");
	await setNumber(page, "表单项内部间距（基准 px）", 22);
	await expect(name).toHaveValue("本地联系人");
	await current.getByRole("button", { name: "本地校验并提交", exact: true }).click();
	await expect(current.getByRole("status")).toContainText("成功提交 1 次");
	await expect(before.getByRole("status")).toContainText("成功提交 0 次");
	await current.getByRole("button", { name: "重置表单", exact: true }).click();
	await expect(name).toHaveValue("");
	await expect(name).not.toHaveAttribute("aria-invalid", "true");
	await expect(current.getByRole("status")).toContainText("成功提交 0 次");
});

test("E14 labels, collapsible state and separator semantics remain real and isolated", async ({
	page,
}) => {
	await page.goto("/docs/components/label", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Label", exact: true }).click();
	let editor = page.getByRole("dialog", { name: "Label · 组件参数", exact: true });
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	let current = editor.locator("[data-tuning-current]");
	await current.locator("label").filter({ hasText: "电子邮箱（必填）" }).click();
	await expect(
		current.getByRole("textbox", { name: "电子邮箱（必填）", exact: true })
	).toBeFocused();
	await current.locator("label").filter({ hasText: "接收产品更新" }).click();
	await expect(current.getByRole("checkbox").first()).toBeChecked();
	await expect(
		editor.locator("[data-tuning-before]").getByRole("checkbox").first()
	).not.toBeChecked();
	await page.keyboard.press("Escape");
	await page.goto("/docs/components/collapsible", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Collapsible", exact: true }).click();
	editor = page.getByRole("dialog", { name: "Collapsible · 组件参数", exact: true });
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	current = editor.locator("[data-tuning-current]");
	await current.getByRole("button", { name: "收起高级设置", exact: true }).press("Space");
	await expect(current.getByRole("button", { name: "展开高级设置", exact: true })).toHaveAttribute(
		"aria-expanded",
		"false"
	);
	await expect(
		editor
			.locator("[data-tuning-before]")
			.getByRole("button", { name: "收起高级设置", exact: true })
	).toHaveAttribute("aria-expanded", "true");
	await current.getByRole("button", { name: "禁用折叠区", exact: true }).click();
	await expect(current.getByRole("button", { name: "展开高级设置", exact: true })).toBeDisabled();
	await page.keyboard.press("Escape");
	await page.goto("/docs/components/separator", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Separator", exact: true }).click();
	editor = page.getByRole("dialog", { name: "Separator · 组件参数", exact: true });
	current = editor.locator("[data-tuning-current]");
	await expect(current.getByRole("separator")).toHaveCount(2);
	await current.getByRole("button", { name: "切换为装饰分隔", exact: true }).click();
	await expect(current.getByRole("separator")).toHaveCount(0);
	await expect(current.locator('[data-slot="separator"]')).toHaveCount(4);
});

test("E14 Resizable and Scroll Area preserve native keyboard interaction across panes", async ({
	page,
}) => {
	await page.goto("/docs/components/resizable", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Resizable", exact: true }).click();
	let editor = page.getByRole("dialog", { name: "Resizable · 组件参数", exact: true });
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	let current = editor.locator("[data-tuning-current]");
	const handle = current.getByRole("separator", { name: "调整导航与内容分栏", exact: true });
	await handle.focus();
	const start = Number(await handle.getAttribute("aria-valuenow"));
	await handle.press("ArrowRight");
	await expect
		.poll(async () => Number(await handle.getAttribute("aria-valuenow")))
		.toBeGreaterThan(start);
	await expect(
		editor.locator('[data-tuning-before] [data-slot="resizable-handle"]')
	).toHaveAttribute("aria-valuenow", "40");
	await current.getByLabel("演示方向（不保存）").selectOption("vertical");
	await setNumber(page, "上下分栏线宽（px）", 4);
	await expect(handle).toHaveCSS("height", "4px");
	await page.keyboard.press("Escape");
	await page.goto("/docs/components/scroll-area", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Scroll Area", exact: true }).click();
	editor = page.getByRole("dialog", { name: "Scroll Area · 组件参数", exact: true });
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	current = editor.locator("[data-tuning-current]");
	const viewport = current.getByRole("region", { name: "草稿 · 可滚动文件列表", exact: true });
	await viewport.focus();
	await viewport.press("PageDown");
	await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
	await expect(
		editor.locator('[data-tuning-before] [data-slot="scroll-area-viewport"]')
	).toHaveJSProperty("scrollTop", 0);
});

test("E14 message previews isolate history, streams, statuses and teardown", async ({ page }) => {
	await page.goto("/docs/components/message-scroller", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Message Scroller", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Message Scroller · 组件参数", exact: true });
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const current = editor.locator("[data-tuning-current]");
	const before = editor.locator("[data-tuning-before]");
	await current.getByRole("button", { name: "加载历史", exact: true }).click();
	await expect(current.locator('[data-slot="message-scroller-item"]')).toHaveCount(8);
	await expect(before.locator('[data-slot="message-scroller-item"]')).toHaveCount(6);
	await current.getByRole("button", { name: "本地流式回复", exact: true }).click();
	await expect(current.getByRole("log")).toHaveAttribute("aria-busy", "true");
	await expect(before.getByRole("log")).toHaveAttribute("aria-busy", "false");
	await expect(current.getByRole("log")).toHaveAttribute("aria-busy", "false", { timeout: 5_000 });
	await expect(current.getByText(/定时器会在停止、画布关闭或卸载时清理/)).toBeAttached();
	await current.getByRole("button", { name: "开启新回合", exact: true }).click();
	await expect(current.locator('[data-slot="message-scroller-item"]')).toHaveCount(10);
	await page.keyboard.press("Escape");
	await expect(opener).toBeFocused();
	await page.goto("/docs/components/marker", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Marker", exact: true }).click();
	const marker = page.getByRole("dialog", { name: "Marker · 组件参数", exact: true });
	await marker.getByRole("radio", { name: "并排对比", exact: true }).click();
	await marker
		.locator("[data-tuning-current]")
		.getByRole("button", { name: "切换运行／完成状态", exact: true })
		.click();
	await expect(
		marker.locator('[data-tuning-current] [data-slot="marker"][role="status"]').first()
	).toContainText("本地会话检查已完成");
	await expect(
		marker.locator('[data-tuning-before] [data-slot="marker"][role="status"]').first()
	).toContainText("正在检查本地会话");
	await expect(marker.locator('[data-slot="marker"][role="separator"]')).toHaveCount(0);
});

for (const sample of [
	{
		slug: "calendar",
		title: "Calendar",
		label: "日期格子边长（px）",
		value: 36,
		selector: '[data-slot="calendar"]',
		property: "--cell-size",
		expected: "36px",
		style: "nova",
	},
	{
		slug: "range-calendar",
		title: "Range Calendar",
		label: "日期格子边长（px）",
		value: 24,
		selector: '[data-slot="range-calendar"]',
		property: "--cell-size",
		expected: "24px",
		style: "nova",
	},
	{
		slug: "command",
		title: "Command",
		label: "命令项横向留白（px）",
		value: 22,
		selector: '[data-slot="command-item"]',
		property: "padding-left",
		expected: "22px",
		style: "nova",
	},
	{
		slug: "carousel",
		title: "Carousel",
		label: "幻灯片间距（px）",
		value: 30,
		selector: '[data-slot="carousel-item"][data-orientation="horizontal"]',
		property: "padding-inline-start",
		expected: "30px",
		style: "nova",
	},
	{
		slug: "color-picker",
		title: "Color Picker",
		label: "标签与触发器间距（px）",
		value: 14,
		selector: '[data-slot="color-picker"]',
		property: "row-gap",
		expected: "14px",
		style: "nova",
	},
	{
		slug: "attachment",
		title: "Attachment",
		label: "Default 留白（px，纯文字横向 +2）",
		value: 14,
		selector: '[data-slot="attachment"][data-size="default"]:has([data-slot="attachment-media"])',
		property: "padding-left",
		expected: "14px",
		style: "rhea",
	},
	{
		slug: "bubble",
		title: "Bubble",
		label: "普通气泡横向留白（px）",
		value: 30,
		selector: '[data-slot="bubble"]:not([data-variant="ghost"]) > [data-slot="bubble-content"]',
		property: "padding-left",
		expected: "30px",
		style: "rhea",
	},
	{
		slug: "message",
		title: "Message",
		label: "头像与正文间距（px）",
		value: 30,
		selector: '[data-slot="message"]',
		property: "column-gap",
		expected: "30px",
		style: "rhea",
	},
	{
		slug: "code-block",
		title: "Code Block",
		label: "默认横向留白（px）",
		value: 30,
		selector: '[data-slot="code-block"][data-size="default"] > [data-slot="code-block-content"]',
		property: "padding-left",
		expected: "30px",
		style: "rhea",
	},
	{
		slug: "trace",
		title: "Trace",
		label: "列表间距（px）",
		value: 22,
		selector: '[data-slot="trace"]',
		property: "row-gap",
		expected: "22px",
		style: "rhea",
	},
	{
		slug: "stepper",
		title: "Stepper",
		label: "根布局间距（px）",
		value: 30,
		selector: '[data-slot="stepper"]',
		property: "row-gap",
		expected: "30px",
		style: "nova",
	},
	{
		slug: "questionnaire",
		title: "Questionnaire",
		label: "选项横向留白（px）",
		value: 22,
		selector: '[data-slot="questionnaire-choice"]',
		property: "padding-left",
		expected: "22px",
		style: "nova",
	},
] as const) {
	test(`P3 ${sample.title} editor isolates drafts and restores saved geometry`, async ({
		page,
	}) => {
		test.setTimeout(60_000);
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`/docs/components/${sample.slug}`, { waitUntil: "networkidle" });
		const opener = page.getByRole("button", { name: `微调 ${sample.title}`, exact: true });
		await opener.click();
		const editor = page.getByRole("dialog", { name: `${sample.title} · 组件参数`, exact: true });
		await expect(editor.getByTestId(`${sample.slug}-dials`)).toBeVisible();
		await expect(editor.locator('[data-slot="dialog-description"]')).toContainText(
			`${sample.style} ·`
		);
		const current = editor.locator("[data-tuning-current]");
		const subject = current.locator(sample.selector).first();
		const baseline = await subject.evaluate(
			(element, property) => getComputedStyle(element).getPropertyValue(property),
			sample.property
		);
		expect(baseline).not.toBe(sample.expected);
		await setNumber(page, sample.label, sample.value);
		await expect(subject).toHaveCSS(sample.property, sample.expected);
		await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
		await expect(editor.locator("[data-tuning-before]").locator(sample.selector).first()).toHaveCSS(
			sample.property,
			baseline
		);
		await editor.getByRole("radio", { name: "深色", exact: true }).click();
		await page.setViewportSize({ width: 390, height: 1000 });
		await expect(subject).toHaveCSS(sample.property, sample.expected);
		expect(await current.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
			true
		);
		await editor
			.getByRole("textbox", { name: `${sample.title} 版本名称`, exact: true })
			.fill("P3 密度");
		await editor.getByRole("button", { name: "保存版本", exact: true }).click();
		await expect(editor.getByRole("status").filter({ hasText: "已保存「P3 密度」" })).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(opener).toBeFocused();
		await page.reload({ waitUntil: "networkidle" });
		await page
			.getByRole("combobox", { name: `${sample.title} 使用版本`, exact: true })
			.selectOption({ label: "P3 密度" });
		await opener.click();
		await expect(page.getByRole("slider", { name: sample.label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			String(sample.value)
		);
		await expect(
			editor.locator("[data-tuning-current]").locator(sample.selector).first()
		).toHaveCSS(sample.property, sample.expected);
		expect(errors).toEqual([]);
	});
}

test("Questionnaire editor preserves answers while tuning and isolates comparison forms", async ({
	page,
}) => {
	await page.goto("/docs/components/questionnaire", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Questionnaire", exact: true }).click();
	const editor = page.getByRole("dialog", { name: "Questionnaire · 组件参数", exact: true });
	const current = editor.locator("[data-tuning-current]");
	const form = current.getByRole("form", { name: "草稿本地问卷" });
	await editor.getByRole("button", { name: "草稿问卷：下一步", exact: true }).click();
	await expect(form.locator('[aria-invalid="true"]').first()).toBeVisible();
	await current
		.getByRole("textbox", { name: "草稿问卷的其他完善方向", exact: true })
		.fill("保持真实公开接口");
	await setNumber(page, "选项横向留白（px）", 22);
	await expect(
		current.getByRole("textbox", { name: "草稿问卷的其他完善方向", exact: true })
	).toHaveValue("保持真实公开接口");
	await current.getByRole("button", { name: "草稿问卷：下一步", exact: true }).click();
	for (const name of ["当前进度", "风险与阻碍"]) {
		const choice = current.getByRole("checkbox", { name, exact: true });
		await choice.focus();
		await choice.press("Space");
		await expect(choice).toBeChecked();
	}
	await current
		.getByRole("textbox", { name: "草稿问卷的其他进度信息", exact: true })
		.fill("可重复验收");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(
		before.getByRole("textbox", { name: "对照问卷的其他完善方向", exact: true })
	).toHaveValue("");
	await current.getByRole("button", { name: "草稿问卷：下一步", exact: true }).click();
	await current.getByRole("textbox", { name: "草稿问卷的补充备注", exact: true }).fill("");
	await current.getByRole("button", { name: "草稿问卷：提交答案", exact: true }).click();
	await expect(current.getByRole("status")).toContainText("本地提交 0 次");
	await current.getByRole("button", { name: "草稿问卷：跳过备注", exact: true }).click();
	await expect(current.getByRole("status")).toContainText("本地提交 1 次");
	expect(await form.evaluate((element) => [...new FormData(element as HTMLFormElement)])).toEqual([
		["direction", "保持真实公开接口"],
		["signals", "progress"],
		["signals", "risks"],
		["signals", "可重复验收"],
	]);
	await expect(before.getByRole("status")).toContainText("本地提交 0 次");
	await current.getByRole("button", { name: "草稿问卷：恢复默认答案", exact: true }).click();
	await expect(
		current.getByRole("textbox", { name: "草稿问卷的其他完善方向", exact: true })
	).toHaveValue("");
	await expect(current.getByRole("status")).toContainText("本地提交 0 次");
});

test("Chart editor scopes real portaled tooltips and preserves accessible data", async ({
	page,
}) => {
	await page.goto("/docs/components/chart", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "微调 Chart", exact: true }).click();
	const editor = page.getByRole("dialog", { name: "Chart · 组件参数", exact: true });
	const current = editor.locator("[data-tuning-current]");
	await expect(editor.getByTestId("chart-dials")).toBeVisible();
	await setNumber(page, "横向留白（基准 px）", 24);
	await setNumber(page, "纵向留白（基准 px）", 2);
	await setNumber(page, "标题／系列区间距（基准 px）", 14);
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	await current.locator("[data-chart]").hover({ position: { x: 120, y: 100 } });
	const tooltip = current.locator('[data-slot="chart-tooltip"]');
	await expect(tooltip).toBeVisible();
	await expect(tooltip).toHaveCSS("padding-left", "24px");
	await expect(tooltip).toHaveCSS("padding-top", "2px");
	await expect(tooltip).toHaveCSS("row-gap", "14px");
	expect(await tooltip.evaluate((element) => element.closest("[data-chart]") !== null)).toBe(true);
	await expect(current.getByRole("table")).toContainText("305");
	const before = editor.locator("[data-tuning-before]");
	await before.locator("[data-chart]").hover({ position: { x: 120, y: 100 } });
	await expect(before.locator('[data-slot="chart-tooltip"]')).toHaveCSS("padding-left", "10px");
	await current.getByRole("combobox", { name: "图表类型（仅预览）" }).selectOption("line");
	await current.locator("[data-chart]").hover({ position: { x: 150, y: 100 } });
	await expect(tooltip).toBeVisible();
	await expect(tooltip).toHaveCSS("padding-left", "24px");
	await expect(before.getByRole("combobox", { name: "图表类型（仅预览）" })).toHaveValue("bar");
	await editor.getByRole("textbox", { name: "Chart 版本名称", exact: true }).fill("图表提示留白");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await page.keyboard.press("Escape");
	await page.reload({ waitUntil: "networkidle" });
	await page
		.getByRole("combobox", { name: "Chart 使用版本", exact: true })
		.selectOption({ label: "图表提示留白" });
	await page.getByRole("button", { name: "微调 Chart", exact: true }).click();
	await expect(
		page.getByRole("slider", { name: "横向留白（基准 px）", exact: true })
	).toHaveAttribute("aria-valuenow", "24");
});

test("Sidebar editor isolates cookies, breakpoint portals and nested Escape", async ({
	page,
	context,
}) => {
	test.setTimeout(60_000);
	await context.addCookies([
		{
			name: "sidebar_state",
			value: "sentinel",
			url: new URL(test.info().project.use.baseURL!).origin,
		},
	]);
	await page.goto("/docs/components/sidebar", { waitUntil: "domcontentloaded" });
	const opener = page.getByRole("button", { name: "微调 Sidebar", exact: true });
	const sample = page.frameLocator('iframe[data-preview-frame="sidebar"]');
	await expect(sample.locator("[data-preview-ready]")).toBeVisible();
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Sidebar · 组件参数", exact: true });
	await expect(editor.getByTestId("sidebar-dials")).toBeVisible();
	await setNumber(page, "展开宽度（标称 px）", 320);
	await setNumber(page, "菜单间距（标称 px）", 7);
	await editor.getByRole("combobox", { name: "草稿侧栏预览窗口", exact: true }).selectOption("768");
	const current = editor.frameLocator("[data-tuning-current] iframe");
	await expect(current.locator('[data-slot="sidebar-container"]')).toHaveCSS("width", "320px");
	await current.getByTestId("sidebar-main-action").click();
	await page.keyboard.press("Control+b");
	await expect(current.locator('[data-slot="sidebar"][data-state]')).toHaveAttribute(
		"data-state",
		"collapsed"
	);
	await expect(current.locator('[data-slot="sidebar-container"]')).toHaveCSS("width", "48px");
	expect((await context.cookies()).find((cookie) => cookie.name === "sidebar_state")?.value).toBe(
		"sentinel"
	);
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	await editor.getByRole("combobox", { name: "对照侧栏预览窗口", exact: true }).selectOption("768");
	const before = editor.frameLocator("[data-tuning-before] iframe");
	await expect(before.locator('[data-slot="sidebar"][data-state]')).toHaveAttribute(
		"data-state",
		"expanded"
	);
	await expect(before.locator('[data-slot="sidebar-container"]')).toHaveCSS("width", "256px");
	await editor.getByRole("textbox", { name: "Sidebar 版本名称", exact: true }).fill("侧栏密度");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await editor.getByRole("combobox", { name: "草稿侧栏预览窗口", exact: true }).selectOption("767");
	await current.getByRole("button", { name: "切换侧边栏", exact: true }).click();
	await expect(current.getByRole("dialog")).toBeVisible();
	await expect(current.locator('[data-slot="sidebar-menu"]').first()).toHaveCSS("row-gap", "7px");
	await expect(before.getByRole("dialog")).toHaveCount(0);
	await page.keyboard.press("Escape");
	await expect(current.getByRole("dialog")).toHaveCount(0);
	await expect(editor).toBeVisible();
	await expect(current.getByRole("button", { name: "切换侧边栏", exact: true })).toBeFocused();
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	await page.reload({ waitUntil: "domcontentloaded" });
	await page
		.getByRole("combobox", { name: "Sidebar 使用版本", exact: true })
		.selectOption({ label: "侧栏密度" });
	await expect(sample.locator('[data-slot="sidebar-wrapper"]')).toHaveCSS(
		"--sidebar-width-default",
		"20rem"
	);
});

test("Sonner editor isolates notification stores and leaves unstyled layout untouched", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/sonner", { waitUntil: "networkidle" });
	const showToast = page
		.getByRole("region", { name: "Sonner 样式微调", exact: true })
		.getByRole("button", { name: "Show Toast", exact: true });
	await showToast.click();
	await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
	const opener = page.getByRole("button", { name: "微调 Sonner", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Sonner · 组件参数", exact: true });
	await expect(editor.getByTestId("sonner-dials")).toBeVisible();
	const current = editor.frameLocator("[data-tuning-current] iframe");
	await expect(current.locator('[data-sonner-toast][data-styled="true"]').first()).toHaveCSS(
		"padding-left",
		"16px"
	);
	await setNumber(page, "横向留白（标称 px）", 30);
	await setNumber(page, "纵向留白（标称 px）", 2);
	await setNumber(page, "图文间距（标称 px）", 14);
	await expect(current.locator('[data-sonner-toast]:not([data-removed="true"])').first()).toHaveCSS(
		"padding-left",
		"30px"
	);
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.frameLocator("[data-tuning-before] iframe");
	await expect(before.locator("[data-sonner-toast]").first()).toHaveCSS("padding-left", "16px");
	await current.getByRole("button", { name: "无样式通知", exact: true }).click();
	await expect(current.locator('[data-sonner-toast][data-styled="false"]')).toHaveCSS(
		"padding-left",
		"0px"
	);
	await expect(current.locator('[data-sonner-toast][data-styled="false"]')).toHaveCSS(
		"gap",
		"normal"
	);
	await current.getByRole("button", { name: "清空通知", exact: true }).click();
	await expect(current.locator("[data-sonner-toast]")).toHaveCount(0);
	await expect(before.locator("[data-sonner-toast]")).toHaveCount(1);
	await current.getByRole("button", { name: "本地 Promise", exact: true }).click();
	await expect(current.locator("[data-sonner-toast]")).toContainText("本地导出已完成");
	await expect(before.locator("[data-sonner-toast]")).toContainText("报告已保存");
	await editor.getByRole("textbox", { name: "Sonner 版本名称", exact: true }).fill("通知密度");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await current.getByRole("button", { name: "本地 Promise", exact: true }).focus();
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	await page.reload({ waitUntil: "networkidle" });
	await page
		.getByRole("combobox", { name: "Sonner 使用版本", exact: true })
		.selectOption({ label: "通知密度" });
	await showToast.click();
	await expect(page.locator('[data-sonner-toast][data-styled="true"]')).toHaveCSS(
		"padding-left",
		"30px"
	);
});

test("Color Picker editor contains independent panels and applies saved width to the real page portal", async ({
	page,
}) => {
	await page.goto("/docs/components/color-picker", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Color Picker", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Color Picker · 组件参数", exact: true });
	await expect(editor.getByTestId("color-picker-dials")).toBeVisible();
	await setNumber(page, "自有面板宽度（px）", 320);
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const current = editor.locator("[data-tuning-current]");
	const before = editor.locator("[data-tuning-before]");
	const trigger = (pane: typeof current) =>
		pane.getByRole("button", { name: "演示颜色 #1e40af", exact: true });
	await trigger(before).click();
	await trigger(current).click();
	const panel = (pane: typeof current) => pane.locator('[data-slot="color-picker-content"]');
	await expect(panel(current)).toHaveCSS("width", "320px");
	await expect(panel(before)).toHaveCSS("width", "256px");
	const hex = current.getByRole("textbox", { name: "演示颜色：十六进制", exact: true });
	await hex.fill("#abc");
	await hex.press("Enter");
	await expect(current.locator('input[name="color"]')).toHaveValue("#aabbcc");
	await expect(before.locator('input[name="color"]')).toHaveValue("#1e40af");
	await current.getByRole("button", { name: "查看颜色提交值", exact: true }).click();
	await expect(current.locator("output")).toHaveText('{"color":"#aabbcc"}');
	await page.setViewportSize({ width: 390, height: 1000 });
	for (const pane of [before, current]) {
		const bounds = await pane.boundingBox();
		const content = await panel(pane).boundingBox();
		expect(content!.x).toBeGreaterThanOrEqual(bounds!.x);
		expect(content!.x + content!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width);
		expect(content!.y).toBeGreaterThanOrEqual(bounds!.y);
		expect(content!.y + content!.height).toBeLessThanOrEqual(bounds!.y + bounds!.height);
	}
	await hex.focus();
	await page.keyboard.press("Escape");
	await expect(panel(current)).toBeHidden();
	await expect(editor).toBeVisible();
	await expect(
		current.getByRole("button", { name: "演示颜色 #aabbcc", exact: true })
	).toBeFocused();
	await before.getByRole("textbox", { name: "演示颜色：十六进制", exact: true }).focus();
	await page.keyboard.press("Escape");
	await expect(panel(before)).toBeHidden();
	await editor.getByRole("textbox", { name: "Color Picker 版本名称", exact: true }).fill("宽面板");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await page.keyboard.press("Escape");
	await expect(opener).toBeFocused();
	await page.locator('.sample [data-slot="color-picker"] button').first().click();
	const pagePanel = page.locator(
		'[data-slot="color-picker-content"]:not([data-color-picker-editor])'
	);
	await expect(pagePanel).toHaveCSS("width", "320px");
	expect(await pagePanel.evaluate((element) => element.closest(".sample"))).toBeNull();
});

// Opt-in because this contract writes local development sources. Run alone with --workers 1.
test("Avatar editor dev writeback refreshes the registry baseline and subsequent important badge drafts", async ({
	page,
}) => {
	test.skip(
		process.env.E2E_WRITEBACK !== "1",
		"Requires a development server and explicit source-write opt-in"
	);
	test.setTimeout(120_000);
	const file = resolve("src/lib/registry/styles/valar/style-nova.css");
	const original = readFileSync(file, "utf8");
	const written = applyStyleOverrides(original, {
		style: "nova",
		classes: {
			"cn-avatar": "data-[size=sm]:size-7 size-11",
			"cn-avatar-group-count":
				"group-has-data-[size=sm]/avatar-group:size-7 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3.5 size-11 [&>svg]:size-5.5",
			"cn-avatar-badge":
				"group-data-[size=sm]/avatar:size-2.25! group-data-[size=default]/avatar:size-3.25!",
		},
	});
	try {
		await page.goto("/docs/components/avatar", { waitUntil: "networkidle" });
		await page.getByRole("button", { name: "微调 Avatar", exact: true }).click();
		await setNumber(page, "小 · 尺寸（px）", 28);
		await setNumber(page, "默认 · 尺寸（px）", 44);
		await page.getByRole("button", { name: "写回组件库…", exact: true }).click();
		const response = page.waitForResponse(
			(r) => r.url().endsWith("/__valar/style-overrides") && r.request().method() === "POST"
		);
		await page.getByRole("button", { name: "确认写回", exact: true }).click();
		const result = await response;
		expect(result.status()).toBe(200);
		expect(readFileSync(file, "utf8")).toBe(written);
		await expect(page.getByRole("button", { name: "微调 Avatar", exact: true })).toBeEnabled({
			timeout: 30_000,
		});
		await expect(page.locator('.sample [data-slot="avatar"]').first()).toHaveCSS("width", "44px");
		await page.getByRole("button", { name: "微调 Avatar", exact: true }).click();
		await expect(
			page.getByRole("slider", { name: "默认 · 尺寸（px）", exact: true })
		).toHaveAttribute("aria-valuenow", "44");
		const badge = page
			.getByRole("dialog", { name: "Avatar · 组件参数", exact: true })
			.locator('[data-tuning-current] [data-size="sm"] [data-slot="avatar-badge"]')
			.first();
		await expect(badge).toHaveCSS("width", "9px");
		await setNumber(page, "小 · 尺寸（px）", 64);
		await expect(badge).toHaveCSS("width", "18px");
	} finally {
		expect([original, written], "Concurrent style edits detected; refusing to overwrite").toContain(
			readFileSync(file, "utf8")
		);
		writeFileSync(file, original);
		execFileSync("pnpm", ["build:registry"], { cwd: process.cwd(), stdio: "pipe" });
	}
});

test("Number Field editor links outer height and buttons while preserving localized numeric forms", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/number-field", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Number Field", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Number Field · 组件参数", exact: true });
	await expect(editor.getByTestId("number-field-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const quantity = current.getByRole("spinbutton", { name: "数量", exact: true });
	const root = current.locator('[data-slot="number-field"]').first();
	await expect(root).toHaveCSS("height", "42px");
	await editor.getByRole("button", { name: /^外框高度档位/ }).click();
	await page.getByRole("option", { name: "同 Button 默认", exact: true }).click();
	await expect(root).toHaveCSS("height", "32px");
	await expect(quantity).toHaveCSS("height", "30px");
	const increment = current.getByRole("button", { name: "增大数量", exact: true });
	await expect(increment).toHaveCSS("height", "30px");
	await expect(increment).toHaveCSS("width", "30px");
	await setNumber(page, "数字区横向留白（px）", 14);
	await expect(quantity).toHaveCSS("padding-left", "14px");
	await editor.getByRole("button", { name: /^圆角档位/ }).click();
	await page.getByRole("option", { name: "none · 直角", exact: true }).click();
	await expect(root).toHaveCSS("border-radius", "0px");
	await expect(increment).toHaveCSS("border-start-end-radius", "0px");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.locator('[data-slot="number-field"]').first()).toHaveCSS("height", "42px");
	await quantity.press("Home");
	await expect(current.getByRole("button", { name: "减小数量", exact: true })).toBeDisabled();
	await quantity.press("End");
	await expect(increment).toBeDisabled();
	await quantity.fill("3");
	await quantity.press("ArrowUp");
	await expect(quantity).toHaveValue("4");
	await expect(before.getByRole("spinbutton", { name: "数量", exact: true })).toHaveValue("3");
	const decimal = current.getByRole("spinbutton", { name: "小数调整", exact: true });
	await decimal.fill("-1.26");
	await decimal.press("Tab");
	await expect(decimal).toHaveValue("-1.3");
	await current.getByRole("spinbutton", { name: "欧元金额", exact: true }).fill("1.234,56 €");
	await current.getByRole("spinbutton", { name: "比例", exact: true }).fill("25%");
	await current.getByRole("button", { name: "查看数字提交值", exact: true }).click();
	await expect(current.locator("output")).toContainText('"price":"1234.56"');
	await expect(current.locator("output")).toContainText('"rate":"0.25"');
	await expect(current.locator("output")).not.toContainText('"disabled"');
	await expect(current.getByRole("spinbutton", { name: "只读数量", exact: true })).toHaveAttribute(
		"readonly"
	);
	await expect(current.getByRole("spinbutton", { name: "禁用数量", exact: true })).toBeDisabled();
	await current.getByRole("button", { name: "重置演示数值", exact: true }).click();
	await expect(quantity).toHaveValue("3");
	await expect(decimal).toHaveValue("-1.2");
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "数字区横向留白（px）", 16);
	expect(await current.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor
		.getByRole("textbox", { name: "Number Field 版本名称", exact: true })
		.fill("数字密度");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await page.keyboard.press("Escape");
	await expect(opener).toBeFocused();
	await expect(page.locator('.sample [data-slot="number-field"]').first()).toHaveCSS(
		"height",
		"32px"
	);
});

test("Slider Field editor changes layout without changing child geometry or numeric synchronization", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/slider-field", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Slider Field", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Slider Field · 组件参数", exact: true });
	await expect(editor.getByTestId("slider-field-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const field = current.locator('[data-slot="slider-field"]').first();
	const number = field.getByRole("spinbutton", { name: "宽度", exact: true });
	const slider = field.getByRole("slider", { name: "宽度", exact: true });
	await setNumber(page, "滑块／数值列间距（px）", 30);
	await setNumber(page, "标签／控件行间距（px）", 22);
	await setNumber(page, "数值框宽度（px）", 184);
	await expect(field).toHaveCSS("column-gap", "30px");
	await expect(field).toHaveCSS("row-gap", "22px");
	await expect(field.locator('[data-slot="number-field"]')).toHaveCSS("width", "184px");
	await expect(field.locator('[data-slot="number-field"]')).toHaveCSS("height", "42px");
	await expect(field.locator('[data-slot="slider-track"]')).toHaveCSS("height", "4px");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.locator('[data-slot="number-field"]').first()).toHaveCSS("width", "128px");
	await number.fill("999");
	await expect(number).toHaveAttribute("aria-invalid", "true");
	await expect(slider).toHaveAttribute("aria-valuenow", "80");
	await number.fill("");
	await expect(slider).toHaveAttribute("aria-valuenow", "80");
	await slider.press("ArrowRight");
	await expect(number).toHaveValue("82");
	await expect(before.getByRole("spinbutton", { name: "宽度", exact: true })).toHaveValue("80");
	await slider.press("Home");
	await expect(number).toHaveValue("0");
	await slider.press("End");
	await expect(number).toHaveValue("200");
	await current.getByRole("spinbutton", { name: "偏移", exact: true }).fill("-2.75");
	await current.getByRole("button", { name: "提交本画布表单", exact: true }).click();
	await expect(current.getByRole("status")).toContainText('"offset":"-2.75"');
	await expect(current.getByRole("status")).not.toContainText('"disabled":');
	await expect(current.getByRole("spinbutton", { name: "禁用宽度", exact: true })).toBeDisabled();
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "滑块／数值列间距（px）", 32);
	await setNumber(page, "标签／控件行间距（px）", 24);
	await setNumber(page, "数值框宽度（px）", 192);
	expect(await current.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor
		.getByRole("textbox", { name: "Slider Field 版本名称", exact: true })
		.fill("组合布局");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await page.keyboard.press("Escape");
	await expect(opener).toBeFocused();
	await expect(page.locator('.sample [data-slot="number-field"]').first()).toHaveCSS(
		"width",
		"192px"
	);
});

test("Avatar editor links asymmetric sizes to badges and mixed group counts and preserves image recovery", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/avatar", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Avatar", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Avatar · 组件参数" });
	await expect(editor.getByTestId("avatar-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const root = current.locator('[data-slot="avatar"][data-size="sm"]').first();
	const badge = current
		.locator('[data-slot="avatar"][data-size="sm"] [data-slot="avatar-badge"]')
		.first();
	const mixed = current.locator(
		'[data-slot="avatar-group"][aria-label="混合尺寸协作成员"] [data-slot="avatar-group-count"]'
	);
	await expect(root.locator('[data-slot="avatar-image"]')).toBeVisible();
	await setNumber(page, "小 · 尺寸（px）", 64);
	await setNumber(page, "默认 · 尺寸（px）", 20);
	await setNumber(page, "大 · 尺寸（px）", 36);
	await expect(root).toHaveCSS("width", "64px");
	await expect(badge).toHaveCSS("width", "18px");
	await expect(badge.locator("svg")).toBeHidden();
	await expect(mixed).toHaveCSS("width", "64px");
	await expect(mixed.locator("svg")).toHaveCSS("width", "32px");
	await editor.getByRole("button", { name: /^圆角档位/ }).click();
	await page.getByRole("option", { name: "none · 直角", exact: true }).click();
	await expect(root).toHaveCSS("border-radius", "0px");
	await expect(root.locator('[data-slot="avatar-image"]')).toHaveCSS("border-radius", "0px");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.locator('[data-slot="avatar"][data-size="sm"]').first()).toHaveCSS(
		"width",
		"24px"
	);
	const members = current.locator('[data-slot="item-group"]');
	await current.getByRole("button", { name: "模拟成员图片失败", exact: true }).press("Enter");
	for (let index = 0; index < 3; index++) {
		await expect(members.locator('[data-slot="avatar-fallback"]').nth(index)).toBeVisible();
		await expect(members.locator('[data-slot="avatar-image"]').nth(index)).toBeHidden();
	}
	await expect(before.getByRole("status")).toContainText("使用本地成员图片");
	await current.getByRole("button", { name: "恢复成员图片", exact: true }).press("Space");
	for (let index = 0; index < 3; index++) {
		await expect(members.locator('[data-slot="avatar-image"]').nth(index)).toBeVisible();
		await expect(members.locator('[data-slot="avatar-fallback"]').nth(index)).toBeHidden();
	}
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "默认 · 尺寸（px）", 64);
	await setNumber(page, "大 · 尺寸（px）", 64);
	expect(await current.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor.getByRole("textbox", { name: "Avatar 版本名称", exact: true }).fill("头像联动");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	await expect(page.locator('.sample [data-slot="avatar"]').first()).toHaveCSS("width", "64px");
	await opener.click();
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	await editor.getByRole("combobox", { name: "Avatar 对比版本", exact: true }).selectOption("");
	await expect(editor.locator('[data-tuning-before] [data-slot="avatar"]').first()).toHaveCSS(
		"width",
		"24px"
	);
});

test("Item editor keeps independent size density and native list actions while comparing and saving", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/item", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Item", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Item · 组件参数" });
	await expect(editor.getByTestId("item-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const normal = current.locator('[data-item-sample="default-default"]');
	const small = current.locator('[data-item-sample="sm-outline"]');
	const tiny = current.locator('[data-item-sample="xs-muted"]');
	await expect(normal).not.toHaveAttribute("data-size");
	await expect(current.getByRole("list")).toHaveCount(3);
	await expect(current.getByRole("listitem")).toHaveCount(9);
	await setNumber(page, "默认 · 横向留白（px）", 30);
	await setNumber(page, "默认 · 纵向留白（px）", 2);
	await setNumber(page, "小 · 媒体／内容间距（px）", 22);
	await setNumber(page, "特小 · 横向留白（px）", 4);
	await expect(normal).toHaveCSS("padding-left", "30px");
	await expect(normal).toHaveCSS("padding-top", "2px");
	await expect(small).toHaveCSS("padding-left", "12px");
	await expect(small).toHaveCSS("gap", "22px");
	await expect(tiny).toHaveCSS("padding-left", "4px");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.locator('[data-item-sample="default-default"]')).toHaveCSS(
		"padding-left",
		"12px"
	);
	const action = normal.getByRole("button");
	const height = await action.evaluate((el) => el.getBoundingClientRect().height);
	await action.focus();
	await page.keyboard.press("Space");
	await expect(action).toHaveAttribute("aria-pressed", "true");
	await expect(before.getByRole("status")).toContainText("已标记 0 行");
	await current.getByRole("link", { name: "查看本画布的列表说明", exact: true }).click();
	await expect(page).toHaveURL(/#.*-current-help$/);
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	for (const size of ["默认", "小", "特小"]) {
		await setNumber(page, `${size} · 横向留白（px）`, 32);
		await setNumber(page, `${size} · 纵向留白（px）`, 24);
		await setNumber(page, `${size} · 媒体／内容间距（px）`, 24);
	}
	expect(await current.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	expect(await action.evaluate((el) => el.getBoundingClientRect().height)).toBe(height);
	await editor.getByRole("textbox", { name: "Item 版本名称", exact: true }).fill("列表密度");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	await expect(page.locator('.sample [data-slot="item"]').first()).toHaveCSS(
		"padding-left",
		"32px"
	);
});

test("Accordion editor keeps single and multiple keyboard behavior while aligning tuned content", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/accordion", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Accordion", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Accordion · 组件参数" });
	await expect(editor.getByTestId("accordion-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const triggers = current.locator('[data-slot="accordion-trigger"]');
	await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "true");
	await triggers.nth(0).focus();
	await page.keyboard.press("ArrowDown");
	await expect(triggers.nth(1)).toBeFocused();
	await page.keyboard.press("End");
	await expect(triggers.nth(1)).toBeFocused();
	await page.keyboard.press("Home");
	await expect(triggers.nth(0)).toBeFocused();
	await page.keyboard.press("ArrowUp");
	await expect(triggers.nth(1)).toBeFocused();
	await page.keyboard.press("Enter");
	await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");
	await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "false");
	await expect(triggers.nth(2)).toBeDisabled();
	await triggers.nth(3).focus();
	await page.keyboard.press("Space");
	await expect(triggers.nth(3)).toHaveAttribute("aria-expanded", "false");
	await expect(triggers.nth(4)).toHaveAttribute("aria-expanded", "true");
	await setNumber(page, "标题纵向留白（px）", 30);
	await setNumber(page, "标题／内容横向留白（px）", 22);
	await setNumber(page, "内容底部留白（px）", 38);
	await expect(triggers.nth(1)).toHaveCSS("padding-top", "30px");
	await expect(triggers.nth(1)).toHaveCSS("padding-left", "22px");
	await expect(current.locator('[data-slot="accordion-content"]').first()).toHaveCSS(
		"padding-left",
		"22px"
	);
	await expect(current.locator('[data-slot="accordion-content"] > div').first()).toHaveCSS(
		"padding-bottom",
		"38px"
	);
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.locator('[data-slot="accordion-trigger"]').first()).toHaveCSS(
		"padding-left",
		"0px"
	);
	await current.getByRole("button", { name: "切换演示标记", exact: true }).first().press("Enter");
	await expect(current.getByRole("status").first()).toContainText("已标记本组演示");
	await expect(before.getByRole("status").first()).toContainText("尚未标记本组演示");
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "标题／内容横向留白（px）", 32);
	expect(await current.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor.getByRole("textbox", { name: "Accordion 版本名称", exact: true }).fill("折叠区密度");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	await expect(page.locator('.sample [data-slot="accordion-trigger"]').first()).toHaveCSS(
		"padding-left",
		"32px"
	);
});

test("Alert Dialog editor preserves size variants and real confirmation focus, cancel and async failure", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/alert-dialog", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Alert Dialog", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Alert Dialog · 组件参数" });
	await expect(editor.getByTestId("alert-dialog-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const content = current.locator('[data-slot="alert-dialog-content"]');
	await setNumber(page, "内边距（px）", 30);
	await setNumber(page, "内容间距（px）", 22);
	await setNumber(page, "遮罩不透明度（%）", 40);
	await editor.getByRole("button", { name: /^默认尺寸宽度/ }).click();
	await page.getByRole("option", { name: "lg · 512px", exact: true }).click();
	await expect(content).toHaveCSS("padding", "30px");
	await expect(content).toHaveCSS("max-width", "512px");
	await expect(content).toHaveCSS("gap", "22px");
	await expect(current.locator('[data-slot="alert-dialog-footer"]')).toHaveCSS(
		"margin-left",
		"-30px"
	);
	await current.getByRole("button", { name: "小尺寸", exact: true }).click();
	await expect(content).toHaveCSS("max-width", "320px");
	const smallButtons = await current.locator('[data-slot="alert-dialog-footer"]').evaluate((el) =>
		[...el.querySelectorAll("button")].map((button) => {
			const rect = button.getBoundingClientRect();
			return { top: rect.top, left: rect.left, right: rect.right };
		})
	);
	expect(smallButtons[0].top).toBe(smallButtons[1].top);
	expect(smallButtons[0].right).toBeLessThan(smallButtons[1].left);
	await current.getByRole("button", { name: "默认尺寸", exact: true }).click();
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.locator('[data-slot="alert-dialog-content"]')).toHaveCSS("padding", "16px");
	await current.getByRole("button", { name: "真实确认流程", exact: true }).click();
	await expect(content).toHaveCount(0);
	const trigger = current.getByRole("button", { name: "打开确认预览", exact: true });
	await trigger.click();
	await expect(content).toBeFocused();
	await page.keyboard.press("Tab");
	await expect(current.getByRole("button", { name: "取消", exact: true })).toBeFocused();
	await page.keyboard.press("Shift+Tab");
	await expect(current.getByRole("button", { name: "删除演示项目", exact: true })).toBeFocused();
	await current.locator('[data-slot="alert-dialog-overlay"]').click({ position: { x: 8, y: 8 } });
	await expect(content).toBeVisible();
	await current.getByRole("button", { name: "取消", exact: true }).click();
	await expect(content).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await trigger.press("Enter");
	await current.getByRole("button", { name: "删除演示项目", exact: true }).click();
	await expect(current.locator('[data-slot="alert-dialog-action"]')).toBeDisabled();
	await expect(current.getByRole("status", { name: "正在模拟确认", exact: true })).toBeVisible();
	await expect(current.getByRole("button", { name: "取消", exact: true })).toBeDisabled();
	await expect(current.getByRole("alert")).toContainText("模拟保存失败");
	await expect(content).toBeVisible();
	await expect(before.getByRole("alert")).toHaveCount(0);
	await current.getByRole("button", { name: "重试删除演示", exact: true }).click();
	await expect(content).toHaveCount(0);
	await expect(current.getByRole("status")).toContainText("演示确认成功");
	await expect(trigger).toBeFocused();
	await trigger.click();
	await page.keyboard.press("Escape");
	await expect(content).toHaveCount(0);
	await expect(editor).toBeVisible();
	await current.getByRole("button", { name: "返回内联画布", exact: true }).click();
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "内边距（px）", 48);
	await setNumber(page, "内容间距（px）", 40);
	expect(await current.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor
		.getByRole("textbox", { name: "Alert Dialog 版本名称", exact: true })
		.fill("确认区布局");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	await page
		.getByRole("region", { name: "Alert Dialog 样式微调", exact: true })
		.getByRole("button", { name: "Show Dialog", exact: true })
		.click();
	await expect(page.getByRole("alertdialog")).toHaveCSS("padding", "48px");
	await page.keyboard.press("Escape");
});

test("Alert editor preserves icon columns and action reserves without replaying static alerts", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/alert", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Alert", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Alert · 组件参数" });
	await expect(editor.getByTestId("alert-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const plain = current.locator('[data-slot="alert"]').first();
	const action = current.locator("[data-alert-action-sample]");
	await expect(current.getByRole("region")).toHaveCount(4);
	await expect(current.getByRole("alert")).toHaveCount(0);
	await setNumber(page, "横向留白（px）", 30);
	await setNumber(page, "纵向留白（px）", 6);
	await setNumber(page, "标题说明间距（px）", 14);
	await expect(plain).toHaveCSS("padding-left", "30px");
	await expect(plain).toHaveCSS("padding-right", "30px");
	await expect(plain).toHaveCSS("padding-top", "6px");
	await expect(plain).toHaveCSS("row-gap", "14px");
	await expect(action).toHaveCSS("column-gap", "8px");
	await expect(action).toHaveCSS("padding-right", "72px");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.locator('[data-slot="alert"]').first()).toHaveCSS("padding-left", "10px");
	const undo = current.getByRole("button", { name: "撤销", exact: true });
	await undo.focus();
	await undo.press("Enter");
	await expect(current.getByRole("region", { name: "已撤销示例操作", exact: true })).toBeVisible();
	await expect(before.getByRole("region", { name: "示例项目已归档", exact: true })).toBeVisible();
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "横向留白（px）", 32);
	await setNumber(page, "纵向留白（px）", 24);
	await setNumber(page, "标题说明间距（px）", 16);
	expect(await current.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	const noOverlap = await action.evaluate((el) => {
		const text = el.querySelector('[data-slot="alert-title"]')!.getBoundingClientRect();
		const button = el.querySelector("button")!.getBoundingClientRect();
		return text.right <= button.left && button.right <= el.getBoundingClientRect().right;
	});
	expect(noOverlap).toBe(true);
	await editor.getByRole("textbox", { name: "Alert 版本名称", exact: true }).fill("提示区留白");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「提示区留白」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	await expect(page.locator('.sample [data-slot="alert"]').first()).toHaveCSS(
		"padding-left",
		"32px"
	);
});

test("Empty editor tunes only the root while keeping media, buttons and demo actions independent", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/empty", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Empty", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Empty · 组件参数" });
	await expect(editor.getByTestId("empty-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const root = current.locator('[data-slot="empty"]').first();
	await expect(current.locator('[data-slot="empty"]')).toHaveCount(3);
	await setNumber(page, "外层留白（px）", 54);
	await setNumber(page, "主区间距（px）", 30);
	await editor.getByRole("button", { name: /^圆角档位/ }).click();
	await page.getByRole("option", { name: "none · 直角", exact: true }).click();
	await expect(root).toHaveCSS("padding-top", "54px");
	await expect(root).toHaveCSS("gap", "30px");
	await expect(root).toHaveCSS("border-radius", "0px");
	await expect(root.locator('[data-slot="empty-header"]')).toHaveCSS("gap", "8px");
	await expect(root.locator('[data-slot="empty-content"]')).toHaveCSS("gap", "10px");
	await expect(current.locator('[data-slot="avatar"]')).toHaveCSS("width", "32px");
	const clear = current.getByRole("button", { name: "清除筛选", exact: true });
	await expect(clear).toHaveCSS("height", "32px");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.locator('[data-slot="empty"]').first()).toHaveCSS("padding-top", "24px");
	await clear.focus();
	await clear.press("Space");
	await expect(current.getByRole("status").first()).toHaveText(
		"已清除本画布的演示筛选，未查询任何数据。"
	);
	await expect(before.getByRole("status").first()).toBeEmpty();
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "外层留白（px）", 64);
	await setNumber(page, "主区间距（px）", 32);
	expect(await current.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await expect(current.getByRole("button", { name: "恢复筛选", exact: true })).toHaveCSS(
		"height",
		"32px"
	);
	await editor.getByRole("textbox", { name: "Empty 版本名称", exact: true }).fill("空状态留白");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(
		editor.getByRole("status").filter({ hasText: "已保存「空状态留白」" })
	).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	await expect(page.locator('.sample [data-slot="empty"]').first()).toHaveCSS(
		"padding-top",
		"64px"
	);
});

test("Badge editor preserves icon insets and native links while saving isolated geometry", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/badge", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Badge", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Badge · 组件参数" });
	await expect(editor.getByTestId("badge-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const plain = current.locator('span[data-slot="badge"]').first();
	await expect(current.locator('[data-slot="badge"]')).toHaveCount(24);
	await expect(current.getByRole("link")).toHaveCount(6);
	await setNumber(page, "文字侧水平留白（px）", 22);
	await setNumber(page, "图文间距（px）", 10);
	await editor.getByRole("button", { name: /^圆角档位/ }).click();
	await page.getByRole("option", { name: "none · 直角", exact: true }).click();
	await expect(plain).toHaveCSS("padding-left", "22px");
	await expect(plain).toHaveCSS("height", "20px");
	await expect(plain).toHaveCSS("gap", "10px");
	await expect(plain).toHaveCSS("border-radius", "0px");
	await expect(
		current.locator('[data-slot="badge"]:has([data-icon="inline-start"])').first()
	).toHaveCSS("padding-left", "6px");
	await expect(
		current.locator('[data-slot="badge"]:has([data-icon="inline-end"])').first()
	).toHaveCSS("padding-right", "6px");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	await expect(editor.locator('[data-tuning-before] [data-slot="badge"]').first()).toHaveCSS(
		"padding-left",
		"8px"
	);
	const link = current.getByRole("link", { name: "查看说明", exact: true }).first();
	await link.focus();
	await link.press("Enter");
	await expect.poll(() => new URL(page.url()).hash).toBe(await link.getAttribute("href"));
	await expect(current.locator('p[id$="-details"]')).toBeFocused();
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "文字侧水平留白（px）", 24);
	await setNumber(page, "图文间距（px）", 16);
	expect(await current.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor.getByRole("textbox", { name: "Badge 版本名称", exact: true }).fill("状态标记留白");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「状态标记留白」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
});

test("Table editor retains semantic tables, embedded controls and local narrow scrolling", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/table", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Table", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Table · 组件参数" });
	await expect(editor.getByTestId("table-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const invoices = current.locator("[data-table-invoices]");
	await expect(current.getByRole("table")).toHaveCount(3);
	await expect(invoices.getByRole("columnheader")).toHaveCount(4);
	await expect(invoices.locator("tfoot td").last()).toHaveText("¥1,375.70");
	await expect(current.getByText("暂无账单", { exact: true })).toBeVisible();
	await setNumber(page, "表头高度下限（px）", 54);
	await setNumber(page, "表头横向留白（px）", 18);
	await setNumber(page, "数据格横向留白（px）", 14);
	await setNumber(page, "数据格纵向留白（px）", 6);
	await expect(invoices.getByRole("columnheader").first()).toHaveCSS("height", "54px");
	await expect(invoices.getByRole("columnheader").first()).toHaveCSS("padding-left", "18px");
	await expect(invoices.locator("tbody td").first()).toHaveCSS("padding-left", "14px");
	await expect(invoices.locator("tfoot td").first()).toHaveCSS("padding-bottom", "6px");
	await expect(current.locator('th:has([role="checkbox"])')).toHaveCSS("padding-right", "0px");
	await expect(current.locator('td:has([role="checkbox"])').first()).toHaveCSS(
		"padding-left",
		"14px"
	);
	await expect(current.locator('td:has([role="checkbox"])').first()).toHaveCSS(
		"padding-right",
		"0px"
	);
	const checkbox = current.getByRole("checkbox", { name: "核对第一项", exact: true });
	await checkbox.focus();
	await checkbox.press("Space");
	await expect(checkbox).not.toBeChecked();
	await expect(current.getByRole("checkbox", { name: "不可核对项", exact: true })).toBeDisabled();
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.getByRole("checkbox", { name: "核对第一项", exact: true })).toBeChecked();
	await expect(before.locator("[data-table-invoices] tbody td").first()).toHaveCSS(
		"padding-left",
		"8px"
	);
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "数据格横向留白（px）", 32);
	await setNumber(page, "数据格纵向留白（px）", 24);
	expect(await current.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	const scroll = invoices.locator("..");
	expect(await scroll.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
	await invoices.getByRole("columnheader").first().scrollIntoViewIfNeeded();
	await scroll.evaluate((el) => {
		el.scrollLeft = el.scrollWidth;
	});
	expect(await scroll.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
	await expect(invoices.getByRole("columnheader", { name: "金额", exact: true })).toBeInViewport();
	await editor.getByRole("textbox", { name: "Table 版本名称", exact: true }).fill("表格舒适密度");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「表格舒适密度」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
});

test("Native Select editor preserves native selection, size alignment and isolated versions", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/native-select", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Native Select", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Native Select · 组件参数" });
	await expect(editor.getByTestId("native-select-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const control = current.getByRole("combobox", { name: "默认尺寸 · 未选择", exact: true });
	await current.getByText("默认尺寸 · 未选择", { exact: true }).click();
	await expect(control).toBeFocused();
	await control.press("Home");
	await control.press("ArrowDown");
	await expect(control).toHaveValue("apple");
	await control.press("End");
	await expect(control).toHaveValue("grapes"); // Skip the disabled final option.
	await expect(
		current.getByRole("combobox", { name: "默认尺寸 · 禁用", exact: true })
	).toBeDisabled();
	await expect(control).toHaveCSS("height", "32px");
	await editor.getByRole("button", { name: /^默认尺寸高度 / }).click();
	await page.getByRole("option", { name: "同 Button 大", exact: true }).click();
	await editor.getByRole("button", { name: /^小尺寸高度 / }).click();
	await page.getByRole("option", { name: "同 Button 特小", exact: true }).click();
	await setNumber(page, "文字侧内边距（px）", 22);
	await expect(control).toHaveCSS("height", "36px");
	await expect(control).toHaveCSS("padding-left", "22px");
	await expect(current.getByRole("combobox", { name: "小尺寸 · 未选择", exact: true })).toHaveCSS(
		"height",
		"24px"
	);
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(
		before.getByRole("combobox", { name: "默认尺寸 · 未选择", exact: true })
	).toHaveValue("");
	await expect(before.getByRole("combobox", { name: "默认尺寸 · 未选择", exact: true })).toHaveCSS(
		"padding-left",
		"10px"
	);
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "文字侧内边距（px）", 48);
	for (const pane of [before, current])
		expect(await pane.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor
		.getByRole("textbox", { name: "Native Select 版本名称", exact: true })
		.fill("原生紧凑选择");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「原生紧凑选择」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
});

test("Input Group editor changes inline geometry without compressing block addons or textarea", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/input-group", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Input Group", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Input Group · 组件参数" });
	await expect(editor.getByTestId("input-group-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const row = current.locator("[data-input-group-row]");
	const control = current.getByRole("textbox", { name: "搜索组件 · 行内两侧", exact: true });
	await current.getByText("查找", { exact: true }).click();
	await expect(control).toBeFocused();
	await control.fill("独立草稿");
	await current.getByRole("button", { name: "清空", exact: true }).click();
	await expect(control).toHaveValue("");
	await expect(current.getByRole("button", { name: "清空", exact: true })).toBeFocused();
	const blocks = current.locator("[data-input-group-block]");
	const blockHeights = await blocks.evaluateAll((els) =>
		els.map((el) => el.getBoundingClientRect().height)
	);
	await editor.getByRole("button", { name: /^单行高度档位 / }).click();
	await page.getByRole("option", { name: "同 Button 大", exact: true }).click();
	await setNumber(page, "行内附加内容外侧留白（px）", 22);
	await setNumber(page, "块状附加内容横向留白（px）", 18);
	await setNumber(page, "附加内容间距（px）", 12);
	await editor.getByRole("button", { name: /^组合圆角档位 / }).click();
	await page.getByRole("option", { name: "md · 0.8 × 基数", exact: true }).click();
	await expect(row.locator('[data-slot="input-group"]')).toHaveCSS("height", "36px");
	await expect(control).toHaveCSS("height", "34px");
	expect(
		await blocks.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))
	).toEqual(blockHeights);
	await expect(blocks.first().locator('[data-align="block-start"]')).toHaveCSS(
		"padding-left",
		"18px"
	);
	const multiline = current.locator("[data-input-group-multiline]");
	await expect(multiline).toHaveCSS("border-top-left-radius", "8px");
	const textarea = current.getByRole("textbox", { name: "多行消息 · 顶部与底部", exact: true });
	const initialHeight = (await textarea.boundingBox())!.height;
	await textarea.fill("一\n二\n三\n四\n五\n六\n七\n八\n九");
	expect((await textarea.boundingBox())!.height).toBeGreaterThan(initialHeight);
	await expect(current.getByRole("textbox", { name: "禁用输入", exact: true })).toBeDisabled();
	await expect(
		current.getByRole("textbox", { name: "错误状态", exact: true })
	).toHaveAccessibleDescription("请输入完整链接。这是固定错误状态示例。");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(
		before.getByRole("textbox", { name: "搜索组件 · 行内两侧", exact: true })
	).toHaveValue("组件");
	await expect(
		before.getByRole("textbox", { name: "多行消息 · 顶部与底部", exact: true })
	).toHaveValue("");
	await expect(before.locator('[data-input-group-row] [data-slot="input-group"]')).toHaveCSS(
		"height",
		"32px"
	);
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "行内附加内容外侧留白（px）", 48);
	await setNumber(page, "块状附加内容横向留白（px）", 48);
	await setNumber(page, "附加内容间距（px）", 24);
	for (const pane of [before, current])
		expect(await pane.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor.getByRole("textbox", { name: "Input Group 版本名称", exact: true }).fill("组合输入");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「组合输入」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
});

test("Input OTP editor retains actual paste, deletion, grouped endpoints and isolated state", async ({
	page,
	context,
}) => {
	test.setTimeout(60_000);
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);
	await page.goto("/docs/components/input-otp", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Input OTP", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Input OTP · 组件参数" });
	await expect(editor.getByTestId("input-otp-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const control = current.getByRole("textbox", { name: "连续六位", exact: true });
	await current.getByText("连续六位", { exact: true }).click();
	await expect(control).toBeFocused();
	await page.evaluate(() => navigator.clipboard.writeText("583027"));
	await control.press("Control+V");
	await expect(control).toHaveValue("583027");
	await control.press("End");
	await control.press("Backspace");
	await expect(control).toHaveValue("58302");
	await control.press("Home");
	await control.press("Delete");
	await expect(control).toHaveValue("8302");
	await expect(current.getByRole("textbox", { name: "禁用验证码", exact: true })).toBeDisabled();
	await editor.getByRole("button", { name: /^方形槽尺寸档位 / }).click();
	await page.getByRole("option", { name: "同 Button 大", exact: true }).click();
	await setNumber(page, "组间距（px）", 22);
	await editor.getByRole("button", { name: /^分组圆角档位 / }).click();
	await page.getByRole("option", { name: "xl · 1.4 × 基数", exact: true }).click();
	const group = current.locator('[data-slot="input-otp-group"]').first();
	const slots = group.locator('[data-slot="input-otp-slot"]');
	await expect(slots.first()).toHaveCSS("width", "36px");
	await expect(slots.first()).toHaveCSS("height", "36px");
	await expect(slots.first()).toHaveCSS("border-top-left-radius", "14px");
	await expect(slots.first()).toHaveCSS("border-top-right-radius", "0px");
	await expect(slots.nth(2)).toHaveCSS("border-radius", "0px");
	await expect(slots.last()).toHaveCSS("border-top-right-radius", "14px");
	await expect(current.locator("[data-pin-input-root]").nth(1)).toHaveCSS("gap", "22px");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.getByRole("textbox", { name: "连续六位", exact: true })).toHaveValue("");
	await expect(before.locator('[data-slot="input-otp-slot"]').first()).toHaveCSS("width", "32px");
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	await setNumber(page, "组间距（px）", 24);
	for (const pane of [before, current])
		expect(await pane.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor.getByRole("textbox", { name: "Input OTP 版本名称", exact: true }).fill("分组验证码");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「分组验证码」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
});

test("Toggle Group editor preserves joined endpoints, selection and shared Toggle ownership", async ({
	page,
}) => {
	test.setTimeout(60_000);
	await page.goto("/docs/components/toggle-group", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Toggle Group", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Toggle Group · 组件参数" });
	await expect(editor.getByTestId("toggle-group-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const horizontal = current.getByRole("group", {
		name: "单选 · 横向 · spacing=0 · default · default",
		exact: true,
	});
	const first = horizontal.getByRole("radio", { name: "概览", exact: true });
	await first.focus();
	await page.keyboard.press("ArrowRight");
	await expect(horizontal.getByRole("radio", { name: "列表", exact: true })).toBeFocused();
	await page.keyboard.press("Space");
	await expect(horizontal.getByRole("radio", { name: "列表", exact: true })).toHaveAttribute(
		"aria-checked",
		"true"
	);
	await setNumber(page, "拼接项文字侧内边距（px）", 30);
	await editor.getByRole("button", { name: /^拼接圆角档位 / }).click();
	await page.getByRole("option", { name: "md · 0.8 × 基数", exact: true }).click();
	await expect(first).toHaveCSS("padding-left", "6px");
	await expect(first).toHaveCSS("padding-right", "30px");
	await expect(first).toHaveCSS("border-top-left-radius", "8px");
	await expect(first).toHaveCSS("border-top-right-radius", "0px");
	await expect(horizontal.getByRole("radio", { name: "列表", exact: true })).toHaveCSS(
		"border-radius",
		"0px"
	);
	const vertical = current.getByRole("group", {
		name: "单选 · 纵向 · spacing=0 · lg · outline",
		exact: true,
	});
	await expect(vertical.getByRole("radio").last()).toHaveCSS("border-bottom-left-radius", "8px");
	await expect(vertical.getByRole("radio").last()).toHaveCSS("border-top-left-radius", "0px");
	const multiple = current.getByRole("group", {
		name: "多选 · 横向 · spacing=0 · sm · outline",
		exact: true,
	});
	await multiple.getByRole("button", { name: "列表", exact: true }).click();
	await expect(multiple.getByRole("button", { name: "概览", exact: true })).toHaveAttribute(
		"aria-pressed",
		"true"
	);
	await expect(multiple.getByRole("button", { name: "列表", exact: true })).toHaveAttribute(
		"aria-pressed",
		"true"
	);
	await expect(multiple.getByRole("button", { name: "禁用", exact: true })).toBeDisabled();
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(
		before
			.getByRole("group", { name: "多选 · 横向 · spacing=0 · sm · outline", exact: true })
			.getByRole("button", { name: "列表", exact: true })
	).toHaveAttribute("aria-pressed", "false");
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await page.setViewportSize({ width: 390, height: 1000 });
	for (const pane of [before, current])
		expect(await pane.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor
		.getByRole("textbox", { name: "Toggle Group 版本名称", exact: true })
		.fill("拼接工具栏");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「拼接工具栏」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
});

test("Toggle editor shares geometry with Group while preserving joined and icon insets", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/toggle", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Toggle", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Toggle · 组件参数" });
	await expect(editor.getByTestId("toggle-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const row = current.locator('[data-toggle-sample="default-outline"]');
	const text = row.getByRole("button", { name: "文字", exact: true });
	await text.focus();
	await page.keyboard.press("Space");
	await expect(text).toHaveAttribute("aria-pressed", "true");
	await expect(text).not.toHaveCSS("box-shadow", "none");
	await page.keyboard.press("Enter");
	await expect(text).toHaveAttribute("aria-pressed", "false");
	await setNumber(page, "默认 · 高度（px）", 46);
	await setNumber(page, "默认 · 横向内边距（px）", 22);
	await setNumber(page, "图文间距（px）", 10);
	await editor.getByRole("button", { name: /^圆角档位 / }).click();
	await page.getByRole("option", { name: "md · 0.8 × 基数", exact: true }).click();
	await expect(text).toHaveCSS("height", "46px");
	await expect(text).toHaveCSS("min-width", "46px");
	await expect(text).toHaveCSS("padding-left", "22px");
	await expect(text).toHaveCSS("border-radius", "8px");
	await expect(row.getByRole("button", { name: "加粗", exact: true })).toHaveCSS(
		"padding-left",
		"8px"
	);
	const joined = current
		.getByRole("group", { name: "拼接对齐", exact: true })
		.getByRole("radio")
		.first();
	const spaced = current
		.getByRole("group", { name: "分离对齐", exact: true })
		.getByRole("radio")
		.first();
	await expect(joined).toHaveCSS("height", "46px");
	await expect(joined).toHaveCSS("padding-left", "8px");
	await expect(spaced).toHaveCSS("padding-left", "22px");
	await expect(spaced).toHaveCSS("gap", "10px");
	await expect(current.getByRole("button", { name: "禁用已按下", exact: true })).toBeDisabled();
	await row.getByRole("button", { name: "加粗", exact: true }).click();
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(
		before
			.locator('[data-toggle-sample="default-outline"]')
			.getByRole("button", { name: "加粗", exact: true })
	).toHaveAttribute("aria-pressed", "true");
	await expect(
		before.locator('[data-toggle-sample="default-outline"]').getByRole("button").first()
	).toHaveCSS("height", "32px");
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await expect(page.locator("html")).not.toHaveClass(/dark/);
	await page.setViewportSize({ width: 390, height: 1000 });
	for (const pane of [before, current])
		expect(await pane.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor.getByRole("textbox", { name: "Toggle 版本名称", exact: true }).fill("大号工具按钮");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「大号工具按钮」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	expect(errors).toEqual([]);
});

test("Slider editor preserves real directional ranges and keeps comparison values independent", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/slider", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Slider", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Slider · 组件参数" });
	await expect(editor.getByTestId("slider-dials")).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const volume = current.getByRole("slider", { name: "音量 · 单值", exact: true });
	const gain = current.getByRole("slider", { name: "增益 · 单值", exact: true });
	await volume.focus();
	await page.keyboard.press("ArrowRight");
	await expect(volume).toHaveAttribute("aria-valuenow", "38");
	await page.keyboard.press("End");
	await expect(volume).toHaveAttribute("aria-valuenow", "100");
	await page.keyboard.press("Home");
	await expect(volume).toHaveAttribute("aria-valuenow", "0");
	await gain.focus();
	await page.keyboard.press("ArrowUp");
	await expect(gain).toHaveAttribute("aria-valuenow", "64");
	const upper = current.getByRole("slider", { name: "亮度上限", exact: true });
	await upper.focus();
	await page.keyboard.press("ArrowLeft");
	await expect(upper).toHaveAttribute("aria-valuenow", "70");
	await expect(current.getByRole("slider", { name: "亮度下限", exact: true })).toHaveAttribute(
		"aria-valuenow",
		"23"
	);
	await setNumber(page, "轨道粗细（px）", 14);
	await setNumber(page, "把手短边（px）", 32);
	await expect(volume).toHaveCSS("width", "32px");
	await expect(volume).toHaveCSS("height", "32px");
	const track = current
		.locator('[data-slot="slider-track"][data-orientation="horizontal"]')
		.first();
	await expect(track).toHaveCSS("height", "14px");
	await expect(
		current.locator('[data-slot="slider-track"][data-orientation="vertical"]').first()
	).toHaveCSS("width", "14px");
	await track.scrollIntoViewIfNeeded();
	const box = (await track.boundingBox())!;
	await page.mouse.move(box.x + 1, box.y + box.height / 2);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width * 0.63, box.y + box.height / 2, { steps: 15 });
	await page.mouse.up();
	const dragged = Number(await volume.getAttribute("aria-valuenow"));
	expect(dragged).toBeGreaterThan(55);
	expect(dragged).toBeLessThan(70);
	await expect(current.getByRole("slider", { name: "禁用区间下限", exact: true })).toHaveAttribute(
		"tabindex",
		"-1"
	);
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.getByRole("slider", { name: "音量 · 单值", exact: true })).toHaveAttribute(
		"aria-valuenow",
		"37"
	);
	await expect(before.getByRole("slider", { name: "音量 · 单值", exact: true })).toHaveCSS(
		"width",
		"12px"
	);
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await expect(page.locator("html")).not.toHaveClass(/dark/);
	await page.setViewportSize({ width: 390, height: 1000 });
	for (const pane of [before, current])
		expect(await pane.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor.getByRole("textbox", { name: "Slider 版本名称", exact: true }).fill("粗轨道滑块");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「粗轨道滑块」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	expect(errors).toEqual([]);
});

test("Checkbox editor preserves mixed state, labels, keyboard focus and comparison isolation", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/checkbox", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Checkbox", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Checkbox · 组件参数" });
	const current = editor.locator("[data-tuning-current]");
	const unchecked = current.getByRole("checkbox", {
		name: "接收项目更新（初始未选中）",
		exact: true,
	});
	const mixed = current.getByRole("checkbox", { name: "部分选中示例", exact: true });
	await expect(mixed).toHaveAttribute("aria-checked", "mixed");
	await mixed.focus();
	await page.keyboard.press("Space");
	await expect(mixed).toHaveAttribute("aria-checked", "true");
	await unchecked.focus();
	await page.keyboard.press("Space");
	await expect(unchecked).toBeChecked();
	await expect(unchecked).not.toHaveCSS("box-shadow", "none");
	await current.locator("label").filter({ hasText: "接收项目更新（初始未选中）" }).click();
	await expect(unchecked).not.toBeChecked();
	await expect(
		current.getByRole("checkbox", { name: "禁用 · 已选中", exact: true })
	).toBeDisabled();
	await setNumber(page, "方框尺寸（px）", 28);
	await editor.getByRole("button", { name: /^圆角档位 / }).click();
	await editor.getByRole("option", { name: "md · 0.8 × 基数", exact: true }).click();
	await expect(unchecked).toHaveCSS("width", "28px");
	await expect(unchecked).toHaveCSS("border-radius", "8px");
	await expect(mixed.locator("svg")).toHaveCSS("width", "26px");
	await expect(
		current.getByRole("checkbox", { name: "同意项目使用规范", exact: true })
	).toHaveAttribute("aria-invalid", "true");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.getByRole("checkbox", { name: "部分选中示例", exact: true })).toHaveAttribute(
		"aria-checked",
		"mixed"
	);
	await expect(before.getByRole("checkbox").first()).toHaveCSS("width", "16px");
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await expect(current).toHaveCSS("color", "oklch(0.985 0 0)");
	await expect(page.locator("html")).not.toHaveClass(/dark/);
	await page.setViewportSize({ width: 390, height: 844 });
	for (const pane of [before, current])
		expect(await pane.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor.getByRole("textbox", { name: "Checkbox 版本名称", exact: true }).fill("大号复选框");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「大号复选框」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	expect(errors).toEqual([]);
});

test("Radio Group editor keeps roving keyboard focus and dark dots with independent panes", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/radio-group", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Radio Group", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Radio Group · 组件参数" });
	const current = editor.locator("[data-tuning-current]");
	for (const [orientation, arrow] of [
		["纵向", "ArrowDown"],
		["横向", "ArrowRight"],
	]) {
		const group = current.getByRole("radiogroup", {
			name: `通知频率 · ${orientation}`,
			exact: true,
		});
		await group.getByRole("radio", { name: "每天汇总", exact: true }).focus();
		await page.keyboard.press(arrow);
		const weekly = group.getByRole("radio", { name: "每周汇总", exact: true });
		await expect(weekly).toBeFocused();
		await expect(weekly).toBeChecked();
		await expect(weekly).not.toHaveCSS("box-shadow", "none");
		await expect(
			group.getByRole("radio", { name: "即时通知（暂不可用）", exact: true })
		).toBeDisabled();
	}
	const disabled = current.getByRole("radiogroup", { name: "通知频率 · 整组禁用", exact: true });
	for (const radio of await disabled.getByRole("radio").all()) await expect(radio).toBeDisabled();
	await setNumber(page, "单选框尺寸（px）", 22);
	await setNumber(page, "组内选项间距（px）", 18);
	const vertical = current.getByRole("radiogroup", { name: "通知频率 · 纵向", exact: true });
	await expect(vertical).toHaveCSS("gap", "18px");
	await expect(vertical.getByRole("radio").first()).toHaveCSS("width", "22px");
	await expect(vertical.locator("svg")).toHaveCSS("width", "11px");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(
		before
			.getByRole("radiogroup", { name: "通知频率 · 纵向", exact: true })
			.getByRole("radio", { name: "每天汇总", exact: true })
	).toBeChecked();
	await expect(before.getByRole("radio").first()).toHaveCSS("width", "16px");
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await expect(current).toHaveCSS("color", "oklch(0.985 0 0)");
	await expect(vertical.locator("svg")).toHaveCSS("width", "11px");
	await page.setViewportSize({ width: 390, height: 844 });
	for (const pane of [current, before])
		expect(await pane.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor
		.getByRole("textbox", { name: "Radio Group 版本名称", exact: true })
		.fill("宽松单选组");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松单选组」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	expect(errors).toEqual([]);
});

test("Switch editor links track and thumb dimensions while preserving small size and endpoints", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/switch", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "微调 Switch", exact: true });
	await opener.click();
	const editor = page.getByRole("dialog", { name: "Switch · 组件参数" });
	const current = editor.locator("[data-tuning-current]");
	const normal = current.getByRole("group", { name: "默认尺寸", exact: true });
	const small = current.getByRole("group", { name: "小尺寸", exact: true });
	const control = normal.getByRole("switch", { name: "邮件通知", exact: true });
	await control.focus();
	await page.keyboard.press("Space");
	await expect(control).toBeChecked();
	await expect(control).not.toHaveCSS("box-shadow", "none");
	await normal.locator("label").filter({ hasText: "邮件通知" }).click();
	await expect(control).not.toBeChecked();
	await setNumber(page, "默认尺寸滑块高度（px）", 20);
	await expect(control).toHaveCSS("width", "40px");
	await expect(control.locator('[data-slot="switch-thumb"]')).toHaveCSS("height", "20px");
	await expect(small.getByRole("switch").first()).toHaveCSS("width", "24px");
	await setNumber(page, "小尺寸滑块高度（px）", 10);
	await expect(small.getByRole("switch").first()).toHaveCSS("width", "20px");
	await editor.getByRole("button", { name: /^切换动效档位 / }).click();
	await editor.getByRole("option", { name: "慢（全局 token）", exact: true }).click();
	await expect(control).toHaveCSS("transition-duration", "0.3s");
	await expect(control.locator('[data-slot="switch-thumb"]')).toHaveCSS(
		"transition-duration",
		"0.3s"
	);
	await control.click();
	await expect(control).toBeChecked();
	await expect
		.poll(async () => {
			const track = await control.boundingBox();
			const thumb = await control.locator('[data-slot="switch-thumb"]').boundingBox();
			return Math.round((track!.x + track!.width - thumb!.x - thumb!.width) * 10) / 10;
		})
		.toBe(1);
	await expect(
		normal.getByRole("switch", { name: "安全提醒（禁用）", exact: true })
	).toBeDisabled();
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(
		before.getByRole("switch", { name: "邮件通知", exact: true }).first()
	).not.toBeChecked();
	await expect(before.getByRole("switch").first()).toHaveCSS("width", "32px");
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await expect(current).toHaveCSS("color", "oklch(0.985 0 0)");
	await page.setViewportSize({ width: 390, height: 844 });
	await setNumber(page, "默认尺寸滑块高度（px）", 24);
	for (const pane of [before, current])
		expect(await pane.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor.getByRole("textbox", { name: "Switch 版本名称", exact: true }).fill("宽松开关");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松开关」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(opener).toBeFocused();
	expect(errors).toEqual([]);
});

test("Tabs editor tunes both orientations and variants without changing keyboard semantics", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/tabs", { waitUntil: "networkidle" });
	const openButton = page.getByRole("button", { name: "微调 Tabs", exact: true });
	await openButton.click();
	const editor = page.getByRole("dialog", { name: "Tabs · 组件参数" });
	await expect(editor).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const unselected = current.getByRole("tab", { name: "设置", exact: true }).first();
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await expect(unselected).toHaveCSS("color", "oklch(0.708 0 0)");
	await expect(page.locator("html")).not.toHaveClass(/dark/);
	await editor.getByRole("radio", { name: "浅色", exact: true }).click();
	await expect(unselected).toHaveCSS("color", "oklab(0 0 0 / 0.6)");
	await editor.getByRole("button", { name: /^水平列表高度 / }).click();
	await editor.getByRole("option", { name: "40px", exact: true }).click();
	await setNumber(page, "列表与内容间距（px）", 14);
	await editor.getByRole("button", { name: /^标签横向内边距 / }).click();
	await editor.getByRole("option", { name: "14px · 统一", exact: true }).click();
	await editor.getByRole("button", { name: /^默认列表圆角 / }).click();
	await editor.getByRole("option", { name: "sm · 0.6 × 基数", exact: true }).click();
	for (const orientation of ["horizontal", "vertical"]) {
		for (const variant of ["default", "line"]) {
			const sample = current.getByRole("region", {
				name: `${orientation} ${variant}`,
				exact: true,
			});
			const list = sample.getByRole("tablist");
			if (orientation === "horizontal") await expect(list).toHaveCSS("height", "40px");
			await expect(sample.locator('[data-slot="tabs"]')).toHaveCSS("gap", "14px");
			await expect(list).toHaveCSS("border-top-left-radius", variant === "default" ? "6px" : "0px");
			for (const tab of await sample.getByRole("tab").all()) {
				await expect(tab).toHaveCSS("padding-left", "14px");
				await expect(tab).toHaveCSS("padding-right", "14px");
			}
			const overview = sample.getByRole("tab", { name: "概览", exact: true });
			const settings = sample.getByRole("tab", { name: "设置", exact: true });
			await overview.focus();
			const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
			await page.keyboard.press(next);
			await expect(settings).toBeFocused();
			await expect(settings).toHaveAttribute("aria-selected", "true");
			await expect(sample.getByRole("tabpanel")).toContainText("管理通知与显示偏好");
			await page.keyboard.press(next);
			await expect(overview).toBeFocused();
			if (variant === "line")
				await expect
					.poll(() => overview.evaluate((el) => getComputedStyle(el, "::after").opacity))
					.toBe("1");
		}
	}
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.getByRole("tablist").first()).toHaveCSS("height", "32px");
	await current.getByRole("tab", { name: "设置", exact: true }).first().click();
	await expect(before.getByRole("tab", { name: "概览", exact: true }).first()).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await page.setViewportSize({ width: 390, height: 844 });
	await editor.getByRole("button", { name: /^标签横向内边距 / }).click();
	await editor.getByRole("option", { name: "16px · 统一", exact: true }).click();
	for (const pane of [current, before])
		expect(await pane.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	await editor.getByRole("textbox", { name: "Tabs 版本名称", exact: true }).fill("宽松标签");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松标签」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Card editor keeps both sizes, shared spacing, edge content and versions aligned", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/card", { waitUntil: "networkidle" });
	const openButton = page.getByRole("button", { name: "微调 Card", exact: true });
	await openButton.click();
	const editor = page.getByRole("dialog", { name: "Card · 组件参数" });
	await expect(editor).toBeVisible();
	const current = editor.locator("[data-tuning-current]");
	const normal = current.locator('[data-slot="card"][data-size="default"]').first();
	const small = current.locator('[data-slot="card"][data-size="sm"]');
	const projectName = normal.getByRole("textbox", { name: "项目名称", exact: true });
	await editor.getByRole("radio", { name: "深色", exact: true }).click();
	await expect(projectName).toHaveCSS("color", "oklch(0.985 0 0)");
	await expect(page.locator("html")).not.toHaveClass(/dark/);
	await editor.getByRole("radio", { name: "浅色", exact: true }).click();
	await expect(projectName).toHaveCSS("color", "oklch(0 0 0)");
	await expect(normal).toHaveCSS("row-gap", "16px");
	await expect(small).toHaveCSS("row-gap", "12px");
	await setNumber(page, "默认尺寸留白（px）", 22);
	await expect(normal).toHaveCSS("padding-top", "22px");
	// Changing only default spacing must not silently override the small-size variable.
	await expect(small).toHaveCSS("row-gap", "12px");
	await setNumber(page, "小尺寸留白（px）", 10);
	await setNumber(page, "标题区间距（px）", 12);
	await expect(small.locator('[data-slot="card-content"]')).toHaveCSS("padding-left", "10px");
	await expect(normal.locator('[data-slot="card-header"]')).toHaveCSS("row-gap", "12px");
	await expect(normal.locator('[data-slot="card-footer"]')).toHaveCSS("padding-left", "22px");
	const edge = current.locator("[data-card-edge]");
	await expect(edge).toHaveCSS("padding-top", "0px");
	await expect(edge.locator("[data-card-bleed]")).toHaveCSS("margin-left", "-22px");
	await expect(edge.locator('[data-slot="card-header"]')).toHaveCSS("padding-bottom", "22px");
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	const before = editor.locator("[data-tuning-before]");
	await expect(before.locator('[data-slot="card"]').first()).toHaveCSS("row-gap", "16px");
	await normal.getByRole("textbox", { name: "项目名称", exact: true }).fill("新项目");
	await expect(before.getByRole("textbox", { name: "项目名称", exact: true }).first()).toHaveValue(
		"设计系统"
	);
	for (const width of [390, 768]) {
		await page.setViewportSize({ width, height: 900 });
		await setNumber(page, "默认尺寸留白（px）", 48);
		expect(await editor.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
		const bounds = await edge.locator("[data-card-bleed]").boundingBox();
		const card = await edge.boundingBox();
		expect(Math.abs(bounds!.x - card!.x)).toBeLessThan(1);
		expect(Math.abs(bounds!.width - card!.width)).toBeLessThan(1);
	}
	await editor.getByRole("textbox", { name: "Card 版本名称", exact: true }).fill("宽松卡片");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status").filter({ hasText: "已保存「宽松卡片」" })).toBeVisible();
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	await expect(
		page.locator('[data-component-tuner] [data-tuning-current] [data-slot="card"]').first()
	).toHaveCSS("row-gap", "48px");
	expect(errors).toEqual([]);
});

test("designer edits, saves, restores, undoes and roundtrips a real installable preset", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/workbench", { waitUntil: "networkidle" });
	const canvas = page.frameLocator('iframe[title="真实组件画布"]');
	const primary = canvas.getByRole("button", { name: "主要操作", exact: true });
	await setNumber(page, "全局圆角（px）", 22);
	await expect(primary).toHaveCSS("border-radius", "22px");
	await setNumber(page, "高度（px）", 58);
	await expect(primary).toHaveCSS("height", "58px");
	await expect(canvas.getByRole("button", { name: "次要操作", exact: true })).not.toHaveCSS(
		"background-color",
		"rgb(109, 40, 217)"
	);
	await page.getByRole("button", { name: "撤销", exact: true }).click();
	await expect(primary).toHaveCSS("height", "40px");
	await page.getByRole("button", { name: "重做", exact: true }).click();
	await expect(primary).toHaveCSS("height", "58px");
	await page.getByRole("textbox", { name: "版本名称", exact: true }).fill("设计师测试版");
	await page.getByRole("button", { name: "保存版本", exact: true }).click();
	await page.reload({ waitUntil: "networkidle" });
	await expect(primary).toHaveCSS("height", "58px");
	// A preview can remount after its parent has already sent a draft.
	await page
		.locator("iframe")
		.evaluate((frame: HTMLIFrameElement) => frame.contentWindow!.location.reload());
	await expect(primary).toHaveCSS("height", "58px");
	await setNumber(page, "高度（px）", 44);
	await page.getByRole("combobox", { name: "已存版本", exact: true }).selectOption("设计师测试版");
	await expect(primary).toHaveCSS("height", "58px");
	const download = page.waitForEvent("download");
	await page.getByRole("button", { name: "导出可安装预设", exact: true }).click();
	const file = await download;
	expect(file.suggestedFilename()).toBe("valar-preset.json");
	await page.getByRole("button", { name: "重置全部", exact: true }).click();
	await expect(primary).toHaveCSS("height", "40px");
	await page.getByLabel("导入预设文件", { exact: true }).setInputFiles((await file.path())!);
	await expect(primary).toHaveCSS("height", "58px");
	await expect(primary).toHaveCSS("border-radius", "22px");
	await page.getByLabel("导入预设文件", { exact: true }).setInputFiles({
		name: "bad.json",
		mimeType: "application/json",
		buffer: Buffer.from('{"version":999}'),
	});
	await expect(page.getByRole("status")).toContainText("导入失败");
	await expect(primary).toHaveCSS("height", "58px");
	const invalid = await page.request.post("/api/workbench/export", { data: { version: 999 } });
	expect(invalid.status()).toBe(400);
	expect(errors).toEqual([]);
});

test("dialog and accordion controls change actual behavior; reduced motion takes precedence", async ({
	page,
}) => {
	await page.goto("/workbench", { waitUntil: "networkidle" });
	const canvas = page.frameLocator('iframe[title="真实组件画布"]');
	await page.getByRole("button", { name: "对话框 dialog", exact: true }).click();
	await setNumber(page, "面板宽度（px）", 552);
	await canvas.getByRole("button", { name: "打开对话框", exact: true }).click();
	const dialog = canvas.getByRole("dialog");
	await expect(dialog).toBeVisible();
	await expect(dialog).toHaveCSS("width", "552px");
	await expect(dialog).toHaveCSS("animation-duration", "0.18s");
	await page.emulateMedia({ reducedMotion: "reduce" });
	await expect(dialog).toHaveCSS("animation-name", "none");
	await canvas.getByRole("button", { name: "完成并关闭", exact: true }).click();
	await expect(canvas.getByRole("button", { name: "打开对话框", exact: true })).toBeFocused();
	await page.getByRole("button", { name: "折叠面板 accordion", exact: true }).click();
	await canvas.getByRole("button", { name: "外观与尺寸", exact: true }).click();
	await canvas.getByRole("button", { name: "动效与节奏", exact: true }).click();
	await expect(canvas.getByRole("button", { name: "外观与尺寸", exact: true })).toHaveAttribute(
		"aria-expanded",
		"false"
	);
});

test.describe("touch workbench", () => {
	test.use({
		viewport: devices["Pixel 7"].viewport,
		userAgent: devices["Pixel 7"].userAgent,
		isMobile: true,
		hasTouch: true,
		deviceScaleFactor: 2,
	});
	test("preview and parameter tabs fit a phone and edits persist across tabs", async ({ page }) => {
		await page.goto("/workbench", { waitUntil: "networkidle" });
		expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
		for (const width of [320, 390, 768]) {
			await page.setViewportSize({ width, height: 844 });
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
				width
			);
		}
		await page.setViewportSize({ width: 390, height: 844 });
		await page.getByRole("button", { name: /^参数调节 · / }).tap();
		await setNumber(page, "高度（px）", 52);
		await page.getByRole("button", { name: "真实预览", exact: true }).tap();
		await expect(
			page.frameLocator("iframe").getByRole("button", { name: "主要操作", exact: true })
		).toHaveCSS("height", "52px");
	});
});

test("Button editor tunes every variant full screen, compares and restores versions", async ({
	page,
}) => {
	test.setTimeout(90_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/button", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Button 样式微调", exact: true });
	const pageSample = tuner.locator('[data-tuning-current] [data-size="default"]').first();
	const editor = page.getByRole("dialog", { name: "Button · 组件参数" });
	const cell = (pane: string, variant: string, size: string) =>
		editor.locator(`[data-tuning-${pane}] [data-variant="${variant}"][data-size="${size}"]`);
	const openButton = tuner.getByRole("button", { name: "微调 Button", exact: true });
	await expect(page.getByTestId("button-dials")).toHaveCount(0);
	await expect(pageSample).toHaveCSS("height", "32px");
	await openButton.click();
	await expect(editor).toBeVisible();
	// DialKit is embedded in the editor, not floating over the page.
	await expect(editor.getByTestId("button-dials")).toBeVisible();
	for (const [label, value] of [
		["特小 · 高度（px）", "24"],
		["小 · 高度（px）", "28"],
		["默认 · 高度（px）", "32"],
		["默认 · 横向内边距（px）", "10"],
		["大 · 高度（px）", "36"],
	])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			value
		);
	await expect(editor.getByRole("button", { name: "圆角档位 lg · 1 × 基数" })).toBeVisible();
	// Global tokens are read-only and point to the token page.
	await expect(editor.getByText("--radius", { exact: true })).toBeVisible();
	await expect(editor.getByRole("link", { name: "全局主题页" })).toHaveAttribute("href", "/themes");
	// Production preview never offers file writes.
	await expect(editor.getByRole("button", { name: "写回组件库…" })).toHaveCount(0);
	await expect(editor.getByText("写回只在本地开发站")).toBeVisible();

	await setNumber(page, "默认 · 高度（px）", 44);
	await setNumber(page, "默认 · 横向内边距（px）", 16);
	await expect(editor.getByText("已修改 2 项", { exact: true })).toBeVisible();
	// Every variant of the default size follows, plus the matching icon button.
	for (const variant of ["default", "outline", "secondary", "ghost", "destructive"]) {
		await expect(cell("current", variant, "default")).toHaveCSS("height", "44px");
		await expect(cell("current", variant, "default")).toHaveCSS("padding-left", "16px");
	}
	await expect(cell("current", "outline", "icon")).toHaveCSS("width", "44px");
	await expect(cell("current", "default", "sm")).toHaveCSS("height", "28px");
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(cell("before", "default", "default")).toHaveCSS("height", "32px");
	await editor.getByRole("textbox", { name: "Button 版本名称" }).fill("宽松 v1");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松 v1」");
	await setNumber(page, "默认 · 高度（px）", 52);
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("名称已存在");
	await editor.getByRole("textbox", { name: "Button 版本名称" }).fill("宽松 v2");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await editor
		.getByRole("combobox", { name: "Button 对比版本" })
		.selectOption({ label: "宽松 v1" });
	await expect(cell("before", "default", "default")).toHaveCSS("height", "44px");
	await expect(cell("current", "default", "default")).toHaveCSS("height", "52px");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	// The page sample shows the selected saved version (v2 after saving).
	await expect(pageSample).toHaveCSS("height", "52px");
	await page.reload({ waitUntil: "networkidle" });
	await expect(pageSample).toHaveCSS("height", "32px");
	await tuner.getByRole("combobox", { name: "Button 使用版本" }).selectOption({ label: "宽松 v1" });
	await expect(pageSample).toHaveCSS("height", "44px");
	await openButton.click();
	await expect(
		editor.getByRole("slider", { name: "默认 · 高度（px）", exact: true })
	).toHaveAttribute("aria-valuenow", "44");
	await setNumber(page, "默认 · 高度（px）", 60);
	await editor.getByRole("button", { name: "撤回未保存修改" }).click();
	await expect(cell("current", "default", "default")).toHaveCSS("height", "44px");
	await editor.getByRole("button", { name: "关闭", exact: true }).click();
	const downloadPromise = page.waitForEvent("download");
	await tuner.getByRole("button", { name: "导出当前版本" }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe("valar-button-style.json");
	const context = await page.context().browser()!.newContext();
	try {
		const restored = await context.newPage();
		await restored.goto(new URL("/docs/components/button", page.url()).href, {
			waitUntil: "networkidle",
		});
		await restored
			.getByLabel("导入 Button 版本", { exact: true })
			.setInputFiles((await download.path())!);
		const restoredButton = restored.locator('[data-tuning-current] [data-size="default"]').first();
		await expect(restoredButton).toHaveCSS("height", "44px");
		await expect(restoredButton).toHaveCSS("padding-left", "16px");
	} finally {
		await context.close();
	}
	await tuner.getByLabel("导入 Button 版本", { exact: true }).setInputFiles({
		name: "bad.json",
		mimeType: "application/json",
		buffer: Buffer.from('{"format":999}'),
	});
	await expect(tuner.getByRole("status")).toContainText("导入失败");
	await expect(pageSample).toHaveCSS("height", "44px");
	expect(errors).toEqual([]);
});

test("Button radius level follows the global radius and drafts survive storage failure", async ({
	page,
}) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/docs/components/button", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Button 样式微调", exact: true });
	const editor = page.getByRole("dialog", { name: "Button · 组件参数" });
	const current = editor.locator(
		'[data-tuning-current] [data-variant="outline"][data-size="default"]'
	);
	await tuner.getByRole("button", { name: "微调 Button", exact: true }).click();
	await editor.getByRole("button", { name: "圆角档位 lg · 1 × 基数" }).click();
	await page.getByRole("option", { name: "xl · 1.4 × 基数", exact: true }).click();
	// xl is 1.4 × the theme radius (0.625rem = 10px), not a fixed pixel value.
	await expect(current).toHaveCSS("border-top-left-radius", "14px");
	await expect(
		editor.locator('[data-tuning-current] [data-variant="outline"][data-size="xs"]')
	).toHaveCSS("border-top-left-radius", "14px");
	await setNumber(page, "默认 · 高度（px）", 59);
	// After keyboard input, focusing shows the original focus ring.
	await current.focus();
	await expect(current).not.toHaveCSS("box-shadow", "none");
	await editor.getByRole("textbox", { name: "Button 版本名称" }).fill("存储失败不得丢失");
	await page.evaluate(() => {
		Storage.prototype.setItem = () => {
			throw new DOMException("Storage full", "QuotaExceededError");
		};
	});
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("保存失败");
	await expect(current).toHaveCSS("height", "59px");
	for (const width of [320, 390, 768]) {
		await page.setViewportSize({ width, height: 900 });
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			width
		);
	}
});

test("Dialog editor reuses the shared shell and previews layout, overlay and motion tier", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/dialog", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Dialog 样式微调", exact: true });
	const editor = page.getByRole("dialog", { name: "Dialog · 组件参数" });
	const part = (pane: string, slot: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="dialog-${slot}"]`);
	const openButton = tuner.getByRole("button", { name: "微调 Dialog", exact: true });
	await openButton.click();
	await expect(editor.getByTestId("dialog-dials")).toBeVisible();
	// Baseline comes from the installed nova source.
	for (const [label, value] of [
		["内边距（px）", "16"],
		["内容间距（px）", "16"],
		["遮罩不透明度（%）", "10"],
	])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			value
		);
	// Motion values are global tokens: shown with their defaults, never editable here.
	await expect(editor.getByText("100ms（默认）")).toBeVisible();

	await setNumber(page, "内边距（px）", 28);
	await setNumber(page, "遮罩不透明度（%）", 50);
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "慢（全局 token）" }).click();
	await expect(editor.getByText("已修改 3 项", { exact: true })).toBeVisible();
	await expect(part("current", "content")).toHaveCSS("padding-top", "28px");
	// The bleeding footer follows the padding so it still reaches the panel edges.
	await expect(part("current", "footer")).toHaveCSS("margin-left", "-28px");
	await expect(part("current", "overlay")).toHaveCSS("background-color", "rgba(0, 0, 0, 0.5)");
	await expect(part("current", "content")).toHaveCSS("animation-duration", "0.3s");
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(part("current", "content")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(part("before", "content")).toHaveCSS("padding-top", "16px");
	await editor.getByRole("textbox", { name: "Dialog 版本名称" }).fill("宽松弹窗");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松弹窗」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Popover editor previews padding, slide distance and motion tier on a real inline popover", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/popover", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", {
		name: "Popover 样式微调",
		exact: true,
	});
	const editor = page.getByRole("dialog", { name: "Popover · 组件参数" });
	const content = (pane: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="popover-content"]`);
	const variable = (pane: string, name: string) =>
		content(pane).evaluate(
			(element, name) => getComputedStyle(element).getPropertyValue(name),
			name
		);
	const openButton = tuner.getByRole("button", {
		name: "微调 Popover",
		exact: true,
	});
	await openButton.click();
	await expect(editor.getByTestId("popover-dials")).toBeVisible();
	// Baseline comes from the installed nova source (p-2.5, gap-2.5, slide 2 = 8px).
	for (const label of ["内边距（px）", "内容间距（px）"])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			"10"
		);
	await expect(editor.getByRole("button", { name: /^出现时滑入距离/ })).toContainText("8px");
	await expect(content("current")).toHaveAttribute("data-side", "bottom");

	await setNumber(page, "内边距（px）", 20);
	await editor.getByRole("button", { name: /^出现时滑入距离/ }).click();
	await page.getByRole("option", { name: "16px" }).click();
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "慢（全局 token）" }).click();
	await expect(editor.getByText("已修改 3 项", { exact: true })).toBeVisible();
	await expect(content("current")).toHaveCSS("padding-top", "20px");
	await expect(content("current")).toHaveCSS("animation-duration", "0.3s");
	// Opening below the trigger starts 16px above it; on the left side it starts to the right.
	expect(await variable("current", "--tw-enter-translate-y")).toMatch(
		/^calc\(calc\(4 \* .+\) \* -1\)$/
	);
	await editor.getByRole("radio", { name: "左侧" }).first().click();
	await expect(content("current")).toHaveAttribute("data-side", "left");
	expect(await variable("current", "--tw-enter-translate-x")).toMatch(/^calc\(4 \* [^)]+\)$/);
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(content("current")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(content("before")).toHaveCSS("padding-top", "10px");
	await expect(content("before")).toHaveCSS("animation-duration", "0.1s");
	await editor.getByRole("textbox", { name: "Popover 版本名称" }).fill("宽松浮层");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松浮层」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Sheet editor previews width, padding, overlay, slide distance and motion tier", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/sheet", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", {
		name: "Sheet 样式微调",
		exact: true,
	});
	const editor = page.getByRole("dialog", { name: "Sheet · 组件参数" });
	const part = (pane: string, slot: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="sheet-${slot}"]`);
	const openButton = tuner.getByRole("button", {
		name: "微调 Sheet",
		exact: true,
	});
	await openButton.click();
	await expect(editor.getByTestId("sheet-dials")).toBeVisible();
	for (const [label, value] of [
		["页眉页脚内边距（px）", "16"],
		["内容间距（px）", "16"],
		["遮罩不透明度（%）", "10"],
	])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			value
		);
	// The slide distance is Sheet's own parameter; the upstream default is 10 steps = 40px.
	await expect(editor.getByRole("button", { name: /^滑入距离/ })).toContainText("40px");
	await expect(editor.getByText("300ms（默认）")).toBeVisible();
	await expect(part("current", "content")).toHaveCSS("width", "384px");

	await setNumber(page, "页眉页脚内边距（px）", 24);
	await setNumber(page, "遮罩不透明度（%）", 50);
	await editor.getByRole("button", { name: /^左右侧宽度/ }).click();
	await page.getByRole("option", { name: "lg · 512px" }).click();
	await editor.getByRole("button", { name: /^滑入距离/ }).click();
	await page.getByRole("option", { name: "整个面板" }).click();
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "慢（全局 token）" }).click();
	await expect(editor.getByText("已修改 5 项", { exact: true })).toBeVisible();
	await expect(part("current", "header")).toHaveCSS("padding-top", "24px");
	await expect(part("current", "footer")).toHaveCSS("padding-left", "24px");
	await expect(part("current", "overlay")).toHaveCSS("background-color", "rgba(0, 0, 0, 0.5)");
	await expect(part("current", "content")).toHaveCSS("width", "512px");
	await expect(part("current", "content")).toHaveCSS("animation-duration", "0.3s");
	await expect(part("current", "overlay")).toHaveCSS("animation-duration", "0.3s");
	expect(
		await part("current", "content").evaluate((element) =>
			getComputedStyle(element).getPropertyValue("--tw-enter-translate-x").trim()
		)
	).toBe("100%");
	await editor.getByRole("radio", { name: "底部" }).first().click();
	await expect(part("current", "content")).toHaveAttribute("data-side", "bottom");
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(part("current", "content")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(part("before", "header")).toHaveCSS("padding-top", "16px");
	await expect(part("before", "overlay")).toHaveCSS("background-color", "oklab(0 0 0 / 0.1)");
	await editor.getByRole("textbox", { name: "Sheet 版本名称" }).fill("整面滑入");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「整面滑入」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Input editor picks Button's height tier and radius level, compares and saves", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/input", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Input 样式微调", exact: true });
	const editor = page.getByRole("dialog", { name: "Input · 组件参数" });
	const input = (pane: string) => editor.locator(`[data-tuning-${pane}] [data-slot="input"]`);
	const openButton = tuner.getByRole("button", { name: "微调 Input", exact: true });
	const pageSample = tuner.locator('[data-tuning-current] [data-slot="input"]');
	await expect(pageSample).toHaveCSS("height", "32px");
	await openButton.click();
	await expect(editor.getByTestId("input-dials")).toBeVisible();
	// Measured from nova: the Input is as tall as Button's default size.
	await expect(editor.getByRole("button", { name: "高度档位 同 Button 默认" })).toBeVisible();
	await expect(editor.getByRole("button", { name: "圆角档位 lg · 1 × 基数" })).toBeVisible();
	await expect(
		editor.getByRole("slider", { name: "横向内边距（px）", exact: true })
	).toHaveAttribute("aria-valuenow", "10");
	await expect(editor.getByText("--input", { exact: true })).toBeVisible();

	await editor.getByRole("button", { name: "高度档位 同 Button 默认" }).click();
	await page.getByRole("option", { name: "同 Button 大", exact: true }).click();
	await setNumber(page, "横向内边距（px）", 16);
	await expect(editor.getByText("已修改 2 项", { exact: true })).toBeVisible();
	// Button's large size is 36px in nova; every Input in the draft follows, Buttons do not.
	await expect(input("current").first()).toHaveCSS("height", "36px");
	await expect(input("current").first()).toHaveCSS("padding-left", "16px");
	await expect(input("current").last()).toHaveCSS("height", "36px");
	await expect(editor.locator('[data-tuning-current] [data-slot="button"]')).toHaveCSS(
		"height",
		"32px"
	);
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(input("before").first()).toHaveCSS("height", "32px");
	await editor.getByRole("textbox", { name: "Input 版本名称" }).fill("高输入框");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「高输入框」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	// The page sample shows the saved version.
	await expect(pageSample).toHaveCSS("height", "36px");
	for (const width of [390, 768]) {
		await page.setViewportSize({ width, height: 900 });
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			width
		);
	}
	expect(errors).toEqual([]);
});

test("Select and Textarea editors share the shell and Button's levels", async ({ page }) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/select", { waitUntil: "networkidle" });
	let tuner = page.getByRole("region", { name: "Select 样式微调", exact: true });
	let editor = page.getByRole("dialog", { name: "Select · 组件参数" });
	const trigger = (pane: string, size: string) =>
		editor
			.locator(`[data-tuning-${pane}] [data-slot="select-trigger"][data-size="${size}"]`)
			.first();
	let openButton = tuner.getByRole("button", { name: "微调 Select", exact: true });
	await openButton.click();
	await expect(editor.getByTestId("select-dials")).toBeVisible();
	await expect(editor.getByRole("button", { name: "默认尺寸高度 同 Button 默认" })).toBeVisible();
	await editor.getByRole("button", { name: "小尺寸高度 同 Button 小" }).click();
	await page.getByRole("option", { name: "同 Button 默认", exact: true }).click();
	await editor.getByRole("button", { name: "圆角档位 lg · 1 × 基数" }).click();
	await page.getByRole("option", { name: "none · 直角", exact: true }).click();
	await expect(trigger("current", "sm")).toHaveCSS("height", "32px");
	await expect(trigger("current", "default")).toHaveCSS("height", "32px");
	// One radius level for both sizes, replacing nova's own small-size radius.
	await expect(trigger("current", "sm")).toHaveCSS("border-top-left-radius", "0px");
	await expect(trigger("current", "default")).toHaveCSS("border-top-left-radius", "0px");
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(trigger("before", "sm")).toHaveCSS("height", "28px");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();

	await page.goto("/docs/components/textarea", { waitUntil: "networkidle" });
	tuner = page.getByRole("region", { name: "Textarea 样式微调", exact: true });
	editor = page.getByRole("dialog", { name: "Textarea · 组件参数" });
	const textarea = (pane: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="textarea"]`).first();
	openButton = tuner.getByRole("button", { name: "微调 Textarea", exact: true });
	await openButton.click();
	await expect(
		editor.getByRole("slider", { name: "纵向内边距（px）", exact: true })
	).toHaveAttribute("aria-valuenow", "8");
	await editor.getByRole("button", { name: "圆角档位 lg · 1 × 基数" }).click();
	await page.getByRole("option", { name: "2xl · 1.8 × 基数", exact: true }).click();
	await setNumber(page, "纵向内边距（px）", 12);
	// 2xl is 1.8 × the theme radius (10px).
	await expect(textarea("current")).toHaveCSS("border-top-left-radius", "18px");
	await expect(textarea("current")).toHaveCSS("padding-top", "12px");
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(textarea("before")).toHaveCSS("padding-top", "8px");
	await editor.getByRole("textbox", { name: "Textarea 版本名称" }).fill("宽松文本框");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松文本框」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Dropdown Menu editor previews panel, item spacing and motion tier on a real menu", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/dropdown-menu", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Dropdown Menu 样式微调", exact: true });
	const editor = page.getByRole("dialog", { name: "Dropdown Menu · 组件参数" });
	const part = (pane: string, slot: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="dropdown-menu-${slot}"]`);
	const openButton = tuner.getByRole("button", { name: "微调 Dropdown Menu", exact: true });
	await openButton.click();
	await expect(editor.getByTestId("dropdown-menu-dials")).toBeVisible();
	// Baseline comes from the installed nova source.
	for (const [label, value] of [
		["面板内边距（px）", "4"],
		["最小宽度（px）", "128"],
		["菜单项横向内边距（px）", "6"],
		["图文间距（px）", "6"],
	])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			value
		);
	await expect(part("current", "content")).toBeVisible();
	await expect(part("current", "content")).toHaveCSS("padding-top", "4px");

	await setNumber(page, "面板内边距（px）", 8);
	await setNumber(page, "菜单项横向内边距（px）", 10);
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "慢（全局 token）" }).click();
	await expect(editor.getByRole("button", { name: /^出现时滑入距离/ })).toContainText("8px");
	await editor.getByRole("button", { name: /^出现时滑入距离/ }).click();
	await page.getByRole("option", { name: "16px" }).click();
	await expect(editor.getByText("已修改 4 项", { exact: true })).toBeVisible();
	// The menu opens below its trigger, so it starts 16px above and slides down.
	expect(
		await part("current", "content").evaluate((element) =>
			getComputedStyle(element).getPropertyValue("--tw-enter-translate-y")
		)
	).toMatch(/^calc\(calc\(4 \* .+\) \* -1\)$/);
	await expect(part("current", "content")).toHaveCSS("padding-top", "8px");
	await expect(part("current", "content")).toHaveCSS("animation-duration", "0.3s");
	await expect(part("current", "item").first()).toHaveCSS("padding-left", "10px");
	// Inset rows follow the item padding (28px + 4px) so they still line up with icon rows.
	await expect(part("current", "item").and(page.locator("[data-inset]"))).toHaveCSS(
		"padding-left",
		"32px"
	);
	// Separators bleed to the panel edge in nova, so they follow the panel padding.
	await expect(part("current", "separator").first()).toHaveCSS("margin-left", "-8px");
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(part("current", "content")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(part("before", "content")).toHaveCSS("padding-top", "4px");
	await editor.getByRole("textbox", { name: "Dropdown Menu 版本名称" }).fill("宽松菜单");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松菜单」");
	// The open menu defers Escape to the editor, which closes and returns focus.
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Tooltip editor previews padding, motion tier and the real show delay", async ({ page }) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/tooltip", { waitUntil: "networkidle" });
	const tuner = page.getByRole("region", { name: "Tooltip 样式微调", exact: true });
	const editor = page.getByRole("dialog", { name: "Tooltip · 组件参数" });
	const pinned = (pane: string) =>
		editor.locator(`[data-tuning-${pane}] [data-tooltip-pinned] [data-slot="tooltip-content"]`);
	const hovered = editor.locator(
		'[data-tuning-current] [data-tooltip-hover] [data-slot="tooltip-content"]'
	);
	const openButton = tuner.getByRole("button", { name: "微调 Tooltip", exact: true });
	await openButton.click();
	await expect(editor.getByTestId("tooltip-dials")).toBeVisible();
	for (const [label, value] of [
		["横向内边距（px）", "12"],
		["纵向内边距（px）", "6"],
		["显示延迟（ms）", "0"],
	])
		await expect(editor.getByRole("slider", { name: label, exact: true })).toHaveAttribute(
			"aria-valuenow",
			value
		);
	await expect(pinned("current")).toBeVisible();
	await expect(pinned("current")).toHaveCSS("padding-left", "12px");

	await setNumber(page, "横向内边距（px）", 16);
	await setNumber(page, "显示延迟（ms）", 700);
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "中（全局 token）" }).click();
	await expect(editor.getByText("已修改 3 项", { exact: true })).toBeVisible();
	await expect(pinned("current")).toHaveCSS("padding-left", "16px");
	await expect(pinned("current")).toHaveCSS("animation-duration", "0.2s");
	await expect(editor.getByText("悬停或聚焦后 700ms 出现")).toBeVisible();
	// The delay is real behavior: nothing shows right away, then the tooltip opens.
	const trigger = editor
		.locator("[data-tuning-current]")
		.getByRole("button", { name: "悬停试试", exact: true });
	await trigger.hover();
	await page.waitForTimeout(300);
	await expect(hovered).toHaveCount(0);
	await expect(hovered).toBeVisible({ timeout: 2_000 });
	await expect(hovered).toContainText("显示延迟 700ms");
	await page.mouse.move(0, 0);
	await expect(hovered).toHaveCount(0);
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(pinned("current")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比" }).click();
	await expect(pinned("before")).toHaveCSS("padding-left", "12px");
	await editor.getByRole("textbox", { name: "Tooltip 版本名称" }).fill("慢提示");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「慢提示」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Drawer editor previews real directional surfaces, drag, comparison and saved versions", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/drawer", { waitUntil: "networkidle" });
	const openButton = page.getByRole("button", { name: "微调 Drawer", exact: true });
	await openButton.click();
	const editor = page.getByRole("dialog", { name: "Drawer · 组件参数" });
	await expect(editor.getByTestId("drawer-dials")).toBeVisible();
	const part = (pane: string, slot: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="drawer-${slot}"]`);
	await expect(
		editor.getByRole("slider", { name: "页眉内边距（px）", exact: true })
	).toHaveAttribute("aria-valuenow", "16");
	await setNumber(page, "页眉内边距（px）", 22);
	await setNumber(page, "页脚内边距（px）", 30);
	await setNumber(page, "页脚按钮间距（px）", 14);
	await setNumber(page, "遮罩不透明度（%）", 40);
	await editor.getByRole("button", { name: /^圆角档位/ }).click();
	await page.getByRole("option", { name: "none · 直角" }).click();
	await expect(part("current", "header")).toHaveCSS("padding-top", "22px");
	await expect(part("current", "footer")).toHaveCSS("padding-left", "30px");
	await expect(part("current", "footer")).toHaveCSS("gap", "14px");
	await expect(part("current", "overlay")).toHaveCSS("background-color", "rgba(0, 0, 0, 0.4)");
	await expect(part("current", "content")).toHaveCSS("border-top-left-radius", "0px");
	// Unlike Sheet, Vaul keeps its real drag and fixed runtime motion contract.
	await expect(part("current", "content")).toHaveCSS("animation-duration", "0.5s");
	for (const [label, direction] of [
		["顶部", "top"],
		["左侧", "left"],
		["右侧", "right"],
		["底部", "bottom"],
	]) {
		await editor.getByRole("radio", { name: label, exact: true }).first().click();
		await expect(part("current", "content")).toHaveAttribute(
			"data-vaul-drawer-direction",
			direction
		);
	}
	await expect(part("current", "content")).toHaveCSS("transform", "none");
	const box = (await part("current", "header").boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + 10);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width / 2, box.y + 260, { steps: 20 });
	await page.mouse.up();
	await expect(part("current", "content")).toHaveCount(0);
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(part("current", "content")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	await expect(part("before", "header")).toHaveCSS("padding-top", "16px");
	await expect(part("before", "footer")).toHaveCSS("gap", "8px");
	await editor.getByRole("textbox", { name: "Drawer 版本名称" }).fill("宽松抽屉");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松抽屉」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Hover Card editor keeps real hover behavior, previews motion and saves independently", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/hover-card", { waitUntil: "networkidle" });
	const openButton = page.getByRole("button", { name: "微调 Hover Card", exact: true });
	await openButton.click();
	const editor = page.getByRole("dialog", { name: "Hover Card · 组件参数" });
	await expect(editor.getByTestId("hover-card-dials")).toBeVisible();
	const pinned = (pane: string) =>
		editor.locator(
			`[data-tuning-${pane}] [data-hover-card-sample="pinned"] [data-slot="hover-card-content"]`
		);
	const hovered = editor.locator(
		'[data-tuning-current] [data-hover-card-sample="hover"] [data-slot="hover-card-content"]'
	);
	await expect(pinned("current")).toHaveCSS("padding-top", "10px");
	await setNumber(page, "内边距（px）", 22);
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "慢（全局 token）" }).click();
	await editor.getByRole("button", { name: /^出现时滑入距离/ }).click();
	await page.getByRole("option", { name: "16px", exact: true }).click();
	await expect(pinned("current")).toHaveCSS("padding-top", "22px");
	await expect(pinned("current")).toHaveCSS("animation-duration", "0.3s");
	for (const [label, side] of [
		["上方", "top"],
		["左侧", "left"],
		["右侧", "right"],
		["下方", "bottom"],
	]) {
		await editor.getByRole("radio", { name: label, exact: true }).first().click();
		await expect(pinned("current")).toHaveAttribute("data-side", side);
	}
	const trigger = editor
		.locator("[data-tuning-current]")
		.getByRole("button", { name: "悬停试试", exact: true });
	await trigger.hover();
	await expect(hovered).toBeVisible({ timeout: 2_000 });
	await expect(hovered).toHaveCSS("padding-top", "22px");
	// Move out of Bits' safe polygon, rather than teleporting its exit point to (0, 0).
	await page.mouse.move(0, 0, { steps: 20 });
	await expect(hovered).toHaveCount(0);
	await expect(pinned("current")).toBeVisible();
	await editor.getByRole("button", { name: "重播进入与退出" }).click();
	await expect(pinned("current")).toBeVisible();
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	await expect(pinned("before")).toHaveCSS("padding-top", "10px");
	await editor.getByRole("textbox", { name: "Hover Card 版本名称" }).fill("宽松预览卡");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松预览卡」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});

test("Context Menu editor supports real right-click, keyboard submenu and isolated comparison", async ({
	page,
}) => {
	test.setTimeout(60_000);
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/docs/components/context-menu", { waitUntil: "networkidle" });
	const openButton = page.getByRole("button", { name: "微调 Context Menu", exact: true });
	await openButton.click();
	const editor = page.getByRole("dialog", { name: "Context Menu · 组件参数" });
	await expect(editor.getByTestId("context-menu-dials")).toBeVisible();
	const part = (pane: string, slot: string) =>
		editor.locator(`[data-tuning-${pane}] [data-slot="context-menu-${slot}"]`);
	await expect(part("current", "content")).toBeVisible();
	await setNumber(page, "面板内边距（px）", 8);
	await setNumber(page, "菜单项横向内边距（px）", 10);
	await setNumber(page, "图文间距（px）", 8);
	await editor.getByRole("button", { name: /^动效档位/ }).click();
	await page.getByRole("option", { name: "慢（全局 token）" }).click();
	await expect(part("current", "content")).toHaveCSS("padding-top", "8px");
	await expect(part("current", "content")).toHaveCSS("animation-duration", "0.3s");
	await expect(part("current", "group-heading").first()).toHaveCSS("padding-left", "10px");
	await expect(part("current", "item").filter({ hasText: "在新窗口中打开" })).toHaveCSS(
		"padding-left",
		"34px"
	);
	await expect(part("current", "separator").first()).toHaveCSS("margin-left", "-8px");
	const target = part("current", "trigger");
	await target.click({ button: "right", position: { x: 30, y: 20 } });
	await expect(part("current", "content")).toBeVisible();
	await target.focus();
	await target.press("Shift+F10");
	// Bits focuses the first enabled item when the menu gains keyboard focus.
	await expect(
		part("current", "content")
			.getByRole("menuitem", { name: /^打开/ })
			.first()
	).toBeFocused();
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("ArrowDown"); // Skip the disabled row.
	await expect(part("current", "sub-trigger")).toBeFocused();
	await page.keyboard.press("ArrowRight");
	await expect(part("current", "sub-content")).toBeVisible();
	await expect(part("current", "sub-content")).toHaveCSS("padding-top", "8px");
	await expect(
		part("current", "sub-content").getByRole("menuitem", { name: "邮件", exact: true })
	).toBeFocused();
	await page.keyboard.press("ArrowLeft");
	await part("current", "checkbox-item").click();
	await expect(part("current", "checkbox-item")).toHaveAttribute("aria-checked", "false");
	await setNumber(page, "最小宽度（px）", 320);
	await page.setViewportSize({ width: 390, height: 1000 });
	await target.scrollIntoViewIfNeeded();
	await target.focus();
	await target.press("Shift+F10");
	await expect(part("current", "item").first()).toBeFocused();
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("ArrowRight");
	await expect(part("current", "sub-content")).toBeVisible();
	await expect(async () => {
		const bounds = (await editor.locator("[data-context-menu-canvas]").boundingBox())!;
		for (const slot of ["content", "sub-content"]) {
			const menu = (await part("current", slot).boundingBox())!;
			expect(menu.x).toBeGreaterThanOrEqual(bounds.x);
			expect(menu.x + menu.width).toBeLessThanOrEqual(bounds.x + bounds.width);
		}
	}).toPass();
	await page.keyboard.press("ArrowLeft");
	await page.setViewportSize({ width: 1280, height: 720 });
	await editor.getByRole("radio", { name: "并排对比", exact: true }).click();
	await expect(part("before", "content")).toHaveCSS("padding-top", "4px");
	await expect(part("before", "checkbox-item")).toHaveAttribute("aria-checked", "true");
	await editor.getByRole("textbox", { name: "Context Menu 版本名称" }).fill("宽松右键菜单");
	await editor.getByRole("button", { name: "保存版本", exact: true }).click();
	await expect(editor.getByRole("status")).toContainText("已保存「宽松右键菜单」");
	await page.keyboard.press("Escape");
	await expect(editor).toHaveCount(0);
	await expect(openButton).toBeFocused();
	expect(errors).toEqual([]);
});
