import { aiElements, components } from "$content/index.js";
import { isPublishedBasicComponent } from "$lib/basic-component-visibility.js";
import {
	ADVANCED_CATEGORIES,
	COMPONENT_CATEGORIES,
	OTHER_CATEGORY,
} from "$lib/component-categories.js";
import type { Locale } from "$lib/i18n/config.js";
import { t } from "$lib/i18n/index.js";

export type CategoryChip = { key: string; title: string; count: number };

/** The basic components grouped by category, empty groups left out. A component with no group lands in "other". */
export function basicCategories(locale: Locale) {
	const lang = locale === "zh" ? "zh" : "en";
	const docs = components.filter(
		(doc) =>
			doc.locale === locale && doc.path !== "components" && isPublishedBasicComponent(doc.slug)
	);
	const known = new Set<string>(COMPONENT_CATEGORIES.flatMap((c) => c.slugs));
	return [...COMPONENT_CATEGORIES, { ...OTHER_CATEGORY, slugs: [] as readonly string[] }]
		.map((category) => ({
			key: category.key,
			title: category[lang],
			items: docs.filter((doc) =>
				category.key === OTHER_CATEGORY.key
					? !known.has(doc.slug)
					: (category.slugs as readonly string[]).includes(doc.slug)
			),
		}))
		.filter((category) => category.items.length);
}

/** The row of category buttons shown on a catalog page and above every component page. */
export function categoryChips(section: "basic" | "advanced", locale: Locale): CategoryChip[] {
	const lang = locale === "zh" ? "zh" : "en";
	if (section === "basic") {
		return basicCategories(locale).map((c) => ({
			key: c.key,
			title: c.title,
			count: c.items.length,
		}));
	}
	const docs = aiElements.filter((doc) => doc.locale === locale && doc.path !== "ai-elements");
	const slugs = new Set(docs.map((doc) => doc.path.split("/").pop() ?? ""));
	return [
		{ key: "all", title: t("components.all"), count: docs.length },
		...ADVANCED_CATEGORIES.map((c) => ({
			key: c.key,
			title: c[lang],
			count: c.slugs.filter((slug) => slugs.has(slug)).length,
		})),
	];
}
