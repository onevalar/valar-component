"use client";

import { Avatar, AvatarFallback } from "@valar/react-ui/avatar";
import { Button, buttonVariants } from "@valar/react-ui/button";
import { Checkbox } from "@valar/react-ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@valar/react-ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@valar/react-ui/dropdown-menu";
import { Input } from "@valar/react-ui/input";
import {
	IssueGlyph,
	issueLabels,
	priorities,
	statuses,
	type IssuePriority,
} from "@valar/react-ui/issue-composer";
import {
	IssueDetail,
	applyIssueActivityAction,
	applyIssueCollaborationAction,
	type IssueActivityOptions,
	type IssueCollaborationState,
	type IssueDetailUpdate,
	type IssueDetailValue,
} from "@valar/react-ui/issue-detail";
import { NativeSelect } from "@valar/react-ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@valar/react-ui/popover";
import { Switch } from "@valar/react-ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@valar/react-ui/tabs";
import {
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
	type KeyboardEvent,
	type ReactNode,
} from "react";

const sources = {
	apps: ["应用与集成", "Apps and integrations"],
	assignment: ["分配", "Assignments"],
	billing: ["账单", "Billing"],
	comment: ["评论与回复", "Comments and replies"],
	customer: ["客户请求", "Customer requests"],
	document: ["文档变更", "Document changes"],
	loop: ["Loops", "Loops"],
	mention: ["提及", "Mentions"],
	pulse: ["Pulse 摘要", "Pulse summaries"],
	reaction: ["表情回应", "Reactions"],
	reminder: ["提醒与截止日期", "Reminders and deadlines"],
	review: ["审查", "Reviews"],
	status: ["状态变更", "Status changes"],
	subscription: ["订阅", "Subscriptions"],
	system: ["系统通知", "System notifications"],
	triage: ["待分流", "Triage"],
	update: ["更新", "Updates"],
} as const;
type Source = keyof typeof sources;
const sourceEntries = Object.entries(sources) as [Source, (typeof sources)[Source]][];
const people = [
	{ id: "avery", label: "Avery Chen" },
	{ id: "morgan", label: "Morgan Lee" },
	{ id: "riley", label: "Riley Park" },
];
const subscriberPeople = people.map(({ id, label }) => ({ id, name: label }));
type Translate = (zh: string, en: string) => string;
type Notice = {
	id: string;
	issueId: string;
	type: Source;
	sender: string;
	summary: readonly [zh: string, en: string];
	created: string;
	unread: boolean;
	snoozedUntil?: number;
};
type Rules = { sources: Source[]; levels: IssuePriority[] };
const defaultRules = (): Rules => ({
	sources: ["assignment", "mention"],
	levels: ["urgent", "high", "medium"],
});
const fields = ["type", "sender", "project", "priority", "status"] as const;
type Field = (typeof fields)[number];
type Filters = Partial<Record<Field, { values: string[]; exclude: boolean }>>;
type Option = { id: string; label: string };
const tool = buttonVariants({ variant: "ghost", size: "icon-sm" }) + " aria-pressed:bg-accent";
const shortcuts = "ArrowDown ArrowUp J K U H Backspace Alt+U Shift+Backspace";
const focusLine =
	"focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring";
const snoozePresets = [
	[60, "1 小时", "1 hour"],
	[1440, "1 天", "1 day"],
	[10080, "1 周", "1 week"],
] as const;
const person = (id?: string) => people.find((item) => item.id === id)?.label ?? "";
const initials = (id: string) =>
	person(id)
		.split(" ")
		.map((word) => word[0])
		.join("");
const rank = (priority: IssuePriority) =>
	priority === "none" ? priorities.length : priorities.indexOf(priority);

function sampleIssues(t: Translate): IssueDetailValue[] {
	return [
		{
			id: "VLR-206",
			title: t("核对搜索结果的键盘顺序", "Review keyboard order in search results"),
			description: t(
				"检查搜索结果分组之间的焦点顺序。",
				"Check focus order between result groups. Cover mouse and keyboard use and focus recovery when there are no results."
			),
			project: "docs",
			assignee: "avery",
			priority: "high",
			status: "progress",
		},
		{
			id: "VLR-204",
			title: t("补齐弹层的深色主题", "Finish dark mode for overlays"),
			description: t(
				"对照浅色和深色主题，检查弹层的表面、边框和焦点轮廓。",
				"Compare Popover and Tooltip surfaces, borders, and focus outlines in both themes."
			),
			project: "ui",
			assignee: "morgan",
			priority: "medium",
			status: "todo",
		},
		{
			id: "VLR-201",
			title: t("更新组件安装指南", "Update the component installation guide"),
			description: t(
				"在独立应用里验证新的安装步骤，然后更新文档示例。",
				"Verify the installation steps in an independent app and update the examples."
			),
			project: "docs",
			assignee: "riley",
			priority: "low",
			status: "done",
		},
	];
}

function sampleNotices(): Notice[] {
	return [
		{
			id: "n-4",
			issueId: "VLR-206",
			type: "assignment",
			sender: "avery",
			summary: ["将此问题分配给你", "assigned this issue to you"],
			created: "2026-11-12T14:20:00Z",
			unread: true,
		},
		{
			id: "n-3",
			issueId: "VLR-204",
			type: "mention",
			sender: "morgan",
			summary: ["在评论中提及你", "mentioned you in a comment"],
			created: "2026-11-12T11:05:00Z",
			unread: true,
		},
		{
			id: "n-2",
			issueId: "VLR-206",
			type: "comment",
			sender: "riley",
			summary: ["添加了一条评论", "added a comment"],
			created: "2026-11-11T16:20:00Z",
			unread: false,
		},
		{
			id: "n-1",
			issueId: "VLR-201",
			type: "status",
			sender: "riley",
			summary: ["将此问题标记为已完成", "marked this issue as done"],
			created: "2026-11-11T10:00:00Z",
			unread: false,
		},
	];
}

function FilterPicker({
	id,
	name,
	initialField,
	labels,
	options,
	filters,
	onToggle,
	children,
	className,
	t,
}: {
	id?: string;
	name: string;
	initialField?: Field;
	labels: Record<Field, string>;
	options: Record<Field, readonly Option[]>;
	filters: Filters;
	onToggle: (field: Field, option: string) => void;
	children: ReactNode;
	className: string;
	t: Translate;
}) {
	const [field, setField] = useState(initialField);
	const panel = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		panel.current?.querySelector("input")?.focus();
	}, [field]);
	return (
		<Popover
			onOpenChange={(open) => {
				if (open) setField(initialField);
			}}
		>
			<PopoverTrigger
				id={id}
				className={className}
				aria-label={name}
				title={initialField ? undefined : `${name} (F)`}
				aria-keyshortcuts={initialField ? undefined : "F"}
			>
				{children}
			</PopoverTrigger>
			<PopoverContent
				ref={panel}
				appearance="surface"
				align="end"
				aria-label={t("筛选通知", "Filter notifications")}
				className="w-60 max-w-[calc(100vw-16px)] p-0!"
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					panel.current?.querySelector("input")?.focus();
				}}
			>
				{field && (
					<Button
						size="sm"
						variant="ghost"
						className="w-full justify-start"
						onClick={() => setField(undefined)}
					>
						<span aria-hidden="true">‹</span>
						{labels[field]}
					</Button>
				)}
				<Command key={field ?? "fields"} appearance="compact">
					<CommandInput
						aria-label={t("搜索筛选项", "Search filters")}
						placeholder={t("搜索筛选项…", "Search filters…")}
					/>
					<CommandList className="max-h-64">
						<CommandEmpty>{t("没有匹配的选项", "No matching options")}</CommandEmpty>
						<CommandGroup>
							{field
								? options[field].map(({ id, label }) => (
										<CommandItem
											key={id}
											value={label}
											checked={filters[field]?.values.includes(id) ?? false}
											showIndicator
											onSelect={() => onToggle(field, id)}
										>
											{label}
										</CommandItem>
									))
								: fields.map((item) => (
										<CommandItem key={item} value={labels[item]} onSelect={() => setField(item)}>
											{labels[item]}
											<span aria-hidden="true" className="ms-auto">
												›
											</span>
										</CommandItem>
									))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export default function Inbox({
	chinese = false,
	empty = false,
}: { chinese?: boolean; empty?: boolean } = {}) {
	const t: Translate = (zh, en) => (chinese ? zh : en);
	const id = useId();
	const date = new Intl.DateTimeFormat(chinese ? "zh-CN" : "en-US", {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
	const issueLabel = (key: keyof typeof issueLabels) => issueLabels[key][chinese ? 0 : 1];
	const sourceLabel = (key: Source) => sources[key][chinese ? 0 : 1];
	const projects = [
		{ id: "docs", label: t("文档站", "Documentation") },
		{ id: "ui", label: t("组件库", "Component library") },
	];
	const viewer = { id: "self", name: t("我", "Me") };
	const fieldLabels = {
		type: t("通知类型", "Notification type"),
		sender: t("发送者", "From"),
		project: t("项目", "Project"),
		priority: t("问题优先级", "Issue priority"),
		status: t("问题状态类型", "Issue status type"),
	};
	const options = {
		type: sourceEntries.map(([id]) => ({ id, label: sourceLabel(id) })),
		sender: people,
		project: [{ id: "", label: t("无项目", "No project") }, ...projects],
		priority: priorities.map((id) => ({ id, label: issueLabel(id) })),
		status: statuses.map((id) => ({ id, label: issueLabel(id) })),
	};
	const [issueEdits, setIssueEdits] = useState<Record<string, IssueDetailUpdate>>({});
	const issueById = new Map(
		sampleIssues(t).map((issue) => [issue.id, { ...issue, ...issueEdits[issue.id] }])
	);
	const [notices, setNotices] = useState(sampleNotices);
	const notifications = empty ? [] : notices;
	const [activity, setActivity] = useState<Record<string, IssueCollaborationState>>({});
	const [selected, setSelected] = useState<string>();
	const [unreadOnly, setUnreadOnly] = useState(false);
	const [rules, setRules] = useState(defaultRules);
	const [priorityInbox, setPriorityInbox] = useState(false);
	const [priorityExpanded, setPriorityExpanded] = useState(false);
	const [priorityView, setPriorityView] = useState<"priority" | "other">("priority");
	const [showSnoozed, setShowSnoozed] = useState(false);
	const [unreadFirst, setUnreadFirst] = useState(false);
	const [grouping, setGrouping] = useState("none");
	const [order, setOrder] = useState("newest");
	const [filters, setFilters] = useState<Filters>({});
	const [clock, setClock] = useState(0);
	const [actionsOpen, setActionsOpen] = useState(false);
	const [snoozeOpen, setSnoozeOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [search, setSearch] = useState("");
	const list = useRef<HTMLElement>(null);
	const heading = useRef<HTMLHeadingElement>(null);
	const unreadButton = useRef<HTMLButtonElement>(null);
	const searchInput = useRef<HTMLInputElement>(null);
	const focusAfterRender = useRef<(() => void) | undefined>(undefined);
	const snoozeRequested = useRef(false);
	const active = notifications.find(({ id }) => id === selected);
	const activeIssue = active && issueById.get(active.issueId);
	const activeFields = fields.filter((field) => filters[field]?.values.length);
	const isPriority = (item: Notice) =>
		rules.sources.includes(item.type) ||
		rules.levels.includes(issueById.get(item.issueId)?.priority ?? "none");
	const isSnoozed = (item: Notice) => (item.snoozedUntil ?? 0) > clock;
	const unreadCounts = { priority: 0, other: 0 };
	for (const item of notifications)
		if (item.unread && !isSnoozed(item)) unreadCounts[isPriority(item) ? "priority" : "other"]++;
	const query = search.trim().toLocaleLowerCase();
	const visible = notifications
		.filter((item) => {
			if (
				(!showSnoozed && isSnoozed(item)) ||
				(unreadOnly && !item.unread) ||
				(priorityInbox && (priorityView === "priority") !== isPriority(item))
			)
				return false;
			const issue = issueById.get(item.issueId);
			const values = {
				type: item.type,
				sender: item.sender,
				project: issue?.project ?? "",
				priority: issue?.priority ?? "none",
				status: issue?.status ?? "",
			};
			if (
				activeFields.some((field) => {
					const filter = filters[field]!;
					return filter.values.includes(values[field]) === filter.exclude;
				})
			)
				return false;
			return (
				!query ||
				[
					item.issueId,
					issue?.title,
					t(...item.summary),
					sourceLabel(item.type),
					person(item.sender),
					person(issue?.assignee),
					projects.find(({ id }) => id === issue?.project)?.label,
					issue && issueLabel(issue.priority),
				].some((value) => value?.toLocaleLowerCase().includes(query))
			);
		})
		.sort((left, right) => {
			if (unreadFirst && left.unread !== right.unread)
				return Number(right.unread) - Number(left.unread);
			if (order === "priority") {
				const difference =
					rank(issueById.get(left.issueId)?.priority ?? "none") -
					rank(issueById.get(right.issueId)?.priority ?? "none");
				if (difference) return difference;
			}
			return order === "oldest"
				? left.created.localeCompare(right.created)
				: right.created.localeCompare(left.created);
		});
	const groups =
		grouping === "focus"
			? [
					{
						label: t("专注", "Focus"),
						items: visible.filter((item) => item.unread && isPriority(item)),
					},
					{
						label: t("其他通知", "Other notifications"),
						items: visible.filter((item) => !item.unread || !isPriority(item)),
					},
				]
			: [{ label: "", items: visible }];
	const navigation = groups.flatMap(({ items }) => items);
	function adjacent(item: Notice, direction: 1 | -1) {
		const index = navigation.findIndex(({ id }) => id === item.id);
		return index === -1 ? navigation.at(direction === 1 ? 0 : -1) : navigation[index + direction];
	}
	const previous = active && adjacent(active, -1);
	const next = active && adjacent(active, 1);
	const expiry = Math.min(
		...notifications.map((item) => (isSnoozed(item) ? item.snoozedUntil! : Infinity))
	);
	useEffect(() => {
		if (!Number.isFinite(expiry)) return;
		const timer = window.setTimeout(() => setClock(Date.now()), Math.max(1, expiry - Date.now()));
		return () => window.clearTimeout(timer);
	}, [expiry]);
	useLayoutEffect(() => {
		const move = focusAfterRender.current;
		focusAfterRender.current = undefined;
		move?.();
	});
	useEffect(() => {
		if (!actionsOpen || !snoozeRequested.current) return;
		// Let the parent menu finish moving focus before opening its submenu.
		const frame = requestAnimationFrame(() => {
			if (!snoozeOpen) setSnoozeOpen(true);
			else {
				snoozeRequested.current = false;
				document.getElementById(`${id}-snooze-first`)?.focus();
			}
		});
		return () => cancelAnimationFrame(frame);
	}, [actionsOpen, id, snoozeOpen]);

	function row(key?: string) {
		return key
			? document.getElementById(`${id}-${key}`)
			: list.current?.querySelector<HTMLButtonElement>("[data-notification]");
	}
	function focusList(key?: string) {
		(row(key) ?? row() ?? unreadButton.current)?.focus();
	}
	function changeNotice(key: string, patch: Partial<Notice>) {
		setNotices((items) => items.map((item) => (item.id === key ? { ...item, ...patch } : item)));
	}
	function choose(item: Notice, markRead = true) {
		setActionsOpen(false);
		setSnoozeOpen(false);
		if (markRead) {
			if (selected === item.id) heading.current?.focus();
			else focusAfterRender.current = () => heading.current?.focus();
		}
		setSelected(item.id);
		if (markRead && item.unread) changeNotice(item.id, { unread: false });
	}
	function back() {
		focusAfterRender.current = () => focusList(selected);
		setSelected(undefined);
		setActionsOpen(false);
		setSnoozeOpen(false);
	}
	function markAllRead() {
		setNotices((items) => items.map((item) => ({ ...item, unread: false })));
	}
	function deleteRead() {
		if (active && !active.unread) back();
		setNotices((items) => items.filter(({ unread }) => unread));
	}
	function remove(item: Notice) {
		if (item.id === selected) back();
		else {
			const candidate = adjacent(item, 1) ?? adjacent(item, -1);
			focusAfterRender.current = () => focusList(candidate?.id);
		}
		setNotices((items) => items.filter(({ id }) => id !== item.id));
	}
	function snooze(item: Notice, minutes: number) {
		const now = Date.now();
		setClock(now);
		changeNotice(item.id, { snoozedUntil: now + minutes * 60000 });
		if (!showSnoozed) back();
	}
	function toggleFilter(field: Field, value: string) {
		setFilters((previous) => {
			const term = previous[field];
			const values = term?.values ?? [];
			const next = values.includes(value)
				? values.filter((item) => item !== value)
				: [...values, value];
			return {
				...previous,
				[field]: next.length ? { values: next, exclude: term?.exclude ?? false } : undefined,
			};
		});
	}
	function openSearch() {
		if (searchOpen) searchInput.current?.focus();
		else {
			focusAfterRender.current = () => searchInput.current?.focus();
			setSearchOpen(true);
		}
	}
	function closeSearch() {
		setSearch("");
		setSearchOpen(false);
		unreadButton.current?.focus();
	}
	function onListKey(event: KeyboardEvent<HTMLElement>) {
		const key = event.key.toLowerCase();
		const target = event.target;
		if (
			!(target instanceof HTMLElement) ||
			!list.current?.contains(target) ||
			event.defaultPrevented ||
			event.nativeEvent.isComposing ||
			event.repeat ||
			event.altKey
		)
			return;
		if (
			(event.metaKey || event.ctrlKey) &&
			!event.shiftKey &&
			key === "f" &&
			!target.closest("textarea,[contenteditable],input:not([type=search])")
		) {
			event.preventDefault();
			openSearch();
			return;
		}
		if (event.metaKey || event.ctrlKey || target.closest("input,textarea,[contenteditable]"))
			return;
		const trigger =
			!event.shiftKey && key === "f"
				? `${id}-filter`
				: event.shiftKey && key === "v"
					? `${id}-display`
					: undefined;
		if (trigger) {
			event.preventDefault();
			const button = document.getElementById(trigger);
			button?.focus();
			button?.click();
		}
	}
	function onNoticeKey(event: KeyboardEvent<HTMLElement>, item: Notice, detail = false) {
		if (event.defaultPrevented || event.nativeEvent.isComposing || event.metaKey || event.ctrlKey)
			return;
		const key = event.key.toLowerCase();
		if (event.altKey) {
			if (key === "u" && !event.shiftKey && !event.repeat) {
				event.preventDefault();
				markAllRead();
				if (!detail && unreadOnly) unreadButton.current?.focus();
			}
			return;
		}
		if (!event.shiftKey && ["j", "k", "arrowdown", "arrowup"].includes(key)) {
			event.preventDefault();
			const target = adjacent(item, key === "j" || key === "arrowdown" ? 1 : -1);
			if (target) {
				if (detail) choose(target);
				else row(target.id)?.focus();
			}
		} else if (!event.repeat && key === "backspace") {
			event.preventDefault();
			if (event.shiftKey) {
				if (!detail && !item.unread) focusAfterRender.current = () => focusList();
				deleteRead();
			} else remove(item);
		} else if (!event.repeat && !event.shiftKey && key === "u") {
			event.preventDefault();
			if (!detail && unreadOnly && item.unread) focusAfterRender.current = () => focusList();
			changeNotice(item.id, { unread: !item.unread });
		} else if (!event.repeat && !event.shiftKey && key === "h") {
			event.preventDefault();
			if (selected !== item.id) choose(item, false);
			snoozeRequested.current = !isSnoozed(item);
			setActionsOpen(true);
		}
	}

	function baseActivity(issueId: string): IssueCollaborationState {
		const author = subscriberPeople[0];
		const featured = issueId === "VLR-206";
		return {
			entries: [
				{ kind: "event", id: `${issueId}-created`, author, createdAt: "2026-11-11T09:00:00Z" },
				...(featured
					? [
							{
								kind: "comment" as const,
								id: `${issueId}-first-comment`,
								author,
								createdAt: "2026-11-11T10:00:00Z",
								body: t(
									"建议把键盘导航和焦点恢复一起验收。",
									"Let's verify keyboard navigation and focus recovery together."
								),
								replies: [],
							},
						]
					: []),
			],
			subscribers: featured ? [author] : [],
			reactions: [],
		};
	}
	function activityOptions(issueId: string): IssueActivityOptions {
		const { entries, subscribers, reactions } = activity[issueId] ?? baseActivity(issueId);
		return {
			entries,
			viewer,
			onAction: (action) =>
				setActivity((previous) => {
					const state = previous[issueId] ?? baseActivity(issueId);
					return {
						...previous,
						[issueId]: {
							...state,
							entries: applyIssueActivityAction(state.entries, action, viewer),
						},
					};
				}),
			collaboration: {
				subscribers,
				reactions,
				people: subscriberPeople,
				onAction: (action) =>
					setActivity((previous) => ({
						...previous,
						[issueId]: applyIssueCollaborationAction(
							previous[issueId] ?? baseActivity(issueId),
							action,
							viewer
						),
					})),
			},
		};
	}

	const noticeList = (
		<div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
			{visible.length ? (
				groups
					.filter(({ items }) => items.length)
					.map(({ label, items }) => (
						<div key={label}>
							{label && (
								<h3 className="border-b-[0.5px] border-border px-4 py-2 text-xs font-medium text-muted-foreground">
									{label}
								</h3>
							)}
							<ul>
								{items.map((item) => {
									const issue = issueById.get(item.issueId);
									return (
										<li key={item.id}>
											<button
												type="button"
												id={`${id}-${item.id}`}
												data-notification={item.id}
												aria-current={item.id === selected ? "true" : undefined}
												aria-keyshortcuts={shortcuts}
												className={`grid min-h-15 w-full min-w-0 grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2.5 px-4 py-2.5 text-start transition-colors duration-150 hover:bg-accent aria-current:bg-accent motion-reduce:transition-none ${focusLine}`}
												onClick={() => choose(item)}
												onKeyDown={(event) => onNoticeKey(event, item)}
											>
												<span className="relative" aria-hidden="true">
													<Avatar className="size-9">
														<AvatarFallback>{initials(item.sender)}</AvatarFallback>
													</Avatar>
													<span className="absolute -end-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-background text-[10px] text-muted-foreground">
														{{ assignment: "→", mention: "@", comment: "▤", status: "✓" }[
															item.type as "assignment" | "mention" | "comment" | "status"
														] ?? "•"}
													</span>
												</span>
												<span className="min-w-0">
													<span className="flex min-w-0 items-center gap-1.5 text-[13px] font-medium">
														{item.unread && (
															<>
																<span className="sr-only">{t("未读", "Unread")}</span>
																<span
																	aria-hidden="true"
																	className="size-1.5 shrink-0 rounded-full bg-primary"
																/>
															</>
														)}
														<span className="shrink-0 text-xs font-normal text-muted-foreground">
															{item.issueId}
														</span>
														<span className="truncate">{issue?.title}</span>
													</span>
													<span className="mt-0.5 block truncate text-xs text-muted-foreground">
														{person(item.sender)} {t(...item.summary)}
													</span>
												</span>
												<span className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
													{issue && (
														<>
															<IssueGlyph value={issue.status} />
															<span className="sr-only">{issueLabel(issue.status)}</span>
														</>
													)}
													<span>
														{isSnoozed(item) && (
															<>
																<span aria-hidden="true">◷ </span>
																<span className="sr-only">{t("已暂缓", "Snoozed")}</span>
															</>
														)}
														<time dateTime={item.created}>
															{date.format(new Date(item.created))}
														</time>
													</span>
												</span>
											</button>
										</li>
									);
								})}
							</ul>
						</div>
					))
			) : (
				<div className="m-auto flex flex-col items-center gap-2 p-4 text-[13px] text-muted-foreground">
					<p role="status">
						{unreadOnly ? t("没有未读通知", "No unreads") : t("没有通知", "No notifications")}
					</p>
					{unreadOnly && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setUnreadOnly(false);
								unreadButton.current?.focus();
							}}
						>
							{t("显示全部通知", "Show all notifications")}
						</Button>
					)}
				</div>
			)}
		</div>
	);

	return (
		<section
			aria-label={t("通知中心", "Inbox")}
			className="@container/inbox min-w-0 rounded-[10px] border-[0.5px] border-border bg-card text-foreground"
		>
			<div className="grid @min-[740px]/inbox:grid-cols-[400px_minmax(0,1fr)]">
				<section
					ref={list}
					aria-label={t("通知列表", "Notifications")}
					onKeyDown={onListKey}
					className={`h-[min(72svh,700px)] min-h-[360px] min-w-0 flex-col @min-[740px]/inbox:flex @min-[740px]/inbox:border-e-[0.5px] @min-[740px]/inbox:border-border ${active ? "hidden" : "flex"}`}
				>
					<header className="flex h-11 shrink-0 items-center gap-1 border-b-[0.5px] border-border ps-[18px] pe-2.5">
						<h2 className="text-[13px] font-medium">{t("通知中心", "Inbox")}</h2>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger
								className={tool}
								aria-label={t("通知操作", "Notification actions")}
								title={t("通知操作", "Notification actions")}
							>
								<span aria-hidden="true">⋯</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								appearance="surface"
								className="w-52"
								onCloseAutoFocus={(event) => {
									if (searchInput.current === document.activeElement) event.preventDefault();
								}}
							>
								<DropdownMenuItem onSelect={openSearch}>
									{t("搜索通知", "Search notifications")}
								</DropdownMenuItem>
								<DropdownMenuItem
									disabled={!notifications.some(({ unread }) => unread)}
									onSelect={markAllRead}
								>
									{t("全部标为已读", "Mark all as read")}
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									disabled={!notifications.some(({ unread }) => !unread)}
									onSelect={deleteRead}
								>
									{t("删除已读通知", "Delete read notifications")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<div className="ms-auto flex items-center gap-1.5">
							<Button
								ref={unreadButton}
								variant="ghost"
								size="icon-sm"
								className="aria-pressed:bg-accent"
								aria-pressed={unreadOnly}
								title={
									unreadOnly ? t("显示已读", "Show read") : t("仅显示未读", "Show unreads only")
								}
								aria-label={
									unreadOnly ? t("显示已读", "Show read") : t("仅显示未读", "Show unreads only")
								}
								onClick={() => setUnreadOnly(!unreadOnly)}
							>
								<span aria-hidden="true">▱</span>
							</Button>
							<FilterPicker
								id={`${id}-filter`}
								name={t("添加筛选", "Add filter")}
								className={tool}
								labels={fieldLabels}
								options={options}
								filters={filters}
								onToggle={toggleFilter}
								t={t}
							>
								<span aria-hidden="true">≡</span>
							</FilterPicker>
							<Popover>
								<PopoverTrigger
									id={`${id}-display`}
									className={tool}
									aria-keyshortcuts="Shift+V"
									aria-label={t("显示选项", "Display options")}
									title={t("显示选项 (Shift+V)", "Display options (Shift+V)")}
								>
									<span aria-hidden="true">⚙</span>
								</PopoverTrigger>
								<PopoverContent
									appearance="surface"
									align="end"
									aria-label={t("显示选项", "Display options")}
									className="grid max-h-[min(70svh,var(--radix-popover-content-available-height))] w-68 max-w-[calc(100vw-16px)] gap-2.5 overflow-y-auto text-xs"
								>
									<label className="flex items-center justify-between gap-3">
										{t("启用优先收件箱", "Enable priority inbox")}
										<Switch size="sm" checked={priorityInbox} onCheckedChange={setPriorityInbox} />
									</label>
									{priorityInbox && (
										<>
											<Button
												size="sm"
												variant="ghost"
												className="justify-between"
												aria-expanded={priorityExpanded}
												aria-controls={priorityExpanded ? `${id}-rules` : undefined}
												onClick={() => setPriorityExpanded(!priorityExpanded)}
											>
												{t("优先筛选", "Priority filter")}
												<span aria-hidden="true">{priorityExpanded ? "−" : "+"}</span>
											</Button>
											{priorityExpanded && (
												<div
													id={`${id}-rules`}
													className="grid gap-3 rounded-md border-[0.5px] border-border p-2"
												>
													<p className="text-muted-foreground">
														{t(
															"符合任一来源或问题优先级的通知会进入「优先」。",
															"Notifications matching any source or issue priority go to Priority."
														)}
													</p>
													<fieldset className="min-w-0">
														<legend className="mb-1 font-medium">
															{t("通知来源", "Notification sources")}
														</legend>
														<div className="grid max-h-32 gap-2 overflow-y-auto p-0.5">
															{sourceEntries.map(([source]) => (
																<label key={source} className="flex items-center gap-2">
																	<Checkbox
																		checked={rules.sources.includes(source)}
																		onCheckedChange={(checked) =>
																			setRules((previous) => ({
																				...previous,
																				sources:
																					checked === true
																						? [...previous.sources, source]
																						: previous.sources.filter((item) => item !== source),
																			}))
																		}
																	/>
																	{sourceLabel(source)}
																</label>
															))}
														</div>
													</fieldset>
													<fieldset className="min-w-0">
														<legend className="mb-1 font-medium">
															{t("问题优先级", "Issue priorities")}
														</legend>
														<div className="grid grid-cols-2 gap-2 p-0.5">
															{priorities.map((level) => (
																<label key={level} className="flex items-center gap-2">
																	<Checkbox
																		checked={rules.levels.includes(level)}
																		onCheckedChange={(checked) =>
																			setRules((previous) => ({
																				...previous,
																				levels:
																					checked === true
																						? [...previous.levels, level]
																						: previous.levels.filter((item) => item !== level),
																			}))
																		}
																	/>
																	{issueLabel(level)}
																</label>
															))}
														</div>
													</fieldset>
													<Button
														variant="outline"
														size="xs"
														onClick={() => setRules(defaultRules())}
													>
														{t("恢复优先默认规则", "Reset priority defaults")}
													</Button>
												</div>
											)}
										</>
									)}
									<label className="flex items-center justify-between gap-3">
										{t("未读分组", "Group unreads by")}
										<NativeSelect
											size="sm"
											value={grouping}
											onChange={(event) => setGrouping(event.target.value)}
										>
											<option value="none">{t("不分组", "No grouping")}</option>
											<option value="focus">{t("专注", "Focus")}</option>
										</NativeSelect>
									</label>
									<label className="flex items-center justify-between gap-3">
										{t("排序", "Ordering")}
										<NativeSelect
											size="sm"
											value={order}
											onChange={(event) => setOrder(event.target.value)}
										>
											<option value="newest">{t("最新", "Newest")}</option>
											<option value="oldest">{t("最早", "Oldest")}</option>
											<option value="priority">{issueLabel("priority")}</option>
										</NativeSelect>
									</label>
									<label className="flex items-center justify-between gap-3">
										{t("显示已暂缓", "Show snoozed")}
										<Switch size="sm" checked={showSnoozed} onCheckedChange={setShowSnoozed} />
									</label>
									<label className="flex items-center justify-between gap-3">
										{t("未读优先", "Show unread first")}
										<Switch size="sm" checked={unreadFirst} onCheckedChange={setUnreadFirst} />
									</label>
								</PopoverContent>
							</Popover>
						</div>
					</header>
					<Tabs
						value={priorityView}
						onValueChange={(view) => {
							setPriorityView(view as typeof priorityView);
							setSelected(undefined);
						}}
						className="min-h-0 flex-1 flex-col gap-0"
					>
						{priorityInbox && (
							<TabsList
								variant="capsule"
								aria-label={t("通知视图", "Notification views")}
								className="mx-3 my-2 h-7! w-fit! shrink-0"
							>
								<TabsTrigger value="priority">
									{t("优先", "Priority")}{" "}
									<span className="text-muted-foreground tabular-nums">
										{unreadCounts.priority}
									</span>
								</TabsTrigger>
								<TabsTrigger value="other">
									{t("其他", "Other")}{" "}
									<span className="text-muted-foreground tabular-nums">{unreadCounts.other}</span>
								</TabsTrigger>
							</TabsList>
						)}
						{searchOpen && (
							<div className="flex shrink-0 items-center gap-2 border-b-[0.5px] border-border px-3 py-2">
								<Input
									ref={searchInput}
									type="search"
									aria-label={t("搜索通知", "Search notifications")}
									placeholder={t("搜索通知…", "Search notifications…")}
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									onKeyDown={(event) => {
										if (event.key === "Escape" && !event.nativeEvent.isComposing) {
											event.preventDefault();
											closeSearch();
										}
									}}
								/>
								<Button variant="ghost" size="sm" onClick={closeSearch}>
									{t("关闭", "Close")}
								</Button>
							</div>
						)}
						{activeFields.length > 0 && (
							<div
								role="group"
								aria-label={t("当前筛选", "Active filters")}
								className="flex max-h-32 shrink-0 flex-wrap gap-1.5 overflow-y-auto border-b-[0.5px] border-border px-3 py-2"
							>
								{activeFields.map((field) => {
									const term = filters[field]!;
									return (
										<div
											key={field}
											className="flex max-w-full items-center gap-0.5 rounded-md border-[0.5px] border-border ps-2 text-xs"
										>
											<span className="shrink-0 text-muted-foreground">{fieldLabels[field]}</span>
											<Button
												variant="ghost"
												size="xs"
												className="shrink-0"
												onClick={() =>
													setFilters({ ...filters, [field]: { ...term, exclude: !term.exclude } })
												}
											>
												{term.exclude ? t("不是", "Is not") : t("是", "Is")}
											</Button>
											<FilterPicker
												name={fieldLabels[field]}
												className={`h-6 min-w-0 truncate rounded-sm px-1.5 hover:bg-accent ${focusLine}`}
												initialField={field}
												labels={fieldLabels}
												options={options}
												filters={filters}
												onToggle={toggleFilter}
												t={t}
											>
												{term.values
													.map((value) => options[field].find(({ id }) => id === value)?.label)
													.join(", ")}
											</FilterPicker>
											<Button
												variant="ghost"
												size="icon-xs"
												aria-label={`${t("移除筛选", "Remove filter")} · ${fieldLabels[field]}`}
												onClick={() => {
													setFilters({ ...filters, [field]: undefined });
													document.getElementById(`${id}-filter`)?.focus();
												}}
											>
												×
											</Button>
										</div>
									);
								})}
							</div>
						)}
						{priorityInbox ? (
							<TabsContent
								key={priorityView}
								value={priorityView}
								className="flex min-h-0 flex-1 flex-col border-t-[0.5px] border-border"
							>
								{noticeList}
							</TabsContent>
						) : (
							noticeList
						)}
					</Tabs>
				</section>
				{active && activeIssue ? (
					<section
						aria-label={t("通知详情", "Notification details")}
						aria-keyshortcuts={shortcuts}
						className="flex h-[min(72svh,700px)] min-h-[360px] min-w-0 flex-col"
						onKeyDown={(event) => {
							if (event.target === heading.current) onNoticeKey(event, active, true);
						}}
					>
						<header className="flex h-11 shrink-0 items-center gap-1 border-b-[0.5px] border-border px-3">
							<Button
								variant="ghost"
								size="sm"
								className="shrink-0 @min-[740px]/inbox:hidden"
								onClick={back}
							>
								<span aria-hidden="true">‹</span>
								{t("返回通知", "Back to Inbox")}
							</Button>
							<span className="min-w-0 truncate text-xs text-muted-foreground">
								{active.issueId} · {sourceLabel(active.type)}
							</span>
							<div className="ms-auto flex shrink-0 items-center gap-1">
								<Button
									variant="ghost"
									size="icon-xs"
									disabled={!previous}
									aria-label={t("上一条通知", "Previous notification")}
									onClick={() => previous && choose(previous)}
								>
									<span aria-hidden="true">↑</span>
								</Button>
								<Button
									variant="ghost"
									size="icon-xs"
									disabled={!next}
									aria-label={t("下一条通知", "Next notification")}
									onClick={() => next && choose(next)}
								>
									<span aria-hidden="true">↓</span>
								</Button>
							</div>
							<DropdownMenu
								modal={false}
								open={actionsOpen}
								onOpenChange={(open) => {
									setActionsOpen(open);
									if (!open) {
										snoozeRequested.current = false;
										setSnoozeOpen(false);
									}
								}}
							>
								<DropdownMenuTrigger
									className={`${tool} shrink-0`}
									aria-label={t("当前通知操作", "Selected notification actions")}
									title={t("当前通知操作", "Selected notification actions")}
								>
									<span aria-hidden="true">⋯</span>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" appearance="surface" className="w-48">
									<DropdownMenuItem
										onSelect={() => changeNotice(active.id, { unread: !active.unread })}
									>
										{active.unread
											? t("标为已读", "Mark as read")
											: t("标为未读", "Mark as unread")}
									</DropdownMenuItem>
									{isSnoozed(active) ? (
										<DropdownMenuItem
											onSelect={() => changeNotice(active.id, { snoozedUntil: undefined })}
										>
											{t("取消暂缓", "Unsnooze")}
										</DropdownMenuItem>
									) : (
										<DropdownMenuSub open={snoozeOpen} onOpenChange={setSnoozeOpen}>
											<DropdownMenuSubTrigger>{t("暂缓", "Snooze")}</DropdownMenuSubTrigger>
											<DropdownMenuSubContent appearance="surface" className="w-32">
												{snoozePresets.map(([minutes, zh, en], index) => (
													<DropdownMenuItem
														id={index === 0 ? `${id}-snooze-first` : undefined}
														key={minutes}
														onSelect={() => snooze(active, minutes)}
													>
														{t(zh, en)}
													</DropdownMenuItem>
												))}
											</DropdownMenuSubContent>
										</DropdownMenuSub>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem variant="destructive" onSelect={() => remove(active)}>
										{t("删除通知", "Delete notification")}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</header>
						<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
							<p className="mx-4 mt-4 text-xs text-muted-foreground sm:mx-8">
								{person(active.sender)} {t(...active.summary)}
							</p>
							<IssueDetail
								key={activeIssue.id}
								embedded
								chinese={chinese}
								issue={activeIssue}
								activity={activityOptions(activeIssue.id)}
								headingRef={heading}
								assignees={people}
								projects={projects}
								onUpdate={(patch) =>
									setIssueEdits((previous) => ({
										...previous,
										[activeIssue.id]: { ...previous[activeIssue.id], ...patch },
									}))
								}
							/>
						</div>
					</section>
				) : (
					<div className="hidden place-content-center justify-items-center gap-3 p-4 text-[13px] text-muted-foreground @min-[740px]/inbox:grid">
						<svg
							aria-hidden="true"
							className="size-24 opacity-75"
							viewBox="0 0 96 96"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<path d="M20 31h56l12 31v16H8V62zM8 62h24l6 9h20l6-9h24" strokeLinejoin="round" />
						</svg>
						<p>{t("未选择通知", "No notification selected")}</p>
					</div>
				)}
			</div>
		</section>
	);
}
