import type { InjectionKey, Ref } from "vue";

export type PopoverDismissPolicy = {
	onInteractOutside?: (event: Event) => void;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

export type PopoverContextValue = {
	anchor: Ref<HTMLElement | null>;
	policy: Ref<PopoverDismissPolicy>;
};

export const POPOVER_CONTEXT_KEY: InjectionKey<PopoverContextValue> = Symbol("valar-vue-popover");

export function resolvePortalContainer(
	to: string | Element | DocumentFragment | null | undefined
): Element | DocumentFragment | null | undefined {
	if (to == null) return undefined;
	if (typeof to !== "string") return to;
	if (typeof document === "undefined") return undefined;
	return document.querySelector(to);
}
