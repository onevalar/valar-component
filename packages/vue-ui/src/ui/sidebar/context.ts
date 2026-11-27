import { inject, type ComputedRef, type InjectionKey, type Ref, type ShallowRef } from "vue";

export const SIDEBAR_COOKIE_NAME = "sidebar_state";

export type SidebarState = {
	open: ComputedRef<boolean>;
	state: ComputedRef<"expanded" | "collapsed">;
	setOpen: (value: boolean) => void;
	openMobile: Ref<boolean>;
	setOpenMobile: (value: boolean) => void;
	appearance: ComputedRef<"default" | "workspace">;
	isMobile: Ref<boolean>;
	toggle: (opener?: HTMLElement) => void;
	mobileOpener: ShallowRef<HTMLElement | null>;
};

export const sidebarKey: InjectionKey<SidebarState> = Symbol("Sidebar");

export function useSidebar() {
	const state = inject(sidebarKey);
	if (!state) throw new Error("Sidebar parts require a SidebarProvider");
	return state;
}
