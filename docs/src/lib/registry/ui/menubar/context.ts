import { styleToString, type StyleProperties } from "svelte-toolbelt";
import { createAttachmentKey } from "svelte/attachments";

export type MenubarDismissBehavior =
	| "close"
	| "ignore"
	| "defer-otherwise-close"
	| "defer-otherwise-ignore";

export type MenubarDismissPolicy = {
	interactOutsideBehavior?: MenubarDismissBehavior;
	escapeKeydownBehavior?: MenubarDismissBehavior;
	onInteractOutside?: (event: Event) => void;
	onEscapeKeydown?: (event: KeyboardEvent) => void;
};

export type MenubarPolicyContext = {
	set(policy: MenubarDismissPolicy): void;
};

export type MenubarValueContext = {
	readonly value: string | undefined;
	readonly isControlled: boolean;
	onMenuOpenChange(menuValue: string, open: boolean): void;
};

export const MENUBAR_VALUE_KEY = Symbol("valar-menubar-value");
export const MENUBAR_POLICY_KEY = Symbol("valar-menubar-policy");
export const MENUBAR_SUB_POLICY_KEY = Symbol("valar-menubar-sub-policy");
export const IN_MENUBAR_GROUP_KEY = Symbol("valar-in-menubar-group");

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

export function skipDisabledMenuItems(menuEl: HTMLElement | null, key: string) {
	if (!menuEl) return;
	const step =
		key === "ArrowDown" || key === "Home" || key === "PageUp"
			? 1
			: key === "ArrowUp" || key === "End" || key === "PageDown"
				? -1
				: 0;
	if (!step) return;
	queueMicrotask(() => {
		const active = document.activeElement as HTMLElement | null;
		if (!active || !menuEl.contains(active) || active.getAttribute("aria-disabled") !== "true") {
			return;
		}
		const items = [
			...menuEl.querySelectorAll<HTMLElement>(
				'[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]'
			),
		].filter((item) => item.closest('[role="menu"]') === menuEl);
		const start = items.indexOf(active);
		if (start === -1 || items.length < 2) return;
		for (let offset = 1; offset < items.length; offset++) {
			const candidate = items[(start + offset * step + items.length) % items.length];
			if (candidate.getAttribute("aria-disabled") !== "true") {
				candidate.focus({ preventScroll: true });
				return;
			}
		}
	});
}
