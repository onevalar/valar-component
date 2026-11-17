import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Skeleton keeps the avatar and text inside a 320px preview in ${colorScheme}`, async ({
		page
	}) => {
		await page.setViewportSize({ width: 320, height: 800 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/skeleton");

		const sample = page.locator(".sample").filter({ has: page.locator('[data-slot="skeleton"]') });
		const viewport = sample.locator('[data-slot="scroll-area-viewport"]');
		const shapes = viewport.locator('[data-slot="skeleton"]');
		await expect(shapes).toHaveCount(3);
		await expect(shapes.first()).toHaveCSS(
			"background-color",
			colorScheme === "light" ? "oklch(0.97 0 0)" : "oklch(0.269 0 0)"
		);
		await expect(shapes.first()).toHaveCSS("animation-name", "none");
		const layout = await viewport.evaluate((node) => {
			const [avatar, firstLine, secondLine] = [
				...node.querySelectorAll('[data-slot="skeleton"]')
			].map((shape) => shape.getBoundingClientRect());
			const { right } = node.getBoundingClientRect();
			return {
				avatarWidth: avatar.width,
				avatarHeight: avatar.height,
				gap: firstLine.left - avatar.right,
				lineRatio: secondLine.width / firstLine.width,
				rightInset: right - firstLine.right,
				overflow: node.scrollWidth - node.clientWidth
			};
		});
		expect(layout.avatarWidth).toBe(48);
		expect(layout.avatarHeight).toBe(48);
		expect(layout.gap).toBe(16);
		expect(layout.lineRatio).toBeCloseTo(0.8, 2);
		expect(layout.rightInset).toBeGreaterThanOrEqual(8);
		expect(layout.overflow).toBe(0);
		await expect(shapes.first()).toHaveCSS("max-width", "100%");
		await expect(viewport.locator('[aria-busy="true"]')).toHaveCount(1);
	});
}
