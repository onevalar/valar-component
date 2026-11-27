import { expect, test } from "@playwright/test";

for (const [framework, base] of [
	["react", process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/"],
	["vue", process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/"],
] as const) {
	test(`${framework}: a hidden donut series does not renormalize the remaining arc`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=donut-chart`);
		const chart = page.locator("[data-slot=static-donut]");
		const compute = chart.locator("[data-part=Compute]");
		await expect(chart).toHaveAttribute("aria-hidden", "true");
		await expect(compute).toHaveAttribute("data-end", "0.47");
		await expect(chart.locator("[data-part=Storage]")).toHaveAttribute("data-end", "0.69");
		const path = await compute.getAttribute("d");
		expect(path).toMatch(/^M.+A97.+A73.+Z$/);
		await page.getByRole("checkbox", { name: "Show storage in the chart" }).uncheck();
		await expect(chart.locator("path")).toHaveCount(1);
		await expect(compute).toHaveAttribute("d", path!);
		await expect(page.locator("figcaption")).toContainText("Capacity 100 units");
	});

	test(`${framework}: gauge distinguishes missing readings from overflow`, async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 420 });
		await page.goto(`${base}?example=gauge&theme=dark`);
		const gauge = page.getByRole("meter", { name: "Compute quota" });
		await expect(gauge).toHaveAttribute("aria-valuenow", "100");
		await expect(gauge).toHaveAttribute("aria-valuetext", "132 percent, over quota");
		await expect(gauge).toHaveText("132%");
		const arcs = await gauge
			.locator("path")
			.evaluateAll((paths) => paths.map((el) => el.getAttribute("d")));
		expect(arcs).toHaveLength(2);
		expect(arcs[0]).toBe(arcs[1]);
		const storage = page.locator("figure").filter({ hasText: "Storage unavailable" });
		await expect(storage.locator("path")).toHaveCount(1);
		await expect(storage.locator("path")).toHaveAttribute("stroke-dasharray", "3 6");
		await expect(storage.getByRole("meter")).toHaveCount(0);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});

	test(`${framework}: sparkline draws real zero points and does not bridge a missing slot`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=sparkline`);
		const chart = page.locator("[data-slot=static-sparkline]");
		await expect(chart).toHaveAttribute("aria-hidden", "true");
		await expect(chart.locator("path")).toHaveAttribute(
			"d",
			/^M4\.00,36\.00 L16\.80,17\.71\s+M42\.40,4\.00 L55\.20,26\.86 L68\.00,36\.00$/
		);
		await expect(chart.locator("circle")).toHaveCount(5);
		await expect(page.locator("figcaption")).toContainText("0, 4, unavailable, 7, 2, 0");
	});

	test(`${framework}: tick meter clamps geometry but preserves caller-supplied overflow text`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=tick-meter&theme=dark`);
		const design = page.getByRole("meter", { name: "Design quota" });
		await expect(design.locator("line")).toHaveCount(60);
		await expect(design.locator('line[data-filled="true"]')).toHaveCount(22);
		const ops = page.getByRole("meter", { name: "Operations quota" });
		await expect(ops.locator('line[data-filled="true"]')).toHaveCount(60);
		await expect(ops).toHaveAttribute("aria-valuenow", "100");
		await expect(ops).toHaveAttribute("aria-valuetext", "132 percent, over quota");
		await expect(ops).toHaveText("132%");
	});

	test(`${framework}: waffle allocates stable whole cells and clears on an empty period`, async ({
		page,
	}) => {
		await page.goto(`${base}?example=waffle-chart`);
		const chart = page.getByRole("img", { name: "Issues by type" });
		await expect(chart.locator("[data-category]")).toHaveCount(100);
		await expect(chart.locator("[data-category=Design]")).toHaveCount(56);
		await expect(chart.locator("[data-category=Bug]")).toHaveCount(22);
		await expect(chart.locator("[data-category=Docs]")).toHaveCount(22);
		const first = chart.locator("[data-category]").first();
		await expect(first).toHaveCSS("grid-row-start", "10");
		await expect(first).toHaveCSS("grid-column-start", "1");
		await page.getByRole("checkbox", { name: "Show empty period" }).check();
		await expect(chart.locator("[data-category]")).toHaveCount(0);
		await expect(page.locator("figcaption")).toHaveText("No issues in this period");
	});

	test(`${framework}: Texture Fill redraws bounded pixels and follows container size and theme`, async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.setViewportSize({ width: 320, height: 420 });
		await page.goto(`${base}?example=texture-fill&theme=dark`);
		const meter = page.getByRole("meter", { name: "Build quota" });
		const canvas = meter.locator("canvas");
		await expect(canvas).toBeVisible();
		const pixel = (position: number) =>
			canvas.evaluate(
				(node: HTMLCanvasElement, x) =>
					Array.from(node.getContext("2d")!.getImageData(Math.floor(node.width * x), 4, 1, 1).data),
				position
			);
		await expect.poll(async () => (await pixel(0.12))[3]).toBe(255);
		await expect.poll(async () => (await pixel(0.8))[3]).toBeLessThan(255);
		await page.getByRole("button", { name: "0%", exact: true }).click();
		await expect.poll(async () => (await pixel(0.12))[3]).toBeLessThan(255);
		await page.getByRole("button", { name: "132%", exact: true }).click();
		await expect(meter).toHaveAttribute("aria-valuenow", "100");
		await expect(meter).toHaveAttribute("aria-valuetext", "132 percent used");
		await expect.poll(async () => (await pixel(0.8))[3]).toBe(255);
		const previous = await pixel(0.12);
		await page.locator("html").evaluate((el) => el.classList.remove("dark"));
		await expect.poll(() => pixel(0.12)).not.toEqual(previous);
		const previousWidth = await canvas.evaluate((node: HTMLCanvasElement) => node.width);
		await page.setViewportSize({ width: 360, height: 420 });
		await expect
			.poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.width))
			.toBeGreaterThan(previousWidth);
	});

	test(`${framework}: Ruler Slider snaps and commits key and reduced-motion drag input`, async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.setViewportSize({ width: 320, height: 420 });
		await page.goto(`${base}?example=ruler-slider&theme=dark`);
		const ruler = page.getByRole("slider", { name: "Distance" });
		const status = page.getByRole("status");
		await expect(ruler).toHaveAttribute("aria-valuenow", "3.25");
		await ruler.press("ArrowRight");
		await expect(status).toHaveText("Committed: 3.75 km");
		await ruler.press("PageUp");
		await expect(ruler).toHaveAttribute("aria-valuetext", "5.75 km");
		await expect(status).toHaveText("Committed: 5.75 km");
		const box = await ruler.boundingBox();
		expect(box).not.toBeNull();
		const x = box!.x + box!.width / 2;
		const y = box!.y + box!.height / 2;
		await page.mouse.move(x, y);
		await page.mouse.down();
		await page.mouse.move(x - 32, y, { steps: 6 });
		await expect(ruler).toHaveAttribute("aria-valuenow", "7.25");
		await expect(status).toHaveText("Committed: 5.75 km");
		await page.mouse.up();
		await expect(status).toHaveText("Committed: 7.25 km");
		await expect(page.locator('input[name="distance"]')).toHaveValue("7.25");
		await ruler.press("End");
		await expect(ruler).toHaveAttribute("aria-valuenow", "11.25");
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});
}
