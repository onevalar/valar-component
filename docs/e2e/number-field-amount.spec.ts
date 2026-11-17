import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`whole-dollar field stays grouped and fits at ${width}px in ${colorScheme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 720 });
			await page.emulateMedia({ colorScheme });
			await page.goto("/docs/components/number-field", { waitUntil: "networkidle" });

			const example = page.getByRole("form", { name: "Workspace spend limit example" });
			const field = example.locator('[data-slot="number-field"][data-appearance="amount"]');
			const prefix = field.locator('[data-slot="number-field-currency"]');
			const input = example.getByRole("textbox", { name: "Workspace limit (USD)" });
			const reset = example.getByRole("button", { name: "Reset" });
			const preview = example.getByRole("button", { name: "Preview amount" });
			const label = example.locator("label");
			const quiet = colorScheme === "light" ? "lch(91.9 0 282)" : "lch(25.905 2.38 272)";
			const focus = colorScheme === "light" ? "lch(53 52.26 286.91)" : "lch(47.918 59.303 288.421)";
			const paintedInset = () =>
				field.evaluate((element) => getComputedStyle(element).boxShadow.split(", lch").at(-1)?.replace(/^\(/, "lch("));

			await expect(input).toHaveAttribute("inputmode", "numeric");
			await expect(input).toHaveAttribute("placeholder", "1,000");
			await expect(prefix).toHaveAttribute("aria-hidden", "true");
			await expect(prefix).toHaveText("$");
			await expect(field.getByRole("button")).toHaveCount(0);
			await expect(input).toHaveValue("");
			await expect(field).toHaveCSS("height", "28px");
			await expect(field).toHaveCSS("width", width === 320 ? "94px" : "96px");
			await expect(field).toHaveCSS("border-radius", "8px");
			await expect.poll(paintedInset).toBe(`${quiet} 0px 0px 0px 0.5px inset`);
			await expect(field).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
			await expect(field).toHaveCSS("padding-inline-start", "10px");
			await expect(field).toHaveCSS("column-gap", "4px");
			await expect(prefix).toHaveCSS("font-size", "12px");
			await expect(prefix).toHaveCSS("font-weight", "450");
			await expect(prefix).toHaveCSS("color", colorScheme === "light" ? "lch(40 1 282)" : "lch(64.805 1.65 272)");
			await expect(input).toHaveCSS("font-size", "12px");
			await expect(input).toHaveCSS("padding-inline-end", "12px");
			await expect(input).toHaveCSS("padding-block-start", "6px");
			await expect(input).toHaveCSS("font-weight", "450");
			await expect(input).toHaveCSS("color", colorScheme === "light" ? "lch(20 1 282)" : "lch(91.201 1.65 272)");
			const labelBox = (await label.boundingBox())!;
			const fieldBox = (await field.boundingBox())!;
			const prefixBox = (await prefix.boundingBox())!;
			const inputBox = (await input.boundingBox())!;
			expect(fieldBox.x - labelBox.x - labelBox.width).toBeGreaterThanOrEqual(12);
			expect(prefixBox.x - fieldBox.x).toBe(10);
			expect(inputBox.x - prefixBox.x - prefixBox.width).toBe(4);
			expect(inputBox.x + inputBox.width).toBeLessThan(fieldBox.x + fieldBox.width);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);

			await label.click();
			await expect(input).toBeFocused();
			await expect.poll(paintedInset).toBe(`${focus} 0px 0px 0px 1px inset`);
			await expect(input).toHaveCSS("outline-style", "none");
			await input.pressSequentially("1234");
			await expect(input).toHaveValue("1,234");
			await input.pressSequentially("-.a");
			await input.press("ArrowUp");
			await input.press("ArrowDown");
			await expect(input).toHaveValue("1,234");
			await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(2, 2));
			await input.press("Backspace");
			await expect(input).toHaveValue("1,234");
			await input.press("Backspace");
			await expect(input).toHaveValue("234");
			await input.press("Home");
			await input.press("1");
			await expect(input).toHaveValue("1,234");

			await input.press("Tab");
			await expect(reset).toBeFocused();
			await expect.poll(paintedInset).toBe(`${quiet} 0px 0px 0px 0.5px inset`);
			await expect(input).toHaveValue("1,234");
			await reset.press("Tab");
			await expect(preview).toBeFocused();
			await preview.press("Enter");
			await expect(example.getByRole("status")).toHaveText("Previewed amount: 1234 USD");
			await reset.click();
			await expect(input).toHaveValue("");
			await expect(example.getByRole("status")).toHaveText("No previewed amount");
			await input.fill("0");
			await expect(input).toHaveValue("0");
			await preview.click();
			await expect(example.getByRole("status")).toHaveText("Previewed amount: 0 USD");
		});
	}
}
