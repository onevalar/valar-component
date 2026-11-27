import { expect, test } from "@playwright/test";

const scenes = ["settings", "new-issue", "my-issues", "inbox", "projects", "agent"];
const patterns = [
	"chat",
	"message",
	"prompt-input",
	"model-selector",
	"suggestion",
	"queue",
	"chain-of-thought",
	"reasoning",
	"plan",
	"task",
	"tool",
	"subagent",
	"checkpoint",
	"confirmation",
	"sources",
	"inline-citation",
	"context",
	"terminal",
	"stack-trace",
	"test-results",
	"file-tree",
];

for (const framework of ["react", "vue"]) {
	for (const [section, entries] of [
		["advanced", scenes],
		["docs/ai-elements", patterns],
	] as const) {
		test(`${framework} ${section}: native example renders and uses the public SDK`, async ({
			page,
		}) => {
			test.setTimeout(180_000);
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			for (const slug of entries) {
				const zh = framework === "vue";
				const example = section === "advanced" ? `${slug}-01` : `ai-${slug}`;
				await page.goto(`${zh ? "/zh" : ""}/${section}/${slug}?framework=${framework}`, {
					waitUntil: "domcontentloaded",
				});
				const usage = page.locator(`[data-framework-usage=${framework}]`);
				const preview = usage.locator("iframe");
				const query = new URLSearchParams({ example, lang: zh ? "zh" : "en" });
				if (section === "advanced" && slug === "projects") query.set("scenario", "sample");
				await expect(preview, slug).toHaveAttribute(
					"src",
					`/framework-previews/${framework}/index.html?${query}`,
					{ timeout: 20_000 }
				);
				const frame = preview.contentFrame();
				await expect(frame.locator("html")).toHaveAttribute("lang", zh ? "zh-CN" : "en");
				await expect(frame.locator(framework === "react" ? "#root" : "#app")).not.toBeEmpty();
				await expect(frame.locator(".first-batch-demo")).toHaveCount(0);
				await expect(usage.locator("[data-usage-example]")).toContainText(
					`@valar/${framework}-ui/`
				);
				await expect(usage).toContainText(`valar-${framework}-ui-0.1.0.tgz`);
				await expect(usage).not.toContainText("@valar/svelte-cli");
			}
			expect(errors).toEqual([]);
		});
	}
}

test("scene links retain the Svelte install path and Vue scenario controls replace the native sample", async ({
	page,
}) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/advanced/inbox");
	await expect(page.getByRole("button", { name: "Switch to 中文" })).toBeEnabled({
		timeout: 20_000,
	});
	await expect(page.getByRole("tab", { name: "Svelte", exact: true })).toHaveAttribute(
		"aria-selected",
		"true"
	);
	await expect(page.locator("[data-framework-usage] iframe")).toHaveCount(0);
	await page.getByRole("tab", { name: "Install & usage" }).click();
	await expect(
		page.getByText('import Scene from "@valar/svelte-ui/blocks/inbox-01";')
	).toBeVisible();
	await page.getByRole("tab", { name: "Vue", exact: true }).click();
	const preview = page.locator("[data-framework-usage=vue] iframe");
	await expect(preview).toHaveAttribute("src", /example=inbox-01&lang=en$/);
	await page.getByRole("button", { name: "Empty inbox", exact: true }).click();
	await expect(preview).toHaveAttribute("src", /example=inbox-01&lang=en&scenario=empty$/);
	await expect(
		preview
			.contentFrame()
			.getByText(/no notifications|you're all caught up/i)
			.first()
	).toBeVisible();
	const frameRoot = preview.contentFrame().locator("html");
	const frameDocument = await frameRoot.elementHandle();
	await expect(frameRoot).not.toHaveClass(/\bdark\b/);
	await page.getByRole("button", { name: "Toggle theme", exact: true }).first().click();
	await expect(frameRoot).toHaveClass(/\bdark\b/);
	// A reload would discard in-progress edits and replace this document element.
	expect(await frameDocument?.evaluate((element) => element === document.documentElement)).toBe(
		true
	);
});
