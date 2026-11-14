<script lang="ts">
	import { tick } from "svelte";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as Item from "$lib/registry/ui/item/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
	import { IssueComposer, type IssueDraft } from "$lib/registry/ui/issue-composer/index.js";
	import {
		IssueDetail,
		applyIssueActivityAction,
		applyIssueCollaborationAction,
		type IssueActivityAction,
		type IssueActivityEntry,
		type IssueActivityOptions,
		type IssueCollaborationState,
		type IssueDetailUpdate,
	} from "$lib/registry/ui/issue-detail/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";
	import { labels, makeSampleIssues, priorities, statuses, views, type Issue } from "./data.js";

	let { chinese = false }: { chinese?: boolean } = $props();
	const id = $props.id();
	const portal = { to: `[id="${id}"]` };
	const fields = ["status", "priority"] as const;
	type FilterField = (typeof fields)[number];
	type Label = keyof typeof labels;
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const label = (key: Label) => labels[key][chinese ? 0 : 1];
	const options = { status: statuses, priority: priorities };
	const emptyMessages = {
		assigned: ["没有分配给你的问题", "No issues assigned to you"],
		created: ["你还没有创建问题", "No issues created by you"],
		subscribed: ["你还没有订阅问题", "No issues you are subscribed to"],
		activity: ["没有与你的活动相关的问题", "No issues with activity from you"],
	} as const;
	const statusColors = {
		backlog: "border-dashed border-current",
		todo: "border-current",
		progress:
			"border-amber-500 bg-[linear-gradient(90deg,var(--color-amber-500)_50%,transparent_50%)]",
		done: "border-indigo-500 bg-indigo-500 text-white",
		canceled: "border-current",
	};
	const tokens = `
		--issue-panel: light-dark(lch(97.94% .5 282), lch(5.52% .4 272));
		--issue-control: light-dark(white, lch(10.149% .593 272));
		--issue-selected: light-dark(lch(93.483% .5 282), lch(16.706% .979 272));
		--issue-hover: light-dark(lch(94.854% .5 282), lch(14.006% .593 272));
		--issue-accent: light-dark(lch(53% 52.26 286.91), lch(47.918% 59.303 288.421));
		--foreground: light-dark(lch(9.794% 0 282), white);
		--muted-foreground: light-dark(lch(39.176% 1.25 282), lch(61.803% 1.2 272));
		--border: light-dark(lch(92.5% 0 282), lch(18.5% .85 272));
		--popover: light-dark(white, lch(16.433% 1.3 272));
		--popover-foreground: var(--foreground);
		--accent: var(--issue-hover);
		--accent-foreground: var(--foreground);
		--ring: var(--issue-accent);
	`;
	const iconButton =
		"size-7 rounded-full border-border bg-(--issue-control) p-0 text-muted-foreground shadow-none hover:bg-(--issue-hover) aria-expanded:bg-(--issue-selected) aria-pressed:bg-(--issue-selected) [&_svg]:size-3.5";
	const popup = "gap-0";

	let view = $state("assigned");
	const activeView = $derived(views.find((key) => key === view) ?? "assigned");
	let filters = $state<Partial<Record<FilterField, Label>>>({});
	let filterField = $state<FilterField>();
	let filterOpen = $state(false);
	let filterInput = $state<HTMLInputElement | null>(null);
	let filterTrigger = $state<HTMLButtonElement | null>(null);
	let grouping = $state("none");
	let ordering = $state("created");
	let hideCompleted = $state(false);
	let detailHeading = $state<HTMLHeadingElement | null>(null);
	let detailTrigger = $state<HTMLButtonElement | null>(null);
	let openedFromList = false;
	let selectedId = $state<string>();
	let createOpen = $state(false);
	let createButton = $state<HTMLButtonElement | null>(null);
	let createOpener: HTMLElement | null = null;
	let nextIssueNumber = 104;
	let added = $state<Issue[]>([]);
	let activityByIssue = $state<Record<string, IssueCollaborationState>>({});
	const viewer = $derived({ id: "self", name: text("我", "Me") });

	let edits = $state<Record<string, IssueDetailUpdate>>({});
	const issues = $derived(
		[...added, ...makeSampleIssues(chinese)].map((issue) => {
			const edit = edits[issue.id];
			if (!edit) return issue;
			const next = { ...issue, ...edit };
			if ("assignee" in edit) {
				next.views = issue.views.filter((key) => key !== "assigned");
				if (next.assignee === "self") next.views.push("assigned");
			}
			return next;
		})
	);
	const assignees = $derived([
		{ id: "self", label: text("我", "Me") },
		{ id: "mira", label: "Mira Chen" },
		{ id: "alex", label: "Alex Rivera" },
	]);
	const subscriberPeople = $derived(assignees.map(({ id, label }) => ({ id, name: label })));
	const projects = $derived([
		{ id: "documentation", label: text("组件文档整理", "Component documentation") },
		{ id: "performance", label: text("预览性能优化", "Preview performance") },
	]);
	const labelOptions = $derived([
		{ id: "accessibility", label: text("无障碍", "Accessibility") },
		{ id: "design", label: text("设计", "Design") },
		{ id: "bug", label: text("缺陷", "Bug") },
	]);
	const viewIssues = $derived(
		issues.filter((issue) =>
			activeView === "subscribed"
				? activityByIssue[issue.id]?.subscribers.some((person) => person.id === viewer.id)
				: issue.views.includes(activeView)
		)
	);
	const visible = $derived.by(() => {
		const result = viewIssues.filter(
			(issue) =>
				(!filters.status || issue.status === filters.status) &&
				(!filters.priority || issue.priority === filters.priority) &&
				(!hideCompleted || issue.status !== "done")
		);
		return ordering === "priority"
			? result.sort((a, b) => priorities.indexOf(a.priority) - priorities.indexOf(b.priority))
			: result;
	});
	const selected = $derived(issues.find((issue) => issue.id === selectedId));
	const hasFilters = $derived(fields.some((field) => !!filters[field]));
	const groupingItems = $derived([
		{ value: "none", label: text("不分组", "No grouping") },
		{ value: "status", label: label("status") },
	]);
	const orderingItems = $derived([
		{ value: "created", label: text("创建时间", "Created") },
		{ value: "priority", label: label("priority") },
	]);

	async function showField(field?: FilterField) {
		filterField = field;
		await tick();
		filterInput?.focus();
	}

	function openCreate(opener: EventTarget | null) {
		createOpener = opener instanceof HTMLElement ? opener : null;
		createOpen = true;
	}

	async function openDetails(issue: Issue, fromList: boolean) {
		openedFromList = fromList;
		selectedId = issue.id;
		await tick();
		detailHeading?.focus();
	}

	async function closeDetails() {
		const row = id + "-row-" + selectedId;
		selectedId = undefined;
		await tick();
		const fallback = detailTrigger?.disabled ? createButton : detailTrigger;
		const opener = openedFromList ? document.getElementById(row) : fallback;
		(opener ?? fallback ?? createButton)?.focus();
	}

	function getActivity(issueId: string): readonly IssueActivityEntry[] {
		const author = { id: "mira", name: "Mira Chen" };
		const created: IssueActivityEntry = {
			kind: "event",
			id: issueId + "-created",
			author,
			createdAt: "2026-11-11T09:00:00Z",
		};
		if (issueId !== "VLR-103") return [created];
		return [
			created,
			{
				kind: "comment",
				id: issueId + "-first-comment",
				author,
				createdAt: "2026-11-11T10:00:00Z",
				body: text(
					"建议把键盘导航和焦点恢复一起验收。",
					"Let's verify keyboard navigation and focus recovery together."
				),
				replies: [],
			},
		];
	}

	function getActivityOptions(issueId: string): IssueActivityOptions {
		const read = (): IssueCollaborationState =>
			activityByIssue[issueId] ?? {
				entries: getActivity(issueId),
				subscribers:
					issueId === "VLR-103" ? subscriberPeople.filter(({ id }) => id === "mira") : [],
				reactions: [],
			};
		const { entries, subscribers, reactions } = read();
		return {
			entries,
			viewer,
			onAction: (action: IssueActivityAction) => {
				const state = read();
				activityByIssue[issueId] = {
					...state,
					entries: applyIssueActivityAction(state.entries, action, viewer),
				};
			},
			collaboration: {
				subscribers,
				reactions,
				people: subscriberPeople,
				onAction: (action) => {
					activityByIssue[issueId] = applyIssueCollaborationAction(read(), action, viewer);
				},
			},
		};
	}

	function updateIssue(issueId: string, update: IssueDetailUpdate) {
		edits[issueId] = { ...edits[issueId], ...update };
	}

	function createIssue(draft: IssueDraft) {
		const issue: Issue = {
			...draft,
			id: `VLR-${nextIssueNumber++}`,
			views: ["created", "assigned", "activity"],
			assignee: "self",
		};
		added = [issue, ...added];
		activityByIssue[issue.id] = {
			entries: [
				{
					kind: "event",
					id: issue.id + "-created",
					author: viewer,
					createdAt: new Date().toISOString(),
				},
			],
			subscribers: [viewer],
			reactions: [],
		};
		filters = {};
		view = "created";
	}
</script>

{#snippet statusGlyph(status: Issue["status"], decorative = false)}
	<span
		class="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border text-[9px] leading-none {statusColors[
			status
		]}"
		role="img"
		aria-label={label(status)}
		aria-hidden={decorative}
	>
		{#if status === "done"}✓{/if}
		{#if status === "canceled"}×{/if}
	</span>
{/snippet}

{#snippet priorityGlyph(priority: Issue["priority"])}
	<span
		role="img"
		aria-label={`${label("priority")}: ${label(priority)}`}
		class="inline-flex size-4 shrink-0 items-end justify-center gap-px pb-0.5 text-xs leading-none text-muted-foreground"
	>
		{#if priority === "urgent"}
			<span class="font-bold text-red-600 dark:text-red-400">!</span>
		{:else if priority === "none"}
			<span>–</span>
		{:else}
			{@const level = 4 - priorities.indexOf(priority)}
			<span class="h-[5px] w-[3px] rounded-xs bg-current"></span>
			<span class="h-2 w-[3px] rounded-xs bg-current" class:opacity-30={level < 2}></span>
			<span class="h-[11px] w-[3px] rounded-xs bg-current" class:opacity-30={level < 3}></span>
		{/if}
	</span>
{/snippet}

{#snippet issueRows(items: Issue[])}
	<ul aria-label={text("问题列表", "Issue list")} class="divide-y divide-border">
		{#each items as issue (issue.id)}
			<li>
				<Item.Root appearance="issue-row">
					{#snippet child({ props })}
						<button
							{...props}
							type="button"
							id={id + "-row-" + issue.id}
							onclick={() => openDetails(issue, true)}
						>
							<Item.Media>{@render priorityGlyph(issue.priority)}</Item.Media>
							<Item.Content>
								<Item.Description>{issue.id}</Item.Description>
								{@render statusGlyph(issue.status)}
								<Item.Title>{issue.title}</Item.Title>
							</Item.Content>
						</button>
					{/snippet}
				</Item.Root>
			</li>
		{/each}
	</ul>
{/snippet}

{#if selected}
	{#key selected.id}
		<IssueDetail
			issue={selected}
			activity={getActivityOptions(selected.id)}
			{chinese}
			{assignees}
			{projects}
			{labelOptions}
			bind:headingRef={detailHeading}
			onBack={closeDetails}
			onUpdate={(update) => updateIssue(selected!.id, update)}
		/>
	{/key}
{:else}
	<div
		{id}
		style={tokens}
		class="rounded-[10px] border border-border bg-(--issue-panel) text-foreground [color-scheme:light] shadow-sm dark:[color-scheme:dark]"
	>
		<div
			class="flex min-h-11 flex-wrap items-center justify-between gap-1 border-b border-border px-4 py-1"
		>
			<h2 class="text-[13px] font-semibold">{text("我的问题", "My issues")}</h2>
			<Button
				bind:ref={createButton}
				size="sm"
				variant="ghost"
				class="h-7 px-2 text-xs font-medium text-muted-foreground hover:bg-(--issue-hover)"
				onclick={(event) => openCreate(event.currentTarget)}
			>
				<span aria-hidden="true" class="text-base leading-none">+</span>
				{text("新建问题", "New issue")}
			</Button>
		</div>
		<Tabs.Root bind:value={view} class="gap-0">
			<div class="flex min-h-11 flex-wrap items-center justify-between gap-2 px-2 py-2">
				<Tabs.List
					aria-label={text("问题视图", "Issue views")}
					class="h-auto min-w-0 flex-wrap justify-start gap-1.5 rounded-none bg-transparent p-0"
				>
					{#each views as key (key)}
						<Tabs.Trigger
							value={key}
							class="h-7 flex-none rounded-full border border-border bg-(--issue-control) px-2.5 text-xs font-medium text-muted-foreground shadow-none transition-colors duration-150 hover:bg-(--issue-hover) focus-visible:ring-0 motion-reduce:transition-none data-active:border-transparent data-active:bg-(--issue-selected) data-active:text-foreground data-active:hover:bg-(--issue-selected) dark:data-active:border-transparent dark:data-active:bg-(--issue-selected)"
						>
							{label(key)}
						</Tabs.Trigger>
					{/each}
				</Tabs.List>
				<div role="group" aria-label={text("列表工具", "List tools")} class="ms-auto flex gap-1.5">
					<Popover.Root
						bind:open={filterOpen}
						onOpenChange={(open) => {
							if (open) filterField = undefined;
						}}
					>
						<Popover.Trigger
							bind:ref={filterTrigger}
							aria-label={text("添加筛选", "Add filter")}
							class={buttonVariants({
								variant: "outline",
								size: "icon-sm",
								shape: "pill",
								class: iconButton,
							})}
						>
							<IconPlaceholder
								lucide="ListFilterIcon"
								tabler="IconFilterPlus"
								hugeicons="AddToListIcon"
								phosphor="ListPlusIcon"
								remixicon="RiAddBoxLine"
								aria-hidden="true"
							/>
						</Popover.Trigger>
						<Popover.Content
							appearance="surface"
							portalProps={portal}
							align="end"
							role="dialog"
							aria-label={text("筛选问题", "Filter issues")}
							class="w-[208px] max-w-[calc(100vw-2rem)] p-0 {popup}"
						>
							{#if filterField}
								<Button
									variant="ghost"
									size="sm"
									class="h-8 w-full justify-start rounded-b-none border-b px-3 text-xs"
									onclick={() => showField()}
								>
									<span aria-hidden="true">‹</span>
									{label(filterField)}
								</Button>
							{/if}
							{#key filterField}
								<Command.Root appearance="compact">
									<Command.Input
										bind:ref={filterInput}
										aria-label={text("搜索筛选项", "Search filters")}
										placeholder={text("搜索筛选项…", "Search filters…")}
									/>
									<Command.List>
										<Command.Empty>{text("没有匹配的选项", "No matching options")}</Command.Empty>
										<Command.Group>
											{#if filterField}
												{@const field = filterField}
												{#each options[field] as option (option)}
													<Command.Item
														value={label(option)}
														data-checked={filters[field] === option}
														onSelect={() => {
															filters[field] = option;
															filterOpen = false;
														}}
													>
														{label(option)}
													</Command.Item>
												{/each}
											{:else}
												{#each fields as field (field)}
													<Command.Item
														value={label(field)}
														class="justify-between"
														onSelect={() => showField(field)}
													>
														{label(field)}
														<Command.Shortcut aria-hidden="true">›</Command.Shortcut>
													</Command.Item>
												{/each}
											{/if}
										</Command.Group>
									</Command.List>
								</Command.Root>
							{/key}
						</Popover.Content>
					</Popover.Root>
					<Popover.Root>
						<Popover.Trigger
							aria-label={text("显示选项", "Display options")}
							class={buttonVariants({
								variant: "outline",
								size: "icon-sm",
								shape: "pill",
								class: iconButton,
							})}
						>
							<IconPlaceholder
								lucide="Settings2Icon"
								tabler="IconSettings"
								hugeicons="Settings05Icon"
								phosphor="GearIcon"
								remixicon="RiSettingsLine"
								aria-hidden="true"
							/>
						</Popover.Trigger>
						<Popover.Content
							appearance="surface"
							portalProps={portal}
							align="end"
							role="dialog"
							aria-label={text("显示选项", "Display options")}
							class="w-[300px] max-w-[calc(100vw-2rem)] p-3 {popup}"
						>
							<Field.Group class="gap-2">
								<Field.Field orientation="horizontal" class="items-center justify-between">
									<Field.Label for="{id}-grouping" class="text-xs font-normal"
										>{text("分组", "Grouping")}</Field.Label
									>
									<Select.Root type="single" items={groupingItems} bind:value={grouping}>
										<Select.Trigger id="{id}-grouping" size="sm" class="h-6 min-w-25 text-xs"
											><Select.Value /></Select.Trigger
										>
										<Select.Content portalProps={portal}
											>{#each groupingItems as item (item.value)}<Select.Item
													{...item}
												/>{/each}</Select.Content
										>
									</Select.Root>
								</Field.Field>
								<Field.Field orientation="horizontal" class="items-center justify-between">
									<Field.Label for="{id}-ordering" class="text-xs font-normal"
										>{text("排序", "Ordering")}</Field.Label
									>
									<Select.Root type="single" items={orderingItems} bind:value={ordering}>
										<Select.Trigger id="{id}-ordering" size="sm" class="h-6 min-w-25 text-xs"
											><Select.Value /></Select.Trigger
										>
										<Select.Content portalProps={portal}
											>{#each orderingItems as item (item.value)}<Select.Item
													{...item}
												/>{/each}</Select.Content
										>
									</Select.Root>
								</Field.Field>
								<Field.Field
									orientation="horizontal"
									class="items-center justify-between border-t pt-2"
								>
									<Field.Label for="{id}-completed" class="text-xs font-normal"
										>{text("隐藏已完成的问题", "Hide completed issues")}</Field.Label
									>
									<Switch id="{id}-completed" size="sm" bind:checked={hideCompleted} />
								</Field.Field>
							</Field.Group>
						</Popover.Content>
					</Popover.Root>
					<Button
						size="icon-sm"
						variant="outline"
						shape="pill"
						class={iconButton}
						bind:ref={detailTrigger}
						aria-label={text("打开详情", "Open details")}
						disabled={!visible.length}
						onclick={() => {
							if (visible[0]) void openDetails(visible[0], false);
						}}
					>
						<IconPlaceholder
							lucide="PanelLeftIcon"
							tabler="IconLayoutSidebar"
							hugeicons="SidebarLeftIcon"
							phosphor="SidebarIcon"
							remixicon="RiSideBarLine"
							class="rotate-180"
							aria-hidden="true"
						/>
					</Button>
				</div>
			</div>
			{#if hasFilters}
				<div
					class="mx-2 mb-2 flex min-h-11 flex-wrap items-center gap-1.5 rounded-[8px] border border-border bg-(--issue-selected) p-2"
				>
					{#each fields as field (field)}
						{@const option = filters[field]}
						{#if option}
							<div
								class="inline-flex h-6 max-w-full items-center divide-x divide-border rounded-[7px] border border-border bg-(--issue-control) text-xs"
							>
								<span class="px-1.5">{label(field)}</span><span class="px-1.5 text-muted-foreground"
									>{text("是", "is")}</span
								><span class="px-1.5">{label(option)}</span>
								<Button
									variant="ghost"
									size="icon-xs"
									class="size-5 rounded-s-none"
									aria-label={text(`移除${label(field)}筛选`, `Remove ${label(field)} filter`)}
									onclick={() => {
										delete filters[field];
										filterTrigger?.focus();
									}}>×</Button
								>
							</div>
						{/if}
					{/each}
					<Button
						variant="ghost"
						size="icon-xs"
						aria-label={text("添加其他筛选", "Add another filter")}
						onclick={() => {
							filterField = undefined;
							filterOpen = true;
						}}>+</Button
					>
					<Button
						variant="ghost"
						size="sm"
						class="ms-auto h-6 text-xs"
						onclick={() => {
							filters = {};
							filterTrigger?.focus();
						}}>{text("清除", "Clear")}</Button
					>
				</div>
			{/if}
			{#each views as key (key)}
				<Tabs.Content value={key} class="min-w-0">
					<div class="min-h-[440px] min-w-0">
						<div class="flex min-w-0 flex-col">
							<p class="sr-only" aria-live="polite">
								{text(`${visible.length} 个问题`, `${visible.length} issues`)}
							</p>
							{#if visible.length}
								{#if grouping === "status"}
									{#each statuses as status (status)}
										{@const group = visible.filter((issue) => issue.status === status)}
										{#if group.length}
											<section aria-label={label(status)}>
												<h3
													class="flex h-8 items-center gap-2 border-y border-border bg-(--issue-selected) px-4 text-xs font-medium"
												>
													{@render statusGlyph(status, true)}
													{label(status)} <span class="text-muted-foreground">{group.length}</span>
												</h3>
												{@render issueRows(group)}
											</section>
										{/if}
									{/each}
								{:else}
									{@render issueRows(visible)}
								{/if}
							{:else}
								<Empty.Root
									appearance={viewIssues.length ? "filtered-list" : "issue-list"}
									class="min-h-[350px] px-4 py-10"
								>
									<div aria-hidden="true" class="relative h-28 w-40 text-muted-foreground">
										<span
											class="absolute top-1 left-1/2 h-9 w-15 -translate-x-1/2 rounded-[50%] border-t-4 border-double border-current"
										></span>
										<span
											class="absolute top-6 left-1/2 h-8 w-12 -translate-x-1/2 rounded-[50%] border-4 border-double border-current"
										></span>
										<span
											class="absolute top-9 left-1/2 h-10 w-12 -translate-x-1/2 rounded-[50%] border-b-2 border-dashed border-current opacity-25"
										></span>
										<span
											class="absolute bottom-4 left-1/2 h-9 w-15 -translate-x-1/2 rounded-[50%] border-b-4 border-double border-current"
										></span>
										<span
											class="absolute bottom-0.5 left-1/2 h-9 w-15 -translate-x-1/2 rounded-[50%] border-b-4 border-double border-current opacity-30"
										></span>
										<span
											class="absolute top-9 left-1 size-7 rotate-45 rounded-bl-[10px] border-b-4 border-l-4 border-double border-current"
										></span>
										<span
											class="absolute top-9 right-1 size-7 -rotate-45 rounded-br-[10px] border-r-4 border-b-4 border-double border-current"
										></span>
										<span
											class="absolute bottom-6 left-1 size-7 rotate-45 rounded-bl-[10px] border-b-4 border-l-4 border-double border-current opacity-25"
										></span>
										<span
											class="absolute right-1 bottom-6 size-7 -rotate-45 rounded-br-[10px] border-r-4 border-b-4 border-double border-current opacity-25"
										></span>
									</div>
									<Empty.Header>
										<Empty.Title
											>{viewIssues.length
												? text("没有符合条件的问题", "No issues matching the filters")
												: emptyMessages[key][chinese ? 0 : 1]}</Empty.Title
										>
									</Empty.Header>
									<Empty.Content>
										{#if viewIssues.length}
											<Button
												variant="ghost"
												size="sm"
												shape="pill"
												onclick={() => {
													filters = {};
													hideCompleted = false;
													filterTrigger?.focus();
												}}>{text("重置筛选和显示选项", "Reset filters and display")}</Button
											>
										{:else}
											<Button
												size="sm"
												shape="pill"
												class="h-7 bg-(--issue-accent) px-2.5 text-xs text-white hover:bg-(--issue-accent)/90"
												onclick={(event) => openCreate(event.currentTarget)}
												>{text("创建新问题", "Create new issue")}</Button
											>
										{/if}
									</Empty.Content>
								</Empty.Root>
							{/if}
						</div>
					</div>
				</Tabs.Content>
			{/each}
		</Tabs.Root>
		<IssueComposer
			bind:open={createOpen}
			{chinese}
			onCreate={createIssue}
			returnFocus={() => (createOpener?.isConnected ? createOpener : createButton)}
		/>
	</div>
{/if}
