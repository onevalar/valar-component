<script lang="ts">
	import { tick } from "svelte";
	import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { dateLabel, DatePicker } from "$lib/registry/ui/date-picker/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";
	import ProjectBoard from "./project-board.svelte";
	import ProjectComposer from "./project-composer.svelte";
	import ProjectPicker from "./project-picker.svelte";
	import ProjectTimeline from "./project-timeline.svelte";
	import {
		people,
		priorities,
		sampleProjects,
		statuses,
		teams,
		type Option,
		type Project,
		type ProjectDraft,
		type Milestone,
		type Status,
	} from "./data.js";
	import {
		canAddDependency,
		dependencyDates,
		type ProjectDependencies,
	} from "./project-dependencies.js";
	import {
		defaultViewOptions,
		fields,
		loadSavedViews,
		storeSavedViews,
		type FilterField as Field,
		type Order,
		type SavedView,
		type ViewOptions,
	} from "./project-views.js";
	import type { TimelineScale } from "./timeline-model.js";

	let {
		chinese = false,
		empty = false,
		singleTeam = false,
	}: {
		chinese?: boolean;
		empty?: boolean;
		singleTeam?: boolean;
	} = $props();

	const id = $props.id();
	const portal = { to: '[id="' + id + '"]' };
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const localized = (entry: { zh: string; en: string }) => (chinese ? entry.zh : entry.en);
	const columns = ["name", "health", "priority", "lead", "target", "issues", "status"] as const;
	type Column = (typeof columns)[number];
	const orderColumns: readonly Column[] = ["name", "priority", "target", "status"];
	const labels = {
		status: ["状态", "Status"],
		priority: ["优先级", "Priority"],
		lead: ["负责人", "Lead"],
		team: ["所属团队", "Lead team"],
		name: ["名称", "Name"],
		health: ["健康度", "Health"],
		target: ["目标日期", "Target date"],
		issues: ["问题", "Issues"],
	} as const;
	const label = (key: keyof typeof labels) => labels[key][chinese ? 0 : 1];
	const iconButton = "cn-toolbar-icon";
	const tokens = `
		--project-panel: light-dark(lch(97.94% .5 282), lch(5.52% .4 272));
		--project-dialog: light-dark(white, lch(9.232% .85 272));
		--project-control: light-dark(white, lch(13.861% 1.139 272));
		--project-placeholder: light-dark(lch(57% 1.25 282), lch(49% 1.2 272));
		--project-accent: light-dark(lch(53% 52.26 286.91), lch(47.918% 59.303 288.421));
		--foreground: light-dark(lch(9.794% 0 282), white);
		--muted-foreground: light-dark(lch(39.176% 1.25 282), lch(61.803% 1.2 272));
		--border: light-dark(lch(92.5% 0 282), lch(22% .85 272));
		--popover: light-dark(white, lch(16.433% 1.3 272));
		--popover-foreground: var(--foreground);
		--accent: light-dark(lch(93.9% .5 282), lch(19% .979 272));
		--accent-foreground: var(--foreground);
		--muted: var(--accent);
		--ring: var(--project-accent);
	`;

	let created = $state<Project[]>([]);
	let view = $state("list");
	let showEmpty = $state(true);
	let timelineScale = $state<TimelineScale>("month");
	let showProjectList = $state(true);
	let showWeekNumbers = $state(false);
	let showMilestones = $state(true);
	let showDependencies = $state(true);
	let dependencies = $state<ProjectDependencies>({});
	let savedViews = $state<SavedView[]>([]);
	let selectedViewId = $state("all");
	let saveViewOpen = $state(false);
	let viewName = $state("");
	let viewNameError = $state("");
	const viewStorageKey = $derived(
		"valar.projects.views.v1." + (empty ? "empty" : singleTeam ? "single" : "sample")
	);

	type ProjectChanges = Partial<Pick<Project, "status" | "start" | "target" | "milestones">>;
	let projectChanges = $state<Record<string, ProjectChanges>>({});
	let order = $state<Order>();
	let descending = $state(false);
	let filterOpen = $state(false);
	let displayOpen = $state(false);
	let toolbar: HTMLDivElement;
	let filterTrigger = $state<HTMLButtonElement | null>(null);
	let displayTrigger = $state<HTMLButtonElement | null>(null);
	let filterField = $state<Field>();
	let filterSearch = $state<HTMLInputElement | null>(null);
	let filters = $state<Partial<Record<Field, string[]>>>({});
	let projectOpen = $state(false);
	let initialStatus = $state<Status>("backlog");
	let mainCreateButton = $state<HTMLButtonElement | null>(null);
	let opener: HTMLElement | null = null;
	let details = $state<string>();
	let nextProject = 0;

	const teamOptions = $derived(
		(singleTeam ? teams.slice(0, 1) : teams).map((team) => ({
			id: team.id,
			label: localized(team),
		}))
	);
	const leadOptions = $derived(
		people
			.filter((person) => teamOptions.some((team) => team.id === person.team))
			.map((person) => ({
				id: person.id,
				team: person.team,
				label: person.name,
				detail: person.initials,
			}))
	);
	const options: Record<Field, readonly Option[]> = $derived({
		status: statuses.map((entry) => ({
			id: entry.id,
			label: localized(entry),
			color: entry.color,
		})),
		priority: priorities.map((entry) => ({ id: entry.id, label: localized(entry) })),
		lead: [{ id: "", label: text("无负责人", "No lead") }, ...leadOptions],
		team: teamOptions,
	});
	const projects = $derived(
		[
			...created,
			...(empty
				? []
				: sampleProjects(chinese).filter((project) =>
						teamOptions.some((team) => team.id === project.teams[0])
					)),
		].map((project) => ({ ...project, ...projectChanges[project.id] }))
	);
	const activeFields = $derived(fields.filter((field) => filters[field]?.length));
	const visible = $derived.by(() => {
		const result = projects.filter((project) =>
			activeFields.every((field) =>
				filters[field]?.includes(field === "team" ? project.teams[0] : project[field])
			)
		);
		const key = order;
		if (!key) return result;
		return [...result].sort((a, b) => {
			const direction = descending ? -1 : 1;
			if (key === "name") return direction * a.name.localeCompare(b.name);
			if (key === "priority") {
				const rank = (project: Project) =>
					project.priority === "none"
						? priorities.length
						: priorities.findIndex((item) => item.id === project.priority);
				return direction * (rank(a) - rank(b));
			}
			if (key === "status")
				return (
					direction *
					(statuses.findIndex((item) => item.id === a.status) -
						statuses.findIndex((item) => item.id === b.status))
				);
			if (!a.target || !b.target) return Number(!a.target) - Number(!b.target);
			return direction * a.target.date.localeCompare(b.target.date);
		});
	});
	const selectedProject = $derived(visible.find((project) => project.id === details));
	const views = $derived([
		{ value: "all", label: text("所有项目", "All projects") },
		...savedViews.map(({ id, name }) => ({ value: id, label: name })),
	]);

	$effect(() => {
		savedViews = loadSavedViews(viewStorageKey);
		selectedViewId = "all";
	});

	function applyView(id: string) {
		const saved = savedViews.find((item) => item.id === id) ?? defaultViewOptions;
		selectedViewId = id;
		view = saved.view;
		filters = $state.snapshot(saved.filters);
		order = saved.order;
		descending = saved.descending;
		timelineScale = saved.timelineScale;
		showEmpty = saved.showEmpty;
		showProjectList = saved.showProjectList;
		showWeekNumbers = saved.showWeekNumbers;
		showMilestones = saved.showMilestones;
		showDependencies = saved.showDependencies;
		details = undefined;
	}

	function saveView(event: SubmitEvent) {
		event.preventDefault();
		const name = viewName.trim();
		if (!name) {
			viewNameError = text("请输入视图名称。", "Enter a view name.");
			return;
		}
		if (views.some((item) => item.label.toLowerCase() === name.toLowerCase())) {
			viewNameError = text("已有同名视图。", "A view already uses this name.");
			return;
		}
		const options: ViewOptions = {
			view,
			filters: $state.snapshot(filters),
			order,
			descending,
			timelineScale,
			showEmpty,
			showProjectList,
			showWeekNumbers,
			showMilestones,
			showDependencies,
		};
		const saved = { id: crypto.randomUUID(), name, ...options };
		savedViews = [...savedViews, saved];
		storeSavedViews(viewStorageKey, $state.snapshot(savedViews));
		selectedViewId = saved.id;
		saveViewOpen = false;
	}

	function deleteSavedView() {
		savedViews = savedViews.filter(({ id }) => id !== selectedViewId);
		storeSavedViews(viewStorageKey, $state.snapshot(savedViews));
		applyView("all");
	}

	function toggleDependency(project: string, blocker: string) {
		const blockers = dependencies[project] ?? [];
		if (blockers.includes(blocker)) dependencies[project] = blockers.filter((id) => id !== blocker);
		else if (canAddDependency(dependencies, project, blocker))
			dependencies[project] = [...blockers, blocker];
	}

	function handleToolbarKey(event: KeyboardEvent) {
		if (
			event.defaultPrevented ||
			event.isComposing ||
			event.repeat ||
			event.altKey ||
			event.metaKey ||
			event.ctrlKey
		)
			return;
		if (!(event.target instanceof HTMLElement) || !toolbar?.contains(event.target)) return;
		if (event.target.closest("input,textarea,[contenteditable]")) return;
		const key = event.key.toLowerCase();
		const trigger =
			!event.shiftKey && key === "f"
				? filterTrigger
				: event.shiftKey && key === "v"
					? displayTrigger
					: null;
		if (!trigger) return;
		event.preventDefault();
		trigger.focus();
		trigger.click();
	}

	function selectFilter(field: Field, value: string) {
		const current = filters[field] ?? [];
		const next = current.includes(value)
			? current.filter((item) => item !== value)
			: [...current, value];
		filters = { ...filters, [field]: next };
	}

	function clearField(field: Field) {
		filters = { ...filters, [field]: [] };
	}

	async function selectField(field?: Field) {
		filterField = field;
		await tick();
		filterSearch?.focus();
	}

	function openProject(event: MouseEvent, status: Status = "backlog") {
		opener = event.currentTarget as HTMLElement;
		initialStatus = status;
		projectOpen = true;
	}

	function createProject(draft: ProjectDraft) {
		created = [{ ...draft, id: "new-" + ++nextProject, issues: 0, progress: 0 }, ...created];
		if (activeFields.length) filters = {};
	}

	function updateProject(id: string, change: ProjectChanges) {
		projectChanges[id] = { ...projectChanges[id], ...change };
	}

	function updateMilestone(project: Project, milestone: Milestone, date: string) {
		updateProject(project.id, {
			milestones: project.milestones?.map((item) =>
				item.id === milestone.id ? { ...item, date } : item
			),
		});
	}

	async function moveProject(id: string, status: Status) {
		updateProject(id, { status });
		await tick();
		if (!visible.length) filterTrigger?.focus();
	}

	function sortBy(column: Order) {
		descending = order === column && !descending;
		order = column;
	}

	function optionLabel(field: Field, value: string) {
		return options[field].find((option) => option.id === value)?.label ?? value;
	}
</script>

{#snippet projectIcon()}
	<IconPlaceholder
		lucide="BoxIcon"
		tabler="IconBox"
		hugeicons="CubeIcon"
		phosphor="CubeIcon"
		remixicon="RiBox3Line"
		class="size-4 shrink-0 text-cyan-700 dark:text-cyan-400"
		aria-hidden="true"
	/>
{/snippet}

{#snippet statusIcon(status: Status)}
	<span
		aria-hidden="true"
		class="inline-block size-3.5 shrink-0 rounded-full border {statuses.find(
			(item) => item.id === status
		)?.color}"
	></span>
{/snippet}

{#snippet leadDisplay(project: Project)}
	{@const lead = leadOptions.find((item) => item.id === project.lead)}
	{#if lead}
		<span
			title={lead.label}
			aria-label={lead.label}
			class="inline-grid size-5 shrink-0 place-items-center rounded-full bg-sky-500/15 text-[8px] font-medium text-sky-700 dark:text-sky-300"
			>{lead.detail}</span
		>
	{:else}
		<span aria-label={text("无负责人", "No lead")} class="text-muted-foreground">–</span>
	{/if}
{/snippet}

{#snippet emptyState()}
	<Empty.Root class="max-w-md gap-4 border-0 p-4 text-center">
		<Empty.Header>
			<Empty.Media
				variant="icon"
				class="mb-2 rounded-xl border border-dashed border-muted-foreground/40 bg-transparent"
			>
				{#if activeFields.length}<IconPlaceholder
						lucide="ListFilterIcon"
						tabler="IconFilter"
						hugeicons="FilterIcon"
						phosphor="FunnelSimpleIcon"
						remixicon="RiFilter3Line"
						aria-hidden="true"
					/>{:else}{@render projectIcon()}{/if}
			</Empty.Media>
			<Empty.Title
				>{activeFields.length
					? text("没有符合筛选条件的项目", "No projects matching the filters")
					: text("还没有项目", "No projects yet")}</Empty.Title
			>
			<Empty.Description>
				{activeFields.length
					? chinese
						? projects.length + " 个项目被筛选隐藏"
						: projects.length + " projects hidden by filters"
					: text(
							"创建第一个项目来组织团队的工作。",
							"Create a project to organize your team's work."
						)}
			</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			{#if activeFields.length}
				<Button
					variant="outline"
					size="sm"
					shape="pill"
					onclick={() => {
						filters = {};
					}}>{text("清除筛选", "Clear filters")}</Button
				>
			{:else}
				<Button variant="outline" size="sm" shape="pill" onclick={(event) => openProject(event)}
					>{text("创建第一个项目", "Create first project")}</Button
				>
			{/if}
		</Empty.Content>
	</Empty.Root>
{/snippet}

<svelte:window onkeydown={handleToolbarKey} />

<Tooltip.Provider delayDuration={500} skipDelayDuration={150}>
	<section
		{id}
		aria-label={text("项目", "Projects")}
		style={tokens}
		class="overflow-hidden rounded-xl border border-border bg-(--project-panel) text-foreground [color-scheme:light] dark:[color-scheme:dark]"
	>
		<header class="flex min-h-11 items-center justify-between gap-2 border-b border-border px-4">
			<h2 class="text-[13px] font-medium">{text("项目", "Projects")}</h2>
			<Button
				bind:ref={mainCreateButton}
				variant="ghost"
				size="sm"
				class="gap-1.5 text-xs text-muted-foreground"
				onclick={(event) => openProject(event)}
			>
				<span aria-hidden="true">+</span>{text("新建项目", "New project")}
			</Button>
		</header>
		<div
			bind:this={toolbar}
			class="flex min-h-11 items-center justify-between gap-2 px-2 py-1.5 sm:px-3"
		>
			<Select.Root type="single" items={views} value={selectedViewId} onValueChange={applyView}>
				<Select.Trigger
					aria-label={text("保存的项目视图", "Saved project views")}
					size="sm"
					class="max-w-[45%] rounded-full"
				>
					<Select.Value />
				</Select.Trigger>
				<Select.Content portalProps={portal}>
					{#each views as item (item.value)}<Select.Item {...item} />{/each}
				</Select.Content>
			</Select.Root>
			<div class="flex items-center gap-1.5">
				<Popover.Root
					bind:open={filterOpen}
					onOpenChange={(next) => {
						if (next) filterField = undefined;
					}}
				>
					<Tooltip.Hint label={text("添加筛选", "Add filter")} {portal} keys={["F"]}>
						{#snippet trigger({ props })}
							<Popover.Trigger
								{...props}
								bind:ref={filterTrigger}
								aria-keyshortcuts="F"
								aria-label={text("添加筛选", "Add filter")}
								class={iconButton}
							>
								<IconPlaceholder
									lucide="ListFilterIcon"
									tabler="IconFilter"
									hugeicons="FilterIcon"
									phosphor="FunnelSimpleIcon"
									remixicon="RiFilter3Line"
									aria-hidden="true"
								/>
							</Popover.Trigger>
						{/snippet}
					</Tooltip.Hint>
					<Popover.Content
						appearance="surface"
						portalProps={portal}
						role="dialog"
						aria-label={text("项目筛选", "Project filters")}
						align="end"
						class="w-60 gap-0 p-1.5"
						onOpenAutoFocus={(event) => {
							event.preventDefault();
							filterSearch?.focus();
						}}
					>
						{#if filterField}
							<Button
								size="sm"
								variant="ghost"
								class="justify-start text-xs"
								onclick={() => selectField()}>‹ {label(filterField)}</Button
							>
						{/if}
						{#key filterField}
							<Command.Root class="bg-transparent">
								<Command.Input
									bind:ref={filterSearch}
									aria-label={text("搜索筛选项", "Search filters")}
									placeholder={text("搜索筛选项…", "Search filters…")}
								/>
								<Command.List>
									<Command.Empty>{text("没有匹配的选项", "No matching options")}</Command.Empty>
									{#if filterField}
										{@const field = filterField}
										{#each options[field] as option (option.id)}
											<Command.Item
												value={option.label}
												data-checked={filters[field]?.includes(option.id)}
												onSelect={() => selectFilter(field, option.id)}
											>
												{#if option.color}<span
														class="size-3 rounded-full border {option.color}"
														aria-hidden="true"
													></span>{/if}{option.label}
											</Command.Item>
										{/each}
									{:else}
										{#each fields as field (field)}
											<Command.Item value={label(field)} onSelect={() => selectField(field)}
												>{label(field)}<span
													class="ml-auto text-muted-foreground"
													aria-hidden="true">›</span
												></Command.Item
											>
										{/each}
									{/if}
								</Command.List>
							</Command.Root>
						{/key}
					</Popover.Content>
				</Popover.Root>

				<Popover.Root bind:open={displayOpen}>
					<Tooltip.Hint
						label={text("显示选项", "Show display options")}
						{portal}
						keys={["Shift", "V"]}
					>
						{#snippet trigger({ props })}
							<Popover.Trigger
								{...props}
								bind:ref={displayTrigger}
								aria-keyshortcuts="Shift+V"
								aria-label={text("显示选项", "Display options")}
								class={iconButton}
							>
								<IconPlaceholder
									lucide="Settings2Icon"
									tabler="IconAdjustments"
									hugeicons="Settings05Icon"
									phosphor="SlidersHorizontalIcon"
									remixicon="RiEqualizerLine"
									aria-hidden="true"
								/>
							</Popover.Trigger>
						{/snippet}
					</Tooltip.Hint>
					<Popover.Content
						appearance="options"
						portalProps={portal}
						role="dialog"
						aria-label={text("显示选项", "Display options")}
						align="end"
					>
						<Tabs.Root bind:value={view} class="shrink-0 px-4 py-2">
							<Tabs.List
								aria-label={text("项目视图", "Project view")}
								class="h-auto w-full gap-1 bg-transparent p-0"
							>
								<Tabs.Trigger
									value="list"
									class="h-7 rounded-full border border-border text-xs shadow-none"
									>{text("列表", "List")}</Tabs.Trigger
								>
								<Tabs.Trigger
									value="board"
									class="h-7 rounded-full border border-border text-xs shadow-none"
									>{text("看板", "Board")}</Tabs.Trigger
								>
								<Tabs.Trigger
									value="timeline"
									class="h-7 rounded-full border border-border text-xs shadow-none"
									>{text("时间线", "Timeline")}</Tabs.Trigger
								>
							</Tabs.List>
						</Tabs.Root>
						{#if view === "board"}
							<div
								class="flex min-h-8 shrink-0 items-center justify-between gap-2 border-t border-border px-4 pt-2"
							>
								<span>{text("列分组", "Columns")}</span><span class="text-muted-foreground"
									>{label("status")}</span
								>
							</div>
							<div class="flex min-h-8 shrink-0 items-center justify-between gap-3 px-4 pb-2">
								<label for={id + "-empty"}>{text("显示空列", "Show empty columns")}</label>
								<Switch
									id={id + "-empty"}
									size="sm"
									appearance="settings"
									bind:checked={showEmpty}
								/>
							</div>
						{:else if view === "timeline"}
							<div class="shrink-0 border-t border-border px-4 py-2">
								<div class="flex min-h-8 items-center justify-between gap-3">
									<label for={id + "-project-list"}
										>{text("显示项目列表", "Show project list")}</label
									>
									<Switch
										id={id + "-project-list"}
										size="sm"
										appearance="settings"
										bind:checked={showProjectList}
									/>
								</div>
								<div class="flex min-h-8 items-center justify-between gap-3">
									<label for={id + "-week-numbers"}>{text("显示周数", "Show week numbers")}</label>
									<Switch
										id={id + "-week-numbers"}
										size="sm"
										appearance="settings"
										bind:checked={showWeekNumbers}
									/>
								</div>
								<div class="flex min-h-8 items-center justify-between gap-3">
									<label for={id + "-milestones"}>{text("显示里程碑", "Show milestones")}</label>
									<Switch
										id={id + "-milestones"}
										size="sm"
										appearance="settings"
										bind:checked={showMilestones}
									/>
								</div>
								<div class="flex min-h-8 items-center justify-between gap-3">
									<label for={id + "-dependencies"}>{text("显示依赖线", "Show dependencies")}</label
									>
									<Switch id={id + "-dependencies"} size="sm" bind:checked={showDependencies} />
								</div>
							</div>
						{/if}
						<div
							class="flex shrink-0 flex-wrap items-center gap-2 border-t border-border px-4 py-2"
						>
							<Button
								variant="outline"
								size="sm"
								onclick={() => {
									viewName = "";
									viewNameError = "";
									displayOpen = false;
									void tick().then(() => (saveViewOpen = true));
								}}>{text("保存当前视图", "Save current view")}</Button
							>
							{#if selectedViewId !== "all"}
								<Button variant="ghost" size="sm" onclick={deleteSavedView}
									>{text("删除保存的视图", "Delete saved view")}</Button
								>
							{/if}
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>

		{#if activeFields.length}
			<div
				class="mx-2 mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-accent/65 p-2"
				aria-label={text("生效的筛选", "Active filters")}
			>
				{#each activeFields as field (field)}
					<div
						class="inline-flex max-w-full items-center gap-1 rounded-full bg-(--project-control) pr-1"
					>
						<ProjectPicker
							label={text("编辑", "Edit ") + label(field)}
							placeholder={text("搜索筛选值…", "Search values…")}
							empty={text("无选项", "No options")}
							options={options[field]}
							selected={filters[field] ?? []}
							multiple
							onSelect={(value) => selectFilter(field, value)}
							{portal}
						>
							<span class="font-medium">{label(field)}</span><span class="opacity-65"
								>{text("是", "is")}</span
							><span class="truncate"
								>{filters[field]?.map((value) => optionLabel(field, value)).join(", ")}</span
							>
						</ProjectPicker>
						<Button
							size="icon-xs"
							variant="ghost"
							class="size-5 rounded-full"
							aria-label={text("移除", "Remove ") + label(field)}
							onclick={() => clearField(field)}>×</Button
						>
					</div>
				{/each}
				<Button
					variant="ghost"
					size="xs"
					class="ml-auto"
					onclick={() => {
						filters = {};
					}}>{text("清除筛选", "Clear filters")}</Button
				>
			</div>
		{/if}

		{#if view === "timeline"}
			<ProjectTimeline
				projects={visible}
				{chinese}
				{portal}
				bind:scale={timelineScale}
				showList={showProjectList}
				showWeeks={showWeekNumbers}
				{showMilestones}
				{showDependencies}
				{dependencies}
				onMilestoneDateChange={updateMilestone}
				onOpen={(id) => (details = id)}
				{projectIcon}
				{statusIcon}
				{emptyState}
			/>
		{:else if visible.length === 0}
			<div class="grid min-h-[400px] place-items-center px-4">
				{@render emptyState()}
			</div>
		{:else if view === "list"}
			<div class="min-h-[400px] overflow-x-auto">
				<table
					aria-label={text("项目列表", "Projects list")}
					class="w-full min-w-[690px] table-fixed text-left text-[13px]"
				>
					<thead class="text-xs text-muted-foreground">
						<tr>
							{#each columns as column (column)}
								<th
									scope="col"
									aria-sort={order === column
										? descending
											? "descending"
											: "ascending"
										: undefined}
									class={column === "name"
										? "h-8 w-[45%] pl-5 font-normal sm:pl-9"
										: column === "target"
											? "w-[13%] font-normal"
											: "font-normal"}
								>
									{#if orderColumns.includes(column)}
										<button
											type="button"
											class="rounded-sm px-1 py-0.5 text-left hover:bg-accent focus-visible:outline-ring"
											onclick={() => sortBy(column as Order)}
											>{label(column)}{#if order === column}<span aria-hidden="true"
													>{descending ? " ↓" : " ↑"}</span
												>{/if}</button
										>
									{:else}
										{label(column)}
									{/if}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each visible as project (project.id)}
							<tr class="h-12 hover:bg-accent/65">
								<td class="pl-5 sm:pl-9">
									<button
										type="button"
										class="flex max-w-full items-center gap-3 rounded-sm pr-2 text-left font-medium focus-visible:outline-ring"
										onclick={() => (details = project.id)}
										>{@render projectIcon()}<span class="truncate">{project.name}</span></button
									>
								</td>
								<td
									><span
										aria-label={text("暂无更新", "No updates")}
										class="inline-block size-3.5 rounded-full border border-dashed border-muted-foreground/60"
									></span></td
								>
								<td class="text-muted-foreground"
									>{project.priority === "none"
										? "⋯"
										: optionLabel("priority", project.priority)}</td
								>
								<td>{@render leadDisplay(project)}</td>
								<td>{project.target ? dateLabel(project.target, chinese ? "zh-CN" : "en") : ""}</td>
								<td>{project.issues}</td>
								<td
									><span
										class="inline-flex items-center gap-1.5"
										aria-label={optionLabel("status", project.status)}
										>{@render statusIcon(project.status)}{project.progress}%</span
									></td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<ProjectBoard
				projects={visible}
				{chinese}
				{portal}
				{showEmpty}
				onCreate={openProject}
				onOpen={(id) => (details = id)}
				onStatusChange={moveProject}
				{projectIcon}
				{statusIcon}
				{leadDisplay}
			/>
		{/if}

		{#if selectedProject}
			{@const project = selectedProject}
			<aside
				aria-label={text("项目详情", "Project details")}
				class="border-t border-border bg-(--project-control) px-4 py-3 text-sm"
			>
				<div class="flex items-center gap-2">
					<h3 class="font-semibold">{project.name}</h3>
					<Button
						variant="ghost"
						size="icon-xs"
						class="ml-auto"
						aria-label={text("关闭项目详情", "Close project details")}
						onclick={() => (details = undefined)}>×</Button
					>
				</div>
				{#if project.summary}<p class="text-muted-foreground">
						{project.summary}
					</p>{/if}
				{#if project.description}<p class="mt-2 whitespace-pre-wrap">
						{project.description}
					</p>{/if}
				<Collapsible.Root appearance="properties" open class="mt-2 min-w-0">
					<Collapsible.Trigger>
						<svg
							data-slot="collapsible-indicator"
							viewBox="0 0 16 16"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								d="M6 5.8c0-.4.4-.6.75-.4l3.75 2.2a.46.46 0 0 1 0 .8l-3.75 2.2c-.35.2-.75 0-.75-.4Z"
							/>
						</svg>
						{text("属性", "Properties")}
					</Collapsible.Trigger>
					<Collapsible.Content class="px-2">
						<p class="mt-2 text-xs text-muted-foreground">
							{optionLabel("status", project.status)} · {project.teams
								.map((team) => optionLabel("team", team))
								.join(", ")} · {optionLabel("lead", project.lead)}
						</p>
						{#key project.id}
							{@const blockers = projects.filter((item) =>
								dependencies[project.id]?.includes(item.id)
							)}
							{@const blocking = projects.filter((item) =>
								dependencies[item.id]?.includes(project.id)
							)}
							<div class="mt-3 flex flex-wrap gap-2">
								<DatePicker
									label={text("编辑开始日期", "Edit start date")}
									placeholder={text("设置开始日期", "Set start date")}
									value={project.start}
									max={project.target}
									locale={chinese ? "zh-CN" : "en"}
									portalProps={portal}
									onValueChange={(start) => updateProject(project.id, { start })}
								/>
								<DatePicker
									label={text("编辑目标日期", "Edit target date")}
									placeholder={text("设置目标日期", "Set target date")}
									value={project.target}
									min={project.start}
									locale={chinese ? "zh-CN" : "en"}
									portalProps={portal}
									onValueChange={(target) => updateProject(project.id, { target })}
								/>
							</div>
							<div class="mt-3 space-y-1 text-xs">
								<ProjectPicker
									label={text("编辑前置项目", "Edit blocking projects")}
									placeholder={text("搜索项目…", "Search projects…")}
									empty={text("没有可用的前置项目", "No available blockers")}
									options={projects
										.filter((item) => canAddDependency(dependencies, project.id, item.id))
										.map((item) => ({ id: item.id, label: item.name }))}
									selected={dependencies[project.id] ?? []}
									multiple
									{portal}
									onSelect={(id) => toggleDependency(project.id, id)}
								>
									{text("前置项目", "Blocked by")}{#if blockers.length}
										· {blockers.length}{/if}
								</ProjectPicker>
								{#each blockers as blocker (blocker.id)}
									<p class="text-muted-foreground">
										{blocker.name}{#if dependencyDates(blocker, project)?.violated}
											<span class="text-destructive">
												· {text("排期冲突", "Schedule conflict")}</span
											>
										{/if}
									</p>
								{/each}
								{#if blocking.length}
									<p class="text-muted-foreground">
										{text("阻塞", "Blocking")} · {blocking.map((item) => item.name).join(", ")}
									</p>
								{/if}
							</div>
						{/key}
					</Collapsible.Content>
				</Collapsible.Root>
			</aside>
		{/if}

		<Dialog.Root bind:open={saveViewOpen}>
			<Dialog.Content
				portalProps={portal}
				class="max-w-[min(24rem,calc(100vw-2rem))]"
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					displayTrigger?.focus();
				}}
			>
				<Dialog.Header>
					<Dialog.Title>{text("保存项目视图", "Save project view")}</Dialog.Title>
					<Dialog.Description
						>{text(
							"保存当前筛选、排序和显示选项。",
							"Save the current filters, sort, and display options."
						)}</Dialog.Description
					>
				</Dialog.Header>
				<form onsubmit={saveView} class="space-y-3">
					<label for={id + "-view-name"} class="text-sm">{text("视图名称", "View name")}</label>
					<Input
						id={id + "-view-name"}
						bind:value={viewName}
						maxlength={60}
						aria-invalid={Boolean(viewNameError)}
						oninput={() => (viewNameError = "")}
					/>
					{#if viewNameError}<p role="alert" class="text-xs text-destructive">
							{viewNameError}
						</p>{/if}
					<Dialog.Footer>
						<Button type="button" variant="outline" onclick={() => (saveViewOpen = false)}
							>{text("取消", "Cancel")}</Button
						>
						<Button type="submit">{text("保存视图", "Save view")}</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>

		<ProjectComposer
			bind:open={projectOpen}
			{chinese}
			{teamOptions}
			people={leadOptions}
			{initialStatus}
			onCreate={createProject}
			returnFocus={() => (opener?.isConnected ? opener : mainCreateButton)}
		/>
	</section>
</Tooltip.Provider>
