import { stripLocale } from "./i18n/config.js";

// Components enter the catalog after their applicable states and usages pass review.
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
	"drawer",
	"dropdown-menu",
	"empty",
	"field",
	"gauge",
	"hover-card",
	"input",
	"input-group",
	"item",
	"issue-composer",
	"issue-detail",
	"kbd",
	"label",
	"marker",
	"menubar",
	"message",
	"message-scroller",
	"native-select",
	"navigation-menu",
	"number-field",
	"popover",
	"questionnaire",
	"radio-group",
	"range-calendar",
	"resizable",
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
	"stepper",
	"switch",
	"table",
	"tabs",
	"textarea",
	"toggle",
	"toggle-group",
	"tooltip",
	"typography",
]);

// Valar designs reviewed against the same library-wide rules.
const valarSlugs = new Set([
	"donut-chart",
	"input-otp",
	"pagination",
	"progress",
	"ruler-slider",
	"spinner",
	"tags-input",
	"texture-fill",
	"tick-meter",
	"trace",
	"waffle-chart",
]);

export function basicComponentAlignment(
	slug: string
): "aligned" | "valar" | "pending" {
	if (alignedSlugs.has(slug)) return "aligned";
	if (valarSlugs.has(slug)) return "valar";
	return "pending";
}

export function isPublishedBasicComponent(slug: string): boolean {
	const status = basicComponentAlignment(slug);
	return status === "aligned" || status === "valar";
}

/** Technical links to draft pages work, but public component discovery omits those pages. */
export function isUnpublishedBasicComponentHref(href: string): boolean {
	const [path] = href.split(/[?#]/, 1);
	const slug = /^\/docs\/components\/([^/]+)\/?$/.exec(stripLocale(path))?.[1];
	return slug !== undefined && !isPublishedBasicComponent(slug);
}
