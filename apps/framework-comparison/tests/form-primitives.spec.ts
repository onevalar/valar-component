import { expect, test } from "@playwright/test";

const targets = [
	["react", process.env.VALAR_REACT_URL ?? "http://127.0.0.1:5213/"],
	["vue", process.env.VALAR_VUE_URL ?? "http://127.0.0.1:5214/"],
];

for (const [framework, url] of targets) {
	for (const [theme, width] of [
		["light", 900],
		["dark", 320],
	] as const) {
		test.describe(`${framework} ${theme} ${width}: high-reuse primitives`, () => {
			test.use({ viewport: { width, height: 720 } });

			test("label, field and textarea expose associations and responsive settings", async ({
				page,
			}) => {
				await page.goto(`${url}?example=label&theme=${theme}`);
				await page
					.locator("label")
					.filter({ hasText: /^Display name$/ })
					.click();
				await expect(page.getByRole("textbox", { name: "Display name" })).toBeFocused();

				await page.goto(`${url}?example=field&theme=${theme}`);
				const preference = page.getByRole("combobox", { name: "Interface theme" });
				await expect(preference).toHaveAccessibleDescription("Choose a workspace theme.");
				const invalid = page.getByRole("textbox", { name: "Team identifier" });
				await expect(invalid).toHaveAttribute("aria-invalid", "true");
				await expect(invalid).toHaveAccessibleDescription("Enter a valid identifier.");
				await expect(page.getByRole("alert")).toContainText("Enter a valid identifier.");
				await expect(page.locator('[data-slot="field-group"]')).toHaveCSS("row-gap", "0px");
				const row = preference.locator('xpath=ancestor::*[@data-slot="field"][1]');
				await expect(row).toHaveCSS("flex-direction", width === 320 ? "column" : "row");
				const label = row.locator('[data-slot="field-label"]');
				const [labelBox, controlBox] = await Promise.all([
					label.boundingBox(),
					preference.boundingBox(),
				]);
				if (!labelBox || !controlBox)
					throw new Error("Setting row is missing its label or control");
				if (width === 320) expect(controlBox.y - labelBox.y - labelBox.height).toBeGreaterThan(0);
				else expect(controlBox.x - labelBox.x - labelBox.width).toBeGreaterThanOrEqual(12);

				await page.goto(`${url}?example=textarea&theme=${theme}`);
				const description = page.getByRole("textbox", { name: "Description", exact: true });
				await expect(description).toHaveCSS("height", "120px");
				await description.fill("工程说明\nA second line");
				await expect(description).toHaveValue("工程说明\nA second line");
				const notes = page.getByRole("textbox", { name: "Notes", exact: true });
				const emptyHeight = (await notes.boundingBox())!.height;
				await notes.fill("one\ntwo\nthree\nfour\nfive\nsix");
				await expect
					.poll(async () => (await notes.boundingBox())!.height)
					.toBeGreaterThan(emptyHeight);
			});

			test("switch, radios and native select keep keyboard and form behavior", async ({ page }) => {
				await page.goto(`${url}?example=switch&theme=${theme}`);
				const updates = page.getByRole("switch", { name: "Email updates", exact: true });
				const defaultChecked = await updates.getAttribute("aria-checked");
				await expect(updates).toHaveCSS("width", "30px");
				await expect(updates).toHaveCSS("height", "20px");
				await expect(page.getByRole("switch", { name: "Locked updates" })).toBeDisabled();
				const form = page.locator("form").filter({ has: updates });
				const entries = () =>
					form.evaluate((node) => Array.from(new FormData(node as HTMLFormElement).entries()));
				const initial = await entries();
				await updates.press("Enter");
				await expect(updates).toHaveAttribute(
					"aria-checked",
					defaultChecked === "true" ? "false" : "true"
				);
				await expect(form.locator("output")).toHaveText("");
				expect(await entries()).not.toEqual(initial);
				await updates.press("Space");
				await expect(updates).toHaveAttribute("aria-checked", defaultChecked!);
				await updates.press("Space");
				await expect.poll(entries).not.toEqual(initial);
				await page.getByRole("button", { name: "Reset settings" }).click();
				await expect(updates).toHaveAttribute("aria-checked", defaultChecked!);
				expect(await entries()).toEqual(initial);

				await page.goto(`${url}?example=radio-group&theme=${theme}`);
				const delivery = page.getByRole("radiogroup", { name: "Delivery method" });
				const email = delivery.getByRole("radio", { name: "Email", exact: true });
				const digest = delivery.getByRole("radio", { name: "Digest" });
				await expect(email).toBeChecked();
				await expect(delivery.getByRole("radio", { name: "Disabled", exact: true })).toBeDisabled();
				await email.focus();
				await page.keyboard.down("ArrowDown");
				try {
					await expect(digest).toBeFocused();
					// Reka selects asynchronously after the focus event while the arrow is held.
					await expect(digest).toBeChecked();
				} finally {
					await page.keyboard.up("ArrowDown");
				}
				await expect(email).not.toBeChecked();

				await page.goto(`${url}?example=native-select&theme=${theme}`);
				const zone = page.getByRole("combobox", { name: "Time zone" });
				await expect(zone.locator("xpath=self::select")).toHaveValue("utc");
				await expect(zone).toHaveCSS("height", "32px");
				await zone.selectOption("local");
				await expect(zone).toHaveValue("local");
			});

			test("manual tabs separate focus from selection; tooltip responds to pointer and focus", async ({
				page,
			}) => {
				await page.goto(`${url}?example=tabs&theme=${theme}`);
				const tabs = page
					.getByRole("tablist")
					.filter({ has: page.getByRole("tab", { name: "Locked" }) });
				const overview = tabs.getByRole("tab", { name: "Overview" });
				const activity = tabs.getByRole("tab", { name: "Activity" });
				await expect(tabs.getByRole("tab", { name: "Locked" })).toBeDisabled();
				await expect(overview).toHaveAttribute("aria-selected", "true");
				await expect(overview).toHaveCSS("height", "28px");
				await overview.focus();
				await overview.press("ArrowRight");
				await expect(activity).toBeFocused();
				await expect(activity).toHaveAttribute("aria-selected", "false");
				await activity.press("Space");
				await expect(page.getByRole("tabpanel", { name: "Activity" })).toBeVisible();
				await activity.press("ArrowRight");
				await expect(tabs.getByRole("tab", { name: "Locked" })).not.toBeFocused();

				await page.goto(`${url}?example=kbd&theme=${theme}`);
				const keys = page.getByRole("region", { name: "Kbd examples" }).locator("kbd");
				await expect(keys.nth(1)).toBeVisible();

				await page.goto(`${url}?example=tooltip&theme=${theme}`);
				const trigger = page.getByRole("button", { name: "Display options", exact: true });
				const content = page
					.locator('[data-slot="tooltip-content"]')
					.filter({ hasText: "Show display options" });
				await trigger.hover();
				await expect(content).toBeVisible();
				await expect(content.locator('kbd[data-appearance="compact"]')).toHaveText(["Shift", "V"]);
				await page.mouse.move(0, 0);
				await expect(content).toBeHidden();
				await trigger.focus();
				await expect(content).toBeVisible();
				await page.keyboard.press("Escape");
				await expect(content).toBeHidden();
				await expect(trigger).toBeFocused();
			});

			test("input and button groups focus the intended controls", async ({ page }) => {
				await page.goto(`${url}?example=input-group&theme=${theme}`);
				const query = page.getByRole("searchbox", { name: "Search settings" });
				await query.fill("Profile");
				await page.getByRole("button", { name: "Clear search" }).click();
				await expect(query).toHaveValue("");
				await expect(query).toBeFocused();
				await query.fill("General");
				await query.press("Escape");
				await expect(query).toHaveValue("");
				await expect(query).toBeFocused();

				await page.goto(`${url}?example=button-group&theme=${theme}`);
				const actions = page.getByRole("group", { name: "Issue actions" });
				const copy = actions.getByRole("button", { name: "Copy as prompt" });
				const tools = actions.getByRole("button", { name: "Choose coding tool" });
				const divider = actions.locator('[data-slot="button-group-separator"]');
				await expect(copy).toHaveCSS("height", "28px");
				await expect(divider).toHaveCSS("width", "0.5px");
				await copy.focus();
				await copy.press("Tab");
				await expect(tools).toBeFocused();
			});

			test("toggle and toolbar expose independent pressed state and roving focus", async ({
				page,
			}) => {
				await page.goto(`${url}?example=toggle&theme=${theme}`);
				const bold = page.getByRole("button", { name: "Bold", exact: true });
				await expect(bold).toHaveAttribute("aria-pressed", "false");
				await bold.focus();
				await bold.press("Space");
				await expect(bold).toHaveAttribute("aria-pressed", "true");

				await page.goto(`${url}?example=toggle-group&theme=${theme}`);
				const group = page.getByLabel("Text formatting", { exact: true });
				const groupBold = group.getByRole("button", { name: "Bold", exact: true });
				const italic = group.getByRole("button", { name: "Italic", exact: true });
				await groupBold.focus();
				if ((await groupBold.getAttribute("aria-pressed")) !== "true")
					await groupBold.press("Space");
				await groupBold.press("ArrowRight");
				await expect(italic).toBeFocused();
				if ((await italic.getAttribute("aria-pressed")) !== "true") await italic.press("Space");
				await expect(groupBold).toHaveAttribute("aria-pressed", "true");
				await expect(italic).toHaveAttribute("aria-pressed", "true");
			});
		});
	}
}
