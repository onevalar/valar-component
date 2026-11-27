"use client";

import * as React from "react";
import { ChevronsUpDownIcon, CircleCheckIcon, MoreHorizontalIcon, UsersIcon } from "lucide-react";
import { Button } from "./button.tsx";
import { Combobox } from "./combobox.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./dropdown-menu.tsx";
import { issueLabels } from "./issue-composer.tsx";
import { CommentComposer } from "./issue-detail-comment-composer.tsx";
import { iconControl, IssuePortal, IssueReactions } from "./issue-detail-controls.tsx";
import { isComposing } from "./issue-detail-editor-core.ts";
import { RichDescription } from "./issue-detail-editor.tsx";
import type {
	IssueActivityFieldChange,
	IssueActivityOptions,
	IssueActivityUser,
	IssueCollaborationOptions,
	IssueComment,
	IssueCommentDraft,
	IssueCommentThread,
} from "./issue-detail-activity-model.ts";

const activityTokens = {
	"--activity-card": "light-dark(white, lch(9.232% .85 272))",
	"--activity-border": "light-dark(lch(91.9% 0 282), lch(16.793% 1.93 272))",
	"--activity-placeholder": "light-dark(lch(43% 1 282), lch(61.803% 1.2 272))",
	"--activity-avatar": "light-dark(lch(86% 15 240), lch(32% 26 248))",
	"--activity-avatar-foreground": "light-dark(lch(29% 21 245), lch(94% 6 240))",
} as React.CSSProperties;

const fields = {
	title: ["标题", "title"],
	description: ["描述", "description"],
	status: ["状态", "status"],
	priority: ["优先级", "priority"],
	assignee: ["负责人", "assignee"],
	project: ["项目", "project"],
	labels: ["标签", "labels"],
} as const;

function Avatar({ user, event = false }: { user: IssueActivityUser; event?: boolean }) {
	return (
		<span
			aria-hidden="true"
			className={`inline-grid shrink-0 place-items-center rounded-full bg-(--activity-avatar) text-(--activity-avatar-foreground) ${event ? "mt-0.5 size-3.5 text-[7px]" : "size-[18px] text-[8px]"}`}
		>
			{user.initials ?? user.name.slice(0, 2)}
		</span>
	);
}

function dateText(value: string, chinese: boolean) {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? value
		: new Intl.DateTimeFormat(chinese ? "zh-CN" : "en", {
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
				timeZone: "UTC",
			}).format(date);
}

export function IssueActivity({
	activity,
	chinese,
}: {
	activity: IssueActivityOptions;
	chinese: boolean;
}) {
	const t = (zh: string, en: string) => (chinese ? zh : en);
	const [subscribersOpen, setSubscribersOpen] = React.useState(false);
	const { collaboration, viewer, entries, onAction } = activity;
	function describe(change: IssueActivityFieldChange) {
		const index = chinese ? 0 : 1;
		const field = fields[change.field][index];
		if (change.field !== "status" && change.field !== "priority")
			return t(`更新了${field}`, `updated the ${field}`);
		const from = issueLabels[change.from][index];
		const to = issueLabels[change.to][index];
		return t(`将${field}从「${from}」改为「${to}」`, `changed the ${field} from ${from} to ${to}`);
	}
	return (
		<section
			aria-label={t("问题活动", "Issue activity")}
			data-slot="issue-activity"
			style={activityTokens}
			className="min-w-0 space-y-4 border-t border-(--activity-border) pt-4"
			onKeyDown={(event) => {
				if (
					!collaboration ||
					event.defaultPrevented ||
					isComposing(event.nativeEvent) ||
					event.repeat ||
					event.altKey ||
					!event.shiftKey ||
					event.key.toLowerCase() !== "s" ||
					!(event.target instanceof HTMLElement) ||
					event.target.closest("input, textarea, [contenteditable]")
				)
					return;
				event.preventDefault();
				if (event.metaKey || event.ctrlKey) setSubscribersOpen(true);
				else
					collaboration.onAction({
						type: "subscribe",
						user: viewer,
						subscribed: !collaboration.subscribers.some(({ id }) => id === viewer.id),
					});
			}}
		>
			<header className="flex min-h-8 flex-wrap items-center justify-between gap-2">
				<h3 className="text-[15px] leading-6 font-medium">{t("活动", "Activity")}</h3>
				{collaboration && (
					<Subscribers
						viewer={viewer}
						collaboration={collaboration}
						chinese={chinese}
						open={subscribersOpen}
						onOpenChange={setSubscribersOpen}
					/>
				)}
			</header>
			{entries.length > 0 && (
				<ol aria-label={t("活动时间线", "Activity timeline")} className="space-y-4">
					{entries.map((entry) =>
						entry.kind === "event" ? (
							<li
								key={entry.id}
								className="flex min-w-0 items-start gap-2 px-2 text-xs leading-5 text-muted-foreground sm:px-4"
							>
								<Avatar user={entry.author} event />
								<span className="min-w-0 wrap-anywhere">
									{entry.author.name}{" "}
									{entry.changes?.length
										? entry.changes.map(describe).join(t("，", ", "))
										: t("创建了问题", "created this issue")}
									<span aria-hidden="true"> · </span>
									<time dateTime={entry.createdAt}>{dateText(entry.createdAt, chinese)}</time>
								</span>
							</li>
						) : (
							<ActivityThread key={entry.id} entry={entry} activity={activity} chinese={chinese} />
						)
					)}
				</ol>
			)}
			<CommentComposer
				mode="post"
				chinese={chinese}
				onCommit={(draft) => onAction({ type: "post", draft })}
			/>
		</section>
	);
}

function Subscribers({
	collaboration,
	viewer,
	chinese,
	open,
	onOpenChange,
}: {
	collaboration: IssueCollaborationOptions;
	viewer: IssueActivityUser;
	chinese: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const container = React.useContext(IssuePortal);
	const portal = React.useRef<HTMLDivElement>(null);
	const t = (zh: string, en: string) => (chinese ? zh : en);
	const subscribers = collaboration.subscribers.map(({ id }) => id);
	const people = new Map(
		[...collaboration.subscribers, ...collaboration.people, viewer].map((person) => [
			person.id,
			person,
		])
	);
	const subscribed = subscribers.includes(viewer.id);
	return (
		<div className="flex shrink-0 items-center gap-1.5">
			<Button
				type="button"
				variant="ghost"
				size="xs"
				aria-pressed={subscribed}
				aria-keyshortcuts="Shift+S"
				className="h-7 rounded-full px-2 text-xs text-muted-foreground hover:text-foreground"
				onClick={() =>
					collaboration.onAction({ type: "subscribe", user: viewer, subscribed: !subscribed })
				}
			>
				{subscribed ? t("取消订阅", "Unsubscribe") : t("订阅", "Subscribe")}
			</Button>
			<Combobox
				label={t("管理订阅者", "Change subscribers")}
				placeholder={t("搜索订阅者…", "Search subscribers…")}
				empty={t("没有匹配的成员", "No matching people")}
				open={open}
				onOpenChange={onOpenChange}
				align="end"
				className="h-7! min-h-0 min-w-7 rounded-full border-transparent! bg-transparent! px-1! shadow-none! hover:bg-accent!"
				contentClassName="w-56!"
				portalProps={{ container: portal.current ?? container }}
				multiple
				value={subscribers}
				options={[...people.values()].map((user) => ({ id: user.id, label: user.name }))}
				triggerProps={{
					"aria-keyshortcuts": "Meta+Shift+S Control+Shift+S",
					title:
						collaboration.subscribers.map(({ name }) => name).join(t("、", ", ")) ||
						t("无订阅者", "No subscribers"),
				}}
				onSelect={(id) => {
					const user = people.get(id);
					if (user)
						collaboration.onAction({
							type: "subscribe",
							user,
							subscribed: !subscribers.includes(id),
						});
				}}
				renderOption={(option) => {
					const user = people.get(option.id);
					return (
						<>
							{user && <Avatar user={user} />}
							<span className="min-w-0 flex-1 truncate">{option.label}</span>
						</>
					);
				}}
			>
				{collaboration.subscribers.length ? (
					<>
						<span className="flex -space-x-1.5 rtl:space-x-reverse">
							{collaboration.subscribers.slice(0, 3).map((user) => (
								<Avatar key={user.id} user={user} />
							))}
						</span>
						{collaboration.subscribers.length > 3 && (
							<span className="text-[10px]">+{collaboration.subscribers.length - 3}</span>
						)}
					</>
				) : (
					<UsersIcon aria-hidden="true" className="size-3.5" />
				)}
			</Combobox>
			<div ref={portal} />
		</div>
	);
}

function ActivityThread({
	entry,
	activity,
	chinese,
}: {
	entry: IssueCommentThread;
	activity: IssueActivityOptions;
	chinese: boolean;
}) {
	const t = (zh: string, en: string) => (chinese ? zh : en);
	const id = React.useId();
	const [expanded, setExpanded] = React.useState(false);
	const summary = React.useRef<HTMLButtonElement>(null);
	const panel = React.useRef<HTMLDivElement>(null);
	const target = React.useRef<boolean | null>(null);
	const resolved = !!entry.resolution;
	const authors = [
		...new Map([entry, ...entry.replies].map(({ author }) => [author.id, author.name])).values(),
	];
	const names = new Intl.ListFormat(chinese ? "zh-CN" : "en").format(authors);
	const count = entry.replies.length + 1;
	const conclusion = entry.replies.find(({ id }) => id === entry.resolution?.replyId);
	const { collaboration, viewer, onAction } = activity;
	React.useLayoutEffect(() => {
		if (!resolved) setExpanded(false);
		if (target.current !== resolved) return;
		target.current = null;
		if (resolved) summary.current?.focus();
		else panel.current?.querySelector<HTMLButtonElement>("[data-thread-options]")?.focus();
	}, [resolved]);
	function comment(item: IssueComment, reply = false) {
		return (
			<ActivityComment
				comment={item}
				chinese={chinese}
				viewer={viewer}
				reply={reply}
				resolved={resolved}
				onEdit={(draft) =>
					onAction({ type: "edit", commentId: item.id, threadId: entry.id, draft })
				}
				onReaction={
					collaboration &&
					((emoji, active) =>
						collaboration.onAction({
							type: "react",
							emoji,
							active,
							comment: { threadId: entry.id, commentId: item.id },
						}))
				}
				onResolution={
					collaboration &&
					((next) => {
						target.current = next;
						if (next) setExpanded(false);
						collaboration.onAction({
							type: "resolve",
							threadId: entry.id,
							resolved: next,
							replyId: reply ? item.id : undefined,
						});
					})
				}
			/>
		);
	}
	return (
		<li
			data-slot="issue-comment-thread"
			className="min-w-0 rounded-[8px] border border-(--activity-border) bg-(--activity-card)"
		>
			{entry.resolution && (
				<Button
					ref={summary}
					type="button"
					variant="ghost"
					shape="square"
					aria-expanded={expanded}
					aria-controls={id}
					title={`${t("解决者", "Resolved by")} · ${entry.resolution.by.name}`}
					className="h-auto min-h-11 w-full justify-start gap-2 rounded-[7px] bg-(--detail-control) px-4 py-2 text-start text-[13px] font-normal whitespace-normal text-muted-foreground hover:bg-accent hover:text-foreground"
					onClick={() => setExpanded(!expanded)}
				>
					<CircleCheckIcon className="size-3.5 shrink-0" aria-hidden="true" />
					<span className="min-w-0 flex-1">
						<span className="block truncate">
							{expanded
								? t("收起已解决线程", "Collapse resolved thread")
								: t(
										`已解决 · ${count} 条评论 · ${names}`,
										`${count} resolved ${count === 1 ? "comment" : "comments"} from ${names}`
									)}
						</span>
						{!expanded && conclusion?.body && (
							<span className="block truncate text-xs">{conclusion.body}</span>
						)}
					</span>
					<ChevronsUpDownIcon className="size-3.5 shrink-0" aria-hidden="true" />
				</Button>
			)}
			<div ref={panel} id={id} hidden={resolved && !expanded}>
				{comment(entry)}
				{entry.replies.length > 0 && (
					<ol
						aria-label={t("线程回复", "Thread replies")}
						className="border-t border-(--activity-border)"
					>
						{entry.replies.map((reply) => (
							<li
								key={reply.id}
								className={`not-first:border-t not-first:border-(--activity-border) ${entry.resolution?.replyId === reply.id ? "bg-accent" : ""}`}
							>
								{comment(reply, true)}
							</li>
						))}
					</ol>
				)}
				<CommentComposer
					mode="reply"
					chinese={chinese}
					onCommit={(draft) => {
						onAction({ type: "reply", threadId: entry.id, draft });
					}}
				/>
			</div>
		</li>
	);
}

function ActivityComment({
	comment,
	viewer,
	chinese,
	reply,
	resolved,
	onEdit,
	onReaction,
	onResolution,
}: {
	comment: IssueComment;
	viewer: IssueActivityUser;
	chinese: boolean;
	reply: boolean;
	resolved: boolean;
	onEdit: (draft: IssueCommentDraft) => void;
	onReaction?: (emoji: string, active: boolean) => void;
	onResolution?: (resolved: boolean) => void;
}) {
	const container = React.useContext(IssuePortal);
	const t = (zh: string, en: string) => (chinese ? zh : en);
	const [editing, setEditing] = React.useState(false);
	const trigger = React.useRef<HTMLButtonElement>(null);
	const moved = React.useRef(false);
	const restore = React.useRef(false);
	const own = comment.author.id === viewer.id;
	React.useLayoutEffect(() => {
		if (!editing && restore.current) {
			restore.current = false;
			trigger.current?.focus();
		}
	}, [editing]);
	function closeEdit() {
		restore.current = true;
		setEditing(false);
	}
	function render(picker?: React.ReactNode, chips?: React.ReactNode) {
		return (
			<>
				<header className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]">
					<Avatar user={comment.author} />
					<span className="min-w-0 truncate font-medium">{comment.author.name}</span>
					<time dateTime={comment.createdAt} className="shrink-0 text-xs text-muted-foreground">
						{dateText(comment.createdAt, chinese)}
					</time>
					{comment.editedAt && (
						<span className="shrink-0 text-xs text-muted-foreground">{t("已编辑", "Edited")}</span>
					)}
					{!editing && (picker || own || onResolution) && (
						<div className="ms-auto flex shrink-0 items-center gap-2">
							{picker}
							{(own || onResolution) && (
								<DropdownMenu
									modal={false}
									onOpenChange={(open) => {
										if (open) moved.current = false;
									}}
								>
									<DropdownMenuTrigger
										ref={trigger}
										type="button"
										aria-label={t("评论选项", "Comment options")}
										data-thread-options={!reply ? "" : undefined}
										className={`${iconControl} size-6`}
									>
										<MoreHorizontalIcon aria-hidden="true" />
									</DropdownMenuTrigger>
									<DropdownMenuContent
										appearance="surface"
										align="end"
										portalProps={{ container }}
										onCloseAutoFocus={(event) => {
											if (moved.current) event.preventDefault();
										}}
									>
										{own && (
											<DropdownMenuItem
												onSelect={() => {
													moved.current = true;
													setEditing(true);
												}}
											>
												{t("编辑评论", "Edit comment")}
											</DropdownMenuItem>
										)}
										{onResolution && (
											<DropdownMenuItem
												onSelect={() => {
													moved.current = true;
													trigger.current?.focus();
													onResolution(!resolved);
												}}
											>
												{resolved
													? t("重新打开线程", "Reopen thread")
													: t("解决线程", "Resolve thread")}
											</DropdownMenuItem>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					)}
				</header>
				<div className={`mt-1 min-w-0 ${reply ? "ps-[26px]" : ""}`}>
					{editing && own ? (
						<CommentComposer
							mode="edit"
							chinese={chinese}
							initial={comment}
							onCancel={closeEdit}
							onCommit={(draft) => {
								onEdit(draft);
								closeEdit();
							}}
						/>
					) : (
						<>
							{comment.content ? (
								<RichDescription content={comment.content} slot="issue-comment-body" />
							) : (
								comment.body && (
									<p
										data-slot="issue-comment-body"
										className="text-[15px] leading-6 wrap-anywhere whitespace-pre-wrap"
									>
										{comment.body}
									</p>
								)
							)}
							{!!comment.attachments?.length && (
								<ul
									aria-label={t("评论附件", "Comment attachments")}
									className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground"
								>
									{comment.attachments.map((file, index) => (
										<li
											key={index}
											className="max-w-full truncate rounded-full border border-(--activity-border) px-2 py-1"
										>
											{file.name}
										</li>
									))}
								</ul>
							)}
							{chips && <div className="mt-2">{chips}</div>}
						</>
					)}
				</div>
			</>
		);
	}
	return (
		<article
			className="min-w-0 px-4 py-3"
			aria-label={reply ? t("线程回复", "Thread reply") : t("评论内容", "Comment content")}
		>
			{!editing && onReaction ? (
				<IssueReactions
					label={reply ? t("回应回复", "React to reply") : t("回应评论", "React to comment")}
					chinese={chinese}
					reactions={comment.reactions ?? []}
					viewerId={viewer.id}
					onReaction={onReaction}
					render={render}
				/>
			) : (
				render()
			)}
		</article>
	);
}
