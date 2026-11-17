import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Agent message, tool summary and sent file at 390 px in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/bubble");
		const user = page.getByRole("group", { name: "User message", exact: true });
		const content = user.locator('[data-slot="bubble-content"]');
		await expect(user).toHaveCSS("max-width", "75%");
		await expect(content).toHaveCSS("padding", "8px 12px");
		await expect(content).toHaveCSS("border-radius", "8px");
		await expect(content).toHaveCSS("font-size", "15px");
		await expect(content).toHaveCSS("line-height", "24px");
		await expect(content).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(13.861 1.043 272)" : "lch(96.5 0 282)"
		);
		await expect(
			page
				.getByRole("group", { name: "Assistant message", exact: true })
				.locator('[data-slot="bubble-content"]')
		).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		const edit = user.getByRole("button", { name: "Edit message" });
		await edit.focus();
		await expect(user.locator('[data-slot="bubble-actions"]')).toHaveCSS("opacity", "1");
		await expect(edit).toHaveCSS("height", "24px");
		await edit.press("Enter");
		const draft = user.getByRole("textbox", { name: "Message text" });
		await expect(draft).toBeFocused();
		await draft.fill("Test draft");
		await draft.press("Escape");
		await expect(edit).toBeFocused();
		await expect(content).toHaveText("Which components are still in review?");
		const replyLink = page.getByRole("link", { name: "component catalog", exact: true });
		await expect(replyLink).toHaveAttribute("href", "/docs/components");
		await expect(replyLink).toHaveCSS(
			"color",
			`lch(${colorScheme === "dark" ? "80" : "50"} 80 288.43)`
		);
		await expect(replyLink).toHaveCSS("text-decoration-line", "none");
		await expect(replyLink).toHaveCSS("line-height", "24px");
		await replyLink.focus();
		await expect(replyLink).toHaveCSS("text-decoration-line", "underline");
		await expect(replyLink).toHaveCSS("outline-style", "none");
		await expect(replyLink).toHaveCSS("box-shadow", "none");
		await replyLink.press("Enter");
		await expect(page).toHaveURL(/\/docs\/components\/?$/);

		await page.goto("/docs/components/trace");
		const summary = page.getByRole("button", { name: "Worked for 3 seconds", exact: true });
		await expect(summary).toHaveCSS("height", "16px");
		await expect(summary).toHaveCSS("padding-inline-start", "8px");
		await expect(summary).toHaveCSS("gap", "3px");
		await expect(summary).toHaveCSS("border-radius", "4px");
		await expect(summary).toHaveCSS(
			"color",
			colorScheme === "dark" ? "lch(90.826 1.425 272)" : "lch(40 1 282)"
		);
		await summary.focus();
		await summary.press("Enter");
		await expect(summary).toHaveAttribute("aria-expanded", "true");
		const step = page.getByText("Searched issues", { exact: true });
		await expect(step).toBeVisible();
		await expect(step).toHaveCSS("font-size", "13px");
		await summary.press("Space");
		await expect(summary).toHaveAttribute("aria-expanded", "false");
		await expect(step).toBeHidden();
		await expect(summary).toBeFocused();

		await page.setViewportSize({ width: 320, height: 844 });
		const simulate = page.getByRole("button", { name: "Simulate tool run", exact: true });
		await simulate.press("Space");
		await expect(simulate).toHaveAttribute("aria-pressed", "true");
		await expect(summary).toHaveCount(0);
		const running = page.locator('[data-slot="trace-line"][data-status="running"]').filter({
			hasText: "Component acceptance notes",
		});
		const runningTitle = running.getByText("Searching…", { exact: true });
		await expect(running).toHaveCSS("font-size", "13px");
		await expect(running).toHaveCSS("gap", "6px");
		await expect(runningTitle).toHaveCSS("animation-name", "none");
		await page.emulateMedia({ colorScheme, reducedMotion: "no-preference" });
		await expect(runningTitle).toHaveCSS("animation-name", "tw-shimmer");
		expect(await running.evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(
			await running.evaluate((element) => element.clientWidth)
		);
		await simulate.press("Enter");
		await expect(simulate).toBeFocused();
		await expect(running).toHaveCount(0);
		await expect(summary).toHaveAttribute("aria-expanded", "false");
		await page.setViewportSize({ width: 390, height: 844 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });

		await page.goto("/docs/components/attachment");
		const file = page.locator(
			'[data-slot="attachment"][data-appearance="agent-file"][data-state="done"]'
		);
		await expect(file).toHaveCSS("min-height", "51px");
		await expect(file).toHaveCSS("border-radius", "6px");
		await expect(file).toHaveCSS("padding", "6px");
		await expect(file).toHaveCSS("gap", "6px");
		await expect(file).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(12.945 1.3 272)" : "rgb(255, 255, 255)"
		);
		if (colorScheme === "dark")
			await expect(file).toHaveCSS("border-top-color", "lch(20.505 2.38 272)");
		const download = file.getByRole("link", { name: "Download example file" });
		await download.focus();
		await expect(download).toBeFocused();
		const [downloaded] = await Promise.all([
			page.waitForEvent("download"),
			download.press("Enter"),
		]);
		expect(downloaded.suggestedFilename()).toBe("component-review-notes.txt");
		const draftImage = page.getByRole("group", { name: "Draft image" });
		await expect(draftImage.getByRole("img")).toHaveCSS("width", "120px");
		await expect
			.poll(() =>
				draftImage.getByRole("img").evaluate((element: HTMLImageElement) => {
					const { width, height } = element.getBoundingClientRect();
					return Math.abs(width / height - element.naturalWidth / element.naturalHeight);
				})
			)
			.toBeLessThan(0.01);
		await draftImage.getByRole("button", { name: "Remove draft image" }).press("Enter");
		await expect(draftImage).toHaveCount(0);
		const restore = page.getByRole("button", { name: "Restore draft image" });
		await expect(restore).toBeFocused();
		await restore.press("Enter");
		await expect(draftImage).toBeVisible();
		await expect(draftImage.getByRole("button", { name: "Remove draft image" })).toBeFocused();
		const uploading = page.locator(
			'[data-slot="attachment"][data-appearance="agent-file"][data-state="uploading"]'
		);
		await expect(uploading).toHaveAttribute("aria-busy", "true");
		await expect(uploading).toContainText("Uploading…");
	});
}
