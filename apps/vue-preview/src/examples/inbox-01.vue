<script setup lang="ts">
import { Avatar, AvatarFallback } from "@valar/vue-ui/avatar";
import { Button, buttonVariants } from "@valar/vue-ui/button";
import { Checkbox } from "@valar/vue-ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@valar/vue-ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@valar/vue-ui/dropdown-menu";
import { Input } from "@valar/vue-ui/input";
import {
	IssueGlyph,
	issueLabels,
	priorities,
	statuses,
	type IssuePriority,
} from "@valar/vue-ui/issue-composer";
import {
	IssueDetail,
	applyIssueActivityAction,
	applyIssueCollaborationAction,
	type IssueActivityOptions,
	type IssueCollaborationState,
	type IssueDetailUpdate,
	type IssueDetailValue,
} from "@valar/vue-ui/issue-detail";
import { NativeSelect } from "@valar/vue-ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@valar/vue-ui/popover";
import { Switch } from "@valar/vue-ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@valar/vue-ui/tabs";
import { computed, nextTick, ref, useId, watch } from "vue";

const props = defineProps<{ chinese?: boolean; empty?: boolean }>();
const t = (zh: string, en: string) => (props.chinese ? zh : en);
const id = useId();
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
const sourceKeys = Object.keys(sources) as Source[];
const people = [
	{ id: "avery", label: "Avery Chen" },
	{ id: "morgan", label: "Morgan Lee" },
	{ id: "riley", label: "Riley Park" },
];
const subscriberPeople = people.map(({ id, label }) => ({ id, name: label }));
const date = computed(
	() =>
		new Intl.DateTimeFormat(props.chinese ? "zh-CN" : "en-US", {
			month: "short",
			day: "numeric",
			timeZone: "UTC",
		})
);
const issueLabel = (key: keyof typeof issueLabels) => issueLabels[key][props.chinese ? 0 : 1];
const sourceLabel = (key: Source) => sources[key][props.chinese ? 0 : 1];
const projects = computed(() => [
	{ id: "docs", label: t("文档站", "Documentation") },
	{ id: "ui", label: t("组件库", "Component library") },
]);
const viewer = computed(() => ({ id: "self", name: t("我", "Me") }));
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
const fieldLabels = computed(() => ({
	type: t("通知类型", "Notification type"),
	sender: t("发送者", "From"),
	project: t("项目", "Project"),
	priority: t("问题优先级", "Issue priority"),
	status: t("问题状态类型", "Issue status type"),
}));
const options = computed(() => ({
	type: sourceKeys.map((id) => ({ id, label: sourceLabel(id) })),
	sender: people,
	project: [{ id: "", label: t("无项目", "No project") }, ...projects.value],
	priority: priorities.map((id) => ({ id, label: issueLabel(id) })),
	status: statuses.map((id) => ({ id, label: issueLabel(id) })),
}));
const tool = buttonVariants({ variant: "ghost", size: "icon-sm" });
const shortcuts = "ArrowDown ArrowUp J K U H Backspace Alt+U Shift+Backspace";
const snoozePresets = [
	[60, "1 小时", "1 hour"],
	[1440, "1 天", "1 day"],
	[10080, "1 周", "1 week"],
] as const;
const eventGlyphs: Partial<Record<Source, string>> = {
	assignment: "→",
	mention: "@",
	comment: "▤",
	status: "✓",
};
const person = (id?: string) => people.find((item) => item.id === id)?.label ?? "";
const initials = (id: string) =>
	person(id)
		.split(" ")
		.map((word) => word[0])
		.join("");
const rank = (priority: IssuePriority) =>
	priority === "none" ? priorities.length : priorities.indexOf(priority);

const issueEdits = ref<Record<string, IssueDetailUpdate>>({});
const issues = computed<IssueDetailValue[]>(() => [
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
]);
const issueById = computed(
	() =>
		new Map(issues.value.map((issue) => [issue.id, { ...issue, ...issueEdits.value[issue.id] }]))
);
const notices = ref<Notice[]>([
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
]);
const notifications = computed(() => (props.empty ? [] : notices.value));
const activity = ref<Record<string, IssueCollaborationState>>({});
const selected = ref<string>();
const unreadOnly = ref(false);
const rules = ref(defaultRules());
const priorityInbox = ref(false);
const priorityExpanded = ref(false);
const priorityView = ref<"priority" | "other">("priority");
const showSnoozed = ref(false);
const unreadFirst = ref(false);
const grouping = ref("none");
const order = ref("newest");
const filters = ref<Filters>({});
const filterOpen = ref(false);
const field = ref<Field>();
const clock = ref(0);
const actionsOpen = ref(false);
const snoozeOpen = ref(false);
let snoozeRequested = false;
const searchOpen = ref(false);
const search = ref("");
const list = ref<HTMLElement>();
let heading: HTMLHeadingElement | null = null;
function setHeading(node: HTMLHeadingElement | null) {
	heading = node;
}
const active = computed(() => notifications.value.find(({ id }) => id === selected.value));
const activeIssue = computed(() => active.value && issueById.value.get(active.value.issueId));
const activeFields = computed(() => fields.filter((field) => filters.value[field]?.values.length));
const isPriority = (item: Notice) =>
	rules.value.sources.includes(item.type) ||
	rules.value.levels.includes(issueById.value.get(item.issueId)?.priority ?? "none");
const isSnoozed = (item: Notice) => (item.snoozedUntil ?? 0) > clock.value;
const unreadCounts = computed(() => {
	const counts = { priority: 0, other: 0 };
	for (const item of notifications.value)
		if (item.unread && !isSnoozed(item)) counts[isPriority(item) ? "priority" : "other"]++;
	return counts;
});
const visible = computed(() => {
	const query = search.value.trim().toLocaleLowerCase();
	return notifications.value
		.filter((item) => {
			if (
				(!showSnoozed.value && isSnoozed(item)) ||
				(unreadOnly.value && !item.unread) ||
				(priorityInbox.value && (priorityView.value === "priority") !== isPriority(item))
			)
				return false;
			const issue = issueById.value.get(item.issueId);
			const values = {
				type: item.type,
				sender: item.sender,
				project: issue?.project ?? "",
				priority: issue?.priority ?? "none",
				status: issue?.status ?? "",
			};
			if (
				activeFields.value.some((field) => {
					const filter = filters.value[field]!;
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
					projects.value.find(({ id }) => id === issue?.project)?.label,
					issue && issueLabel(issue.priority),
				].some((value) => value?.toLocaleLowerCase().includes(query))
			);
		})
		.sort((left, right) => {
			if (unreadFirst.value && left.unread !== right.unread)
				return Number(right.unread) - Number(left.unread);
			if (order.value === "priority") {
				const difference =
					rank(issueById.value.get(left.issueId)?.priority ?? "none") -
					rank(issueById.value.get(right.issueId)?.priority ?? "none");
				if (difference) return difference;
			}
			return order.value === "oldest"
				? left.created.localeCompare(right.created)
				: right.created.localeCompare(left.created);
		});
});
const groups = computed(() =>
	(grouping.value === "focus"
		? [
				{
					label: t("专注", "Focus"),
					items: visible.value.filter((item) => item.unread && isPriority(item)),
				},
				{
					label: t("其他通知", "Other notifications"),
					items: visible.value.filter((item) => !item.unread || !isPriority(item)),
				},
			]
		: [{ label: "", items: visible.value }]
	).filter(({ items }) => items.length)
);
const navigation = computed(() => groups.value.flatMap(({ items }) => items));
function adjacent(item: Notice, direction: 1 | -1) {
	const items = navigation.value;
	const index = items.findIndex(({ id }) => id === item.id);
	return index === -1 ? items.at(direction === 1 ? 0 : -1) : items[index + direction];
}
const previous = computed(() => active.value && adjacent(active.value, -1));
const next = computed(() => active.value && adjacent(active.value, 1));
const expiry = computed(() =>
	Math.min(...notifications.value.map((item) => (isSnoozed(item) ? item.snoozedUntil! : Infinity)))
);
watch(expiry, (deadline, _, cleanup) => {
	if (!Number.isFinite(deadline)) return;
	const timer = window.setTimeout(
		() => {
			clock.value = Date.now();
		},
		Math.max(1, deadline - Date.now())
	);
	cleanup(() => window.clearTimeout(timer));
});
watch(
	[actionsOpen, snoozeOpen],
	([open, submenu], _, cleanup) => {
		if (!open || !snoozeRequested) return;
		// Let the parent menu finish moving focus before opening its submenu.
		const frame = requestAnimationFrame(() => {
			if (!submenu) snoozeOpen.value = true;
			else {
				snoozeRequested = false;
				document.querySelector<HTMLElement>(`[data-inbox-snooze="${id}"]`)?.focus();
			}
		});
		cleanup(() => cancelAnimationFrame(frame));
	},
	{ flush: "post" }
);

function element(key: string) {
	return document.getElementById(`${id}-${key}`);
}
function toolbarControl(key: string) {
	return list.value?.querySelector<HTMLButtonElement>(`[data-inbox-control="${id}-${key}"]`);
}
function focusList(key?: string) {
	(
		(key ? element(key) : null) ??
		list.value?.querySelector<HTMLButtonElement>("[data-notification]") ??
		element("unread")
	)?.focus();
}
function changeNotice(key: string, patch: Partial<Notice>) {
	notices.value = notices.value.map((item) => (item.id === key ? { ...item, ...patch } : item));
}
function setActions(open: boolean) {
	actionsOpen.value = open;
	if (!open) {
		snoozeRequested = false;
		snoozeOpen.value = false;
	}
}
async function choose(item: Notice, markRead = true) {
	setActions(false);
	selected.value = item.id;
	if (markRead) {
		if (item.unread) changeNotice(item.id, { unread: false });
		await nextTick();
		heading?.focus();
	}
}
async function back() {
	const opener = selected.value;
	selected.value = undefined;
	setActions(false);
	await nextTick();
	focusList(opener);
}
function markAllRead() {
	notices.value = notices.value.map((item) => ({ ...item, unread: false }));
}
function deleteRead() {
	if (active.value && !active.value.unread) void back();
	notices.value = notices.value.filter(({ unread }) => unread);
}
async function remove(item: Notice) {
	const candidate = adjacent(item, 1) ?? adjacent(item, -1);
	notices.value = notices.value.filter(({ id }) => id !== item.id);
	if (item.id === selected.value) await back();
	else {
		await nextTick();
		focusList(candidate?.id);
	}
}
function snooze(item: Notice, minutes: number) {
	const now = Date.now();
	clock.value = now;
	changeNotice(item.id, { snoozedUntil: now + minutes * 60000 });
	if (!showSnoozed.value) void back();
}
async function showField(next?: Field) {
	field.value = next;
	await nextTick();
	element("filter-input")?.focus();
}
function setFilterOpen(open: boolean) {
	filterOpen.value = open;
	if (open) void showField();
}
function editFilter(next: Field) {
	filterOpen.value = true;
	void showField(next);
}
function toggleFilter(field: Field, value: string) {
	const term = filters.value[field];
	const values = term?.values ?? [];
	const next = values.includes(value)
		? values.filter((item) => item !== value)
		: [...values, value];
	filters.value[field] = next.length
		? { values: next, exclude: term?.exclude ?? false }
		: undefined;
}
function removeFilter(field: Field) {
	delete filters.value[field];
	toolbarControl("filter")?.focus();
}
function toggleExclusion(field: Field) {
	const term = filters.value[field];
	if (term) term.exclude = !term.exclude;
}
async function openSearch() {
	searchOpen.value = true;
	await nextTick();
	element("search")?.focus();
}
function closeSearch() {
	search.value = "";
	searchOpen.value = false;
	element("unread")?.focus();
}
function restoreActionsFocus(event: Event) {
	if (element("search") === document.activeElement) event.preventDefault();
}
function onListKey(event: KeyboardEvent) {
	const key = event.key.toLowerCase();
	const target = event.target;
	if (
		!(target instanceof HTMLElement) ||
		event.defaultPrevented ||
		event.isComposing ||
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
		void openSearch();
		return;
	}
	if (event.metaKey || event.ctrlKey || target.closest("input,textarea,[contenteditable]")) return;
	const trigger =
		!event.shiftKey && key === "f"
			? "filter"
			: event.shiftKey && key === "v"
				? "display"
				: undefined;
	if (trigger) {
		event.preventDefault();
		const button = toolbarControl(trigger);
		button?.focus();
		button?.click();
	}
}
async function onNoticeKey(event: KeyboardEvent, item: Notice, detail = false) {
	if (event.defaultPrevented || event.isComposing || event.metaKey || event.ctrlKey) return;
	const key = event.key.toLowerCase();
	if (event.altKey) {
		if (key === "u" && !event.shiftKey && !event.repeat) {
			event.preventDefault();
			markAllRead();
			if (!detail && unreadOnly.value) element("unread")?.focus();
		}
		return;
	}
	if (!event.shiftKey && ["j", "k", "arrowdown", "arrowup"].includes(key)) {
		event.preventDefault();
		const target = adjacent(item, key === "j" || key === "arrowdown" ? 1 : -1);
		if (target) {
			if (detail) void choose(target);
			else element(target.id)?.focus();
		}
	} else if (!event.repeat && key === "backspace") {
		event.preventDefault();
		if (event.shiftKey) {
			const wasRead = !item.unread;
			deleteRead();
			if (!detail && wasRead) {
				await nextTick();
				focusList();
			}
		} else void remove(item);
	} else if (!event.repeat && !event.shiftKey && key === "u") {
		event.preventDefault();
		const wasUnread = item.unread;
		changeNotice(item.id, { unread: !wasUnread });
		if (!detail && unreadOnly.value && wasUnread) {
			await nextTick();
			focusList();
		}
	} else if (!event.repeat && !event.shiftKey && key === "h") {
		event.preventDefault();
		if (selected.value !== item.id) void choose(item, false);
		snoozeRequested = !isSnoozed(item);
		setActions(true);
	}
}
function onDetailKey(event: KeyboardEvent) {
	if (active.value && event.target === heading) void onNoticeKey(event, active.value, true);
}
function toggleRule<T>(values: T[], value: T, checked: boolean) {
	return checked ? [...values, value] : values.filter((item) => item !== value);
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
	const read = () => activity.value[issueId] ?? baseActivity(issueId);
	const { entries, subscribers, reactions } = read();
	return {
		entries,
		viewer: viewer.value,
		onAction: (action) => {
			const state = read();
			activity.value[issueId] = {
				...state,
				entries: applyIssueActivityAction(state.entries, action, viewer.value),
			};
		},
		collaboration: {
			subscribers,
			reactions,
			people: subscriberPeople,
			onAction: (action) => {
				activity.value[issueId] = applyIssueCollaborationAction(read(), action, viewer.value);
			},
		},
	};
}
function updateIssue(patch: IssueDetailUpdate) {
	const key = activeIssue.value?.id;
	if (key) issueEdits.value[key] = { ...issueEdits.value[key], ...patch };
}
</script>

<template>
	<section
		:aria-label="t('通知中心', 'Inbox')"
		class="@container/inbox min-w-0 rounded-[10px] border-[0.5px] border-border bg-card text-foreground"
	>
		<div class="grid @min-[740px]/inbox:grid-cols-[400px_minmax(0,1fr)]">
			<section
				ref="list"
				:aria-label="t('通知列表', 'Notifications')"
				@keydown="onListKey"
				class="h-[min(72svh,700px)] min-h-[360px] min-w-0 flex-col @min-[740px]/inbox:flex @min-[740px]/inbox:border-e-[0.5px] @min-[740px]/inbox:border-border"
				:class="active ? 'hidden' : 'flex'"
			>
				<header
					class="flex h-11 shrink-0 items-center gap-1 border-b-[0.5px] border-border ps-[18px] pe-2.5"
				>
					<h2 class="text-[13px] font-medium">{{ t("通知中心", "Inbox") }}</h2>
					<DropdownMenu :modal="false">
						<DropdownMenuTrigger
							:class="tool"
							:aria-label="t('通知操作', 'Notification actions')"
							:title="t('通知操作', 'Notification actions')"
							><span aria-hidden="true">⋯</span></DropdownMenuTrigger
						>
						<DropdownMenuContent
							appearance="surface"
							class="w-52"
							@close-auto-focus="restoreActionsFocus"
						>
							<DropdownMenuItem @select="openSearch">{{
								t("搜索通知", "Search notifications")
							}}</DropdownMenuItem>
							<DropdownMenuItem
								:disabled="!notifications.some(({ unread }) => unread)"
								@select="markAllRead"
								>{{ t("全部标为已读", "Mark all as read") }}</DropdownMenuItem
							>
							<DropdownMenuItem
								variant="destructive"
								:disabled="!notifications.some(({ unread }) => !unread)"
								@select="deleteRead"
								>{{ t("删除已读通知", "Delete read notifications") }}</DropdownMenuItem
							>
						</DropdownMenuContent>
					</DropdownMenu>
					<div class="ms-auto flex items-center gap-1.5">
						<Button
							:id="`${id}-unread`"
							variant="ghost"
							size="icon-sm"
							class="aria-pressed:bg-accent"
							:aria-pressed="unreadOnly"
							:title="
								unreadOnly ? t('显示已读', 'Show read') : t('仅显示未读', 'Show unreads only')
							"
							:aria-label="
								unreadOnly ? t('显示已读', 'Show read') : t('仅显示未读', 'Show unreads only')
							"
							@click="unreadOnly = !unreadOnly"
							><span aria-hidden="true">▱</span></Button
						>
						<Popover :open="filterOpen" @update:open="setFilterOpen">
							<PopoverTrigger
								:data-inbox-control="`${id}-filter`"
								:class="tool"
								:aria-label="t('添加筛选', 'Add filter')"
								:title="t('添加筛选 (F)', 'Add filter (F)')"
								aria-keyshortcuts="F"
								><span aria-hidden="true">≡</span></PopoverTrigger
							>
							<PopoverContent
								appearance="surface"
								align="end"
								role="dialog"
								:aria-label="t('筛选通知', 'Filter notifications')"
								class="w-60 max-w-[calc(100vw-16px)] p-0!"
								@open-auto-focus.prevent="showField(field)"
							>
								<Button
									v-if="field"
									size="sm"
									variant="ghost"
									class="w-full justify-start"
									@click="showField()"
									><span aria-hidden="true">‹</span>{{ fieldLabels[field] }}</Button
								>
								<Command :key="field ?? 'fields'" appearance="compact">
									<CommandInput
										:id="`${id}-filter-input`"
										:aria-label="t('搜索筛选项', 'Search filters')"
										:placeholder="t('搜索筛选项…', 'Search filters…')"
									/>
									<CommandList class="max-h-64"
										><CommandEmpty>{{ t("没有匹配的选项", "No matching options") }}</CommandEmpty
										><CommandGroup>
											<template v-if="field"
												><CommandItem
													v-for="option in options[field]"
													:key="option.id"
													:value="option.label"
													:checked="filters[field]?.values.includes(option.id) ?? false"
													show-indicator
													@select="toggleFilter(field!, option.id)"
													>{{ option.label }}</CommandItem
												></template
											>
											<template v-else
												><CommandItem
													v-for="key in fields"
													:key="key"
													:value="fieldLabels[key]"
													@select="showField(key)"
													>{{ fieldLabels[key] }}
													<span aria-hidden="true" class="ms-auto">›</span></CommandItem
												></template
											>
										</CommandGroup></CommandList
									>
								</Command>
							</PopoverContent>
						</Popover>
						<Popover>
							<PopoverTrigger
								:data-inbox-control="`${id}-display`"
								:class="tool"
								aria-keyshortcuts="Shift+V"
								:aria-label="t('显示选项', 'Display options')"
								:title="t('显示选项 (Shift+V)', 'Display options (Shift+V)')"
								><span aria-hidden="true">⚙</span></PopoverTrigger
							>
							<PopoverContent
								appearance="surface"
								align="end"
								role="dialog"
								:aria-label="t('显示选项', 'Display options')"
								class="grid max-h-[min(70svh,var(--reka-popover-content-available-height))] w-68 max-w-[calc(100vw-16px)] gap-2.5 overflow-y-auto text-xs"
							>
								<label class="flex items-center justify-between gap-3"
									>{{ t("启用优先收件箱", "Enable priority inbox")
									}}<Switch v-model="priorityInbox" size="sm"
								/></label>
								<template v-if="priorityInbox">
									<Button
										size="sm"
										variant="ghost"
										class="justify-between"
										:aria-expanded="priorityExpanded"
										:aria-controls="priorityExpanded ? `${id}-rules` : undefined"
										@click="priorityExpanded = !priorityExpanded"
										>{{ t("优先筛选", "Priority filter")
										}}<span aria-hidden="true">{{ priorityExpanded ? "−" : "+" }}</span></Button
									>
									<div
										v-if="priorityExpanded"
										:id="`${id}-rules`"
										class="grid gap-3 rounded-md border-[0.5px] border-border p-2"
									>
										<p class="text-muted-foreground">
											{{
												t(
													"符合任一来源或问题优先级的通知会进入「优先」。",
													"Notifications matching any source or issue priority go to Priority."
												)
											}}
										</p>
										<fieldset class="min-w-0">
											<legend class="mb-1 font-medium">
												{{ t("通知来源", "Notification sources") }}
											</legend>
											<div class="grid max-h-32 gap-2 overflow-y-auto p-0.5">
												<label
													v-for="source in sourceKeys"
													:key="source"
													class="flex items-center gap-2"
													><Checkbox
														:model-value="rules.sources.includes(source)"
														@update:model-value="
															rules.sources = toggleRule(rules.sources, source, $event === true)
														"
													/>{{ sourceLabel(source) }}</label
												>
											</div>
										</fieldset>
										<fieldset class="min-w-0">
											<legend class="mb-1 font-medium">
												{{ t("问题优先级", "Issue priorities") }}
											</legend>
											<div class="grid grid-cols-2 gap-2 p-0.5">
												<label
													v-for="level in priorities"
													:key="level"
													class="flex items-center gap-2"
													><Checkbox
														:model-value="rules.levels.includes(level)"
														@update:model-value="
															rules.levels = toggleRule(rules.levels, level, $event === true)
														"
													/>{{ issueLabel(level) }}</label
												>
											</div>
										</fieldset>
										<Button variant="outline" size="xs" @click="rules = defaultRules()">{{
											t("恢复优先默认规则", "Reset priority defaults")
										}}</Button>
									</div>
								</template>
								<label class="flex items-center justify-between gap-3"
									>{{ t("未读分组", "Group unreads by")
									}}<NativeSelect v-model="grouping" size="sm"
										><option value="none">{{ t("不分组", "No grouping") }}</option>
										<option value="focus">{{ t("专注", "Focus") }}</option></NativeSelect
									></label
								>
								<label class="flex items-center justify-between gap-3"
									>{{ t("排序", "Ordering")
									}}<NativeSelect v-model="order" size="sm"
										><option value="newest">{{ t("最新", "Newest") }}</option>
										<option value="oldest">{{ t("最早", "Oldest") }}</option>
										<option value="priority">{{ issueLabel("priority") }}</option></NativeSelect
									></label
								>
								<label class="flex items-center justify-between gap-3"
									>{{ t("显示已暂缓", "Show snoozed") }}<Switch v-model="showSnoozed" size="sm"
								/></label>
								<label class="flex items-center justify-between gap-3"
									>{{ t("未读优先", "Show unread first") }}<Switch v-model="unreadFirst" size="sm"
								/></label>
							</PopoverContent>
						</Popover>
					</div>
				</header>
				<Tabs
					v-model="priorityView"
					@update:model-value="
						selected = undefined;
						setActions(false);
					"
					class="min-h-0 flex-1 flex-col gap-0"
				>
					<TabsList
						v-if="priorityInbox"
						variant="capsule"
						:aria-label="t('通知视图', 'Notification views')"
						class="mx-3 my-2 h-7! w-fit! shrink-0"
					>
						<TabsTrigger value="priority"
							>{{ t("优先", "Priority") }}
							<span class="text-muted-foreground tabular-nums">{{
								unreadCounts.priority
							}}</span></TabsTrigger
						>
						<TabsTrigger value="other"
							>{{ t("其他", "Other") }}
							<span class="text-muted-foreground tabular-nums">{{
								unreadCounts.other
							}}</span></TabsTrigger
						>
					</TabsList>
					<div
						v-if="searchOpen"
						class="flex shrink-0 items-center gap-2 border-b-[0.5px] border-border px-3 py-2"
					>
						<Input
							:id="`${id}-search`"
							v-model="search"
							type="search"
							:aria-label="t('搜索通知', 'Search notifications')"
							:placeholder="t('搜索通知…', 'Search notifications…')"
							@keydown="
								(event: KeyboardEvent) => {
									if (event.key === 'Escape' && !event.isComposing) {
										event.preventDefault();
										closeSearch();
									}
								}
							"
						/><Button variant="ghost" size="sm" @click="closeSearch">{{
							t("关闭", "Close")
						}}</Button>
					</div>
					<div
						v-if="activeFields.length"
						role="group"
						:aria-label="t('当前筛选', 'Active filters')"
						class="flex max-h-32 shrink-0 flex-wrap gap-1.5 overflow-y-auto border-b-[0.5px] border-border px-3 py-2"
					>
						<div
							v-for="key in activeFields"
							:key="key"
							class="flex max-w-full items-center gap-0.5 rounded-md border-[0.5px] border-border ps-2 text-xs"
						>
							<span class="shrink-0 text-muted-foreground">{{ fieldLabels[key] }}</span>
							<Button variant="ghost" size="xs" class="shrink-0" @click="toggleExclusion(key)">{{
								filters[key]?.exclude ? t("不是", "Is not") : t("是", "Is")
							}}</Button>
							<Button
								variant="ghost"
								size="xs"
								class="min-w-0"
								:aria-label="`${fieldLabels[key]}: ${filters[key]?.values.map((value) => options[key].find(({ id }) => id === value)?.label).join(', ')}`"
								@click="editFilter(key)"
								><span class="truncate">{{
									filters[key]?.values
										.map((value) => options[key].find(({ id }) => id === value)?.label)
										.join(", ")
								}}</span></Button
							>
							<Button
								variant="ghost"
								size="icon-xs"
								:aria-label="`${t('移除筛选', 'Remove filter')} · ${fieldLabels[key]}`"
								@click="removeFilter(key)"
								>×</Button
							>
						</div>
					</div>
					<component
						:is="priorityInbox ? TabsContent : 'div'"
						:key="priorityView"
						v-bind="priorityInbox ? { value: priorityView } : {}"
						class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
						:class="priorityInbox && 'border-t-[0.5px] border-border'"
					>
						<template v-if="visible.length">
							<div v-for="{ label, items } in groups" :key="label">
								<h3
									v-if="label"
									class="border-b-[0.5px] border-border px-4 py-2 text-xs font-medium text-muted-foreground"
								>
									{{ label }}
								</h3>
								<ul>
									<li v-for="item in items" :key="item.id">
										<button
											type="button"
											:id="`${id}-${item.id}`"
											:data-notification="item.id"
											:aria-current="item.id === selected ? 'true' : undefined"
											:aria-keyshortcuts="shortcuts"
											class="grid min-h-15 w-full min-w-0 grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2.5 px-4 py-2.5 text-start transition-colors duration-150 hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-current:bg-accent motion-reduce:transition-none"
											@click="choose(item)"
											@keydown="onNoticeKey($event, item)"
										>
											<span class="relative" aria-hidden="true"
												><Avatar class="size-9"
													><AvatarFallback>{{ initials(item.sender) }}</AvatarFallback></Avatar
												><span
													class="absolute -end-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-background text-[10px] text-muted-foreground"
													>{{ eventGlyphs[item.type] ?? "•" }}</span
												></span
											>
											<span class="min-w-0"
												><span class="flex min-w-0 items-center gap-1.5 text-[13px] font-medium">
													<template v-if="item.unread"
														><span class="sr-only">{{ t("未读", "Unread") }}</span
														><span
															aria-hidden="true"
															class="size-1.5 shrink-0 rounded-full bg-primary"
													/></template>
													<span class="shrink-0 text-xs font-normal text-muted-foreground">{{
														item.issueId
													}}</span
													><span class="truncate">{{
														issueById.get(item.issueId)?.title
													}}</span> </span
												><span class="mt-0.5 block truncate text-xs text-muted-foreground"
													>{{ person(item.sender) }} {{ t(...item.summary) }}</span
												></span
											>
											<span class="flex flex-col items-end gap-0.5 text-xs text-muted-foreground"
												><IssueGlyph :value="issueById.get(item.issueId)!.status" /><span
													class="sr-only"
													>{{ issueLabel(issueById.get(item.issueId)!.status) }}</span
												><span
													><template v-if="isSnoozed(item)"
														><span aria-hidden="true">◷ </span
														><span class="sr-only">{{ t("已暂缓", "Snoozed") }}</span></template
													><time :datetime="item.created">{{
														date.format(new Date(item.created))
													}}</time></span
												></span
											>
										</button>
									</li>
								</ul>
							</div>
						</template>
						<div
							v-else
							class="m-auto flex flex-col items-center gap-2 p-4 text-[13px] text-muted-foreground"
						>
							<p role="status">
								{{
									unreadOnly ? t("没有未读通知", "No unreads") : t("没有通知", "No notifications")
								}}
							</p>
							<Button
								v-if="unreadOnly"
								variant="ghost"
								size="sm"
								@click="
									unreadOnly = false;
									element('unread')?.focus();
								"
								>{{ t("显示全部通知", "Show all notifications") }}</Button
							>
						</div>
					</component>
				</Tabs>
			</section>
			<section
				v-if="active && activeIssue"
				:aria-label="t('通知详情', 'Notification details')"
				:aria-keyshortcuts="shortcuts"
				class="flex h-[min(72svh,700px)] min-h-[360px] min-w-0 flex-col"
				@keydown="onDetailKey"
			>
				<header class="flex h-11 shrink-0 items-center gap-1 border-b-[0.5px] border-border px-3">
					<Button variant="ghost" size="sm" class="shrink-0 @min-[740px]/inbox:hidden" @click="back"
						><span aria-hidden="true">‹</span>{{ t("返回通知", "Back to Inbox") }}</Button
					>
					<span class="min-w-0 truncate text-xs text-muted-foreground"
						>{{ active.issueId }} · {{ sourceLabel(active.type) }}</span
					>
					<div class="ms-auto flex shrink-0 items-center gap-1">
						<Button
							variant="ghost"
							size="icon-xs"
							:disabled="!previous"
							:aria-label="t('上一条通知', 'Previous notification')"
							@click="previous && choose(previous)"
							><span aria-hidden="true">↑</span></Button
						>
						<Button
							variant="ghost"
							size="icon-xs"
							:disabled="!next"
							:aria-label="t('下一条通知', 'Next notification')"
							@click="next && choose(next)"
							><span aria-hidden="true">↓</span></Button
						>
					</div>
					<DropdownMenu :open="actionsOpen" :modal="false" @update:open="setActions">
						<DropdownMenuTrigger
							:class="[tool, 'shrink-0']"
							:aria-label="t('当前通知操作', 'Selected notification actions')"
							:title="t('当前通知操作', 'Selected notification actions')"
							><span aria-hidden="true">⋯</span></DropdownMenuTrigger
						>
						<DropdownMenuContent align="end" appearance="surface" class="w-48">
							<DropdownMenuItem @select="changeNotice(active!.id, { unread: !active!.unread })">{{
								active.unread ? t("标为已读", "Mark as read") : t("标为未读", "Mark as unread")
							}}</DropdownMenuItem>
							<DropdownMenuItem
								v-if="isSnoozed(active)"
								@select="changeNotice(active!.id, { snoozedUntil: undefined })"
								>{{ t("取消暂缓", "Unsnooze") }}</DropdownMenuItem
							>
							<DropdownMenuSub v-else v-model:open="snoozeOpen">
								<DropdownMenuSubTrigger>{{ t("暂缓", "Snooze") }}</DropdownMenuSubTrigger>
								<DropdownMenuSubContent appearance="surface" class="w-32"
									><DropdownMenuItem
										v-for="([minutes, zh, en], index) in snoozePresets"
										:key="minutes"
										:data-inbox-snooze="index === 0 ? id : undefined"
										@select="snooze(active!, minutes)"
										>{{ t(zh, en) }}</DropdownMenuItem
									></DropdownMenuSubContent
								>
							</DropdownMenuSub>
							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive" @select="remove(active!)">{{
								t("删除通知", "Delete notification")
							}}</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</header>
				<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
					<p class="mx-4 mt-4 text-xs text-muted-foreground sm:mx-8">
						{{ person(active.sender) }} {{ t(...active.summary) }}
					</p>
					<IssueDetail
						:key="activeIssue.id"
						embedded
						:chinese="chinese"
						:issue="activeIssue"
						:activity="activityOptions(activeIssue.id)"
						:heading-ref="setHeading"
						:assignees="people"
						:projects="projects"
						@update="updateIssue"
					/>
				</div>
			</section>
			<div
				v-else
				class="hidden place-content-center justify-items-center gap-3 p-4 text-[13px] text-muted-foreground @min-[740px]/inbox:grid"
			>
				<svg
					aria-hidden="true"
					class="size-24 opacity-75"
					viewBox="0 0 96 96"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path d="M20 31h56l12 31v16H8V62zM8 62h24l6 9h20l6-9h24" stroke-linejoin="round" />
				</svg>
				<p>{{ t("未选择通知", "No notification selected") }}</p>
			</div>
		</div>
	</section>
</template>
