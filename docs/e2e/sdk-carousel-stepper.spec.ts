import { expect, test } from "@playwright/test";

test("Carousel pages with UI SDK and still delivers the real Embla API when requested", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.setViewportSize({ width: 390, height: 800 });
	await page.goto("/docs/components/carousel");
	const carousel = page.getByRole("region", { name: "Numbered slides" });
	const viewport = carousel.locator('[data-slot="carousel-content"]');
	const slides = carousel.locator('[data-slot="carousel-item"]');
	const previous = carousel.getByRole("button", { name: "上一张" });
	const next = carousel.getByRole("button", { name: "下一张" });
	await expect(previous).toHaveAttribute("aria-disabled", "true");
	await expect(slides.nth(1)).toHaveAttribute("aria-hidden", "true");
	await next.press("Enter");
	await expect(slides.nth(1)).toHaveAttribute("data-active", "");
	await expect(slides.nth(1)).not.toHaveAttribute("aria-hidden", "true");
	await expect(slides.nth(1).locator('[data-slot="card"]')).toBeInViewport({ ratio: 0.99 });
	await expect(previous).toBeInViewport({ ratio: 1 });
	await expect(next).toBeInViewport({ ratio: 1 });
	await viewport.press("End");
	await expect(next).toHaveAttribute("aria-disabled", "true");
	await viewport.press("Home");
	await expect(slides.first()).toHaveAttribute("data-active", "");

	const legacy = page.getByRole("region", { name: "Embla API example" });
	await expect(page.getByText("Slide 1 of 5", { exact: true })).toBeVisible();
	await legacy.getByRole("button", { name: "下一张" }).click();
	await expect(page.getByText("Slide 2 of 5", { exact: true })).toBeVisible();
});

test("Stepper keeps its current focus during a legacy IME key event", async ({ page }) => {
	await page.goto("/docs/components/stepper");
	const flow = page.getByRole("group", { name: "基础流程", exact: true });
	const current = flow.locator('[aria-current="step"]');
	const next = flow.getByRole("button", { name: /核对内容/ });
	await current.focus();
	await current.dispatchEvent("keydown", { key: "ArrowRight", keyCode: 229, isComposing: false, bubbles: true });
	await expect(current).toBeFocused();
	await current.press("ArrowRight");
	await expect(next).toBeFocused();
	await expect(current).toContainText("填写信息");
});
