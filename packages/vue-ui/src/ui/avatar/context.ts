import type { AvatarLoadingStatus } from "@ui-sdk/vue/avatar";
import type { InjectionKey, Ref } from "vue";

export const avatarStatus: InjectionKey<Ref<AvatarLoadingStatus>> = Symbol("avatar-status");
