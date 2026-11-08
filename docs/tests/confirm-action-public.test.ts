import { flushSync, mount, tick, unmount } from "svelte";
import { afterEach, expect, it, vi } from "vitest";
// Test generated public artifact, not registry source: style injection once erased the Space key.
import { ConfirmAction } from "../../packages/ui/dist/valar/ui/confirm-action/index.js";
let app: ReturnType<typeof mount> | undefined;
afterEach(async () => {
	if (app) await unmount(app);
	app = undefined;
	document.body.innerHTML = "";
	vi.useRealTimers();
});
const settle = async () => {
	flushSync();
	await tick();
	flushSync();
};
const button = (label: string) =>
	[...document.querySelectorAll("button")].find((node) => node.textContent?.trim() === label)!;
it("built ConfirmAction accepts actual Space hold/release, ignores empty key and cancels early keyup", async () => {
	vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
	const confirm = vi.fn();
	app = mount(ConfirmAction, {
		target: document.body,
		props: {
			label: "Remove",
			confirmLabel: "Yes",
			confirmMode: "hold",
			holdDuration: 500,
			onConfirm: confirm,
		},
	});
	await settle();
	button("Remove").click();
	await settle();
	vi.advanceTimersByTime(300);
	const key = (type: string, key: string) =>
		button("Yes").dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }));
	key("keydown", "");
	vi.advanceTimersByTime(600);
	await settle();
	expect(confirm).not.toHaveBeenCalled();
	key("keydown", " ");
	vi.advanceTimersByTime(400);
	key("keyup", " ");
	vi.advanceTimersByTime(600);
	await settle();
	expect(confirm).not.toHaveBeenCalled();
	key("keydown", " ");
	vi.advanceTimersByTime(500);
	await settle();
	expect(confirm).toHaveBeenCalledTimes(1);
});
