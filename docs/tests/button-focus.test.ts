import { flushSync, mount, unmount } from "svelte";
import { afterEach, expect, it } from "vitest";
import { Button } from "../../packages/ui/dist/valar/ui/button/index.js";
const apps: ReturnType<typeof mount>[] = [];
afterEach(async () => {
	for (const app of apps.splice(0)) await unmount(app);
	document.body.innerHTML = "";
});
it("public Button makes keyboard/pointer focus explicit, respects overrides and omits disabled controls from Tab order", () => {
	for (const props of [
		{},
		{ tabindex: -1 },
		{ tabindex: 3 },
		{ disabled: true },
		{ href: "/fixture" },
		{ href: "/fixture", disabled: true, tabindex: 3 },
	]) {
		apps.push(mount(Button, { target: document.body, props }));
	}
	flushSync();
	expect(
		[...document.querySelectorAll("[data-slot=button]")].map((node) =>
			node.getAttribute("tabindex")
		)
	).toEqual(["0", "-1", "3", "-1", "0", "-1"]);
	expect(document.querySelector<HTMLButtonElement>("button:disabled")?.disabled).toBe(true);
	expect(document.querySelector("a[aria-disabled=true]")?.hasAttribute("href")).toBe(false);
});
