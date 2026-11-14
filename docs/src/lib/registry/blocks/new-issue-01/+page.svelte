<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import {
		IssueComposer,
		issueLabels,
		type IssueDraft,
	} from "$lib/registry/ui/issue-composer/index.js";

	let { chinese = false }: { chinese?: boolean } = $props();
	const text = (zh: string, en: string) => (chinese ? zh : en);
	let open = $state(false);
	let opener = $state<HTMLButtonElement | null>(null);
	let issues = $state<IssueDraft[]>([]);
</script>

<section
	aria-label={text("新建问题预览", "New issue preview")}
	class="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6"
>
	<Button bind:ref={opener} shape="pill" onclick={() => (open = true)}
		>{text("新建问题", "New issue")}</Button
	>
	<p role="status" class="mt-4 text-sm text-muted-foreground">
		{text(
			`本次预览已创建 ${issues.length} 个问题`,
			`${issues.length} ${issues.length === 1 ? "issue" : "issues"} created in this preview`
		)}
	</p>
	{#if issues.length}
		<ol class="mt-3 divide-y divide-border">
			{#each issues as issue}
				<li class="space-y-1 py-3 text-sm">
					<p class="font-semibold break-words">{issue.title}</p>
					<p class="text-xs text-muted-foreground">
						{issueLabels[issue.status][chinese ? 0 : 1]} · {issueLabels[issue.priority][
							chinese ? 0 : 1
						]}
					</p>
					{#if issue.description}
						<p class="break-words whitespace-pre-wrap">{issue.description}</p>
					{/if}
					{#if issue.attachments.length}
						<p class="text-xs break-words text-muted-foreground">
							{issue.attachments.map((file) => file.name).join(" · ")}
						</p>
					{/if}
				</li>
			{/each}
		</ol>
	{/if}
</section>

<IssueComposer
	bind:open
	{chinese}
	returnFocus={() => opener}
	onCreate={(issue) => (issues = [issue, ...issues])}
/>
