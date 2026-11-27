import type { InjectionKey, ToRefs } from "vue";

export const tabsContext: InjectionKey<ToRefs<{
	loop: boolean;
	disabled: boolean;
	orientation: "horizontal" | "vertical";
}>> = Symbol("ValarTabs");
