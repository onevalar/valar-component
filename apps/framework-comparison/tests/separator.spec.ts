import { expect, test } from "@playwright/test";

for (const [framework, url] of [
	["react", process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/"],
	["vue", process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/"],
]) {
	for (const theme of ["light", "dark"]) {
		test(`${framework} ${theme}: separator direction, decorative semantics and theme`, async ({
			page,
		}) => {
			await page.setViewportSize({ width: theme === "dark" ? 320 : 900, height: 540 });
			await page.goto(`${url}?example=separator&theme=${theme}`);
			const demo = page.getByRole("region", { name: "Separator examples" });
			const semantic = demo.getByRole("separator");
			const horizontal = semantic.first();
			const vertical = semantic.last();
			await expect(semantic).toHaveCount(2);
			await expect(horizontal).toHaveCSS("height", "0.5px");
			await expect(horizontal).toHaveCSS(
				"background-color",
				theme === "light" ? "lch(0 0 0 / 0.088)" : "lch(100 0 0 / 0.083)"
			);
			await expect(vertical).toHaveAttribute("aria-orientation", "vertical");
			await expect(vertical).toHaveCSS("width", "0.5px");
			const rowHeight = await demo
				.getByText("Members", { exact: true })
				.evaluate((el) => el.getBoundingClientRect().height);
			await expect(vertical).toHaveCSS("height", `${rowHeight}px`);
			const lines = demo.locator('[data-slot="separator"]');
			await expect(lines).toHaveCount(4);
			await expect(lines.nth(2)).toHaveCSS("width", "0.5px");
			await expect(lines.last()).toHaveCSS("height", "0.5px");
			await expect(lines.last()).not.toHaveCSS(
				"background-color",
				await horizontal.evaluate((el) => getComputedStyle(el).backgroundColor)
			);
		});
	}
}
