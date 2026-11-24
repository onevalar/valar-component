import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { compactMessages } from "$lib/agent/compact.server.js";
import { AGENT_SYSTEM_PROMPT, createAgentTools } from "$lib/agent/tools.server.js";
import {
	UI_CATALOG,
	uiCatalogDetails,
	uiCatalogIndex,
	usedComponentSlugs,
	validateUi,
	type UiNode,
} from "$lib/agent/ui-catalog.js";
import { uiNodeToSvelte } from "$lib/agent/ui-to-svelte.js";
import { lintSource } from "../../packages/cli/src/utils/design-rules-core.js";

describe("agent UI catalog and aesthetic guardrails", () => {
	it("validates every built-in catalog example including PageLayout and business primitives", () => {
		const expectedTypes = [
			"PageLayout",
			"PageHeader",
			"PageToolbar",
			"PageSection",
			"PropertyList",
			"PropertyRow",
			"AlertDialog",
			"Sheet",
			"ItemList",
			"ItemRow",
			"Gauge",
			"Sparkline",
			"Skeleton",
		];
		for (const type of expectedTypes) {
			expect(UI_CATALOG.some((entry) => entry.type === type)).toBe(true);
		}
		for (const entry of UI_CATALOG) {
			const res = validateUi(entry.example);
			expect(res, `${entry.type} built-in example should validate`).toMatchObject({ ok: true });
		}
	});

	it("maps PageLayout and switch-backed PropertyRow to expected component slugs", () => {
		const pageTree: UiNode = {
			type: "PageLayout",
			props: { width: "narrow" },
			children: [
				{
					type: "PageHeader",
					props: { title: "工作区设置" },
					children: [
						{ type: "Button", props: { variant: "outline", size: "sm" }, children: "重置" },
						{ type: "Button", props: { size: "sm" }, children: "保存更改" },
					],
				},
				{
					type: "PageSection",
					props: { title: "通知偏好", surface: "card" },
					children: [
						{
							type: "PropertyList",
							props: { layout: "settings" },
							children: [{ type: "PropertyRow", props: { label: "邮件通知", checked: true } }],
						},
					],
				},
			],
		};

		expect(validateUi(pageTree)).toMatchObject({ ok: true });
		const slugs = usedComponentSlugs(pageTree);
		expect(slugs).toContain("page-layout");
		expect(slugs).toContain("button");
		expect(slugs).toContain("switch");
	});

	it("rejects nested cards across Card and PageSection(surface=card)", () => {
		const nestedCardInCard: UiNode = {
			type: "Card",
			children: [
				{
					type: "CardContent",
					children: [
						{
							type: "Card",
							children: [{ type: "CardHeader", children: [{ type: "CardTitle", children: "内层" }] }],
						},
					],
				},
			],
		};
		const nestedSectionCards: UiNode = {
			type: "PageSection",
			props: { title: "外层", surface: "card" },
			children: [
				{
					type: "PageSection",
					props: { title: "内层", surface: "card" },
					children: [{ type: "Text", children: "内容" }],
				},
			],
		};
		const cardInsideSectionCard: UiNode = {
			type: "PageSection",
			props: { surface: "card" },
			children: [
				{
					type: "Card",
					children: [{ type: "CardHeader", children: [{ type: "CardTitle", children: "重复卡片" }] }],
				},
			],
		};

		for (const bad of [nestedCardInCard, nestedSectionCards, cardInsideSectionCard]) {
			const res = validateUi(bad);
			expect(res.ok).toBe(false);
			if (!res.ok) {
				expect(res.errors.some((e) => e.includes("禁止卡片套卡片"))).toBe(true);
			}
		}

		// Plain outer section wrapping a single card section is allowed.
		const singleLayer: UiNode = {
			type: "PageSection",
			props: { title: "外层分组", surface: "plain" },
			children: [
				{
					type: "PageSection",
					props: { surface: "card" },
					children: [{ type: "Text", children: "单层卡片内容" }],
				},
			],
		};
		expect(validateUi(singleLayer)).toMatchObject({ ok: true });
	});

	it("rejects more than one primary button in the same action container", () => {
		const twoInHeader: UiNode = {
			type: "PageHeader",
			props: { title: "成员权限" },
			children: [
				{ type: "Button", children: "导出" },
				{ type: "Button", props: { variant: "default" }, children: "邀请成员" },
			],
		};
		const twoInFooter: UiNode = {
			type: "Card",
			children: [
				{
					type: "CardFooter",
					children: [
						{ type: "Button", children: "保存草稿" },
						{ type: "Button", children: "发布" },
					],
				},
			],
		};
		const twoInRowStack: UiNode = {
			type: "Stack",
			props: { direction: "row", gap: "sm" },
			children: [
				{ type: "Button", children: "同步" },
				{ type: "Button", children: "提交" },
			],
		};

		for (const bad of [twoInHeader, twoInFooter, twoInRowStack]) {
			const res = validateUi(bad);
			expect(res.ok).toBe(false);
			if (!res.ok) {
				expect(res.errors.some((e) => e.includes("最多只放 1 个主操作"))).toBe(true);
			}
		}

		const validBar: UiNode = {
			type: "PageHeader",
			props: { title: "成员权限" },
			children: [
				{ type: "Button", props: { variant: "outline" }, children: "导出" },
				{ type: "Button", props: { variant: "destructive" }, children: "删除项目" },
				{ type: "Button", children: "邀请成员" },
			],
		};
		expect(validateUi(validBar)).toMatchObject({ ok: true });
	});

	it("rejects redundant 请输入 placeholder copy and allows format examples", () => {
		const badInput: UiNode = {
			type: "InputField",
			props: { label: "工作邮箱", placeholder: "请输入工作邮箱" },
		};
		const res = validateUi(badInput);
		expect(res.ok).toBe(false);
		if (!res.ok) {
			expect(res.errors.some((e) => e.includes("禁止写“请输入…”"))).toBe(true);
		}

		const goodInput: UiNode = {
			type: "InputField",
			props: { label: "工作邮箱", placeholder: "name@company.com" },
		};
		expect(validateUi(goodInput)).toMatchObject({ ok: true });
	});

	it("rejects Emoji decoration in headings, titles, and buttons while keeping technical symbols", () => {
		const badNodes: UiNode[] = [
			{ type: "PageHeader", props: { title: "🚀 快速开始" } },
			{ type: "PageSection", props: { title: "✨ 推荐配置" }, children: [] },
			{ type: "Heading", children: "🔥 热门项目" },
			{ type: "Button", children: "✅ 保存" },
			{ type: "Empty", props: { title: "🎉 全部完成" } },
		];
		for (const bad of badNodes) {
			const res = validateUi(bad);
			expect(res.ok).toBe(false);
			if (!res.ok) {
				expect(res.errors.some((e) => e.includes("Emoji"))).toBe(true);
			}
		}

		const technical: UiNode = {
			type: "Stack",
			children: [
				{ type: "Heading", children: "快捷键 ⌘K" },
				{ type: "Button", children: "复制命令" },
			],
		};
		expect(validateUi(technical)).toMatchObject({ ok: true });
	});

	it("rejects SwitchField nested inside PropertyRow", () => {
		const nestedSwitch: UiNode = {
			type: "PropertyList",
			props: { layout: "settings" },
			children: [
				{
					type: "PropertyRow",
					props: { label: "邮件通知" },
					children: [{ type: "SwitchField", props: { label: "邮件通知" } }],
				},
			],
		};
		const res = validateUi(nestedSwitch);
		expect(res.ok).toBe(false);
		if (!res.ok) {
			expect(res.errors.some((e) => e.includes("SwitchField"))).toBe(true);
		}
	});

	it("rejects generic confirmLabel in AlertDialog and Emoji on new primitives", () => {
		for (const generic of ["确定", "确认", "OK", "Confirm"]) {
			const res = validateUi({
				type: "AlertDialog",
				props: {
					triggerLabel: "删除项目",
					title: "删除项目",
					description: "删除后不可恢复。",
					confirmLabel: generic,
				},
			});
			expect(res.ok).toBe(false);
			if (!res.ok) {
				expect(res.errors.some((e) => e.includes("动作与对象"))).toBe(true);
			}
		}

		for (const badEmoji of [
			{
				type: "Sheet",
				props: { triggerLabel: "🔍 查看", title: "详情" },
			},
			{
				type: "ItemRow",
				props: { title: "🔥 紧急任务" },
			},
			{
				type: "Gauge",
				props: { label: "📊 配额", value: 60 },
			},
			{
				type: "Sparkline",
				props: { label: "📈 趋势", values: [1, 2, 3] },
			},
		]) {
			const res = validateUi(badEmoji);
			expect(res.ok).toBe(false);
			if (!res.ok) {
				expect(res.errors.some((e) => e.includes("Emoji"))).toBe(true);
			}
		}

		// Sheet opened inside a Card resets card-nesting context, while still forbidding double cards inside Sheet.
		const sheetInsideCardOk: UiNode = {
			type: "PageSection",
			props: { surface: "card" },
			children: [
				{
					type: "Sheet",
					props: { triggerLabel: "查看详情", title: "项目详情" },
					children: [
						{
							type: "PageSection",
							props: { surface: "card" },
							children: [{ type: "Text", children: "单层卡片" }],
						},
					],
				},
			],
		};
		expect(validateUi(sheetInsideCardOk)).toMatchObject({ ok: true });
	});
});

describe("slimmed site agent tools and system prompt", () => {
	const tools = createAgentTools("zh");
	const call = async <TInput>(
		toolDef: { execute?: (input: TInput, opts: never) => unknown },
		input: TInput
	) => await toolDef.execute!(input, {} as never);

	it("exposes exactly 10 intent-grouped tools without legacy duplicates", () => {
		const names = Object.keys(tools).sort();
		expect(names).toEqual([
			"get_component",
			"get_pattern",
			"get_skill",
			"get_ui_catalog",
			"read_doc",
			"review_code",
			"search_components",
			"search_docs",
			"search_patterns",
			"show_ui",
		]);
	});

	it("keeps AGENT_SYSTEM_PROMPT slim without eager UI catalog or advanced dumps", () => {
		expect(AGENT_SYSTEM_PROMPT.length).toBeLessThan(1600);
		expect(AGENT_SYSTEM_PROMPT).not.toContain("完整业务界面：");
		expect(AGENT_SYSTEM_PROMPT).not.toContain("InputOtpField");
		expect(AGENT_SYSTEM_PROMPT).toContain("get_ui_catalog");
		expect(AGENT_SYSTEM_PROMPT).toContain("PageLayout");
	});

	it("discloses UI catalog progressively via get_ui_catalog", async () => {
		const indexResult = (await call(tools.get_ui_catalog, {})) as {
			index: string;
			hint: string;
		};
		expect(indexResult.index).toContain("PageLayout");
		expect(indexResult.index).toBe(uiCatalogIndex());

		const detailResult = (await call(tools.get_ui_catalog, {
			types: ["PageLayout", "PageHeader"],
		})) as ReturnType<typeof uiCatalogDetails>;
		expect(detailResult).toHaveLength(2);
		expect(detailResult[0]?.type).toBe("PageLayout");

		const mixedResult = (await call(tools.get_ui_catalog, {
			types: ["PageLayout", "NonExistentBlock"],
		})) as { items: unknown[]; unknownTypes: string[] };
		expect(mixedResult.items).toHaveLength(1);
		expect(mixedResult.unknownTypes).toEqual(["NonExistentBlock"]);
	});

	it("supports merged search_components with and without query", async () => {
		const listedAll = String(await call(tools.search_components, {}));
		expect(listedAll).toContain("page-layout");

		const listedCategory = String(await call(tools.search_components, { category: "展示" }));
		expect(listedCategory).toContain("page-layout");

		const searched = String(await call(tools.search_components, { query: "页面布局" }));
		expect(searched).toContain("page-layout");

		const missed = String(await call(tools.search_components, { query: "不存在的xyz组件" }));
		expect(missed).not.toContain("list_components");
		expect(missed).toContain("search_components");
	});

	it("lists advanced reference scenes when search_patterns is called without query", async () => {
		const all = String(await call(tools.search_patterns, {}));
		expect(all).toContain("settings-page");
		expect(all).toContain("/advanced/my-issues");
		expect(all).toContain("issue-detail");
	});

	it("supports merged read_doc for path, example, and theme", async () => {
		const doc = (await call(tools.read_doc, { path: "components/page-layout" })) as {
			text: string;
			examples: string[];
		};
		expect(doc.text.length).toBeGreaterThan(20);
		expect(doc.examples).toContain("page-layout-demo");

		const example = String(await call(tools.read_doc, { example: "page-layout-demo" }));
		expect(example).toContain("PageLayout.Root");

		const themes = (await call(tools.read_doc, { theme: "list" })) as string[];
		expect(Array.isArray(themes)).toBe(true);
		expect(themes.length).toBeGreaterThan(0);

		const themeData = await call(tools.read_doc, { theme: themes[0] });
		expect(themeData).toBeTruthy();

		const missing = (await call(tools.read_doc, {})) as { error: string };
		expect(missing.error).toContain("path");
	});

	it("merges all three maintainer design guides in one get_skill(guides) call and keeps catalog details compact", async () => {
		const guides = String(await call(tools.get_skill, { file: "guides" }));
		expect(guides).toContain("# 页面组合");
		expect(guides).toContain("# 界面文案");
		expect(guides).toContain("# 动效与交互反馈");

		const details = await call(tools.get_ui_catalog, {
			types: [
				"PageLayout",
				"PageHeader",
				"PageToolbar",
				"PageSection",
				"PropertyList",
				"PropertyRow",
				"ItemList",
				"ItemRow",
				"Sheet",
				"Dialog",
				"AlertDialog",
				"Table",
				"Gauge",
				"Sparkline",
				"Button",
			],
		});
		const bytes = JSON.stringify(details).length;
		expect(bytes).toBeLessThan(10_000);
		expect(JSON.stringify(details)).not.toContain("$schema");
	});

	it("allows realistic 10-level workspace+Sheet trees and counts primary Dialog triggers", () => {
		expect(validateUi(undefined)).toEqual({
			ok: false,
			errors: ["root 必须是 { type, props?, children? } 对象"],
		});

		const duplicatePrimaryDialog: UiNode = {
			type: "PageHeader",
			props: { title: "成员权限" },
			children: [
				{
					type: "Dialog",
					props: { triggerLabel: "邀请成员", triggerVariant: "default", title: "邀请成员" },
					children: [],
				},
				{ type: "Button", children: "导出" },
			],
		};
		const dupRes = validateUi(duplicatePrimaryDialog);
		expect(dupRes.ok).toBe(false);
		if (!dupRes.ok) {
			expect(dupRes.errors.some((e) => e.includes("最多只放 1 个主操作"))).toBe(true);
		}

		// Depth 10 realistic tree: PageLayout > Tabs > TabPanel > PageSection > ItemList > ItemRow > Sheet > PropertyList > PropertyRow > Button
		const deepWorkspace: UiNode = {
			type: "PageLayout",
			props: { width: "full" },
			children: [
				{
					type: "Tabs",
					props: { defaultValue: "mine" },
					children: [
						{
							type: "TabPanel",
							props: { value: "mine", label: "我负责的" },
							children: [
								{
									type: "PageSection",
									children: [
										{
											type: "ItemList",
											children: [
												{
													type: "ItemRow",
													props: { meta: "DS-1", title: "核对权限接口" },
													children: [
														{
															type: "Sheet",
															props: { triggerLabel: "详情", title: "任务详情" },
															children: [
																{
																	type: "PropertyList",
																	props: { layout: "detail" },
																	children: [
																		{
																			type: "PropertyRow",
																			props: { label: "操作" },
																			children: [
																				{ type: "Button", props: { variant: "outline", size: "sm" }, children: "复制链接" },
																			],
																		},
																	],
																},
															],
														},
													],
												},
											],
										},
									],
								},
							],
						},
					],
				},
			],
		};
		expect(validateUi(deepWorkspace)).toMatchObject({ ok: true });
	});

	it("enforces aesthetic rules in both show_ui and review_code", async () => {
		const badUi = (await call(tools.show_ui, {
			root: { type: "PageHeader", props: { title: "🚀 设置" } },
		})) as { ok: boolean; errors?: string[] };
		expect(badUi.ok).toBe(false);
		expect(badUi.errors?.some((e) => e.includes("Emoji"))).toBe(true);

		const codeReview = await call(tools.review_code, {
			code: `<Card.Root><Card.Content><Card.Root /></Card.Content></Card.Root>`,
		});
		expect(Array.isArray(codeReview)).toBe(true);
		expect((codeReview as string[]).some((line) => line.includes("valar/no-nested-card"))).toBe(
			true
		);
	});
});

describe("deterministic uiNodeToSvelte code generator", () => {
	it("generates lint-clean Svelte 5 code for every built-in catalog example (0 errors, 0 warnings)", () => {
		for (const entry of UI_CATALOG) {
			const { code } = uiNodeToSvelte(entry.example);
			const findings = lintSource(`${entry.type}.svelte`, code);
			expect(
				findings,
				`${entry.type} generated code had lint findings:\n${code}\n${JSON.stringify(findings)}`
			).toEqual([]);
		}
	});

	it("generates complete PageLayout page code with matching install command", () => {
		const pageTree: UiNode = {
			type: "PageLayout",
			props: { width: "narrow" },
			children: [
				{
					type: "PageHeader",
					props: { title: "工作区设置" },
					children: [
						{ type: "Button", props: { variant: "outline", size: "sm" }, children: "重置" },
						{ type: "Button", props: { size: "sm" }, children: "保存更改" },
					],
				},
				{
					type: "PageSection",
					props: { title: "通知偏好", surface: "card" },
					children: [
						{
							type: "PropertyList",
							props: { layout: "settings" },
							children: [
								{ type: "PropertyRow", props: { label: "邮件通知", checked: true } },
								{
									type: "PropertyRow",
									props: { label: "高危操作" },
									children: [
										{
											type: "Dialog",
											props: { triggerLabel: "删除工作区", title: "删除工作区" },
											children: [{ type: "Text", children: "删除后不可恢复。" }],
										},
									],
								},
							],
						},
					],
				},
				{
					type: "PageSection",
					props: { title: "用量明细" },
					children: [
						{
							type: "Table",
							props: {
								columns: [
									{ key: "item", label: "项目" },
									{ key: "usage", label: "用量", align: "end" },
								],
								rows: [{ item: "接口调用 {v1}", usage: 1200 }],
							},
						},
					],
				},
			],
		};

		const result = uiNodeToSvelte(pageTree);
		expect(result.code).toContain('import * as PageLayout from "$lib/components/ui/page-layout/index.js";');
		expect(result.code).toContain('import { Switch } from "$lib/components/ui/switch/index.js";');
		expect(result.code).toContain("tabular-nums");
		expect(result.code).toContain("&#123;v1&#125;");
		expect(result.installCommand).toContain("pnpm exec valar-svelte add ");
		expect(result.installCommand).toContain("page-layout");
		expect(result.installCommand).toContain("switch");
		expect(result.installCommand).toContain("table");
		expect(result.installCommand).toContain("dialog");
		expect(lintSource("settings-page.svelte", result.code)).toEqual([]);
	});

	it("generates lint-clean Svelte 5 code for billing metrics and workspace-list + Sheet pages", () => {
		const billingPage: UiNode = {
			type: "PageLayout",
			props: { width: "full" },
			children: [
				{
					type: "PageHeader",
					props: { title: "账单与用量" },
					children: [
						{
							type: "AlertDialog",
							props: {
								triggerLabel: "停用额度",
								title: "停用超额计费",
								description: "停用后超出套餐额度的请求将被直接拒绝。",
								confirmLabel: "停用超额计费",
							},
						},
					],
				},
				{
					type: "Grid",
					props: { columns: 2, gap: "md" },
					children: [
						{
							type: "PageSection",
							props: { surface: "card" },
							children: [
								{
									type: "Gauge",
									props: { label: "本月 API 额度", value: 112, valueText: "1,120 / 1,000 次" },
								},
							],
						},
						{
							type: "PageSection",
							props: { surface: "card" },
							children: [
								{
									type: "Sparkline",
									props: { label: "近 7 天请求趋势", value: "128,450 次", values: [12, 18, 16, 24, 30, 27, 36] },
								},
							],
						},
					],
				},
				{
					type: "PageSection",
					props: { title: "任务列表" },
					children: [
						{
							type: "ItemList",
							props: { label: "近期任务" },
							children: [
								{
									type: "ItemRow",
									props: { meta: "DS-42", title: "核对账单导出格式" },
									children: [
										{ type: "Badge", props: { variant: "secondary" }, children: "进行中" },
										{
											type: "Sheet",
											props: { triggerLabel: "详情", title: "DS-42 详情" },
											children: [
												{
													type: "PropertyList",
													props: { layout: "detail" },
													children: [{ type: "PropertyRow", props: { label: "负责人", value: "Mira" } }],
												},
											],
										},
									],
								},
							],
						},
					],
				},
				{ type: "Skeleton", props: { variant: "row", lines: 2 } },
			],
		};

		expect(validateUi(billingPage)).toMatchObject({ ok: true });
		const out = uiNodeToSvelte(billingPage);
		expect(out.components).toEqual(
			expect.arrayContaining([
				"page-layout",
				"alert-dialog",
				"gauge",
				"sparkline",
				"item",
				"sheet",
				"skeleton",
			])
		);
		expect(out.code).toContain('import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";');
		expect(out.code).toContain('import * as Sheet from "$lib/components/ui/sheet/index.js";');
		expect(out.code).toContain('import * as Item from "$lib/components/ui/item/index.js";');
		expect(out.code).toContain('import { Gauge } from "$lib/components/ui/gauge/index.js";');
		expect(out.code).toContain('import { StaticSparkline } from "$lib/components/ui/sparkline/index.js";');
		expect(out.code).toContain('import { Skeleton } from "$lib/components/ui/skeleton/index.js";');
		expect(out.code).toContain('tone="danger"');
		expect(lintSource("billing-workspace.svelte", out.code)).toEqual([]);
	});
});

describe("multi-turn context compaction", () => {
	const makeTurn = (id: number, bigOutput: string): UIMessage[] => [
		{
			id: `u-${id}`,
			role: "user",
			parts: [{ type: "text", text: `第 ${id} 轮需求` }],
		},
		{
			id: `a-${id}`,
			role: "assistant",
			parts: [
				{ type: "reasoning", text: `较长的思考过程 ${id}` },
				{
					type: "tool-read_doc",
					toolCallId: `tc-${id}`,
					state: "output-available",
					input: { path: `components/dialog-${id}` },
					output: bigOutput,
				} as unknown as UIMessage["parts"][number],
				{ type: "text", text: `第 ${id} 轮回答结论` },
			],
		},
	];

	it("compacts old heavy tool outputs and reasoning while preserving recent turns verbatim", () => {
		const big = "x".repeat(2000);
		const history = [...makeTurn(1, big), ...makeTurn(2, big), ...makeTurn(3, big)];
		const compacted = compactMessages(history, { keepRecentTurns: 2 });

		// Original input is never mutated.
		const origTool = history[1]!.parts[1] as { output: string };
		expect(origTool.output).toBe(big);

		// Turn 1 assistant reasoning stripped & heavy tool output summarized; text kept.
		const turn1Assistant = compacted[1]!;
		expect(turn1Assistant.parts.some((p) => p.type === "reasoning")).toBe(false);
		const turn1Tool = turn1Assistant.parts.find((p) => p.type === "tool-read_doc") as {
			output: string;
		};
		expect(turn1Tool.output).toContain("已省略较早轮次");
		expect(turn1Tool.output).toContain("components/dialog-1");
		expect(turn1Assistant.parts.some((p) => p.type === "text" && p.text === "第 1 轮回答结论")).toBe(
			true
		);

		// Turn 2 and Turn 3 (most recent 2 turns) kept intact.
		const turn2Tool = compacted[3]!.parts.find((p) => p.type === "tool-read_doc") as {
			output: string;
		};
		const turn3Tool = compacted[5]!.parts.find((p) => p.type === "tool-read_doc") as {
			output: string;
		};
		expect(turn2Tool.output).toBe(big);
		expect(turn3Tool.output).toBe(big);
	});

	it("slides the window on very long threads starting cleanly on a user turn", () => {
		const longHistory: UIMessage[] = [];
		for (let i = 1; i <= 25; i++) {
			longHistory.push(...makeTurn(i, "short"));
		}
		expect(longHistory).toHaveLength(50);
		const compacted = compactMessages(longHistory, { maxWindow: 20 });
		expect(compacted.length).toBeLessThanOrEqual(20);
		expect(compacted[0]?.role).toBe("user");
		expect(compacted.at(-1)?.id).toBe("a-25");
	});
});
