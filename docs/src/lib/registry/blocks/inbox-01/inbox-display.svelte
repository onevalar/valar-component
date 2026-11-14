<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
	import {
		issueLabels,
		priorities,
		type IssuePriority,
	} from "$lib/registry/ui/issue-composer/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";
	import {
		defaultPriorityFilter,
		notificationTypes,
		type NotificationType,
		type PriorityFilter,
	} from "./data.js";

	let {
		priorityInbox = $bindable(false),
		priorityFilter = $bindable(defaultPriorityFilter()),
		showSnoozed = $bindable(false),
		unreadFirst = $bindable(false),
		grouping = $bindable("none"),
		order = $bindable("newest"),
		triggerRef = $bindable(null),
		iconButton,
		portal,
		chinese,
	}: {
		priorityInbox?: boolean;
		priorityFilter?: PriorityFilter;
		showSnoozed?: boolean;
		unreadFirst?: boolean;
		grouping?: string;
		order?: string;
		triggerRef?: HTMLButtonElement | null;
		iconButton: string;
		portal: { to: string };
		chinese: boolean;
	} = $props();

	const id = $props.id();
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const groupingItems = $derived([
		{ value: "none", label: text("不分组", "No grouping") },
		{ value: "focus", label: text("专注", "Focus") },
	]);
	const orderItems = $derived([
		{ value: "newest", label: text("最新", "Newest") },
		{ value: "oldest", label: text("最早", "Oldest") },
		{ value: "priority", label: text("优先级", "Priority") },
	]);
	const sources = Object.entries(notificationTypes) as [
		NotificationType,
		(typeof notificationTypes)[NotificationType],
	][];
	let priorityExpanded = $state(false);

	function setChoice<T extends string>(values: T[], value: T, checked: boolean) {
		return checked ? [...values, value] : values.filter((item) => item !== value);
	}

	function setSource(source: NotificationType, checked: boolean) {
		priorityFilter = {
			...priorityFilter,
			sources: setChoice(priorityFilter.sources, source, checked),
		};
	}

	function setLevel(level: IssuePriority, checked: boolean) {
		priorityFilter = {
			...priorityFilter,
			levels: setChoice(priorityFilter.levels, level, checked),
		};
	}

	const row = "items-center justify-between gap-3";
	const label = "text-[13px] font-normal";
</script>

<Popover.Root>
	<Tooltip.Hint label={text("显示选项", "Show display options")} {portal} keys={["Shift", "V"]}>
		{#snippet trigger({ props })}
			<Popover.Trigger
				{...props}
				bind:ref={triggerRef}
				aria-keyshortcuts="Shift+V"
				class={iconButton}
				aria-label={text("显示选项", "Display options")}
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
		appearance="surface"
		portalProps={portal}
		align="end"
		role="dialog"
		aria-label={text("显示选项", "Display options")}
		class="max-h-(--bits-popover-content-available-height) w-[252px] max-w-[calc(100vw-2rem)] overflow-y-auto p-3"
	>
		<Field.Group class="gap-2.5">
			<Field.Field orientation="horizontal" class={row}>
				<Field.Label for={id + "-priority"} class={label}
					>{text("启用优先收件箱", "Enable priority inbox")}</Field.Label
				>
				<Switch id={id + "-priority"} size="sm" bind:checked={priorityInbox} />
			</Field.Field>
			{#if priorityInbox}
				<Button
					variant="ghost"
					size="sm"
					class="justify-between px-1 text-[13px]"
					aria-expanded={priorityExpanded}
					aria-controls={priorityExpanded ? id + "-priority-filter" : undefined}
					onclick={() => (priorityExpanded = !priorityExpanded)}
				>
					{text("优先筛选", "Priority filter")}
					<span aria-hidden="true" class="text-muted-foreground"
						>{priorityExpanded ? "−" : "+"}</span
					>
				</Button>
				{#if priorityExpanded}
					<div
						id={id + "-priority-filter"}
						class="grid gap-3 rounded-md border border-border p-2 text-xs"
					>
						<p class="text-muted-foreground">
							{text(
								"符合任一来源或问题优先级的通知会进入「优先」。",
								"Notifications matching any source or issue priority go to Priority."
							)}
						</p>
						<fieldset class="min-w-0">
							<legend class="mb-1.5 font-medium">{text("通知来源", "Notification sources")}</legend>
							<div class="grid max-h-32 gap-2 overflow-y-auto p-0.5">
								{#each sources as [source, sourceLabels] (source)}
									<label for={id + "-source-" + source} class="flex items-center gap-2">
										<Checkbox
											id={id + "-source-" + source}
											checked={priorityFilter.sources.includes(source)}
											onCheckedChange={(checked) => setSource(source, checked)}
										/>
										{sourceLabels[chinese ? 0 : 1]}
									</label>
								{/each}
							</div>
						</fieldset>
						<fieldset class="min-w-0">
							<legend class="mb-1.5 font-medium">{text("问题优先级", "Issue priorities")}</legend>
							<div class="grid grid-cols-2 gap-2 p-0.5">
								{#each priorities as level (level)}
									<label for={id + "-level-" + level} class="flex items-center gap-2">
										<Checkbox
											id={id + "-level-" + level}
											checked={priorityFilter.levels.includes(level)}
											onCheckedChange={(checked) => setLevel(level, checked)}
										/>
										{issueLabels[level][chinese ? 0 : 1]}
									</label>
								{/each}
							</div>
						</fieldset>
						<Button
							variant="outline"
							size="xs"
							onclick={() => (priorityFilter = defaultPriorityFilter())}
						>
							{text("恢复优先默认规则", "Reset priority defaults")}
						</Button>
					</div>
				{/if}
			{/if}
			<Field.Field orientation="horizontal" class={row}>
				<Field.Label for={id + "-grouping"} class={label}
					>{text("未读分组", "Group unreads by")}</Field.Label
				>
				<Select.Root type="single" items={groupingItems} bind:value={grouping}>
					<Select.Trigger id={id + "-grouping"} size="sm" class="h-6 text-xs"
						><Select.Value /></Select.Trigger
					>
					<Select.Content portalProps={portal}>
						{#each groupingItems as item (item.value)}<Select.Item {...item} />{/each}
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<Field.Field orientation="horizontal" class={row}>
				<Field.Label for={id + "-order"} class={label}>{text("排序", "Ordering")}</Field.Label>
				<Select.Root type="single" items={orderItems} bind:value={order}>
					<Select.Trigger id={id + "-order"} size="sm" class="h-6 text-xs"
						><Select.Value /></Select.Trigger
					>
					<Select.Content portalProps={portal}>
						{#each orderItems as item (item.value)}<Select.Item {...item} />{/each}
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<Field.Field orientation="horizontal" class={row}>
				<Field.Label for={id + "-snoozed"} class={label}
					>{text("显示已暂缓", "Show snoozed")}</Field.Label
				>
				<Switch id={id + "-snoozed"} size="sm" bind:checked={showSnoozed} />
			</Field.Field>
			<Field.Field orientation="horizontal" class={row}>
				<Field.Label for={id + "-unread"} class={label}
					>{text("未读优先", "Show unread first")}</Field.Label
				>
				<Switch id={id + "-unread"} size="sm" bind:checked={unreadFirst} />
			</Field.Field>
		</Field.Group>
	</Popover.Content>
</Popover.Root>
