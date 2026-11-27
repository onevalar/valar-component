import assert from "node:assert/strict";
import test from "node:test";
import { chromium, expect } from "@playwright/test";

test("public preview: asymmetric scalar bounds, calendar/range selection, popper and favicon", async () => {
	const browser = await chromium.launch({
		executablePath:
			process.env.VALAR_TEST_BROWSER ??
			(process.platform === "darwin"
				? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
				: undefined),
		headless: true,
	});
	try {
		const page = await browser.newPage({
			viewport: { width: 390, height: 900 },
			reducedMotion: "reduce",
		});
		const errors: string[] = [];
		const requests: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("request", (request) => requests.push(request.url()));
		await page.goto(process.env.VALAR_REACT_PREVIEW_URL ?? "http://127.0.0.1:5213/");
		await expect(page.locator('[data-framework="react"][data-ready="true"]')).toBeVisible();
		await page.evaluate(() => document.fonts.ready);

		const geometry = await page.evaluate(() => {
			const calendar = document.querySelector('[data-demo="calendar"]')!;
			const range = document.querySelector('[data-demo="range-calendar"]')!;
			const root = range.querySelector('[data-slot="range-calendar"]')!;
			const grid = root.querySelector("table")!;
			return {
				extraHeight: range.getBoundingClientRect().height - calendar.getBoundingClientRect().height,
				padding: getComputedStyle(root).padding,
				gridMargin: getComputedStyle(grid).marginTop,
				gridGap: getComputedStyle(grid).gap,
				captionHeight: root.querySelector(".rdp-month_caption")!.getBoundingClientRect().height,
				dayHeight: root.querySelector("button[data-day]")!.getBoundingClientRect().height,
			};
		});
		assert.deepEqual(geometry, {
			extraHeight: 48,
			padding: "12px",
			gridMargin: "16px",
			gridGap: "4px",
			captionHeight: 28,
			dayHeight: 28,
		});

		async function checkRangeBackground() {
			const cells = await page
				.locator('[data-demo="range-calendar"] button[data-range-middle="true"]')
				.evaluateAll((buttons) =>
					buttons.map((button) => {
						const cell = button.closest("td")!;
						const probe = document.createElement("span");
						probe.style.backgroundColor = "var(--accent)";
						cell.append(probe);
						const accent = getComputedStyle(probe).backgroundColor;
						probe.remove();
						return {
							day: button.textContent,
							cell: getComputedStyle(cell).backgroundColor,
							button: getComputedStyle(button).backgroundColor,
							accent,
						};
					})
				);
			assert.deepEqual(
				cells.map((cell) => cell.day),
				["11", "12", "13"]
			);
			for (const cell of cells) {
				assert.equal(cell.cell, cell.accent, `day ${cell.day} cell must join the accent range`);
				assert.equal(
					cell.button,
					cell.accent,
					`day ${cell.day} button must retain the accent range`
				);
			}
		}
		await checkRangeBackground();

		const slider = page.getByRole("slider", { name: "额度" });
		await expect(slider).toHaveAttribute("aria-valuemin", "-20");
		await expect(slider).toHaveAttribute("aria-valuemax", "80");
		await expect(slider).toHaveAttribute("aria-valuenow", "37");
		await slider.focus();
		await page.keyboard.press("End");
		await expect(slider).toHaveAttribute("aria-valuenow", "79");
		await expect(page.locator('[data-result="slider"]')).toHaveText("79");
		// Advancing beyond the last permitted min-anchored step must not emit 80.
		await page.keyboard.press("ArrowRight");
		await expect(slider).toHaveAttribute("aria-valuenow", "79");
		await page.getByRole("button", { name: "提交", exact: true }).click();
		const form = JSON.parse(await page.locator('[data-result="form"]').innerText());
		assert.equal(form.quota, "79");
		await slider.focus();
		await page.keyboard.press("Home");
		await expect(slider).toHaveAttribute("aria-valuenow", "-20");

		for (const name of ["calendar", "range-calendar"]) {
			const calendar = page.locator(`[data-demo="${name}"]`);
			const month = calendar.getByRole("combobox", { name: "月份" });
			const year = calendar.getByRole("combobox", { name: "年份" });
			await expect(month).toHaveText("11月");
			await expect(year).toHaveText("2026年");
			const captionOrder = await calendar
				.getByRole("combobox")
				.evaluateAll((triggers) => triggers.map((trigger) => trigger.getAttribute("aria-label")));
			assert.deepEqual(captionOrder, ["月份", "年份"]);
			await month.focus();
			await page.keyboard.press("Tab");
			await expect(year).toBeFocused();
			const day = calendar.locator('button[data-day][tabindex="0"]').first();
			await day.focus();
			await expect(day).toBeFocused();
			await expect(day).toHaveCSS("box-shadow", /inset/);
		}

		const calendar = page.locator('[data-demo="calendar"]');
		await calendar.getByRole("combobox", { name: "月份" }).click();
		await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(12);
		await page.getByRole("option", { name: "12月", exact: true }).click();
		await expect(calendar.getByRole("button", { name: "前往下个月" })).toBeEnabled();
		await calendar.getByRole("combobox", { name: "年份" }).click();
		await expect(page.getByRole("option", { name: "1950年", exact: true })).toBeAttached();
		await page.getByRole("option", { name: "2027年", exact: true }).click();
		await calendar.getByRole("button", { name: /2027年12月17日/ }).click();
		await expect(page.locator('[data-result="calendar"]')).toHaveText("2027-12-17");

		const range = page.locator('[data-demo="range-calendar"]');
		await range.locator("button[data-day]").filter({ hasText: /^18$/ }).click();
		await expect(page.locator('[data-result="range-calendar"]')).toHaveText("2026-11-18 –");
		await range.locator("button[data-day]").filter({ hasText: /^22$/ }).click();
		await expect(page.locator('[data-result="range-calendar"]')).toHaveText(
			"2026-11-18 – 2026-11-22"
		);
		await range.locator("button[data-day]").filter({ hasText: /^20$/ }).click();
		await expect(page.locator('[data-result="range-calendar"]')).toHaveText("2026-11-20 –");

		const trigger = page.getByRole("combobox", { name: "服务商" });
		await trigger.scrollIntoViewIfNeeded();
		const triggerBox = await trigger.boundingBox();
		await trigger.click();
		const select = page.locator('[data-slot="select-content"]');
		await expect(select).toBeVisible();
		await expect(select).toHaveAttribute("data-align", "start");
		await expect(select).toHaveAttribute("data-align-trigger", "false");
		assert.ok(triggerBox);
		// Wait for native entry motion before measuring both alignment and gap.
		await expect
			.poll(async () => {
				const box = await select.boundingBox();
				return box ? Math.abs(box.x - triggerBox.x) : Infinity;
			})
			.toBeLessThan(1);
		await expect
			.poll(async () => {
				const box = await select.boundingBox();
				return box ? Math.round(box.y - triggerBox.y - triggerBox.height) : undefined;
			})
			.toBe(4);
		await page.keyboard.press("Escape");

		assert.equal(await page.locator('link[rel="icon"]').getAttribute("href"), "data:,");
		assert.equal(
			requests.some((url) => new URL(url).pathname === "/favicon.ico"),
			false
		);
		const disabledUrl = new URL(page.url());
		disabledUrl.search = "theme=dark&disabled=1";
		await page.goto(disabledUrl.href);
		await expect(page.locator('[data-framework="react"][data-ready="true"]')).toBeVisible();
		const disabledData = await page
			.locator("form")
			.evaluate((form) => Object.fromEntries(new FormData(form as HTMLFormElement)));
		assert.deepEqual(disabledData, {});
		await checkRangeBackground();
		assert.deepEqual(errors, []);
	} finally {
		await browser.close();
	}
});

test("public radio group selects on arrow navigation even when keyup precedes deferred focus", async () => {
	const browser = await chromium.launch({
		executablePath:
			process.env.VALAR_TEST_BROWSER ??
			(process.platform === "darwin"
				? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
				: undefined),
		headless: true,
	});
	try {
		const page = await browser.newPage();
		const url = new URL(process.env.VALAR_REACT_PREVIEW_URL ?? "http://127.0.0.1:5213/");
		url.searchParams.set("example", "radio-group");
		await page.goto(url.href);
		const group = page.getByRole("radiogroup", { name: "Delivery method" });
		const email = group.getByRole("radio", { name: "Email" });
		const digest = group.getByRole("radio", { name: "Digest" });
		await expect(email).toBeChecked();
		await expect(group.getByRole("radio", { name: "Disabled" })).toBeDisabled();
		await email.focus();
		await email.evaluate((item) => {
			// Put keydown and keyup in the same task so the Radix focus timer cannot run first.
			const event = { key: "ArrowDown", bubbles: true, cancelable: true };
			item.dispatchEvent(new KeyboardEvent("keydown", event));
			item.dispatchEvent(new KeyboardEvent("keyup", event));
		});
		await expect(digest).toBeFocused();
		await expect(digest).toBeChecked();
		await digest.press("ArrowDown");
		await expect(email).toBeFocused();
		await expect(email).toBeChecked();
	} finally {
		await browser.close();
	}
});
