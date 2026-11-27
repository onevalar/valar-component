import { expect, test } from "@playwright/test";
import { blockTemplate } from "../../apps/block-template.js";
import { blocks } from "../src/__registry__/blocks.js";

const templates = blocks.filter(blockTemplate);

test("the bilingual inventory links every installable template and Svelte remains the default", async ({
	page,
}) => {
	for (const prefix of ["", "/zh"]) {
		await page.goto(`${prefix}/docs/installation/registry-blocks`);
		for (const framework of ["react", "vue"]) {
			const links = await page
				.locator(`a[href*="/block-templates/"][href$="?framework=${framework}"]`)
				.evaluateAll((items) =>
					items.map((item) => new URL((item as HTMLAnchorElement).href).pathname)
				);
			expect(links.sort()).toEqual(
				templates.map((block) => `${prefix}/block-templates/${block}`).sort()
			);
		}
	}
	await page.goto("/block-templates/signup-04");
	await expect(page.getByRole("tab", { name: "Svelte", exact: true })).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await expect(page.getByRole("link", { name: "Open Svelte preview" })).toHaveAttribute(
		"href",
		"/view/signup-04"
	);
	await expect(page.locator("[data-framework-usage]")).toContainText("add signup-04");
	await page.getByRole("tab", { name: "Vue", exact: true }).click();
	await expect(page).toHaveURL(/framework=vue$/);
	await expect(page.locator("[data-usage-example]")).toContainText("@valar/vue-ui/input-otp");
	await expect(page.locator("[data-framework-usage]")).toContainText('block="signup-04"');
	await expect(page.locator("[data-framework-usage]")).not.toContainText("@valar/svelte-cli");
});

test("the Svelte week-number block rolls into ISO week 1 before January", async ({ page }) => {
	await page.goto("/view/calendar-15");
	await expect(page.getByRole("rowheader", { name: "第 23 周" })).toBeVisible();
	const next = page.getByRole("button", { name: "Next", exact: true });
	for (let month = 7; month <= 12; month++) {
		await next.click();
		await expect(page.getByRole("application", { name: `Event 2025年${month}月` })).toBeVisible();
	}
	const rows = page.getByRole("rowheader");
	await expect(rows.nth(-2)).toHaveAccessibleName("第 52 周");
	await expect(rows.last()).toHaveAccessibleName("第 1 周");
	const firstWeek = page
		.getByRole("row")
		.filter({ has: page.getByRole("rowheader", { name: "第 1 周" }) });
	await expect(firstWeek.getByRole("gridcell", { name: /2025年12月29日/ })).toBeVisible();
});

for (const framework of ["react", "vue"] as const) {
	for (const family of ["auth", "calendar", "sidebar", "dashboard-01", "new-components-01"]) {
		test(`${framework} ${family}: every template mounts and source is available`, async ({
			page,
		}) => {
			test.setTimeout(120_000);
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			const ids = templates.filter((block) => blockTemplate(block) === family);
			expect(ids.length).toBeGreaterThan(0);
			const prefix = framework === "react" ? "" : "/zh";
			for (const [i, block] of ids.entries()) {
				const query = new URLSearchParams({ example: block, lang: prefix ? "zh" : "en" });
				const preview = `/framework-previews/${framework}/index.html?${query}`;
				const root = framework === "react" ? "#root" : "#app";
				if (i === 0) {
					await page.goto(`${prefix}/block-templates/${block}?framework=${framework}`);
					const frame = page.locator(`[data-framework-usage=${framework}] iframe`);
					await expect(frame).toHaveAttribute("src", preview);
					await expect(frame.contentFrame().locator(root)).not.toBeEmpty();
					await expect(page.locator("[data-usage-example]")).toContainText(
						`@valar/${framework}-ui/`
					);
				} else {
					await page.goto(preview);
					await expect(page.locator(root)).not.toBeEmpty();
					await expect(page.getByText("Template unavailable")).toHaveCount(0);
				}
			}
			expect(errors).toEqual([]);
		});
	}

	test(`${framework} auth: layout, password mismatch, and OTP paste without network submission`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 706 });
		const preview = `/framework-previews/${framework}/index.html?example=`;
		await page.goto(`${preview}signup-04&theme=dark`);
		await expect(page.locator("[data-auth-art]")).toBeHidden();
		await page.getByRole("textbox", { name: "Email" }).fill("sample@example.test");
		await page.getByLabel("Password", { exact: true }).fill("example pass");
		const confirmation = page.getByLabel("Confirm password");
		await confirmation.fill("different pass");
		await page.getByRole("button", { name: "Create account", exact: true }).click();
		await expect(confirmation).toBeFocused();
		await expect(confirmation).toHaveAttribute("aria-invalid", "true");
		await expect(page.getByRole("alert")).toHaveText("Passwords do not match.");
		await confirmation.fill("example pass");
		await confirmation.press("Enter");
		await expect(page.getByRole("status")).toHaveText("Form validated. No data was sent.");
		await page.setViewportSize({ width: 1024, height: 700 });
		await expect(page.locator("[data-auth-art]")).toBeVisible();

		await page.setViewportSize({ width: 320, height: 706 });
		await page.goto(`${preview}otp-02`);
		const code = page.getByRole("textbox", { name: "Verification code" });
		const verify = page.getByRole("button", { name: "Verify", exact: true });
		await expect(verify).toBeDisabled();
		await expect(page.locator('[data-slot="input-otp-group"]')).toHaveCount(3);
		await code.focus();
		await code.evaluate((field) => {
			const clipboardData = new DataTransfer();
			clipboardData.setData("text/plain", "04 2-978");
			field.dispatchEvent(
				new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true })
			);
		});
		await expect(code).toHaveValue("042978");
		await expect(verify).toBeEnabled();
		await verify.click();
		await expect(page.getByRole("status")).toHaveText("Form validated. No data was sent.");
		await page.getByRole("button", { name: "Resend code" }).click();
		await expect(page.getByRole("status")).toHaveText(
			"Resend code: connect this action in your app."
		);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});

	test(`${framework} week numbers leave room for the adjacent weekday`, async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 440 });
		await page.goto(`/framework-previews/${framework}/index.html?example=calendar-15&theme=dark`);
		await expect(page.getByRole("rowheader", { name: "Week 23" })).toBeVisible();
		const gaps = await page.locator('th[aria-label="Week"]').evaluate((cell) => {
			const bounds = (element: Element) => {
				const range = document.createRange();
				range.selectNodeContents(element);
				return range.getBoundingClientRect();
			};
			const text = bounds(cell);
			return {
				withinCell: cell.getBoundingClientRect().right - text.right,
				adjacent: bounds(cell.nextElementSibling!).left - text.right,
			};
		});
		expect(gaps.withinCell).toBeGreaterThanOrEqual(0);
		expect(gaps.adjacent).toBeGreaterThan(0);
	});
}
