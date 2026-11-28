import type { TooltipController } from "@ui-sdk/svelte/tooltip";
import { styleToString, type StyleProperties } from "svelte-toolbelt";
import { createAttachmentKey } from "svelte/attachments";

export type TooltipProviderContext = {
	readonly delayDuration: number;
	readonly skipDelayDuration: number;
	readonly disabled: boolean;
	isWarm(): boolean;
	notifyOpen(open: boolean): void;
};

export type TooltipFocusContext = {
	readonly controller: TooltipController<unknown>;
	readonly disabled: boolean;
	pointerDown: boolean;
	pointerEnteredAt: number;
	openedByHoverTimer: boolean;
	lastDismissedAt: number;
	cancelPendingHoverOpen(): void;
};

export const TOOLTIP_FOCUS_KEY = Symbol("valar-tooltip-focus");

export type TooltipDismissBehavior =
	| "close"
	| "ignore"
	| "defer-otherwise-close"
	| "defer-otherwise-ignore";

export type TooltipDismissPolicy = {
	interactOutsideBehavior?: TooltipDismissBehavior;
	escapeKeydownBehavior?: TooltipDismissBehavior;
	onInteractOutside?: (event: Event) => void;
	onEscapeKeydown?: (event: KeyboardEvent) => void;
};

export type TooltipPolicyContext = {
	set(policy: TooltipDismissPolicy): void;
	readonly disabled: boolean;
};

export const TOOLTIP_PROVIDER_KEY = Symbol("valar-tooltip-provider");
export const TOOLTIP_POLICY_KEY = Symbol("valar-tooltip-policy");

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
