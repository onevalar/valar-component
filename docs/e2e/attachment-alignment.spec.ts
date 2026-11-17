import { expect, test } from "@playwright/test";

for (const { colorScheme, width } of [
	{ colorScheme: "light", width: 320 },
	{ colorScheme: "dark", width: 390 },
] as const) {
	test(`Attachment keeps narrow image and file interactions with a floating scrollbar in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 880 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/attachment", { waitUntil: "networkidle" });

		const image = page.getByRole("group", { name: "Draft image", exact: true });
		const uploading = page.locator(
			'[data-slot="attachment"][data-appearance="agent-file"][data-state="uploading"]'
		);
		await expect(uploading).toHaveAttribute("aria-busy", "true");
		await expect(uploading.locator('[data-slot="attachment-title"]')).toHaveCSS(
			"animation-name",
			"none"
		);
		await expect(image.locator('[data-slot="attachment-media"]')).toHaveCSS("border-radius", "6px");
		const imageActions = image.getByRole("group", { name: "Image actions", exact: true });
		await expect(imageActions).toHaveCSS("height", "32px");
		const preview = imageActions.getByRole("button", { name: "Open draft image", exact: true });
		await expect(preview).toHaveCSS("width", "26px");
		await preview.press("Enter");
		const dialog = page.getByRole("dialog", { name: "Draft image preview", exact: true });
		await expect(dialog.getByRole("img", { name: "Component catalog preview" })).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(dialog).toHaveCount(0);
		await expect(preview).toBeFocused();

		const list = page.getByRole("region", { name: "Attachment list", exact: true });
		const outer = list.locator("xpath=ancestor::*[@data-slot='preview'][1]");
		const previewFrames = page.locator(
			'.preview [data-scroll-area-viewport][aria-label="Preview"]'
		);
		const scrollbar = list
			.locator("..")
			.locator('[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]');
		await expect(list).toHaveAttribute("data-scroll-area-viewport", "");
		await expect(list).toHaveCSS("scrollbar-width", "none");
		await expect
			.poll(() => list.evaluate((node) => node.scrollWidth - node.clientWidth))
			.toBeGreaterThan(100);
		expect(await list.evaluate((node) => node.clientWidth)).toBeLessThan(width);
		expect(await outer.evaluate((node) => node.scrollWidth)).toBeLessThanOrEqual(width);
		expect(
			await previewFrames.evaluateAll((nodes) =>
				nodes.every((node) => node.scrollWidth <= node.clientWidth)
			)
		).toBe(true);
		await page.mouse.move(1, 1);
		await expect(scrollbar).toBeHidden();
		const heightBeforeHover = await list.evaluate((node) => node.clientHeight);
		await list.hover();
		await expect(scrollbar).toBeVisible();
		await expect(scrollbar).toHaveCSS("position", "absolute");
		await expect(list).toHaveJSProperty("clientHeight", heightBeforeHover);
		await list.press("ArrowRight");
		await expect.poll(() => list.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			width
		);
	});

	test(`Attachment keeps a neutral size-rejected file and keyboard recovery in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 880 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/attachment", { waitUntil: "networkidle" });
		const choose = page.getByRole("button", { name: "Choose file", exact: true });
		await expect(choose).toBeVisible();
		const filename = "draft-too-large.txt";
		const chooser = page.waitForEvent("filechooser");
		await choose.press("Enter");
		await (
			await chooser
		).setFiles({
			name: filename,
			mimeType: "text/plain",
			buffer: Buffer.alloc(11 * 1024 * 1024),
		});

		const row = page.locator('[data-slot="attachment"][data-appearance="agent-file"]').filter({
			hasText: filename,
		});
		const alert = page.getByRole("alert").filter({ hasText: "File exceeds size limit" });
		await expect(alert).toContainText("Choose a file of 10 MB or less.");
		await expect(row).toContainText("11 MB");
		await expect(row).toHaveCSS("border-radius", "6px");
		await expect(row).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(12.945 1.3 272)" : "rgb(255, 255, 255)"
		);
		await expect(row).toHaveCSS(
			"border-top-color",
			colorScheme === "dark" ? "lch(20.505 2.38 272)" : "lch(91.9 0 282)"
		);
		await expect(row.getByRole("link")).toHaveCount(0);
		await alert
			.getByRole("button", { name: "Dismiss size limit message", exact: true })
			.press("Enter");
		await expect(alert).toHaveCount(0);
		await expect(row).toBeVisible();
		await expect(choose).toBeFocused();
		await row.getByRole("button", { name: `Remove ${filename}`, exact: true }).press("Enter");
		await expect(row).toHaveCount(0);
		await expect(choose).toBeFocused();
		const replacement = page.waitForEvent("filechooser");
		await choose.press("Enter");
		await (
			await replacement
		).setFiles({
			name: "draft-replacement.txt",
			mimeType: "text/plain",
			buffer: Buffer.from("A small local test file."),
		});
		await expect(page.getByRole("status").filter({ hasText: "File ready" })).toBeVisible();
		await expect(alert).toHaveCount(0);
	});
}
