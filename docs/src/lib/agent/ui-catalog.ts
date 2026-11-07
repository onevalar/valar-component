import { z } from "zod";

/**
 * The single contract for interfaces the assistant composes. The agent never writes UI code: it
 * sends a tree of `{ type, props, children }` nodes made of the library's own components.
 * This catalog validates that tree, produces the documentation the agent reads, and fixes what the
 * renderer (`ui-renderer.svelte`) has to support; do not describe these components anywhere else.
 *
 * Choices that keep the output from making basic design mistakes are built into the shapes:
 * there is no `class` or `style` prop, every input is a *Field with a required label, sizes and
 * colours are named variants, and spacing is a named step.
 */

export type UiNode = {
	type: string;
	props?: Record<string, unknown>;
	children?: UiNode[] | string;
};

const text = z.string().max(2000);
const label = z.string().trim().min(1).max(120);
const gap = z.enum(["sm", "md", "lg"]).optional();
const option = z.strictObject({ value: z.string().min(1).max(80), label });
const fieldBase = {
	label,
	description: text.optional(),
	error: text.optional(),
	disabled: z.boolean().optional(),
	required: z.boolean().optional(),
};

type Children = "nodes" | "text" | "none";

function define<S extends z.ZodRawShape>(entry: {
	type: string;
	name: string;
	useWhen: string;
	avoidWhen?: string;
	props: S;
	children: Children;
	/** If set, only these node types may appear directly inside. */
	allowedChildren?: string[];
	example: UiNode;
}) {
	return { ...entry, schema: z.strictObject(entry.props) };
}

const stackExample: UiNode = {
	type: "Stack",
	props: { direction: "column", gap: "md" },
	children: [
		{ type: "Heading", props: { level: 3 }, children: "示例标题" },
		{ type: "Text", props: { tone: "muted" }, children: "一段说明文字。" },
		{
			type: "Stack",
			props: { direction: "row", gap: "sm" },
			children: [
				{ type: "Button", children: "主要操作" },
				{ type: "Button", props: { variant: "outline" }, children: "次要操作" },
			],
		},
	],
};

export const UI_CATALOG = [
	// ---- layout and text -------------------------------------------------------------------
	define({
		type: "Stack",
		name: "堆叠布局",
		useWhen: "把几个元素按一个方向排开：direction=column 竖排，row 横排（窄屏自动换行）",
		avoidWhen: "需要等宽的多列时用 Grid",
		props: {
			direction: z.enum(["column", "row"]).optional(),
			gap,
			align: z.enum(["start", "center", "end"]).optional(),
		},
		children: "nodes",
		example: stackExample,
	}),
	define({
		type: "Grid",
		name: "网格布局",
		useWhen: "并排放 2～4 个等宽的块，如一排卡片；窄屏自动变成单列",
		avoidWhen: "只有一列时用 Stack",
		props: { columns: z.number().int().min(1).max(4), gap },
		children: "nodes",
		example: {
			type: "Grid",
			props: { columns: 2 },
			children: [
				{
					type: "Card",
					children: [{ type: "CardHeader", children: [{ type: "CardTitle", children: "左" }] }],
				},
				{
					type: "Card",
					children: [{ type: "CardHeader", children: [{ type: "CardTitle", children: "右" }] }],
				},
			],
		},
	}),
	define({
		type: "Heading",
		name: "标题",
		useWhen: "给一块内容起标题；level 2 是区块标题，3 是小标题",
		props: { level: z.union([z.literal(2), z.literal(3)]).optional() },
		children: "text",
		example: { type: "Heading", props: { level: 2 }, children: "账号设置" },
	}),
	define({
		type: "Text",
		name: "文字",
		useWhen: "一段说明；tone=muted 用于次要说明",
		avoidWhen: "卡片里的标题和说明用 CardTitle、CardDescription",
		props: { tone: z.enum(["default", "muted"]).optional() },
		children: "text",
		example: { type: "Text", props: { tone: "muted" }, children: "修改后立即生效。" },
	}),
	define({
		type: "Separator",
		name: "分割线",
		useWhen: "分隔两组不相关的内容",
		props: {},
		children: "none",
		example: { type: "Separator" },
	}),

	// ---- actions and status ----------------------------------------------------------------
	define({
		type: "Button",
		name: "按钮",
		useWhen:
			"触发操作；一个区域最多一个 variant=default 的主按钮，其余用 outline 或 secondary；危险操作用 destructive",
		avoidWhen: "跳转到别处时设 href（它会渲染为链接）",
		props: {
			variant: z
				.enum(["default", "outline", "secondary", "ghost", "destructive", "link"])
				.optional(),
			size: z.enum(["xs", "sm", "default", "lg"]).optional(),
			href: z.string().max(500).optional(),
			disabled: z.boolean().optional(),
		},
		children: "text",
		example: { type: "Button", props: { variant: "outline" }, children: "取消" },
	}),
	define({
		type: "Badge",
		name: "徽标",
		useWhen: "状态、分类或计数的简短标记，一两个词",
		avoidWhen: "需要点击时用 Button",
		props: { variant: z.enum(["default", "secondary", "destructive", "outline"]).optional() },
		children: "text",
		example: { type: "Badge", props: { variant: "secondary" }, children: "草稿" },
	}),
	define({
		type: "Alert",
		name: "提示框",
		useWhen: "需要用户注意的信息；variant=destructive 表示错误或风险",
		avoidWhen: "操作完成后的短暂反馈",
		props: { variant: z.enum(["default", "destructive"]).optional() },
		children: "nodes",
		allowedChildren: ["AlertTitle", "AlertDescription"],
		example: {
			type: "Alert",
			children: [
				{ type: "AlertTitle", children: "保存成功" },
				{ type: "AlertDescription", children: "更改已同步到所有设备。" },
			],
		},
	}),
	define({
		type: "AlertTitle",
		name: "提示框标题",
		useWhen: "Alert 里的要点",
		props: {},
		children: "text",
		example: { type: "AlertTitle", children: "提示" },
	}),
	define({
		type: "AlertDescription",
		name: "提示框说明",
		useWhen: "Alert 里的细节",
		props: {},
		children: "text",
		example: { type: "AlertDescription", children: "细节说明。" },
	}),
	define({
		type: "Progress",
		name: "进度条",
		useWhen: "完成度；label 是读屏用的名称",
		props: { value: z.number().min(0), max: z.number().positive().optional(), label },
		children: "none",
		example: { type: "Progress", props: { value: 64, max: 100, label: "上传进度" } },
	}),
	define({
		type: "Spinner",
		name: "加载指示器",
		useWhen: "正在加载",
		props: {},
		children: "none",
		example: { type: "Spinner" },
	}),
	define({
		type: "Kbd",
		name: "键帽",
		useWhen: "展示快捷键，如 ⌘K",
		props: {},
		children: "text",
		example: { type: "Kbd", children: "⌘K" },
	}),
	define({
		type: "Avatar",
		name: "头像",
		useWhen: "用户头像；没有图片时显示 fallback（一两个字）",
		props: {
			fallback: z.string().max(4),
			src: z.string().max(500).optional(),
			alt: z.string().max(120).optional(),
		},
		children: "none",
		example: { type: "Avatar", props: { fallback: "王" } },
	}),
	define({
		type: "Empty",
		name: "空状态",
		useWhen: "列表或搜索结果为空；标题说明现状，说明告诉用户怎么做，操作按钮放在 children",
		props: { title: label, description: text.optional() },
		children: "nodes",
		example: {
			type: "Empty",
			props: { title: "还没有项目", description: "新建一个项目开始使用。" },
			children: [{ type: "Button", children: "新建项目" }],
		},
	}),
	define({
		type: "Breadcrumb",
		name: "面包屑",
		useWhen: "显示当前位置；最后一项是当前页，不设 href",
		props: {
			items: z
				.array(z.strictObject({ label, href: z.string().max(500).optional() }))
				.min(1)
				.max(8),
		},
		children: "none",
		example: {
			type: "Breadcrumb",
			props: { items: [{ label: "首页", href: "/" }, { label: "设置" }] },
		},
	}),

	// ---- cards -----------------------------------------------------------------------------
	define({
		type: "Card",
		name: "卡片",
		useWhen: "把相关内容放进一个有边框的块；卡片内最多一个主按钮",
		props: { size: z.enum(["default", "sm"]).optional() },
		children: "nodes",
		allowedChildren: ["CardHeader", "CardContent", "CardFooter"],
		example: {
			type: "Card",
			children: [
				{
					type: "CardHeader",
					children: [
						{ type: "CardTitle", children: "本月收入" },
						{ type: "CardDescription", children: "较上月增长 12%" },
					],
				},
				{ type: "CardContent", children: [{ type: "Text", children: "¥ 128,000" }] },
				{ type: "CardFooter", children: [{ type: "Button", children: "查看明细" }] },
			],
		},
	}),
	define({
		type: "CardHeader",
		name: "卡片头部",
		useWhen: "放标题、说明和右上角操作",
		props: {},
		children: "nodes",
		allowedChildren: ["CardTitle", "CardDescription", "CardAction"],
		example: { type: "CardHeader", children: [{ type: "CardTitle", children: "标题" }] },
	}),
	define({
		type: "CardTitle",
		name: "卡片标题",
		useWhen: "卡片的标题",
		props: {},
		children: "text",
		example: { type: "CardTitle", children: "标题" },
	}),
	define({
		type: "CardDescription",
		name: "卡片说明",
		useWhen: "标题下面的一句说明",
		props: {},
		children: "text",
		example: { type: "CardDescription", children: "一句说明" },
	}),
	define({
		type: "CardAction",
		name: "卡片右上角操作",
		useWhen: "放在头部右上角的按钮或徽标",
		props: {},
		children: "nodes",
		example: { type: "CardAction", children: [{ type: "Badge", children: "新" }] },
	}),
	define({
		type: "CardContent",
		name: "卡片内容",
		useWhen: "卡片正文，可以放任何内容",
		props: {},
		children: "nodes",
		example: { type: "CardContent", children: [{ type: "Text", children: "正文" }] },
	}),
	define({
		type: "CardFooter",
		name: "卡片底部",
		useWhen: "放操作按钮",
		props: {},
		children: "nodes",
		example: { type: "CardFooter", children: [{ type: "Button", children: "确定" }] },
	}),

	// ---- form fields: every input comes with its label ---------------------------------------
	define({
		type: "InputField",
		name: "输入框（带标签）",
		useWhen: "单行文本、邮箱、密码、数字等输入；label 必填",
		avoidWhen: "多行文字用 TextareaField；固定选项用 SelectField 或 RadioGroupField",
		props: {
			...fieldBase,
			type: z.enum(["text", "email", "password", "number", "search", "url", "tel"]).optional(),
			placeholder: z.string().max(200).optional(),
			value: z.string().max(2000).optional(),
		},
		children: "none",
		example: {
			type: "InputField",
			props: {
				label: "邮箱",
				type: "email",
				placeholder: "name@example.com",
				description: "用于接收通知",
			},
		},
	}),
	define({
		type: "TextareaField",
		name: "多行输入框（带标签）",
		useWhen: "多行文字，如备注、反馈",
		props: {
			...fieldBase,
			placeholder: z.string().max(200).optional(),
			value: z.string().max(5000).optional(),
		},
		children: "none",
		example: { type: "TextareaField", props: { label: "反馈", placeholder: "说说你的想法" } },
	}),
	define({
		type: "CheckboxField",
		name: "复选框（带标签）",
		useWhen: "可多选的选项，或同意条款",
		props: { ...fieldBase, checked: z.boolean().optional() },
		children: "none",
		example: { type: "CheckboxField", props: { label: "我同意服务条款", checked: true } },
	}),
	define({
		type: "SwitchField",
		name: "开关（带标签）",
		useWhen: "立即生效的开启或关闭设置",
		avoidWhen: "需要点保存才生效的选项用 CheckboxField",
		props: { ...fieldBase, checked: z.boolean().optional() },
		children: "none",
		example: {
			type: "SwitchField",
			props: { label: "接收邮件通知", description: "每周一发送摘要" },
		},
	}),
	define({
		type: "SelectField",
		name: "下拉选择（带标签）",
		useWhen: "从 6 个以上固定选项里选一个",
		avoidWhen: "2～5 个选项用 RadioGroupField 一眼看全",
		props: {
			...fieldBase,
			options: z.array(option).min(2).max(60),
			placeholder: z.string().max(120).optional(),
			value: z.string().max(80).optional(),
		},
		children: "none",
		example: {
			type: "SelectField",
			props: {
				label: "语言",
				placeholder: "请选择语言",
				options: [
					{ value: "zh", label: "中文" },
					{ value: "en", label: "English" },
				],
			},
		},
	}),
	define({
		type: "RadioGroupField",
		name: "单选组（带标签）",
		useWhen: "2～5 个互斥选项，需要一眼看全",
		props: {
			...fieldBase,
			options: z
				.array(
					z.strictObject({ value: z.string().min(1).max(80), label, description: text.optional() })
				)
				.min(2)
				.max(6),
			value: z.string().max(80).optional(),
		},
		children: "none",
		example: {
			type: "RadioGroupField",
			props: {
				label: "套餐",
				value: "pro",
				options: [
					{ value: "free", label: "免费版" },
					{ value: "pro", label: "专业版" },
				],
			},
		},
	}),
	define({
		type: "SliderField",
		name: "滑块（带标签）",
		useWhen: "在已知范围内拖动调整数值",
		props: {
			label,
			min: z.number(),
			max: z.number(),
			step: z.number().positive().optional(),
			value: z.number(),
			unit: z.string().max(8).optional(),
		},
		children: "none",
		example: { type: "SliderField", props: { label: "音量", min: 0, max: 100, value: 60 } },
	}),

	// ---- structured content -----------------------------------------------------------------
	define({
		type: "Table",
		name: "表格",
		useWhen: "多行同结构的数据；columns 定义列，rows 是对象数组，键对应 columns[].key",
		avoidWhen: "只有一个对象时用 Card；数字列设 align=end",
		props: {
			caption: text.optional(),
			columns: z
				.array(
					z.strictObject({
						key: z.string().min(1).max(60),
						label,
						align: z.enum(["start", "end"]).optional(),
					})
				)
				.min(1)
				.max(12),
			rows: z
				.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])))
				.max(100),
		},
		children: "none",
		example: {
			type: "Table",
			props: {
				caption: "本周用量",
				columns: [
					{ key: "name", label: "账号" },
					{ key: "tokens", label: "Token", align: "end" },
				],
				rows: [
					{ name: "张三", tokens: 12000 },
					{ name: "李四", tokens: 8000 },
				],
			},
		},
	}),
	define({
		type: "Tabs",
		name: "标签页",
		useWhen: "同一位置在几组内容间切换；children 只能是 TabPanel",
		props: { defaultValue: z.string().max(80).optional() },
		children: "nodes",
		allowedChildren: ["TabPanel"],
		example: {
			type: "Tabs",
			props: { defaultValue: "a" },
			children: [
				{
					type: "TabPanel",
					props: { value: "a", label: "概览" },
					children: [{ type: "Text", children: "概览内容" }],
				},
				{
					type: "TabPanel",
					props: { value: "b", label: "设置" },
					children: [{ type: "Text", children: "设置内容" }],
				},
			],
		},
	}),
	define({
		type: "TabPanel",
		name: "标签页面板",
		useWhen: "Tabs 的一页；value 在同一个 Tabs 内唯一",
		props: { value: z.string().min(1).max(80), label },
		children: "nodes",
		example: {
			type: "TabPanel",
			props: { value: "a", label: "概览" },
			children: [{ type: "Text", children: "内容" }],
		},
	}),
	define({
		type: "Accordion",
		name: "折叠面板",
		useWhen: "把次要内容收起来，如常见问题；children 只能是 AccordionItem",
		props: { type: z.enum(["single", "multiple"]).optional() },
		children: "nodes",
		allowedChildren: ["AccordionItem"],
		example: {
			type: "Accordion",
			children: [
				{
					type: "AccordionItem",
					props: { title: "如何退款？" },
					children: [{ type: "Text", children: "30 天内可退款。" }],
				},
				{
					type: "AccordionItem",
					props: { title: "如何联系客服？" },
					children: [{ type: "Text", children: "发邮件即可。" }],
				},
			],
		},
	}),
	define({
		type: "AccordionItem",
		name: "折叠面板项",
		useWhen: "Accordion 的一项；title 是常显的标题",
		props: { title: label },
		children: "nodes",
		example: {
			type: "AccordionItem",
			props: { title: "标题" },
			children: [{ type: "Text", children: "内容" }],
		},
	}),
	define({
		type: "Dialog",
		name: "对话框",
		useWhen: "需要用户专注完成的一小步；点 triggerLabel 的按钮打开，children 是正文",
		avoidWhen: "不可撤销的操作确认也可以用它，但危险按钮要设 variant=destructive",
		props: { triggerLabel: label, title: label, description: text.optional() },
		children: "nodes",
		example: {
			type: "Dialog",
			props: { triggerLabel: "编辑资料", title: "编辑资料", description: "修改后点保存。" },
			children: [{ type: "InputField", props: { label: "名字", value: "王" } }],
		},
	}),
] as const;

export type UiType = (typeof UI_CATALOG)[number]["type"];

const byType = new Map<string, (typeof UI_CATALOG)[number]>(
	UI_CATALOG.map((entry) => [entry.type, entry])
);
export const UI_TYPES = UI_CATALOG.map((entry) => entry.type) as UiType[];

export const UI_LIMITS = { nodes: 150, depth: 8, bytes: 200_000 } as const;

/** Chinese, per-field error messages the agent can act on, e.g. `root.children[1].props.variant：…`. */
export function validateUi(
	root: unknown
): { ok: true; root: UiNode; count: number } | { ok: false; errors: string[] } {
	const errors: string[] = [];
	let count = 0;

	try {
		if (JSON.stringify(root).length > UI_LIMITS.bytes) {
			return { ok: false, errors: [`整棵树超过 ${UI_LIMITS.bytes / 1000} KB，请精简内容`] };
		}
	} catch {
		return { ok: false, errors: ["root 不是合法的 JSON"] };
	}

	function visit(node: unknown, path: string, depth: number, allowed?: string[]) {
		count++;
		if (count > UI_LIMITS.nodes) {
			if (count === UI_LIMITS.nodes + 1) errors.push(`节点总数超过 ${UI_LIMITS.nodes} 个，请精简`);
			return;
		}
		if (depth > UI_LIMITS.depth) {
			errors.push(`${path}：嵌套超过 ${UI_LIMITS.depth} 层`);
			return;
		}
		if (!node || typeof node !== "object" || Array.isArray(node)) {
			errors.push(`${path}：每个节点必须是 { type, props, children } 对象`);
			return;
		}
		const { type, props, children, ...extra } = node as Record<string, unknown>;
		const entry = typeof type === "string" ? byType.get(type) : undefined;
		if (!entry) {
			errors.push(
				`${path}：不认识的组件类型 ${JSON.stringify(type)}。可用类型：${UI_TYPES.join("、")}`
			);
			return;
		}
		if (allowed && !allowed.includes(entry.type)) {
			errors.push(`${path}：${entry.type} 不能直接放在这里，这里只能放 ${allowed.join("、")}`);
		}
		if (Object.keys(extra).length) {
			errors.push(
				`${path}：多余的字段 ${Object.keys(extra).join("、")}（节点只有 type、props、children）`
			);
		}

		const parsed = entry.schema.safeParse(props ?? {});
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const where = issue.path.length ? `.${issue.path.join(".")}` : "";
				const detail =
					issue.code === "unrecognized_keys"
						? `不支持的属性 ${issue.keys.join("、")}（${entry.type} 没有这个属性；样式只能用 variant、size 等命名选项）`
						: issue.message;
				errors.push(`${path}.props${where}：${detail}`);
			}
		}

		if (entry.children === "none") {
			if (children !== undefined && !(Array.isArray(children) && children.length === 0)) {
				errors.push(`${path}：${entry.type} 不能有 children`);
			}
		} else if (entry.children === "text") {
			if (children !== undefined && typeof children !== "string") {
				errors.push(`${path}：${entry.type} 的 children 必须是一段文字`);
			}
		} else if (children !== undefined) {
			if (!Array.isArray(children)) {
				errors.push(`${path}：${entry.type} 的 children 必须是节点数组`);
			} else {
				children.forEach((child, index) =>
					visit(
						child,
						`${path}.children[${index}]`,
						depth + 1,
						(entry as { allowedChildren?: string[] }).allowedChildren
					)
				);
			}
		}
	}

	visit(root, "root", 1);
	return errors.length
		? { ok: false, errors: errors.slice(0, 20) }
		: { ok: true, root: root as UiNode, count };
}

/** One line per component for the system prompt; the details come from `uiCatalogDetails`. */
export function uiCatalogIndex(): string {
	return UI_CATALOG.map((entry) => `- ${entry.type}（${entry.name}）：${entry.useWhen}`).join("\n");
}

/** Full description of some components: props as JSON Schema, children rule and a working example. */
export function uiCatalogDetails(types?: string[]) {
	const list = types?.length
		? UI_CATALOG.filter((entry) => types.includes(entry.type))
		: UI_CATALOG;
	return list.map((entry) => ({
		type: entry.type,
		name: entry.name,
		useWhen: entry.useWhen,
		avoidWhen: entry.avoidWhen,
		children:
			entry.children === "nodes"
				? `节点数组${"allowedChildren" in entry && entry.allowedChildren ? `，只能是 ${entry.allowedChildren.join("、")}` : ""}`
				: entry.children === "text"
					? "一段文字（字符串）"
					: "无",
		props: z.toJSONSchema(entry.schema, { io: "input" }),
		example: entry.example,
	}));
}
