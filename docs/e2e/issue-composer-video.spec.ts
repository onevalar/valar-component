import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Issue Composer video has keyboard media controls in ${colorScheme}`, async ({ page }) => {
		const width = colorScheme === "light" ? 1280 : 320;
		await page.setViewportSize({ width, height: 820 });
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await page.goto("/docs/components/issue-composer", {
			waitUntil: "networkidle"
		});
		await page
			.locator(".preview")
			.getByRole("button", { name: "New issue", exact: true })
			.press("Enter");
		const composer = page.getByRole("dialog", {
			name: "New issue",
			exact: true
		});
		const description = composer.getByRole("textbox", {
			name: "Description",
			exact: true
		});
		await description.locator(":scope > p").last().click();
		await page.keyboard.press("/");
		const search = page.getByRole("dialog", { name: "Insert block" }).getByRole("combobox");
		await search.fill("Media");
		const chooser = page.waitForEvent("filechooser");
		await search.press("Enter");
		await (await chooser).setFiles(resolve(import.meta.dirname, "fixtures/issue-video.webm"));

		const player = composer.getByRole("region", {
			name: "Media player",
			exact: true
		});
		const video = player.locator("video");
		const play = player.getByRole("button", {
			name: "Play (keyboard shortcut k)",
			exact: true
		});
		await expect(play).toBeEnabled();
		await expect(play).toHaveCSS("height", "28px");
		await expect(player).toHaveCSS("border-radius", "6px");
		await expect(player.locator('[data-slot="issue-video-controls"]')).toBeVisible();
		expect(await video.evaluate((element) => element.controls)).toBe(false);
		const pause = player.getByRole("button", {
			name: "Pause (keyboard shortcut k)",
			exact: true
		});
		await play.press("Enter");
		await expect(pause).toBeVisible();
		await expect.poll(() => video.evaluate((element) => element.currentTime)).toBeGreaterThan(0);
		await pause.press("k");
		await expect(play).toBeFocused();
		await expect.poll(() => video.evaluate((element) => element.paused)).toBe(true);

		const seek = player.getByRole("slider", {
			name: "Seek slider",
			exact: true
		});
		await seek.press("Home");
		await expect.poll(() => video.evaluate((element) => element.currentTime)).toBe(0);
		await seek.press("Shift+ArrowRight");
		await expect.poll(() => video.evaluate((element) => element.currentTime)).toBeCloseTo(4);
		const mute = player.getByRole("button", {
			name: "Mute (keyboard shortcut m)",
			exact: true
		});
		await mute.press("Space");
		await expect(
			player.getByRole("button", { name: "Unmute (keyboard shortcut m)" })
		).toBeFocused();
		await expect.poll(() => video.evaluate((element) => element.muted)).toBe(true);
		await expect(player.getByRole("slider", { name: "Volume", exact: true })).toBeVisible();
		await player.getByRole("combobox", { name: "Change playback rate" }).selectOption("1.5");
		await expect.poll(() => video.evaluate((element) => element.playbackRate)).toBe(1.5);
		await expect(player.getByRole("link", { name: "Download", exact: true })).toHaveAttribute(
			"download",
			"issue-video.webm"
		);

		const fullScreen = player.getByRole("button", {
			name: "Full window",
			exact: true
		});
		await fullScreen.press("Enter");
		const full = page.getByRole("dialog", {
			name: "issue-video.webm",
			exact: true
		});
		const fullPlayer = full.getByRole("region", { name: "Media player", exact: true });
		await expect(fullPlayer).toBeVisible();
		const fullVideo = fullPlayer.locator("video");
		await expect.poll(() => fullVideo.evaluate((element) => element.currentTime)).toBeCloseTo(4);
		await expect.poll(() => fullVideo.evaluate((element) => element.playbackRate)).toBe(1.5);
		await expect.poll(() => fullVideo.evaluate((element) => element.muted)).toBe(true);
		await fullPlayer.getByRole("slider", { name: "Seek slider", exact: true }).press("Home");
		await expect.poll(() => fullVideo.evaluate((element) => element.currentTime)).toBe(0);
		await page.keyboard.press("Escape");
		await expect(full).toBeHidden();
		await expect(fullScreen).toBeFocused();
		await expect.poll(() => video.evaluate((element) => element.currentTime)).toBe(0);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
	});
}
