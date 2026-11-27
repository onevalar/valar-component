import type { InjectionKey, Ref } from "vue";

export type DialogDismissPolicy = {
	onInteractOutside?: (event: Event) => void;
	onPointerDownOutside?: (event: Event) => void;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
};

export type DialogContextValue = {
	policy: Ref<DialogDismissPolicy>;
	modal: Ref<boolean | "trap-focus">;
};

export const DIALOG_CONTEXT_KEY: InjectionKey<DialogContextValue> = Symbol("valar-vue-dialog");

export function resolvePortalContainer(
	to: string | Element | DocumentFragment | null | undefined
): Element | DocumentFragment | null | undefined {
	if (to == null) return undefined;
	if (typeof to !== "string") return to;
	if (typeof document === "undefined") return undefined;
	return document.querySelector(to);
}
