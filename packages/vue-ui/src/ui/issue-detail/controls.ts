import type { InjectionKey } from "vue";

export const issuePortal: InjectionKey<{ to: string }> = Symbol("Issue Detail portal");
export const iconControl =
	"inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent [&_svg]:size-3.5";
