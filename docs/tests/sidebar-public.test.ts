import { flushSync, mount, tick, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SidebarFixture from "../../packages/ui/test/fixtures/sidebar-public.svelte";

let app: ReturnType<typeof mount> | undefined;
const change = vi.fn();
const target = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
const settle = async () => {
	flushSync();
	await tick();
	flushSync();
};
const start = async (keyboardShortcut?: boolean) => {
	app = mount(SidebarFixture, {
		target: document.body,
		props: { keyboardShortcut, onOpenChange: change },
	});
	await settle();
};
const press = (node: EventTarget, modifier: "metaKey" | "ctrlKey", key = "b") => {
	const event = new KeyboardEvent("keydown", {
		key,
		[modifier]: true,
		bubbles: true,
		cancelable: true,
	});
	node.dispatchEvent(event);
	return event;
};
const expectUnchanged = () => {
	expect(document.querySelector("[data-state]")?.getAttribute("data-state")).toBe("expanded");
	expect(target("bound-open").textContent).toBe("true");
	expect(change).not.toHaveBeenCalled();
	expect(document.querySelector('[role="status"]')?.textContent).toBe("");
	expect(document.cookie).not.toContain("sidebar_state=");
};

beforeEach(() => {
	// Desktop viewport; the real Svelte MediaQuery still subscribes to matchMedia.
	vi.stubGlobal("matchMedia", () => Object.assign(new EventTarget(), { matches: false }));
	change.mockClear();
	document.cookie = "sidebar_state=; path=/; max-age=0";
});
afterEach(async () => {
	if (app) await unmount(app);
	app = undefined;
	document.body.innerHTML = "";
	document.cookie = "sidebar_state=; path=/; max-age=0";
	vi.unstubAllGlobals();
});

for (const [label, enabled] of [
	["default", undefined],
	["enabled", true],
	["disabled", false],
] as const) {
	describe(`public Sidebar.Provider keyboardShortcut=${label}`, () => {
		for (const modifier of ["metaKey", "ctrlKey"] as const) {
			it(`${modifier}+B only toggles when enabled`, async () => {
				await start(enabled);
				const event = press(target("ordinary"), modifier);
				await settle();
				expect(event.defaultPrevented).toBe(enabled !== false);
				if (enabled === false) {
					expectUnchanged();
				} else {
					expect(target("bound-open").textContent).toBe("false");
					expect(document.querySelector("[data-state]")?.getAttribute("data-state")).toBe(
						"collapsed"
					);
					expect(change).toHaveBeenCalledExactlyOnceWith(false);
					expect(document.querySelector('[role="status"]')?.textContent).toBe("Sidebar collapsed");
					expect(document.cookie).toContain("sidebar_state=false");
				}
			});

			for (const editor of [
				"input",
				"textarea",
				"editor",
				"editor-child",
				"editor-grandchild",
				"editor-svg",
				"editor-empty",
				"editor-plaintext",
			]) {
				it(`${modifier}+B leaves ${editor} and its native behavior untouched`, async () => {
					await start(enabled);
					const event = press(target(editor), modifier);
					await settle();
					expect(event.defaultPrevented).toBe(false);
					expectUnchanged();
				});
			}
		}

		it("retains Trigger and Rail button toggles", async () => {
			await start(enabled);
			document.querySelector<HTMLButtonElement>('[data-sidebar="trigger"]')!.click();
			await settle();
			expect(target("bound-open").textContent).toBe("false");
			document.querySelector<HTMLButtonElement>('[data-sidebar="rail"]')!.click();
			await settle();
			expect(target("bound-open").textContent).toBe("true");
			expect(change.mock.calls).toEqual([[false], [true]]);
		});
	});
}

it("updates the shortcut opt-out reactively without disabling buttons", async () => {
	await start();
	target("configure").click();
	await settle();
	expect(press(window, "metaKey").defaultPrevented).toBe(false);
	await settle();
	expectUnchanged();
	target("configure").click();
	await settle();
	expect(press(window, "ctrlKey").defaultPrevented).toBe(true);
	await settle();
	expect(target("bound-open").textContent).toBe("false");
	expect(change).toHaveBeenCalledExactlyOnceWith(false);
});

it("does not suppress the shortcut on an explicitly non-editable element", async () => {
	await start();
	expect(press(target("not-editor"), "ctrlKey").defaultPrevented).toBe(true);
	await settle();
	expect(change).toHaveBeenCalledExactlyOnceWith(false);
});

it("ignores unrelated keys", async () => {
	await start();
	expect(press(window, "ctrlKey", "x").defaultPrevented).toBe(false);
	window.dispatchEvent(new KeyboardEvent("keydown", { key: "b", cancelable: true }));
	await settle();
	expectUnchanged();
});
