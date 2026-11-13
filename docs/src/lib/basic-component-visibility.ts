import { stripLocale } from "./i18n/config.js";

// A slug enters the catalog once its applicable states and usages have passed alignment review.
const alignedSlugs = new Set([
	"alert-dialog",
	"avatar",
	"breadcrumb",
	"button",
	"calendar",
	"card",
	"checkbox",
	"collapsible",
	"combobox",
	"command",
	"context-menu",
	"date-picker",
	"dialog",
	"dropdown-menu",
	"empty",
	"field",
	"hover-card",
	"input",
	"input-group",
	"item",
	"kbd",
	"label",
	"popover",
	"scroll-area",
	"select",
	"separator",
	"sheet",
	"sidebar",
	"switch",
	"table",
	"tabs",
	"textarea",
	"tooltip",
]);

// Existing implementation or scenario evidence awaiting a complete component review.
const partialSlugs = new Set([
	"alert",
	"badge",
	"button-group",
	"progress",
	"resizable",
	"sonner",
	"toggle-group",
]);

export function basicComponentAlignment(slug: string): "aligned" | "partial" | "pending" {
	if (alignedSlugs.has(slug)) return "aligned";
	return partialSlugs.has(slug) ? "partial" : "pending";
}

export function isPublishedBasicComponent(slug: string): boolean {
	return alignedSlugs.has(slug);
}

/** Technical links to draft pages work, but public component discovery omits those pages. */
export function isUnpublishedBasicComponentHref(href: string): boolean {
	const [path] = href.split(/[?#]/, 1);
	const slug = /^\/docs\/components\/([^/]+)\/?$/.exec(stripLocale(path))?.[1];
	return slug !== undefined && !isPublishedBasicComponent(slug);
}
