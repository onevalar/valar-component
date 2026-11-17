import { expect, test, type Locator } from "@playwright/test";

test.use({ viewport: { width: 320, height: 850 } });

async function expectNoHorizontalOverflow(element: Locator) {
	await expect
		.poll(() => element.evaluate((node) => node.scrollWidth - node.clientWidth))
		.toBeLessThanOrEqual(1);
}

for (const colorScheme of ["light", "dark"] as const) {
	const surface = colorScheme === "dark" ? "lch(9.232 0.85 272)" : "rgb(255, 255, 255)";

	test(`Input OTP uses Valar slots and accessible local verification in ${colorScheme}`, async ({
		page,
		context,
	}) => {
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await page.goto("/zh/docs/components/input-otp", { waitUntil: "networkidle" });

		const input = page.getByRole("textbox", { name: "Verification code", exact: true });
		const form = page.locator("form").filter({ has: input });
		const groupRoot = form.locator("[data-pin-input-root]");
		const groups = groupRoot.locator('[data-slot="input-otp-group"]');
		const slots = groupRoot.locator('[data-slot="input-otp-slot"]');
		await expect(groups).toHaveCount(2);
		await expect(slots).toHaveCount(6);
		await expectNoHorizontalOverflow(form);
		await expect(slots.first()).toHaveCSS("background-color", surface);
		await expect(slots.first()).toHaveCSS("height", "32px");
		const widths = await slots.evaluateAll((cells) =>
			cells.map((cell) => cell.getBoundingClientRect().width)
		);
		expect(Math.min(...widths)).toBeGreaterThanOrEqual(26);
		expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
		expect(
			await groups.evaluateAll(([first, second]) => {
				const start = first.getBoundingClientRect();
				const end = second.getBoundingClientRect();
				return start.top === end.top && end.left - start.right >= 32;
			})
		).toBe(true);
		await expect(page.getByRole("textbox", { name: "Disabled code" })).toBeDisabled();

		await form.locator("label").click();
		await expect(input).toBeFocused();
		await expect(slots.first()).toHaveCSS("box-shadow", /inset/);
		await expect(slots.first().locator(":scope > div > div")).toHaveCSS("animation-name", "none");
		await input.press("1");
		await input.press("Enter");
		await expect(input).toHaveAttribute("aria-invalid", "true");
		await expect(input).toHaveAccessibleDescription("Enter the six-digit demo code.");
		await expect(input).toBeFocused();
		await expect(slots.last()).not.toHaveCSS(
			"border-color",
			colorScheme === "light" ? "lch(86.5 0 282)" : "lch(30.833 1.93 272)"
		);
		await input.press("ControlOrMeta+A");
		await page.evaluate(() => navigator.clipboard.writeText("123456"));
		await input.press("ControlOrMeta+V");
		await expect(input).toHaveValue("123456");
		await expect(slots.first()).toHaveText("1");
		await expect(slots.last()).toHaveText("6");
		await input.press("Enter");
		await expect(form.getByRole("status")).toHaveText("Code verified.");
		const clear = form.getByRole("button", { name: "Clear code" });
		await clear.press("Enter");
		await expect(input).toHaveValue("");
		await expect(input).toBeFocused();
	});

	test(`Tags Input wraps long labels and keeps keyboard feedback inside in ${colorScheme}`, async ({
		page,
		context,
	}) => {
		await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await page.goto("/zh/docs/components/tags-input", { waitUntil: "networkidle" });

		const tags = page.getByRole("textbox", { name: "技术标签 / Tags" });
		const frame = page.locator('[data-slot="tags-input"]').filter({ has: tags });
		await expect(frame).toHaveCSS("background-color", surface);
		const restingBorder = await frame.evaluate((node) => getComputedStyle(node).borderColor);
		await page.getByText("技术标签 / Tags", { exact: true }).click();
		await expect(tags).toBeFocused();
		await expect(frame).not.toHaveCSS("border-color", restingBorder);
		await expect(frame).toHaveCSS("box-shadow", "none");

		const long = "project-" + "a-very-long-issue-label-".repeat(9) + "end";
		await page.evaluate(
			(text) => navigator.clipboard.writeText(text),
			`Svelte,Release notes,${long}`
		);
		await tags.press("ControlOrMeta+V");
		const items = frame.locator('[data-slot="tags-input-item"]');
		await expect(items).toHaveCount(4);
		await expect(items.last()).toContainText(long);
		await expect(tags).toHaveAttribute("aria-invalid", "true");
		await expect(tags).toHaveValue("Svelte");
		await expectNoHorizontalOverflow(frame);
		expect(
			await items.last().evaluate((node) => {
				const action = node.querySelector("button")!.getBoundingClientRect();
				const item = node.getBoundingClientRect();
				return action.left >= item.left && action.right <= item.right && action.height === 20;
			})
		).toBe(true);

		await tags.fill("");
		await tags.press("Backspace");
		await expect(items.last()).toHaveAttribute("data-selected", "true");
		await expect(items.last()).toHaveCSS("box-shadow", /inset/);
		await tags.press("Delete");
		await expect(tags).toBeFocused();
		await expect(items).toHaveCount(3);
		const remove = frame.getByRole("button", { name: "移除 Release notes" });
		await tags.press("Shift+Tab");
		await expect(remove).toBeFocused();
		await expect(remove).toHaveCSS("outline-offset", "-1px");
		await remove.press("Enter");
		await expect(tags).toBeFocused();
		await expect(items).toHaveCount(2);

		await expect(page.getByRole("textbox", { name: "只读 / Read-only" })).toHaveAttribute(
			"readonly",
			""
		);
		await expect(page.getByRole("textbox", { name: "禁用 / Disabled" })).toBeDisabled();
	});
}
