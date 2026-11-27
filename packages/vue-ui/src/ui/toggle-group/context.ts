import type { ComputedRef, InjectionKey, ToRefs } from "vue";
import type { ToggleSize, ToggleVariant } from "../toggle";

export type ToggleGroupAppearance = "default" | "toolbar";
export const toggleGroupStyle: InjectionKey<ToRefs<{
	appearance: ToggleGroupAppearance;
	size: ToggleSize;
	variant: ToggleVariant;
}> & { spacing: ComputedRef<number> }> = Symbol("ValarToggleGroupStyle");
