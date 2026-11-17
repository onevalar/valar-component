import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Bubble keeps grouped prompts and selectable reactions at 320px in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 844 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/bubble", { waitUntil: "networkidle" });
		const group = page.getByRole("group", { name: "Consecutive prompts", exact: true });
		const prompts = group.locator('[data-slot="bubble-content"]');
		await expect(prompts).toHaveCount(2);
		const first = (await prompts.first().boundingBox())!;
		const second = (await prompts.last().boundingBox())!;
		expect(second.y - first.y - first.height).toBeCloseTo(16);
		expect(second.x + second.width).toBeCloseTo(first.x + first.width);
		await expect(prompts.first()).toHaveCSS("border-radius", "8px");
		await expect(prompts.first()).toHaveCSS("line-height", "24px");

		const reactions = page.getByRole("group", { name: "Comment reactions", exact: true });
		await expect(reactions).toHaveCSS("position", "static");
		await expect(reactions).toHaveCSS("flex-wrap", "wrap");
		const like = reactions.getByRole("button", { name: "Thumbs up", exact: true });
		await expect(like).toHaveCSS("height", "28px");
		await expect(like).toHaveCSS("padding-inline", "8px");
		await expect(like).toHaveAttribute("aria-pressed", "false");
		await like.press("Space");
		await expect(like).toBeFocused();
		await expect(like).toHaveCSS("outline-offset", "-1px");
		await expect(like).toHaveAttribute("aria-pressed", "true");
		await expect(like).toContainText("2");
		await expect(like).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(16.855 18.028 285.615)" : "lch(92.222 5.203 282.49)"
		);
		await like.press("Enter");
		await expect(like).toHaveAttribute("aria-pressed", "false");
		await expect(like).toContainText("1");

		const action = page.getByRole("button", { name: "I forgot my password", exact: true });
		await expect(action).toHaveAttribute("data-slot", "bubble-content");
		await action.press("Enter");
		await expect(page.getByText("You clicked forgot password", { exact: true })).toBeVisible();
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});

	test(`Alert notification keeps its action and dismissal reachable at 320px in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 844 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/alert", { waitUntil: "networkidle" });
		const notification = page.getByRole("alert").filter({ hasText: "File exceeds size limit" });
		const title = notification.locator('[data-slot="alert-title"]');
		const description = notification.locator('[data-slot="alert-description"]');
		const show = page.getByRole("button", { name: "Simulate oversized file", exact: true });
		const close = notification.getByRole("button", { name: "Dismiss notification", exact: true });
		const recover = notification.getByRole("button", { name: "Choose another", exact: true });
		await expect(notification).toHaveCSS("max-width", "384px");
		await expect(notification).toHaveCSS("padding", "12px");
		await expect(notification).toHaveCSS("gap", "8px");
		await expect(notification).toHaveCSS("border-radius", "12px");
		await expect(notification).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(12.72 0.85 272)" : "lch(100 0 282)"
		);
		await expect(description).toHaveCSS("font-size", "13px");
		await expect(close).toHaveCSS("height", "24px");
		await expect(recover).toHaveCSS("height", "32px");
		const titleBox = (await title.boundingBox())!;
		const closeBox = (await close.boundingBox())!;
		const bodyBox = (await description.boundingBox())!;
		const recoverBox = (await recover.boundingBox())!;
		expect(closeBox.x - titleBox.x - titleBox.width).toBeGreaterThanOrEqual(7);
		expect(recoverBox.y - bodyBox.y - bodyBox.height).toBeGreaterThanOrEqual(7);

		await close.press("Enter");
		await expect(notification).toHaveCount(0);
		await expect(show).toBeFocused();
		await show.press("Space");
		await recover.press("Enter");
		await expect(notification).toHaveCount(0);
		await expect(show).toBeFocused();
		await expect(page.getByText("Choose another file.", { exact: true })).toBeVisible();
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});
}
