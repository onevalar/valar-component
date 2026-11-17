<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import {
		IssueDetail,
		applyIssueActivityAction,
		applyIssueCollaborationAction,
		type IssueCollaborationState,
		type IssueDetailValue,
	} from "$lib/registry/ui/issue-detail/index.js";

	const chinese = $derived(getLocale() === "zh");
	const viewer = { id: "mira", name: "Mira Chen" };
	const colleague = { id: "jules", name: "Jules Kim" };
	const createdAt = "2026-03-03T13:00:00Z";
	const command =
		'pnpm --filter docs exec playwright test issue-detail-alignment.spec.ts --grep "Issue Detail keeps inline comments and separate drafts"';
	let changes: Partial<IssueDetailValue> = $state({});
	let activity = $state<IssueCollaborationState>({
		entries: [{ kind: "event", id: "created", author: viewer, createdAt }],
		subscribers: [colleague],
		reactions: [],
	});
	const summary = $derived(
		chinese ? "检查选项菜单关闭后是否恢复焦点。" : "Check focus restoration after closing the menu."
	);
	const issue: IssueDetailValue = $derived({
		id: "VLR-103",
		title: chinese ? "完善键盘导航" : "Finish keyboard navigation",
		description: summary + "\n" + command,
		descriptionContent: {
			type: "doc",
			content: [
				{ type: "paragraph", content: [{ type: "text", text: summary }] },
				{ type: "codeBlock", content: [{ type: "text", text: command }] },
			],
		},
		status: "progress",
		priority: "high",
		...changes,
	});
</script>

<div class="w-full min-w-0">
	<IssueDetail
		{issue}
		{chinese}
		embedded
		activity={{
			entries: activity.entries,
			viewer,
			onAction: (action) =>
				(activity = {
					...activity,
					entries: applyIssueActivityAction(activity.entries, action, viewer),
				}),
			collaboration: {
				people: [viewer, colleague],
				subscribers: activity.subscribers,
				reactions: activity.reactions,
				onAction: (action) => (activity = applyIssueCollaborationAction(activity, action, viewer)),
			},
		}}
		assignees={[{ id: "mira", label: "Mira Chen" }]}
		projects={[{ id: "docs", label: chinese ? "组件文档" : "Component documentation" }]}
		labelOptions={[{ id: "a11y", label: chinese ? "无障碍" : "Accessibility" }]}
		onUpdate={(patch) => (changes = { ...changes, ...patch })}
	/>
</div>
