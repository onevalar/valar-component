import type { InjectionKey, Ref } from "vue";

export const tabsContext: InjectionKey<{
	listLoop: Ref<boolean | undefined>;
	disabled: Ref<boolean>;
	unmountOnHide: Ref<boolean>;
}> = Symbol("ValarTabs");

// Keep numeric and string values distinct, including 1 and "1".
export function tabsValue(value: string | number) {
	return typeof value === "number" ? `n:${value}` : `s:${value}`;
}
