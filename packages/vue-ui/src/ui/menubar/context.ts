import type { InjectionKey, Ref } from "vue";

export interface MenubarValueContext {
	value: Ref<string>;
	isControlled: Ref<boolean>;
	onMenuOpenChange: (menuValue: string, open: boolean) => void;
}

export const MENUBAR_VALUE_KEY: InjectionKey<MenubarValueContext> = Symbol("ValarMenubarValue");
