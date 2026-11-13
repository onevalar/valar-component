/** Groups for the component catalog. A component not listed here lands in "other", so it never disappears. */
export const COMPONENT_CATEGORIES = [
	{
		key: "form",
		zh: "表单输入",
		en: "Form inputs",
		slugs: [
			"input",
			"textarea",
			"input-group",
			"input-otp",
			"number-field",
			"field",
			"label",
			"select",
			"native-select",
			"combobox",
			"checkbox",
			"radio-group",
			"switch",
			"slider",
			"slider-field",
			"tags-input",
			"color-picker",
			"date-picker",
			"calendar",
			"range-calendar",
			"questionnaire",
		],
	},
	{
		key: "actions",
		zh: "按钮与操作",
		en: "Buttons & actions",
		slugs: ["button", "button-group", "toggle", "toggle-group"],
	},
	{
		key: "navigation",
		zh: "导航",
		en: "Navigation",
		slugs: [
			"tabs",
			"breadcrumb",
			"pagination",
			"stepper",
			"navigation-menu",
			"menubar",
			"sidebar",
			"command",
		],
	},
	{
		key: "overlay",
		zh: "弹层与提示",
		en: "Overlays & popups",
		slugs: [
			"dialog",
			"alert-dialog",
			"sheet",
			"drawer",
			"popover",
			"hover-card",
			"tooltip",
			"dropdown-menu",
			"context-menu",
			"sonner",
		],
	},
	{
		key: "data",
		zh: "数据展示",
		en: "Data display",
		slugs: [
			"card",
			"table",
			"data-table",
			"chart",
			"accordion",
			"collapsible",
			"carousel",
			"avatar",
			"badge",
			"item",
			"kbd",
			"code-block",
			"typography",
			"marker",
			"trace",
		],
	},
	{
		key: "layout",
		zh: "布局",
		en: "Layout",
		slugs: ["aspect-ratio", "resizable", "scroll-area", "separator"],
	},
	{
		key: "feedback",
		zh: "反馈与状态",
		en: "Feedback & status",
		slugs: ["alert", "progress", "skeleton", "spinner", "empty"],
	},
	{
		key: "chat",
		zh: "对话",
		en: "Chat",
		slugs: ["message", "message-scroller", "bubble", "attachment"],
	},
] as const;

export const OTHER_CATEGORY = { key: "other", zh: "其他", en: "Other" } as const;

/** Groups for the advanced components (AI elements): ready-made assemblies of basic components. */
export const ADVANCED_CATEGORIES = [
	{
		key: "conversation",
		zh: "对话",
		en: "Conversation",
		slugs: ["chat", "message", "prompt-input", "model-selector", "suggestion", "queue"],
	},
	{
		key: "steps",
		zh: "推理与步骤",
		en: "Reasoning & steps",
		slugs: [
			"chain-of-thought",
			"reasoning",
			"plan",
			"task",
			"tool",
			"subagent",
			"checkpoint",
			"confirmation",
		],
	},
	{
		key: "context",
		zh: "引用与上下文",
		en: "Sources & context",
		slugs: ["sources", "inline-citation", "context"],
	},
	{
		key: "output",
		zh: "开发产物",
		en: "Developer output",
		slugs: ["terminal", "stack-trace", "test-results", "file-tree"],
	},
] as const;

/** The example used as a component's picture in place of `<slug>-demo`. */
export const DEMO_OVERRIDES: Record<string, string> = {
	alert: "alert-connection",
	avatar: "avatar-subscriber",
	breadcrumb: "breadcrumb-workspace",
	"button-group": "button-group-pill-demo",
	calendar: "calendar-project-date",
	chart: "chart-bar-demo",
	collapsible: "collapsible-properties",
	command: "command-basic",
	"context-menu": "context-menu-issue",
	empty: "empty-issue-list-demo",
	field: "field-settings-row",
	"hover-card": "hover-card-profile",
	"input-group": "input-group-settings-search",
	item: "item-issue-row",
	progress: "progress-project",
	resizable: "resizable-inbox",
	"scroll-area": "scroll-area-settings",
	sheet: "sheet-project-details",
	sidebar: "sidebar-workspace",
	sonner: "sonner-workspace",
	table: "table-settings",
	tabs: "tabs-capsule",
	"toggle-group": "toggle-group-toolbar",
};

/** Where a component sits: its section ("basic" or "advanced") and its category key. */
export function categoryOf(slug: string, section: "basic" | "advanced") {
	const list = section === "basic" ? COMPONENT_CATEGORIES : ADVANCED_CATEGORIES;
	return list.find((category) => (category.slugs as readonly string[]).includes(slug));
}
