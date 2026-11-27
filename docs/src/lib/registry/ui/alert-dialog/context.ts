import { styleToString, type StyleProperties } from "svelte-toolbelt";
import { createAttachmentKey } from "svelte/attachments";

export const ALERT_DIALOG_POLICY_KEY = Symbol("valar-alert-dialog-policy");

export type AlertDialogDismissBehavior =
	| "close"
	| "ignore"
	| "defer-otherwise-close"
	| "defer-otherwise-ignore";

export type AlertDialogDismissPolicy = {
	interactOutsideBehavior?: AlertDialogDismissBehavior;
	escapeKeydownBehavior?: AlertDialogDismissBehavior;
	onInteractOutside?: (event: Event) => void;
	onEscapeKeydown?: (event: KeyboardEvent) => void;
	trapFocus?: boolean;
};

export type AlertDialogPolicyContext = {
	set(policy: AlertDialogDismissPolicy): void;
	isOpen(): boolean;
	isModal(): boolean;
};

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
