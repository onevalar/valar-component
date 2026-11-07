import type { Locale } from "$lib/i18n/config.js";
import { tokenize } from "./knowledge.js";
/** Everything on the site that is not a component card: documentation pages and example source. Server only. */

const searchModules = import.meta.glob("../../routes/api/search.json/search.json", {
	eager: true,
	import: "default",
});
const searchData = Object.values(searchModules)[0] ?? [];

const docModules = import.meta.glob("../../../content/**/*.md", {
	query: "?raw",
	import: "default",
});
const exampleModules = import.meta.glob("../registry/examples/*.svelte", {
	query: "?raw",
	import: "default",
});

type Entry = {
	title: string;
	description: string;
	content: string;
	href: string;
	category: string;
	type: "page" | "heading" | "text";
	pageTitle: string;
	locale: Locale;
};

const MAX_DOC_CHARS = 9000;

/** `/zh/docs/installation/sveltekit#x` → `installation/sveltekit`. */
function pagePath(href: string): string {
	return href
		.split("#")[0]
		.replace(/^\/zh(?=\/)/, "")
		.replace(/^\/docs\//, "")
		.replace(/\/$/, "");
}

/** Ranks documentation pages for a question; with no query, lists every page. */
export function searchDocs(query: string, locale: Locale, limit = 6) {
	const entries = (searchData as Entry[]).filter((entry) => entry.locale === locale);
	const pages = new Map<
		string,
		{ path: string; title: string; description: string; hits: Entry[] }
	>();
	for (const entry of entries) {
		const path = pagePath(entry.href);
		const page = pages.get(path) ?? { path, title: entry.pageTitle, description: "", hits: [] };
		if (entry.type === "page") page.description = entry.description;
		page.hits.push(entry);
		pages.set(path, page);
	}

	const terms = tokenize(query);
	if (!terms.length) {
		return [...pages.values()].map(({ path, title, description }) => ({
			path,
			title,
			description,
		}));
	}

	return [...pages.values()]
		.map((page) => {
			const hits = page.hits
				.map((entry) => {
					const text = `${entry.title} ${entry.content}`.toLowerCase();
					const weight = entry.type === "heading" ? 3 : 1;
					return { entry, score: terms.filter((term) => text.includes(term)).length * weight };
				})
				.filter((hit) => hit.score > 0)
				.sort((a, b) => b.score - a.score);
			const titleScore = terms.filter((t) => page.title.toLowerCase().includes(t)).length * 5;
			const score = titleScore + hits.slice(0, 5).reduce((sum, hit) => sum + hit.score, 0);
			return { page, hits, score };
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map(({ page, hits }) => ({
			path: page.path,
			title: page.title,
			description: page.description,
			sections: hits.slice(0, 3).map(({ entry }) => ({
				heading: entry.title,
				snippet: entry.content.slice(0, 160),
			})),
		}));
}

/** The reading part of a docs or component page: no frontmatter, scripts, install tabs or live previews. */
export async function readDoc(path: string, locale: Locale) {
	const clean = path.replace(/^\/+|\.md$/g, "").replace(/^(zh\/)?docs\//, "");
	if (!/^[a-z0-9/-]+$/.test(clean)) return null;
	const base = `../../../content${locale === "zh" ? "/zh" : ""}/${clean}`;
	const load = docModules[`${base}.md`] ?? docModules[`${base}/index.md`];
	if (!load) return null;

	const raw = (await load()) as string;
	const examples = [...raw.matchAll(/<ComponentPreview[^>]*\bname="([^"]+)"/g)].map((m) => m[1]);
	const text = raw
		.replace(/^---[\s\S]*?---\n/, "")
		.replace(/<script[\s\S]*?<\/script>/g, "")
		.replace(/<InstallTabs>[\s\S]*?<\/InstallTabs>/g, "")
		.replace(/<ComponentPreview[\s\S]*?<\/ComponentPreview>/g, "")
		.replace(/\n{3,}/g, "\n\n")
		.trim();

	return { text: text.slice(0, MAX_DOC_CHARS), truncated: text.length > MAX_DOC_CHARS, examples };
}

export async function readExample(name: string): Promise<string | null> {
	const load = exampleModules[`../registry/examples/${name}.svelte`];
	return load ? ((await load()) as string) : null;
}
