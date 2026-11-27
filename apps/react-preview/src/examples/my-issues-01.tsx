"use client";

import { Button, buttonVariants } from "@valar/react-ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@valar/react-ui/command";
import { Empty, EmptyTitle } from "@valar/react-ui/empty";
import {
	IssueComposer,
	IssueGlyph,
	issueLabels,
	priorities,
	statuses,
	type IssueDraft,
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
import { useId, useLayoutEffect, useRef, useState } from "react";

const views = ["assigned", "created", "subscribed", "activity"] as const;
const fields = ["status", "priority"] as const;
const priorityOrder = [...priorities.slice(1), "none"] as const;
const options = { status: statuses, priority: priorityOrder };
const viewLabels = {
	assigned: ["分配给我", "Assigned"],
	created: ["我创建的", "Created"],
	subscribed: ["我订阅的", "Subscribed"],
	activity: ["活动", "Activity"],
} as const;
const emptyLabels = {
	assigned: ["没有分配给你的问题", "No issues assigned to you"],
	created: ["你还没有创建问题", "No issues created by you"],
	subscribed: ["你还没有订阅问题", "No issues you are subscribed to"],
	activity: ["没有与你的活动相关的问题", "No issues with activity from you"],
} as const;
type View = (typeof views)[number];
type Field = (typeof fields)[number];
type Filters = Partial<Record<Field, IssueDetailValue["status"] | IssueDetailValue["priority"]>>;
type Issue = IssueDetailValue & { number: number; created: boolean; active: boolean };
const samples = [
	[
		103,
		"补齐命令菜单的键盘导航",
		"Finish keyboard navigation in the command menu",
		"progress",
		"high",
		false,
		true,
	],
	[
		102,
		"修复移动端侧栏焦点恢复",
		"Restore focus after closing the mobile sidebar",
		"todo",
		"urgent",
		true,
		false,
	],
	[
		101,
		"记录弹层在深色主题下的对比度",
		"Document overlay contrast in dark mode",
		"todo",
		"medium",
		true,
		true,
	],
	[
		100,
		"检查空状态文案与操作入口",
		"Review empty-state labels and actions",
		"done",
		"low",
		true,
		true,
	],
	[
		99,
		"整理设计 token 的使用示例",
		"Organize examples for design tokens",
		"backlog",
		"none",
		false,
		false,
	],
] as const;
const tool = buttonVariants({ variant: "outline", size: "icon-sm", shape: "pill" });
const popup = "w-64 max-w-[calc(100vw-16px)]";

export default function MyIssues({ chinese = false }: { chinese?: boolean } = {}) {
	const t = (zh: string, en: string) => (chinese ? zh : en);
	const label = (key: keyof typeof issueLabels) => issueLabels[key][chinese ? 0 : 1];
	const id = useId();
	const viewer = { id: "self", name: t("我", "Me") };
	const people = [viewer, { id: "mira", name: "Mira Chen" }, { id: "alex", name: "Alex Rivera" }];
	const assignees = people.map(({ id, name }) => ({ id, label: name }));
	const projects = [
		{ id: "documentation", label: t("组件文档整理", "Component documentation") },
		{ id: "performance", label: t("预览性能优化", "Preview performance") },
	];
	const labelOptions = [
		{ id: "accessibility", label: t("无障碍", "Accessibility") },
		{ id: "design", label: t("设计", "Design") },
		{ id: "bug", label: t("缺陷", "Bug") },
	];
	const [added, setAdded] = useState<Issue[]>([]);
	const [edits, setEdits] = useState<Record<string, IssueDetailUpdate>>({});
	const issues: Issue[] = [
		...added,
		...samples.map(([number, zh, en, status, priority, created, active]) => ({
			number,
			id: `VLR-${number}`,
			title: t(zh, en),
			status,
			priority,
			created,
			active,
			assignee: "self",
			description:
				number === 103
					? t(
							"让所有命令都能通过键盘查找与执行。\n检查搜索、选项切换与退出后的焦点恢复。",
							"Make every command accessible by keyboard.\nCheck search, option navigation, and focus restoration."
						)
					: undefined,
		})),
	].map((issue) => ({ ...issue, ...edits[issue.id] }));
	const [activity, setActivity] = useState<Record<string, IssueCollaborationState>>({});
	const [view, setView] = useState<View>("assigned");
	const [filters, setFilters] = useState<Filters>({});
	const [field, setField] = useState<Field>();
	const [filterOpen, setFilterOpen] = useState(false);
	const [grouping, setGrouping] = useState("none");
	const [ordering, setOrdering] = useState("created");
	const [hideCompleted, setHideCompleted] = useState(false);
	const [selectedId, setSelectedId] = useState<string>();
	const [createOpen, setCreateOpen] = useState(false);
	const nextNumber = useRef(104);
	const filterPanel = useRef<HTMLDivElement>(null);
	const filterTrigger = useRef<HTMLButtonElement>(null);
	const detailTrigger = useRef<HTMLButtonElement>(null);
	const createTrigger = useRef<HTMLButtonElement>(null);
	const createOpener = useRef<HTMLButtonElement>(null);
	const heading = useRef<HTMLHeadingElement>(null);
	const rowOpener = useRef<string | null>(null);
	const restoringDetails = useRef(false);
	const selected = issues.find(({ id }) => id === selectedId);
	const viewIssues = issues.filter((issue) =>
		view === "assigned"
			? issue.assignee === viewer.id
			: view === "subscribed"
				? activity[issue.id]?.subscribers.some(({ id }) => id === viewer.id)
				: view === "created"
					? issue.created
					: issue.active
	);
	const visible = viewIssues
		.filter(
			(issue) =>
				(!hideCompleted || issue.status !== "done") &&
				fields.every((field) => !filters[field] || filters[field] === issue[field])
		)
		.sort((left, right) =>
			ordering === "priority"
				? priorityOrder.indexOf(left.priority) - priorityOrder.indexOf(right.priority) ||
					right.number - left.number
				: right.number - left.number
		);
	const groups =
		grouping === "status"
			? statuses
					.map((status) => ({ status, items: visible.filter((issue) => issue.status === status) }))
					.filter(({ items }) => items.length)
			: [{ status: null, items: visible }];
	const activeFields = fields.filter((key) => filters[key]);

	useLayoutEffect(() => {
		if (selectedId) heading.current?.focus();
		else if (restoringDetails.current) {
			restoringDetails.current = false;
			const opener = rowOpener.current && document.getElementById(`${id}-${rowOpener.current}`);
			(
				opener || (detailTrigger.current?.disabled ? createTrigger.current : detailTrigger.current)
			)?.focus();
		}
	}, [id, selectedId]);
	useLayoutEffect(() => {
		if (filterOpen) filterPanel.current?.querySelector("input")?.focus();
	}, [field, filterOpen]);

	function baseActivity(issueId: string): IssueCollaborationState {
		const author = people[1];
		const featured = issueId === "VLR-103";
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
				people,
				subscribers,
				reactions,
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

	function createIssue(draft: IssueDraft) {
		const number = nextNumber.current++;
		const issue = {
			...draft,
			number,
			id: `VLR-${number}`,
			assignee: viewer.id,
			created: true,
			active: true,
		};
		const createdAt = new Date().toISOString();
		setAdded((previous) => [issue, ...previous]);
		setActivity((previous) => ({
			...previous,
			[issue.id]: {
				entries: [{ kind: "event", id: `${issue.id}-created`, author: viewer, createdAt }],
				subscribers: [viewer],
				reactions: [],
			},
		}));
		setFilters({});
		setView("created");
	}

	function openCreate(opener: HTMLButtonElement) {
		createOpener.current = opener;
		setCreateOpen(true);
	}

	if (selected)
		return (
			<IssueDetail
				key={selected.id}
				issue={selected}
				chinese={chinese}
				headingRef={heading}
				activity={activityOptions(selected.id)}
				assignees={assignees}
				projects={projects}
				labelOptions={labelOptions}
				onBack={() => {
					restoringDetails.current = true;
					setSelectedId(undefined);
				}}
				onUpdate={(patch) =>
					setEdits((previous) => ({
						...previous,
						[selected.id]: { ...previous[selected.id], ...patch },
					}))
				}
			/>
		);

	return (
		<section
			aria-label={t("我的问题", "My issues")}
			className="min-w-0 rounded-[10px] border-[0.5px] border-border bg-card text-foreground"
		>
			<header className="flex min-h-11 flex-wrap items-center justify-between gap-1 border-b-[0.5px] border-border px-4">
				<h2 className="text-[13px] font-semibold">{t("我的问题", "My issues")}</h2>
				<Button
					ref={createTrigger}
					variant="ghost"
					size="sm"
					onClick={(event) => openCreate(event.currentTarget)}
				>
					<span aria-hidden="true">+</span>
					{t("新建问题", "New issue")}
				</Button>
			</header>
			<Tabs value={view} onValueChange={(value) => setView(value as View)} className="gap-0">
				<div className="flex flex-wrap items-center justify-between gap-2 p-2">
					<TabsList
						variant="capsule"
						aria-label={t("问题视图", "Issue views")}
						className="h-auto! w-fit! flex-wrap justify-start gap-1.5 bg-transparent! p-0!"
					>
						{views.map((view) => (
							<TabsTrigger
								key={view}
								value={view}
								className="h-7! flex-none rounded-full! border-[0.5px] border-border bg-background px-2.5! text-xs! data-[state=active]:bg-accent!"
							>
								{viewLabels[view][chinese ? 0 : 1]}
							</TabsTrigger>
						))}
					</TabsList>
					<div
						role="group"
						aria-label={t("列表工具", "List tools")}
						className="ms-auto flex gap-1.5"
					>
						<Popover
							open={filterOpen}
							onOpenChange={(open) => {
								if (open) setField(undefined);
								setFilterOpen(open);
							}}
						>
							<PopoverTrigger
								ref={filterTrigger}
								className={tool}
								aria-label={t("添加筛选", "Add filter")}
							>
								<span aria-hidden="true">≡</span>
							</PopoverTrigger>
							<PopoverContent
								ref={filterPanel}
								appearance="surface"
								align="end"
								aria-label={t("筛选问题", "Filter issues")}
								className={`${popup} p-0!`}
							>
								{field && (
									<Button
										variant="ghost"
										size="sm"
										className="w-full justify-start"
										onClick={() => setField(undefined)}
									>
										<span aria-hidden="true">‹</span>
										{label(field)}
									</Button>
								)}
								<Command key={field ?? "fields"} appearance="compact">
									<CommandInput
										aria-label={t("搜索筛选项", "Search filters")}
										placeholder={t("搜索筛选项…", "Search filters…")}
									/>
									<CommandList>
										<CommandEmpty>{t("没有匹配的选项", "No matching options")}</CommandEmpty>
										<CommandGroup>
											{field
												? options[field].map((option) => (
														<CommandItem
															key={option}
															value={label(option)}
															checked={filters[field] === option}
															onSelect={() => {
																setFilters({ ...filters, [field]: option });
																setFilterOpen(false);
															}}
														>
															{label(option)}
														</CommandItem>
													))
												: fields.map((key) => (
														<CommandItem
															key={key}
															value={label(key)}
															onSelect={() => setField(key)}
														>
															{label(key)}{" "}
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
						<Popover>
							<PopoverTrigger className={tool} aria-label={t("显示选项", "Display options")}>
								<span aria-hidden="true">⚙</span>
							</PopoverTrigger>
							<PopoverContent
								appearance="surface"
								align="end"
								aria-label={t("显示选项", "Display options")}
								className={`${popup} grid gap-2 text-xs`}
							>
								<label className="flex items-center justify-between gap-2">
									{t("分组", "Grouping")}
									<NativeSelect
										size="sm"
										value={grouping}
										onChange={(event) => setGrouping(event.target.value)}
									>
										<option value="none">{t("不分组", "No grouping")}</option>
										<option value="status">{label("status")}</option>
									</NativeSelect>
								</label>
								<label className="flex items-center justify-between gap-2">
									{t("排序", "Ordering")}
									<NativeSelect
										size="sm"
										value={ordering}
										onChange={(event) => setOrdering(event.target.value)}
									>
										<option value="created">{t("创建时间", "Created")}</option>
										<option value="priority">{label("priority")}</option>
									</NativeSelect>
								</label>
								<label className="flex items-center justify-between gap-2 border-t border-border pt-2">
									{t("隐藏已完成的问题", "Hide completed issues")}
									<Switch size="sm" checked={hideCompleted} onCheckedChange={setHideCompleted} />
								</label>
							</PopoverContent>
						</Popover>
						<Button
							ref={detailTrigger}
							size="icon-sm"
							variant="outline"
							shape="pill"
							aria-label={t("打开详情", "Open details")}
							disabled={!visible.length}
							onClick={() => {
								rowOpener.current = null;
								setSelectedId(visible[0]?.id);
							}}
						>
							<span aria-hidden="true">◫</span>
						</Button>
					</div>
				</div>
				{activeFields.length > 0 && (
					<div
						aria-label={t("当前筛选", "Active filters")}
						role="group"
						className="mx-2 mb-2 flex flex-wrap items-center gap-1.5 rounded-lg border-[0.5px] border-border bg-accent p-2"
					>
						{activeFields.map((key) => (
							<div
								key={key}
								className="flex items-center rounded-md border-[0.5px] border-border bg-background ps-2 text-xs"
							>
								{label(key)} <span className="px-1.5 text-muted-foreground">{t("是", "is")}</span>
								{label(filters[key]!)}
								<Button
									variant="ghost"
									size="icon-xs"
									aria-label={t(`移除${label(key)}筛选`, `Remove ${label(key)} filter`)}
									onClick={() => {
										setFilters({ ...filters, [key]: undefined });
										filterTrigger.current?.focus();
									}}
								>
									×
								</Button>
							</div>
						))}
						<Button
							variant="ghost"
							size="icon-xs"
							aria-label={t("添加其他筛选", "Add another filter")}
							onClick={() => {
								setField(undefined);
								setFilterOpen(true);
							}}
						>
							+
						</Button>
						<Button
							variant="ghost"
							size="xs"
							className="ms-auto"
							onClick={() => {
								setFilters({});
								filterTrigger.current?.focus();
							}}
						>
							{t("清除", "Clear")}
						</Button>
					</div>
				)}
				<TabsContent key={view} value={view} className="min-h-[440px] min-w-0">
					<p role="status" className="sr-only">
						{t(`${visible.length} 个问题`, `${visible.length} issues`)}
					</p>
					{visible.length ? (
						groups.map(({ status, items }) => (
							<div key={status ?? "all"}>
								{status && (
									<h3 className="flex h-8 items-center gap-2 border-y-[0.5px] border-border bg-accent px-4 text-xs font-medium">
										<IssueGlyph value={status} />
										{label(status)} <span className="text-muted-foreground">{items.length}</span>
									</h3>
								)}
								<ul
									aria-label={t("问题列表", "Issue list")}
									className="divide-y-[0.5px] divide-border"
								>
									{items.map((issue) => (
										<li key={issue.id}>
											<button
												type="button"
												id={`${id}-${issue.id}`}
												onClick={() => {
													rowOpener.current = issue.id;
													setSelectedId(issue.id);
												}}
												className="flex h-11 w-full min-w-0 items-center gap-2 rounded-lg px-4 text-start text-[13px] transition-colors duration-150 hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none"
											>
												<span className="sr-only">
													{label("priority")}: {label(issue.priority)}
												</span>
												<IssueGlyph value={issue.priority} />
												<span className="shrink-0 text-xs text-muted-foreground">{issue.id}</span>
												<span className="sr-only">{label(issue.status)}</span>
												<IssueGlyph value={issue.status} />
												<span className="truncate font-medium">{issue.title}</span>
											</button>
										</li>
									))}
								</ul>
							</div>
						))
					) : (
						<Empty
							appearance={viewIssues.length ? "filtered-list" : "issue-list"}
							className="min-h-[350px]"
						>
							<svg
								aria-hidden="true"
								className="size-24 text-muted-foreground"
								viewBox="0 0 96 96"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
							>
								<ellipse cx="48" cy="43" rx="24" ry="30" strokeDasharray="3 4" />
								<ellipse cx="48" cy="45" rx="39" ry="16" transform="rotate(-24 48 45)" />
								<ellipse cx="48" cy="45" rx="39" ry="16" transform="rotate(24 48 45)" />
								<circle cx="48" cy="45" r="6" />
							</svg>
							<EmptyTitle>
								{viewIssues.length
									? t("没有符合条件的问题", "No issues matching the filters")
									: emptyLabels[view][chinese ? 0 : 1]}
							</EmptyTitle>
							{viewIssues.length ? (
								<Button
									size="sm"
									variant="ghost"
									onClick={() => {
										setFilters({});
										setHideCompleted(false);
										filterTrigger.current?.focus();
									}}
								>
									{t("重置筛选和显示选项", "Reset filters and display")}
								</Button>
							) : (
								<Button size="sm" onClick={(event) => openCreate(event.currentTarget)}>
									{t("创建新问题", "Create new issue")}
								</Button>
							)}
						</Empty>
					)}
				</TabsContent>
			</Tabs>
			<IssueComposer
				open={createOpen}
				onOpenChange={setCreateOpen}
				chinese={chinese}
				onCreate={createIssue}
				returnFocus={() =>
					createOpener.current?.isConnected ? createOpener.current : createTrigger.current
				}
			/>
		</section>
	);
}
