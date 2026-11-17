import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`import history keeps table density, filtering, and keyboard actions in ${colorScheme} at ${width}px`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 850 });
			await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
			await page.goto("/docs/components/data-table", { waitUntil: "networkidle" });

			const table = page.getByRole("table", { name: "Workspace imports" });
			const search = page.getByRole("searchbox", { name: "Filter imports", exact: true });
			const toolbarInput = search.locator('xpath=ancestor::*[@data-slot="input-group"]');
			const created = table.getByRole("button", { name: "Order by Created", exact: true });
			const createdHeader = table.getByRole("columnheader", {
				name: "Order by Created",
				exact: true
			});
			const rows = table.locator("tbody tr");

			await expect(toolbarInput).toHaveCSS("height", "28px");
			expect(await toolbarInput.evaluate((node) => parseFloat(getComputedStyle(node).borderRadius))).toBeGreaterThanOrEqual(14);
			await expect(toolbarInput).toHaveCSS(
				"background-color",
				colorScheme === "light" ? "lch(97.94 0.5 282)" : "lch(5.52 0.4 272)"
			);
			await expect(createdHeader).toHaveCSS("height", "32px");
			await expect(rows.first()).toHaveCSS("height", "44px");
			await expect(created).toHaveCSS("height", "24px");
			await expect(createdHeader).toHaveAttribute("aria-sort", "descending");
			await expect(rows.first().getByRole("cell").first()).toHaveText("Asana");
			await created.press("Enter");
			await expect(createdHeader).toHaveAttribute("aria-sort", "ascending");
			await expect(rows.first().getByRole("cell").first()).toHaveText("CSV");
			await expect(created).toBeFocused();
			await expect(created).toHaveCSS("outline-offset", "-1px");
			await expect(created).toHaveCSS(
				"color",
				colorScheme === "light" ? "lch(19.588 1.25 282)" : "lch(90.451 1.2 272)"
			);

			const viewport = page.getByRole("region", { name: "Import columns", exact: true });
			await expect(viewport).toHaveAttribute("data-slot", "scroll-area-viewport");
			await expect(viewport).toHaveCSS("scrollbar-width", "none");
			if (width === 320) {
				const track = viewport.locator(
					'xpath=following-sibling::*[@data-slot="scroll-area-scrollbar"]'
				);
				await expect(track).toBeVisible();
				await expect(track).toHaveCSS("position", "absolute");
				await viewport.evaluate((node) => {
					node.scrollLeft = 0;
				});
				const innerHeight = await viewport.evaluate((node) => node.clientHeight);
				await viewport.press("ArrowRight");
				await expect.poll(() => viewport.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
				expect(await viewport.evaluate((node) => node.clientHeight)).toBe(innerHeight);
			}

			const actions = table.getByRole("button", { name: "Open Asana import menu", exact: true });
			await expect(actions).toHaveCSS("width", "32px");
			await expect(actions).toHaveCSS("height", "32px");
			await actions.press("Enter");
			const menu = page.getByRole("dialog", { name: "Import actions", exact: true });
			const menuSearch = menu.getByRole("combobox", { name: "Filter actions", exact: true });
			await expect(menuSearch).toBeFocused();
			await expect(menu.getByRole("option", { name: "Troubleshoot import" })).toBeVisible();
			await expect(menu.getByRole("option", { name: "Delete import" })).toBeVisible();
			await menuSearch.press("Escape");
			await expect(menu).toBeHidden();
			await expect(actions).toBeFocused();
			await actions.press("Enter");
			await menuSearch.fill("Troubleshoot");
			await expect(menu.getByRole("option", { name: "Delete import" })).toBeHidden();
			await menuSearch.press("Enter");
			await expect(menu).toBeHidden();
			await expect(actions).toBeFocused();
			await expect(page.getByText("Asana import failed. Review the source settings.")).toBeVisible();

			await search.fill("no such import");
			await expect(page.getByText("No matching imports", { exact: true })).toBeVisible();
			await expect(table).toBeHidden();
			await search.press("Escape");
			await expect(search).toHaveValue("");
			await expect(search).toBeFocused();
			await expect(rows).toHaveCount(3);

			const filter = page.getByRole("button", { name: "Filter by import status" });
			await filter.press("Enter");
			await page.getByRole("menuitemradio", { name: "Error", exact: true }).press("Enter");
			await page.keyboard.press("Escape");
			await expect(filter).toBeFocused();
			await expect(rows).toHaveCount(1);
			await expect(rows.first().getByRole("cell").first()).toHaveText("Asana");
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		});
	}
}
