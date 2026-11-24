import type { ComponentCard } from "./component-cards.js";
import { patternMarkdown, type PagePattern } from "./patterns.js";

/**
 * Builds the AI-facing outputs from component cards (`ui/<name>/meta.json`) and page patterns:
 * `catalog.json`, `llms-small.txt` and the card section of each component's markdown.
 * The skill and the MCP server read `catalog.json`, so this is the only place the format is rendered.
 */
export type CatalogPattern = PagePattern & {
	install: string;
	markdown: string;
};

export type Catalog = {
	name: "valar-svelte";
	/** Base URL of the docs site the links point at. */
	site: string;
	components: (ComponentCard & {
		docs: string;
		install: string;
		/** The card rendered as markdown, so readers (MCP, skill) never re-format it. */
		markdown: string;
		/** The component's design rules (`RULES.md`), when it has them. */
		rules?: string;
	})[];
	/** Proven page & section layout recipes agents consult before picking individual components. */
	patterns: CatalogPattern[];
	/** UI components without a card yet. Listed so gaps are visible, never skipped silently. */
	missingCards: string[];
};

export function buildCatalog(
	cards: ComponentCard[],
	uiComponents: string[],
	site: string,
	rules: Record<string, string> = {},
	patterns: readonly PagePattern[] = []
): Catalog {
	const byName = new Map(cards.map((card) => [card.name, card]));
	return {
		name: "valar-svelte",
		site,
		components: [...cards]
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((card) => ({
				...card,
				docs: `${site}/docs/components/${card.name}`,
				install: installCommand([card.name]),
				markdown: cardMarkdown(card),
				...(rules[card.name] ? { rules: rules[card.name] } : {}),
			})),
		patterns: patterns.map((pattern) => {
			const install = installCommand(pattern.components);
			return {
				...pattern,
				install,
				markdown: patternMarkdown(pattern, install),
			};
		}),
		missingCards: uiComponents.filter((name) => !byName.has(name)).sort(),
	};
}

export function installCommand(names: string[]): string {
	return `pnpm exec valar-svelte add ${names.join(" ")}`;
}

/** The card as markdown, placed at the top of `/docs/components/<name>.md`. */
export function cardMarkdown(card: ComponentCard): string {
	const v = card.meta.valar;
	const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");
	return `# ${card.title}

${card.description}

- 分类：${card.categories.join("、")}
- 关键词：${v.keywords.join("、")}
- 安装：\`${installCommand([card.name])}\`

## 何时使用

${list(v.whenToUse)}

## 何时不用

${list(v.whenNotToUse.map((item) => (item.use ? `${item.case}：改用 \`${item.use}\`` : item.case)))}

## 无障碍

${list(v.accessibility)}

## 响应式

${list(v.responsive)}

## 相关组件

${list(v.related.map((name) => `\`${name}\``))}
`;
}

/** Short index for AI context windows: page patterns + one line per component with selection hints. */
export function llmsSmall(catalog: Catalog): string {
	const patternLines = (catalog.patterns ?? []).map(
		(p) => `- \`${p.name}\` ${p.title}（${p.category}）：${p.description} 常用：${p.components.join("、")}`
	);
	const lines = catalog.components.map((c) => {
		const avoid = c.meta.valar.whenNotToUse
			.filter((item) => item.use)
			.map((item) => `${item.case}→${item.use}`)
			.join("；");
		return `- [${c.title}](${c.docs}.md) \`${c.name}\`（${c.categories[0]}）：${c.description}${avoid ? ` 不适用：${avoid}` : ""}`;
	});
	return `# Valar Svelte

> Svelte 组件库。搭页面前先选页面骨架配方，再按“不适用”提示选组件；组件以源码形式通过 \`valar-svelte add <组件>\` 安装到项目中，并附带设计规范 RULES.md。
${patternLines.length ? `\n## 页面骨架配方\n\n${patternLines.join("\n")}\n` : ""}
## 组件

${lines.join("\n")}

## 更多

- 完整目录（JSON）：${catalog.site}/registry/catalog.json
- 全部文档：${catalog.site}/llms-full.txt
- 尚无说明卡的组件：${catalog.missingCards.join("、") || "无"}
`;
}
