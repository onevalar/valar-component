import { expect, test } from "@playwright/test";

for (const width of [834, 390]) {
	test(`Trace sample uses an overlay scrollbar without changing content width at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 852 });
		await page.goto("/zh/docs/components/trace", { waitUntil: "networkidle" });
		const sample = page.locator(".sample").filter({ hasText: "Why does pnpm install fail in CI?" });
		const viewport = sample.getByRole("region", { name: "Trace 示例滚动区", exact: true });
		const bar = sample.locator('[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]');
		const prompt = sample.getByText("Why does pnpm install fail in CI?", { exact: true });

		await expect(prompt).toBeInViewport();
		await expect(viewport).toHaveCSS("scrollbar-width", "none");
		expect(await viewport.evaluate((node) => node.scrollHeight)).toBeGreaterThan(
			await viewport.evaluate((node) => node.clientHeight)
		);
		const measure = () =>
			viewport.evaluate((node) => {
				const content = node.querySelector("[data-scroll-area-content]")!;
				return {
					viewport: node.clientWidth,
					content: content.getBoundingClientRect().width,
					gutter: node.offsetWidth - node.clientWidth,
				};
			});
		await page.mouse.move(1, 1);
		await expect(bar).toBeHidden();
		const before = await measure();
		await viewport.hover();
		await expect(bar).toBeVisible();
		await expect(bar).toHaveCSS("position", "absolute");
		expect(await measure()).toEqual({ ...before, gutter: 0 });

		await page.mouse.wheel(0, 96);
		await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
		await page.mouse.move(1, 1);
		await expect(bar).toBeHidden();
		expect(await measure()).toEqual(before);

		await viewport.press("Home");
		await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBe(0);
		await viewport.press("End");
		await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
		await expect(viewport).toBeFocused();
	});
}
