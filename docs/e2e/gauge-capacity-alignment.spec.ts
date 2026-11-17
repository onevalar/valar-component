import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
	test(`Gauge capacity follows the cycle reading and fits at 320px in ${colorScheme}`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 850 });
		await page.emulateMedia({ colorScheme });
		await page.goto("/docs/components/gauge", { waitUntil: "networkidle" });

		const meter = page.getByRole("meter", { name: "Cycle capacity used", exact: true });
		const controller = page.getByRole("slider", { name: "Adjust cycle capacity", exact: true });
		const icon = meter.locator("svg");
		const track = meter.locator("[data-slot='gauge-capacity-track']");
		const value = meter.locator("[data-slot='gauge-capacity-value']");
		const number = meter.locator("[data-slot='gauge-capacity-number']");
		const suffix = meter.locator("[data-slot='gauge-capacity-suffix']");
		const dark = colorScheme === "dark";
		const accent = "lch(48 59.31 288.43)";
		const danger = "lch(58 73 29)";
		const pathLength = () => value.evaluate((node) => (node as SVGPathElement).getTotalLength());

		await expect(meter).toHaveAttribute("aria-valuemin", "0");
		await expect(meter).toHaveAttribute("aria-valuemax", "100");
		await expect(meter).toHaveAttribute("aria-valuenow", "0");
		await expect(meter).toHaveAttribute("aria-valuetext", "0% of capacity");
		await expect(icon).toHaveCSS("width", "16px");
		await expect(icon).toHaveCSS("height", "16px");
		await expect(icon).toHaveAttribute("aria-hidden", "true");
		await expect(track).toHaveCSS("stroke-width", "2px");
		await expect(track).toHaveCSS("stroke-linecap", "round");
		await expect(track).toHaveCSS("stroke", dark ? "lch(14.16 1.48 272)" : "lch(88.49 0 282)");
		await expect(value).toHaveCSS("stroke", accent);
		const totalLength = await track.evaluate((node) => (node as SVGPathElement).getTotalLength());
		expect(totalLength).toBeCloseTo(2 * Math.PI * 7 * 0.85, 1);
		expect(await pathLength()).toBeGreaterThan(0);
		expect(await pathLength()).toBeLessThan(0.2);

		await expect(number).toHaveCSS("font-size", "13px");
		await expect(number).toHaveCSS("font-weight", "500");
		await expect(number).toHaveCSS("line-height", "15.5px");
		await expect(number).toHaveCSS("color", dark ? "lch(90.451 1.2 272)" : "lch(19.588 1.25 282)");
		await expect(suffix).toHaveText("of capacity");
		await expect(suffix).toHaveCSS("font-weight", "450");
		await expect(suffix).toHaveCSS("color", dark ? "lch(61.803 1.2 272)" : "lch(39.176 1.25 282)");
		const iconBox = (await icon.boundingBox())!;
		const numberBox = (await number.boundingBox())!;
		const suffixBox = (await suffix.boundingBox())!;
		expect(numberBox.x - iconBox.x - iconBox.width).toBeCloseTo(8, 1);
		expect(suffixBox.x - numberBox.x - numberBox.width).toBeCloseTo(8, 1);

		await controller.press("ArrowRight");
		await controller.press("ArrowRight");
		await expect(number).toHaveText("50%");
		await expect(meter).toHaveAttribute("aria-valuetext", "50% of capacity");
		expect(await pathLength()).toBeCloseTo(totalLength / 2, 1);
		await controller.press("ArrowRight");
		await controller.press("ArrowRight");
		await expect(number).toHaveText("100%");
		await expect(value).toHaveCSS("stroke", accent);
		expect(await pathLength()).toBeCloseTo(totalLength, 1);
		await controller.press("End");
		await expect(meter).toHaveAttribute("aria-valuenow", "100");
		await expect(meter).toHaveAttribute("aria-valuetext", "125% of capacity");
		await expect(number).toHaveText("125%");
		await expect(value).toHaveCSS("stroke", danger);
		expect(await pathLength()).toBeCloseTo(totalLength, 1);
		await expect(controller).toBeFocused();
		await controller.press("Home");
		await expect(number).toHaveText("0%");
		await expect(value).toHaveCSS("stroke", accent);

		const largeValue = page.getByRole("meter", { name: "Over-capacity cycle", exact: true });
		await expect(largeValue.locator("[data-slot='gauge-capacity-number']")).toHaveText("21100%");
		await expect(largeValue).toHaveAttribute("aria-valuetext", "21100% of capacity");
		await expect(largeValue.locator("[data-slot='gauge-capacity-value']")).toHaveCSS(
			"stroke",
			danger,
		);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
	});
}

test("Gauge preserves generic proportions, overflow text and the standalone missing arc", async ({
	page,
}) => {
	await page.setViewportSize({ width: 320, height: 850 });
	await page.goto("/docs/components/gauge", { waitUntil: "networkidle" });
	const generic = page.getByRole("meter", { name: "超限配额", exact: true });
	await expect(generic).toHaveAttribute("aria-valuenow", "100");
	await expect(generic).toHaveAttribute("aria-valuetext", "已使用 125%");
	await expect(generic).toHaveText("125%");
	await expect(generic.locator("svg")).toHaveAttribute("viewBox", "0 0 100 90");
	const missing = page.locator("[data-slot='gauge-arc'][data-missing='true']");
	await expect(missing.locator("path")).toHaveCount(1);
	await expect(missing.locator("path")).toHaveAttribute("stroke-dasharray", "3 6");
});
