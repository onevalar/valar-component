import { getContext, setContext } from "svelte";

const MENUBAR_APPEARANCE = Symbol("menubar-appearance");

export type MenubarAppearance = "default" | "navigation";

export function setMenubarAppearance(getAppearance: () => MenubarAppearance) {
	setContext(MENUBAR_APPEARANCE, getAppearance);
}

export function getMenubarAppearance() {
	return (
		getContext<(() => MenubarAppearance) | undefined>(MENUBAR_APPEARANCE) ??
		((): MenubarAppearance => "default")
	);
}

export const navigationPanelClass =
	"w-max min-w-[min(9rem,var(--bits-floating-available-width,100dvw),calc(100dvw-1rem))] max-w-[min(var(--bits-floating-available-width,100dvw),calc(100dvw-1rem))] rounded-[14px] border border-border bg-popover/95 p-2 text-popover-foreground shadow-[0_8px_32px_rgb(8_9_10/.14)] backdrop-blur-xl data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-[220ms] motion-reduce:animate-none! dark:border-white/[.08] dark:bg-[rgb(8_9_10/.9)] dark:shadow-[0_8px_32px_#08090a]";
