import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AvatarFixture from "./fixtures/avatar.svelte";

let app: ReturnType<typeof mount> | undefined;
let requests: HTMLImageElement[];

beforeEach(() => {
	vi.useFakeTimers();
	requests = [];
	// jsdom does not load images. Deliver browser load/error events explicitly,
	// including late events from superseded requests.
	vi.stubGlobal(
		"Image",
		class {
			constructor() {
				const image = document.createElement("img");
				requests.push(image);
				return image;
			}
		}
	);
});

afterEach(async () => {
	if (app) await unmount(app);
	app = undefined;
	document.body.innerHTML = "";
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

function render(delayMs = 0) {
	const target = document.createElement("div");
	document.body.append(target);
	const fixture = mount(AvatarFixture, { target, props: { delayMs } });
	app = fixture;
	flushSync();
	return fixture;
}

async function finish(image: HTMLImageElement, event: "load" | "error", elapsed = 0) {
	image.dispatchEvent(new Event(event));
	await vi.advanceTimersByTimeAsync(elapsed);
	flushSync();
}

function expectState(status: string) {
	expect(document.querySelector("output")?.textContent).toBe(status);
	for (const slot of ["avatar", "avatar-image", "avatar-fallback"]) {
		expect(document.querySelector(`[data-slot="${slot}"]`)?.getAttribute("data-status")).toBe(
			status
		);
	}
	expect(getComputedStyle(document.querySelector('[data-slot="avatar-image"]')!).display).toBe(
		status === "loaded" ? "block" : "none"
	);
	expect(
		getComputedStyle(document.querySelector('[data-slot="avatar-fallback"]')!).display === "none"
	).toBe(status === "loaded");
}

it("reloads changed sources on the same Root, shows fallback on failure and recovers", async () => {
	const fixture = render();
	const root = document.querySelector('[data-slot="avatar"]');
	const image = document.querySelector('[data-slot="avatar-image"]');
	await finish(requests.at(-1)!, "load");
	expectState("loaded");

	fixture.setSource("data:image/png;base64,broken");
	flushSync();
	expectState("loading");
	await finish(requests.at(-1)!, "error");
	expectState("error");

	fixture.setSource("/avatars/02.png");
	flushSync();
	expectState("loading");
	await finish(requests.at(-1)!, "load");
	expectState("loaded");

	fixture.setSource("");
	flushSync();
	expectState("error");
	fixture.setSource("/avatars/01.png");
	flushSync();
	await finish(requests.at(-1)!, "load");
	expectState("loaded");
	expect(document.querySelector('[data-slot="avatar"]')).toBe(root);
	expect(document.querySelector('[data-slot="avatar-image"]')).toBe(image);
});

it("ignores old loads, errors and delayed success after a source change or unmount", async () => {
	const fixture = render(80);
	const first = requests.at(-1)!;
	await finish(first, "load", 30);
	expectState("loading");
	fixture.setSource("/avatars/02.png");
	flushSync();
	const second = requests.at(-1)!;
	await finish(first, "load", 100);
	await finish(first, "error");
	expectState("loading");
	await finish(second, "error");
	expectState("error");

	fixture.setSource("/avatars/03.png");
	flushSync();
	const third = requests.at(-1)!;
	await finish(third, "load", 79);
	expectState("loading");
	await vi.advanceTimersByTimeAsync(1);
	flushSync();
	expectState("loaded");

	fixture.setSource("/avatars/04.png");
	flushSync();
	const pending = requests.at(-1)!;
	await finish(pending, "load", 10);
	await unmount(app!);
	app = undefined;
	await finish(pending, "load", 100);
	await finish(pending, "error");
	expect(document.querySelector('[data-slot="avatar"]')).toBeNull();
});
