import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Agent Message shows reply states and accessible actions in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
		await page.goto("/docs/components/message");
		const reply = page.getByRole("group", { name: "Agent response", exact: true });
		const prompt = page.getByRole("group", { name: "Prompt", exact: true });
		const text = reply.getByText("Review the narrow layout, then check the keyboard interactions.");
		await expect(text).toHaveCSS("font-size", "15px");
		await expect(text).toHaveCSS("line-height", "24px");
		await expect(prompt.locator('[data-slot="bubble"]')).toHaveCSS("max-width", "75%");
		const action = reply.getByRole("button", { name: "Copy response" });
		await expect(action).toHaveCSS("width", "24px");
		await expect(action).toHaveCSS("height", "24px");
		await action.press("Enter");
		await expect(reply.getByRole("status")).toHaveText("Copied");
		expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
			await text.textContent()
		);

		const simulate = page.getByRole("button", { name: "Simulate response", exact: true });
		const stop = page.getByRole("button", { name: "Stop response", exact: true });
		await simulate.press("Enter");
		await expect(reply.getByRole("status")).toHaveText("Thinking…");
		await expect(action).toBeHidden();
		await expect(stop).toBeFocused();
		await stop.press("Space");
		await expect(reply.getByRole("status")).toHaveText("Response stopped");
		await expect(simulate).toBeFocused();
		await simulate.press("Enter");
		await page.getByRole("button", { name: "Complete response", exact: true }).press("Enter");
		await expect(action).toBeVisible();
		await expect(simulate).toBeFocused();
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			390
		);
	});

	test(`Agent Message Scroller keeps reader position and overlays its scrollbar in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/message-scroller");
		const viewport = page.getByRole("region", { name: "Conversation history", exact: true });
		const root = viewport.locator('xpath=ancestor::*[@data-slot="message-scroller"][1]');
		const scrollbar = root.locator(
			'[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]'
		);
		const latest = root.locator('[data-slot="message-scroller-button"]');
		await expect(viewport).toHaveCSS("scrollbar-width", "none");
		const inspect = () =>
			viewport.evaluate((element) => ({
				width: element.clientWidth,
				gutter: element.offsetWidth - element.clientWidth,
				scroll: element.scrollTop,
				remaining: element.scrollHeight - element.clientHeight - element.scrollTop,
			}));
		await expect.poll(async () => (await inspect()).remaining).toBeGreaterThan(20);
		await page.mouse.move(1, 1);
		await expect(scrollbar).toBeHidden();
		const before = await inspect();
		await viewport.hover();
		await expect(scrollbar).toHaveCSS("position", "absolute");
		await expect(scrollbar).toBeVisible();
		expect(await inspect()).toMatchObject({ width: before.width, gutter: 0 });
		await viewport.press("PageDown");
		await expect.poll(async () => (await inspect()).scroll).toBeGreaterThan(0);
		await viewport.press("Home");
		await expect.poll(async () => (await inspect()).scroll).toBe(0);
		await page.getByRole("button", { name: "Append reply", exact: true }).press("Enter");
		await expect(viewport.getByText(/^Reply 7\./)).toBeAttached();
		expect(await inspect()).toMatchObject({ width: before.width, scroll: 0 });
		await expect(latest).toHaveCSS("height", "28px");
		await expect(latest).toHaveCSS("bottom", "12px");
		await latest.press("Enter");
		await expect.poll(async () => (await inspect()).remaining).toBeLessThan(2);
		await expect(latest).toHaveAttribute("inert", "");
		await expect(viewport).toBeFocused();
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			390
		);
	});
}
