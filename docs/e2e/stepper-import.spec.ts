import { expect, test } from "@playwright/test";

for (const colors of ["light", "dark"] as const) {
	for (const width of [320, 1280]) {
		test(`Stepper import shows the read-only rail and keyboard recovery in ${colors} at ${width}px`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 880 });
			await page.emulateMedia({ colorScheme: colors, reducedMotion: "reduce" });
			await page.goto("/docs/components/stepper", { waitUntil: "networkidle" });

			const wizard = page.getByRole("group", { name: "Import wizard", exact: true });
			const viewport = wizard.getByRole("region", { name: "Import wizard", exact: true });
			const rail = viewport.locator('[data-slot="stepper-rail"]');
			const stages = rail.getByRole("listitem");
			const current = rail.locator('[aria-current="step"]');
			const activePanel = wizard.locator('[data-slot="stepper-content"]:visible');
			const back = wizard.getByRole("button", { name: "Back", exact: true });
			const next = wizard.getByRole("button", { name: "Next", exact: true });
			const source = wizard.getByRole("textbox", { name: "Source workspace", exact: true });

			await expect(wizard).toHaveCSS("border-radius", "10px");
			await expect(wizard).toHaveCSS(
				"background-color",
				colors === "dark" ? "lch(9.232 0.85 272)" : "rgb(255, 255, 255)"
			);
			await expect(stages).toHaveText([
				"Configure",
				"Export",
				"Select issues",
				"Map users",
				"Confirm"
			]);
			await expect(rail.locator("button,a,[tabindex]")).toHaveCount(0);
			const caption = current.locator('[data-slot="stepper-stage-label"]');
			const marker = current.locator('[data-slot="stepper-marker"]');
			await expect(caption).toHaveCSS("font-size", "11px");
			await expect(caption).toHaveCSS(
				"color",
				colors === "dark" ? "lch(90.826 1.425 272)" : "lch(20 1 282)"
			);
			await expect(marker).toHaveCSS("width", "12px");
			await expect(marker).toHaveCSS("height", "12px");
			await expect(current.locator('[data-slot="stepper-connector"]')).toHaveCSS("height", "2px");
			await expect(rail).toHaveCSS("height", "84px");
			const labelBox = (await caption.boundingBox())!;
			const markerBox = (await marker.boundingBox())!;
			expect(markerBox.y - labelBox.y - labelBox.height).toBeCloseTo(10, 1);
			await expect(next).toBeDisabled();
			await expect(back).toBeDisabled();
			await expect(next).toHaveCSS("height", "28px");

			if (width === 320) {
				const scrollbar = viewport
					.locator("..")
					.locator('[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]');
				const height = await viewport.evaluate((node) => node.clientHeight);
				await expect(viewport).toHaveCSS("scrollbar-width", "none");
				await expect
					.poll(() => viewport.evaluate((node) => node.scrollWidth - node.clientWidth))
					.toBeGreaterThan(0);
				await viewport.hover();
				await expect(scrollbar).toHaveCSS("position", "absolute");
				await expect(viewport).toHaveJSProperty("clientHeight", height);
				await viewport.press("ArrowRight");
				await expect.poll(() => viewport.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
			}

			await source.fill("invalid fixture");
			await source.press("Tab");
			await expect(next).toBeFocused();
			await page.keyboard.press("Enter");
			await expect(current).toHaveText("Export");
			await expect(stages.first()).toHaveAttribute("data-state", "completed");
			await expect(stages.first().locator('[data-slot="stepper-marker"]')).toHaveCSS(
				"background-color",
				colors === "dark" ? "lch(47.918 59.303 288.421)" : "lch(53 52.26 286.91)"
			);
			await expect(activePanel).toBeFocused();
			await expect(activePanel.getByRole("alert")).toContainText(
				"Could not verify the import source"
			);
			await expect(next).toBeDisabled();
			await page.keyboard.press("Tab");
			await expect(back).toBeFocused();
			await page.keyboard.press("Space");
			await expect(activePanel).toBeFocused();
			await expect(current).toHaveText("Configure");
			await expect(source).toHaveValue("invalid fixture");

			await source.fill("demo");
			for (const name of ["Export", "Select issues", "Map users", "Confirm"]) {
				await next.press("Enter");
				await expect(current).toHaveText(name);
				await expect(activePanel).toBeFocused();
			}
			await expect(next).toBeDisabled();
			const visibleArea = (await viewport.boundingBox())!;
			const activeStage = (await current.boundingBox())!;
			expect(activeStage.x).toBeGreaterThanOrEqual(visibleArea.x - 1);
			expect(activeStage.x + activeStage.width).toBeLessThanOrEqual(
				visibleArea.x + visibleArea.width + 1
			);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		});
	}
}
