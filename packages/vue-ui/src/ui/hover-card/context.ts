import type { HoverCardController } from "@ui-sdk/vue/hover-card";
import type { InjectionKey, Ref } from "vue";

export interface HoverCardFocusContext {
	controller: Ref<HoverCardController<unknown>>;
	disabled: Ref<boolean>;
	pointerDown: { current: boolean };
	lastDismissedAt: { current: number };
}

export const HOVER_CARD_FOCUS_KEY: InjectionKey<HoverCardFocusContext> =
	Symbol("valar-hover-card-focus");
