export { default as IssueDetail, type IssueDetailProps } from "./IssueDetail.vue";
export type { IssueDetailValue, IssueDetailOption, IssueDetailUpdate } from "./model.js";
export { applyIssueActivityAction, applyIssueCollaborationAction } from "./activity-model.js";
export type {
	IssueActivityAction,
	IssueActivityEntry,
	IssueActivityEvent,
	IssueActivityOptions,
	IssueActivityUser,
	IssueComment,
	IssueCommentDraft,
	IssueCommentThread,
	IssueCollaborationAction,
	IssueCollaborationOptions,
	IssueCollaborationState,
	IssueReaction,
	IssueThreadResolution,
} from "./activity-model.js";
