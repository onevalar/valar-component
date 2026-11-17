<script lang="ts">
	import RichDescription from "$lib/registry/ui/issue-detail/rich-description.svelte";
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { IssueComposer, type IssueDraft } from "$lib/registry/ui/issue-composer/index.js";

	const chinese = $derived(getLocale() === "zh");
	let open = $state(false);
	let trigger = $state<HTMLButtonElement | null>(null);
	let latest = $state<IssueDraft>();
	let savedDraft = $state("");
	const teams = $derived([
		{ id: "design", label: chinese ? "设计" : "Design" },
		{ id: "operations", label: chinese ? "运营" : "Operations" },
	]);
	const assignees = [
		{ id: "jordan", label: "Jordan", teamIds: ["design"] },
		{ id: "morgan", label: "Morgan", teamIds: ["operations"] },
	];
	const projects = $derived([
		{ id: "website", label: chinese ? "文档站" : "Documentation", teamIds: ["design"] },
		{ id: "launch", label: chinese ? "发布" : "Launch", teamIds: ["operations"] },
	]);
	const labels = $derived([
		{ id: "accessibility", label: chinese ? "无障碍" : "Accessibility" },
		{ id: "bug", label: chinese ? "缺陷" : "Bug" },
		{ id: "design", label: chinese ? "设计" : "Design", teamIds: ["design"] },
		{ id: "docs", label: chinese ? "文档" : "Documentation" },
		{ id: "feedback", label: chinese ? "反馈" : "Feedback" },
		{ id: "performance", label: chinese ? "性能" : "Performance" },
		{ id: "quality", label: chinese ? "质量" : "Quality" },
		{ id: "research", label: chinese ? "研究" : "Research" },
	]);
	const latestProperties = $derived(
		latest
			? [
					teams.find(({ id }) => id === latest?.team)?.label,
					assignees.find(({ id }) => id === latest?.assignee)?.label,
					projects.find(({ id }) => id === latest?.project)?.label,
					...labels.filter(({ id }) => latest?.labels?.includes(id)).map(({ label }) => label),
				].filter(Boolean)
			: []
	);
</script>

<div class="grid w-full max-w-sm justify-items-start gap-3">
	<Button bind:ref={trigger} onclick={() => (open = true)}>
		{chinese ? "新建问题" : "New issue"}
	</Button>
	{#if latest}
		<p role="status" class="max-w-full text-[13px] wrap-anywhere text-muted-foreground">
			{chinese ? "已创建" : "Created"} · {latest.title}
		</p>
		{#if latestProperties.length}
			<p class="max-w-full text-xs wrap-anywhere text-muted-foreground">
				{latestProperties.join(" · ")}
			</p>
		{/if}
		{#if latest.descriptionContent}
			<div class="max-w-full min-w-0">
				<RichDescription
					content={latest.descriptionContent}
					inlineMedia={latest.inlineMedia}
					{chinese}
				/>
			</div>
		{/if}
	{/if}
	{#if savedDraft}
		<p role="status" class="max-w-full text-[13px] wrap-anywhere text-muted-foreground">
			{chinese ? "已保存草稿" : "Draft saved"} · {savedDraft}
		</p>
	{/if}
</div>

<IssueComposer
	bind:open
	{chinese}
	{teams}
	{assignees}
	{projects}
	{labels}
	returnFocus={() => trigger}
	onCreate={(issue) => {
		latest = issue;
		savedDraft = "";
	}}
	onSaveDraft={(draft) => (savedDraft = draft.title || (chinese ? "无标题" : "Untitled"))}
/>
