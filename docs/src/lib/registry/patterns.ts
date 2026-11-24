export type PagePattern = {
	name: string;
	title: string;
	category: string;
	description: string;
	keywords: string[];
	layoutWidth: "full" | "narrow" | "overlay";
	whenToUse: string[];
	whenNotToUse: { case: string; use: string }[];
	structure: string[];
	components: string[];
	referenceScene?: string;
	guardrails: string[];
};

/**
 * High-frequency page & section recipes derived from Valar's aligned scenes and maintainer guides.
 * Served through `catalog.json`, `llms-small.txt`, and MCP (`search_patterns` / `get_pattern`)
 * so agents pick a proven page skeleton before assembling individual components.
 */
export const PAGE_PATTERNS: readonly PagePattern[] = [
	{
		name: "workspace-list",
		title: "工作台筛选列表页",
		category: "列表与工作台",
		description: "带视图切换、多维筛选、排序分组、空态与右侧详情联动的高密度工作台。",
		keywords: ["工作台", "列表", "工单", "任务", "筛选", "分组", "issues", "workspace", "list"],
		layoutWidth: "full",
		whenToUse: [
			"任务、工单、问题或记录列表管理，需要快速切换视图与筛选条件",
			"条目信息精炼，点击单条需要查看或编辑详情而不离开列表上下文",
		],
		whenNotToUse: [
			{ case: "需要多列数值对比、列排序或批量勾选操作", use: "data-table-view" },
			{ case: "需要跨列拖拽看板或时间线排期", use: "board-timeline" },
			{ case: "需要左列表右详情常驻双栏快速逐条处理", use: "split-inbox" },
		],
		structure: [
			"撑满工作区宽度，内容直接铺在背景上，不用外层大卡片包裹",
			"单行紧凑页头：左侧视图 Tabs（或标题），右侧放 1 个主操作按钮",
			"紧凑筛选工具栏：筛选 Popover + Command 搜索 + 排序控制，靠间距与列表区隔开",
			"列表主体：单行 Item 列表（行内信息克制、中性灰标签为主），无结果时渲染 Empty（中性标题 + 1 个操作按钮）",
			"点击条目在右侧 Sheet 抽屉或详情面板打开，不破坏当前筛选状态",
		],
		components: ["page-layout", "tabs", "popover", "command", "item", "badge", "empty", "sheet", "button"],
		referenceScene: "/advanced/my-issues",
		guardrails: [
			"严禁为列表每一行套卡片，用 0.5px 细分隔线或紧凑行间距区分",
			"同一视区最多 1 个主色强调按钮（位于页头右侧）",
			"禁止首屏列表逐行飞入动画，内容应立刻可读",
		],
	},
	{
		name: "data-table-view",
		title: "结构化数据表格与批量管理页",
		category: "列表与工作台",
		description: "多列排序、搜索过滤、勾选批量操作与分页的数据台账页面。",
		keywords: [
			"表格",
			"数据表",
			"成员管理",
			"权限",
			"订单",
			"台账",
			"批量操作",
			"分页",
			"table",
			"data-table",
		],
		layoutWidth: "full",
		whenToUse: [
			"成员权限、订单明细、账单记录、资产目录等多字段结构化对比",
			"需要列排序、行勾选批量动作或分页浏览",
		],
		whenNotToUse: [
			{ case: "字段少且偏信息流/任务行浏览", use: "workspace-list" },
			{ case: "左侧选条目右侧立即看长文详情", use: "split-inbox" },
		],
		structure: [
			"撑满工作区宽度，单行紧凑页头：左侧标题，右侧 1 个主按钮（如“添加成员”）",
			"表格上方紧凑工具栏：左侧搜索 InputGroup 与筛选 Select/Popover，勾选条目后原地切换显示批量操作条",
			"单层 0.5px 边框表格容器承载 Table（复杂列排序与勾选可配合 Data Table 指南）；金额、计数与时间列启用 tabular-nums",
			"窄屏保持表格容器内局部横向滚动，不撑破整页；底部放置 Pagination 与总数",
		],
		components: [
			"page-layout",
			"table",
			"input-group",
			"select",
			"checkbox",
			"badge",
			"dropdown-menu",
			"pagination",
			"empty",
			"button",
		],
		guardrails: [
			"表格内状态标签默认中性灰，仅关键语义状态（错误/停用/成功）使用语义色",
			"行内悬停仅用轻微底色变化，严禁上浮或放大动画",
			"搜索占位符只写示例（如“按姓名或邮箱筛选”），不加多余说明段落",
		],
	},
	{
		name: "settings-page",
		title: "系统设置与偏好配置页",
		category: "设置与表单",
		description: "收窄居中阅读区、单层分组卡片与「左文案 + 右控件」横向设置行布局。",
		keywords: ["设置", "偏好", "配置", "账号", "安全", "通知设置", "settings", "preferences"],
		layoutWidth: "narrow",
		whenToUse: [
			"工作区设置、个人资料、通知偏好、安全与权限配置页",
			"以开关、下拉选择、单行输入为主的长期配置项",
		],
		whenNotToUse: [
			{ case: "临时创建一条记录的短表单", use: "form-dialog" },
			{ case: "有严格前后校验步骤的导入或开通流程", use: "guided-stepper" },
		],
		structure: [
			"收窄居中阅读区（max-w-[760px]，多板块设置可配左侧 Sidebar 导航）",
			"单行页面标题，默认不写冗长副标题",
			"按主题用留白间距分组；每组使用最多 1 层 Card，内部以「左标题 + 右控件」横向 Field 行排列并用 0.5px Separator 隔开",
			"危险设置区独立放在底部并拉开更大间距，破坏性按钮单独标红并接入二次确认弹窗",
		],
		components: ["page-layout", "sidebar", "card", "field", "label", "select", "switch", "input", "separator", "button"],
		referenceScene: "/advanced/settings",
		guardrails: [
			"严禁卡片套卡片，严禁在圆角矩形使用单侧高亮彩边",
			"开关和下拉等即时设置项直接生效，不额外狂弹 Toast",
			"默认只留中性标题，仅当不看就会填错或涉及不可逆影响时补一行简短说明",
		],
	},
	{
		name: "split-inbox",
		title: "双栏分栏列表与详情页",
		category: "列表与工作台",
		description: "左侧可滚动条目列表 + 0.5px 细分隔器 + 右侧常驻详情与快捷操作区。",
		keywords: ["收件箱", "通知", "双栏", "分栏", "审批", "消息列表", "inbox", "split", "master-detail"],
		layoutWidth: "full",
		whenToUse: [
			"通知中心、审批收件箱、待办逐条审阅，需要高频在多条记录间切换阅读与处理",
		],
		whenNotToUse: [
			{ case: "偶尔点开查看单条详情，大多数时候看宽表", use: "detail-drawer" },
		],
		structure: [
			"撑满工作区高度的 Resizable 双栏容器，两栏间用 0.5px 细分隔器",
			"左栏：顶部紧凑过滤栏 + ScrollArea 独立滚动列表，选中项用柔和表面色标示；无数据时居中展示 Empty",
			"右栏：固定顶部操作栏（已读、归档、更多菜单）+ 独立滚动详情正文与协作记录",
			"窄屏自动切换为单列列表/详情切换，不挤压双栏",
		],
		components: ["resizable", "scroll-area", "item", "popover", "dropdown-menu", "badge", "empty", "button"],
		referenceScene: "/advanced/inbox",
		guardrails: [
			"左右两栏各自独立滚动，避免整页出现双滚动条",
			"已读/暂缓等操作原地更新状态，克制使用 Toast",
		],
	},
	{
		name: "board-timeline",
		title: "多视图项目看板与时间线页",
		category: "列表与工作台",
		description: "列表、跨列看板与时间线里程碑同步切换的项目排期工作区。",
		keywords: ["项目", "看板", "时间线", "排期", "里程碑", "拖拽", "kanban", "board", "timeline", "projects"],
		layoutWidth: "full",
		whenToUse: [
			"需要按状态分列推进卡片（看板）或按时间跨度查看排期与里程碑（时间线）",
		],
		whenNotToUse: [
			{ case: "普通单表检索与批量管理", use: "data-table-view" },
		],
		structure: [
			"撑满工作区宽度，单行页头包含视图切换 Tabs（列表 / 看板 / 时间线）与右上角新建主按钮",
			"筛选工具栏保持单行紧凑，状态和负责人筛选放入 Popover + Command",
			"看板列使用清晰列头（状态 + tabular-nums 计数）与单层卡片，列间靠留白与极浅底色区分",
			"时间线/日历视图日期与范围选择复用 Calendar / DatePicker，所有数值与日期等宽对齐",
		],
		components: ["page-layout", "tabs", "table", "card", "calendar", "date-picker", "popover", "command", "dialog", "button"],
		referenceScene: "/advanced/projects",
		guardrails: [
			"看板卡片只展示核心标题与 2–3 个关键元数据，避免堆满彩色 Badge",
			"严禁给看板卡片加悬停上浮/放大动画",
		],
	},
	{
		name: "form-dialog",
		title: "聚焦新建与编辑弹窗",
		category: "弹层与表单",
		description: "不离开当前页面的轻量创建或短表单编辑弹窗，单列竖排、取消左主操作右。",
		keywords: ["弹窗", "新建", "创建", "编辑表单", "模态框", "dialog", "modal", "form", "create"],
		layoutWidth: "overlay",
		whenToUse: [
			"约 2–6 个字段的快速创建、重命名或局部编辑任务",
			"希望完成后立刻回到原列表上下文",
		],
		whenNotToUse: [
			{ case: "字段多、含评论动态或需要边看列表边编辑", use: "detail-drawer" },
			{ case: "仅需确认删除或不可逆操作", use: "destructive-confirm" },
			{ case: "多步骤长流程或全页配置", use: "settings-page" },
		],
		structure: [
			"居中 Dialog，Dialog.Title 直接用中性动作标题（如“新建项目”），默认不写副标题",
			"表单内容默认单列竖排：Field.FieldGroup + Field.Field（标签在上、控件在下），长表单在内容区内部滚动",
			"输入占位符仅给格式示例，校验错误直接显示在对应字段下方（data-invalid + aria-invalid）",
			"固定底部操作栏：取消按钮在左，唯一主色提交按钮在右（提交中原地禁用 + Spinner）",
		],
		components: ["dialog", "field", "input", "textarea", "select", "switch", "spinner", "button"],
		referenceScene: "/advanced/new-issue",
		guardrails: [
			"弹窗内严禁再套 Card 边框",
			"禁止放底部隐私提示卡或长段解释文案",
			"必须包含 Dialog.Title 保证无障碍读屏",
		],
	},
	{
		name: "detail-drawer",
		title: "右侧记录详情与属性抽屉",
		category: "弹层与表单",
		description: "右侧滑出面板承载记录详情、属性键值对与活动流，保留背后主列表可见。",
		keywords: ["抽屉", "详情", "侧边面板", "属性", "编辑详情", "sheet", "drawer", "detail", "inspector"],
		layoutWidth: "overlay",
		whenToUse: [
			"从表格、列表或看板点击条目后，查看和编辑较完整的记录信息与动态",
			"复杂多条件高级筛选面板",
		],
		whenNotToUse: [
			{ case: "2–4 个字段的极简新建或确认", use: "form-dialog" },
			{ case: "高频连续逐条处理（如收件箱）", use: "split-inbox" },
		],
		structure: [
			"右侧滑出 Sheet，顶部单行固定栏：标识/面包屑 + 标题（Sheet.Title）+ 关闭按钮",
			"主体内部独立滚动，通过清晰间距自然分隔：标题与正文区、属性键值对区、评论/活动记录区",
			"属性项用紧凑两列对齐（左侧中性灰属性名 + 右侧 Popover/Select 就地可改控件）",
		],
		components: ["sheet", "breadcrumb", "input", "textarea", "badge", "popover", "command", "separator", "button"],
		guardrails: [
			"抽屉内部靠间距和 0.5px 细线分区，严禁堆叠嵌套卡片",
			"必须提供 Sheet.Title（视觉隐藏时可用 sr-only）",
		],
	},
	{
		name: "overview-metrics",
		title: "核心指标概览与用量监控页",
		category: "数据与概览",
		description: "高信噪比的指标概览页：顶部核心读数卡 + 图表趋势 + 明细列表，零凑数装饰。",
		keywords: ["概览", "仪表盘", "统计", "指标", "用量", "配额", "账单", "图表", "dashboard", "metrics", "billing"],
		layoutWidth: "full",
		whenToUse: [
			"账单用量、配额监控、业务核心指标总览页",
		],
		whenNotToUse: [
			{ case: "纯记录管理列表，没有真实统计需求（严禁为了凑对称硬加 KPI 卡片）", use: "data-table-view" },
		],
		structure: [
			"撑满工作区宽度，单行页头：左侧标题，右侧时间范围 DatePicker / Select 与导出按钮",
			"核心指标行：3–4 张简洁单层 Card（中性标题 + tabular-nums 主数字 + 紧凑趋势 Sparkline 或中性/语义 Badge）",
			"靠留白间距分隔下方主图表区（Chart / DonutChart / Gauge，严格使用 --chart-1～--chart-5 token）",
			"底部可衔接明细 Table，加载中用等高 Skeleton 占位",
		],
		components: ["page-layout", "card", "chart", "sparkline", "donut-chart", "gauge", "date-picker", "badge", "table", "skeleton"],
		guardrails: [
			"严禁为凑四格对称编造无业务价值的假 KPI 卡或假图表",
			"严禁在圆角指标卡左侧加粗彩色高亮边，严禁彩色渐变背景",
			"所有数字、百分比、金额必须开启 tabular-nums",
		],
	},
	{
		name: "guided-stepper",
		title: "分步校验向导页",
		category: "设置与表单",
		description: "有严格先后顺序与每步门禁校验的多步流程（导入、开通、初始化）。",
		keywords: ["向导", "步骤", "分步", "导入", "引导", "开通", "stepper", "wizard", "onboarding"],
		layoutWidth: "narrow",
		whenToUse: [
			"数据导入、服务开通、多步配置等必须按先后顺序完成且每步需要校验的流程",
		],
		whenNotToUse: [
			{ case: "各板块可以随意切换、没有先后依赖", use: "settings-page" },
			{ case: "字段少、一步就能填完", use: "form-dialog" },
		],
		structure: [
			"收窄居中内容区（max-w-[760px]），顶部单行标题",
			"使用 Stepper 展示清晰步骤进度与当前步校验状态（错误直接挂在步骤或字段下）",
			"每步内容单列竖排，底部操作区左置「上一步 / 取消」、右置唯一主操作「下一步 / 完成」",
			"异步校验期间按钮原地禁用 + Spinner，不锁死整个屏幕",
		],
		components: ["page-layout", "stepper", "field", "input", "select", "alert", "spinner", "button"],
		guardrails: [
			"每一步校验报错必须说清「错在哪 + 怎么改」",
			"窄屏下步骤条自动折为竖排",
		],
	},
	{
		name: "ai-workspace",
		title: "AI 对话与流式协作工作台",
		category: "AI 与协作",
		description: "支持空态居中提问、流式消息、折叠思考链、结构化确认与底部发送器的对话工作台。",
		keywords: ["AI", "对话", "助手", "聊天", "流式", "问答", "agent", "chat", "assistant"],
		layoutWidth: "full",
		whenToUse: [
			"AI 对话助手、知识库问答、带工具调用轨迹与结构化交互卡片的智能工作台",
		],
		whenNotToUse: [
			{ case: "传统静态表单或列表管理", use: "workspace-list" },
		],
		structure: [
			"未发消息时：居中简洁标题 + InputGroup（composer 形态）+ 精简示例入口卡片",
			"进入对话后：顶部轻量会话栏（标题 + 新对话）+ MessageScroller 吸底消息流 + 底部发送器",
			"消息流内：用户消息使用 Bubble 右对齐，助手消息左对齐正文并按序穿插折叠 Trace 思考轨迹、CodeBlock 与 Questionnaire 确认卡",
		],
		components: [
			"message-scroller",
			"message",
			"bubble",
			"trace",
			"attachment",
			"input-group",
			"code-block",
			"questionnaire",
			"button",
		],
		referenceScene: "/advanced/agent",
		guardrails: [
			"未配置真实模型时严禁伪造虚假 AI 回复，应直接引导配置",
			"严禁消息列表出现装饰性逐条飞入动画，保持流式跟底克制顺滑",
		],
	},
	{
		name: "destructive-confirm",
		title: "高风险二次确认与异步反馈",
		category: "弹层与表单",
		description: "删除、移除、重置等不可逆操作的标准安全确认弹窗与结果反馈范式。",
		keywords: ["删除", "确认", "危险操作", "撤销", "不可逆", "alert-dialog", "confirm", "delete", "destructive"],
		layoutWidth: "overlay",
		whenToUse: [
			"删除项目、移除成员、重置密钥、清空数据等高风险或不可恢复操作",
		],
		whenNotToUse: [
			{ case: "需要填写多个字段的普通编辑弹窗", use: "form-dialog" },
		],
		structure: [
			"居中 AlertDialog（点击遮罩不误关），AlertDialog.Title 直接写明确动作（如“删除项目”）",
			"AlertDialog.Description 一句话封顶：只写「具体对象 + 不可恢复影响」",
			"底部固定「AlertDialog.Cancel（取消）在左，AlertDialog.Action（危险红按钮，文案带对象如“删除项目”）在右」",
			"执行中按钮原地禁用 + Spinner；跨区域成功/失败结果用轻量 Sonner Toast 反馈（可撤销操作提供撤销按钮）",
		],
		components: ["alert-dialog", "button", "spinner", "sonner"],
		guardrails: [
			"危险确认按钮文案严禁用笼统的“确定”，必须写明动作与对象（如“删除成员”）",
			"必须保留 AlertDialog.Cancel 给用户清晰退路",
		],
	},
];

export function patternMarkdown(pattern: PagePattern, installCmd: string): string {
	const widthLabel =
		pattern.layoutWidth === "full"
			? "撑满工作区宽度"
			: pattern.layoutWidth === "narrow"
				? "收窄居中（约 680–840px）"
				: "弹层 / 抽屉容器";
	const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");
	return `# ${pattern.title}（\`${pattern.name}\`）

${pattern.description}

- 分类：${pattern.category}
- 宽度模式：${widthLabel}
- 关键词：${pattern.keywords.join("、")}${pattern.referenceScene ? `\n- 参考场景：${pattern.referenceScene}` : ""}
- 常用组件：${pattern.components.map((c) => `\`${c}\``).join("、")}
- 一键安装：\`${installCmd}\`

## 何时套用

${list(pattern.whenToUse)}

## 何时不适用

${list(pattern.whenNotToUse.map((item) => `${item.case}：改用 \`${item.use}\``))}

## 标准骨架结构

${pattern.structure.map((step, i) => `${i + 1}. ${step}`).join("\n")}

## 审美与克制红线

${list(pattern.guardrails)}
`;
}
