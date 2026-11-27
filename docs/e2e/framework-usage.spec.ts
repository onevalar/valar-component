import { expect, test } from "@playwright/test";

test("Svelte remains the default; framework selection, focus, copy and refresh agree", async ({
	page,
	context,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);
	await page.goto("/zh/docs/components/button?ref=usage", { waitUntil: "networkidle" });
	await expect(page.getByRole("tab", { name: "状态与调节", exact: true })).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await expect(page.getByRole("region", { name: "Button 样式调节", exact: true })).toBeVisible();
	await page.getByRole("tab", { name: "使用组件", exact: true }).click();
	await expect(page.getByRole("tab", { name: "Svelte", exact: true })).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await expect(page.getByRole("region", { name: "Svelte 安装与用法" })).toContainText(
		"@valar/svelte-cli"
	);
	await page.getByRole("tab", { name: "React", exact: true }).click();
	await expect(page.locator("[data-framework-usage=react]")).toBeVisible();
	await expect(page).toHaveURL(/\?ref=usage&framework=react$/);
	await expect(page.getByRole("tab", { name: "React", exact: true })).toBeFocused();
	await expect(page.getByRole("link", { name: "API 参考", exact: true })).toHaveCount(0);
	await expect(page.getByRole("button", { name: "查看源码", exact: true })).toHaveCount(0);
	const example = page.locator("[data-usage-example]");
	await expect(example).toContainText('import { Button } from "@valar/react-ui/button"');
	await example.getByRole("button", { name: "复制代码", exact: true }).click();
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied).toContain("export default function ButtonExample()");
	expect(copied).toContain('<Button variant="outline" onClick={() => setCount(0)}>Reset</Button>');
	expect(copied).not.toContain("Example.tsx");
	await page.getByRole("tab", { name: "React", exact: true }).focus();
	await page.keyboard.press("ArrowRight");
	await expect(page.getByRole("tab", { name: "Vue", exact: true })).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await expect(page.getByRole("tab", { name: "Vue", exact: true })).toBeFocused();
	await expect(example).toContainText('<script setup lang="ts">');
	await expect(page).toHaveURL(/\?ref=usage&framework=vue$/);
	await page.reload({ waitUntil: "networkidle" });
	await expect(page.getByRole("tab", { name: "Vue", exact: true })).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await expect(page.getByRole("tab", { name: "使用组件", exact: true })).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await page.getByRole("tab", { name: "Vue", exact: true }).focus();
	await page.keyboard.press("Home");
	await expect(page.getByRole("tab", { name: "Svelte", exact: true })).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await expect(page.getByRole("link", { name: "API 参考", exact: true })).toHaveCount(0);
	await expect(page.getByRole("button", { name: "查看源码", exact: true })).toBeVisible();
	await page.getByRole("tab", { name: "状态与调节", exact: true }).click();
	await expect(page.getByRole("region", { name: "Button 样式调节", exact: true })).toBeVisible();
	expect(errors).toEqual([]);
});

test("native usage pages expose the correct package, theme and extra dependencies", async ({
	page,
}) => {
	test.setTimeout(120_000);
	for (const framework of ["react", "vue"]) {
		for (const slug of [
			"button",
			"input",
			"checkbox",
			"select",
			"dialog",
			"popover",
			"calendar",
			"range-calendar",
			"slider",
			"chart",
			"separator",
		]) {
			await page.goto(`/zh/docs/components/${slug}?framework=${framework}`, {
				waitUntil: "domcontentloaded",
			});
			const usage = page.locator(`[data-framework-usage=${framework}]`);
			await expect(usage, `${framework}/${slug}`).toContainText("本地可用", { timeout: 15_000 });
			await expect(usage).toContainText(`valar-${framework}-ui-0.1.0.tgz`);
			await expect(usage).toContainText(`@import "@valar/${framework}-ui/theme.css"`);
			await expect(page.locator("[data-usage-example]")).toContainText(
				`@valar/${framework}-ui/${slug}`
			);
			await expect(usage).not.toContainText("@valar/svelte-cli");
			await expect(usage).not.toContainText("$lib/components/ui");
			if (slug === "chart") {
				await expect(usage).toContainText(
					framework === "react" ? "recharts@3.8.0" : "@unovis/vue@1.8.0"
				);
				await expect(page.locator("[data-usage-example]")).toContainText("null");
			}
			if (framework === "vue" && ["calendar", "range-calendar"].includes(slug)) {
				await expect(usage).toContainText("@internationalized/date@3.12.0");
			}
		}
	}
});

for (const framework of ["react", "vue"]) {
	test(`${framework}: high-reuse primitives have native, copyable examples`, async ({ page }) => {
		test.setTimeout(180_000);
		for (const slug of [
			"label",
			"field",
			"textarea",
			"switch",
			"tabs",
			"kbd",
			"tooltip",
			"radio-group",
			"native-select",
			"input-group",
			"toggle",
			"toggle-group",
			"button-group",
		]) {
			await page.goto(`/zh/docs/components/${slug}?framework=${framework}`, {
				waitUntil: "domcontentloaded",
			});
			const usage = page.locator(`[data-framework-usage=${framework}]`);
			await expect(usage, `${framework}/${slug}`).toContainText("本地可用", { timeout: 15_000 });
			const example = usage.locator("[data-usage-example]");
			await expect(example).toContainText(`@valar/${framework}-ui/${slug}`);
			await expect(example.getByRole("button", { name: "复制代码", exact: true })).toBeVisible();
			await expect(example).not.toContainText("$lib/components/ui");
		}
	});

	test(`${framework}: content, feedback and layout have native, copyable examples`, async ({
		page,
	}) => {
		test.setTimeout(180_000);
		for (const slug of [
			"accordion",
			"alert",
			"aspect-ratio",
			"avatar",
			"badge",
			"breadcrumb",
			"card",
			"carousel",
			"collapsible",
			"empty",
			"item",
			"page-layout",
			"pagination",
			"progress",
			"resizable",
			"scroll-area",
			"skeleton",
			"spinner",
		]) {
			await page.goto(`/zh/docs/components/${slug}?framework=${framework}`, {
				waitUntil: "domcontentloaded",
			});
			const usage = page.locator(`[data-framework-usage=${framework}]`);
			await expect(usage, `${framework}/${slug}`).toContainText("本地可用", { timeout: 15_000 });
			const example = usage.locator("[data-usage-example]");
			await expect(example).toContainText(`@valar/${framework}-ui/${slug}`);
			await expect(example.getByRole("button", { name: "复制代码", exact: true })).toBeVisible();
		}
	});

	test(`${framework}: menus, overlays and navigation have native, copyable examples`, async ({
		page,
	}) => {
		test.setTimeout(180_000);
		for (const slug of [
			"alert-dialog",
			"context-menu",
			"drawer",
			"dropdown-menu",
			"hover-card",
			"menubar",
			"navigation-menu",
			"sheet",
			"sidebar",
			"sonner",
		]) {
			await page.goto(`/zh/docs/components/${slug}?framework=${framework}`, {
				waitUntil: "domcontentloaded",
			});
			const usage = page.locator(`[data-framework-usage=${framework}]`);
			await expect(usage, `${framework}/${slug}`).toContainText("本地可用", { timeout: 15_000 });
			const example = usage.locator("[data-usage-example]");
			await expect(example).toContainText(`@valar/${framework}-ui/${slug}`);
			await expect(example.getByRole("button", { name: "复制代码", exact: true })).toBeVisible();
			if (slug === "sidebar") await expect(example).toContainText("Issues refreshed");
		}
	});

	test(`${framework}: complex inputs and composition guides publish the correct public usage`, async ({
		page,
	}) => {
		test.setTimeout(120_000);
		const usage = page.locator(`[data-framework-usage=${framework}]`);
		const example = usage.locator("[data-usage-example]");
		for (const slug of [
			"command",
			"combobox",
			"table",
			"date-picker",
			"number-field",
			"slider-field",
			"input-otp",
			"tags-input",
			"stepper",
			"color-picker",
		]) {
			await page.goto(`/zh/docs/components/${slug}?framework=${framework}`, {
				waitUntil: "domcontentloaded",
			});
			await expect(usage, `${framework}/${slug}`).toContainText("本地可用", { timeout: 15_000 });
			await expect(example).toContainText(`@valar/${framework}-ui/${slug}`);
			await expect(example.getByRole("button", { name: "复制代码", exact: true })).toBeVisible();
		}
		await page.goto(`/zh/docs/components/data-table?framework=${framework}`, {
			waitUntil: "domcontentloaded",
		});
		await expect(usage).toContainText(`@tanstack/${framework}-table@9.0.0`, { timeout: 15_000 });
		await expect(example).toContainText(`@valar/${framework}-ui/table`);
		await expect(example).not.toContainText(`@valar/${framework}-ui/data-table`);
		await page.goto(`/zh/docs/forms?framework=${framework}`, { waitUntil: "domcontentloaded" });
		await expect(usage).toContainText("保存真实数据时仍需服务端校验", { timeout: 15_000 });
		await expect(example).toContainText(`@valar/${framework}-ui/field`);
		await expect(example).toContainText("aria-describedby");
		await expect(example.getByRole("button", { name: "复制代码", exact: true })).toBeVisible();
		await page.getByRole("tab", { name: "Svelte", exact: true }).click();
		await expect(page.getByRole("region", { name: "Svelte 安装与用法" })).toContainText(
			"sveltekit-superforms"
		);
	});

	test(`${framework}: visualizations and meters expose their native package entries`, async ({
		page,
	}) => {
		test.setTimeout(90_000);
		const usage = page.locator(`[data-framework-usage=${framework}]`);
		for (const slug of [
			"donut-chart",
			"gauge",
			"ruler-slider",
			"sparkline",
			"texture-fill",
			"tick-meter",
			"waffle-chart",
		]) {
			await page.goto(`/zh/docs/components/${slug}?framework=${framework}`, {
				waitUntil: "domcontentloaded",
			});
			await expect(usage, `${framework}/${slug}`).toContainText("本地可用", { timeout: 15_000 });
			const example = usage.locator("[data-usage-example]");
			await expect(example).toContainText(`@valar/${framework}-ui/${slug}`);
			await expect(example.getByRole("button", { name: "复制代码", exact: true })).toBeVisible();
		}
	});

	test(`${framework}: conversation and issue pages expose their native package entries`, async ({ page }) => {
		test.setTimeout(90_000);
		const usage = page.locator(`[data-framework-usage=${framework}]`);
		for (const slug of ["attachment", "bubble", "code-block", "marker", "message", "message-scroller", "questionnaire", "trace", "issue-composer", "issue-detail"]) {
			await page.goto(`/zh/docs/components/${slug}?framework=${framework}`, { waitUntil: "domcontentloaded" });
			await expect(usage, `${framework}/${slug}`).toContainText("本地可用", { timeout: 15_000 });
			const example = usage.locator("[data-usage-example]");
			await expect(example).toContainText(`@valar/${framework}-ui/${slug}`);
			await expect(example.getByRole("button", { name: "复制代码", exact: true })).toBeVisible();
		}
	});
}

test("typography offers semantic markup without presenting an installable component", async ({
	page,
}) => {
	test.setTimeout(60_000);
	for (const framework of ["react", "vue"]) {
		await page.goto(`/zh/docs/components/typography?framework=${framework}`, {
			waitUntil: "domcontentloaded",
		});
		const usage = page.locator(`[data-framework-usage=${framework}]`);
		await expect(usage).toContainText("这里是排版指南，不是可安装组件", { timeout: 15_000 });
		const example = usage.locator("[data-usage-example]");
		await expect(example).toContainText("<blockquote");
		await expect(example).toContainText(framework === "react" ? "className=" : "<template>");
		await expect(example.getByRole("button", { name: "复制代码", exact: true })).toBeVisible();
		await expect(usage).not.toContainText("pnpm add");
	}
});

test("the existing language switch preserves the framework and invalid choices retain the default", async ({
	page,
}) => {
	await page.goto("/zh/docs/components/button?framework=react", { waitUntil: "networkidle" });
	await page.getByRole("button", { name: "切换到English", exact: true }).first().click();
	await expect(page).toHaveURL(/\/docs\/components\/button\?framework=react$/);
	await expect(page.getByRole("tab", { name: "Use", exact: true })).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await expect(page.getByRole("tablist", { name: "Framework", exact: true })).toBeVisible();
	await expect(page.locator("[data-framework-usage=react]")).toContainText(
		"Private, unpublished package"
	);
	await page.goto("/docs/components/button?framework=unknown", { waitUntil: "networkidle" });
	await expect(page.getByRole("tab", { name: "States & tuning", exact: true })).toHaveAttribute(
		"aria-selected",
		"true"
	);
});

for (const theme of ["light", "dark"] as const) {
	test(`${theme} usage remains readable at 320/390/1280px without page overflow`, async ({
		page,
	}) => {
		test.setTimeout(90_000);
		await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
		for (const width of [320, 390, 1280]) {
			await page.setViewportSize({ width, height: 900 });
			await page.goto("/zh/docs/components/button?framework=react", { waitUntil: "networkidle" });
			await expect(page.getByRole("tab", { name: "React", exact: true })).toHaveAttribute(
				"aria-selected",
				"true"
			);
			if (theme === "dark") await expect(page.locator("html")).toHaveClass(/dark/);
			else await expect(page.locator("html")).not.toHaveClass(/dark/);
			for (const framework of ["react", "vue", "svelte"]) {
				await page.getByRole("tab", { name: new RegExp(`^${framework}$`, "i") }).click();
				await expect(page.locator(`[data-framework-usage=${framework}]`)).toBeVisible();
				const overflow = await page.evaluate(
					() => document.documentElement.scrollWidth - document.documentElement.clientWidth
				);
				expect(overflow, `${theme}/${width}/${framework}`).toBeLessThanOrEqual(1);
				if (framework !== "svelte") {
					const codeOverflow = await page
						.locator("[data-framework-usage] [data-slot=code-block-content]")
						.evaluateAll((blocks) =>
							Math.max(...blocks.map((block) => block.scrollWidth - block.clientWidth))
						);
					expect(codeOverflow, `wrapped code: ${theme}/${width}/${framework}`).toBeLessThanOrEqual(
						1
					);
				}
			}
		}
	});
}
