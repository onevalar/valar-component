import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";
import { ADVANCED_MODULES, ADVANCED_SCENES } from "$lib/advanced-catalog.js";
import { isAdvancedModuleSlug } from "$lib/basic-component-visibility.js";
import { basicCategories } from "$lib/component-category-list.js";
import { localizeHref, type Locale } from "$lib/i18n/config.js";
import { getComponentInfos, searchComponents, type ComponentInfo } from "./knowledge.js";
import { validateUi, type UiNode } from "./ui-catalog.js";

function extractLastUserText(messages: UIMessage[]): string {
	for (let i = messages.length - 1; i >= 0; i--) {
		const msg = messages[i];
		if (msg.role === "user") {
			return msg.parts
				.map((part) => (part.type === "text" ? part.text : ""))
				.join("")
				.trim();
		}
	}
	return "";
}

function isOverviewQuery(text: string): boolean {
	return /整体|现状|情况|有多少|全部组件|全貌|概览|四大板块|目录|高级组件|能做什么/.test(text) &&
		!/设计一个|搭一个|拼一个|拼一组/.test(text);
}

function isBuildUiQuery(text: string): boolean {
	const hasVerb = /设计|搭|拼|画|生成|做个|做一个|看看效果|预览一下/.test(text);
	const hasNoun = /表单|界面|面板|登录|注册|设置|表格|向导|步骤|验证码|排期|任务|弹窗|页面/.test(text);
	return hasVerb && (hasNoun || /效果/.test(text));
}

function buildLoginUi(): { title: string; root: UiNode; summary: string } {
	return {
		title: "登录与双模式验证表单",
		summary:
			"采用卡片容器搭配标签页，提供「账号密码」与「6 位短信验证码」两种登录方式；表单项均由字段容器与标签包裹，主操作保持唯一强调色按钮。",
		root: {
			type: "Card",
			children: [
				{
					type: "CardHeader",
					children: [
						{ type: "CardTitle", children: "登录 Valar 工作区" },
						{ type: "CardDescription", children: "支持密码登录或手机验证码快速进入" },
					],
				},
				{
					type: "CardContent",
					children: [
						{
							type: "Tabs",
							props: { defaultValue: "password" },
							children: [
								{
									type: "TabPanel",
									props: { value: "password", label: "账号登录" },
									children: [
										{
											type: "InputField",
											props: {
												label: "工作邮箱",
												type: "email",
												placeholder: "name@company.com",
												required: true,
											},
										},
										{
											type: "InputField",
											props: {
												label: "登录密码",
												type: "password",
												placeholder: "请输入至少 8 位密码",
												required: true,
											},
										},
										{
											type: "CheckboxField",
											props: { label: "7 天内保持登录状态", checked: true },
										},
									],
								},
								{
									type: "TabPanel",
									props: { value: "otp", label: "验证码登录" },
									children: [
										{
											type: "InputField",
											props: {
												label: "手机号",
												type: "tel",
												placeholder: "138 0000 0000",
											},
										},
										{
											type: "InputOtpField",
											props: {
												label: "6 位短信验证码",
												maxlength: 6,
												description: "输入手机收到的 6 位一次性验证码",
											},
										},
									],
								},
							],
						},
					],
				},
				{
					type: "CardFooter",
					children: [
						{ type: "Button", props: { variant: "default" }, children: "立即登录" },
						{ type: "Button", props: { variant: "outline" }, children: "忘记密码" },
					],
				},
			],
		},
	};
}

function buildSettingsUi(): { title: string; root: UiNode; summary: string } {
	return {
		title: "工作区设置面板",
		summary:
			"按照 Valar 设置页规范拼装：即时生效的开关使用 `<Switch />`，2～5 个互斥选项使用一眼看全的 `<RadioGroup />`，较多选项使用 `<Select />`。",
		root: {
			type: "Card",
			children: [
				{
					type: "CardHeader",
					children: [
						{ type: "CardTitle", children: "通知与显示偏好" },
						{ type: "CardDescription", children: "切换开关会即时应用到当前工作区" },
					],
				},
				{
					type: "CardContent",
					children: [
						{
							type: "SwitchField",
							props: {
								label: "桌面即时提醒",
								description: "有新的问题指派或评论提及时推送提醒",
								checked: true,
							},
						},
						{ type: "Separator" },
						{
							type: "SwitchField",
							props: {
								label: "自动折叠已解决线程",
								description: "保持活动时间线简洁聚焦",
								checked: false,
							},
						},
						{ type: "Separator" },
						{
							type: "RadioGroupField",
							props: {
								label: "列表信息密度",
								value: "compact",
								options: [
									{ value: "compact", label: "紧凑模式", description: "每屏展示更多问题行" },
									{ value: "comfortable", label: "舒适模式", description: "保留更宽松的上下留白" },
								],
							},
						},
						{
							type: "SelectField",
							props: {
								label: "默认首页视图",
								value: "assigned",
								options: [
									{ value: "assigned", label: "分配给我的" },
									{ value: "created", label: "我创建的" },
									{ value: "subscribed", label: "我订阅的" },
								],
							},
						},
					],
				},
				{
					type: "CardFooter",
					children: [
						{ type: "Button", props: { variant: "default" }, children: "保存偏好" },
						{ type: "Button", props: { variant: "ghost" }, children: "恢复默认" },
					],
				},
			],
		},
	};
}

function buildTablePanelUi(): { title: string; root: UiNode; summary: string } {
	return {
		title: "项目筛选与数据面板",
		summary:
			"使用 `<ToggleGroup />` 做视图模式切换，`<Combobox />` 做可搜索成员筛选，下方搭配 `<Table />` 展示结构化项目数据与进度。",
		root: {
			type: "Card",
			children: [
				{
					type: "CardHeader",
					children: [
						{ type: "CardTitle", children: "迭代交付概览" },
						{ type: "CardDescription", children: "按视图与负责人快速筛选当前项目" },
						{
							type: "CardAction",
							children: [{ type: "Badge", props: { variant: "secondary" }, children: "进行中 · 3" }],
						},
					],
				},
				{
					type: "CardContent",
					children: [
						{
							type: "Stack",
							props: { direction: "row", gap: "sm" },
							children: [
								{
									type: "ToggleGroup",
									props: {
										label: "视图切换",
										defaultValue: "table",
										options: [
											{ value: "table", label: "列表" },
											{ value: "summary", label: "汇总" },
										],
									},
								},
								{
									type: "ComboboxField",
									props: {
										label: "负责人筛选",
										placeholder: "搜索成员…",
										options: [
											{ id: "mira", label: "Mira Chen" },
											{ id: "alex", label: "Alex Rivera" },
											{ id: "lin", label: "林然" },
										],
									},
								},
							],
						},
						{
							type: "Table",
							props: {
								columns: [
									{ key: "name", label: "项目名称" },
									{ key: "status", label: "状态" },
									{ key: "progress", label: "完成度", align: "end" },
								],
								rows: [
									{ name: "组件规范对齐", status: "进行中", progress: "84%" },
									{ name: "全局 Token 联动", status: "已完成", progress: "100%" },
									{ name: "AI 首页动态 UI", status: "验收中", progress: "92%" },
								],
							},
						},
					],
				},
			],
		},
	};
}

function buildTaskFormUi(): { title: string; root: UiNode; summary: string } {
	return {
		title: "新建任务与排期表单",
		summary:
			"整合了单行输入、可搜索组合框 `<Combobox />`、日期选择器 `<DatePicker />`、标签输入 `<TagsInput />` 与数值步进 `<NumberField />`。",
		root: {
			type: "Card",
			children: [
				{
					type: "CardHeader",
					children: [
						{ type: "CardTitle", children: "创建任务" },
						{ type: "CardDescription", children: "填写任务核心属性与预期交付时间" },
					],
				},
				{
					type: "CardContent",
					children: [
						{
							type: "InputField",
							props: { label: "任务标题", placeholder: "例如：完善设计规范页交互", required: true },
						},
						{
							type: "Grid",
							props: { columns: 2, gap: "md" },
							children: [
								{
									type: "ComboboxField",
									props: {
										label: "指派负责人",
										placeholder: "选择成员…",
										options: [
											{ id: "mira", label: "Mira Chen" },
											{ id: "alex", label: "Alex Rivera" },
										],
									},
								},
								{
									type: "DatePickerField",
									props: { label: "目标截止日期", placeholder: "选择日期" },
								},
							],
						},
						{
							type: "Grid",
							props: { columns: 2, gap: "md" },
							children: [
								{
									type: "TagsInputField",
									props: {
										label: "关联标签",
										defaultValue: ["设计系统", "交互优化"],
										placeholder: "回车添加标签",
									},
								},
								{
									type: "NumberField",
									props: { label: "预估工时（小时）", defaultValue: 4, min: 1, max: 40, step: 1 },
								},
							],
						},
						{
							type: "TextareaField",
							props: { label: "补充说明", placeholder: "描述验收标准或相关背景…" },
						},
					],
				},
				{
					type: "CardFooter",
					children: [
						{ type: "Button", props: { variant: "default" }, children: "创建任务" },
						{ type: "Button", props: { variant: "outline" }, children: "取消" },
					],
				},
			],
		},
	};
}

function buildStepperUi(): { title: string; root: UiNode; summary: string } {
	return {
		title: "分步创建向导",
		summary: "使用 `<Stepper />` 管理多步骤流程状态，配合当前步骤表单完成清晰的分阶段引导。",
		root: {
			type: "Card",
			children: [
				{
					type: "CardHeader",
					children: [
						{ type: "CardTitle", children: "初始化新工作区" },
						{ type: "CardDescription", children: "按步骤配置基础信息与设计规范" },
					],
				},
				{
					type: "CardContent",
					children: [
						{
							type: "Stepper",
							props: {
								steps: [
									{ id: "team", title: "工作区信息", description: "名称与标识" },
									{ id: "tokens", title: "全局规范", description: "圆角与主题" },
									{ id: "done", title: "完成创建", description: "生成配置" },
								],
							},
						},
						{ type: "Separator" },
						{
							type: "InputField",
							props: { label: "工作区名称", placeholder: "例如：Valar Design", required: true },
						},
					],
				},
				{
					type: "CardFooter",
					children: [{ type: "Button", props: { variant: "default" }, children: "继续下一步" }],
				},
			],
		},
	};
}

function pickUiRecipe(text: string): { title: string; root: UiNode; summary: string } {
	if (/登录|注册|验证|otp|login|auth/i.test(text)) return buildLoginUi();
	if (/设置|偏好|开关|单选|settings|switch|radio/i.test(text)) return buildSettingsUi();
	if (/表格|数据|筛选|项目|看板|table|dashboard/i.test(text)) return buildTablePanelUi();
	if (/步骤|向导|流程|stepper|wizard/i.test(text)) return buildStepperUi();
	return buildTaskFormUi();
}

function sampleForComponent(slug: string): { title: string; root: UiNode } | null {
	if (slug === "input-otp") {
		return {
			title: "验证码输入示例",
			root: {
				type: "Card",
				children: [
					{
						type: "CardContent",
						children: [
							{
								type: "InputOtpField",
								props: { label: "6 位短信验证码", maxlength: 6, description: "支持粘贴自动填充" },
							},
						],
					},
				],
			},
		};
	}
	if (slug === "combobox" || slug === "select" || slug === "native-select") {
		return {
			title: "选择器与组合框对照示例",
			root: {
				type: "Card",
				children: [
					{
						type: "CardContent",
						children: [
							{
								type: "ComboboxField",
								props: {
									label: "可搜索组合框 <Combobox />",
									placeholder: "输入关键词过滤…",
									options: [
										{ id: "svelte", label: "Svelte 5" },
										{ id: "tailwind", label: "Tailwind CSS 4" },
										{ id: "bits", label: "Bits UI" },
									],
								},
							},
							{
								type: "SelectField",
								props: {
									label: "标准下拉选择器 <Select />",
									placeholder: "从固定选项选择",
									options: [
										{ value: "high", label: "高优先级" },
										{ value: "medium", label: "中优先级" },
										{ value: "low", label: "低优先级" },
									],
								},
							},
						],
					},
				],
			},
		};
	}
	if (slug === "date-picker" || slug === "calendar") {
		return {
			title: "日期选择器示例",
			root: {
				type: "Card",
				children: [
					{
						type: "CardContent",
						children: [{ type: "DatePickerField", props: { label: "目标日期" } }],
					},
				],
			},
		};
	}
	if (slug === "number-field") {
		return {
			title: "数值输入示例",
			root: {
				type: "Card",
				children: [
					{
						type: "CardContent",
						children: [
							{
								type: "NumberField",
								props: { label: "数量", defaultValue: 5, min: 0, max: 99, step: 1 },
							},
						],
					},
				],
			},
		};
	}
	if (slug === "tags-input") {
		return {
			title: "标签输入示例",
			root: {
				type: "Card",
				children: [
					{
						type: "CardContent",
						children: [
							{
								type: "TagsInputField",
								props: { label: "关键词标签", defaultValue: ["设计规范", "基础组件"] },
							},
						],
					},
				],
			},
		};
	}
	if (slug === "stepper") {
		return {
			title: "步骤流程示例",
			root: {
				type: "Card",
				children: [
					{
						type: "CardContent",
						children: [
							{
								type: "Stepper",
								props: {
									steps: [
										{ id: "step-1", title: "选择组件" },
										{ id: "step-2", title: "调整参数" },
										{ id: "step-3", title: "应用上线" },
									],
								},
							},
						],
					},
				],
			},
		};
	}
	return null;
}

function formatComponentAdvice(infos: ComponentInfo[], titles: Map<string, string>): string {
	const lines: string[] = [];
	for (const info of infos.slice(0, 3)) {
		lines.push(`### ${info.title} \`<${info.codeName} />\``);
		if (info.description) lines.push(info.description);
		if (info.whenToUse.length) {
			lines.push(`- **适用场景**：${info.whenToUse.slice(0, 2).join("；")}`);
		}
		if (info.whenNotToUse.length) {
			const alt = info.whenNotToUse[0]!;
			const altName = alt.use ? `（建议改用「${titles.get(alt.use) ?? alt.use}」）` : "";
			lines.push(`- **避坑提醒**：${alt.case}${altName}`);
		}
		lines.push("");
	}
	return lines.join("\n").trim();
}

export function createLocalAssistantResponse(messages: UIMessage[], locale: Locale): Response {
	const query = extractLastUserText(messages);
	const allInfos = getComponentInfos(locale).filter((item) => !isAdvancedModuleSlug(item.slug));
	const titles = new Map(allInfos.map((item) => [item.slug, item.title] as const));
	const categories = basicCategories(locale);

	const stream = createUIMessageStream({
		execute: async ({ writer }) => {
			const callId = (n: number) => `local-call-${n}-${Date.now()}`;
			const textId = `local-text-${Date.now()}`;
			const emitText = (content: string) => {
				writer.write({ type: "text-start", id: textId });
				writer.write({ type: "text-delta", id: textId, delta: content });
				writer.write({ type: "text-end", id: textId });
			};

			writer.write({ type: "start" });
			writer.write({ type: "start-step" });

			if (!query || isOverviewQuery(query)) {
				const totalBasic = allInfos.length;
				const totalScenes = ADVANCED_SCENES.length;
				const totalModules = ADVANCED_MODULES.length;
				const id1 = callId(1);
				writer.write({
					type: "tool-input-available",
					toolCallId: id1,
					toolName: "list_components",
					input: {},
				});
				writer.write({
					type: "tool-output-available",
					toolCallId: id1,
					output: `基础组件共 ${totalBasic} 个（${categories.length} 大分类），高级业务场景 ${totalScenes} 套，核心业务模块 ${totalModules} 套。`,
				});

				const overviewUi: UiNode = {
					type: "Card",
					children: [
						{
							type: "CardHeader",
							children: [
								{ type: "CardTitle", children: "Valar Svelte 组件库全景" },
								{
									type: "CardDescription",
									children: "四大核心板块均已使用自家基础组件构建，样式与全局 Token 实时联动",
								},
							],
						},
						{
							type: "CardContent",
							children: [
								{
									type: "Grid",
									props: { columns: 2, gap: "sm" },
									children: [
										{
											type: "Alert",
											children: [
												{ type: "AlertTitle", children: `基础组件 · ${totalBasic} 个` },
												{
													type: "AlertDescription",
													children: `覆盖 ${categories.map((c) => c.title).join("、")}`,
												},
											],
										},
										{
											type: "Alert",
											children: [
												{
													type: "AlertTitle",
													children: `高级组件 · ${totalScenes} 套完整界面 + ${totalModules} 个模块`,
												},
												{
													type: "AlertDescription",
													children: "我的问题、项目管理、收件箱、新建问题、设置页、AI 工作台",
												},
											],
										},
									],
								},
								{
									type: "Table",
									props: {
										columns: [
											{ key: "section", label: "板块" },
											{ key: "focus", label: "核心能力" },
										],
										rows: [
											{ section: "1. AI 对话首页", focus: "组件检索、选型对比、动态拼装实时界面" },
											{ section: "2. 基础组件", focus: "全量展示、即时搜索、状态调节、AI 规范导出" },
											{ section: "3. 高级组件", focus: "完整业务场景预览、所用基础组件溯源跳转" },
											{ section: "4. 设计规范", focus: "色彩/排版/圆角/焦点全局标准与实时调参" },
										],
									},
								},
							],
						},
						{
							type: "CardFooter",
							children: [
								{
									type: "Button",
									props: { variant: "default", href: localizeHref("/docs/components", locale) },
									children: "浏览基础组件",
								},
								{
									type: "Button",
									props: { variant: "outline", href: localizeHref("/docs/ai-elements", locale) },
									children: "查看高级界面",
								},
								{
									type: "Button",
									props: { variant: "outline", href: localizeHref("/themes", locale) },
									children: "设计规范与 Token",
								},
							],
						},
					],
				};

				const validated = validateUi(overviewUi);
				if (validated.ok) {
					const id2 = callId(2);
					writer.write({
						type: "tool-input-available",
						toolCallId: id2,
						toolName: "show_ui",
						input: { title: "组件库四大板块概览", root: validated.root },
					});
					writer.write({
						type: "tool-output-available",
						toolCallId: id2,
						output: { ok: true, count: validated.count },
					});
				}

				emitText(
					`当前组件库包含 **${totalBasic} 个基础组件**、**${totalScenes} 套完整业务界面** 与 **${totalModules} 个核心业务模块**，以及一套全站实时联动的全局设计规范。\n\n你可以直接让我：\n- 按场景帮你选组件（例如：「输入 6 位短信验证码用哪个组件？」）\n- 对比相似组件怎么选（例如：「下拉选择器、组合框、原生选择器怎么选？」）\n- 直接拼装动态界面效果（例如：「设计一个登录表单」或「搭一个项目数据面板」）`
				);
			} else if (isBuildUiQuery(query)) {
				const recipe = pickUiRecipe(query);
				const id1 = callId(1);
				writer.write({
					type: "tool-input-available",
					toolCallId: id1,
					toolName: "get_ui_catalog",
					input: {},
				});
				writer.write({
					type: "tool-output-available",
					toolCallId: id1,
					output: "已读取 Valar 动态界面积木规范。",
				});

				const validated = validateUi(recipe.root);
				if (validated.ok) {
					const id2 = callId(2);
					writer.write({
						type: "tool-input-available",
						toolCallId: id2,
						toolName: "show_ui",
						input: { title: recipe.title, root: validated.root },
					});
					writer.write({
						type: "tool-output-available",
						toolCallId: id2,
						output: { ok: true, count: validated.count },
					});
				}

				emitText(
					`${recipe.summary}\n\n上方界面完全使用库内真实 Svelte 基础组件实时渲染，可直接点击交互；界面下方列出了所用到的每个基础组件，点击即可跳转查看设计规范或调节样式。`
				);
			} else {
				const matches = searchComponents(allInfos, query, 5).map((item) => item.info);
				const sceneMatches = ADVANCED_SCENES.filter((scene) => {
					const hay = [scene.title.zh, scene.title.en, scene.description.zh, ...scene.keywords]
						.join(" ")
						.toLowerCase();
					return query
						.toLowerCase()
						.split(/\s+/)
						.some((term) => term.length >= 2 && hay.includes(term));
				});

				const id1 = callId(1);
				writer.write({
					type: "tool-input-available",
					toolCallId: id1,
					toolName: "search_components",
					input: { query },
				});
				const toolLines = matches.length
					? matches
							.map((info) => `- \`${info.slug}\` ${info.title}（${info.description}）`)
							.join("\n")
					: "未直接匹配到基础组件。";
				writer.write({
					type: "tool-output-available",
					toolCallId: id1,
					output: toolLines,
				});

				if (matches.length) {
					const preview = sampleForComponent(matches[0]!.slug);
					if (preview) {
						const validated = validateUi(preview.root);
						if (validated.ok) {
							const id2 = callId(2);
							writer.write({
								type: "tool-input-available",
								toolCallId: id2,
								toolName: "show_ui",
								input: { title: preview.title, root: validated.root },
							});
							writer.write({
								type: "tool-output-available",
								toolCallId: id2,
								output: { ok: true, count: validated.count },
							});
						}
					}
					const sceneNote = sceneMatches.length
						? `\n\n### 相关现成高级界面\n${sceneMatches
								.map((s) => `- **${s.title.zh}**：${s.description.zh}`)
								.join("\n")}`
						: "";
					emitText(`${formatComponentAdvice(matches, titles)}${sceneNote}`);
				} else if (sceneMatches.length) {
					emitText(
						`为你找到以下现成的高级业务界面：\n\n${sceneMatches
							.map((s) => `- **${s.title.zh}**：${s.description.zh}`)
							.join("\n")}\n\n你可以在顶部「高级组件」中直接体验完整交互并查看它拆解出的基础组件。`
					);
				} else {
					emitText(
						`当前没有直接匹配「${query}」的单一组件。你可以：\n- 在「基础组件」页通过实时搜索浏览全部 ${allInfos.length} 个基础组件（覆盖${categories.map((c) => c.title).join("、")}）；\n- 在「高级组件」页查看 ${ADVANCED_SCENES.length} 套完整业务界面；\n- 或者告诉我具体想做的页面（例如「设计一个登录表单」），我直接帮你拼出效果。`
					);
				}
			}

			writer.write({ type: "finish-step" });
			writer.write({ type: "finish", finishReason: "stop" });
		},
	});

	return createUIMessageStreamResponse({ stream });
}
