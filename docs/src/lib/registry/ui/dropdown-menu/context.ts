import { styleToString, type StyleProperties } from "svelte-toolbelt";
import { createAttachmentKey } from "svelte/attachments";

export type MenuDismissBehavior =
	| "close"
	| "ignore"
	| "defer-otherwise-close"
	| "defer-otherwise-ignore";

export type MenuDismissPolicy = {
	interactOutsideBehavior?: MenuDismissBehavior;
	escapeKeydownBehavior?: MenuDismissBehavior;
	trapFocus?: boolean;
	onInteractOutside?: (event: Event) => void;
	onEscapeKeydown?: (event: KeyboardEvent) => void;
};

export type MenuPolicyContext = {
	set(policy: MenuDismissPolicy): void;
};

export type MenuCheckboxGroupContext = {
	readonly value: string[];
	setChecked(item: string, checked: boolean): void;
};

export const MENU_POLICY_KEY = Symbol("valar-menu-policy");
export const MENU_SUB_POLICY_KEY = Symbol("valar-menu-sub-policy");
export const IN_MENU_GROUP_KEY = Symbol("valar-in-menu-group");
export const MENU_CHECKBOX_GROUP_KEY = Symbol("valar-menu-checkbox-group");

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
