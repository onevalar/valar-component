// Valar adaptation of the MIT message-scroller primitive, whose geometry credits shadcn-ui/ui.
// Keep in sync with vue-ui/src/ui/message-scroller/state.ts. DOM mechanics only.
export type MessageScrollerDefaultScrollPosition = "start" | "end" | "last-anchor";
export type MessageScrollerButtonDirection = "start" | "end";
export type MessageScrollerScrollAlign = "start" | "center" | "end" | "nearest";
export type MessageScrollerScrollOptions = {
	align?: MessageScrollerScrollAlign;
	behavior?: ScrollBehavior;
	scrollMargin?: number;
};
export type MessageScrollerScrollable = { start: boolean; end: boolean };
export type MessageScrollerVisibilityState = {
	currentAnchorId: string | null;
	visibleMessageIds: string[];
};
export type MessageScrollerOptions = {
	autoScroll?: boolean;
	defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
	scrollEdgeThreshold?: number;
	scrollPreviousItemPeek?: number;
	scrollMargin?: number;
};
export type MessageScrollerCommands = {
	scrollToStart: (options?: MessageScrollerScrollOptions) => boolean;
	scrollToEnd: (options?: MessageScrollerScrollOptions) => boolean;
	scrollToMessage: (id: string, options?: MessageScrollerScrollOptions) => boolean;
};

type Listener = () => void;
export const EMPTY_EDGES: MessageScrollerScrollable = { start: false, end: false };
export const EMPTY_VISIBILITY: MessageScrollerVisibilityState = {
	currentAnchorId: null,
	visibleMessageIds: [],
};
const scrollKeys = new Set(["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "]);
const epsilon = 0.5;
const pixels = (value: string) => Number.parseFloat(value) || 0;
function findLast(rows: HTMLElement[], predicate: (row: HTMLElement) => boolean) {
	for (let i = rows.length - 1; i >= 0; i--) if (predicate(rows[i])) return rows[i];
}

export class MessageScrollerState {
	root: HTMLElement | null = null;
	viewport: HTMLElement | null = null;
	content: HTMLElement | null = null;
	spacer: HTMLElement | null = null;
	preserveScrollOnPrepend = true;
	private mode: "follow" | "free" | "anchor" | "jump" = "free";
	private anchor: HTMLElement | null = null;
	private opened = false;
	private rows: HTMLElement[] = [];
	private knownAnchors = new WeakSet<HTMLElement>();
	private readingRow?: { element: HTMLElement; id: string; offset: number };
	private pendingJump?: { id: string; options?: MessageScrollerScrollOptions };
	private edges = EMPTY_EDGES;
	private visibility = EMPTY_VISIBILITY;
	private edgeListeners = new Set<Listener>();
	private visibilityListeners = new Set<Listener>();
	private previousTop = 0;
	private spacerHeight = 0;
	private gesture = false;
	private frame = 0;
	private smoothTimer = 0;
	private pulseTimer = 0;
	private resumeFollow = false;
	private smoothTarget = 0;
	private clean?: Listener;
	private observedContent: HTMLElement | null = null;
	private observedViewport: HTMLElement | null = null;

	constructor(private options: MessageScrollerOptions) {}

	getSnapshot = () => this.edges;
	getVisibility = () => this.visibility;
	subscribe = (listener: Listener) => {
		this.edgeListeners.add(listener);
		return () => {
			this.edgeListeners.delete(listener);
		};
	};
	subscribeVisibility = (listener: Listener) => {
		this.visibilityListeners.add(listener);
		this.schedule();
		return () => {
			this.visibilityListeners.delete(listener);
			if (!this.visibilityListeners.size) this.visibility = EMPTY_VISIBILITY;
		};
	};

	setOptions(options: MessageScrollerOptions) {
		const wasAuto = this.options.autoScroll;
		this.options = options;
		if (wasAuto && !options.autoScroll && this.mode === "follow") this.mode = "free";
		if (!wasAuto && options.autoScroll && this.mode === "free" && !this.edges.end)
			this.mode = "follow";
		this.schedule();
	}

	schedule = () => {
		if (this.frame || typeof window === "undefined") return;
		this.frame = window.requestAnimationFrame(() => {
			this.frame = 0;
			this.update();
		});
	};

	connect = () => {
		if (this.content === this.observedContent && this.viewport === this.observedViewport) return;
		this.disconnect();
		const { content, viewport } = this;
		if (!content || !viewport) return;
		if (this.rows.length && !content.contains(this.rows[0])) {
			this.rows = [];
			this.opened = false;
			this.anchor = null;
			this.readingRow = undefined;
			this.mode = "free";
			this.spacerHeight = 0;
		}
		this.observedContent = content;
		this.observedViewport = viewport;
		const mutation =
			typeof MutationObserver === "undefined" ? undefined : new MutationObserver(this.schedule);
		mutation?.observe(content, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["data-message-id", "data-scroll-anchor"],
		});
		const resize =
			typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(this.schedule);
		resize?.observe(viewport);
		resize?.observe(content);
		viewport.addEventListener("scroll", this.onScroll, { passive: true });
		viewport.addEventListener("wheel", this.userIntent, { passive: true });
		viewport.addEventListener("touchmove", this.userIntent, { passive: true });
		viewport.addEventListener("keydown", this.onKey);
		this.clean = () => {
			mutation?.disconnect();
			resize?.disconnect();
			viewport.removeEventListener("scroll", this.onScroll);
			viewport.removeEventListener("wheel", this.userIntent);
			viewport.removeEventListener("touchmove", this.userIntent);
			viewport.removeEventListener("keydown", this.onKey);
		};
		this.update();
	};

	disconnect = () => {
		this.clean?.();
		this.clean = undefined;
		this.observedContent = this.observedViewport = null;
		if (this.frame) window.cancelAnimationFrame(this.frame);
		if (this.smoothTimer) window.clearTimeout(this.smoothTimer);
		if (this.pulseTimer) window.clearTimeout(this.pulseTimer);
		this.frame = this.smoothTimer = this.pulseTimer = 0;
	};

	private getRows() {
		return Array.from(this.content?.children ?? []).filter(
			(row): row is HTMLElement => row instanceof HTMLElement && row !== this.spacer
		);
	}
	private get padding() {
		const style = getComputedStyle(this.content!);
		return {
			start: pixels(style.paddingTop),
			end: pixels(style.paddingBottom),
			gap: pixels(style.rowGap),
		};
	}
	private offset(row: HTMLElement) {
		return (
			row.getBoundingClientRect().top -
			this.viewport!.getBoundingClientRect().top -
			this.viewport!.clientTop
		);
	}
	private bottom(rows = this.rows) {
		const row = rows.at(-1);
		const padding = this.padding;
		return row
			? this.offset(row) +
					this.viewport!.scrollTop +
					row.getBoundingClientRect().height +
					padding.end
			: padding.start + padding.end;
	}
	private setSpacer(height: number) {
		const next = Math.max(0, Math.ceil(height - epsilon));
		if (!this.spacer) return;
		if (this.spacerHeight !== next || this.spacer.hidden !== (next === 0)) {
			this.spacerHeight = next;
			this.spacer.hidden = next === 0;
			this.spacer.style.height = `${next}px`;
		}
		if (next) this.spacer.style.marginTop = `${-this.padding.gap}px`;
	}
	private move(top: number, behavior: ScrollBehavior = "auto", follow = false) {
		const viewport = this.viewport!;
		const target = Math.max(0, top);
		if (this.smoothTimer) window.clearTimeout(this.smoothTimer);
		this.smoothTimer = 0;
		if (
			behavior === "smooth" &&
			!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches &&
			Math.abs(target - viewport.scrollTop) > epsilon
		) {
			this.resumeFollow = follow;
			this.smoothTarget = target;
			this.mode = "jump";
			viewport.scrollTo({ top: target, behavior });
			this.smoothTimer = window.setTimeout(this.finishSmooth, 900);
		} else {
			// Explicitly instant: host `scroll-behavior: smooth` must not animate streaming or prepends.
			if (follow && Math.abs(target - viewport.scrollTop) > epsilon) {
				if (this.pulseTimer) window.clearTimeout(this.pulseTimer);
				this.pulseTimer = window.setTimeout(() => {
					this.pulseTimer = 0;
					this.publish();
				}, 180);
			}
			viewport.scrollTo({ top: target, behavior: "instant" });
		}
		this.previousTop = viewport.scrollTop;
	}
	private finishSmooth = () => {
		if (!this.smoothTimer) return;
		window.clearTimeout(this.smoothTimer);
		this.smoothTimer = 0;
		if (this.resumeFollow && this.options.autoScroll) {
			this.mode = "follow";
			this.schedule();
		}
		this.publish();
	};
	private userIntent = () => {
		const interrupt = this.smoothTimer !== 0;
		if (interrupt) window.clearTimeout(this.smoothTimer);
		if (this.pulseTimer) window.clearTimeout(this.pulseTimer);
		this.smoothTimer = this.pulseTimer = 0;
		if (interrupt && this.viewport)
			this.viewport.scrollTo({ top: this.viewport.scrollTop, behavior: "instant" });
		this.gesture = true;
		this.mode = "free";
		this.anchor = null;
	};
	private onKey = (event: KeyboardEvent) => {
		if (event.defaultPrevented || !scrollKeys.has(event.key)) return;
		if (
			event.target instanceof Element &&
			event.target.closest(
				"input, textarea, select, button, [contenteditable]:not([contenteditable=false])"
			)
		)
			return;
		this.userIntent();
	};
	private rawEdges() {
		const viewport = this.viewport!;
		const tolerance = this.options.scrollEdgeThreshold ?? 8;
		return {
			start: viewport.scrollTop > tolerance,
			end: this.bottom() - viewport.scrollTop - viewport.clientHeight > tolerance,
		};
	}
	private onScroll = () => {
		if (!this.viewport || !this.content) return;
		const top = this.viewport.scrollTop;
		const moved = Math.abs(top - this.previousTop) > epsilon;
		const { end } = this.rawEdges();
		if (this.smoothTimer && Math.abs(top - this.smoothTarget) <= 1) this.finishSmooth();
		if (
			!this.smoothTimer &&
			this.options.autoScroll &&
			this.mode !== "anchor" &&
			(this.mode !== "jump" || this.gesture)
		) {
			if (end && top < this.previousTop - epsilon) this.mode = "free";
			else if (!end && moved) this.mode = "follow";
		}
		if (
			this.mode === "anchor" &&
			moved &&
			!this.smoothTimer &&
			// Collapsing content can clamp scrollTop before ResizeObserver runs.
			top < this.viewport.scrollHeight - this.viewport.clientHeight - epsilon &&
			this.anchor &&
			this.offset(this.anchor) > this.readingLine + this.padding.start + epsilon
		)
			this.userIntent();
		this.previousTop = top;
		this.publish();
	};
	private get readingLine() {
		return (this.options.scrollMargin ?? 0) + (this.options.scrollPreviousItemPeek ?? 64);
	}

	private place(row: HTMLElement, options: MessageScrollerScrollOptions = {}, hold = false) {
		const viewport = this.viewport!;
		const padding = this.padding;
		const height = row.getBoundingClientRect().height;
		const top = this.offset(row) + viewport.scrollTop;
		const margin = hold
			? this.readingLine
			: (options.scrollMargin ?? this.options.scrollMargin ?? 0);
		const start = top - padding.start - margin;
		const end = top + height - viewport.clientHeight + padding.end + margin;
		const target =
			options.align === "end"
				? end
				: options.align === "center"
					? top -
						padding.start -
						(viewport.clientHeight - padding.start - padding.end - height) / 2 -
						margin
					: options.align === "nearest" && top >= viewport.scrollTop + padding.start
						? top + height <= viewport.scrollTop + viewport.clientHeight - padding.end
							? viewport.scrollTop
							: end
						: start;
		this.setSpacer(Math.max(0, target) + viewport.clientHeight - this.bottom());
		this.mode = hold ? "anchor" : "jump";
		this.anchor = hold ? row : null;
		this.gesture = false;
		this.move(target, options.behavior);
	}

	private update() {
		const { viewport, content } = this;
		if (!viewport || !content || !viewport.clientHeight) return;
		const previous = this.rows;
		const rows = this.getRows();
		const first = previous[0];
		const firstId = first?.dataset.messageId;
		const firstIndex = rows.findIndex(
			(row) => row === first || (firstId && row.dataset.messageId === firstId)
		);
		const prepended = firstIndex > 0;
		const newAnchors = rows.filter(
			(row, index) =>
				row.dataset.scrollAnchor === "true" &&
				!this.knownAnchors.has(row) &&
				(!prepended || index >= firstIndex)
		);
		for (const row of rows) if (row.dataset.scrollAnchor === "true") this.knownAnchors.add(row);
		this.rows = rows;
		const pendingRow =
			this.pendingJump && findLast(rows, (row) => row.dataset.messageId === this.pendingJump?.id);
		if (pendingRow) {
			this.place(pendingRow, this.pendingJump?.options);
			this.pendingJump = undefined;
		} else if (!this.opened && rows.length) {
			this.opened = true;
			const position = this.options.defaultScrollPosition ?? "end";
			const last =
				position === "last-anchor" && findLast(rows, (row) => row.dataset.scrollAnchor === "true");
			if (last && this.bottom() - this.offset(last) - viewport.scrollTop > viewport.clientHeight)
				this.place(last, undefined, true);
			else this.toEdge(position === "start" ? "start" : "end");
			// Opening at the top of an empty/short transcript can still enter follow mode.
			if (position === "start" && this.options.autoScroll && !this.rawEdges().end)
				this.mode = "follow";
		} else if (
			prepended &&
			this.preserveScrollOnPrepend &&
			this.readingRow &&
			this.mode !== "follow"
		) {
			const { element, id, offset } = this.readingRow;
			const row = rows.includes(element)
				? element
				: rows.find((candidate) => candidate.dataset.messageId === id);
			if (row) this.move(viewport.scrollTop + this.offset(row) - offset);
		} else if (
			!prepended &&
			previous.length &&
			newAnchors.length &&
			!(newAnchors.length > 1 && this.mode === "follow")
		) {
			this.place(newAnchors[0], undefined, true);
		} else if (this.mode === "anchor" && this.anchor && rows.includes(this.anchor)) {
			const previousHeight = this.spacerHeight;
			this.place(this.anchor, undefined, true);
			if (this.options.autoScroll && previousHeight > 0 && this.spacerHeight === 0)
				this.toEdge("end");
		} else if (
			this.mode === "follow" ||
			(!previous.length &&
				rows.length &&
				!this.pendingJump &&
				this.options.autoScroll &&
				this.mode === "free")
		) {
			this.toEdge("end");
		} else if (this.mode === "anchor") {
			this.anchor = null;
			this.mode = "free";
			this.setSpacer(0);
		}
		for (const element of [this.root, viewport]) element?.removeAttribute("data-pending-scroll");
		this.publish();
	}

	private publish() {
		if (!this.viewport || !this.content) return;
		const raw = this.rawEdges();
		const edges = { start: raw.start, end: this.mode === "follow" ? false : raw.end };
		for (const element of [this.root, this.viewport]) {
			const names = [edges.start && "start", edges.end && "end"].filter(Boolean).join(" ");
			if (names) element?.setAttribute("data-scrollable", names);
			else element?.removeAttribute("data-scrollable");
			element?.toggleAttribute("data-autoscrolling", !!(this.smoothTimer || this.pulseTimer));
		}
		if (edges.start !== this.edges.start || edges.end !== this.edges.end) {
			this.edges = edges;
			this.edgeListeners.forEach((listener) => listener());
		}
		const height = this.viewport.clientHeight;
		this.readingRow = undefined;
		const visibleMessageIds: string[] = [];
		let currentAnchorId: string | null = null;
		for (const row of this.rows) {
			const id = row.dataset.messageId;
			if (!id || !this.content.contains(row)) continue;
			const top = this.offset(row);
			const bottom = top + row.getBoundingClientRect().height;
			if (!this.readingRow && top < height && bottom > 0) {
				this.readingRow = { element: row, id, offset: top };
				if (!this.visibilityListeners.size) break;
			}
			if (this.visibilityListeners.size) {
				if (top < height && bottom > this.readingLine) visibleMessageIds.push(id);
				if (
					row.dataset.scrollAnchor === "true" &&
					top <= this.readingLine + this.padding.start + epsilon
				)
					currentAnchorId = id;
			}
		}
		if (
			this.visibilityListeners.size &&
			(currentAnchorId !== this.visibility.currentAnchorId ||
				visibleMessageIds.length !== this.visibility.visibleMessageIds.length ||
				visibleMessageIds.some((id, i) => id !== this.visibility.visibleMessageIds[i]))
		) {
			this.visibility = { currentAnchorId, visibleMessageIds };
			this.visibilityListeners.forEach((listener) => listener());
		}
	}

	private toEdge(
		direction: MessageScrollerButtonDirection,
		options?: MessageScrollerScrollOptions
	) {
		const viewport = this.viewport;
		if (!viewport) return false;
		this.setSpacer(0);
		this.anchor = null;
		this.gesture = false;
		const follow = direction === "end" && !!this.options.autoScroll;
		this.mode = follow ? "follow" : "free";
		this.move(
			direction === "end" ? viewport.scrollHeight - viewport.clientHeight : 0,
			options?.behavior,
			follow
		);
		return true;
	}
	readonly commands: MessageScrollerCommands = {
		scrollToStart: (options) => {
			const result = this.toEdge("start", options);
			this.publish();
			return result;
		},
		scrollToEnd: (options) => {
			const result = this.toEdge("end", options);
			this.publish();
			return result;
		},
		scrollToMessage: (id, options) => {
			const rows = this.getRows();
			const row = findLast(rows, (candidate) => candidate.dataset.messageId === id);
			if (!row && rows.length) return false;
			this.opened = true;
			if (row && this.viewport && this.content) {
				this.rows = rows;
				this.pendingJump = undefined;
				this.place(row, options);
				this.publish();
			} else {
				this.pendingJump = { id, options };
				this.schedule();
			}
			return true;
		},
	};
}
