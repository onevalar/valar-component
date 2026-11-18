import { getComponentInfos, toCodeName, type ComponentInfo } from "$lib/agent/knowledge.js";
import { guideSections } from "$lib/doc-guide.js";
import type { Locale } from "$lib/i18n/config.js";

const docFiles = import.meta.glob("/content/**/*.md", { query: "?raw", import: "default" });
const rulesFiles = import.meta.glob("/src/lib/registry/ui/*/RULES.md", {
	query: "?raw",
	import: "default",
});

export type GuideSectionItem = { id: string; title: string; body: string };

export async function loadComponentGuideData(options: {
	slug: string;
	sourceDir: "components" | "ai-elements";
	locale: Locale;
}) {
	const { slug, sourceDir, locale } = options;
	const docLoader = docFiles[`/content${locale === "zh" ? "/zh" : ""}/${sourceDir}/${slug}.md`];
	const rulesLoader =
		sourceDir === "components" ? rulesFiles[`/src/lib/registry/ui/${slug}/RULES.md`] : undefined;
	const [rawDoc, rawRules] = await Promise.all([docLoader?.(), rulesLoader?.()]);
	return {
		prose: rawDoc ? guideSections(rawDoc as string) : [],
		rules: rawRules ? (rawRules as string).replace(/^#.*\n/, "").trim() : "",
	};
}

export function buildGuideSections(options: {
	info: ComponentInfo | undefined;
	titles: Map<string, string>;
	rules: string;
	prose: { title: string; body: string }[];
}): GuideSectionItem[] {
	const { info, titles, rules, prose } = options;
	const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");
	const out: GuideSectionItem[] = [];
	if (info?.whenToUse.length) {
		out.push({ id: "when", title: "什么时候用", body: list(info.whenToUse) });
	}
	if (info?.whenNotToUse.length) {
		out.push({
			id: "when-not",
			title: "什么时候不用",
			body: list(
				info.whenNotToUse.map((item) =>
					item.use ? `${item.case}：改用「${titles.get(item.use) ?? item.use}」` : item.case
				)
			),
		});
	}
	if (rules) {
		out.push({ id: "rules", title: "设计准则（助手按此使用）", body: rules });
	}
	if (info?.accessibility.length) {
		out.push({ id: "a11y", title: "无障碍", body: list(info.accessibility) });
	}
	if (info?.responsive.length) {
		out.push({ id: "responsive", title: "响应式", body: list(info.responsive) });
	}
	for (const [i, item] of prose.entries()) {
		out.push({
			id: `prose-${i}`,
			title: item.title || "概述",
			body: item.body,
		});
	}
	return out;
}

export async function buildComponentAiSpec(options: {
	slug: string;
	title: string;
	description?: string;
	sourceDir: "components" | "ai-elements";
	locale: Locale;
}): Promise<string> {
	const { slug, title, description, sourceDir, locale } = options;
	const infos = getComponentInfos(locale);
	const info = sourceDir === "components" ? infos.find((item) => item.slug === slug) : undefined;
	const titles = new Map(infos.map((item) => [item.slug, item.title]));
	const { prose, rules } = await loadComponentGuideData({ slug, sourceDir, locale });
	const sections = buildGuideSections({ info, titles, rules, prose });
	const lines: string[] = [
		`# ${title} (<${toCodeName(slug)} /> · \`${slug}\`)`,
		"",
		description || info?.description || "",
	];
	if (info?.keywords.length) {
		lines.push("", `关键词：${info.keywords.join("、")}`);
	}
	for (const section of sections) {
		lines.push("", `## ${section.title}`, "", section.body);
	}
	if (info?.related.length) {
		lines.push(
			"",
			"## 相关组件",
			"",
			info.related.map((item) => `- ${titles.get(item) ?? item} (\`${item}\`)`).join("\n")
		);
	}
	return lines.join("\n").trim() + "\n";
}
