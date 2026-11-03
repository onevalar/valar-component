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
