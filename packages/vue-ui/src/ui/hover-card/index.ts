import { HoverCardTrigger as Trigger } from "reka-ui";
import { styledPart } from "../dropdown-menu/parts.js";

export { HoverCardRoot as HoverCard, HoverCardPortal } from "reka-ui";
export { default as HoverCardContent } from "./HoverCardContent.vue";
export const HoverCardTrigger = styledPart(
	Trigger,
	"hover-card-trigger",
	"rounded-sm focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
);
