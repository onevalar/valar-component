import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Typography keeps measured prose and keyboard navigation at 320px in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 850 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/typography");

		const dark = colorScheme === "dark";
		const article = page.getByRole("article", { name: "Release notes" });
		const paragraph = article.locator(":scope > p").first();
		await expect(paragraph).toHaveCSS("font-size", "15px");
		await expect(paragraph).toHaveCSS("line-height", "22.5px");
		await expect(paragraph).toHaveCSS("font-weight", "450");
		await expect(paragraph).toHaveCSS("letter-spacing", "-0.1px");
		await expect(paragraph).toHaveCSS(
			"color",
			dark ? "lch(90.826 1.425 272)" : "lch(20 1 282)",
		);
		for (const [name, level, size, lineHeight, spacing, top, bottom] of [
			["Release notes", 1, "22px", "29.6px", "-0.07px", "0px", "16px"],
			["Verify the update", 2, "19px", "28px", "0.05px", "32px", "16px"],
			["Confirm keyboard access", 3, "17px", "24px", "0.1px", "24px", "6px"],
			["Check long content", 4, "15px", "24px", "normal", "22px", "6px"],
		] as const) {
			const heading = article.getByRole("heading", { name, level });
			await expect(heading).toHaveCSS("font-size", size);
			await expect(heading).toHaveCSS("line-height", lineHeight);
			await expect(heading).toHaveCSS("font-weight", "600");
			await expect(heading).toHaveCSS("letter-spacing", spacing);
			await expect(heading).toHaveCSS("margin-top", top);
			await expect(heading).toHaveCSS("margin-bottom", bottom);
			await expect(heading).toHaveCSS(
				"color",
				dark ? "lch(100 0 272)" : "lch(10 0 282)",
			);
		}

		const quote = article.locator("blockquote");
		await expect(quote).toHaveCSS("padding-inline-start", "16px");
		await expect(quote).toHaveCSS("margin-top", "22px");
		expect(
			await quote.evaluate((node) => getComputedStyle(node, "::before").width),
		).toBe("4px");
		expect(
			await quote.evaluate(
				(node) => getComputedStyle(node, "::before").borderRadius,
			),
		).toBe("2px");

		const bullets = article.locator(":scope > ul");
		const nested = bullets.getByRole("list").last();
		await expect(bullets.getByRole("listitem")).toHaveCount(4);
		await expect(bullets).toHaveCSS("padding-inline-start", "24px");
		await expect(bullets).toHaveCSS("margin-top", "22px");
		await expect(bullets).toHaveCSS("list-style-type", "disc");
		await expect(nested).toHaveCSS("list-style-type", "decimal");
		await expect(nested).toHaveCSS("margin-top", "16px");
		await expect(nested.getByRole("listitem").last()).toHaveCSS(
			"margin-top",
			"6px",
		);
		expect(
			await article.evaluate((node) => {
				const heading = node.querySelector("h2")!;
				const quote = node.querySelector("blockquote")!;
				return {
					beforeHeading:
						heading.getBoundingClientRect().top -
						heading.previousElementSibling!.getBoundingClientRect().bottom,
					afterHeading:
						heading.nextElementSibling!.getBoundingClientRect().top -
						heading.getBoundingClientRect().bottom,
					afterQuote:
						quote.nextElementSibling!.getBoundingClientRect().top -
						quote.getBoundingClientRect().bottom,
				};
			}),
		).toEqual({ beforeHeading: 32, afterHeading: 16, afterQuote: 22 });

		const code = article.locator("code").first();
		await expect(code).toHaveCSS("font-size", "14.0625px");
		await expect(code).toHaveCSS("padding-block-start", "0.5px");
		await expect(code).toHaveCSS(
			"background-color",
			dark ? "rgba(255, 255, 255, 0.075)" : "lch(20 50 286.91 / 0.05)",
		);
		expect(
			await article
				.locator("code")
				.last()
				.evaluate((node) => node.getClientRects().length),
		).toBeGreaterThan(1);
		const rule = article.getByRole("separator");
		await expect(rule).toHaveCSS("margin-top", "22px");
		await expect(rule).toHaveCSS("border-top-width", "1px");
		await expect(rule).toHaveCSS(
			"border-top-color",
			dark ? "lch(20.032 1.93 272)" : "lch(86.5 0 282)",
		);

		const review = article.getByRole("link", { name: "review the rollout" });
		await expect(review).toHaveCSS(
			"color",
			dark ? "lch(80 80 288.43)" : "lch(50 80 288.43)",
		);
		await expect(review).toHaveCSS("text-decoration-line", "none");
		await review.focus();
		await review.press("Shift+Tab");
		await page.keyboard.press("Tab");
		await expect(review).toBeFocused();
		await expect(review).toHaveCSS("text-decoration-line", "underline");
		await expect(review).toHaveCSS("outline-style", "none");
		await review.press("Enter");
		await expect(page).toHaveURL(/#release-review$/);
		expect(await article.evaluate((node) => node.scrollWidth)).toBe(
			await article.evaluate((node) => node.clientWidth),
		);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth),
		).toBe(320);
	});

	test(`Typography table keeps its local overlay and semantics in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 850 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/typography");

		const region = page.getByRole("region", {
			name: "Scroll release checks",
			exact: true,
		});
		const table = region.getByRole("table", { name: "Release checks" });
		await expect(table.getByRole("columnheader")).toHaveCount(3);
		await expect(table.getByRole("row")).toHaveCount(4);
		await expect(region).toHaveCSS("scrollbar-width", "none");
		const initial = await region.evaluate((node) => ({
			width: node.clientWidth,
			height: node.clientHeight,
			content: node.scrollWidth,
		}));
		expect(initial.content).toBeGreaterThan(initial.width);
		await region.press("ArrowRight");
		await expect
			.poll(() => region.evaluate((node) => node.scrollLeft))
			.toBeGreaterThan(0);
		const scrollbar = table
			.locator("xpath=ancestor::*[@data-slot='scroll-area'][1]")
			.locator(
				"[data-slot='scroll-area-scrollbar'][data-orientation='horizontal']",
			);
		await expect(scrollbar).toHaveCSS("position", "absolute");
		expect(await region.evaluate((node) => node.clientHeight)).toBe(
			initial.height,
		);
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth),
		).toBe(320);
	});
}
