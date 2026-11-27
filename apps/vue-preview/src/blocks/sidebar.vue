<script lang="ts">
import { Button } from "@valar/vue-ui/button";
import { Calendar } from "@valar/vue-ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@valar/vue-ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@valar/vue-ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@valar/vue-ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@valar/vue-ui/dropdown-menu";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@valar/vue-ui/popover";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
	useSidebar,
} from "@valar/vue-ui/sidebar";
import { toast, Toaster } from "@valar/vue-ui/sonner";
import { Switch } from "@valar/vue-ui/switch";
// Layouts adapted from Valar's shadcn-svelte registry (MIT; see LICENSE.md).
import { computed, defineComponent, h, ref, shallowRef, useId, type VNodeChild } from "vue";

const icons = {
	book: "M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15",
	box: "m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9",
	calendar: "M4 6h16v15H4zM8 3v6m8-6v6M4 11h16m-11 5h2m3 0h2",
	check: "m5 12 4 4L19 6",
	chevron: "m9 6 6 6-6 6",
	down: "m6 9 6 6 6-6",
	file: "M5 3h9l5 5v13H5zM14 3v6h5M8 13h8m-8 4h6",
	folder: "M3 5h7l2 3h9v12H3z",
	help: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m-2.5 6a2.5 2.5 0 1 1 4 2L12 13m0 3h.01",
	home: "m3 10 9-7 9 7m-2-1v11H5V9m5 11v-6h4v6",
	inbox: "M5 4h14l3 10v6H2v-6zM2 14h6l2 2h4l2-2h6",
	mail: "M3 5h18v14H3zM3 6l9 7 9-7",
	minus: "M5 12h14",
	more: "M5 12h.01m6.99 0h.01m6.99 0h.01",
	plus: "M12 5v14M5 12h14",
	search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 4 4",
	settings: "M4 6h16M4 12h16M4 18h16M8 4v4m8 2v4m-6 2v4",
	star: "m12 3 2.7 5.5 6.1.9-4.4 4.3 1.1 6.1-5.5-2.9-5.5 2.9 1.1-6.1-4.4-4.3 6.1-.9z",
	user: "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M5 21v-2a7 7 0 0 1 14 0v2",
};
type IconName = keyof typeof icons;
type Name = readonly [en: string, zh: string];
type Entry = { name: Name; icon?: IconName; children?: Entry[]; badge?: string };
const entry = (en: string, zh: string, icon?: IconName, children?: Entry[]): Entry => ({
	name: [en, zh],
	icon,
	children,
});
const file = (name: string, badge?: string): Entry => ({ ...entry(name, name, "file"), badge });
const docs = [
	entry("Getting Started", "快速入门", "book", [
		entry("Installation", "安装"),
		entry("Project Structure", "项目结构"),
	]),
	entry("Build Your Application", "构建应用", "box", [
		entry("Routing", "路由"),
		entry("Data Fetching", "数据获取"),
		entry("Rendering", "渲染"),
		entry("Caching", "缓存"),
		entry("Styling", "样式"),
		entry("Testing", "测试"),
		entry("Deploying", "部署"),
	]),
	entry("API Reference", "API 参考", "file", [
		entry("Components", "组件"),
		entry("File Conventions", "文件约定"),
		entry("Functions", "函数"),
		entry("CLI", "命令行"),
	]),
	entry("Architecture", "架构", "folder", [
		entry("Accessibility", "无障碍"),
		entry("Fast Refresh", "快速刷新"),
		entry("Supported Browsers", "浏览器支持"),
	]),
	entry("Community", "社区", "help", [entry("Contribution Guide", "贡献指南")]),
];
const platform = [
	entry("Playground", "演练场", "box", [
		entry("History", "历史"),
		entry("Starred", "收藏"),
		entry("Settings", "设置"),
	]),
	entry("Models", "模型", "folder", [
		entry("Genesis", "Genesis"),
		entry("Explorer", "Explorer"),
		entry("Quantum", "Quantum"),
	]),
	entry("Documentation", "文档", "book", [
		entry("Introduction", "介绍"),
		entry("Get Started", "开始使用"),
		entry("Tutorials", "教程"),
		entry("Changelog", "更新日志"),
	]),
	entry("Settings", "设置", "settings", [
		entry("General", "常规"),
		entry("Team", "团队"),
		entry("Billing", "账单"),
		entry("Limits", "用量限制"),
	]),
];
const projectRows = [
	entry("Design Engineering", "设计工程", "box"),
	entry("Sales & Marketing", "销售与市场", "folder"),
	entry("Travel", "旅行", "calendar"),
];
const help = [entry("Support", "支持", "help"), entry("Feedback", "反馈", "mail")];
const projects = [...projectRows, ...help];
const mailboxes = [
	entry("Inbox", "收件箱", "inbox"),
	entry("Drafts", "草稿箱", "file"),
	entry("Sent", "已发送", "mail"),
	entry("Junk", "垃圾邮件", "box"),
	entry("Trash", "废纸篓", "folder"),
];
const mail = [
	{
		box: "Inbox",
		from: "William Smith",
		subject: ["Meeting tomorrow", "明天的会议"],
		detail: ["Can we review the launch checklist at 10?", "我们可以在 10 点检查发布清单吗？"],
		unread: true,
	},
	{
		box: "Inbox",
		from: "Alice Smith",
		subject: ["Re: Project update", "回复：项目更新"],
		detail: ["The latest designs are ready for review.", "最新设计已准备好供审阅。"],
		unread: false,
	},
	{
		box: "Inbox",
		from: "Bob Johnson",
		subject: ["Workshop notes", "研讨会笔记"],
		detail: ["Here are the decisions from our workshop.", "这是本次研讨会确定的事项。"],
		unread: true,
	},
	{
		box: "Drafts",
		from: "Valar",
		subject: ["Team agenda", "团队议程"],
		detail: ["Topics for next week.", "下周的话题。"],
		unread: false,
	},
	{
		box: "Sent",
		from: "Valar",
		subject: ["Release checklist", "发布清单"],
		detail: ["Thanks for reviewing the release.", "感谢审阅本次发布。"],
		unread: false,
	},
] satisfies { box: string; from: string; subject: Name; detail: Name; unread: boolean }[];
const workspaceNav = [
	entry("Search", "搜索", "search"),
	entry("Ask AI", "询问 AI", "help"),
	entry("Home", "主页", "home"),
	{ ...entry("Inbox", "收件箱", "inbox"), badge: "3" },
];
const workspaces = [
	entry("Design", "设计", "folder", [
		entry("Design System", "设计系统"),
		entry("Research", "研究"),
	]),
	entry("Engineering", "工程", "box", [
		entry("Roadmap", "路线图"),
		entry("Release Notes", "发布说明"),
	]),
];
const firstFavorite = entry("Project Management & Task Tracking", "项目管理与任务追踪", "file");
const initialFavorites = [firstFavorite, entry("Design System", "设计系统", "book")];
const settings = [
	entry("Notifications", "通知", "inbox"),
	entry("Navigation", "导航", "folder"),
	entry("Home", "主页", "home"),
	entry("Appearance", "外观", "settings"),
	entry("Messages & media", "消息和媒体", "mail"),
	entry("Language & region", "语言与地区", "book"),
	entry("Accessibility", "无障碍", "help"),
	entry("Privacy & visibility", "隐私和可见性", "user"),
];
const changes = [
	file("README.md", "M"),
	file("routes/index.ts", "U"),
	file("routes/layout.ts", "M"),
];
const tree = [
	entry("lib", "lib", "folder", [
		entry("components", "components", "folder", [file("button.vue"), file("card.vue")]),
		file("utils.ts"),
	]),
	entry("routes", "routes", "folder", [
		entry("hello", "hello", "folder", [file("hello/index.ts"), file("hello/loader.ts")]),
		file("routes/index.ts"),
		file("routes/layout.ts"),
	]),
	entry("public", "public", "folder", [file("favicon.ico"), file("logo.svg")]),
	file("package.json"),
	file("README.md"),
];
const calendarGroups = [
	entry("My Calendars", "我的日历", "calendar", [
		entry("Personal", "个人"),
		entry("Work", "工作"),
		entry("Family", "家庭"),
	]),
	entry("Favorites", "收藏", "star", [entry("Holidays", "节假日"), entry("Birthdays", "生日")]),
	entry("Other", "其他", "calendar", [
		entry("Travel", "旅行"),
		entry("Reminders", "提醒"),
		entry("Deadlines", "截止日期"),
	]),
];
const pageActions: Name[][] = [
	[
		["Customize Page", "自定义页面"],
		["Turn into wiki", "转换为知识库"],
	],
	[
		["Copy Link", "复制链接"],
		["Duplicate", "复制页面"],
		["Move to", "移动至"],
		["Move to Trash", "移到废纸篓"],
	],
	[
		["Undo", "撤销"],
		["View analytics", "查看分析"],
		["Version History", "版本历史"],
		["Notifications", "通知"],
	],
	[
		["Import", "导入"],
		["Export", "导出"],
	],
];
const versions = ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"];
const teams = ["Acme Inc", "Acme Corp.", "Evil Corp."];
const headerClass =
	"sticky top-0 z-20 flex min-h-12 shrink-0 items-center gap-2 border-b-[0.5px] border-border bg-background px-3 py-1.5";
const focusClass =
	"focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring";
type MenuChoice = { label: string; pick: () => void; checked?: boolean };

function icon(name: IconName, classes = "") {
	return h(
		"svg",
		{
			"aria-hidden": true,
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			"stroke-width": name === "more" ? 3 : 1.65,
			"stroke-linecap": "round",
			"stroke-linejoin": "round",
			class: `size-3.5 shrink-0 ${classes}`,
		},
		[h("path", { d: icons[name] })]
	);
}

function menu(
	trigger: () => VNodeChild,
	choices: MenuChoice[],
	side: "bottom" | "top" | "right" = "bottom"
) {
	return h(
		DropdownMenu,
		{ modal: false },
		{
			default: () => [
				h(DropdownMenuTrigger, { asChild: true }, { default: trigger }),
				h(
					DropdownMenuContent,
					{
						appearance: "surface",
						side,
						align: "start",
						class: "min-w-40 max-w-[calc(100vw-1rem)]",
					},
					{
						default: () =>
							choices.map(({ label, pick, checked }) =>
								h(
									DropdownMenuItem,
									{ key: label, onSelect: pick },
									{ default: () => [h("span", label), checked && icon("check", "ms-auto")] }
								)
							),
					}
				),
			],
		}
	);
}

const ControlledToggle = defineComponent({
	props: { id: { type: String, required: true }, chinese: Boolean },
	setup(props) {
		const { isMobile, openMobile, toggle, open, setOpen } = useSidebar();
		const expanded = computed(() => (isMobile.value ? openMobile.value : open.value));
		return () =>
			h(
				Button,
				{
					size: "sm",
					variant: "outline",
					"aria-controls": props.id,
					"aria-expanded": expanded.value,
					onClick: (event: MouseEvent) =>
						isMobile.value ? toggle(event.currentTarget as HTMLElement) : setOpen(!open.value),
				},
				{
					default: () =>
						expanded.value
							? props.chinese
								? "关闭侧边栏"
								: "Close sidebar"
							: props.chinese
								? "打开侧边栏"
								: "Open sidebar",
				}
			);
	},
});

const componentProps = { block: { type: String, required: true as const }, chinese: Boolean };
const SidebarLayout = defineComponent({
	props: componentProps,
	setup(props) {
		const t = (en: string, zh: string) => (props.chinese ? zh : en);
		const text = (name: Name) => t(...name);
		const id = useId();
		const number = Number(/^sidebar-(\d{2})$/.exec(props.block)?.[1]);
		const is = (suffix: string) => props.block === `demo-sidebar${suffix ? `-${suffix}` : ""}`;
		const docsMode =
			(number >= 1 && number <= 6) || number === 14 || is("menu-sub") || is("menu-collapsible");
		const teamLayout = number === 7 || is("icon");
		const workspace = number === 10 || number === 15;
		const platformLayout = teamLayout || number === 8 || number === 16;
		const initial = docsMode
			? docs[1].children![1]
			: number === 11
				? tree[0].children![0].children![0]
				: number === 13
					? settings[4]
					: workspace
						? firstFavorite
						: undefined;
		const active = ref(initial?.name);
		const open = ref(true);
		const query = ref("");
		const version = ref(versions[0]);
		const team = ref(is("header") ? "" : teams[0]);
		const status = ref("");
		const removed = ref<string[]>([]);
		const extraFavorites = ref<Entry[]>([]);
		const mailbox = ref(mailboxes[0].name[0]);
		const unreadOnly = ref(false);
		const read = ref<number[]>([]);
		const message = ref<number>();
		const selectedDate = shallowRef<InstanceType<typeof Calendar>["$props"]["modelValue"]>();
		const enabled = ref(["Personal", "Work", "Holidays", "Birthdays", "Travel", "Reminders"]);
		const extraCalendars = ref<Entry[]>([]);
		const select = (item: Entry) => {
			active.value = item.name;
			status.value = "";
		};
		const current = (item: Entry) => active.value?.[0] === item.name[0];
		const report = (name: Name) => {
			status.value = `${text(name)} · ${t("Preview only", "仅预览")}`;
		};
		const match = (item: Entry) =>
			item.name.join(" ").toLowerCase().includes(query.value.trim().toLowerCase());
		const toggleLabel = () => t("Toggle sidebar", "切换侧边栏");
		const title = computed(() =>
			number === 9
				? message.value === undefined
					? text(mailboxes.find((item) => item.name[0] === mailbox.value)!.name)
					: text(mail[message.value].subject)
				: number === 12
					? selectedDate.value && !Array.isArray(selectedDate.value)
						? new Intl.DateTimeFormat(t("en-US", "zh-CN"), {
								dateStyle: "long",
								timeZone: "UTC",
							}).format(selectedDate.value.toDate("UTC"))
						: t("Calendar", "日历")
					: active.value
						? text(active.value)
						: docsMode
							? t("Documentation", "文档")
							: t("Workspace", "工作区")
		);
		const footerChoices: Name[] = is("footer")
			? [
					["Account", "账户"],
					["Billing", "账单"],
					["Sign out", "退出登录"],
				]
			: [
					["Upgrade plan", "升级计划"],
					["Account", "账户"],
					["Billing", "账单"],
					["Notifications", "通知"],
					["Sign out", "退出登录"],
				];
		const rowLabel = (item: Entry, trailing?: IconName) => [
			item.icon && icon(item.icon),
			h(
				"span",
				{ class: "min-w-0 flex-1 truncate group-data-[collapsible=icon]:sr-only" },
				text(item.name)
			),
			trailing && icon(trailing, "ms-auto group-data-[collapsible=icon]:hidden"),
		];
		const row = (item: Entry, action?: () => VNodeChild, badge = item.badge) =>
			h(
				SidebarMenuItem,
				{ key: item.name[0] },
				{
					default: () => [
						h(
							SidebarMenuButton,
							{
								isActive: current(item),
								"aria-current": current(item) ? "page" : undefined,
								tooltipContent: teamLayout ? text(item.name) : undefined,
								onClick: () => select(item),
							},
							{ default: () => rowLabel(item) }
						),
						action?.(),
						badge && h(SidebarMenuBadge, null, { default: () => badge }),
					],
				}
			);
		const list = (items: Entry[], action?: (item: Entry) => VNodeChild, badges = false) =>
			h(SidebarMenu, null, {
				default: () =>
					items.map((item, index) =>
						row(
							item,
							action && (() => action(item)),
							badges ? ["24", "12", "3", "21", "8"][index] : item.badge
						)
					),
			});
		const group = (label: string, content: () => VNodeChild, classes?: string) =>
			h(
				SidebarGroup,
				{ class: classes },
				{
					default: () => [label && h(SidebarGroupLabel, null, { default: () => label }), content()],
				}
			);
		const sub = (items: Entry[]) =>
			h(SidebarMenuSub, null, {
				default: () =>
					items.map((item) =>
						h(
							SidebarMenuSubItem,
							{ key: item.name[0] },
							{
								default: () =>
									h(
										SidebarMenuSubButton,
										{
											as: "button",
											type: "button",
											isActive: current(item),
											class: "w-full text-start",
											"aria-current": current(item) ? "page" : undefined,
											onClick: () => select(item),
										},
										{ default: () => h("span", text(item.name)) }
									),
							}
						)
					),
			});
		const disclosure = (
			key: string,
			label: string,
			content: () => VNodeChild,
			defaultOpen: boolean
		) =>
			h(
				Collapsible,
				{ key, defaultOpen, class: "group/disclosure" },
				{
					default: () =>
						h(SidebarGroup, null, {
							default: () => [
								h(
									CollapsibleTrigger,
									{ asChild: true },
									{
										default: () =>
											h(
												SidebarGroupLabel,
												{
													as: "button",
													type: "button",
													class: "w-full gap-2 text-start hover:bg-sidebar-accent",
												},
												{
													default: () => [
														h("span", { class: "flex-1 truncate" }, label),
														icon(
															"chevron",
															"group-data-[state=open]/disclosure:rotate-90 rtl:-scale-x-100"
														),
													],
												}
											),
									}
								),
								h(CollapsibleContent, null, { default: content }),
							],
						}),
				}
			);
		const branch = (
			item: Entry,
			defaultOpen: boolean,
			glyph: "plus" | "chevron" | "separate",
			content: () => VNodeChild
		) =>
			h(
				SidebarMenuItem,
				{ key: item.name[0] },
				{
					default: () =>
						h(
							Collapsible,
							{ defaultOpen, class: "group/disclosure relative" },
							{
								default: () => [
									glyph === "separate"
										? [
												h(
													SidebarMenuButton,
													{
														class: "pe-8",
														onClick: () => select(item),
														isActive: current(item),
														"aria-current": current(item) ? "page" : undefined,
													},
													{ default: () => rowLabel(item) }
												),
												h(
													CollapsibleTrigger,
													{ asChild: true },
													{
														default: () =>
															h(
																SidebarMenuAction,
																{ "aria-label": `${t("Toggle", "展开或收起")} ${text(item.name)}` },
																{
																	default: () =>
																		icon("chevron", "group-data-[state=open]/disclosure:rotate-90"),
																}
															),
													}
												),
											]
										: h(
												CollapsibleTrigger,
												{ asChild: true },
												{
													default: () =>
														h(
															SidebarMenuButton,
															{ tooltipContent: teamLayout ? text(item.name) : undefined },
															{
																default: () => [
																	...rowLabel(item),
																	glyph === "plus"
																		? [
																				icon("plus", "group-data-[state=open]/disclosure:hidden"),
																				icon(
																					"minus",
																					"group-data-[state=closed]/disclosure:hidden"
																				),
																			]
																		: icon(
																				"chevron",
																				"group-data-[state=open]/disclosure:rotate-90 group-data-[collapsible=icon]:hidden"
																			),
																],
															}
														),
												}
											),
									h(CollapsibleContent, null, { default: content }),
								],
							}
						),
				}
			);
		const folders = (items: Entry[]): VNodeChild[] =>
			items.map((item) =>
				item.children
					? branch(item, ["lib", "components"].includes(item.name[0]), "chevron", () =>
							h(SidebarMenuSub, null, { default: () => folders(item.children!) })
						)
					: row(item)
			);
		const search = (label: string) =>
			h("div", { role: "search", class: "relative min-w-0" }, [
				icon(
					"search",
					"pointer-events-none absolute inset-s-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
				),
				h(SidebarInput, {
					type: "search",
					"aria-label": label,
					placeholder: label,
					class: "ps-8",
					modelValue: query.value,
					"onUpdate:modelValue": (value: string | number) => {
						query.value = String(value);
					},
				}),
			]);
		const empty = () =>
			h(
				"p",
				{ role: "status", class: "px-3 py-4 text-xs text-muted-foreground" },
				t("No matches", "无匹配结果")
			);
		const switcher = (
			name: string,
			symbol: IconName,
			choices: MenuChoice[],
			side: "bottom" | "right" = "bottom",
			description?: string
		) =>
			h(SidebarMenu, null, {
				default: () =>
					h(SidebarMenuItem, null, {
						default: () =>
							menu(
								() =>
									h(
										SidebarMenuButton,
										{
											size: description ? "lg" : "default",
											tooltipContent: teamLayout ? name : undefined,
											class: "aria-expanded:bg-sidebar-accent",
										},
										{
											default: () => [
												icon(symbol),
												h(
													"span",
													{
														class: "min-w-0 flex-1 truncate group-data-[collapsible=icon]:sr-only",
													},
													[
														name,
														description &&
															h(
																"small",
																{ class: "block truncate text-muted-foreground" },
																description
															),
													]
												),
												icon("down", "group-data-[collapsible=icon]:hidden"),
											],
										}
									),
								choices,
								side
							),
					}),
			});
		const brand = (name: string, note: string) =>
			h("div", { class: "flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 font-medium" }, [
				h(
					"span",
					{
						class:
							"grid size-7 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground",
					},
					[icon(docsMode ? "book" : "box")]
				),
				h("span", { class: "min-w-0 truncate" }, [
					name,
					h("small", { class: "block text-muted-foreground" }, note),
				]),
			]);
		const teamMenu = () =>
			switcher(
				team.value || t("Select Workspace", "选择工作区"),
				"box",
				teams.slice(0, is("header") ? 2 : 3).map((name) => ({
					label: name,
					checked: name === team.value,
					pick: () => {
						team.value = name;
					},
				})),
				teamLayout ? "right" : "bottom",
				teamLayout
					? [t("Enterprise", "企业版"), t("Startup", "初创版"), t("Free", "免费版")][
							teams.indexOf(team.value)
						]
					: undefined
			);
		const account = (side: "right" | "top" | "bottom" = "top", compact = false) =>
			h(SidebarMenu, null, {
				default: () =>
					h(SidebarMenuItem, null, {
						default: () =>
							menu(
								() =>
									h(
										SidebarMenuButton,
										{
											size: compact ? "default" : "lg",
											"aria-label": t("Account menu", "账户菜单"),
											tooltipContent: teamLayout ? t("Account menu", "账户菜单") : undefined,
											class: compact ? "justify-center" : "aria-expanded:bg-sidebar-accent",
										},
										{
											default: () => [
												h(
													"span",
													{
														"aria-hidden": true,
														class:
															"grid size-6 shrink-0 place-items-center rounded-md bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground",
													},
													"V"
												),
												!compact &&
													h(
														"span",
														{
															class:
																"min-w-0 flex-1 truncate group-data-[collapsible=icon]:sr-only",
														},
														[
															is("footer") ? t("Username", "用户名") : "Valar",
															!is("footer") &&
																h(
																	"small",
																	{ class: "block truncate text-muted-foreground" },
																	"m@example.com"
																),
														]
													),
												!compact &&
													icon(
														"down",
														side === "top"
															? "rotate-180 group-data-[collapsible=icon]:hidden"
															: "group-data-[collapsible=icon]:hidden"
													),
											],
										}
									),
								footerChoices.map((name) => ({ label: text(name), pick: () => report(name) })),
								side
							),
					}),
			});
		const rowMenu = (item: Entry, favorite = false) => {
			const remove: Name = favorite
				? ["Remove from favorites", "取消收藏"]
				: ["Delete Project", "删除项目"];
			const names: Name[] = is("menu-action")
				? [["Edit Project", "编辑项目"], remove]
				: [
						favorite ? ["Open page", "打开页面"] : ["View Project", "查看项目"],
						["Share", "分享"],
						remove,
					];
			return menu(
				() =>
					h(
						SidebarMenuAction,
						{
							showOnHover: !is("menu-action"),
							"aria-label": `${t("More actions for", "更多操作：")} ${text(item.name)}`,
						},
						{ default: () => icon("more") }
					),
				names.map((name, index) => ({
					label: text(name),
					pick: () => {
						if (name === remove) {
							removed.value.push(item.name[0]);
							extraFavorites.value = extraFavorites.value.filter(
								(favorite) => favorite.name[0] !== item.name[0]
							);
							if (current(item) && !favorite) active.value = undefined;
						} else if (index === 0) select(item);
						if (index !== 0 || is("menu-action")) report(name);
					},
				})),
				"right"
			);
		};
		const projectGroup = (items: Entry[], actions = false) =>
			group(
				t("Projects", "项目"),
				() => [
					is("group-action") &&
						h(
							SidebarGroupAction,
							{
								"aria-label": t("Add Project", "添加项目"),
								onClick: () =>
									toast(t("You clicked the group action!", "已触发分组操作！"), { toasterId: id }),
							},
							{ default: () => icon("plus") }
						),
					list(
						items.filter((item) => !removed.value.includes(item.name[0])),
						actions ? rowMenu : undefined,
						is("menu-badge")
					),
				],
				platformLayout ? "group-data-[collapsible=icon]:hidden" : undefined
			);

		function documentation(): VNodeChild {
			const visible = docs.filter(
				(item) => item.children && (match(item) || item.children.some(match))
			);
			const leaves = (item: Entry) => (match(item) ? item.children! : item.children!.filter(match));
			if (!visible.length) return empty();
			if (number === 1)
				return visible.map((item) =>
					h(
						SidebarGroup,
						{ key: item.name[0] },
						{
							default: () => [
								h(SidebarGroupLabel, null, { default: () => text(item.name) }),
								list(leaves(item)),
							],
						}
					)
				);
			if (number === 2)
				return visible.map((item) =>
					disclosure(item.name[0], text(item.name), () => list(leaves(item)), true)
				);
			if (number === 6)
				return group("", () =>
					h(SidebarMenu, null, {
						default: () =>
							visible.map((item) =>
								h(
									SidebarMenuItem,
									{ key: item.name[0] },
									{
										default: () =>
											menu(
												() => h(SidebarMenuButton, null, { default: () => rowLabel(item, "more") }),
												leaves(item).map((child) => ({
													label: text(child.name),
													pick: () => select(child),
													checked: current(child),
												})),
												"right"
											),
									}
								)
							),
					})
				);
			return group(number === 14 ? t("Table of Contents", "目录") : "", () =>
				h(
					SidebarMenu,
					{ class: number === 4 ? "gap-2" : undefined },
					{
						default: () =>
							visible.map((item) =>
								number === 5 || is("menu-collapsible")
									? branch(
											item,
											query.value.trim() !== "" || item === docs[number === 5 ? 1 : 0],
											number === 5 ? "plus" : "chevron",
											() => sub(leaves(item))
										)
									: h(
											SidebarMenuItem,
											{ key: item.name[0] },
											{
												default: () => [
													h(
														SidebarMenuButton,
														{ onClick: () => select(item), isActive: current(item) },
														{ default: () => rowLabel(item) }
													),
													sub(leaves(item)),
												],
											}
										)
							),
					}
				)
			);
		}

		function mailPane() {
			return h("div", { class: "flex min-h-0 flex-1" }, [
				h(
					Sidebar,
					{
						collapsible: "none",
						class: "w-(--sidebar-width-icon) shrink-0 border-e-[0.5px] border-sidebar-border",
					},
					{
						default: () => [
							h(SidebarHeader, { class: "items-center" }, { default: () => icon("mail") }),
							h(SidebarContent, null, {
								default: () =>
									h(
										SidebarMenu,
										{ class: "items-center px-1" },
										{
											default: () =>
												mailboxes.map((item) =>
													h(
														SidebarMenuItem,
														{ key: item.name[0] },
														{
															default: () =>
																h(
																	SidebarMenuButton,
																	{
																		size: "sm",
																		class: "size-8 justify-center p-0",
																		isActive: mailbox.value === item.name[0],
																		"aria-pressed": mailbox.value === item.name[0],
																		"aria-label": text(item.name),
																		title: text(item.name),
																		onClick: () => {
																			mailbox.value = item.name[0];
																			message.value = undefined;
																		},
																	},
																	{ default: () => icon(item.icon!) }
																),
														}
													)
												),
										}
									),
							}),
							h(SidebarFooter, { class: "p-1" }, { default: () => account("right", true) }),
						],
					}
				),
				h(
					Sidebar,
					{ collapsible: "none", class: "min-w-0 flex-1" },
					{
						default: () => [
							h(
								SidebarHeader,
								{ class: "border-b-[0.5px] border-sidebar-border p-3" },
								{
									default: () => [
										h("div", { class: "flex flex-wrap items-center justify-between gap-2" }, [
											h(
												"h2",
												{ class: "min-w-0 truncate font-semibold" },
												text(mailboxes.find((item) => item.name[0] === mailbox.value)!.name)
											),
											h("label", { class: "flex items-center gap-2 text-xs" }, [
												h(Switch, {
													size: "sm",
													modelValue: unreadOnly.value,
													"onUpdate:modelValue": (value) => {
														unreadOnly.value = value === true;
													},
												}),
												t("Unreads", "仅未读"),
											]),
										]),
										search(t("Search messages", "搜索邮件")),
									],
								}
							),
							h(SidebarContent, null, {
								default: () => {
									const visible = mail
										.map((item, index) => ({ item, index }))
										.filter(
											({ item, index }) =>
												item.box === mailbox.value &&
												(!unreadOnly.value || (item.unread && !read.value.includes(index))) &&
												[item.from, ...item.subject, ...item.detail].some((value) =>
													value.toLowerCase().includes(query.value.trim().toLowerCase())
												)
										);
									return visible.length
										? visible.map(({ item, index }) =>
												h(
													"button",
													{
														key: index,
														type: "button",
														"aria-pressed": message.value === index,
														"aria-label": `${text(item.subject)} — ${item.from}`,
														class: `w-full border-b-[0.5px] border-sidebar-border p-3 text-start text-xs hover:bg-sidebar-accent aria-pressed:bg-sidebar-accent ${focusClass}`,
														onClick: () => {
															message.value = index;
															if (!read.value.includes(index)) read.value.push(index);
														},
													},
													[
														h("span", { class: "block truncate font-semibold" }, item.from),
														h("span", { class: "block truncate" }, text(item.subject)),
														h(
															"span",
															{ class: "block truncate text-muted-foreground" },
															text(item.detail)
														),
													]
												)
											)
										: empty();
								},
							}),
						],
					}
				),
			]);
		}

		const favorites = computed(() => [
			...initialFavorites.filter((item) => !removed.value.includes(item.name[0])),
			...extraFavorites.value,
		]);
		const starred = computed(() => favorites.value.some(current));
		const pageHeaderActions = () =>
			h("div", { class: "ms-auto flex shrink-0 items-center gap-1" }, [
				h(
					Button,
					{
						variant: "ghost",
						size: "icon-sm",
						"aria-pressed": starred.value,
						"aria-label": starred.value
							? t("Remove from favorites", "取消收藏")
							: t("Add to favorites", "添加收藏"),
						onClick: () => {
							const item = active.value;
							if (!item) return;
							if (starred.value) {
								removed.value.push(item[0]);
								extraFavorites.value = extraFavorites.value.filter(
									(favorite) => favorite.name[0] !== item[0]
								);
							} else {
								removed.value = removed.value.filter((name) => name !== item[0]);
								if (!initialFavorites.some(current))
									extraFavorites.value.push(entry(...item, "file"));
							}
						},
					},
					{ default: () => icon("star", starred.value ? "fill-current" : "") }
				),
				h(Popover, null, {
					default: () => [
						h(
							PopoverTrigger,
							{ asChild: true },
							{
								default: () =>
									h(
										Button,
										{
											variant: "ghost",
											size: "icon-sm",
											"aria-label": t("Page actions", "页面操作"),
										},
										{ default: () => icon("more") }
									),
							}
						),
						h(
							PopoverContent,
							{
								appearance: "surface",
								align: "end",
								class: "w-52 max-w-[calc(100vw-1rem)] p-0",
								"aria-label": t("Page actions", "页面操作"),
							},
							{
								default: () =>
									h(
										Sidebar,
										{ collapsible: "none", class: "w-full bg-transparent" },
										{
											default: () =>
												h(
													SidebarContent,
													{ class: "max-h-[65svh]" },
													{
														default: () =>
															pageActions.map((actions) =>
																h(
																	SidebarGroup,
																	{
																		key: actions[0][0],
																		class: "border-b-[0.5px] border-border last:border-0",
																	},
																	{
																		default: () =>
																			h(SidebarMenu, null, {
																				default: () =>
																					actions.map((name) =>
																						h(
																							SidebarMenuItem,
																							{ key: name[0] },
																							{
																								default: () =>
																									h(
																										PopoverClose,
																										{ asChild: true },
																										{
																											default: () =>
																												h(
																													SidebarMenuButton,
																													{ onClick: () => report(name) },
																													{ default: () => h("span", text(name)) }
																												),
																										}
																									),
																							}
																						)
																					),
																			}),
																	}
																)
															),
													}
												),
										}
									),
							}
						),
					],
				}),
			]);

		const calendarSidebar = () => [
			h(
				SidebarHeader,
				{ class: "border-b-[0.5px] border-sidebar-border" },
				{ default: () => account("bottom") }
			),
			h(SidebarContent, null, {
				default: () => [
					h("div", { class: "flex justify-center px-2 py-2" }, [
						h(Calendar, {
							locale: t("en-US", "zh-CN"),
							class: "w-auto! bg-transparent p-0",
							modelValue: selectedDate.value,
							"onUpdate:modelValue": (value) => {
								selectedDate.value = value;
							},
						}),
					]),
					h(SidebarSeparator),
					...calendarGroups.map((item, index) =>
						disclosure(
							item.name[0],
							text(item.name),
							() =>
								h(SidebarMenu, null, {
									default: () =>
										[...item.children!, ...(index === 0 ? extraCalendars.value : [])].map((child) =>
											h(
												SidebarMenuItem,
												{ key: child.name[0] },
												{
													default: () =>
														h(
															SidebarMenuButton,
															{
																"aria-pressed": enabled.value.includes(child.name[0]),
																onClick: () => {
																	const name = child.name[0];
																	enabled.value = enabled.value.includes(name)
																		? enabled.value.filter((item) => item !== name)
																		: [...enabled.value, name];
																},
															},
															{
																default: () => [
																	h(
																		"span",
																		{
																			"aria-hidden": true,
																			class:
																				"grid size-3.5 shrink-0 place-items-center rounded-sm border border-sidebar-border",
																		},
																		[
																			enabled.value.includes(child.name[0]) &&
																				icon("check", "text-primary"),
																		]
																	),
																	h("span", text(child.name)),
																],
															}
														),
												}
											)
										),
								}),
							index === 0
						)
					),
				],
			}),
			h(SidebarFooter, null, {
				default: () =>
					h(SidebarMenu, null, {
						default: () =>
							h(SidebarMenuItem, null, {
								default: () =>
									h(
										SidebarMenuButton,
										{
											onClick: () => {
												const next = extraCalendars.value.length + 1;
												extraCalendars.value.push(entry(`Calendar ${next}`, `日历 ${next}`));
												status.value = t("Calendar added to My Calendars", "已添加到我的日历");
											},
										},
										{ default: () => [icon("plus"), h("span", t("New Calendar", "新建日历"))] }
									),
							}),
					}),
			}),
		];

		const placeholders = (length: number) =>
			Array.from({ length }, (_, index) =>
				h("div", {
					key: index,
					"aria-hidden": true,
					class: "h-16 rounded-lg border-[0.5px] border-border bg-muted/50",
				})
			);
		const renderSettings = () =>
			h(
				"section",
				{ lang: t("en", "zh-CN"), class: "grid min-h-80 place-items-center bg-background" },
				[
					h(
						Dialog,
						{ defaultOpen: true },
						{
							default: () => [
								h(
									DialogTrigger,
									{ asChild: true },
									{
										default: () =>
											h(Button, { size: "sm" }, { default: () => t("Open Settings", "打开设置") }),
									}
								),
								h(
									DialogContent,
									{
										closeLabel: t("Close", "关闭"),
										class:
											"h-[min(30rem,85svh)] max-w-[min(46rem,calc(100vw-1rem))]! gap-0 overflow-hidden p-0!",
									},
									{
										default: () => [
											h(
												DialogTitle,
												{ class: "sr-only" },
												{ default: () => t("Settings", "设置") }
											),
											h(
												DialogDescription,
												{ class: "sr-only" },
												{ default: () => t("Choose a settings section.", "选择设置分区。") }
											),
											h(
												SidebarProvider,
												{
													appearance: "workspace",
													keyboardShortcut: false,
													persistState: false,
													class: "h-full min-h-0 flex-col md:flex-row",
												},
												{
													default: () => [
														h(
															Sidebar,
															{ collapsible: "none", class: "hidden shrink-0 md:flex" },
															{
																default: () =>
																	h(SidebarContent, null, {
																		default: () =>
																			group(t("Settings", "设置"), () => list(settings)),
																	}),
															}
														),
														h(SidebarInset, null, {
															default: () => [
																h("div", { class: "border-b-[0.5px] border-border p-3 pe-12" }, [
																	h("h2", { class: "truncate text-sm font-semibold" }, title.value),
																	h(
																		"select",
																		{
																			"aria-label": t("Settings section", "设置分区"),
																			class: `mt-2 max-w-full rounded-md border border-border bg-background p-1 text-sm md:hidden ${focusClass}`,
																			value: active.value?.[0],
																			onChange: (event: Event) => {
																				const item = settings.find(
																					(item) =>
																						item.name[0] ===
																						(event.target as HTMLSelectElement).value
																				);
																				if (item) select(item);
																			},
																		},
																		settings.map((item) =>
																			h(
																				"option",
																				{ key: item.name[0], value: item.name[0] },
																				text(item.name)
																			)
																		)
																	),
																]),
																h(
																	"div",
																	{
																		class: `min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-sm ${focusClass}`,
																		tabindex: 0,
																		"aria-label": title.value,
																	},
																	[
																		h(
																			"p",
																			t(
																				"Settings are shown here as a layout preview.",
																				"这里是设置布局预览。"
																			)
																		),
																		...placeholders(8),
																	]
																),
															],
														}),
													],
												}
											),
										],
									}
								),
							],
						}
					),
				]
			);

		const newsletter = () =>
			h(SidebarFooter, null, {
				default: () =>
					h(
						Card,
						{ size: "sm", class: "gap-2 shadow-none" },
						{
							default: () => [
								h(CardHeader, null, {
									default: () => [
										h(CardTitle, null, {
											default: () => t("Subscribe to our newsletter", "订阅通讯"),
										}),
										h(CardDescription, null, {
											default: () =>
												t("Opt in to receive updates about the sidebar.", "订阅以接收侧边栏更新。"),
										}),
									],
								}),
								h(CardContent, null, {
									default: () =>
										h(
											"form",
											{
												class: "grid gap-2",
												onSubmit: (event: SubmitEvent) => {
													event.preventDefault();
													(event.currentTarget as HTMLFormElement).reset();
													status.value = t(
														"Subscribed for this preview. No email was sent.",
														"已在预览中订阅，未发送邮件。"
													);
												},
											},
											[
												h(SidebarInput, {
													name: "email",
													type: "email",
													required: true,
													autocomplete: "email",
													"aria-label": t("Email", "电子邮箱"),
													placeholder: t("Email", "电子邮箱"),
												}),
												h(
													Button,
													{ type: "submit", size: "sm" },
													{ default: () => t("Subscribe", "订阅") }
												),
											]
										),
								}),
							],
						}
					),
			});

		function navContent(): VNodeChild {
			if (docsMode)
				return h(
					"nav",
					{
						key: query.value.trim() ? "search-results" : "unfiltered",
						"aria-label": t("Sidebar navigation", "侧边栏导航"),
					},
					[documentation()]
				);
			if (number === 11)
				return [
					group(t("Changes", "更改"), () => list(changes)),
					group(t("Files", "文件"), () => h(SidebarMenu, null, { default: () => folders(tree) })),
				];
			if (platformLayout)
				return [
					group(t("Platform", "平台"), () =>
						h(
							SidebarMenu,
							{ key: query.value.trim() ? "search-results" : "unfiltered" },
							{
								default: () =>
									platform
										.filter((item) => match(item) || item.children!.some(match))
										.map((item) =>
											branch(
												item,
												item === platform[0] || query.value.trim() !== "",
												teamLayout ? "chevron" : "separate",
												() => sub(match(item) ? item.children! : item.children!.filter(match))
											)
										),
							}
						)
					),
					projectGroup(projectRows.filter(match), true),
					!teamLayout && group("", () => list(help.filter(match)), "mt-auto"),
					query.value.trim() &&
					![...platform, ...projects, ...platform.flatMap((item) => item.children!)].some(match)
						? empty()
						: null,
				];
			if (workspace)
				return [
					group("", () => list(workspaceNav)),
					group(t("Favorites", "收藏"), () => list(favorites.value, (item) => rowMenu(item, true))),
					group(t("Workspaces", "工作区"), () =>
						h(SidebarMenu, null, {
							default: () =>
								workspaces.map((item) =>
									branch(item, false, "separate", () => sub(item.children!))
								),
						})
					),
					group("", () => list(help), "mt-auto"),
				];
			if (is("group")) return group(t("Help", "帮助"), () => list(help));
			if (is("group-collapsible"))
				return disclosure("help", t("Help", "帮助"), () => list(help), true);
			if (is(""))
				return group(t("Application", "应用"), () =>
					list([
						entry("Home", "主页", "home"),
						mailboxes[0],
						entry("Calendar", "日历", "calendar"),
						entry("Search", "搜索", "search"),
						entry("Settings", "设置", "settings"),
					])
				);
			return !is("header") && !is("footer")
				? projectGroup(is("group-action") ? projectRows : projects, is("menu-action"))
				: null;
		}

		const nav = () =>
			h(
				Sidebar,
				{
					id,
					side: number === 14 ? "right" : "left",
					variant: number === 4 ? "floating" : number === 8 || is("") ? "inset" : "sidebar",
					collapsible: teamLayout ? "icon" : "offcanvas",
					mobileTitle: t("Sidebar navigation", "侧边栏导航"),
					mobileDescription: t(
						"Choose a destination or close the sidebar.",
						"选择目标或关闭侧边栏。"
					),
					class: "md:absolute md:h-full data-[mobile=true]:pt-10",
				},
				{
					default: () => [
						number === 9
							? mailPane()
							: number === 12
								? calendarSidebar()
								: [
										((docsMode && Number.isFinite(number) && number !== 14) ||
											platformLayout ||
											workspace ||
											is("header")) &&
											h(SidebarHeader, null, {
												default: () => [
													number === 1 || number === 2
														? switcher(
																t("Documentation", "文档"),
																"book",
																versions.map((name) => ({
																	label: name,
																	checked: name === version.value,
																	pick: () => {
																		version.value = name;
																	},
																})),
																"bottom",
																`v${version.value}`
															)
														: teamLayout || workspace || is("header")
															? teamMenu()
															: brand(
																	docsMode ? t("Documentation", "文档") : "Valar Studio",
																	docsMode ? "v1.0.1" : t("Workspace", "工作区")
																),
													(number === 1 || number === 2 || number === 5) &&
														search(t("Search the docs", "搜索文档")),
												],
											}),
										h(SidebarContent, null, { default: navContent }),
										(platformLayout || is("footer")) &&
											h(SidebarFooter, null, {
												default: () => account(teamLayout ? "right" : "top"),
											}),
										number === 6 && newsletter(),
									],
						!is("controlled") &&
							h(SidebarRail, {
								"aria-label": toggleLabel(),
								title: toggleLabel(),
								class: "in-data-[mobile=true]:hidden!",
							}),
					],
				}
			);
		const trigger = () =>
			is("controlled")
				? h(ControlledToggle, { id, chinese: props.chinese })
				: h(SidebarTrigger, {
						label: toggleLabel(),
						"aria-controls": id,
						class: number === 14 ? "ms-auto rotate-180" : undefined,
					});
		const breadcrumb = () =>
			h(
				"nav",
				{
					"aria-label": t("Breadcrumb", "面包屑导航"),
					class: "flex min-w-0 items-center gap-2 text-xs",
				},
				[
					h(
						"span",
						{ class: "hidden shrink-0 text-muted-foreground lg:inline" },
						docsMode
							? t("Documentation", "文档")
							: number === 9
								? t("All Inboxes", "全部收件箱")
								: number === 11
									? t("Files", "文件")
									: t("Workspace", "工作区")
					),
					icon("chevron", "hidden text-muted-foreground lg:block rtl:-scale-x-100"),
					h("span", { "aria-current": "page", class: "truncate font-medium" }, title.value),
				]
			);
		const main = () =>
			h(
				SidebarInset,
				{ class: "min-h-0 overflow-y-auto" },
				{
					default: () => [
						number !== 16 &&
							h("header", { class: headerClass }, [
								number !== 14 && trigger(),
								breadcrumb(),
								number === 14 && trigger(),
								number === 10 && pageHeaderActions(),
							]),
						h("div", { class: "grid content-start gap-4 p-4 text-sm" }, [
							status.value &&
								h(
									"p",
									{ role: "status", class: "rounded-lg border-[0.5px] border-border bg-card p-3" },
									status.value
								),
							(Number.isFinite(number) || active.value) && [
								h("h1", { class: "break-words text-lg font-semibold" }, title.value),
								number === 9
									? h(
											"p",
											{ class: "text-muted-foreground" },
											message.value !== undefined
												? text(mail[message.value].detail)
												: t("Choose a message to read it here.", "选择一封邮件在此阅读。")
										)
									: [
											(number === 1 || number === 2) &&
												h(
													"p",
													{ class: "text-muted-foreground" },
													`${t("Documentation version", "文档版本")} ${version.value}`
												),
											number === 12 &&
												h(
													"p",
													{ class: "text-muted-foreground" },
													`${t("Visible calendars", "可见日历")}: ${enabled.value.length}`
												),
											h(
												"div",
												{
													"aria-hidden": true,
													class: `grid gap-2 ${number === 12 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`,
												},
												placeholders(number === 12 ? 12 : 3)
											),
											Number.isFinite(number) &&
												number !== 12 &&
												h("div", {
													"aria-hidden": true,
													class: "h-96 rounded-lg border-[0.5px] border-border bg-muted/50",
												}),
										],
							],
						]),
					],
				}
			);

		const sidebarWidth =
			number === 9 ? "22rem" : number === 12 ? "15.5rem" : number === 4 ? "19rem" : undefined;
		return number === 13
			? renderSettings
			: () =>
					h(
						"section",
						{
							lang: t("en", "zh-CN"),
							"aria-label": props.block,
							style: { "--sidebar-width-default": sidebarWidth },
						},
						[
							h(
								SidebarProvider,
								{
									appearance: number === 4 || number === 8 ? "default" : "workspace",
									persistState: false,
									open: is("controlled") ? open.value : undefined,
									"onUpdate:open": (next) => {
										if (is("controlled")) open.value = next;
									},
									class: `relative isolate min-h-0 flex-col overflow-hidden ${Number.isFinite(number) || is("icon") ? "h-[min(44rem,100svh)] min-h-[25rem]" : "h-[24rem]"}`,
								},
								{
									default: () => [
										number === 16 &&
											h("header", { class: headerClass }, [
												trigger(),
												breadcrumb(),
												h("div", { class: "ms-auto w-36 min-w-0 sm:w-48" }, [
													search(t("Search navigation", "搜索导航")),
												]),
											]),
										h("div", { class: "relative flex min-h-0 flex-1 overflow-hidden" }, [
											number !== 14 && nav(),
											main(),
											number === 14 && nav(),
											number === 15 &&
												h(
													Sidebar,
													{
														collapsible: "none",
														side: "right",
														class:
															"sticky top-0 hidden w-[15.5rem] shrink-0 self-start border-s-[0.5px] border-sidebar-border lg:flex",
													},
													{ default: calendarSidebar }
												),
										]),
										is("group-action") && h(Toaster, { id, appearance: "workspace" }),
									],
								}
							),
						]
					);
	},
});

export default defineComponent({
	props: componentProps,
	setup: (props) => () => h(SidebarLayout, { ...props, key: props.block }),
});
</script>
