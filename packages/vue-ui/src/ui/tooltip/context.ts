import type { TooltipController } from "@ui-sdk/vue/tooltip";
import type { InjectionKey, Ref } from "vue";

export interface TooltipProviderContext {
	delayDuration: Ref<number>;
	disabled: Ref<boolean>;
}

export interface TooltipFocusContext {
	controller: Ref<TooltipController<unknown>>;
	disabled: Ref<boolean>;
	pointerDown: { current: boolean };
	lastDismissedAt: { current: number };
}

export const TOOLTIP_PROVIDER_KEY: InjectionKey<TooltipProviderContext> =
	Symbol("valar-tooltip-provider");

export const TOOLTIP_DISABLED_KEY: InjectionKey<Ref<boolean>> =
	Symbol("valar-tooltip-disabled");

export const TOOLTIP_FOCUS_KEY: InjectionKey<TooltipFocusContext> =
	Symbol("valar-tooltip-focus");

export function resolvePortalContainer(
	to: string | Element | DocumentFragment | null | undefined
): Element | DocumentFragment | null | undefined {
	if (to == null) return undefined;
	if (typeof to !== "string") return to;
	if (typeof document === "undefined") return undefined;
	return document.querySelector(to);
}
