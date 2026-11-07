import { components } from "$content/index.js";
import { COMPONENT_CATEGORIES, OTHER_CATEGORY } from "$lib/component-categories.js";
import type { Locale } from "$lib/i18n/config.js";

// What the catalog and the AI assistant know about each component, read from each component's
// meta.json in registry/ui and from the docs titles.
type RegistryMeta = {
	name: string;
	title?: string;
	description?: string;
	meta?: {
		valar?: {
			keywords?: string[];
			whenToUse?: string[];
			whenNotToUse?: { case: string; use: string }[];
			accessibility?: string[];
			responsive?: string[];
			related?: string[];
		};
	};
};

export type ComponentInfo = {
	slug: string;
	/** PascalCase name as written in code, e.g. `AlertDialog`. */
	codeName: string;
	title: string;
	description: string;
	category: string;
	keywords: string[];
	whenToUse: string[];
	whenNotToUse: { case: string; use: string }[];
	accessibility: string[];
	responsive: string[];
	related: string[];
};

const metaModules = import.meta.glob<RegistryMeta>("../registry/ui/*/meta.json", {
	eager: true,
	import: "default",
});

const metaBySlug = new Map(Object.values(metaModules).map((meta) => [meta.name, meta] as const));

const categoryBySlug = new Map<string, string>(
	COMPONENT_CATEGORIES.flatMap((category) =>
		category.slugs.map((slug) => [slug, category.key] as const)
	)
);

export function toCodeName(slug: string): string {
	return slug
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

export function getComponentInfos(locale: Locale): ComponentInfo[] {
	return components
		.filter((doc) => doc.locale === locale && doc.path !== "components")
		.map((doc) => {
			const valar = metaBySlug.get(doc.slug)?.meta?.valar;
			return {
				slug: doc.slug,
				codeName: toCodeName(doc.slug),
				title: doc.title,
				description: doc.description ?? "",
				category: categoryBySlug.get(doc.slug) ?? OTHER_CATEGORY.key,
				keywords: valar?.keywords ?? [],
				whenToUse: valar?.whenToUse ?? [],
				whenNotToUse: valar?.whenNotToUse ?? [],
				accessibility: valar?.accessibility ?? [],
				responsive: valar?.responsive ?? [],
				related: valar?.related ?? [],
			};
		});
}

/** Latin words of 2+ letters, plus every pair of adjacent Chinese characters (or the single character). */
export function tokenize(text: string): string[] {
	const lower = text.toLowerCase();
	const terms = new Set<string>(lower.match(/[a-z0-9]{2,}/g) ?? []);
	for (const run of lower.match(/[\u4e00-\u9fff]+/g) ?? []) {
		if (run.length === 1) terms.add(run);
		for (let i = 0; i < run.length - 1; i++) terms.add(run.slice(i, i + 2));
	}
	return [...terms];
}

/** Ranks components for a free-text question such as "带搜索的下拉框" or "6 位验证码". */
export function searchComponents(
	infos: ComponentInfo[],
	query: string,
	limit = 8
): { info: ComponentInfo; score: number }[] {
	const terms = tokenize(query);
	if (!terms.length) return [];

	const fields = (info: ComponentInfo) =>
		[
			[`${info.slug} ${info.codeName} ${info.title}`, 10],
			[info.keywords.join(" "), 6],
			[info.whenToUse.join(" "), 4],
			[info.description, 3],
			[info.whenNotToUse.map((item) => item.case).join(" "), 1],
		] as const;

	const haystacks = infos.map((info) =>
		fields(info).map(([text, weight]) => [text.toLowerCase(), weight] as const)
	);

	// A term found in many components ("输入") says little; a rare one ("验证") says a lot.
	const idf = new Map(
		terms.map((term) => {
			const df = haystacks.filter((fs) => fs.some(([text]) => text.includes(term))).length;
			return [term, Math.log(1 + infos.length / Math.max(df, 1))] as const;
		})
	);

	const ranked = infos
		.map((info, i) => {
			let score = 0;
			for (const term of terms) {
				for (const [text, weight] of haystacks[i]) {
					if (text.includes(term)) score += weight * (idf.get(term) ?? 1);
				}
			}
			return { info, score };
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score);

	// Short Chinese words ("输入") match many components by accident; drop results far behind the best one.
	const best = ranked[0]?.score ?? 0;
	return ranked.filter((item) => item.score >= best * 0.5).slice(0, limit);
}
