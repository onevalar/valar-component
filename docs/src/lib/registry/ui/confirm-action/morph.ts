// Independently authored Valar state-shape feedback. No Arc code, CSS or motion parameters.
// Geometry is measured around Svelte's DOM update; state, events and focus never await animation.
type Snapshot = {
	revision: number;
	width: number;
	height: number;
	radius: number;
	content: HTMLDivElement;
	contentWidth: number;
	top: number;
};
export function createConfirmMorph(root: HTMLDivElement, content: HTMLDivElement) {
	const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
	let animations: Animation[] = [];
	let ghost: HTMLDivElement | undefined;
	let revision = 0;
	let destroyed = false;
	function stop() {
		revision++;
		for (const animation of animations) animation.cancel();
		animations = [];
		ghost?.remove();
		ghost = undefined;
		content.style.removeProperty("width");
		content.style.removeProperty("flex-shrink");
		delete root.dataset.morphing;
	}
	function radius(rect: DOMRect) {
		// Normalize a pill's large CSS radius to its actually painted radius before interpolation.
		return Math.min(
			parseFloat(getComputedStyle(root).borderTopLeftRadius) || 0,
			rect.width / 2,
			rect.height / 2
		);
	}
	function snapshot(): Snapshot | undefined {
		if (destroyed || preference?.matches || typeof root.animate !== "function") return;
		const rect = root.getBoundingClientRect();
		const body = content.getBoundingClientRect();
		const copy = content.cloneNode(true) as HTMLDivElement;
		// This is a visual-only outgoing face, never another live region, form field or focus target.
		for (const node of [copy, ...copy.querySelectorAll<HTMLElement>("*")]) {
			for (const attribute of [...node.attributes]) {
				if (
					/^(id|name|for|role|tabindex|href)$/.test(attribute.name) ||
					/^(aria-|data-)/.test(attribute.name)
				)
					node.removeAttribute(attribute.name);
			}
			if (node.matches("button,input,select,textarea")) node.setAttribute("disabled", "");
		}
		copy.inert = true;
		copy.setAttribute("aria-hidden", "true");
		copy.dataset.morphGhost = "";
		copy.style.opacity = getComputedStyle(content).opacity;
		const from = {
			revision: revision + 1,
			width: rect.width,
			height: rect.height,
			radius: radius(rect),
			content: copy,
			contentWidth: body.width,
			top: body.top - rect.top,
		};
		stop();
		return from;
	}
	function play(from: Snapshot | undefined) {
		if (!from || destroyed || preference?.matches || from.revision !== revision) return;
		const to = root.getBoundingClientRect();
		const body = content.getBoundingClientRect();
		const toRadius = radius(to);
		const token = revision;
		root.dataset.morphing = "";
		// Keep real controls at natural size: no text scaling, clipping, disabled interval or focus clone.
		content.style.width = `${body.width}px`;
		content.style.flexShrink = "0";
		ghost = from.content;
		Object.assign(ghost.style, {
			position: "absolute",
			pointerEvents: "none",
			margin: "0",
			left: `calc(50% - ${from.contentWidth / 2}px)`,
			top: `${from.top}px`,
			width: `${from.contentWidth}px`,
		});
		root.append(ghost);
		const shape = root.animate(
			[
				{ width: `${from.width}px`, height: `${from.height}px`, borderRadius: `${from.radius}px` },
				{ width: `${to.width}px`, height: `${to.height}px`, borderRadius: `${toRadius}px` },
			],
			{ duration: 120, easing: "ease-out" }
		);
		const incoming = content.animate(
			[
				{ opacity: 0.4, transform: "translateY(2px)" },
				{ opacity: 1, transform: "translateY(0)" },
			],
			{ duration: 80, easing: "ease-out" }
		);
		const outgoing = ghost.animate([{ opacity: Number(ghost.style.opacity) }, { opacity: 0 }], {
			duration: 60,
			easing: "linear",
			fill: "forwards",
		});
		animations = [shape, incoming, outgoing];
		shape.onfinish = () => {
			if (!destroyed && revision === token) stop();
		};
	}
	const changed = () => {
		if (preference?.matches) stop();
	};
	preference?.addEventListener("change", changed);
	window.addEventListener("resize", stop);
	return {
		snapshot,
		play,
		destroy() {
			destroyed = true;
			stop();
			preference?.removeEventListener("change", changed);
			window.removeEventListener("resize", stop);
		},
	};
}
