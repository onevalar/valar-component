import { expect, test } from "@playwright/test";

for (const [framework, base] of [
	["react", process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/"],
	["vue", process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/"],
] as const) {
	test(`${framework}: code stays readable while highlighting streamed lines and copies the original text`, async ({ page, context }) => {
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await page.setViewportSize({ width: 320, height: 640 });
		await page.goto(`${base}?example=code-block&theme=dark`);
		const source = page.locator("pre[aria-label='Example source']");
		const lines = source.locator("[data-slot=code-block-line]");
		const comments = lines.nth(1).locator("span[style]");
		await expect(lines).toHaveCount(4);
		await expect(source).toHaveCSS("counter-reset", "line 17");
		await expect(lines.nth(2)).toHaveText("");
		await expect(lines.nth(3)).toContainText("<script>example</script>");
		await expect(source.locator("script")).toHaveCount(0);
		await expect(comments).toHaveCount(1);
		const commentColor = await comments.evaluate((el) => getComputedStyle(el).color);
		const keywordColor = await lines.nth(3).locator("span[style]").first().evaluate((el) => getComputedStyle(el).color);
		expect(commentColor).not.toBe(keywordColor);
		await page.getByRole("button", { name: "Append output" }).click();
		const added = lines.nth(4);
		await expect(added).toHaveAttribute("data-variant", "added");
		await expect(added.locator("span[style]").first()).toBeVisible();
		await expect(comments).toHaveCSS("color", commentColor);
		await expect.poll(() => source.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeGreaterThan(0);
		await page.getByRole("button", { name: "Wrap lines" }).click();
		await expect.poll(() => source.evaluate((el) => el.scrollWidth - el.clientWidth)).toBe(0);
		await source.focus();
		await expect(source).toBeFocused();
		const copy = page.getByRole("button", { name: "Copy code" });
		await copy.focus();
		await expect(page.locator("[data-slot='code-block-actions']")).toHaveCSS("opacity", "1");
		await copy.press("Enter");
		await expect(page.getByRole("button", { name: "Code copied" })).toBeFocused();
		await expect(page.locator("[aria-live=polite]").filter({ hasText: "Code copied" })).toHaveCount(1);
		expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
			'/* Preview only\n   Code is rendered as text. */\n\nconst markup = "<script>example</script>";\n' +
			'console.log("A long output checks whether the code wraps at a narrow viewport.");\n'
		);
		const plain = page.getByRole("button", { name: "Plain text" });
		await plain.click();
		await expect(source.locator("span[style]")).toHaveCount(0);
		await expect(lines).toHaveCount(5);
		await plain.click();
		await expect(comments).toHaveCSS("color", commentColor);
	});
}
