import type { InjectionKey } from "vue";

export const SELECT_GROUP_KEY: InjectionKey<boolean> = Symbol("valar-vue-select-group");

export function resolvePortalContainer(
	to: string | Element | DocumentFragment | null | undefined
): Element | DocumentFragment | null | undefined {
	if (to == null) return undefined;
	if (typeof to !== "string") return to;
	if (typeof document === "undefined") return undefined;
	return document.querySelector(to);
}

export function revealHighlightedOption(container: HTMLElement | null) {
	if (!container || container.scrollHeight <= container.clientHeight) return;
	const el = container.querySelector<HTMLElement>("[data-highlighted]");
	if (!el) return;
	const containerRect = container.getBoundingClientRect();
	const elRect = el.getBoundingClientRect();
	const scaleY = container.offsetHeight > 0 ? containerRect.height / container.offsetHeight : 1;
	const safeScaleY = scaleY > 0.1 ? scaleY : 1;
	const top =
		(elRect.top - containerRect.top) / safeScaleY - container.clientTop + container.scrollTop;
	const bottom = top + el.offsetHeight;
	const pad = 4;
	if (top - pad < container.scrollTop) {
		container.scrollTop = Math.max(0, top - pad);
	} else if (bottom + pad > container.scrollTop + container.clientHeight) {
		container.scrollTop = Math.min(
			container.scrollHeight - container.clientHeight,
			bottom + pad - container.clientHeight
		);
	}
}

export function observeHighlightedReveal(container: HTMLElement): () => void {
	const sync = () => revealHighlightedOption(container);
	const observer = new MutationObserver(sync);
	observer.observe(container, {
		attributes: true,
		attributeFilter: ["data-highlighted"],
		subtree: true,
	});
	container.addEventListener("animationend", sync);
	return () => {
		observer.disconnect();
		container.removeEventListener("animationend", sync);
	};
}
