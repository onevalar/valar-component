<script lang="ts">
	import { tick } from "svelte";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import ActivityComment from "./activity-comment.svelte";
	import CommentComposer from "./comment-composer.svelte";
	import type { IssueActivityOptions, IssueCommentThread } from "./activity-model.js";

	let {
		entry,
		activity,
		chinese,
		portal,
	}: {
		entry: IssueCommentThread;
		activity: IssueActivityOptions;
		chinese: boolean;
		portal: { to: string };
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const id = $props.id();
	let expanded = $state(false);
	let summary = $state<HTMLButtonElement | null>(null);
	let panel: HTMLDivElement;
	const authors = $derived([
		...new Map([entry, ...entry.replies].map(({ author }) => [author.id, author.name])).values(),
	]);
	const names = $derived(new Intl.ListFormat(chinese ? "zh-CN" : "en").format(authors));
	const count = $derived(entry.replies.length + 1);
	const resolutionReply = $derived(
		entry.replies.find((reply) => reply.id === entry.resolution?.replyId)
	);

	async function resolve(resolved: boolean, replyId?: string) {
		expanded = false;
		activity.collaboration?.onAction({ type: "resolve", threadId: entry.id, resolved, replyId });
		await tick();
		if (resolved) summary?.focus();
		else panel.querySelector<HTMLButtonElement>("[data-thread-options]")?.focus();
	}

	function react(commentId: string, emoji: string, active: boolean) {
		activity.collaboration?.onAction({
			type: "react",
			emoji,
			active,
			comment: { threadId: entry.id, commentId },
		});
	}
</script>

<li
	data-slot="issue-comment-thread"
	class="min-w-0 rounded-[8px] border border-(--activity-border) bg-(--activity-card)"
>
	{#if entry.resolution}
		<button
			bind:this={summary}
			type="button"
			aria-expanded={expanded}
			aria-controls={id}
			title={text("解决者", "Resolved by") + " · " + entry.resolution.by.name}
			class="flex min-h-11 w-full items-center gap-2 rounded-[7px] bg-(--detail-control) px-4 py-2 text-start text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
			onclick={() => (expanded = !expanded)}
		>
			<IconPlaceholder
				lucide="CircleCheckIcon"
				tabler="IconCircleCheck"
				hugeicons="CheckmarkCircle02Icon"
				phosphor="CheckCircleIcon"
				remixicon="RiCheckboxCircleLine"
				class="size-3.5 shrink-0"
				aria-hidden="true"
			/>
			<span class="min-w-0 flex-1">
				<span class="block truncate">
					{expanded
						? text("收起已解决线程", "Collapse resolved thread")
						: text(
								`已解决 · ${count} 条评论 · ${names}`,
								`${count} resolved ${count === 1 ? "comment" : "comments"} from ${names}`
							)}
				</span>
				{#if !expanded && resolutionReply?.body}
					<span class="block truncate text-xs">{resolutionReply.body}</span>
				{/if}
			</span>
			<IconPlaceholder
				lucide="ChevronsUpDownIcon"
				tabler="IconSelector"
				hugeicons="UnfoldMoreIcon"
				phosphor="CaretUpDownIcon"
				remixicon="RiExpandUpDownLine"
				class="size-3.5 shrink-0"
				aria-hidden="true"
			/>
		</button>
	{/if}

	<div {id} bind:this={panel} hidden={!!entry.resolution && !expanded}>
		<ActivityComment
			comment={entry}
			viewer={activity.viewer}
			{chinese}
			{portal}
			resolved={!!entry.resolution}
			onResolution={activity.collaboration ? resolve : undefined}
			onReaction={activity.collaboration
				? (emoji, active) => react(entry.id, emoji, active)
				: undefined}
			onEdit={(draft) =>
				activity.onAction({ type: "edit", threadId: entry.id, commentId: entry.id, draft })}
		/>
		{#if entry.replies.length}
			<ol
				aria-label={text("线程回复", "Thread replies")}
				class="border-t border-(--activity-border)"
			>
				{#each entry.replies as reply (reply.id)}
					<li
						class="not-first:border-t not-first:border-(--activity-border)"
						class:bg-accent={entry.resolution?.replyId === reply.id}
					>
						<ActivityComment
							comment={reply}
							viewer={activity.viewer}
							{chinese}
							{portal}
							reply
							resolved={!!entry.resolution}
							onResolution={activity.collaboration
								? (resolved) => resolve(resolved, reply.id)
								: undefined}
							onReaction={activity.collaboration
								? (emoji, active) => react(reply.id, emoji, active)
								: undefined}
							onEdit={(draft) =>
								activity.onAction({ type: "edit", threadId: entry.id, commentId: reply.id, draft })}
						/>
					</li>
				{/each}
			</ol>
		{/if}
		<CommentComposer
			mode="reply"
			{chinese}
			{portal}
			onCommit={(draft) => {
				expanded = false;
				activity.onAction({ type: "reply", threadId: entry.id, draft });
			}}
		/>
	</div>
</li>
