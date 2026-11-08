import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createConfirmMorph } from "../src/lib/registry/ui/confirm-action/morph.js";

let controller: ReturnType<typeof createConfirmMorph> | undefined;
let media: EventTarget & { matches: boolean };
let original: PropertyDescriptor | undefined;
let animations: { cancel: ReturnType<typeof vi.fn>; onfinish?: () => void }[];
let animate: ReturnType<typeof vi.fn>;
beforeEach(() => {
	media = Object.assign(new EventTarget(), { matches: false });
	vi.stubGlobal("matchMedia", () => media);
	original = Object.getOwnPropertyDescriptor(Element.prototype, "animate");
	animations = [];
	animate = vi.fn(() => {
		const animation = { cancel: vi.fn(), onfinish: undefined as (() => void) | undefined };
		animations.push(animation);
		return animation;
	});
	Object.defineProperty(Element.prototype, "animate", { configurable: true, value: animate });
});
afterEach(() => {
	controller?.destroy();
	controller = undefined;
	if (original) Object.defineProperty(Element.prototype, "animate", original);
	else Reflect.deleteProperty(Element.prototype, "animate");
	vi.unstubAllGlobals();
	document.body.innerHTML = "";
});
function setup() {
	document.body.innerHTML = `<div id="root" style="border-top-left-radius:22px"><div id="body"><button id="action" data-autofocus aria-label="Remove">Remove</button></div><span role="status" aria-live="polite">One announcement</span></div>`;
	const root = document.querySelector<HTMLDivElement>("#root")!,
		body = document.querySelector<HTMLDivElement>("#body")!;
	let width = 100;
	vi.spyOn(root, "getBoundingClientRect").mockImplementation(
		() => ({ width, height: 44, top: 0 }) as DOMRect
	);
	vi.spyOn(body, "getBoundingClientRect").mockImplementation(
		() => ({ width: width - 10, height: 34, top: 5 }) as DOMRect
	);
	controller = createConfirmMorph(root, body);
	return { root, body, resize: (value: number) => (width = value) };
}
it("animates measured shape and real content independently; outgoing face has no accessible/focus/live identity", () => {
	const { root, body, resize } = setup();
	const from = controller!.snapshot();
	resize(240);
	body.innerHTML = '<button id="confirm">Confirm</button>';
	body.querySelector("button")!.focus();
	controller!.play(from);
	expect(animate).toHaveBeenCalledTimes(3);
	expect(animate.mock.calls[0]).toEqual([
		[
			{ width: "100px", height: "44px", borderRadius: "22px" },
			{ width: "240px", height: "44px", borderRadius: "22px" },
		],
		{ duration: 120, easing: "ease-out" },
	]);
	const ghost = root.querySelector<HTMLElement>("[data-morph-ghost]")!;
	expect(ghost.inert).toBe(true);
	expect(ghost.getAttribute("aria-hidden")).toBe("true");
	expect(ghost.querySelector("[id],[role],[aria-live],[data-autofocus]")).toBeNull();
	expect(ghost.querySelector("button")!.disabled).toBe(true);
	expect(root.querySelectorAll('[role="status"]').length).toBe(1);
	expect(document.activeElement?.id).toBe("confirm");
	animations[0].onfinish?.();
	expect(root.hasAttribute("data-morphing")).toBe(false);
	expect(ghost.isConnected).toBe(false);
	expect(body.style.width).toBe("");
	expect(document.activeElement?.id).toBe("confirm");
});
it("retargets interrupted paint, disposes old ghosts/animations and rejects stale completion", () => {
	const { root, resize } = setup();
	const first = controller!.snapshot();
	resize(240);
	controller!.play(first);
	const stale = animations[0].onfinish!;
	resize(170);
	const next = controller!.snapshot();
	resize(100);
	controller!.play(next);
	expect(animations.slice(0, 3).every((a) => a.cancel.mock.calls.length === 1)).toBe(true);
	expect(root.querySelectorAll("[data-morph-ghost]").length).toBe(1);
	stale();
	expect(root.hasAttribute("data-morphing")).toBe(true);
	controller!.destroy();
	expect(root.hasAttribute("data-morphing")).toBe(false);
});
it("rejects a stale before-update snapshot and clears animation on resize without waiting for finish", () => {
	const { root, body } = setup();
	const stale = controller!.snapshot();
	const current = controller!.snapshot();
	controller!.play(stale);
	expect(animate).not.toHaveBeenCalled();
	controller!.play(current);
	window.dispatchEvent(new Event("resize"));
	expect(root.hasAttribute("data-morphing")).toBe(false);
	expect(root.querySelector("[data-morph-ghost]")).toBeNull();
	expect(body.style.width).toBe("");
	expect(animations.every((a) => a.cancel.mock.calls.length === 1)).toBe(true);
});
it("reduced motion starts direct and a live preference change immediately clears an in-flight morph", () => {
	const { root } = setup();
	media.matches = true;
	expect(controller!.snapshot()).toBeUndefined();
	controller!.play(undefined);
	expect(animate).not.toHaveBeenCalled();
	media.matches = false;
	controller!.play(controller!.snapshot());
	expect(root.hasAttribute("data-morphing")).toBe(true);
	media.matches = true;
	media.dispatchEvent(new Event("change"));
	expect(root.hasAttribute("data-morphing")).toBe(false);
	expect(root.querySelector("[data-morph-ghost]")).toBeNull();
	expect(animations.every((a) => a.cancel.mock.calls.length === 1)).toBe(true);
});
