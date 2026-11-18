export type AdvancedSceneSlug =
	| "my-issues"
	| "projects"
	| "inbox"
	| "new-issue"
	| "settings"
	| "agent";

export type AdvancedSceneMeta = {
	slug: AdvancedSceneSlug;
	blockName: string;
	title: { zh: string; en: string };
	description: { zh: string; en: string };
	demo: string;
	components: readonly string[];
	keywords: readonly string[];
};

export type AdvancedModuleMeta = {
	slug: "issue-detail" | "issue-composer";
	title: { zh: string; en: string };
	description: { zh: string; en: string };
	demo: string;
	components: readonly string[];
	keywords: readonly string[];
};

export const ADVANCED_SCENES: readonly AdvancedSceneMeta[] = [
	{
		slug: "my-issues",
		blockName: "my-issues-01",
		title: { zh: "我的问题工作台", en: "My issues workspace" },
		description: {
			zh: "多视图切换、状态与优先级组合筛选、排序分组、空态与问题详情协作面板。",
			en: "Multi-view tabs, status & priority filters, grouping, empty states, and issue detail editing.",
		},
		demo: "item-issue-row",
		components: ["tabs", "popover", "command", "item", "badge", "empty", "button", "issue-detail", "issue-composer"],
		keywords: ["issues", "my issues", "问题列表", "筛选", "分组", "工单", "详情"],
	},
	{
		slug: "projects",
		blockName: "projects-01",
		title: { zh: "项目管理（列表 / 看板 / 时间线）", en: "Projects (List / Board / Timeline)" },
		description: {
			zh: "列表、跨列拖拽看板与带里程碑和依赖冲突提示的时间线视图，支持保存视图。",
			en: "Synchronized list, drag-and-drop board, and timeline views with milestones, dependencies, and saved views.",
		},
		demo: "calendar-project-date",
		components: ["tabs", "table", "card", "calendar", "date-picker", "popover", "command", "dialog", "button"],
		keywords: ["projects", "kanban", "timeline", "项目管理", "看板", "时间线", "里程碑", "拖拽"],
	},
	{
		slug: "inbox",
		blockName: "inbox-01",
		title: { zh: "收件箱通知中心", en: "Inbox notifications" },
		description: {
			zh: "双栏分栏通知列表、可配置优先规则、快捷键切换已读与暂缓，并联动问题详情。",
			en: "Split-pane notifications, priority rules, read/snooze shortcuts, and inline issue detail collaboration.",
		},
		demo: "resizable-inbox",
		components: ["resizable", "scroll-area", "popover", "dropdown-menu", "badge", "empty", "button", "issue-detail"],
		keywords: ["inbox", "notifications", "收件箱", "通知", "分栏", "暂缓", "快捷键"],
	},
	{
		slug: "new-issue",
		blockName: "new-issue-01",
		title: { zh: "新建问题弹窗", en: "New issue composer" },
		description: {
			zh: "紧凑与展开两种输入模式，包含状态、优先级、附件选择与连续创建交互。",
			en: "Compact and expanded composer dialog with status, priority, attachments, and create-more flow.",
		},
		demo: "dialog-demo",
		components: ["dialog", "input", "textarea", "switch", "popover", "command", "tooltip", "button", "issue-composer"],
		keywords: ["new issue", "composer", "modal", "新建问题", "弹窗", "创建表单"],
	},
	{
		slug: "settings",
		blockName: "settings-01",
		title: { zh: "工作区设置页", en: "Workspace settings" },
		description: {
			zh: "双栏设置导航、设置卡片行布局、主题选择下拉、开关及锁定禁用状态。",
			en: "Two-column settings navigation, settings card rows, theme select, switches, and locked states.",
		},
		demo: "card-settings",
		components: ["sidebar", "card", "field", "label", "select", "switch", "separator"],
		keywords: ["settings", "preferences", "设置页", "偏好设置", "表单行", "双栏"],
	},
	{
		slug: "agent",
		blockName: "agent-01",
		title: { zh: "AI 助手工作台", en: "Agent chat workspace" },
		description: {
			zh: "新对话与历史会话、示例触发卡片、附件上传、流式回复、工具反馈与消息滚动。",
			en: "Conversation history, prompt cards, file attachments, streaming replies, tool steps, and message scroller.",
		},
		demo: "chat-demo",
		components: ["message-scroller", "message", "bubble", "attachment", "card", "dropdown-menu", "tooltip", "button"],
		keywords: ["agent", "ai", "chat", "助手", "对话", "流式回复", "附件"],
	},
] as const;

export const ADVANCED_MODULES: readonly AdvancedModuleMeta[] = [
	{
		slug: "issue-detail",
		title: { zh: "问题详情与协作面板", en: "Issue Detail" },
		description: {
			zh: "编辑问题标题与富文本描述，管理状态属性、活动时间线、表情回应、订阅与已解决讨论串。",
			en: "Edit issue title and rich text, manage properties, activity timeline, emoji reactions, subscriptions, and resolved threads.",
		},
		demo: "textarea-team-description",
		components: ["breadcrumb", "button", "input", "badge", "popover", "command", "dropdown-menu", "tooltip", "separator"],
		keywords: ["issue detail", "comments", "activity", "问题详情", "评论", "活动时间线", "富文本"],
	},
	{
		slug: "issue-composer",
		title: { zh: "问题创建器弹窗", en: "Issue Composer" },
		description: {
			zh: "可复用在任意列表或快捷键入口中的新建问题弹窗模块，支持草稿回调与连续创建。",
			en: "Reusable issue creation dialog with expandable editor, metadata pickers, attachments, and continuous creation.",
		},
		demo: "dialog-demo",
		components: ["dialog", "button", "input", "textarea", "switch", "popover", "command", "tooltip"],
		keywords: ["issue composer", "dialog", "create issue", "问题创建", "弹窗模块", "草稿"],
	},
] as const;

export function findAdvancedScene(slug: string): AdvancedSceneMeta | undefined {
	return ADVANCED_SCENES.find((scene) => scene.slug === slug);
}
