import { jsonSchema, tool } from "ai";
import { z } from "zod";
import type { Locale } from "$lib/i18n/config.js";
import { readDoc, readExample, searchDocs } from "./docs.server.js";
import { getComponentInfos } from "./knowledge.js";
import { uiCatalogDetails, validateUi } from "./ui-catalog.js";
// The same tools the local MCP server offers to Cursor / Claude, so the site assistant and
// external agents read one source: the component cards, RULES.md files and lint rules.
import { lintSource } from "../../../../packages/cli/src/utils/design-rules-core.js";
import {
	MCP_TOOLS,
	callTool,
	type Catalog,
	type McpData,
	type Skill,
} from "../../../../packages/cli/src/utils/mcp.js";

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

const failure = (error: unknown) => ({
	error: error instanceof Error ? error.message : String(error),
});

/**
 * Components that have a docs page but no card (composed from other components, e.g. Combobox).
 * The MCP catalog does not list them, so name them here; the agent reads their docs instead.
 */
async function docOnlyNote(locale: Locale): Promise<string> {
	const inCatalog = new Set((await mcpData.catalog()).components.map((c) => c.name));
	const only = getComponentInfos(locale).filter((info) => !inCatalog.has(info.slug));
	return only.length
		? `\n\n另有只含文档页、没有说明卡的组件（用 read_doc 读 components/<名称>）：${only
				.map((info) => `${info.title} ${info.slug}`)
				.join("、")}`
		: "";
}

export function createAgentTools(locale: Locale) {
	const mcp = Object.fromEntries(
		MCP_TOOLS.map((def) => [
			def.name,
			tool({
				description: def.description,
				inputSchema: jsonSchema<Record<string, unknown>>(def.inputSchema as never),
				execute: async (args) => {
					try {
						const result = await callTool(mcpData, def.name, args);
						return def.name === "list_components" || def.name === "search_components"
							? result + (await docOnlyNote(locale))
							: result;
					} catch (error) {
						return failure(error);
					}
				},
			}),
		])
	);

	return {
		...mcp,
		search_docs: tool({
			description:
				"搜索文档站的非组件页面（安装、主题定制、命令行、表单、深色模式、注册表等）。不传 query 则列出全部页面。",
			inputSchema: z.object({ query: z.string().optional() }),
			execute: async ({ query }) => searchDocs(query ?? "", locale),
		}),
		read_doc: tool({
			description:
				"读取一个文档页的正文，path 来自 search_docs，也可以是组件页，如 components/dialog。",
			inputSchema: z.object({ path: z.string() }),
			execute: async ({ path }) => (await readDoc(path, locale)) ?? failure(`没有页面 ${path}`),
		}),
		get_example: tool({
			description: "读取一个示例的完整 Svelte 源码。示例名来自 read_doc 返回的 examples。",
			inputSchema: z.object({ name: z.string().regex(/^[a-z0-9-]+$/) }),
			execute: async ({ name }) => (await readExample(name)) ?? failure(`没有示例 ${name}`),
		}),
		list_themes: tool({
			description: "列出站点提供的设计 token 主题（对应顶部「设计 token」页）。",
			inputSchema: z.object({}),
			execute: async () =>
				Object.keys(themeModules)
					.map((path) => path.split("/").pop()!.replace(".json", ""))
					.filter((name) => name !== "index"),
		}),
		get_theme: tool({
			description:
				"读取一个主题的浅色、深色 token 取值（主色、图表色、侧边栏色等）。名称来自 list_themes。",
			inputSchema: z.object({ name: z.string().regex(/^[a-z-]+$/) }),
			execute: async ({ name }) => {
				const load = themeModules[themePath(name)];
				return load ? await load() : failure(`没有主题 ${name}`);
			},
		}),
		get_ui_catalog: tool({
			description:
				"读取 show_ui 可用积木的完整说明：属性（JSON Schema）、children 规则和一个可用的示例。第一次调用 show_ui 前，用到的积木都要先查；不传 types 返回全部。",
			inputSchema: z.object({ types: z.array(z.string()).optional() }),
			execute: async ({ types }) => uiCatalogDetails(types),
		}),
		show_ui: tool({
			description:
				"在聊天回答中显示一块界面。root 是用 get_ui_catalog 里的积木拼成的树：{ type, props, children }。服务器会逐条校验；返回 ok:false 时按 errors 修改后再调用。显示成功后，回答里不要重复界面里已有的内容。",
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
				"用 valar-svelte lint 的规则检查你写的 Svelte 代码（语义颜色、按钮尺寸、图标按钮标签、表单标签、弹层标题等）。每次交付代码前必须调用，并修掉所有 error。",
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
