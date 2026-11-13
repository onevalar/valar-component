import { execFileSync } from "node:child_process";
import { test, expect, devices } from "@playwright/test";
import { isUnpublishedBasicComponentHref } from "../src/lib/basic-component-visibility.js";

test("Basic component catalog and site search only expose fully aligned components", async ({
	page,
	request,
}) => {
	const response = await request.get("/api/search.json");
	expect(response.ok()).toBe(true);
	const entries: { href: string }[] = await response.json();
	expect(entries.some(({ href }) => href.includes("/docs/ai-elements/"))).toBe(true);
	for (const { prefix, categories } of [
		{ prefix: "", categories: "Categories" },
		{ prefix: "/zh", categories: "分类" },
	]) {
		const root = `${prefix}/docs/components`;
		await page.goto(root, { waitUntil: "networkidle" });
		const nav = page.getByRole("navigation", { name: categories, exact: true });
		const visibleHrefs = new Set<string>();
		for (const chip of await nav.getByRole("link").all()) {
			await chip.click();
			await expect(chip).toHaveAttribute("aria-current", "page");
			const cards = page.locator(`main [data-slot="card-title"] a[href^="${root}/"]`);
			await expect(cards.first()).toBeVisible();
			for (const href of await cards.evaluateAll((links) =>
				links.map((link) => link.getAttribute("href")!)
			))
				visibleHrefs.add(href);
		}
		expect([...visibleHrefs].some(isUnpublishedBasicComponentHref)).toBe(false);
		for (const slug of [
			"avatar",
			"card",
			"hover-card",
			"scroll-area",
			"table",
			"sidebar",
			"breadcrumb",
			"collapsible",
			"item",
			"empty",
		]) {
			expect(visibleHrefs).toContain(`${root}/${slug}`);
		}
		if (visibleHrefs.size === 0) {
			await expect(
				page.getByText(
					prefix === "/zh"
						? "基础组件通过 Linear 整体对齐验收后会在这里展示。目前正在复核。"
						: "Components appear here after their full Linear alignment review. Reviews are in progress.",
					{ exact: true }
				)
			).toBeVisible();
		}

		const searchHrefs = new Set(
			entries
				.map(({ href }) => href.split(/[?#]/, 1)[0])
				.filter((href) => href.startsWith(`${root}/`))
		);
		expect(searchHrefs).toEqual(visibleHrefs);

		const partial = `${root}/progress`;
		if (isUnpublishedBasicComponentHref(partial)) {
			await page.goto(partial);
			await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", "noindex");
			await expect(page.locator('[data-alignment-status="partial"]')).toHaveText(
				prefix === "/zh" ? "部分对齐 · 待整体验收" : "Partially aligned · full review pending"
			);
			await expect(page.getByRole("progressbar").first()).toBeVisible();
		}

		const draft = ["radio-group", "slider", "accordion"]
			.map((slug) => `${root}/${slug}`)
			.find(isUnpublishedBasicComponentHref);
		if (draft) {
			await page.goto(draft);
			await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", "noindex");
			await expect(page.locator('[data-alignment-status="pending"]')).toHaveText(
				prefix === "/zh" ? "待完成样式对齐" : "Design alignment pending"
			);
		}
	}
});

test("Slider names belong to focusable thumbs and keyboard values still change", async ({
	page,
}) => {
	await page.goto("/docs/components/slider", { waitUntil: "networkidle" });
	const volume = page.getByRole("slider", { name: "Volume", exact: true });
	await expect(volume).toHaveAttribute("aria-valuenow", "75");
	await volume.focus();
	await page.keyboard.press("ArrowRight");
	await expect(volume).toHaveAttribute("aria-valuenow", "76");
	for (const name of [
		"Minimum",
		"Maximum",
		"First level",
		"Second level",
		"Third level",
		"Minimum temperature",
		"Maximum temperature",
	]) {
		await expect(page.getByRole("slider", { name, exact: true })).toHaveCount(1);
	}
});

test("Command dialog exposes the active option and returns focus after selection", async ({
	page,
}) => {
	await page.goto("/zh/docs/components/command", { waitUntil: "networkidle" });
	const opener = page.getByRole("button", { name: "Open command menu", exact: true });
	await opener.click();
	const dialog = page.getByRole("dialog", { name: "Workspace commands", exact: true });
	const input = dialog.getByRole("combobox");
	await expect(input).toBeFocused();
	await input.press("ArrowDown");
	await expect(input).toHaveAttribute("aria-activedescendant", /.+/);
	const active = dialog.getByRole("option", { selected: true });
	await expect(active).toHaveAttribute("id", (await input.getAttribute("aria-activedescendant"))!);
	await expect(input).toBeFocused();
	await input.fill("settings");
	await expect(dialog.getByRole("option", { name: "Preferences", exact: true })).toBeVisible();
	await input.press("Enter");
	await expect(dialog).toHaveCount(0);
	await expect(opener).toBeFocused();
	await expect(page.getByRole("status").filter({ hasText: "Ran Preferences" })).toBeVisible();
});

test("native number reset and nonempty/empty tag Enter preserve form contracts", async ({
	page,
}) => {
	await page.goto("/docs/components/number-field", { waitUntil: "networkidle" });
	const amount = page.getByRole("spinbutton", { name: "金额 / Amount（必填）" });
	const form = page.locator("form").filter({ has: amount });
	await amount.fill("1.234,56 €");
	await form.getByRole("button", { name: "提交", exact: true }).click();
	await expect(form.locator("output")).toHaveText('{"amount":"1234.56"}');
	await form.getByRole("button", { name: "重置", exact: true }).click();
	await expect(amount).toHaveValue("");
	await page.goto("/docs/components/tags-input", { waitUntil: "networkidle" });
	const input = page.getByRole("textbox", { name: "主题（1–3 项，每项至少 2 字）" });
	const tagsForm = page.locator("form").filter({ has: input });
	await input.fill("Svelte");
	await input.press("Enter");
	await expect(tagsForm.locator("output")).toHaveText("尚未提交");
	await input.press("Enter");
	await expect(tagsForm.locator("output")).toHaveText('["Svelte"]');
});

test("Stepper rejects, retries and cancels obsolete forward navigation", async ({ page }) => {
	await page.goto("/docs/components/stepper", { waitUntil: "networkidle" });
	const flow = page.getByRole("group", { name: "异步失败与重试", exact: true });
	await flow.getByRole("button", { name: "下一步 / 重试", exact: true }).click();
	await expect(flow.locator('[aria-current="step"]')).toContainText("异步校验");
	await flow.getByRole("button", { name: "下一步 / 重试", exact: true }).click();
	await expect(flow.getByRole("button", { name: "校验中…", exact: true })).toBeDisabled();
	await flow.getByRole("button", { name: "上一步", exact: true }).click();
	await page.waitForTimeout(1400); // Longer than the public demo's pending validation.
	await expect(flow.locator('[aria-current="step"]')).toContainText("准备");
	await flow.getByRole("button", { name: "下一步 / 重试", exact: true }).click();
	await flow.getByRole("button", { name: "下一步 / 重试", exact: true }).click();
	await expect(flow.getByRole("alert")).toContainText("首次校验失败");
	await flow.getByRole("button", { name: "下一步 / 重试", exact: true }).click();
	await expect(flow.locator('[aria-current="step"]')).toContainText("完成");
	await expect(flow.locator('[data-slot="stepper-content"]:visible')).toBeFocused();
});

test("full-text search loads on demand, retries failures and shares an in-flight load", async ({
	page,
}) => {
	let requests = 0;
	let release!: () => void;
	const pending = new Promise<void>((resolve) => {
		release = resolve;
	});
	await page.route("**/api/search.json", async (route) => {
		requests++;
		if (requests === 1) return route.fulfill({ status: 503, body: "Unavailable" });
		await pending;
		await route.continue();
	});
	await page.goto("/docs/components/slider", { waitUntil: "networkidle" });
	const volume = page.getByRole("slider", { name: "Volume", exact: true });
	await volume.focus();
	await volume.press("ArrowRight");
	await expect(volume).toHaveAttribute("aria-valuenow", "76");
	expect(requests).toBe(0);
	const open = page.getByRole("button", { name: "Search documentation", exact: true });
	const query = page.getByRole("dialog").getByRole("combobox");
	await open.click();
	await query.fill("upstream-source-manifest");
	await expect(page.getByRole("status")).toContainText("Full-text search unavailable");
	await query.fill("Breadcrumb");
	await expect(page.getByRole("option", { name: "Breadcrumb", exact: true })).toBeVisible();
	await page.keyboard.press("Escape");
	await open.click();
	await query.fill("upstream-source-manifest");
	await expect(page.getByRole("status")).toHaveText("Loading documentation search…");
	await page.keyboard.press("Escape");
	await open.click();
	await query.fill("upstream-source-manifest");
	expect(requests).toBe(2);
	release();
	const results = page.locator('[data-slot="command-group"]').filter({ hasText: "Search Results" });
	await expect(results.getByRole("option").first()).toBeVisible();
	await page.keyboard.press("Escape");
	await open.click();
	await query.fill("upstream-source-manifest");
	await expect(results.getByRole("option").first()).toBeVisible();
	expect(requests).toBe(2);
});

test.describe("phone layout and touch navigation", () => {
	test.use({
		viewport: devices["Pixel 7"].viewport,
		userAgent: devices["Pixel 7"].userAgent,
		isMobile: true,
		hasTouch: true,
		deviceScaleFactor: 2,
	});
	// Keep every route/width assertion, but don't monopolize one CI worker with
	// all 24 navigations before the remaining independent contracts can run.
	for (const width of [320, 390, 768]) {
		test(`shared docs layouts fit a ${width}px screen`, async ({ page }) => {
			test.setTimeout(120_000);
			await page.setViewportSize({ width, height: 740 });
			for (const route of [
				"slider",
				"dialog",
				"number-field",
				"tags-input",
				"stepper",
				"slider-field",
				"color-picker",
				"data-table",
			]) {
				await page.goto(`/docs/components/${route}`, { waitUntil: "networkidle" });
				await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
				expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
					width + 1
				);
			}
		});
	}
	test("touch navigation and search survive a reduced viewport", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/docs/components/data-table", { waitUntil: "networkidle" });
		await page.getByRole("button", { name: "Toggle menu Menu", exact: true }).tap();
		const link = page.getByRole("link", { name: "Formsnap", exact: true });
		const href = await link.getAttribute("href");
		await link.scrollIntoViewIfNeeded();
		await link.tap();
		await page.waitForURL(`**${href}`);
		await expect(
			page.getByRole("button", { name: "Toggle menu Menu", exact: true })
		).toHaveAttribute("aria-expanded", "false");
		await page.getByRole("button", { name: "Search documentation", exact: true }).tap();
		await page.getByRole("dialog").getByRole("combobox").fill("Breadcrumb");
		await expect(page.getByRole("option", { name: "Breadcrumb", exact: true })).toBeVisible();
		await page.setViewportSize({ width: 390, height: 360 });
		await expect
			.poll(() => page.getByRole("dialog").evaluate((el) => el.getBoundingClientRect().bottom))
			.toBeLessThanOrEqual(360);
		await page.getByRole("button", { name: "关闭", exact: true }).tap();
		await expect(page.getByRole("dialog")).toHaveCount(0);
	});
});

test("local CLI tarball installs into an independent, checked and built consumer", async ({
	baseURL,
}) => {
	test.setTimeout(240_000);
	execFileSync("pnpm", ["test:consumer"], {
		cwd: process.cwd(),
		env: { ...process.env, REGISTRY_URL: `${baseURL}/registry` },
		stdio: "inherit",
	});
});

test("homepage opens the assistant and its navigation fits one desktop screen", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/", { waitUntil: "networkidle" });
	const nav = page.locator("header nav").first();
	await expect(nav.getByRole("link")).toHaveText([
		"Assistant",
		"Basic components",
		"Advanced components",
		"Docs",
		"Design tokens",
	]);
	await expect(page.getByRole("heading", { level: 1, name: "想设计点什么？" })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(1300);
});
