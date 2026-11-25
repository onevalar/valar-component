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
	// ---- page layout -----------------------------------------------------------------------
	define({
		type: "PageLayout",
		name: "页面骨架",
		useWhen:
			"搭建完整页面时的根容器；width=full 用于列表/表格/看板/工作台，width=narrow（居中限宽）用于设置/表单/详情页",
		avoidWhen: "仅展示局部小卡片或单个控件时直接用 Stack 或 Card",
		props: { width: z.enum(["full", "narrow"]).optional() },
		children: "nodes",
		example: {
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
									props: {
										label: "桌面推送",
										description: "仅在浏览器授权后生效",
										checked: false,
									},
								},
							],
						},
					],
				},
			],
		},
	}),
	define({
		type: "PageHeader",
		name: "页面顶栏",
		useWhen: "页面顶部单行标题栏；title 必填且保持中性简短（不写多余副标题），右侧操作按钮放 children（最多 1 个主按钮）",
		props: { title: label },
		children: "nodes",
		example: {
			type: "PageHeader",
			props: { title: "成员权限" },
			children: [
				{ type: "Button", props: { variant: "outline", size: "sm" }, children: "导出" },
				{ type: "Button", props: { size: "sm" }, children: "邀请成员" },
			],
		},
	}),
	define({
		type: "PageToolbar",
		name: "页面工具栏",
		useWhen:
			"顶栏下方的紧凑工具条，放 SearchInput（搜索框）、FilterSelect（紧凑筛选下拉）、ToggleGroup、ButtonGroup 或统计 Badge；左右分栏时放 2 个直接子项（可用 Stack(row, gap=sm) 各自归组）",
		avoidWhen: "不要把带顶部标签的 InputField 或 SelectField 直接放进工具栏（会撑高行高导致同行按钮错位），改用 SearchInput 和 FilterSelect",
		props: {},
		children: "nodes",
		example: {
			type: "PageToolbar",
			children: [
				{
					type: "Stack",
					props: { direction: "row", gap: "sm" },
					children: [
						{
							type: "SearchInput",
							props: { label: "搜索记录", placeholder: "关键词或编号", value: "付款审批" },
						},
						{
							type: "FilterSelect",
							props: {
								label: "状态筛选",
								value: "all",
								options: [
									{ value: "all", label: "全部状态" },
									{ value: "open", label: "进行中" },
								],
							},
						},
					],
				},
				{
					type: "Stack",
					props: { direction: "row", gap: "sm" },
					children: [
						{ type: "Badge", props: { variant: "secondary" }, children: "共 12 项" },
						{
							type: "ButtonGroup",
							props: { label: "命中切换", variant: "pill" },
							children: [
								{ type: "Button", props: { variant: "ghost", size: "sm" }, children: "上一处" },
								{ type: "Button", props: { variant: "ghost", size: "sm" }, children: "下一处" },
							],
						},
					],
				},
			],
		},
	}),
	define({
		type: "PageSection",
		name: "页面区块",
		useWhen:
			"页面内容区块；默认 surface=plain 用留白分隔，仅需要单层归组面板时设 surface=card（禁止内部再嵌套 Card 或 card 区块）",
		props: {
			title: label.optional(),
			surface: z.enum(["plain", "card"]).optional(),
		},
		children: "nodes",
		example: {
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
	}),
	define({
		type: "PropertyList",
		name: "属性列表",
		useWhen:
			"横向属性行容器；layout=settings 用于设置项（自带 0.5px 分隔线），layout=detail 用于详情页键值展示；children 只能是 PropertyRow",
		props: { layout: z.enum(["settings", "detail"]).optional() },
		children: "nodes",
		allowedChildren: ["PropertyRow"],
		example: {
			type: "PropertyList",
			props: { layout: "detail" },
			children: [
				{ type: "PropertyRow", props: { label: "工作区标识", value: "valar-core" } },
				{ type: "PropertyRow", props: { label: "成员数量", value: "18" } },
			],
		},
	}),
	define({
		type: "PropertyRow",
		name: "属性行",
		useWhen:
			"PropertyList 中的单行：设置项传 checked 直接在右侧渲染开关，或在 children 放 Button／Badge／ToggleGroup；详情项传 value 展示只读值",
		avoidWhen: "设置行内不要再嵌套 SwitchField 以免标签重复",
		props: {
			label,
			description: text.optional(),
			value: text.optional(),
			checked: z.boolean().optional(),
			disabled: z.boolean().optional(),
			layout: z.enum(["settings", "detail"]).optional(),
		},
		children: "nodes",
		example: {
			type: "PropertyRow",
			props: { label: "桌面推送", description: "仅在浏览器授权后生效", checked: false },
		},
	}),

	// ---- layout and text -------------------------------------------------------------------
	define({
		type: "Stack",
		name: "堆叠布局",
		useWhen:
			"把几个元素按一个方向排开：direction=column 竖排，row 横排（窄屏自动换行）；横排可配 justify=between 左右分散对齐",
		avoidWhen: "需要等宽的多列时用 Grid；左右不等宽主从双栏用 SplitLayout",
		props: {
			direction: z.enum(["column", "row"]).optional(),
			gap,
			align: z.enum(["start", "center", "end"]).optional(),
			justify: z.enum(["start", "between", "end"]).optional(),
		},
		children: "nodes",
		example: stackExample,
	}),
	define({
		type: "SplitLayout",
		name: "双栏分栏布局",
		useWhen:
			"主从双栏视图（如左侧命中/会话列表 + 右侧消息原文或详情、左侧筛选/导航 + 右侧正文）；ratio 支持 1:2、2:1、1:1，窄屏自动折为单列；children 必须恰好 2 个节点",
		avoidWhen: "等宽 2～4 列卡片矩阵用 Grid",
		props: {
			ratio: z.enum(["1:2", "2:1", "1:1"]).optional(),
			gap,
			divided: z.boolean().optional(),
		},
		children: "nodes",
		example: {
			type: "SplitLayout",
			props: { ratio: "1:2", divided: true },
			children: [
				{
					type: "ItemList",
					props: { label: "命中列表" },
					children: [
						{
							type: "ItemRow",
							props: { meta: "10:24", title: "付款审批已提交复核", active: true },
							children: [{ type: "Badge", props: { variant: "secondary" }, children: "2 / 3" }],
						},
					],
				},
				{
					type: "MessageList",
					props: { label: "对话原文", highlight: "付款审批" },
					children: [
						{
							type: "ChatMessage",
							props: {
								sender: "林岚",
								avatar: "林",
								time: "10:24",
								content: "这笔付款审批已经提交财务复核，预计下午完成。",
								active: true,
								meta: "第 2 / 3 处",
							},
						},
					],
				},
			],
		},
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
		type: "ButtonGroup",
		name: "相连按钮组",
		useWhen:
			"把 2～4 个相关紧凑操作连成一体（如“上一处／下一处”、翻页或分体操作）；children 只能是 Button，组内统一用 variant=ghost 或 outline、size=sm",
		avoidWhen: "单选视图切换用 ToggleGroup；普通独立按钮用 Stack(row)",
		props: {
			label: label.optional(),
			variant: z.enum(["default", "pill"]).optional(),
		},
		children: "nodes",
		allowedChildren: ["Button"],
		example: {
			type: "ButtonGroup",
			props: { label: "命中跳转", variant: "pill" },
			children: [
				{ type: "Button", props: { variant: "ghost", size: "sm" }, children: "上一处" },
				{ type: "Button", props: { variant: "ghost", size: "sm" }, children: "下一处" },
			],
		},
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

	// ---- toolbar controls (compact, no visible top label) -----------------------------------
	define({
		type: "SearchInput",
		name: "工具栏搜索框",
		useWhen:
			"工具栏或列表顶部的紧凑搜索框（自带放大镜图标与可清除输入，无顶部标签，与同行按钮齐平）；可配 actionLabel 在框内放触发按钮",
		avoidWhen: "常规表单需要独立可见标签时用 InputField",
		props: {
			label,
			placeholder: z.string().max(120).optional(),
			value: z.string().max(200).optional(),
			actionLabel: label.optional(),
			disabled: z.boolean().optional(),
		},
		children: "none",
		example: {
			type: "SearchInput",
			props: { label: "搜索对话", placeholder: "关键词、发送人", value: "付款审批", actionLabel: "查询" },
		},
	}),
	define({
		type: "FilterSelect",
		name: "工具栏筛选下拉",
		useWhen: "工具栏或列表头部的紧凑筛选下拉（无顶部标签，与 SearchInput、按钮齐平）",
		avoidWhen: "常规表单里带可见标签的下拉用 SelectField",
		props: {
			label,
			options: z.array(option).min(2).max(40),
			placeholder: z.string().max(80).optional(),
			value: z.string().max(80).optional(),
			disabled: z.boolean().optional(),
		},
		children: "none",
		example: {
			type: "FilterSelect",
			props: {
				label: "按发送人筛选",
				value: "all",
				options: [
					{ value: "all", label: "全部成员" },
					{ value: "finance", label: "财务团队" },
				],
			},
		},
	}),

	// ---- form fields: every input comes with its label ---------------------------------------
	define({
		type: "InputField",
		name: "输入框（带标签）",
		useWhen: "表单内的单行文本、邮箱、密码、数字等输入；label 必填",
		avoidWhen: "工具栏搜索改用 SearchInput；多行文字用 TextareaField；固定选项用 SelectField 或 RadioGroupField",
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
	define({
		type: "InputOtpField",
		name: "验证码输入（带标签）",
		useWhen: "输入 4 位或 6 位一次性短信/邮箱验证码",
		props: {
			...fieldBase,
			maxlength: z.union([z.literal(4), z.literal(6)]).optional(),
			value: z.string().max(6).optional(),
		},
		children: "none",
		example: {
			type: "InputOtpField",
			props: { label: "短信验证码", maxlength: 6, description: "输入收到的 6 位数字" },
		},
	}),
	define({
		type: "NumberField",
		name: "数值输入（带标签）",
		useWhen: "需要加减步进按钮或范围限制的数字输入",
		avoidWhen: "不需要精确步进、只需拖动概览用 SliderField",
		props: {
			...fieldBase,
			defaultValue: z.number().optional(),
			min: z.number().optional(),
			max: z.number().optional(),
			step: z.number().positive().optional(),
		},
		children: "none",
		example: {
			type: "NumberField",
			props: { label: "人数上限", defaultValue: 10, min: 1, max: 100, step: 1 },
		},
	}),
	define({
		type: "TagsInputField",
		name: "标签输入（带标签）",
		useWhen: "输入多个关键词、标签或邮箱条目",
		props: {
			...fieldBase,
			defaultValue: z.array(z.string().max(40)).max(12).optional(),
			placeholder: text.optional(),
			max: z.number().int().min(1).max(20).optional(),
		},
		children: "none",
		example: {
			type: "TagsInputField",
			props: { label: "关联标签", defaultValue: ["UI", "线性规范"], placeholder: "输入后回车添加" },
		},
	}),
	define({
		type: "DatePickerField",
		name: "日期选择（带标签）",
		useWhen: "选择目标日期或周期排期",
		props: {
			...fieldBase,
			placeholder: text.optional(),
		},
		children: "none",
		example: {
			type: "DatePickerField",
			props: { label: "目标日期", placeholder: "选择日期" },
		},
	}),
	define({
		type: "ComboboxField",
		name: "可搜索组合框（带标签）",
		useWhen: "选项较多需要搜索过滤，或需要多选下拉",
		avoidWhen: "选项很少且无需搜索时用 SelectField 或 RadioGroupField",
		props: {
			...fieldBase,
			placeholder: text.optional(),
			multiple: z.boolean().optional(),
			options: z.array(z.strictObject({ id: z.string().min(1).max(80), label })).min(1).max(20),
		},
		children: "none",
		example: {
			type: "ComboboxField",
			props: {
				label: "负责人",
				placeholder: "搜索成员…",
				options: [
					{ id: "mira", label: "Mira Chen" },
					{ id: "alex", label: "Alex Rivera" },
				],
			},
		},
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
		useWhen:
			"需要用户专注完成的一小步短表单；点 triggerLabel 的按钮打开，children 是正文。放在 PageHeader 右上角作为唯一主操作时可设 triggerVariant=default",
		avoidWhen: "不可逆的高危确认请用 AlertDialog；右侧详情或复杂筛选面板请用 Sheet",
		props: {
			triggerLabel: label,
			triggerVariant: z.enum(["default", "outline", "secondary", "ghost", "destructive"]).optional(),
			triggerSize: z.enum(["xs", "sm", "default"]).optional(),
			title: label,
			description: text.optional(),
		},
		children: "nodes",
		example: {
			type: "Dialog",
			props: {
				triggerLabel: "编辑资料",
				triggerVariant: "outline",
				triggerSize: "sm",
				title: "编辑资料",
				description: "修改后点保存。",
			},
			children: [{ type: "InputField", props: { label: "名字", value: "王" } }],
		},
	}),
	define({
		type: "AlertDialog",
		name: "危险确认弹窗",
		useWhen:
			"删除项目、移除成员、注销工作区等不可逆高危操作的二次确认；左侧强制保留取消按钮，confirmLabel 须写明动作与对象（如“删除密钥”）",
		avoidWhen: "普通编辑表单用 Dialog；右侧详情或筛选面板用 Sheet",
		props: {
			triggerLabel: label,
			triggerVariant: z.enum(["destructive", "outline", "ghost", "default"]).optional(),
			title: label,
			description: text,
			cancelLabel: label.optional(),
			confirmLabel: label,
			destructive: z.boolean().optional(),
		},
		children: "none",
		example: {
			type: "AlertDialog",
			props: {
				triggerLabel: "删除密钥",
				title: "删除 API 密钥",
				description: "删除后使用该密钥的请求将立即失效，且无法恢复。",
				cancelLabel: "取消",
				confirmLabel: "删除密钥",
				destructive: true,
			},
		},
	}),
	define({
		type: "Sheet",
		name: "侧滑详情抽屉",
		useWhen: "点击按钮或列表项在侧边展开详情、属性编辑或复杂筛选面板，不丢失当前列表上下文",
		avoidWhen: "短表单或高危二次确认用 Dialog 或 AlertDialog",
		props: {
			triggerLabel: label,
			triggerVariant: z.enum(["outline", "ghost", "secondary", "default"]).optional(),
			title: label,
			description: text.optional(),
			side: z.enum(["right", "left", "bottom"]).optional(),
		},
		children: "nodes",
		example: {
			type: "Sheet",
			props: { triggerLabel: "查看详情", title: "任务详情", side: "right" },
			children: [
				{
					type: "PropertyList",
					props: { layout: "detail" },
					children: [
						{ type: "PropertyRow", props: { label: "状态", value: "进行中" } },
						{ type: "PropertyRow", props: { label: "负责人", value: "Mira Chen" } },
					],
				},
			],
		},
	}),
	define({
		type: "ItemList",
		name: "紧凑列表",
		useWhen:
			"工作台任务列表、通知收件箱、轻量条目列表（平铺无外层卡片，自带 0.5px 行分隔）；children 只能是 ItemRow",
		avoidWhen: "多列对齐数据比较用 Table；系统开关设置行用 PropertyList",
		props: { label: label.optional() },
		children: "nodes",
		allowedChildren: ["ItemRow"],
		example: {
			type: "ItemList",
			props: { label: "待办任务" },
			children: [
				{
					type: "ItemRow",
					props: { meta: "DS-42", title: "核对菜单键盘导航与焦点归位" },
					children: [{ type: "Badge", props: { variant: "secondary" }, children: "进行中" }],
				},
				{
					type: "ItemRow",
					props: { meta: "DS-31", title: "收敛空状态提示文案" },
					children: [{ type: "Badge", props: { variant: "outline" }, children: "待处理" }],
				},
			],
		},
	}),
	define({
		type: "ItemRow",
		name: "列表行",
		useWhen:
			"ItemList 中的单条紧凑行：左放编号/标题/可选副说明，右放 children（Badge、Button、Sheet 或 AlertDialog）；主从分栏里可用 active=true 标记当前选中/命中行",
		props: {
			title: label,
			meta: label.optional(),
			description: text.optional(),
			active: z.boolean().optional(),
			disabled: z.boolean().optional(),
		},
		children: "nodes",
		example: {
			type: "ItemRow",
			props: { meta: "DS-42", title: "核对菜单键盘导航与焦点归位", description: "今日更新" },
			children: [{ type: "Badge", props: { variant: "secondary" }, children: "进行中" }],
		},
	}),
	define({
		type: "MessageList",
		name: "对话消息流",
		useWhen:
			"展示对话记录、审批讨论、客服/AI 聊天原文或带关键词定位的消息上下文；highlight 可自动高亮每条消息里的命中关键词；children 只能是 ChatMessage",
		avoidWhen: "纯列表条目用 ItemList；结构化表格用 Table",
		props: {
			label: label.optional(),
			highlight: z.string().max(80).optional(),
		},
		children: "nodes",
		allowedChildren: ["ChatMessage"],
		example: {
			type: "MessageList",
			props: { label: "对话原文", highlight: "付款审批" },
			children: [
				{
					type: "ChatMessage",
					props: {
						sender: "林岚",
						avatar: "林",
						time: "10:18",
						content: "供应商合同附件已补齐，准备发起付款审批。",
					},
				},
				{
					type: "ChatMessage",
					props: {
						sender: "我",
						avatar: "我",
						time: "10:24",
						role: "self",
						content: "已确认金额无误，这条付款审批请优先走加急通道。",
						active: true,
						meta: "第 2 / 3 处",
					},
				},
			],
		},
	}),
	define({
		type: "ChatMessage",
		name: "对话消息",
		useWhen:
			"MessageList 中的单条消息：含发件人、头像缩写、时间、正文，支持 role=other/self 左右对齐、highlight 关键词高亮及 active=true 当前定位高亮",
		props: {
			sender: label,
			avatar: z.string().max(4).optional(),
			time: z.string().max(40).optional(),
			role: z.enum(["other", "self"]).optional(),
			content: text,
			highlight: z.string().max(80).optional(),
			active: z.boolean().optional(),
			meta: label.optional(),
		},
		children: "none",
		example: {
			type: "ChatMessage",
			props: {
				sender: "林岚",
				avatar: "林",
				time: "10:24",
				content: "付款审批单已通过初审。",
				highlight: "付款审批",
				active: true,
				meta: "命中",
			},
		},
	}),
	define({
		type: "Gauge",
		name: "配额仪表",
		useWhen:
			"展示套餐配额、存储或 API 额度使用百分比（超过 100 自动切危险红），数字自动等宽对齐",
		avoidWhen: "普通步骤完成度用 Progress",
		props: {
			label,
			value: z.number().min(0).max(200),
			valueText: label.optional(),
			tone: z.enum(["accent", "danger"]).optional(),
		},
		children: "none",
		example: {
			type: "Gauge",
			props: { label: "本月额度", value: 72, valueText: "720 / 1,000 次" },
		},
	}),
	define({
		type: "Sparkline",
		name: "迷你趋势折线",
		useWhen: "紧凑展示 7–30 天调用量、活跃度或消费趋势折线（仅用主题语义色）",
		props: {
			label,
			value: label.optional(),
			values: z.array(z.number().nullable()).min(2).max(31),
		},
		children: "none",
		example: {
			type: "Sparkline",
			props: { label: "近 7 天请求量", value: "128,450 次", values: [12, 18, 15, 22, 29, 25, 34] },
		},
	}),
	define({
		type: "Skeleton",
		name: "加载骨架",
		useWhen: "局部数据加载时的等高占位（不加整页遮罩转圈）；variant 可选 row、text、card",
		props: {
			variant: z.enum(["row", "text", "card"]).optional(),
			lines: z.number().int().min(1).max(6).optional(),
		},
		children: "none",
		example: { type: "Skeleton", props: { variant: "row", lines: 3 } },
	}),
	define({
		type: "Stepper",
		name: "步骤流程",
		useWhen: "多步骤向导或有先后顺序的表单流程",
		props: {
			orientation: z.enum(["horizontal", "vertical"]).optional(),
			steps: z
				.array(
					z.strictObject({
						id: z.string().min(1).max(40),
						title: label,
						description: text.optional(),
					})
				)
				.min(2)
				.max(6),
		},
		children: "none",
		example: {
			type: "Stepper",
			props: {
				steps: [
					{ id: "info", title: "基本信息", description: "填写名称" },
					{ id: "confirm", title: "确认提交", description: "核对配置" },
				],
			},
		},
	}),
	define({
		type: "ToggleGroup",
		name: "切换按钮组",
		useWhen: "2～6 个紧凑单选视图切换或工具栏模式选择",
		props: {
			label,
			options: z.array(option).min(2).max(6),
			defaultValue: z.string().max(80).optional(),
		},
		children: "none",
		example: {
			type: "ToggleGroup",
			props: {
				label: "视图模式",
				defaultValue: "list",
				options: [
					{ value: "list", label: "列表" },
					{ value: "board", label: "看板" },
				],
			},
		},
	}),
] as const;

export type UiType = (typeof UI_CATALOG)[number]["type"];

const byType = new Map<string, (typeof UI_CATALOG)[number]>(
	UI_CATALOG.map((entry) => [entry.type, entry])
);
export const UI_TYPES = UI_CATALOG.map((entry) => entry.type) as UiType[];

export const UI_LIMITS = { nodes: 200, depth: 12, bytes: 200_000 } as const;

const REDUNDANT_PLACEHOLDER = /^\s*请输入/;
const GENERIC_CONFIRM_LABEL = /^(确定|确认|好的|提交|是的|ok|confirm)$/i;
const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;
const TITLE_PROP_TYPES = new Set([
	"PageHeader",
	"PageSection",
	"Dialog",
	"AlertDialog",
	"Sheet",
	"ItemRow",
	"Empty",
	"AccordionItem",
]);
const LABEL_EMOJI_TYPES = new Set(["Gauge", "Sparkline"]);
const TEXT_HEADER_TYPES = new Set(["Heading", "CardTitle", "Button", "AlertTitle"]);
const SINGLE_PRIMARY_CONTAINERS = new Set([
	"PageHeader",
	"PageToolbar",
	"CardFooter",
	"ItemRow",
	"ButtonGroup",
]);
const OVERLAY_ROOTS = new Set(["Dialog", "Sheet"]);
const TOP_LABELED_TOOLBAR_FIELDS = new Set([
	"InputField",
	"TextareaField",
	"SelectField",
	"RadioGroupField",
	"SliderField",
	"InputOtpField",
	"NumberField",
	"TagsInputField",
	"DatePickerField",
	"ComboboxField",
]);

const isCardSurface = (type: string, props: Record<string, unknown>) =>
	type === "Card" || (type === "PageSection" && props.surface === "card");

/** Chinese, per-field error messages the agent can act on, e.g. `root.children[1].props.variant：…`. */
export function validateUi(
	root: unknown
): { ok: true; root: UiNode; count: number } | { ok: false; errors: string[] } {
	const errors: string[] = [];
	let count = 0;

	if (!root || typeof root !== "object" || Array.isArray(root)) {
		return { ok: false, errors: ["root 必须是 { type, props?, children? } 对象"] };
	}

	try {
		if (JSON.stringify(root).length > UI_LIMITS.bytes) {
			return { ok: false, errors: [`整棵树超过 ${UI_LIMITS.bytes / 1000} KB，请精简内容`] };
		}
	} catch {
		return { ok: false, errors: ["root 不是合法的 JSON"] };
	}

	function visit(
		node: unknown,
		path: string,
		depth: number,
		allowed?: string[],
		insideCard = false
	) {
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

		const safeProps =
			props && typeof props === "object" && !Array.isArray(props)
				? (props as Record<string, unknown>)
				: {};
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

		// Aesthetic guardrails (aligned with Valar maintainer guides):
		// 1. No nested cards (Card or PageSection surface="card" inside another card surface).
		const entersCard = isCardSurface(entry.type, safeProps);
		if (entersCard && insideCard) {
			errors.push(
				`${path}：禁止卡片套卡片：内层区块改用 PageSection(surface="plain")、Stack 留白间距或 Separator 分隔`
			);
		}
		// 2. No redundant "请输入…" placeholder copy.
		if (typeof safeProps.placeholder === "string" && REDUNDANT_PLACEHOLDER.test(safeProps.placeholder)) {
			errors.push(
				`${path}.props.placeholder：禁止写“请输入…”重复废话，改为直接给格式示例（如 name@company.com）`
			);
		}
		// 3. No Emoji as title/button icon decoration.
		if (
			TITLE_PROP_TYPES.has(entry.type) &&
			typeof safeProps.title === "string" &&
			EMOJI_PATTERN.test(safeProps.title)
		) {
			errors.push(`${path}.props.title：禁止在标题中使用 Emoji 作图标装饰，保持中性克制的文字表达`);
		}
		if (
			LABEL_EMOJI_TYPES.has(entry.type) &&
			typeof safeProps.label === "string" &&
			EMOJI_PATTERN.test(safeProps.label)
		) {
			errors.push(`${path}.props.label：禁止在指标标题中使用 Emoji 作图标装饰，保持中性克制的文字表达`);
		}
		if (
			(entry.type === "AlertDialog" || entry.type === "Sheet" || entry.type === "Dialog") &&
			typeof safeProps.triggerLabel === "string" &&
			EMOJI_PATTERN.test(safeProps.triggerLabel)
		) {
			errors.push(
				`${path}.props.triggerLabel：禁止在触发按钮中使用 Emoji 作图标装饰，保持中性克制的文字表达`
			);
		}
		if (
			entry.type === "SearchInput" &&
			typeof safeProps.actionLabel === "string" &&
			EMOJI_PATTERN.test(safeProps.actionLabel)
		) {
			errors.push(
				`${path}.props.actionLabel：禁止在搜索操作按钮中使用 Emoji 作图标装饰，保持中性克制的文字表达`
			);
		}
		if (entry.type === "AlertDialog" && typeof safeProps.confirmLabel === "string") {
			if (EMOJI_PATTERN.test(safeProps.confirmLabel)) {
				errors.push(
					`${path}.props.confirmLabel：禁止在确认按钮中使用 Emoji 作图标装饰，保持中性克制的文字表达`
				);
			}
			if (GENERIC_CONFIRM_LABEL.test(safeProps.confirmLabel.trim())) {
				errors.push(
					`${path}.props.confirmLabel：高危确认按钮避免笼统写“${safeProps.confirmLabel.trim()}”，请写明具体动作与对象（如“删除密钥”“移除成员”）`
				);
			}
		}
		if (
			TEXT_HEADER_TYPES.has(entry.type) &&
			typeof children === "string" &&
			EMOJI_PATTERN.test(children)
		) {
			errors.push(`${path}：禁止在标题或按钮中使用 Emoji 作图标装饰，保持中性克制的文字表达`);
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
				// 4. Max 1 primary button per action container.
				const isActionBar =
					SINGLE_PRIMARY_CONTAINERS.has(entry.type) ||
					(entry.type === "Stack" && safeProps.direction === "row");
				if (isActionBar) {
					let primaryCount = 0;
					for (const child of children) {
						if (child && typeof child === "object" && !Array.isArray(child)) {
							const c = child as Record<string, unknown>;
							const cp =
								c.props && typeof c.props === "object" && !Array.isArray(c.props)
									? (c.props as Record<string, unknown>)
									: {};
							if (
								(c.type === "Button" && (cp.variant === undefined || cp.variant === "default")) ||
								((c.type === "Dialog" || c.type === "Sheet" || c.type === "AlertDialog") &&
									cp.triggerVariant === "default")
							) {
								primaryCount++;
							}
						}
					}
					if (primaryCount > 1) {
						errors.push(
							`${path}：同一操作区出现了 ${primaryCount} 个主色按钮，最多只放 1 个主操作（variant="default"），其余改用 variant="outline" 或 "ghost"`
						);
					}
				}
				if (entry.type === "PageToolbar") {
					const labeledField = children.find(
						(child) =>
							child &&
							typeof child === "object" &&
							!Array.isArray(child) &&
							TOP_LABELED_TOOLBAR_FIELDS.has(String((child as Record<string, unknown>).type ?? ""))
					) as Record<string, unknown> | undefined;
					if (labeledField) {
						errors.push(
							`${path}：PageToolbar 内不要直接放带顶部标签的 ${String(labeledField.type)}（会撑高行高导致同行按钮错位），请改用无顶部标签的 SearchInput 或 FilterSelect`
						);
					}
				}
				if (entry.type === "SplitLayout" && children.length !== 2) {
					errors.push(`${path}：SplitLayout 必须恰好包含 2 个子节点（左栏与右栏），当前为 ${children.length} 个`);
				}
				if (entry.type === "PropertyRow") {
					const hasSwitchField = children.some(
						(child) =>
							child &&
							typeof child === "object" &&
							!Array.isArray(child) &&
							(child as Record<string, unknown>).type === "SwitchField"
					);
					if (hasSwitchField) {
						errors.push(
							`${path}：PropertyRow 内不要再嵌套 SwitchField（会重复标签），直接在 PropertyRow.props 传 checked: true/false 即可`
						);
					}
				}
				const nextInsideCard = OVERLAY_ROOTS.has(entry.type) ? false : insideCard || entersCard;
				children.forEach((child, index) =>
					visit(
						child,
						`${path}.children[${index}]`,
						depth + 1,
						(entry as { allowedChildren?: string[] }).allowedChildren,
						nextInsideCard
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

/** Maps a validated UI tree back to unique basic component slugs for cross-linking. */
export function usedComponentSlugs(root: UiNode): string[] {
	const MAP: Record<string, string[]> = {
		PageLayout: ["page-layout"],
		PageHeader: ["page-layout"],
		PageToolbar: ["page-layout"],
		PageSection: ["page-layout"],
		PropertyList: ["page-layout"],
		PropertyRow: ["page-layout"],
		Separator: ["separator"],
		Button: ["button"],
		ButtonGroup: ["button-group", "button"],
		SearchInput: ["input-group"],
		FilterSelect: ["select"],
		Badge: ["badge"],
		Alert: ["alert"],
		Progress: ["progress"],
		Spinner: ["spinner"],
		Kbd: ["kbd"],
		Avatar: ["avatar"],
		Empty: ["empty"],
		Breadcrumb: ["breadcrumb"],
		Card: ["card"],
		InputField: ["field", "input"],
		TextareaField: ["field", "textarea"],
		CheckboxField: ["field", "checkbox"],
		SwitchField: ["field", "switch"],
		SelectField: ["field", "select"],
		RadioGroupField: ["field", "radio-group"],
		SliderField: ["slider-field"],
		InputOtpField: ["field", "input-otp"],
		NumberField: ["field", "number-field"],
		TagsInputField: ["field", "tags-input"],
		DatePickerField: ["field", "date-picker"],
		ComboboxField: ["field", "combobox"],
		Table: ["table"],
		Tabs: ["tabs"],
		Accordion: ["accordion"],
		Dialog: ["dialog", "button"],
		AlertDialog: ["alert-dialog", "button"],
		Sheet: ["sheet", "button"],
		ItemList: ["item"],
		ItemRow: ["item"],
		MessageList: ["message", "bubble", "avatar"],
		ChatMessage: ["message", "bubble", "avatar"],
		Gauge: ["gauge"],
		Sparkline: ["sparkline"],
		Skeleton: ["skeleton"],
		Stepper: ["stepper"],
		ToggleGroup: ["toggle-group"],
	};
	const found = new Set<string>();
	const walk = (node: UiNode) => {
		for (const slug of MAP[node.type] ?? []) found.add(slug);
		if (node.type === "PropertyRow" && typeof node.props?.checked === "boolean") {
			found.add("switch");
		}
		if (Array.isArray(node.children)) {
			for (const child of node.children) walk(child);
		}
	};
	walk(root);
	return [...found];
}

/** One line per component for the system prompt; the details come from `uiCatalogDetails`. */
export function uiCatalogIndex(): string {
	return UI_CATALOG.map((entry) => `- ${entry.type}（${entry.name}）：${entry.useWhen}`).join("\n");
}

type JsonSchemaNode = {
	type?: string;
	enum?: unknown[];
	const?: unknown;
	anyOf?: JsonSchemaNode[];
	items?: JsonSchemaNode;
	properties?: Record<string, JsonSchemaNode>;
	required?: string[];
	minimum?: number;
	maximum?: number;
	minItems?: number;
	maxItems?: number;
};

function summarizeSchemaNode(node: JsonSchemaNode): unknown {
	if (node.enum) return node.enum.map((v) => String(v)).join(" | ");
	if (node.const !== undefined) return String(node.const);
	if (node.anyOf) return node.anyOf.map(summarizeSchemaNode).join(" | ");
	if (node.type === "array" && node.items) {
		const bounds =
			node.minItems !== undefined || node.maxItems !== undefined
				? ` (${node.minItems ?? 0}..${node.maxItems ?? "n"})`
				: "";
		const item = summarizeSchemaNode(node.items);
		return typeof item === "string" ? `Array<${item}>${bounds}` : [item];
	}
	if (node.type === "object" && node.properties) {
		const req = new Set(node.required ?? []);
		return Object.fromEntries(
			Object.entries(node.properties).map(([key, prop]) => [
				req.has(key) ? `${key}*` : key,
				summarizeSchemaNode(prop),
			])
		);
	}
	if (node.type === "number" || node.type === "integer") {
		const range =
			node.minimum !== undefined || node.maximum !== undefined
				? ` (${node.minimum ?? ""}..${node.maximum ?? ""})`
				: "";
		return `${node.type}${range}`;
	}
	return node.type ?? "unknown";
}

/** Full description of some components: compact props signature (`*` = required), children rule and working example. */
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
		props: summarizeSchemaNode(z.toJSONSchema(entry.schema, { io: "input" }) as JsonSchemaNode),
		example: entry.example,
	}));
}
