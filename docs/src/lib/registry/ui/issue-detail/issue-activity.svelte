<script lang="ts">
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import { issueLabels } from "$lib/registry/ui/issue-composer/index.js";
	import ActivityThread from "./activity-thread.svelte";
	import CommentComposer from "./comment-composer.svelte";
	import IssueSubscribers from "./issue-subscribers.svelte";
	import type { IssueActivityOptions, IssueActivityFieldChange } from "./activity-model.js";

	let {
		activity,
		chinese,
		portal,
	}: {
		activity: IssueActivityOptions;
		chinese: boolean;
		portal: { to: string };
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const date = $derived(
		new Intl.DateTimeFormat(chinese ? "zh-CN" : "en", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			timeZone: "UTC",
		})
	);
	const fields = {
		title: ["标题", "title"],
		description: ["描述", "description"],
		status: ["状态", "status"],
		priority: ["优先级", "priority"],
		assignee: ["负责人", "assignee"],
		project: ["项目", "project"],
		labels: ["标签", "labels"],
	} as const;
	const label = (value: keyof typeof issueLabels) =>
		text(issueLabels[value][0], issueLabels[value][1]);

	function describe(change: IssueActivityFieldChange) {
		const field = text(fields[change.field][0], fields[change.field][1]);
		if (change.field === "status" || change.field === "priority")
			return text(
				`将${field}从「${label(change.from)}」改为「${label(change.to)}」`,
				`changed the ${field} from ${label(change.from)} to ${label(change.to)}`
			);
		return text(`更新了${field}`, `updated the ${field}`);
	}
</script>

<section
	aria-label={text("问题活动", "Issue activity")}
	data-slot="issue-activity"
	style="--activity-card: light-dark(white, lch(9.232% .85 272)); --activity-border: light-dark(lch(91.9% 0 282), lch(16.793% 1.93 272)); --activity-placeholder: light-dark(lch(43% 1 282), lch(61.803% 1.2 272)); --activity-avatar: light-dark(lch(86% 15 240), lch(32% 26 248)); --activity-avatar-foreground: light-dark(lch(29% 21 245), lch(94% 6 240));"
	class="min-w-0 space-y-4 border-t border-(--activity-border) pt-4"
>
	<header class="flex min-h-8 flex-wrap items-center justify-between gap-2">
		<h3 class="text-[15px] leading-6 font-medium">{text("活动", "Activity")}</h3>
		{#if activity.collaboration}
			<IssueSubscribers
				viewer={activity.viewer}
				collaboration={activity.collaboration}
				{chinese}
				{portal}
			/>
		{/if}
	</header>
	{#if activity.entries.length}
		<ol aria-label={text("活动时间线", "Activity timeline")} class="space-y-4">
			{#each activity.entries as entry (entry.id)}
				{#if entry.kind === "event"}
					<li
						class="flex min-w-0 items-start gap-2 px-2 text-xs leading-5 text-muted-foreground sm:px-4"
					>
						<Avatar.Root aria-hidden="true" class="mt-0.5 size-3.5">
							<Avatar.Fallback
								class="bg-(--activity-avatar) text-[7px] text-(--activity-avatar-foreground)"
							>
								{entry.author.initials ?? entry.author.name.slice(0, 2)}
							</Avatar.Fallback>
						</Avatar.Root>
						<span class="min-w-0 break-words">
							{entry.author.name}
							{entry.changes?.length
								? entry.changes.map(describe).join(text("，", ", "))
								: text("创建了问题", "created this issue")}
							<span aria-hidden="true"> · </span>
							<time datetime={entry.createdAt}>{date.format(new Date(entry.createdAt))}</time>
						</span>
					</li>
				{:else}
					<ActivityThread {entry} {activity} {chinese} {portal} />
				{/if}
			{/each}
		</ol>
	{/if}
	<CommentComposer
		mode="post"
		{chinese}
		{portal}
		onCommit={(draft) => activity.onAction({ type: "post", draft })}
	/>
</section>
