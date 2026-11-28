import type { HoverCardController } from "@ui-sdk/svelte/hover-card";
import { styleToString, type StyleProperties } from "svelte-toolbelt";
import { createAttachmentKey } from "svelte/attachments";

export type HoverCardFocusContext = {
	readonly controller: HoverCardController<unknown>;
	readonly disabled: boolean;
	pointerDown: boolean;
	lastDismissedAt: number;
};

export const HOVER_CARD_FOCUS_KEY = Symbol("valar-hover-card-focus");

export type HoverCardDismissBehavior =
	| "close"
	| "ignore"
	| "defer-otherwise-close"
	| "defer-otherwise-ignore";

export type HoverCardDismissPolicy = {
	interactOutsideBehavior?: HoverCardDismissBehavior;
	escapeKeydownBehavior?: HoverCardDismissBehavior;
	onInteractOutside?: (event: Event) => void;
	onEscapeKeydown?: (event: KeyboardEvent) => void;
};

export type HoverCardPolicyContext = {
	set(policy: HoverCardDismissPolicy): void;
};

export const HOVER_CARD_POLICY_KEY = Symbol("valar-hover-card-policy");

export function toStyleString(style: StyleProperties | string | null | undefined): string | undefined {
	if (!style) return undefined;
	return typeof style === "object" ? styleToString(style) : style;
}

export function resolvePortalContainer(
	to: string | Element | DocumentFragment | null | undefined
): Element | DocumentFragment | null | undefined {
	if (to == null) return undefined;
	if (typeof to !== "string") return to;
	if (typeof document === "undefined") return undefined;
	return document.querySelector(to);
}

export function bindElementRef<T extends HTMLElement = HTMLElement>(
	onRef: (element: T | null) => void
) {
	const key = createAttachmentKey();
	return {
		[key]: (element: T) => {
			onRef(element);
			return () => {
				onRef(null);
			};
		},
	};
}
