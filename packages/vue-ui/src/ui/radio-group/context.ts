import type { InjectionKey, Ref } from "vue";

export const radioGroupReadonly: InjectionKey<Readonly<Ref<boolean>>> = Symbol("ValarRadioGroupReadonly");
