import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 320, height: 852 }, deviceScaleFactor: 2 });

for (const colorScheme of ["light", "dark"] as const) {
	test(`Code Block uses the visible ${colorScheme} surface and overlay scrollbars at 320px`, async ({
		page,
		context,
	}) => {
		await page.emulateMedia({ colorScheme });
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await page.goto("/zh/docs/components/code-block", { waitUntil: "networkidle" });
		const issue = page.locator('[data-slot="code-block"][data-appearance="issue"]');
		const viewport = issue.getByRole("region", { name: "Issue code", exact: true });
		const actions = issue.locator('[data-slot="code-block-actions"]');
		const horizontal = issue.locator(
			'[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]'
		);
		const vertical = issue.locator(
			'[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]'
		);

		await expect(issue).toHaveCSS("border-radius", "6px");
		// Chromium can round a half-pixel border to one CSS pixel on headless displays.
		await expect(issue).toHaveCSS("border-top-width", /^(0\.5|1)px$/);
		await expect(issue).toHaveCSS(
			"background-color",
			colorScheme === "dark" ? "lch(9.232 0.85 272)" : "rgb(255, 255, 255)"
		);
		await expect(viewport.locator("pre > code")).toHaveCSS("font-size", "12px");
		await expect(viewport.locator("pre > code")).toHaveCSS("line-height", "20px");
		const line = viewport.locator('[data-slot="code-block-line-content"]').first();
		const inset = await line.evaluate((node) => {
			const parent = node.closest('[data-slot="scroll-area-viewport"]')!;
			return node.getBoundingClientRect().left - parent.getBoundingClientRect().left;
		});
		expect(inset).toBe(50);
		await expect(viewport).toHaveCSS("padding-right", "16px");
		await expect(viewport).toHaveCSS("scrollbar-width", "none");
		const measure = () =>
			viewport.evaluate((node) => ({
				width: node.clientWidth,
				height: node.clientHeight,
				gutterX: node.offsetWidth - node.clientWidth,
				gutterY: node.offsetHeight - node.clientHeight,
			}));
		const before = await measure();
		expect(before.width).toBeLessThan(320);
		expect(await viewport.evaluate((node) => node.scrollWidth)).toBeGreaterThan(before.width);
		expect(await viewport.evaluate((node) => node.scrollHeight)).toBeGreaterThan(before.height);

		await page.mouse.move(1, 1);
		await expect(actions).toHaveCSS("opacity", "0");
		await expect(horizontal).toBeHidden();
		await viewport.hover();
		await expect(horizontal).toBeVisible();
		await expect(vertical).toBeVisible();
		await expect(horizontal).toHaveCSS("position", "absolute");
		await expect(vertical).toHaveCSS("position", "absolute");
		expect(await measure()).toEqual({ ...before, gutterX: 0, gutterY: 0 });

		await page.mouse.move(1, 1);
		const copy = issue.getByRole("button", { name: "Copy issue code", exact: true });
		await copy.focus();
		await expect(actions).toHaveCSS("opacity", "1");
		await expect(copy).toHaveCSS("width", "26px");
		await copy.press("Enter");
		await expect(
			issue.getByRole("button", { name: "Issue code copied", exact: true })
		).toBeFocused();
		const clipboard = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboard).toMatch(/^const release = \{\n  id: "issue-review",/);
		expect(clipboard).toContain("\n\nconsole.log(release);");
		await page.keyboard.press("Tab");
		await expect(viewport).toBeFocused();
		await expect(viewport).toHaveCSS("outline-offset", "-1px");
		await page.keyboard.press("ArrowRight");
		await expect.poll(() => viewport.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
		await page.keyboard.press("PageDown");
		await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);

		const reply = page.getByRole("region", { name: "Agent reply code", exact: true });
		const wrap = page.getByRole("button", { name: "Wrap reply code", exact: true });
		await expect(wrap).toHaveAttribute("aria-pressed", "false");
		await wrap.press("Space");
		await expect(wrap).toHaveAttribute("aria-pressed", "true");
		await expect(reply.locator("pre")).toHaveCSS("white-space", "pre-wrap");
		await expect
			.poll(() => reply.evaluate((node) => node.scrollWidth - node.clientWidth))
			.toBeLessThanOrEqual(1);
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			)
		).toBeLessThanOrEqual(1);
	});
}

test("The collapsed code block clips its vertical content until expanded", async ({ page }) => {
	await page.goto("/zh/docs/components/code-block", { waitUntil: "networkidle" });
	const trigger = page.getByRole("button", { name: "Show more", exact: true }).last();
	const controls = await trigger.getAttribute("aria-controls");
	const block = page.locator('[data-slot="code-block"]').filter({
		has: page.locator(`pre[id=${JSON.stringify(controls)}]`),
	});
	const expand = block.getByRole("button", { name: "Show more", exact: true });
	const viewport = block.locator('[data-slot="scroll-area-viewport"]');
	const vertical = block.locator(
		'[data-slot="scroll-area-scrollbar"][data-orientation="vertical"]'
	);
	await expect(expand).toHaveAttribute("aria-expanded", "false");
	await expect(viewport.locator("pre")).toBeVisible();
	await expect(viewport).toHaveCSS("overflow-y", "hidden");
	await viewport.hover();
	await expect(vertical).toBeHidden();
	await viewport.press("PageDown");
	expect(await viewport.evaluate((node) => node.scrollTop)).toBe(0);

	await expand.press("Enter");
	const collapse = block.getByRole("button", { name: "Show less", exact: true });
	await expect(collapse).toHaveAttribute("aria-expanded", "true");
	await expect(viewport).toHaveCSS("overflow-y", "scroll");
	await viewport.press("PageDown");
	await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
	await collapse.press("Enter");
	await expect(expand).toHaveAttribute("aria-expanded", "false");
	await expect(viewport).toHaveCSS("overflow-y", "hidden");
});
