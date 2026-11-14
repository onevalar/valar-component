<script lang="ts">
	import { onMount, tick } from "svelte";
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Menu from "$lib/registry/ui/dropdown-menu/index.js";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import {
		IssueGlyph,
		issueLabels,
		statuses,
		priorities,
	} from "$lib/registry/ui/issue-composer/index.js";
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
	import InboxDisplay from "./inbox-display.svelte";
	import InboxFilter from "./inbox-filter.svelte";
	import {
		defaultPriorityFilter,
		fields,
		notificationTypes,
		people,
		sampleInbox,
		type Filter,
		type FilterField,
		type Notification,
	} from "./data.js";

	let { chinese = false, empty = false }: { chinese?: boolean; empty?: boolean } = $props();

	const id = $props.id();
	const portal = { to: '[id="' + id + '"]' };
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const issueLabel = (key: keyof typeof issueLabels) => issueLabels[key][chinese ? 0 : 1];
	const typeLabel = (key: keyof typeof notificationTypes) =>
		notificationTypes[key][chinese ? 0 : 1];
	const fieldLabels = $derived({
		type: text("通知类型", "Notification type"),
		sender: text("发送者", "From"),
		project: text("项目", "Project"),
		priority: text("问题优先级", "Issue priority"),
		status: text("问题状态类型", "Issue status type"),
	});
	const iconButton = "cn-toolbar-icon";
	const popup = "w-52";
	const tokens = `
		--inbox-panel: light-dark(#f7f7f8, #131313);
		--inbox-selected: light-dark(#eae9ed, #242426);
		--inbox-emphasis: light-dark(#5359be, #8388ed);
		--foreground: light-dark(lch(9.794% 0 282), lch(90.451% 1.2 272));
		--muted-foreground: light-dark(lch(39.176% 1.25 282), lch(61.803% 1.2 272));
		--border: light-dark(#e4e4e7, lch(13.08% 1.48 272));
		--popover: light-dark(white, #222223);
		--popover-foreground: var(--foreground);
		--accent: light-dark(#ededf0, #212123);
		--accent-foreground: var(--foreground);
		--ring: var(--inbox-emphasis);
	`;

	const sample = $derived(sampleInbox(chinese));
	let changes = $state<Record<string, Partial<Notification>>>({});
	let activityByIssue = $state<Record<string, IssueCollaborationState>>({});
	const viewer = $derived({ id: "self", name: text("我", "Me") });
	const subscriberPeople = $derived(people.map(({ id, label }) => ({ id, name: label })));

	let issueChanges = $state<Record<string, IssueDetailUpdate>>({});
	let deleted = $state<string[]>([]);
	let selected = $state<string>();
	let unreadOnly = $state(false);
	let priorityInbox = $state(false);
	let priorityFilter = $state(defaultPriorityFilter());
	let priorityView = $state("priority");
	let showSnoozed = $state(false);
	let unreadFirst = $state(false);
	let grouping = $state("none");
	let order = $state("newest");
	let filters = $state<Partial<Record<FilterField, Filter>>>({});
	let clock = $state(0);
	let list: HTMLElement;
	let notificationActionsOpen = $state(false);
	let snoozeMenuOpen = $state(false);
	let filterTrigger = $state<HTMLButtonElement | null>(null);
	let displayTrigger = $state<HTMLButtonElement | null>(null);
	let unreadButton: HTMLButtonElement | null = $state(null);
	let heading: HTMLHeadingElement | null = $state(null);
	let searchOpen = $state(false);
	let search = $state("");
	let searchInput: HTMLInputElement | null = $state(null);

	const date = $derived(
		new Intl.DateTimeFormat(chinese ? "zh-CN" : "en-US", {
			month: "short",
			day: "numeric",
			timeZone: "UTC",
		})
	);
	const issues = $derived(
		new Map(sample.issues.map((issue) => [issue.id, { ...issue, ...issueChanges[issue.id] }]))
	);
	const notifications = $derived(
		empty
			? []
			: sample.notifications
					.filter(({ id }) => !deleted.includes(id))
					.map((item) => ({ ...item, ...changes[item.id] }))
	);
	const unreadCounts = $derived(
		notifications.reduce(
			(counts, item) => {
				if (item.unread && !isSnoozed(item)) counts[isPriority(item) ? "priority" : "other"]++;
				return counts;
			},
			{ priority: 0, other: 0 }
		)
	);
	const active = $derived(notifications.find(({ id }) => id === selected));
	const activeIssue = $derived(active && issues.get(active.issueId));
	const activeFields = $derived(fields.filter((field) => filters[field]?.values.length));
	const options = $derived({
		type: (Object.keys(notificationTypes) as (keyof typeof notificationTypes)[]).map((id) => ({
			id,
			label: typeLabel(id),
		})),
		sender: people,
		project: [{ id: "", label: text("无项目", "No project") }, ...sample.projects],
		priority: priorities.map((id) => ({ id, label: issueLabel(id) })),
		status: statuses.map((id) => ({ id, label: issueLabel(id) })),
	});

	const visible = $derived.by(() => {
		const query = search.trim().toLocaleLowerCase();
		return notifications
			.filter((item) => {
				const issue = issues.get(item.issueId);
				if (unreadOnly && !item.unread) return false;
				if (!showSnoozed && isSnoozed(item)) return false;
				if (priorityInbox && (priorityView === "priority") !== isPriority(item)) return false;
				const values = {
					type: item.type,
					sender: item.sender,
					project: issue?.project ?? "",
					priority: issue?.priority,
					status: issue?.status,
				};
				if (
					activeFields.some((field) => {
						const filter = filters[field];
						const matches = filter?.values.includes(values[field] ?? "") ?? false;
						return filter?.exclude ? matches : !matches;
					})
				)
					return false;
				return [
					item.issueId,
					issue?.title,
					item.summary,
					typeLabel(item.type),
					person(item.sender),
					person(issue?.assignee),
					sample.projects.find(({ id }) => id === issue?.project)?.label,
					issue && issueLabel(issue.priority),
				].some((value) => value?.toLocaleLowerCase().includes(query));
			})
			.sort((left, right) => {
				if (unreadFirst && left.unread !== right.unread)
					return Number(right.unread) - Number(left.unread);
				if (order === "priority") {
					const rank = priorityRank(left) - priorityRank(right);
					if (rank) return rank;
				}
				return order === "oldest"
					? left.created.localeCompare(right.created)
					: right.created.localeCompare(left.created);
			});
	});
	const groups = $derived(
		grouping === "focus"
			? [
					{
						key: "focus",
						title: text("专注", "Focus"),
						items: visible.filter((item) => item.unread && isPriority(item)),
					},
					{
						key: "other",
						title: text("其他通知", "Other notifications"),
						items: visible.filter((item) => !item.unread || !isPriority(item)),
					},
				]
			: [{ key: "all", title: "", items: visible }]
	);

	function person(personId?: string) {
		return people.find(({ id }) => id === personId)?.label;
	}

	function initials(personId: string) {
		return (
			person(personId)
				?.split(" ")
				.map((part) => part[0])
				.join("") ?? ""
		);
	}

	function priorityRank(item: Notification) {
		const priority = issues.get(item.issueId)?.priority ?? "none";
		return priority === "none" ? priorities.length : priorities.indexOf(priority);
	}

	function isPriority(item: Notification) {
		const issuePriority = issues.get(item.issueId)?.priority ?? "none";
		return (
			priorityFilter.sources.includes(item.type) || priorityFilter.levels.includes(issuePriority)
		);
	}

	function isSnoozed(item: Notification) {
		return (item.snoozedUntil ?? 0) > clock;
	}

	onMount(() => {
		clock = Date.now();
	});
	$effect(() => {
		const next = notifications.reduce(
			(earliest, item) => (isSnoozed(item) ? Math.min(earliest, item.snoozedUntil!) : earliest),
			Infinity
		);
		if (!Number.isFinite(next)) return;
		const timer = window.setTimeout(
			() => {
				clock = Date.now();
			},
			Math.max(1, next - Date.now())
		);
		return () => window.clearTimeout(timer);
	});

	function toggleFilter(field: FilterField, option: string) {
		const existing = filters[field];
		const values = existing?.values ?? [];
		const next = values.includes(option)
			? values.filter((value) => value !== option)
			: [...values, option];
		filters[field] = next.length
			? { values: next, exclude: existing?.exclude ?? false }
			: undefined;
	}

	function changeNotification(item: Notification, patch: Partial<Notification>) {
		changes[item.id] = { ...changes[item.id], ...patch };
	}

	function getActivity(issueId: string): readonly IssueActivityEntry[] {
		const author = { id: "avery", name: "Avery Chen" };
		const created: IssueActivityEntry = {
			kind: "event",
			id: issueId + "-created",
			author,
			createdAt: "2026-11-11T09:00:00Z",
		};
		if (issueId !== "VLR-206") return [created];
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
					issueId === "VLR-206" ? subscriberPeople.filter(({ id }) => id === "avery") : [],
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

	function changeIssue(issueId: string, update: IssueDetailUpdate) {
		issueChanges[issueId] = { ...issueChanges[issueId], ...update };
	}

	async function select(item: Notification, focusDetail = true, markRead = true) {
		notificationActionsOpen = false;
		snoozeMenuOpen = false;
		selected = item.id;
		if (markRead && item.unread) changeNotification(item, { unread: false });
		if (focusDetail) {
			await tick();
			heading?.focus();
		}
	}

	function rowButton(row: string) {
		return list.querySelector<HTMLButtonElement>('[data-notification="' + row + '"]');
	}

	async function closeDetail() {
		const last = selected;
		notificationActionsOpen = false;
		snoozeMenuOpen = false;
		selected = undefined;
		await tick();
		const previous = last ? rowButton(last) : null;
		(
			previous ??
			list.querySelector<HTMLButtonElement>("[data-notification]") ??
			unreadButton
		)?.focus();
	}

	function snooze(item: Notification, minutes: number) {
		clock = Date.now();
		changeNotification(item, { snoozedUntil: clock + minutes * 60000 });
		if (!showSnoozed) void closeDetail();
	}

	function adjacentNotification(item: Notification, direction: 1 | -1) {
		const items = groups.flatMap(({ items }) => items);
		const index = items.findIndex(({ id }) => id === item.id);
		return index === -1 ? items.at(direction === 1 ? 0 : -1) : items[index + direction];
	}

	function markAllRead() {
		for (const item of notifications) {
			if (item.unread) changeNotification(item, { unread: false });
		}
	}

	function deleteRead() {
		const closeSelected = active && !active.unread;
		deleted = [...deleted, ...notifications.filter((item) => !item.unread).map(({ id }) => id)];
		if (closeSelected) void closeDetail();
	}

	async function remove(item: Notification) {
		const next = adjacentNotification(item, 1) ?? adjacentNotification(item, -1);
		deleted = [...deleted, item.id];
		if (item.id === selected) {
			await closeDetail();
		} else {
			await tick();
			((next && rowButton(next.id)) ?? unreadButton)?.focus();
		}
	}

	async function openSnooze(item: Notification) {
		if (item.id !== selected) await select(item, false, false);
		notificationActionsOpen = true;
		await tick();
		snoozeMenuOpen = !isSnoozed(item);
	}

	function handleNotificationKey(event: KeyboardEvent, item: Notification, inDetail: boolean) {
		if (event.defaultPrevented || event.isComposing || event.metaKey || event.ctrlKey) return;
		const key = event.key.toLowerCase();
		if (event.altKey) {
			if (key === "u" && !event.shiftKey && !event.repeat) {
				event.preventDefault();
				markAllRead();
				if (!inDetail && unreadOnly) unreadButton?.focus();
			}
			return;
		}
		if (
			!event.shiftKey &&
			(key === "arrowdown" || key === "arrowup" || key === "j" || key === "k")
		) {
			event.preventDefault();
			const next = adjacentNotification(item, key === "arrowdown" || key === "j" ? 1 : -1);
			if (next) {
				if (inDetail) void select(next);
				else rowButton(next.id)?.focus();
			}
		} else if (!event.repeat && key === "backspace") {
			event.preventDefault();
			if (event.shiftKey) {
				deleteRead();
				if (!inDetail && !item.unread)
					void tick().then(() => {
						(list.querySelector<HTMLButtonElement>("[data-notification]") ?? unreadButton)?.focus();
					});
			} else void remove(item);
		} else if (!event.repeat && !event.shiftKey && key === "h") {
			event.preventDefault();
			void openSnooze(item);
		} else if (!event.repeat && !event.shiftKey && key === "u") {
			event.preventDefault();
			changeNotification(item, { unread: !item.unread });
			if (!inDetail && unreadOnly && item.unread)
				void tick().then(() => {
					(list.querySelector<HTMLButtonElement>("[data-notification]") ?? unreadButton)?.focus();
				});
		}
	}

	function handleInboxKey(event: KeyboardEvent) {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		// Keep detail shortcuts on the issue heading.
		// The issue editor, comments, and popovers keep their own keyboard behavior.
		if (active && target === heading) {
			handleNotificationKey(event, active, true);
			return;
		}
		handleListKey(event);
	}

	function handleListKey(event: KeyboardEvent) {
		if (event.defaultPrevented || event.isComposing || event.repeat || event.altKey) return;
		if (!(event.target instanceof HTMLElement) || !list?.contains(event.target)) return;
		const key = event.key.toLowerCase();
		if ((event.metaKey || event.ctrlKey) && key === "f" && !event.shiftKey) {
			if (event.target.closest("textarea,[contenteditable],input:not([type=search])")) return;
			event.preventDefault();
			void openSearch();
			return;
		}
		if (event.metaKey || event.ctrlKey || event.target.closest("input,textarea,[contenteditable]"))
			return;
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

	async function openSearch() {
		searchOpen = true;
		await tick();
		searchInput?.focus();
	}

	async function closeSearch() {
		search = "";
		searchOpen = false;
		await tick();
		unreadButton?.focus();
	}
</script>

<svelte:window onkeydown={handleInboxKey} />

<Tooltip.Provider delayDuration={500} skipDelayDuration={150}>
	<section
		{id}
		style={tokens}
		aria-label={text("通知中心", "Inbox")}
		class="@container/inbox min-w-0 overflow-hidden rounded-[10px] border border-border bg-(--inbox-panel) text-foreground [color-scheme:light] dark:[color-scheme:dark]"
	>
		<div class="grid @min-[740px]/inbox:grid-cols-[400px_minmax(0,1fr)]">
			<section
				bind:this={list}
				aria-label={text("通知列表", "Notifications")}
				class="h-[min(72svh,700px)] min-h-[360px] min-w-0 flex-col @min-[740px]/inbox:flex @min-[740px]/inbox:border-e @min-[740px]/inbox:border-border"
				class:hidden={active}
				class:flex={!active}
			>
				<header
					class="flex h-11 shrink-0 items-center gap-1 border-b border-border ps-[18px] pe-2.5"
				>
					<h2 class="text-[13px] font-medium">{text("通知中心", "Inbox")}</h2>
					<Menu.Root>
						<Tooltip.Hint label={text("通知操作", "Notification actions")} {portal}>
							{#snippet trigger({ props })}
								<Menu.Trigger
									{...props}
									aria-label={text("通知操作", "Notification actions")}
									class={iconButton}
								>
									<IconPlaceholder
										lucide="MoreHorizontalIcon"
										tabler="IconDots"
										hugeicons="MoreHorizontalCircle01Icon"
										phosphor="DotsThreeIcon"
										remixicon="RiMoreLine"
										aria-hidden="true"
									/>
								</Menu.Trigger>
							{/snippet}
						</Tooltip.Hint>
						<Menu.Content appearance="surface" portalProps={portal} class={popup}>
							<Menu.Item onSelect={openSearch}>
								{text("搜索通知", "Search notifications")}
							</Menu.Item>
							<Menu.Item
								disabled={!notifications.some((item) => item.unread)}
								onSelect={markAllRead}>{text("全部标为已读", "Mark all as read")}</Menu.Item
							>
							<Menu.Item
								disabled={!notifications.some((item) => !item.unread)}
								variant="destructive"
								onSelect={deleteRead}>{text("删除已读通知", "Delete read notifications")}</Menu.Item
							>
						</Menu.Content>
					</Menu.Root>
					<div class="ms-auto flex items-center gap-1.5">
						<Tooltip.Hint
							label={unreadOnly
								? text("显示已读", "Show read")
								: text("仅显示未读", "Show unreads only")}
							{portal}
						>
							{#snippet trigger({ props })}
								<Button
									{...props}
									bind:ref={unreadButton}
									variant="ghost"
									aria-pressed={unreadOnly}
									aria-label={unreadOnly
										? text("显示已读", "Show read")
										: text("仅显示未读", "Show unreads only")}
									title={unreadOnly
										? text("显示已读", "Show read")
										: text("仅显示未读", "Show unreads only")}
									class={iconButton}
									onclick={() => (unreadOnly = !unreadOnly)}
								>
									<IconPlaceholder
										lucide="InboxIcon"
										tabler="IconInbox"
										hugeicons="InboxIcon"
										phosphor="TrayIcon"
										remixicon="RiInboxLine"
										aria-hidden="true"
									/>
								</Button>
							{/snippet}
						</Tooltip.Hint>
						<InboxFilter
							bind:triggerRef={filterTrigger}
							label={text("添加筛选", "Add filter")}
							triggerClass={iconButton}
							{filters}
							{options}
							labels={fieldLabels}
							{portal}
							{chinese}
							onToggle={toggleFilter}
						>
							{#snippet trigger()}
								<IconPlaceholder
									lucide="ListFilterIcon"
									tabler="IconFilter"
									hugeicons="FilterIcon"
									phosphor="FunnelSimpleIcon"
									remixicon="RiFilter3Line"
									aria-hidden="true"
								/>
							{/snippet}
						</InboxFilter>
						<InboxDisplay
							bind:triggerRef={displayTrigger}
							bind:priorityInbox
							bind:priorityFilter
							bind:showSnoozed
							bind:unreadFirst
							bind:grouping
							bind:order
							{iconButton}
							{portal}
							{chinese}
						/>
					</div>
				</header>

				<Tabs.Root
					bind:value={priorityView}
					onValueChange={() => {
						selected = undefined;
					}}
					class="min-h-0 flex-1 flex-col gap-0"
				>
					{#if priorityInbox}
						<Tabs.List
							aria-label={text("通知视图", "Notification views")}
							class="mx-3 my-2 h-7 shrink-0 gap-1 rounded-full bg-transparent p-0"
						>
							<Tabs.Trigger
								value="priority"
								class="rounded-full px-2.5 text-xs data-active:bg-(--inbox-selected)"
								>{text("优先", "Priority")}
								<span class="text-muted-foreground">{unreadCounts.priority}</span></Tabs.Trigger
							>
							<Tabs.Trigger
								value="other"
								class="rounded-full px-2.5 text-xs data-active:bg-(--inbox-selected)"
								>{text("其他", "Other")}
								<span class="text-muted-foreground">{unreadCounts.other}</span></Tabs.Trigger
							>
						</Tabs.List>
					{/if}
					{#if searchOpen}
						<div class="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
							<Input
								bind:ref={searchInput}
								bind:value={search}
								type="search"
								aria-label={text("搜索通知", "Search notifications")}
								placeholder={text("搜索通知…", "Search notifications…")}
								class="h-7 border-border bg-transparent text-[13px]"
								onkeydown={(event) => {
									if (event.key === "Escape") {
										event.preventDefault();
										void closeSearch();
									}
								}}
							/>
							<Button variant="ghost" size="sm" class="h-7" onclick={closeSearch}
								>{text("关闭", "Close")}</Button
							>
						</div>
					{/if}
					{#if activeFields.length}
						<div
							class="flex shrink-0 flex-wrap gap-1.5 border-b border-border px-3 py-2"
							role="group"
							aria-label={text("当前筛选", "Active filters")}
						>
							{#each activeFields as field (field)}
								{@const filter = filters[field]}
								{#if filter}
									<div class="flex max-w-full items-center rounded-md border border-border text-xs">
										<span class="shrink-0 ps-2 text-muted-foreground">{fieldLabels[field]}</span>
										<Button
											variant="ghost"
											size="sm"
											class="h-6 shrink-0 px-1.5 text-xs"
											aria-label={filter.exclude ? text("不包含", "Is not") : text("包含", "Is")}
											onclick={() => (filters[field] = { ...filter, exclude: !filter.exclude })}
										>
											{filter.exclude ? text("不是", "is not") : text("是", "is")}
										</Button>
										<InboxFilter
											initialField={field}
											label={fieldLabels[field]}
											triggerClass="h-6 min-w-0 truncate rounded-sm px-1.5 hover:bg-accent"
											{filters}
											{options}
											labels={fieldLabels}
											{portal}
											{chinese}
											onToggle={toggleFilter}
										>
											{#snippet trigger()}
												{filter.values
													.map((value) => options[field].find(({ id }) => id === value)?.label)
													.join(", ")}
											{/snippet}
										</InboxFilter>
										<Button
											variant="ghost"
											size="icon-sm"
											class="size-6 shrink-0"
											aria-label={text("移除筛选", "Remove filter") + " · " + fieldLabels[field]}
											onclick={() => (filters[field] = undefined)}
										>
											<span aria-hidden="true">×</span>
										</Button>
									</div>
								{/if}
							{/each}
						</div>
					{/if}

					{#if priorityInbox}
						<Tabs.Content
							value="priority"
							class="flex min-h-0 flex-1 flex-col border-t border-border"
							>{#if priorityView === "priority"}{@render notificationList()}{/if}</Tabs.Content
						>
						<Tabs.Content value="other" class="flex min-h-0 flex-1 flex-col border-t border-border"
							>{#if priorityView === "other"}{@render notificationList()}{/if}</Tabs.Content
						>
					{:else}
						{@render notificationList()}
					{/if}
				</Tabs.Root>
			</section>

			{#snippet notificationList()}
				<div class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
					{#if visible.length}
						{#each groups.filter(({ items }) => items.length) as group (group.key)}
							{#if group.title}<h3
									class="border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground"
								>
									{group.title}
								</h3>{/if}
							<ul>
								{#each group.items as item (item.id)}
									{@const issue = issues.get(item.issueId)}
									<li>
										<button
											type="button"
											data-notification={item.id}
											aria-current={item.id === selected ? "true" : undefined}
											class="grid min-h-15 w-full min-w-0 grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2.5 px-4 py-2.5 text-start transition-colors duration-150 hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset aria-current:bg-(--inbox-selected) motion-reduce:transition-none"
											onclick={() => select(item)}
											aria-keyshortcuts="ArrowDown ArrowUp J K U H Backspace Alt+U Shift+Backspace"
											onkeydown={(event) => handleNotificationKey(event, item, false)}
										>
											<span class="relative" aria-hidden="true">
												<Avatar.Root class="size-9 rounded-full">
													<Avatar.Fallback class="bg-accent text-xs text-muted-foreground"
														>{initials(item.sender)}</Avatar.Fallback
													>
												</Avatar.Root>
												<span
													class="absolute -end-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-popover text-muted-foreground ring-2 ring-(--inbox-panel) [&_svg]:size-2.5"
												>
													{#if item.type === "assignment"}
														<IconPlaceholder
															lucide="ArrowRightIcon"
															tabler="IconArrowRight"
															hugeicons="ArrowRight01Icon"
															phosphor="ArrowRightIcon"
															remixicon="RiArrowRightLine"
															aria-hidden="true"
														/>
													{:else if item.type === "comment"}
														<IconPlaceholder
															lucide="MessageSquareIcon"
															tabler="IconMessage"
															hugeicons="Message01Icon"
															phosphor="ChatCircleIcon"
															remixicon="RiChat1Line"
															aria-hidden="true"
														/>
													{:else if item.type === "mention"}
														<span class="text-[10px] font-medium">@</span>
													{:else}
														<IconPlaceholder
															lucide="CheckIcon"
															tabler="IconCheck"
															hugeicons="Tick02Icon"
															phosphor="CheckIcon"
															remixicon="RiCheckLine"
															aria-hidden="true"
														/>
													{/if}
												</span>
											</span>
											<span class="min-w-0">
												<span class="flex min-w-0 items-center gap-1.5 text-[13px] font-medium">
													{#if item.unread}
														<span class="sr-only">{text("未读", "Unread")}</span>
														<span
															class="size-1.5 shrink-0 rounded-full bg-(--inbox-emphasis)"
															aria-hidden="true"
														></span>
													{/if}
													<span class="shrink-0 text-xs font-normal text-muted-foreground"
														>{item.issueId}</span
													>
													<span class="truncate">{issue?.title}</span>
												</span>
												<span class="mt-0.5 block truncate text-xs text-muted-foreground"
													>{person(item.sender)} {item.summary}</span
												>
											</span>
											<span class="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
												{#if issue}<IssueGlyph value={issue.status} /><span class="sr-only"
														>{issueLabel(issue.status)}</span
													>{/if}
												<span class="flex items-center gap-1">
													{#if isSnoozed(item)}<span class="sr-only"
															>{text("已暂缓", "Snoozed")}</span
														><span aria-hidden="true">◷</span>{/if}
													<time datetime={item.created}>{date.format(new Date(item.created))}</time>
												</span>
											</span>
										</button>
									</li>
								{/each}
							</ul>
						{/each}
					{:else}
						<Empty.Root class="gap-2 border-0 p-4 text-[13px] text-muted-foreground">
							<p role="status">
								{unreadOnly
									? text("没有未读通知", "No unreads")
									: text("没有通知", "No notifications")}
							</p>
							{#if unreadOnly}
								<Button
									variant="ghost"
									size="sm"
									class="h-7 text-xs"
									onclick={() => (unreadOnly = false)}
									>{text("显示全部通知", "Show all notifications")}</Button
								>
							{/if}
						</Empty.Root>
					{/if}
				</div>
			{/snippet}

			{#if active && activeIssue}
				{@const previous = adjacentNotification(active, -1)}
				{@const next = adjacentNotification(active, 1)}
				<section
					aria-label={text("通知详情", "Notification details")}
					aria-keyshortcuts="ArrowDown ArrowUp J K U H Backspace Alt+U Shift+Backspace"
					class="flex h-[min(72svh,700px)] min-h-[360px] min-w-0 flex-col"
				>
					<header class="flex h-11 shrink-0 items-center gap-1 border-b border-border px-3">
						<Button
							variant="ghost"
							size="sm"
							class="h-7 px-1.5 text-xs @min-[740px]/inbox:hidden"
							onclick={closeDetail}
						>
							<span aria-hidden="true">‹</span>{text("返回通知", "Back to Inbox")}
						</Button>
						<span class="min-w-0 truncate text-xs text-muted-foreground"
							>{active.issueId} · {typeLabel(active.type)}</span
						>
						<div class="ms-auto flex shrink-0 items-center gap-1">
							<Button
								variant="ghost"
								size="icon-xs"
								aria-label={text("上一条通知", "Previous notification")}
								disabled={!previous}
								onclick={() => previous && select(previous)}
							>
								<span aria-hidden="true">↑</span>
							</Button>
							<Button
								variant="ghost"
								size="icon-xs"
								aria-label={text("下一条通知", "Next notification")}
								disabled={!next}
								onclick={() => next && select(next)}
							>
								<span aria-hidden="true">↓</span>
							</Button>
						</div>
						<Menu.Root bind:open={notificationActionsOpen}>
							<Tooltip.Hint label={text("当前通知操作", "Selected notification actions")} {portal}>
								{#snippet trigger({ props })}
									<Menu.Trigger
										{...props}
										aria-label={text("当前通知操作", "Selected notification actions")}
										class="shrink-0 {iconButton}"
									>
										<IconPlaceholder
											lucide="MoreHorizontalIcon"
											tabler="IconDots"
											hugeicons="MoreHorizontalCircle01Icon"
											phosphor="DotsThreeIcon"
											remixicon="RiMoreLine"
											aria-hidden="true"
										/>
									</Menu.Trigger>
								{/snippet}
							</Tooltip.Hint>
							<Menu.Content appearance="surface" portalProps={portal} align="end" class={popup}>
								{@const item = active}
								<Menu.Item onSelect={() => changeNotification(item, { unread: !item.unread })}>
									{item.unread
										? text("标为已读", "Mark as read")
										: text("标为未读", "Mark as unread")}
								</Menu.Item>
								{#if isSnoozed(item)}
									<Menu.Item onSelect={() => changeNotification(item, { snoozedUntil: undefined })}
										>{text("取消暂缓", "Unsnooze")}</Menu.Item
									>
								{:else}
									<Menu.Sub bind:open={snoozeMenuOpen}>
										<Menu.SubTrigger>
											{text("暂缓", "Snooze")}
											<Menu.Shortcut aria-hidden="true">H</Menu.Shortcut>
										</Menu.SubTrigger>
										<Menu.SubContent appearance="surface" portalProps={portal} class="w-40">
											<Menu.Item onSelect={() => snooze(item, 60)}
												>{text("1 小时", "1 hour")}</Menu.Item
											>
											<Menu.Item onSelect={() => snooze(item, 1440)}
												>{text("1 天", "1 day")}</Menu.Item
											>
											<Menu.Item onSelect={() => snooze(item, 10080)}
												>{text("1 周", "1 week")}</Menu.Item
											>
										</Menu.SubContent>
									</Menu.Sub>
								{/if}
								<Menu.Separator />
								<Menu.Item variant="destructive" onSelect={() => remove(item)}
									>{text("删除通知", "Delete notification")}</Menu.Item
								>
							</Menu.Content>
						</Menu.Root>
					</header>
					<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
						<p class="mx-4 mt-4 text-xs text-muted-foreground sm:mx-8">
							{person(active.sender)}
							{active.summary}
						</p>
						{#key activeIssue.id}
							<IssueDetail
								embedded
								{chinese}
								issue={activeIssue}
								activity={getActivityOptions(activeIssue.id)}
								assignees={people}
								projects={sample.projects}
								bind:headingRef={heading}
								onUpdate={(update) => changeIssue(activeIssue.id, update)}
							/>
						{/key}
					</div>
				</section>
			{:else}
				<div class="hidden @min-[740px]/inbox:flex">
					<Empty.Root class="gap-4 border-0 p-4 text-[13px] text-muted-foreground">
						<IconPlaceholder
							lucide="InboxIcon"
							tabler="IconInbox"
							hugeicons="InboxIcon"
							phosphor="TrayIcon"
							remixicon="RiInboxLine"
							class="size-24 opacity-75 [&_*]:[stroke-width:1]"
							aria-hidden="true"
						/>
						<p>{text("未选择通知", "No notification selected")}</p>
					</Empty.Root>
				</div>
			{/if}
		</div>
	</section>
</Tooltip.Provider>
