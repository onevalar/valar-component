<script lang="ts">
	import { tick } from "svelte";
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Menu from "$lib/registry/ui/dropdown-menu/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import CommentComposer from "./comment-composer.svelte";
	import ReactionChips from "./reaction-chips.svelte";
	import ReactionPicker from "./reaction-picker.svelte";
	import RichDescription from "./rich-description.svelte";
	import type { IssueActivityUser, IssueComment, IssueCommentDraft } from "./activity-model.js";

	let {
		comment,
		viewer,
		chinese,
		portal,
		reply = false,
		onEdit,
		onReaction,
		onResolution,
		resolved = false,
	}: {
		comment: IssueComment;
		viewer: IssueActivityUser;
		chinese: boolean;
		portal: { to: string };
		reply?: boolean;
		onEdit: (draft: IssueCommentDraft) => void;
		onReaction?: (emoji: string, active: boolean) => void;
		onResolution?: (resolved: boolean) => void;
		resolved?: boolean;
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
	const ownComment = $derived(comment.author.id === viewer.id);
	let editing = $state(false);
	let addButton = $state<HTMLButtonElement | null>(null);
	let trigger = $state<HTMLButtonElement | null>(null);

	async function closeEdit() {
		editing = false;
		await tick();
		trigger?.focus();
	}
</script>

<article
	class="min-w-0 px-4 py-3"
	aria-label={reply ? text("线程回复", "Thread reply") : text("评论内容", "Comment content")}
>
	<header class="flex min-w-0 items-center gap-2 text-[13px]">
		<Avatar.Root aria-hidden="true" class="size-[18px]">
			<Avatar.Fallback
				class="bg-(--activity-avatar) text-[8px] text-(--activity-avatar-foreground)"
			>
				{comment.author.initials ?? comment.author.name.slice(0, 2)}
			</Avatar.Fallback>
		</Avatar.Root>
		<span class="truncate font-medium">{comment.author.name}</span>
		<time datetime={comment.createdAt} class="shrink-0 text-xs text-muted-foreground"
			>{date.format(new Date(comment.createdAt))}</time
		>
		{#if comment.editedAt}<span class="shrink-0 text-xs text-muted-foreground"
				>{text("已编辑", "Edited")}</span
			>{/if}
		{#if !editing && onReaction}
			<div class="ms-auto">
				<ReactionPicker
					{chinese}
					{portal}
					bind:trigger={addButton}
					label={reply ? text("回应回复", "React to reply") : text("回应评论", "React to comment")}
					onSelect={(emoji) =>
						onReaction?.(
							emoji,
							!comment.reactions?.some(
								(reaction) =>
									reaction.emoji === emoji && reaction.users.some((user) => user.id === viewer.id)
							)
						)}
				/>
			</div>
		{/if}
		{#if !editing && (ownComment || onResolution)}
			<Menu.Root>
				<Menu.Trigger
					bind:ref={trigger}
					aria-label={text("评论选项", "Comment options")}
					data-thread-options={!reply ? "" : undefined}
					class={[
						"inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring",
						!onReaction && "ms-auto",
					]}
				>
					<IconPlaceholder
						lucide="MoreHorizontalIcon"
						tabler="IconDots"
						hugeicons="MoreHorizontalCircle01Icon"
						phosphor="DotsThreeIcon"
						remixicon="RiMoreLine"
						class="size-3.5"
						aria-hidden="true"
					/>
				</Menu.Trigger>
				<Menu.Content
					appearance="surface"
					portalProps={portal}
					align="end"
					onCloseAutoFocus={(event) => {
						if (editing) event.preventDefault();
					}}
				>
					{#if ownComment}
						<Menu.Item onSelect={() => (editing = true)}
							>{text("编辑评论", "Edit comment")}</Menu.Item
						>
					{/if}
					{#if onResolution}
						<Menu.Item onSelect={() => onResolution?.(!resolved)}>
							{resolved
								? text("重新打开线程", "Reopen thread")
								: text("解决线程", "Resolve thread")}
						</Menu.Item>
					{/if}
				</Menu.Content>
			</Menu.Root>
		{/if}
	</header>
	<div class={reply ? "mt-1 min-w-0 ps-[26px]" : "mt-1 min-w-0"}>
		{#if editing}
			<CommentComposer
				mode="edit"
				{chinese}
				{portal}
				initial={comment}
				onCancel={closeEdit}
				onCommit={(draft) => {
					onEdit(draft);
					void closeEdit();
				}}
			/>
		{:else}
			{#if comment.content}
				<RichDescription content={comment.content} slot="issue-comment-body" />
			{:else if comment.body}
				<p
					data-slot="issue-comment-body"
					class="text-[15px] leading-6 break-words whitespace-pre-wrap"
				>
					{comment.body}
				</p>
			{/if}
			{#if comment.attachments?.length}
				<ul
					aria-label={text("评论附件", "Comment attachments")}
					class="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground"
				>
					{#each comment.attachments as file}
						<li
							class="max-w-full truncate rounded-full border border-(--activity-border) px-2 py-1"
						>
							{file.name}
						</li>
					{/each}
				</ul>
			{/if}
			{#if onReaction && comment.reactions?.length}
				<div class="mt-2">
					<ReactionChips
						reactions={comment.reactions}
						{chinese}
						viewerId={viewer.id}
						{addButton}
						{onReaction}
					/>
				</div>
			{/if}
		{/if}
	</div>
</article>
