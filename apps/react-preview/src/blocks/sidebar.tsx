"use client";

import { Button } from "@valar/react-ui/button";
import { Calendar } from "@valar/react-ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@valar/react-ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@valar/react-ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@valar/react-ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@valar/react-ui/dropdown-menu";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@valar/react-ui/popover";
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
} from "@valar/react-ui/sidebar";
import { toast, Toaster } from "@valar/react-ui/sonner";
import { Switch } from "@valar/react-ui/switch";
// Layouts adapted from Valar's shadcn-svelte registry (MIT; see LICENSE.md).
import { useId, useState, type CSSProperties, type ReactNode } from "react";

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
		entry("components", "components", "folder", [file("button.ts"), file("card.ts")]),
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
const panelClass = "md:absolute md:h-full data-[mobile=true]:pt-10";
const headerClass =
	"sticky top-0 z-20 flex min-h-12 shrink-0 items-center gap-2 border-b-[0.5px] border-border bg-background px-3 py-1.5";
const focusClass =
	"focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring";
type Props = { block: string; chinese?: boolean };
type MenuChoice = { label: string; pick: () => void; checked?: boolean };

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={name === "more" ? 3 : 1.65}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={`size-3.5 shrink-0 ${className}`}
		>
			<path d={icons[name]} />
		</svg>
	);
}

function Menu({
	trigger,
	choices,
	side = "bottom",
}: {
	trigger: ReactNode;
	choices: MenuChoice[];
	side?: "bottom" | "top" | "right";
}) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
			<DropdownMenuContent
				appearance="surface"
				side={side}
				align="start"
				className="max-w-[calc(100vw-1rem)] min-w-40"
			>
				{choices.map(({ label, pick, checked }) => (
					<DropdownMenuItem key={label} onSelect={pick}>
						<span>{label}</span>
						{checked && <Icon name="check" className="ms-auto" />}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ControlledToggle({ id, chinese }: { id: string; chinese: boolean }) {
	const { isMobile, openMobile, toggle, open, setOpen } = useSidebar();
	const expanded = isMobile ? openMobile : open;
	return (
		<Button
			size="sm"
			variant="outline"
			aria-controls={id}
			aria-expanded={expanded}
			onClick={(event) => (isMobile ? toggle(event.currentTarget) : setOpen(!open))}
		>
			{expanded
				? chinese
					? "关闭侧边栏"
					: "Close sidebar"
				: chinese
					? "打开侧边栏"
					: "Open sidebar"}
		</Button>
	);
}

export default function SidebarBlock(props: Props) {
	return <SidebarLayout key={props.block} {...props} />;
}

function SidebarLayout({ block, chinese = false }: Props) {
	const t = (en: string, zh: string) => (chinese ? zh : en);
	const text = (name: Name) => t(...name);
	const id = useId();
	const number = Number(/^sidebar-(\d{2})$/.exec(block)?.[1]);
	const is = (suffix: string) => block === `demo-sidebar${suffix ? `-${suffix}` : ""}`;
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
	const [active, setActive] = useState<Entry | undefined>(initial);
	const [open, setOpen] = useState(true);
	const [query, setQuery] = useState("");
	const [version, setVersion] = useState(versions[0]);
	const [team, setTeam] = useState(is("header") ? "" : teams[0]);
	const [status, setStatus] = useState("");
	const [removed, setRemoved] = useState<string[]>([]);
	const [extraFavorites, setExtraFavorites] = useState<Entry[]>([]);
	const [mailbox, setMailbox] = useState(mailboxes[0]);
	const [unreadOnly, setUnreadOnly] = useState(false);
	const [read, setRead] = useState<number[]>([]);
	const [message, setMessage] = useState<(typeof mail)[number]>();
	const [selectedDate, setSelectedDate] = useState<Date>();
	const [enabled, setEnabled] = useState([
		"Personal",
		"Work",
		"Holidays",
		"Birthdays",
		"Travel",
		"Reminders",
	]);
	const [extraCalendars, setExtraCalendars] = useState<Entry[]>([]);
	const searchLabel = t("Search the docs", "搜索文档");
	const toggleLabel = t("Toggle sidebar", "切换侧边栏");
	const navigationLabel = t("Sidebar navigation", "侧边栏导航");
	const title =
		number === 9
			? message
				? text(message.subject)
				: text(mailbox.name)
			: number === 12
				? selectedDate
					? new Intl.DateTimeFormat(t("en-US", "zh-CN"), { dateStyle: "long" }).format(selectedDate)
					: t("Calendar", "日历")
				: active
					? text(active.name)
					: docsMode
						? t("Documentation", "文档")
						: t("Workspace", "工作区");
	const select = (item: Entry) => {
		setActive(item);
		setStatus("");
	};
	const report = (name: Name) => setStatus(`${text(name)} · ${t("Preview only", "仅预览")}`);
	const matches = (item: Entry) =>
		`${item.name.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase());
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

	const rowLabel = (item: Entry, trailing?: IconName) => (
		<>
			{item.icon && <Icon name={item.icon} />}
			<span className="min-w-0 flex-1 truncate group-data-[collapsible=icon]:sr-only">
				{text(item.name)}
			</span>
			{trailing && (
				<Icon name={trailing} className="ms-auto group-data-[collapsible=icon]:hidden" />
			)}
		</>
	);
	const row = (item: Entry, action?: ReactNode, badge = item.badge) => (
		<SidebarMenuItem key={item.name[0]}>
			<SidebarMenuButton
				isActive={active?.name[0] === item.name[0]}
				aria-current={active?.name[0] === item.name[0] ? "page" : undefined}
				tooltipContent={teamLayout ? text(item.name) : undefined}
				onClick={() => select(item)}
			>
				{rowLabel(item)}
			</SidebarMenuButton>
			{action}
			{badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
		</SidebarMenuItem>
	);
	const list = (items: Entry[]) => <SidebarMenu>{items.map((item) => row(item))}</SidebarMenu>;
	const group = (label: string, children: ReactNode, className?: string) => (
		<SidebarGroup className={className}>
			{label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
			{children}
		</SidebarGroup>
	);
	const sub = (items: Entry[]) => (
		<SidebarMenuSub>
			{items.map((item) => (
				<SidebarMenuSubItem key={item.name[0]}>
					<SidebarMenuSubButton asChild isActive={active === item}>
						<button
							type="button"
							className="w-full text-start"
							aria-current={active === item ? "page" : undefined}
							onClick={() => select(item)}
						>
							<span>{text(item.name)}</span>
						</button>
					</SidebarMenuSubButton>
				</SidebarMenuSubItem>
			))}
		</SidebarMenuSub>
	);
	const disclosure = (label: string, children: ReactNode, initiallyOpen: boolean, key = label) => (
		<Collapsible key={key} defaultOpen={initiallyOpen} className="group/disclosure">
			<SidebarGroup>
				<CollapsibleTrigger asChild>
					<SidebarGroupLabel asChild>
						<button type="button" className="w-full gap-2 text-start hover:bg-sidebar-accent">
							<span className="flex-1 truncate">{label}</span>
							<Icon
								name="chevron"
								className="group-data-[state=open]/disclosure:rotate-90 rtl:-scale-x-100"
							/>
						</button>
					</SidebarGroupLabel>
				</CollapsibleTrigger>
				<CollapsibleContent>{children}</CollapsibleContent>
			</SidebarGroup>
		</Collapsible>
	);
	const branch = (
		item: Entry,
		initiallyOpen: boolean,
		glyph: "plus" | "chevron" | "separate",
		children: ReactNode
	) => (
		<SidebarMenuItem key={item.name[0]}>
			<Collapsible asChild defaultOpen={initiallyOpen}>
				<div className="group/disclosure relative">
					{glyph === "separate" ? (
						<>
							<SidebarMenuButton
								className="pe-8"
								isActive={active === item}
								aria-current={active === item ? "page" : undefined}
								onClick={() => select(item)}
							>
								{rowLabel(item)}
							</SidebarMenuButton>
							<CollapsibleTrigger asChild>
								<SidebarMenuAction aria-label={`${t("Toggle", "展开或收起")} ${text(item.name)}`}>
									<Icon name="chevron" className="group-data-[state=open]/disclosure:rotate-90" />
								</SidebarMenuAction>
							</CollapsibleTrigger>
						</>
					) : (
						<CollapsibleTrigger asChild>
							<SidebarMenuButton tooltipContent={teamLayout ? text(item.name) : undefined}>
								{rowLabel(item)}
								{glyph === "plus" ? (
									<>
										<Icon name="plus" className="group-data-[state=open]/disclosure:hidden" />
										<Icon name="minus" className="group-data-[state=closed]/disclosure:hidden" />
									</>
								) : (
									<Icon
										name="chevron"
										className="group-data-[collapsible=icon]:hidden group-data-[state=open]/disclosure:rotate-90"
									/>
								)}
							</SidebarMenuButton>
						</CollapsibleTrigger>
					)}
					<CollapsibleContent>{children}</CollapsibleContent>
				</div>
			</Collapsible>
		</SidebarMenuItem>
	);
	const folders = (items: Entry[]): ReactNode =>
		items.map((item) =>
			item.children
				? branch(
						item,
						item.name[0] === "lib" || item.name[0] === "components",
						"chevron",
						<SidebarMenuSub>{folders(item.children)}</SidebarMenuSub>
					)
				: row(item)
		);

	const search = (label: string) => (
		<div role="search" className="relative min-w-0">
			<Icon
				name="search"
				className="pointer-events-none absolute inset-s-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
			/>
			<SidebarInput
				type="search"
				aria-label={label}
				placeholder={label}
				className="ps-8"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
			/>
		</div>
	);
	const empty = (
		<p role="status" className="px-3 py-4 text-xs text-muted-foreground">
			{t("No matches", "无匹配结果")}
		</p>
	);
	const switcher = (
		name: string,
		symbol: IconName,
		choices: MenuChoice[],
		side: "bottom" | "right" = "bottom",
		description?: string
	) => (
		<SidebarMenu>
			<SidebarMenuItem>
				<Menu
					side={side}
					choices={choices}
					trigger={
						<SidebarMenuButton
							size={description ? "lg" : "default"}
							tooltipContent={teamLayout ? name : undefined}
							className="aria-expanded:bg-sidebar-accent"
						>
							<Icon name={symbol} />
							<span className="min-w-0 flex-1 truncate group-data-[collapsible=icon]:sr-only">
								{name}
								{description && (
									<small className="block truncate text-muted-foreground">{description}</small>
								)}
							</span>
							<Icon name="down" className="group-data-[collapsible=icon]:hidden" />
						</SidebarMenuButton>
					}
				/>
			</SidebarMenuItem>
		</SidebarMenu>
	);
	const brand = (name: string, note?: string) => (
		<div className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 font-medium">
			<span className="grid size-7 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
				<Icon name={docsMode ? "book" : "box"} />
			</span>
			<span className="min-w-0 truncate">
				{name}
				{note && <small className="block text-muted-foreground">{note}</small>}
			</span>
		</div>
	);
	const teamMenu = switcher(
		team || t("Select Workspace", "选择工作区"),
		"box",
		teams
			.slice(0, is("header") ? 2 : 3)
			.map((name) => ({ label: name, checked: name === team, pick: () => setTeam(name) })),
		teamLayout ? "right" : "bottom",
		teamLayout
			? [t("Enterprise", "企业版"), t("Startup", "初创版"), t("Free", "免费版")][
					teams.indexOf(team)
				]
			: undefined
	);
	const account = (side: "right" | "top" | "bottom" = "top", compact = false) => (
		<SidebarMenu>
			<SidebarMenuItem>
				<Menu
					side={side}
					choices={footerChoices.map((name) => ({ label: text(name), pick: () => report(name) }))}
					trigger={
						<SidebarMenuButton
							size={compact ? "default" : "lg"}
							aria-label={t("Account menu", "账户菜单")}
							tooltipContent={teamLayout ? t("Account menu", "账户菜单") : undefined}
							className={compact ? "justify-center" : "aria-expanded:bg-sidebar-accent"}
						>
							<span
								aria-hidden="true"
								className="grid size-6 shrink-0 place-items-center rounded-md bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground"
							>
								V
							</span>
							{!compact && (
								<>
									<span className="min-w-0 flex-1 truncate group-data-[collapsible=icon]:sr-only">
										{is("footer") ? t("Username", "用户名") : "Valar"}
										{!is("footer") && (
											<small className="block truncate text-muted-foreground">m@example.com</small>
										)}
									</span>
									<Icon
										name="down"
										className={
											side === "top"
												? "rotate-180 group-data-[collapsible=icon]:hidden"
												: "group-data-[collapsible=icon]:hidden"
										}
									/>
								</>
							)}
						</SidebarMenuButton>
					}
				/>
			</SidebarMenuItem>
		</SidebarMenu>
	);
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
		return (
			<Menu
				side="right"
				trigger={
					<SidebarMenuAction
						showOnHover={!is("menu-action")}
						aria-label={`${t("More actions for", "更多操作：")} ${text(item.name)}`}
					>
						<Icon name="more" />
					</SidebarMenuAction>
				}
				choices={names.map((name, index) => ({
					label: text(name),
					pick: () => {
						if (name === remove) {
							setRemoved((items) => [...items, item.name[0]]);
							setExtraFavorites((items) => items.filter((favorite) => favorite !== item));
							if (active === item && !favorite) setActive(undefined);
						} else if (index === 0) select(item);
						if (index !== 0 || is("menu-action")) report(name);
					},
				}))}
			/>
		);
	};
	const projectGroup = (items: Entry[], actions = false) =>
		group(
			t("Projects", "项目"),
			<>
				{is("group-action") && (
					<SidebarGroupAction
						aria-label={t("Add Project", "添加项目")}
						onClick={() =>
							toast(t("You clicked the group action!", "已触发分组操作！"), { toasterId: id })
						}
					>
						<Icon name="plus" />
					</SidebarGroupAction>
				)}
				<SidebarMenu>
					{items
						.filter((item) => !removed.includes(item.name[0]))
						.map((item, index) =>
							row(
								item,
								actions ? rowMenu(item) : undefined,
								is("menu-badge") ? ["24", "12", "3", "21", "8"][index] : undefined
							)
						)}
				</SidebarMenu>
			</>,
			platformLayout ? "group-data-[collapsible=icon]:hidden" : undefined
		);

	function documentation() {
		const visible = docs.filter(
			(item) => item.children && (matches(item) || item.children.some(matches))
		);
		const leaves = (item: Entry) =>
			matches(item) ? item.children! : item.children!.filter(matches);
		if (!visible.length) return empty;
		if (number === 1)
			return visible.map((item) => (
				<SidebarGroup key={item.name[0]}>
					<SidebarGroupLabel>{text(item.name)}</SidebarGroupLabel>
					{list(leaves(item))}
				</SidebarGroup>
			));
		if (number === 2)
			return visible.map((item) =>
				disclosure(text(item.name), list(leaves(item)), true, item.name[0])
			);
		if (number === 6)
			return group(
				"",
				<SidebarMenu>
					{visible.map((item) => (
						<SidebarMenuItem key={item.name[0]}>
							<Menu
								side="right"
								trigger={<SidebarMenuButton>{rowLabel(item, "more")}</SidebarMenuButton>}
								choices={leaves(item).map((child) => ({
									label: text(child.name),
									pick: () => select(child),
									checked: active === child,
								}))}
							/>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			);
		return group(
			number === 14 ? t("Table of Contents", "目录") : "",
			<SidebarMenu className={number === 4 ? "gap-2" : undefined}>
				{visible.map((item) =>
					number === 5 || is("menu-collapsible") ? (
						branch(
							item,
							query !== "" || item === docs[number === 5 ? 1 : 0],
							number === 5 ? "plus" : "chevron",
							sub(leaves(item))
						)
					) : (
						<SidebarMenuItem key={item.name[0]}>
							<SidebarMenuButton onClick={() => select(item)} isActive={active === item}>
								{rowLabel(item)}
							</SidebarMenuButton>
							{sub(leaves(item))}
						</SidebarMenuItem>
					)
				)}
			</SidebarMenu>
		);
	}

	function mailPane() {
		const filtered = mail.filter(
			(item, index) =>
				item.box === mailbox.name[0] &&
				(!unreadOnly || (item.unread && !read.includes(index))) &&
				[item.from, ...item.subject, ...item.detail].some((value) =>
					value.toLowerCase().includes(query.trim().toLowerCase())
				)
		);
		return (
			<div className="flex min-h-0 flex-1">
				<Sidebar
					collapsible="none"
					className="w-(--sidebar-width-icon) shrink-0 border-e-[0.5px] border-sidebar-border"
				>
					<SidebarHeader className="items-center">
						<Icon name="mail" />
					</SidebarHeader>
					<SidebarContent>
						<SidebarMenu className="items-center px-1">
							{mailboxes.map((item) => (
								<SidebarMenuItem key={item.name[0]}>
									<SidebarMenuButton
										size="sm"
										className="size-8 justify-center p-0"
										isActive={item === mailbox}
										aria-pressed={item === mailbox}
										aria-label={text(item.name)}
										title={text(item.name)}
										onClick={() => {
											setMailbox(item);
											setMessage(undefined);
										}}
									>
										<Icon name={item.icon!} />
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarContent>
					<SidebarFooter className="p-1">{account("right", true)}</SidebarFooter>
				</Sidebar>
				<Sidebar collapsible="none" className="min-w-0 flex-1">
					<SidebarHeader className="border-b-[0.5px] border-sidebar-border p-3">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<h2 className="min-w-0 truncate font-semibold">{text(mailbox.name)}</h2>
							<label className="flex items-center gap-2 text-xs">
								<Switch size="sm" checked={unreadOnly} onCheckedChange={setUnreadOnly} />
								{t("Unreads", "仅未读")}
							</label>
						</div>
						{search(t("Search messages", "搜索邮件"))}
					</SidebarHeader>
					<SidebarContent>
						{filtered.length
							? filtered.map((item) => {
									const index = mail.indexOf(item);
									return (
										<button
											key={index}
											type="button"
											aria-pressed={message === item}
											aria-label={`${text(item.subject)} — ${item.from}`}
											className={`w-full border-b-[0.5px] border-sidebar-border p-3 text-start text-xs hover:bg-sidebar-accent aria-pressed:bg-sidebar-accent ${focusClass}`}
											onClick={() => {
												setMessage(item);
												setRead((items) => (items.includes(index) ? items : [...items, index]));
											}}
										>
											<span className="block truncate font-semibold">{item.from}</span>
											<span className="block truncate">{text(item.subject)}</span>
											<span className="block truncate text-muted-foreground">
												{text(item.detail)}
											</span>
										</button>
									);
								})
							: empty}
					</SidebarContent>
				</Sidebar>
			</div>
		);
	}

	const favorites = [
		...[firstFavorite, entry("Design System", "设计系统", "book")].filter(
			(item) => !removed.includes(item.name[0])
		),
		...extraFavorites,
	];
	const starred = active !== undefined && favorites.some((item) => item.name[0] === active.name[0]);
	const pageHeaderActions = (
		<div className="ms-auto flex shrink-0 items-center gap-1">
			<Button
				variant="ghost"
				size="icon-sm"
				aria-pressed={starred}
				aria-label={
					starred ? t("Remove from favorites", "取消收藏") : t("Add to favorites", "添加收藏")
				}
				onClick={() => {
					if (!active) return;
					if (starred) {
						setRemoved((items) => [...items, active.name[0]]);
						setExtraFavorites((items) => items.filter((item) => item.name[0] !== active.name[0]));
					} else {
						setRemoved((items) => items.filter((item) => item !== active.name[0]));
						if (![firstFavorite.name[0], "Design System"].includes(active.name[0]))
							setExtraFavorites((items) => [...items, active]);
					}
				}}
			>
				<Icon name="star" className={starred ? "fill-current" : ""} />
			</Button>
			<Popover>
				<PopoverTrigger asChild>
					<Button variant="ghost" size="icon-sm" aria-label={t("Page actions", "页面操作")}>
						<Icon name="more" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					appearance="surface"
					align="end"
					className="w-52 max-w-[calc(100vw-1rem)] p-0"
					aria-label={t("Page actions", "页面操作")}
				>
					<Sidebar collapsible="none" className="w-full bg-transparent">
						<SidebarContent className="max-h-[65svh]">
							{pageActions.map((actions) => (
								<SidebarGroup
									key={actions[0][0]}
									className="border-b-[0.5px] border-border last:border-0"
								>
									<SidebarMenu>
										{actions.map((action) => (
											<SidebarMenuItem key={action[0]}>
												<PopoverClose asChild>
													<SidebarMenuButton onClick={() => report(action)}>
														<span>{text(action)}</span>
													</SidebarMenuButton>
												</PopoverClose>
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</SidebarGroup>
							))}
						</SidebarContent>
					</Sidebar>
				</PopoverContent>
			</Popover>
		</div>
	);

	const calendarSidebar = (
		<>
			<SidebarHeader className="border-b-[0.5px] border-sidebar-border">
				{account("bottom")}
			</SidebarHeader>
			<SidebarContent>
				<div className="flex justify-center px-2 py-2">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={setSelectedDate}
						className="!w-auto bg-transparent p-0"
						formatters={{
							formatCaption: (date) =>
								date.toLocaleDateString(t("en-US", "zh-CN"), { month: "long", year: "numeric" }),
							formatWeekdayName: (date) =>
								date.toLocaleDateString(t("en-US", "zh-CN"), { weekday: "short" }),
						}}
						labels={{
							labelPrevious: () => t("Previous month", "上个月"),
							labelNext: () => t("Next month", "下个月"),
							labelDayButton: (day) =>
								day.toLocaleDateString(t("en-US", "zh-CN"), { dateStyle: "full" }),
						}}
					/>
				</div>
				<SidebarSeparator />
				{calendarGroups.map((item, index) =>
					disclosure(
						text(item.name),
						<SidebarMenu>
							{[...item.children!, ...(index === 0 ? extraCalendars : [])].map((child) => (
								<SidebarMenuItem key={child.name[0]}>
									<SidebarMenuButton
										aria-pressed={enabled.includes(child.name[0])}
										onClick={() =>
											setEnabled((items) =>
												items.includes(child.name[0])
													? items.filter((name) => name !== child.name[0])
													: [...items, child.name[0]]
											)
										}
									>
										<span
											aria-hidden="true"
											className="grid size-3.5 shrink-0 place-items-center rounded-sm border border-sidebar-border aria-hidden:pointer-events-none"
											data-checked={enabled.includes(child.name[0])}
										>
											{enabled.includes(child.name[0]) && (
												<Icon name="check" className="text-primary" />
											)}
										</span>
										<span>{text(child.name)}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>,
						index === 0,
						item.name[0]
					)
				)}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={() => {
								setExtraCalendars((items) => [
									...items,
									entry(`Calendar ${items.length + 1}`, `日历 ${items.length + 1}`),
								]);
								setStatus(t("Calendar added to My Calendars", "已添加到我的日历"));
							}}
						>
							<Icon name="plus" />
							<span>{t("New Calendar", "新建日历")}</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</>
	);

	if (number === 13)
		return (
			<section lang={t("en", "zh-CN")} className="grid min-h-80 place-items-center bg-background">
				<Dialog defaultOpen>
					<DialogTrigger asChild>
						<Button size="sm">{t("Open Settings", "打开设置")}</Button>
					</DialogTrigger>
					<DialogContent
						closeLabel={t("Close", "关闭")}
						className="h-[min(30rem,85svh)] max-w-[min(46rem,calc(100vw-1rem))]! gap-0 overflow-hidden p-0!"
					>
						<DialogTitle className="sr-only">{t("Settings", "设置")}</DialogTitle>
						<DialogDescription className="sr-only">
							{t("Choose a settings section.", "选择设置分区。")}
						</DialogDescription>
						<SidebarProvider
							appearance="workspace"
							keyboardShortcut={false}
							persistState={false}
							className="h-full min-h-0 flex-col md:flex-row"
						>
							<Sidebar collapsible="none" className="hidden shrink-0 md:flex">
								<SidebarContent>{group(t("Settings", "设置"), list(settings))}</SidebarContent>
							</Sidebar>
							<SidebarInset>
								<div className="border-b-[0.5px] border-border p-3 pe-12">
									<h2 className="truncate text-sm font-semibold">{title}</h2>
									<select
										aria-label={t("Settings section", "设置分区")}
										className={`mt-2 max-w-full rounded-md border border-border bg-background p-1 text-sm md:hidden ${focusClass}`}
										value={active?.name[0]}
										onChange={(event) => {
											const item = settings.find((item) => item.name[0] === event.target.value);
											if (item) select(item);
										}}
									>
										{settings.map((item) => (
											<option key={item.name[0]} value={item.name[0]}>
												{text(item.name)}
											</option>
										))}
									</select>
								</div>
								<div
									className={`min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-sm ${focusClass}`}
									tabIndex={0}
									aria-label={title}
								>
									<p>{t("Settings are shown here as a layout preview.", "这里是设置布局预览。")}</p>
									{Array.from({ length: 8 }, (_, index) => (
										<div
											aria-hidden="true"
											key={index}
											className="h-16 rounded-lg border-[0.5px] border-border bg-muted/50"
										/>
									))}
								</div>
							</SidebarInset>
						</SidebarProvider>
					</DialogContent>
				</Dialog>
			</section>
		);

	const nav = (
		<Sidebar
			id={id}
			side={number === 14 ? "right" : "left"}
			variant={number === 4 ? "floating" : number === 8 || is("") ? "inset" : "sidebar"}
			collapsible={teamLayout ? "icon" : "offcanvas"}
			mobileTitle={navigationLabel}
			mobileDescription={t("Choose a destination or close the sidebar.", "选择目标或关闭侧边栏。")}
			className={panelClass}
		>
			{number === 9 ? (
				mailPane()
			) : number === 12 ? (
				calendarSidebar
			) : (
				<>
					{((docsMode && Number.isFinite(number) && number !== 14) ||
						platformLayout ||
						workspace ||
						is("header")) && (
						<SidebarHeader>
							{number === 1 || number === 2
								? switcher(
										t("Documentation", "文档"),
										"book",
										versions.map((name) => ({
											label: name,
											pick: () => setVersion(name),
											checked: name === version,
										})),
										"bottom",
										`v${version}`
									)
								: teamLayout || workspace || is("header")
									? teamMenu
									: brand(
											docsMode ? t("Documentation", "文档") : "Valar Studio",
											docsMode ? "v1.0.1" : t("Workspace", "工作区")
										)}
							{(number === 1 || number === 2 || number === 5) && search(searchLabel)}
						</SidebarHeader>
					)}
					<SidebarContent>
						{docsMode ? (
							<nav
								aria-label={navigationLabel}
								key={query.trim() ? "search-results" : "unfiltered"}
							>
								{documentation()}
							</nav>
						) : number === 11 ? (
							<>
								{group(t("Changes", "更改"), list(changes))}
								{group(t("Files", "文件"), <SidebarMenu>{folders(tree)}</SidebarMenu>)}
							</>
						) : platformLayout ? (
							<>
								{group(
									t("Platform", "平台"),
									<SidebarMenu key={query.trim() ? "search-results" : "unfiltered"}>
										{platform
											.filter((item) => matches(item) || item.children!.some(matches))
											.map((item) =>
												branch(
													item,
													item === platform[0] || query.trim() !== "",
													teamLayout ? "chevron" : "separate",
													sub(matches(item) ? item.children! : item.children!.filter(matches))
												)
											)}
									</SidebarMenu>
								)}
								{projectGroup(projectRows.filter(matches), true)}
								{!teamLayout && group("", list(help.filter(matches)), "mt-auto")}
								{query.trim() &&
									![...platform, ...projects, ...platform.flatMap((item) => item.children!)].some(
										matches
									) &&
									empty}
							</>
						) : workspace ? (
							<>
								{group("", list(workspaceNav))}
								{group(
									t("Favorites", "收藏"),
									<SidebarMenu>
										{favorites.map((item) => row(item, rowMenu(item, true)))}
									</SidebarMenu>
								)}
								{group(
									t("Workspaces", "工作区"),
									<SidebarMenu>
										{workspaces.map((item) => branch(item, false, "separate", sub(item.children!)))}
									</SidebarMenu>
								)}
								{group("", list(help), "mt-auto")}
							</>
						) : is("group") ? (
							group(t("Help", "帮助"), list(help))
						) : is("group-collapsible") ? (
							disclosure(t("Help", "帮助"), list(help), true)
						) : is("") ? (
							group(
								t("Application", "应用"),
								list([
									entry("Home", "主页", "home"),
									mailboxes[0],
									entry("Calendar", "日历", "calendar"),
									entry("Search", "搜索", "search"),
									entry("Settings", "设置", "settings"),
								])
							)
						) : !is("header") && !is("footer") ? (
							projectGroup(is("group-action") ? projectRows : projects, is("menu-action"))
						) : null}
					</SidebarContent>
					{(platformLayout || is("footer")) && (
						<SidebarFooter>{account(teamLayout ? "right" : "top")}</SidebarFooter>
					)}
					{number === 6 && (
						<SidebarFooter>
							<Card size="sm" className="gap-2 shadow-none">
								<CardHeader>
									<CardTitle>{t("Subscribe to our newsletter", "订阅通讯")}</CardTitle>
									<CardDescription>
										{t("Opt in to receive updates about the sidebar.", "订阅以接收侧边栏更新。")}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form
										className="grid gap-2"
										onSubmit={(event) => {
											event.preventDefault();
											event.currentTarget.reset();
											setStatus(
												t(
													"Subscribed for this preview. No email was sent.",
													"已在预览中订阅，未发送邮件。"
												)
											);
										}}
									>
										<SidebarInput
											name="email"
											type="email"
											required
											autoComplete="email"
											aria-label={t("Email", "电子邮箱")}
											placeholder={t("Email", "电子邮箱")}
										/>
										<Button type="submit" size="sm">
											{t("Subscribe", "订阅")}
										</Button>
									</form>
								</CardContent>
							</Card>
						</SidebarFooter>
					)}
				</>
			)}
			{!is("controlled") && (
				<SidebarRail
					aria-label={toggleLabel}
					title={toggleLabel}
					className="in-data-[mobile=true]:hidden!"
				/>
			)}
		</Sidebar>
	);

	const trigger = is("controlled") ? (
		<ControlledToggle id={id} chinese={chinese} />
	) : (
		<SidebarTrigger
			label={toggleLabel}
			aria-controls={id}
			className={number === 14 ? "ms-auto rotate-180" : undefined}
		/>
	);
	const breadcrumb = (
		<nav
			aria-label={t("Breadcrumb", "面包屑导航")}
			className="flex min-w-0 items-center gap-2 text-xs"
		>
			<span className="hidden shrink-0 text-muted-foreground lg:inline">
				{docsMode
					? t("Documentation", "文档")
					: number === 9
						? t("All Inboxes", "全部收件箱")
						: number === 11
							? t("Files", "文件")
							: t("Workspace", "工作区")}
			</span>
			<Icon name="chevron" className="hidden text-muted-foreground lg:block rtl:-scale-x-100" />
			<span aria-current="page" className="truncate font-medium">
				{title}
			</span>
		</nav>
	);
	const main = (
		<SidebarInset className="min-h-0 overflow-y-auto">
			{number !== 16 && (
				<header className={headerClass}>
					{number !== 14 && trigger}
					{breadcrumb}
					{number === 14 && trigger}
					{number === 10 && pageHeaderActions}
				</header>
			)}
			<div className="grid content-start gap-4 p-4 text-sm">
				{status && (
					<p role="status" className="rounded-lg border-[0.5px] border-border bg-card p-3">
						{status}
					</p>
				)}
				{(Number.isFinite(number) || active) && (
					<>
						<h1 className="text-lg font-semibold break-words">{title}</h1>
						{number === 9 ? (
							<p className="text-muted-foreground">
								{message
									? text(message.detail)
									: t("Choose a message to read it here.", "选择一封邮件在此阅读。")}
							</p>
						) : (
							<>
								{(number === 1 || number === 2) && (
									<p className="text-muted-foreground">
										{t("Documentation version", "文档版本")} {version}
									</p>
								)}
								{number === 12 && (
									<p className="text-muted-foreground">
										{t("Visible calendars", "可见日历")}: {enabled.length}
									</p>
								)}
								<div
									aria-hidden="true"
									className={`grid gap-2 ${number === 12 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}
								>
									{Array.from({ length: number === 12 ? 12 : 3 }, (_, index) => (
										<div
											key={index}
											className="h-16 rounded-lg border-[0.5px] border-border bg-muted/50"
										/>
									))}
								</div>
								{Number.isFinite(number) && number !== 12 && (
									<div
										aria-hidden="true"
										className="h-96 rounded-lg border-[0.5px] border-border bg-muted/50"
									/>
								)}
							</>
						)}
					</>
				)}
			</div>
		</SidebarInset>
	);
	const sidebarWidth =
		number === 9 ? "22rem" : number === 12 ? "15.5rem" : number === 4 ? "19rem" : undefined;
	return (
		<section
			lang={t("en", "zh-CN")}
			aria-label={block}
			style={{ "--sidebar-width-default": sidebarWidth } as CSSProperties}
		>
			<SidebarProvider
				appearance={number === 4 || number === 8 ? "default" : "workspace"}
				persistState={false}
				open={is("controlled") ? open : undefined}
				onOpenChange={is("controlled") ? setOpen : undefined}
				className={`relative isolate min-h-0 flex-col overflow-hidden ${Number.isFinite(number) || is("icon") ? "h-[min(44rem,100svh)] min-h-[25rem]" : "h-[24rem]"}`}
			>
				{number === 16 && (
					<header className={headerClass}>
						{trigger}
						{breadcrumb}
						<div className="ms-auto w-36 min-w-0 sm:w-48">
							{search(t("Search navigation", "搜索导航"))}
						</div>
					</header>
				)}
				<div className="relative flex min-h-0 flex-1 overflow-hidden">
					{number !== 14 && nav}
					{main}
					{number === 14 && nav}
					{number === 15 && (
						<Sidebar
							collapsible="none"
							side="right"
							className="sticky top-0 hidden w-[15.5rem] shrink-0 self-start border-s-[0.5px] border-sidebar-border lg:flex"
						>
							{calendarSidebar}
						</Sidebar>
					)}
				</div>
				{is("group-action") && <Toaster id={id} appearance="workspace" />}
			</SidebarProvider>
		</section>
	);
}
