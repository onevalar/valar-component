import { stripLocale } from "./i18n/config.js";

// Complex business modules live in the Advanced Components gallery rather than the Basic catalog.
export const ADVANCED_MODULE_SLUGS = new Set(["issue-composer", "issue-detail"]);

export function isAdvancedModuleSlug(slug: string): boolean {
	return ADVANCED_MODULE_SLUGS.has(slug);
}

// A slug is marked aligned once its applicable states and usages have passed Linear / Valar unification review.
const alignedSlugs = new Set([
	"accordion",
	"alert",
	"alert-dialog",
	"aspect-ratio",
	"attachment",
	"avatar",
	"badge",
	"breadcrumb",
	"bubble",
	"button",
	"button-group",
	"calendar",
	"card",
	"carousel",
	"chart",
	"checkbox",
	"code-block",
	"collapsible",
	"color-picker",
	"combobox",
	"command",
	"context-menu",
	"data-table",
	"date-picker",
	"dialog",
	"donut-chart",
	"drawer",
	"dropdown-menu",
	"empty",
	"field",
	"form",
	"gauge",
	"hover-card",
	"input",
	"input-group",
	"input-otp",
	"item",
	"kbd",
	"label",
	"marker",
	"menubar",
	"message",
	"message-scroller",
	"native-select",
	"navigation-menu",
	"number-field",
	"pagination",
	"popover",
	"progress",
	"questionnaire",
	"radio-group",
	"range-calendar",
	"resizable",
	"ruler-slider",
	"scroll-area",
	"select",
	"separator",
	"sheet",
	"sidebar",
	"skeleton",
	"slider",
	"slider-field",
	"sonner",
	"sparkline",
	"spinner",
	"stepper",
	"switch",
	"table",
	"tabs",
	"tags-input",
	"textarea",
	"texture-fill",
	"tick-meter",
	"toggle",
	"toggle-group",
	"tooltip",
	"trace",
	"typography",
	"waffle-chart",
]);

// Existing implementation or scenario evidence awaiting a complete component review.
const partialSlugs = new Set<string>([]);

export function basicComponentAlignment(slug: string): "aligned" | "partial" | "pending" {
	if (alignedSlugs.has(slug)) return "aligned";
	return partialSlugs.has(slug) ? "partial" : "pending";
}

export function isPublishedBasicComponent(slug: string): boolean {
	return !ADVANCED_MODULE_SLUGS.has(slug);
}

/** Technical links to draft pages work, but public component discovery omits those pages. */
export function isUnpublishedBasicComponentHref(href: string): boolean {
	const [path] = href.split(/[?#]/, 1);
	const slug = /^\/docs\/components\/([^/]+)\/?$/.exec(stripLocale(path))?.[1];
	return slug !== undefined && !isPublishedBasicComponent(slug);
}
