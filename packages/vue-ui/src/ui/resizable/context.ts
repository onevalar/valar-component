import type { InjectionKey } from "vue";

export interface PaneCommands {
	collapse: () => void;
	expand: () => void;
	isCollapsed: () => boolean;
}

export const paneCommands: InjectionKey<Map<string, PaneCommands>> = Symbol("ValarPaneCommands");
