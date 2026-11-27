import type { IssueDetailUpdate, IssueDetailValue } from "./model.js";
import type { JSONContent } from "@tiptap/core";

export type IssueActivityUser = { id: string; name: string; initials?: string };
export type IssueReaction = { emoji: string; users: readonly IssueActivityUser[] };
export type IssueThreadResolution = {
	by: IssueActivityUser;
	at: string;
	replyId?: string;
};

export type IssueCommentDraft = {
	body: string;
	content?: JSONContent;
	attachments?: readonly File[];
};

export type IssueComment = IssueCommentDraft & {
	id: string;
	author: IssueActivityUser;
	createdAt: string;
	editedAt?: string;
	reactions?: readonly IssueReaction[];
};

export type IssueCommentThread = IssueComment & {
	kind: "comment";
	replies: readonly IssueComment[];
	resolution?: IssueThreadResolution;
};

export type IssueActivityField =
	| "title"
	| "description"
	| "status"
	| "priority"
	| "assignee"
	| "project"
	| "labels";

export type IssueActivityFieldChange =
	| { field: "status"; from: IssueDetailValue["status"]; to: IssueDetailValue["status"] }
	| { field: "priority"; from: IssueDetailValue["priority"]; to: IssueDetailValue["priority"] }
	| { field: Exclude<IssueActivityField, "status" | "priority"> };

export type IssueActivityEvent = {
	kind: "event";
	id: string;
	author: IssueActivityUser;
	createdAt: string;
	changes?: readonly IssueActivityFieldChange[];
};

export type IssueActivityEntry = IssueActivityEvent | IssueCommentThread;

export type IssueActivityAction =
	| { type: "post"; draft: IssueCommentDraft }
	| { type: "reply"; threadId: string; draft: IssueCommentDraft }
	| { type: "edit"; threadId: string; commentId: string; draft: IssueCommentDraft }
	| { type: "update"; changes: readonly IssueActivityFieldChange[] };

export type IssueActivityOptions = {
	entries: readonly IssueActivityEntry[];
	viewer: IssueActivityUser;
	onAction: (action: IssueActivityAction) => void;
	collaboration?: IssueCollaborationOptions;
};

export type IssueCollaborationAction =
	| { type: "subscribe"; user: IssueActivityUser; subscribed: boolean }
	| {
			type: "react";
			emoji: string;
			active: boolean;
			comment?: { threadId: string; commentId: string };
	  }
	| { type: "resolve"; threadId: string; resolved: boolean; replyId?: string };

export type IssueCollaborationState = {
	entries: readonly IssueActivityEntry[];
	subscribers: readonly IssueActivityUser[];
	reactions: readonly IssueReaction[];
};

export type IssueCollaborationOptions = Omit<IssueCollaborationState, "entries"> & {
	people: readonly IssueActivityUser[];
	onAction: (action: IssueCollaborationAction) => void;
};

function setUser(
	users: readonly IssueActivityUser[],
	user: IssueActivityUser,
	active: boolean
): readonly IssueActivityUser[] {
	const exists = users.some((item) => item.id === user.id);
	if (exists === active) return users;
	return active ? [...users, user] : users.filter((item) => item.id !== user.id);
}

function setReaction(
	reactions: readonly IssueReaction[],
	emoji: string,
	viewer: IssueActivityUser,
	active: boolean
): readonly IssueReaction[] {
	const reaction = reactions.find((item) => item.emoji === emoji);
	if (!reaction) return active ? [...reactions, { emoji, users: [viewer] }] : reactions;
	const users = setUser(reaction.users, viewer, active);
	if (users === reaction.users) return reactions;
	return users.length
		? reactions.map((item) => (item === reaction ? { ...item, users } : item))
		: reactions.filter((item) => item !== reaction);
}

/** Set explicit collaboration state so replaying a host action leaves the same result. */
export function applyIssueCollaborationAction(
	state: IssueCollaborationState,
	action: IssueCollaborationAction,
	viewer: IssueActivityUser
): IssueCollaborationState {
	if (action.type === "subscribe") {
		const subscribers = setUser(state.subscribers, action.user, action.subscribed);
		return subscribers === state.subscribers ? state : { ...state, subscribers };
	}
	if (action.type === "react" && !action.comment) {
		const reactions = setReaction(state.reactions, action.emoji, viewer, action.active);
		return reactions === state.reactions ? state : { ...state, reactions };
	}
	const threadId = action.type === "resolve" ? action.threadId : action.comment?.threadId;
	const entries = state.entries.map((entry) => {
		if (entry.kind !== "comment" || entry.id !== threadId) return entry;
		if (action.type === "resolve") {
			if (!!entry.resolution === action.resolved) return entry;
			const replyId = entry.replies.find((reply) => reply.id === action.replyId)?.id;
			return {
				...entry,
				resolution: action.resolved
					? { by: viewer, at: new Date().toISOString(), replyId }
					: undefined,
			};
		}
		const commentId = action.comment?.commentId;
		const react = <T extends IssueComment>(comment: T): T => {
			if (comment.id !== commentId) return comment;
			const current = comment.reactions ?? [];
			const reactions = setReaction(current, action.emoji, viewer, action.active);
			return reactions === current ? comment : { ...comment, reactions };
		};
		if (entry.id === commentId) return react(entry);
		const replies = entry.replies.map(react);
		return replies.some((reply, index) => reply !== entry.replies[index])
			? { ...entry, replies }
			: entry;
	});
	return entries.some((entry, index) => entry !== state.entries[index])
		? { ...state, entries }
		: state;
}

export function issueActivityChanges(
	issue: IssueDetailValue,
	update: IssueDetailUpdate
): IssueActivityFieldChange[] {
	const changes: IssueActivityFieldChange[] = [];
	for (const field of ["title", "assignee", "project"] as const) {
		if (Object.hasOwn(update, field) && update[field] !== issue[field]) changes.push({ field });
	}
	if (
		(Object.hasOwn(update, "description") && update.description !== issue.description) ||
		(Object.hasOwn(update, "descriptionContent") &&
			update.descriptionContent !== issue.descriptionContent)
	)
		changes.push({ field: "description" });
	if (update.status && update.status !== issue.status)
		changes.push({ field: "status", from: issue.status, to: update.status });
	if (update.priority && update.priority !== issue.priority)
		changes.push({ field: "priority", from: issue.priority, to: update.priority });
	if (
		update.labels &&
		(update.labels.length !== (issue.labels?.length ?? 0) ||
			update.labels.some((label) => !issue.labels?.includes(label)))
	)
		changes.push({ field: "labels" });
	return changes;
}

/** Apply a preview action to the latest host state. A backend can handle the same actions itself. */
export function applyIssueActivityAction(
	entries: readonly IssueActivityEntry[],
	action: IssueActivityAction,
	viewer: IssueActivityUser
): readonly IssueActivityEntry[] {
	const now = new Date().toISOString();
	if (action.type === "update") {
		return action.changes.length
			? [
					...entries,
					{
						kind: "event",
						id: crypto.randomUUID(),
						author: viewer,
						createdAt: now,
						changes: action.changes,
					},
				]
			: entries;
	}

	const draft = { ...action.draft, body: action.draft.body.trim() };
	if (!draft.body && !draft.attachments?.length) return entries;
	if (action.type === "post") {
		return [
			...entries,
			{
				...draft,
				kind: "comment",
				id: crypto.randomUUID(),
				author: viewer,
				createdAt: now,
				replies: [],
			},
		];
	}
	return entries.map((entry) => {
		if (entry.kind !== "comment" || entry.id !== action.threadId) return entry;
		if (action.type === "reply") {
			return {
				...entry,
				resolution: undefined,
				replies: [
					...entry.replies,
					{ ...draft, id: crypto.randomUUID(), author: viewer, createdAt: now },
				],
			};
		}
		const edit = <T extends IssueComment>(comment: T): T =>
			comment.id === action.commentId && comment.author.id === viewer.id
				? { ...comment, ...draft, editedAt: now }
				: comment;
		if (entry.id === action.commentId) return edit(entry);
		const replies = entry.replies.map(edit);
		return replies.some((reply, index) => reply !== entry.replies[index])
			? { ...entry, replies }
			: entry;
	});
}
