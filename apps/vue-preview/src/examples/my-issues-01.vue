<script setup lang="ts">
import { Button, buttonVariants } from "@valar/vue-ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@valar/vue-ui/command";
import { Empty, EmptyTitle } from "@valar/vue-ui/empty";
import {
	IssueComposer,
	IssueGlyph,
	issueLabels,
	priorities,
	statuses,
	type IssueDraft,
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
import { computed, nextTick, ref, shallowRef, useId } from "vue";

const props = defineProps<{ chinese?: boolean }>();
const t = (zh: string, en: string) => (props.chinese ? zh : en);
const label = (key: keyof typeof issueLabels) => issueLabels[key][props.chinese ? 0 : 1];
const id = useId();
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
const viewer = computed(() => ({ id: "self", name: t("我", "Me") }));
const people = computed(() => [
	viewer.value,
	{ id: "mira", name: "Mira Chen" },
	{ id: "alex", name: "Alex Rivera" },
]);
const assignees = computed(() => people.value.map(({ id, name }) => ({ id, label: name })));
const projects = computed(() => [
	{ id: "documentation", label: t("组件文档整理", "Component documentation") },
	{ id: "performance", label: t("预览性能优化", "Preview performance") },
]);
const labelOptions = computed(() => [
	{ id: "accessibility", label: t("无障碍", "Accessibility") },
	{ id: "design", label: t("设计", "Design") },
	{ id: "bug", label: t("缺陷", "Bug") },
]);
const added = shallowRef<Issue[]>([]);
const edits = ref<Record<string, IssueDetailUpdate>>({});
const issues = computed<Issue[]>(() =>
	[
		...added.value,
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
	].map((issue) => ({ ...issue, ...edits.value[issue.id] }))
);
const activity = ref<Record<string, IssueCollaborationState>>({});
const view = ref<View>("assigned");
const filters = ref<Filters>({});
const field = ref<Field>();
const filterOpen = ref(false);
const grouping = ref("none");
const ordering = ref("created");
const hideCompleted = ref(false);
const selectedId = ref<string>();
const createOpen = ref(false);
let nextNumber = 104;
let createOpener: HTMLElement | null = null;
let heading: HTMLHeadingElement | null = null;
function setHeading(node: HTMLHeadingElement | null) {
	heading = node;
}
let rowOpener: string | null = null;
const selected = computed(() => issues.value.find(({ id }) => id === selectedId.value));
const viewIssues = computed(() =>
	issues.value.filter((issue) =>
		view.value === "assigned"
			? issue.assignee === viewer.value.id
			: view.value === "subscribed"
				? activity.value[issue.id]?.subscribers.some(({ id }) => id === viewer.value.id)
				: view.value === "created"
					? issue.created
					: issue.active
	)
);
const visible = computed(() =>
	viewIssues.value
		.filter(
			(issue) =>
				(!hideCompleted.value || issue.status !== "done") &&
				fields.every((field) => !filters.value[field] || filters.value[field] === issue[field])
		)
		.sort((left, right) =>
			ordering.value === "priority"
				? priorityOrder.indexOf(left.priority) - priorityOrder.indexOf(right.priority) ||
					right.number - left.number
				: right.number - left.number
		)
);
const groups = computed(() =>
	grouping.value === "status"
		? statuses
				.map((status) => ({
					status,
					items: visible.value.filter((issue) => issue.status === status),
				}))
				.filter(({ items }) => items.length)
		: [{ status: null, items: visible.value }]
);
const activeFields = computed(() => fields.filter((key) => filters.value[key]));

async function openDetails(issueId?: string, fromList = false) {
	if (!issueId) return;
	rowOpener = fromList ? issueId : null;
	selectedId.value = issueId;
	await nextTick();
	heading?.focus();
}

async function closeDetails() {
	selectedId.value = undefined;
	await nextTick();
	const opener = rowOpener && document.getElementById(`${id}-${rowOpener}`);
	const detail = document.querySelector<HTMLButtonElement>(`[id="${id}-detail"]`);
	(opener || (detail?.disabled ? document.getElementById(`${id}-create`) : detail))?.focus();
}

async function showField(next?: Field) {
	field.value = next;
	await nextTick();
	document.getElementById(`${id}-filter-input`)?.focus();
}

function setFilterOpen(open: boolean) {
	filterOpen.value = open;
	if (open) void showField();
}

function clearFilters(key?: Field, resetDisplay = false) {
	if (key) delete filters.value[key];
	else filters.value = {};
	if (resetDisplay) hideCompleted.value = false;
	document.querySelector<HTMLElement>(`[data-issue-filter="${id}"]`)?.focus();
}

function baseActivity(issueId: string): IssueCollaborationState {
	const author = people.value[1];
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
			people: people.value,
			subscribers,
			reactions,
			onAction: (action) => {
				activity.value[issueId] = applyIssueCollaborationAction(read(), action, viewer.value);
			},
		},
	};
}

function updateIssue(patch: IssueDetailUpdate) {
	const key = selectedId.value;
	if (key) edits.value[key] = { ...edits.value[key], ...patch };
}

function createIssue(draft: IssueDraft) {
	const number = nextNumber++;
	const issue = {
		...draft,
		number,
		id: `VLR-${number}`,
		assignee: viewer.value.id,
		created: true,
		active: true,
	};
	added.value = [issue, ...added.value];
	activity.value[issue.id] = {
		entries: [
			{
				kind: "event",
				id: `${issue.id}-created`,
				author: viewer.value,
				createdAt: new Date().toISOString(),
			},
		],
		subscribers: [viewer.value],
		reactions: [],
	};
	filters.value = {};
	view.value = "created";
}

function openCreate(event: MouseEvent) {
	createOpener = event.currentTarget as HTMLElement;
	createOpen.value = true;
}

function returnCreateFocus() {
	return createOpener?.isConnected ? createOpener : document.getElementById(`${id}-create`);
}
</script>

<template>
	<IssueDetail
		v-if="selected"
		:key="selected.id"
		:issue="selected"
		:chinese="chinese"
		:heading-ref="setHeading"
		:activity="activityOptions(selected.id)"
		:assignees="assignees"
		:projects="projects"
		:label-options="labelOptions"
		@back="closeDetails"
		@update="updateIssue"
	/>
	<section
		v-else
		:aria-label="t('我的问题', 'My issues')"
		class="min-w-0 rounded-[10px] border-[0.5px] border-border bg-card text-foreground"
	>
		<header
			class="flex min-h-11 flex-wrap items-center justify-between gap-1 border-b-[0.5px] border-border px-4"
		>
			<h2 class="text-[13px] font-semibold">{{ t("我的问题", "My issues") }}</h2>
			<Button :id="`${id}-create`" variant="ghost" size="sm" @click="openCreate"
				><span aria-hidden="true">+</span>{{ t("新建问题", "New issue") }}</Button
			>
		</header>
		<Tabs v-model="view" loop class="gap-0">
			<div class="flex flex-wrap items-center justify-between gap-2 p-2">
				<TabsList
					variant="capsule"
					:aria-label="t('问题视图', 'Issue views')"
					class="h-auto! w-fit! flex-wrap justify-start gap-1.5 bg-transparent! p-0!"
				>
					<TabsTrigger
						v-for="key in views"
						:key="key"
						:value="key"
						class="h-7! flex-none rounded-full! border-[0.5px] border-border bg-background px-2.5! text-xs! data-[state=active]:bg-accent!"
						>{{ viewLabels[key][chinese ? 0 : 1] }}</TabsTrigger
					>
				</TabsList>
				<div role="group" :aria-label="t('列表工具', 'List tools')" class="ms-auto flex gap-1.5">
					<Popover :open="filterOpen" @update:open="setFilterOpen">
						<PopoverTrigger
							:data-issue-filter="id"
							:class="tool"
							:aria-label="t('添加筛选', 'Add filter')"
							><span aria-hidden="true">≡</span></PopoverTrigger
						>
						<PopoverContent
							appearance="surface"
							align="end"
							role="dialog"
							:aria-label="t('筛选问题', 'Filter issues')"
							:class="[popup, 'p-0!']"
							@open-auto-focus.prevent="showField(field)"
						>
							<Button
								v-if="field"
								variant="ghost"
								size="sm"
								class="w-full justify-start"
								@click="showField()"
								><span aria-hidden="true">‹</span>{{ label(field) }}</Button
							>
							<Command :key="field ?? 'fields'" appearance="compact">
								<CommandInput
									:id="`${id}-filter-input`"
									:aria-label="t('搜索筛选项', 'Search filters')"
									:placeholder="t('搜索筛选项…', 'Search filters…')"
								/>
								<CommandList
									><CommandEmpty>{{ t("没有匹配的选项", "No matching options") }}</CommandEmpty
									><CommandGroup>
										<template v-if="field">
											<CommandItem
												v-for="option in options[field]"
												:key="option"
												:value="label(option)"
												:checked="filters[field] === option"
												@select="
													filters[field!] = option;
													filterOpen = false;
												"
												>{{ label(option) }}</CommandItem
											>
										</template>
										<template v-else>
											<CommandItem
												v-for="key in fields"
												:key="key"
												:value="label(key)"
												@select="showField(key)"
												>{{ label(key) }}
												<span aria-hidden="true" class="ms-auto">›</span></CommandItem
											>
										</template>
									</CommandGroup></CommandList
								>
							</Command>
						</PopoverContent>
					</Popover>
					<Popover>
						<PopoverTrigger :class="tool" :aria-label="t('显示选项', 'Display options')"
							><span aria-hidden="true">⚙</span></PopoverTrigger
						>
						<PopoverContent
							appearance="surface"
							align="end"
							role="dialog"
							:aria-label="t('显示选项', 'Display options')"
							:class="[popup, 'grid gap-2 text-xs']"
						>
							<label class="flex items-center justify-between gap-2"
								>{{ t("分组", "Grouping")
								}}<NativeSelect v-model="grouping" size="sm"
									><option value="none">{{ t("不分组", "No grouping") }}</option>
									<option value="status">{{ label("status") }}</option></NativeSelect
								></label
							>
							<label class="flex items-center justify-between gap-2"
								>{{ t("排序", "Ordering")
								}}<NativeSelect v-model="ordering" size="sm"
									><option value="created">{{ t("创建时间", "Created") }}</option>
									<option value="priority">{{ label("priority") }}</option></NativeSelect
								></label
							>
							<label class="flex items-center justify-between gap-2 border-t border-border pt-2"
								>{{ t("隐藏已完成的问题", "Hide completed issues")
								}}<Switch v-model="hideCompleted" size="sm"
							/></label>
						</PopoverContent>
					</Popover>
					<Button
						:id="`${id}-detail`"
						size="icon-sm"
						variant="outline"
						shape="pill"
						:aria-label="t('打开详情', 'Open details')"
						:disabled="!visible.length"
						@click="openDetails(visible[0]?.id)"
						><span aria-hidden="true">◫</span></Button
					>
				</div>
			</div>
			<div
				v-if="activeFields.length"
				:aria-label="t('当前筛选', 'Active filters')"
				role="group"
				class="mx-2 mb-2 flex flex-wrap items-center gap-1.5 rounded-lg border-[0.5px] border-border bg-accent p-2"
			>
				<div
					v-for="key in activeFields"
					:key="key"
					class="flex items-center rounded-md border-[0.5px] border-border bg-background ps-2 text-xs"
				>
					{{ label(key) }} <span class="px-1.5 text-muted-foreground">{{ t("是", "is") }}</span
					>{{ label(filters[key]!) }}
					<Button
						variant="ghost"
						size="icon-xs"
						:aria-label="t(`移除${label(key)}筛选`, `Remove ${label(key)} filter`)"
						@click="clearFilters(key)"
						>×</Button
					>
				</div>
				<Button
					variant="ghost"
					size="icon-xs"
					:aria-label="t('添加其他筛选', 'Add another filter')"
					@click="setFilterOpen(true)"
					>+</Button
				>
				<Button variant="ghost" size="xs" class="ms-auto" @click="clearFilters()">{{
					t("清除", "Clear")
				}}</Button>
			</div>
			<TabsContent :key="view" :value="view" class="min-h-[440px] min-w-0">
				<p role="status" class="sr-only">
					{{ t(`${visible.length} 个问题`, `${visible.length} issues`) }}
				</p>
				<template v-if="visible.length">
					<div v-for="{ status, items } in groups" :key="status ?? 'all'">
						<h3
							v-if="status"
							class="flex h-8 items-center gap-2 border-y-[0.5px] border-border bg-accent px-4 text-xs font-medium"
						>
							<IssueGlyph :value="status" />{{ label(status) }}
							<span class="text-muted-foreground">{{ items.length }}</span>
						</h3>
						<ul :aria-label="t('问题列表', 'Issue list')" class="divide-y-[0.5px] divide-border">
							<li v-for="issue in items" :key="issue.id">
								<button
									type="button"
									:id="`${id}-${issue.id}`"
									class="flex h-11 w-full min-w-0 items-center gap-2 rounded-lg px-4 text-start text-[13px] transition-colors duration-150 hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none"
									@click="openDetails(issue.id, true)"
								>
									<span class="sr-only">{{ label("priority") }}: {{ label(issue.priority) }}</span
									><IssueGlyph :value="issue.priority" />
									<span class="shrink-0 text-xs text-muted-foreground">{{ issue.id }}</span>
									<span class="sr-only">{{ label(issue.status) }}</span
									><IssueGlyph :value="issue.status" />
									<span class="truncate font-medium">{{ issue.title }}</span>
								</button>
							</li>
						</ul>
					</div>
				</template>
				<Empty
					v-else
					:appearance="viewIssues.length ? 'filtered-list' : 'issue-list'"
					class="min-h-[350px]"
				>
					<svg
						aria-hidden="true"
						class="size-24 text-muted-foreground"
						viewBox="0 0 96 96"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<ellipse cx="48" cy="43" rx="24" ry="30" stroke-dasharray="3 4" />
						<ellipse cx="48" cy="45" rx="39" ry="16" transform="rotate(-24 48 45)" />
						<ellipse cx="48" cy="45" rx="39" ry="16" transform="rotate(24 48 45)" />
						<circle cx="48" cy="45" r="6" />
					</svg>
					<EmptyTitle>{{
						viewIssues.length
							? t("没有符合条件的问题", "No issues matching the filters")
							: emptyLabels[view][chinese ? 0 : 1]
					}}</EmptyTitle>
					<Button
						v-if="viewIssues.length"
						size="sm"
						variant="ghost"
						@click="clearFilters(undefined, true)"
						>{{ t("重置筛选和显示选项", "Reset filters and display") }}</Button
					>
					<Button v-else size="sm" @click="openCreate">{{
						t("创建新问题", "Create new issue")
					}}</Button>
				</Empty>
			</TabsContent>
		</Tabs>
		<IssueComposer
			v-model:open="createOpen"
			:chinese="chinese"
			:return-focus="returnCreateFocus"
			@create="createIssue"
		/>
	</section>
</template>
