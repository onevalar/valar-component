import { styleToString, type StyleProperties } from "svelte-toolbelt";
import { createAttachmentKey } from "svelte/attachments";

export type PopoverDismissPolicy = {
	interactOutsideBehavior?: "close" | "defer-otherwise-close" | "defer-otherwise-ignore" | "ignore";
	escapeKeydownBehavior?: "close" | "defer-otherwise-close" | "defer-otherwise-ignore" | "ignore";
	onInteractOutside?: (event: Event) => void;
	onEscapeKeydown?: (event: KeyboardEvent) => void;
};

export type PopoverPolicyContext = {
	set: (policy: PopoverDismissPolicy) => void;
};

export const POPOVER_POLICY_KEY = Symbol("valar-popover-policy");

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
