import type { InjectionKey } from "vue";

export type NativeSelectValue = string | string[];
export const initialSelection: InjectionKey<NativeSelectValue | undefined> = Symbol("ValarNativeSelectInitialValue");
