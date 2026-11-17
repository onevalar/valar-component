import { expect, test, type Locator } from "@playwright/test";

async function expectFloatingScroll(viewport: Locator) {
	await expect(viewport).toHaveCSS("scrollbar-width", "none");
	const before = await viewport.evaluate((node) => ({
		width: node.clientWidth,
		scrollHeight: node.scrollHeight,
		height: node.clientHeight,
	}));
	expect(before.scrollHeight).toBeGreaterThan(before.height);
	await viewport.press("ArrowDown");
	await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
	await viewport.hover();
	const root = viewport.locator("xpath=ancestor::*[@data-slot='scroll-area'][1]");
	const bar = root.locator("[data-slot='scroll-area-scrollbar'][data-orientation='vertical']");
	await expect(root).toHaveAttribute("data-vaul-no-drag");
	await expect(bar).toBeVisible();
	await expect(bar).toHaveCSS("position", "absolute");
	expect(await viewport.evaluate((node) => node.clientWidth)).toBe(before.width);
	await viewport.evaluate((node) => (node.scrollTop = 0));
	const thumb = (await bar.locator("[data-slot='scroll-area-thumb']").boundingBox())!;
	const mouse = viewport.page().mouse;
	await mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
	await mouse.down();
	await mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2 + 20, { steps: 5 });
	await mouse.up();
	await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
}

for (const colorScheme of ["light", "dark"] as const) {
	test(`Drawer workspace respects narrow navigation, floating scroll and keyboard in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.emulateMedia({ colorScheme });
		await page.goto("/docs/components/drawer", { waitUntil: "networkidle" });
		const trigger = page.getByRole("button", { name: "Open workspace menu", exact: true });
		await trigger.press("Enter");
		const panel = page.getByRole("dialog", { name: "Workspace navigation", exact: true });
		const close = panel.getByRole("button", { name: "Close workspace menu", exact: true });
		await expect(panel).toHaveAttribute("data-vaul-drawer-direction", "left");
		await expect(panel).toHaveAttribute("data-appearance", "workspace");
		await expect(panel).toHaveCSS("transform", "none");
		await expect(panel).toHaveCSS("width", "330px");
		await expect(panel).toHaveCSS("height", "844px");
		expect((await panel.boundingBox())!.x).toBe(0);
		await expect(panel).toHaveCSS("border-top-left-radius", "0px");
		await expect(panel).toHaveCSS("border-top-right-radius", "12px");
		await expect(panel).toHaveCSS("border-bottom-right-radius", "12px");
		await expect(panel).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(5.52 0.4 272)" : "lch(97.94 0.5 282)"
		);
		const overlay = page.locator("[data-slot='drawer-overlay']");
		await expect(overlay).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await expect(overlay).toHaveCSS("backdrop-filter", "none");
		await expect(panel.locator("[data-slot='drawer-header']")).toHaveCSS("padding-left", "12px");
		await expect(close).toBeFocused();

		await page.setViewportSize({ width: 320, height: 490 });
		await expect(panel).toHaveCSS("width", "296px");
		await expect(panel).toHaveCSS("height", "490px");
		const viewport = panel.getByRole("region", { name: "Scroll workspace menu" });
		await page.keyboard.press("Tab");
		await expect(viewport).toBeFocused();
		await expectFloatingScroll(viewport);
		await page.keyboard.press("Escape");
		await expect(panel).toHaveCount(0);
		await expect(trigger).toBeFocused();

		await trigger.press("Space");
		await close.press("Enter");
		await expect(panel).toHaveCount(0);
		await expect(trigger).toBeFocused();

		await trigger.press("Enter");
		await expect(panel).toHaveCSS("transform", "none");
		await page.mouse.click(310, 245);
		await expect(panel).toHaveCount(0);

		await trigger.press("Enter");
		await panel.getByRole("button", { name: "Settings", exact: true }).press("Enter");
		await expect(panel).toHaveCount(0);
		await expect(page.getByRole("status").filter({ hasText: "Current view · Settings" })).toBeVisible();
		await expect(trigger).toBeFocused();
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});
}

test("Drawer long content keeps the footer fixed and scrolls with an overlay", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 490 });
	await page.goto("/docs/components/drawer", { waitUntil: "networkidle" });
	const trigger = page.getByRole("button", { name: "Scrollable Content", exact: true });
	await trigger.press("Enter");
	const panel = page.getByRole("dialog", { name: "Move Goal", exact: true });
	await expect(panel).toHaveCSS("transform", "none");
	await expect(panel).toHaveAttribute("data-vaul-drawer-direction", "right");
	const viewport = panel.getByRole("region", { name: "Scroll long drawer content" });
	const footer = panel.locator("[data-slot='drawer-footer']");
	const initialFooter = await footer.boundingBox();
	await expectFloatingScroll(viewport);
	expect(await footer.boundingBox()).toEqual(initialFooter);
	await page.keyboard.press("Escape");
	await expect(panel).toHaveCount(0);
	await expect(trigger).toBeFocused();
});
