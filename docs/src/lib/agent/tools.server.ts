import { tool } from "ai";
import { z } from "zod";
import { ADVANCED_MODULES, ADVANCED_SCENES } from "$lib/advanced-catalog.js";
import type { Locale } from "$lib/i18n/config.js";
import { readDoc, readExample, searchDocs } from "./docs.server.js";
import { getComponentInfos } from "./knowledge.js";
import { UI_TYPES, uiCatalogDetails, uiCatalogIndex, validateUi } from "./ui-catalog.js";
// The site assistant shares one source of truth (catalog, skill, lint rules) with the local CLI
// MCP server, while exposing a slimmer intent-grouped toolset tailored for in-site conversation.
import {
	GLOBAL_RULES,
	lintSource,
} from "../../../../packages/cli/src/utils/design-rules-core.js";
import {
	callTool,
	type Catalog,
	type McpData,
	type Skill,
} from "../../../../packages/cli/src/utils/mcp.js";

export const AGENT_SYSTEM_PROMPT = `你是 Valar Svelte 文档站内的助手：帮助用户了解组件库、选定页面骨架与组件，并设计和拼装 Svelte 5 界面。站内信息均通过工具按需查询，不要凭记忆编造。

工作方式（按需调工具，减少多余轮次）：
1. 搭页面／画交互预览（show_ui）：先用 search_patterns + get_pattern 选骨架，再调一次 get_skill({ file: "guides" }) 读组合与文案细则；随后调 get_ui_catalog（先查目录，再一次传齐 types 读属性与示例），最后 show_ui。画预览时无需逐个调 get_component；整页优先以 PageLayout 为根，顶栏主弹窗设 triggerVariant="default"，工具栏用 SearchInput／FilterSelect／ButtonGroup（不放 InputField），主从分栏用 SplitLayout，对话原文用 MessageList。返回 ok:false 按错修完重发；成功后别复述界面已有内容。
2. 选单组件或手写 Svelte 代码：用 search_components 搜索或按分类列出，再用 get_component 查「何时用／何时不用」、RULES.md 与安装命令；用法不确定时用 read_doc 读文档页或示例源码；交付手写 Svelte 代码前必须调用 review_code 检查并修掉所有 error，如实说明仍存在的 warning。
3. 查文档或主题 token：用 search_docs 与 read_doc（传 path 读文档、example 读示例、theme="list" 或主题名读浅深色 token）。

表达与审美底线：
- 用中文回答，简短中性直接；提到组件时同时给中文名和代码名，如「页面骨架 <PageLayout />」。
- 严守克制品味：默认不写多余副标题或说明文字；禁止卡片套卡片、单侧彩色粗边框、标题/按钮放 Emoji、“请输入…”占位符；每个操作区最多 1 个主按钮（variant="default"）。

通用规则：
${GLOBAL_RULES}`;

const mcpData: McpData = {
	catalog: async () =>
		(await import("../../../static/registry/catalog.json")).default as unknown as Catalog,
	skill: async () =>
		(await import("../../../static/registry/skills/valar-svelte.json")).default as unknown as Skill,
};

const themeModules = import.meta.glob("../../../static/registry/colors/*.json", {
	import: "default",
});
const themePath = (name: string) => `../../../static/registry/colors/${name}.json`;
const availableThemes = () =>
	Object.keys(themeModules)
		.map((path) => path.split("/").pop()!.replace(".json", ""))
		.filter((name) => name !== "index")
		.sort();

const failure = (error: unknown) => ({
	error: error instanceof Error ? error.message : String(error),
});

const ADVANCED_NOTE = [
	"",
	"站内已提供完整高级业务参考界面（可引导用户到「高级组件」查看）：",
	...ADVANCED_SCENES.map((s) => `- ${s.title.zh}（/advanced/${s.slug}）：${s.description.zh}`),
	...ADVANCED_MODULES.map(
		(m) => `- ${m.title.zh}（/docs/components/${m.slug}）：${m.description.zh}`
	),
].join("\n");

/**
 * Components that have a docs page but no card (composed from other components, e.g. Combobox).
 * The MCP catalog does not list them, so name them here; the agent reads their docs instead.
 */
async function docOnlyNote(locale: Locale): Promise<string> {
	const inCatalog = new Set((await mcpData.catalog()).components.map((c) => c.name));
	const only = getComponentInfos(locale).filter((info) => !inCatalog.has(info.slug));
	return only.length
		? `\n\n另有只含文档页、没有说明卡的组件（用 read_doc 传 path: "components/<名称>" 阅读）：${only
				.map((info) => `${info.title} ${info.slug}`)
				.join("、")}`
		: "";
}

const VALID_TYPE_SET = new Set<string>(UI_TYPES);

export function createAgentTools(locale: Locale) {
	return {
		search_patterns: tool({
			description:
				"按业务场景搜索 Valar 页面与区块骨架配方（工作台列表、数据表格、系统设置、弹窗表单、双栏收件箱等）。搭页面前先调用；不传 query 则列出全部配方与站内高级业务参考界面。",
			inputSchema: z.object({
				query: z.string().optional().describe("业务场景关键词，中英文均可；不传则列出全部"),
				limit: z.number().int().positive().max(20).optional(),
			}),
			execute: async ({ query, limit }) => {
				try {
					const result = await callTool(mcpData, "search_patterns", { query, limit });
					return query?.trim() ? result : `${result}\n${ADVANCED_NOTE}`;
				} catch (error) {
					return failure(error);
				}
			},
		}),
		get_pattern: tool({
			description:
				"获取指定页面骨架配方的完整布局结构、审美红线、推荐组件清单与一键安装命令。name 来自 search_patterns。",
			inputSchema: z.object({ name: z.string() }),
			execute: async ({ name }) => {
				try {
					return await callTool(mcpData, "get_pattern", { name });
				} catch (error) {
					return failure(error);
				}
			},
		}),
		search_components: tool({
			description:
				"按用途/关键词搜索组件，或不传 query 列出全部组件（可按 category 筛选，如 表单、弹层）。选组件前先调用。",
			inputSchema: z.object({
				query: z.string().optional().describe("用途或关键词，中英文均可；省略则按分类列出全部"),
				category: z.string().optional().describe("仅在省略 query 时生效，按分类过滤，如 表单、弹层"),
				limit: z.number().int().positive().max(30).optional(),
			}),
			execute: async ({ query, category, limit }) => {
				try {
					const q = query?.trim();
					const raw = q
						? (await callTool(mcpData, "search_components", { query: q, limit })).replace(
								"用 list_components 查看全部",
								"调用不带 query 的 search_components 查看全部"
							)
						: await callTool(mcpData, "list_components", { category });
					return raw + (await docOnlyNote(locale));
				} catch (error) {
					return failure(error);
				}
			},
		}),
		get_component: tool({
			description:
				"获取一个组件的说明卡（何时用／不用、无障碍、响应式、相关组件）、设计规范 RULES.md、文档链接与安装命令。",
			inputSchema: z.object({ name: z.string() }),
			execute: async ({ name }) => {
				try {
					return await callTool(mcpData, "get_component", { name });
				} catch (error) {
					return failure(error);
				}
			},
		}),
		get_skill: tool({
			description:
				"读取 Valar 技能包与维护者定稿的设计方法。搭页面推荐传 file=\"guides\" 一次合并读取页面组合、界面文案与动效规范；也可传具体路径（如 rules/forms.md），不传则返回 SKILL.md 与文件目录。",
			inputSchema: z.object({ file: z.string().optional() }),
			execute: async ({ file }) => {
				try {
					if (file === "guides") {
						const parts = await Promise.all([
							callTool(mcpData, "get_skill", { file: "guides/page-composition.md" }),
							callTool(mcpData, "get_skill", { file: "guides/copywriting.md" }),
							callTool(mcpData, "get_skill", { file: "guides/motion.md" }),
						]);
						return parts.join("\n\n---\n\n");
					}
					return await callTool(mcpData, "get_skill", { file });
				} catch (error) {
					return failure(error);
				}
			},
		}),
		search_docs: tool({
			description:
				"搜索文档站的非组件页面（安装、主题定制、命令行、表单、深色模式、注册表等）。不传 query 则列出全部页面。",
			inputSchema: z.object({ query: z.string().optional() }),
			execute: async ({ query }) => searchDocs(query ?? "", locale),
		}),
		read_doc: tool({
			description:
				"读取文档页、示例源码或设计 token 主题（三选一）：path 读文档/组件页（如 components/dialog）；example 读示例 Svelte 源码（名称来自文档页返回的 examples）；theme 传 \"list\" 列出主题名或传主题名读浅深色 token。",
			inputSchema: z.object({
				path: z.string().optional().describe("文档或组件页路径，如 components/dialog"),
				example: z.string().optional().describe("示例名称，如 page-layout-demo"),
				theme: z.string().optional().describe("主题名称，或传 \"list\" 列出全部主题"),
			}),
			execute: async ({ path, example, theme }) => {
				if (path) {
					return (await readDoc(path, locale)) ?? failure(`没有页面 ${path}`);
				}
				if (example) {
					if (!/^[a-z0-9-]+$/.test(example)) return failure(`无效示例名 ${example}`);
					return (await readExample(example)) ?? failure(`没有示例 ${example}`);
				}
				if (theme) {
					if (theme === "list") return availableThemes();
					if (!/^[a-z-]+$/.test(theme)) return failure(`无效主题名 ${theme}`);
					const load = themeModules[themePath(theme)];
					return load ? await load() : failure(`没有主题 ${theme}`);
				}
				return failure("请传入 path、example 或 theme 之一。");
			},
		}),
		get_ui_catalog: tool({
			description:
				"渐进查询 show_ui 可用积木。不传 types 返回全部积木的一行目录（含 PageLayout 页面骨架族、布局、表单与展示积木）；传入 types 数组返回对应积木的完整属性 Schema、children 规则与示例。",
			inputSchema: z.object({
				types: z
					.array(z.string())
					.optional()
					.describe("要查阅详情的积木类型数组；省略则返回一行目录"),
			}),
			execute: async ({ types }) => {
				if (!types?.length) {
					return {
						index: uiCatalogIndex(),
						hint: '传入 types 数组（如 ["PageLayout", "PageHeader", "PageSection", "Table"]）读取对应积木的属性 Schema 与示例。',
					};
				}
				const unknown = types.filter((t) => !VALID_TYPE_SET.has(t));
				const details = uiCatalogDetails(types);
				return unknown.length
					? {
							items: details,
							unknownTypes: unknown,
							hint: "不传 types 可重新查看全部可用积木目录。",
						}
					: details;
			},
		}),
		show_ui: tool({
			description:
				"在聊天回答中显示可交互界面。root 是用 get_ui_catalog 积木拼成的树：{ type, props, children }。完整页面优先以 PageLayout 为根。服务器会校验结构与审美红线，ok:false 时按 errors 修改后重发；显示成功后不要重复界面里已有的内容。",
			inputSchema: z.object({
				title: z.string().max(80).optional().describe("这块界面的一句话标题"),
				root: z.record(z.string(), z.unknown()).describe("根节点 { type, props?, children? }"),
			}),
			execute: async ({ root }) => {
				const result = validateUi(root);
				return result.ok
					? { ok: true as const, nodes: result.count }
					: { ok: false as const, errors: result.errors };
			},
		}),
		review_code: tool({
			description:
				"用 valar-svelte lint 的规则检查你写的 Svelte 代码（语义颜色、审美红线、按钮尺寸、图标按钮标签、表单标签、弹层标题等）。每次交付代码前必须调用，并修掉所有 error。",
			inputSchema: z.object({ code: z.string().describe("完整的 .svelte 文件内容") }),
			execute: async ({ code }) => {
				const findings = lintSource("agent-output.svelte", code);
				return findings.length
					? findings.map((f) => `${f.line} 行 ${f.severity} ${f.rule}：${f.message}`)
					: "没有违反设计规则。";
			},
		}),
	};
}
