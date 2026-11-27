import type { Snippet } from "svelte";
import { createAttachmentKey } from "svelte/attachments";
import { styleToString } from "svelte-toolbelt";

export const tabsContext = Symbol("valar-tabs");

export type TabsElementProps<Attributes> = Omit<Attributes, "style"> & {
	ref?: HTMLElement | null;
	style?: string | null | Parameters<typeof styleToString>[0];
	child?: Snippet<[{ props: Record<string, unknown> }]>;
};

export function tabsElementRef(set: (element: HTMLElement | null) => void) {
	return { [createAttachmentKey()]: (element: HTMLElement) => {
		set(element);
		return () => set(null);
	} };
}

export function tabsStyle(style: TabsElementProps<object>["style"]) {
	return style && typeof style === "object" ? styleToString(style) : style;
}
