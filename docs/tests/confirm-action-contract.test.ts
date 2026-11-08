import { flushSync, mount, tick, unmount } from "svelte";
import { afterEach, expect, it, vi } from "vitest";
import { ConfirmAction } from "../src/lib/registry/ui/confirm-action/index.js";

// Registry packaging replaces the docs-only icon selector with this real Lucide icon.
vi.mock("$lib/components/icon-placeholder/icon-placeholder.svelte", async () => ({
	default: (await import("@lucide/svelte/icons/loader-circle")).default,
}));

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

it("fullWidth expands the idle Button's hit area and preserves destructive-confirm initial focus", async () => {
	app = mount(ConfirmAction, {
		target: document.body,
		props: { label: "Remove", confirmLabel: "Yes", fullWidth: true },
	});
	await settle();
	expect(button("Remove").classList.contains("w-full")).toBe(true);
	expect(button("Remove").classList.contains("min-h-11")).toBe(true);
	const root = document.querySelector('[data-slot="confirm-action"]')!;
	expect(root.classList.contains("p-0")).toBe(true);
	expect(root.classList.contains("border-0")).toBe(true);
	button("Remove").focus();
	button("Remove").click();
	await settle();
	expect(root.classList.contains("p-0")).toBe(false);
	expect(document.activeElement).toBe(button("Yes"));
	expect(
		button("Cancel").compareDocumentPosition(button("Yes")) & Node.DOCUMENT_POSITION_FOLLOWING
	).not.toBe(0);
});

it("Space (not empty key) starts hold; keyup cancels, completed hold shows a reduced-motion-safe native Spinner", async () => {
	vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
	let resolve!: () => void;
	const onConfirm = vi.fn(
		() =>
			new Promise<void>((done) => {
				resolve = done;
			})
	);
	app = mount(ConfirmAction, {
		target: document.body,
		props: {
			label: "Remove",
			confirmLabel: "Yes",
			pendingLabel: "正在移除…",
			confirmMode: "hold",
			holdDuration: 500,
			onConfirm,
		},
	});
	await settle();
	button("Remove").click();
	await settle();
	vi.advanceTimersByTime(300);
	button("Yes").dispatchEvent(new KeyboardEvent("keydown", { key: "", bubbles: true }));
	vi.advanceTimersByTime(500);
	await settle();
	expect(onConfirm).not.toHaveBeenCalled();
	button("Yes").dispatchEvent(
		new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })
	);
	vi.advanceTimersByTime(400);
	button("Yes").dispatchEvent(
		new KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true })
	);
	vi.advanceTimersByTime(500);
	await settle();
	expect(onConfirm).not.toHaveBeenCalled();
	button("Yes").dispatchEvent(
		new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })
	);
	vi.advanceTimersByTime(500);
	await settle();
	expect(onConfirm).toHaveBeenCalledTimes(1);
	const spinner = document.querySelector('[data-slot="spinner"]')!;
	expect(spinner.getAttribute("aria-hidden")).toBe("true");
	expect(spinner.classList.contains("motion-reduce:animate-none")).toBe(true);
	expect(document.querySelector('[role="status"]')?.textContent).toBe("正在移除…");
	resolve();
	await settle();
	expect(document.querySelector('[data-slot="spinner"]')).toBeNull();
});
