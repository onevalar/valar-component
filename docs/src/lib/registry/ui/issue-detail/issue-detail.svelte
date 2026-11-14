<script lang="ts">
	import { tick } from "svelte";
	import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import {
		IssueGlyph,
		issueLabels,
		priorities,
		statuses,
	} from "$lib/registry/ui/issue-composer/index.js";
	import DescriptionEditor from "./description-editor.svelte";
	import IssueActivity from "./issue-activity.svelte";
	import IssueProperty from "./issue-property.svelte";
	import ReactionChips from "./reaction-chips.svelte";
	import ReactionPicker from "./reaction-picker.svelte";
	import RichDescription from "./rich-description.svelte";
	import { issueActivityChanges, type IssueActivityOptions } from "./activity-model.js";
	import {
		descriptionFromText,
		type IssueDetailOption,
		type IssueDetailUpdate,
		type IssueDetailValue,
	} from "./model.js";
	import type { Editor } from "@tiptap/core";

	let {
		issue,
		chinese = false,
		embedded = false,
		activity,
		assignees = [],
		projects = [],
		labelOptions = [],
		headingRef = $bindable(null),
		onUpdate,
		onBack,
	}: {
		issue: IssueDetailValue;
		chinese?: boolean;
		embedded?: boolean;
		activity?: IssueActivityOptions;
		assignees?: readonly IssueDetailOption[];
		projects?: readonly IssueDetailOption[];
		labelOptions?: readonly IssueDetailOption[];
		headingRef?: HTMLHeadingElement | null;
		onUpdate: (update: IssueDetailUpdate) => void;
		onBack?: () => void;
	} = $props();

	const id = $props.id();
	const portal = { to: '[id="' + id + '"]' };
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const label = (key: keyof typeof issueLabels) => issueLabels[key][chinese ? 0 : 1];
	const tokens = `
		--detail-panel: light-dark(lch(97.94% .5 282), lch(5.52% .4 272));
		--detail-control: light-dark(white, lch(10.149% .593 272));
		--detail-accent: light-dark(lch(53% 52.26 286.91), lch(47.918% 59.303 288.421));
		--foreground: light-dark(lch(9.794% 0 282), white);
		--muted-foreground: light-dark(lch(39.176% 1.25 282), lch(61.803% 1.2 272));
		--border: light-dark(lch(92.5% 0 282), lch(22% .85 272));
		--popover: light-dark(white, lch(16.433% 1.3 272));
		--popover-foreground: var(--foreground);
		--accent: light-dark(lch(94.854% .5 282), lch(14.006% .593 272));
		--accent-foreground: var(--foreground);
		--muted: var(--accent);
		--ring: var(--detail-accent);
	`;
	const propertyButton = "text-muted-foreground hover:bg-accent hover:text-foreground";
	const propertyHeading =
		"sr-only @min-[860px]:not-sr-only @min-[860px]:mb-2 @min-[860px]:ps-1.5 @min-[860px]:text-[13px] @min-[860px]:font-medium @min-[860px]:text-muted-foreground";

	const propertyCopy = $derived({ portal, empty: text("没有匹配的选项", "No matching options") });
	const statusOptions = $derived(statuses.map((key) => ({ id: key, label: label(key) })));
	const priorityOptions = $derived(priorities.map((key) => ({ id: key, label: label(key) })));
	const assigneeOptions = $derived([{ id: "", label: text("未分配", "Unassigned") }, ...assignees]);
	const projectOptions = $derived([{ id: "", label: text("无项目", "No project") }, ...projects]);
	const chosenLabels = $derived(issue.labels ?? []);
	const assigneeName = $derived(
		assignees.find((option) => option.id === issue.assignee)?.label ?? issue.assignee
	);
	const projectName = $derived(
		projects.find((option) => option.id === issue.project)?.label ?? issue.project
	);
	const labelNames = $derived(
		chosenLabels.map((key) => labelOptions.find((option) => option.id === key)?.label ?? key)
	);
	const content = $derived(
		issue.descriptionContent ?? descriptionFromText(issue.description ?? "")
	);

	type EditOrigin = "title" | "description";
	let editing = $state<EditOrigin>();
	let title = $state("");
	let changedDescription = $state(false);
	let invalidTitle = $state(false);
	let editor = $state.raw<Editor | null>(null);
	let reactionButton = $state<HTMLButtonElement | null>(null);
	let titleInput = $state<HTMLInputElement | null>(null);
	let titleButton = $state<HTMLButtonElement | null>(null);
	let descriptionButton = $state<HTMLButtonElement | null>(null);
	let form: HTMLFormElement;

	async function beginEdit(origin: EditOrigin) {
		title = issue.title;
		invalidTitle = false;
		changedDescription = false;
		editing = origin;
		await tick();
		if (origin === "title") titleInput?.focus();
	}

	async function stopEdit() {
		const origin = editing;
		editing = undefined;
		editor = null;
		await tick();
		(origin === "title" ? titleButton : descriptionButton)?.focus();
	}

	function save(event: SubmitEvent) {
		event.preventDefault();
		const nextTitle = title.trim();
		if (!nextTitle) {
			invalidTitle = true;
			titleInput?.focus();
			return;
		}
		const update: IssueDetailUpdate = {};
		if (nextTitle !== issue.title) update.title = nextTitle;
		if (editor && changedDescription) {
			update.description = editor.getText({ blockSeparator: "\n" });
			update.descriptionContent = editor.isEmpty ? undefined : editor.getJSON();
		}
		if (Object.keys(update).length) updateIssue(update);
		void stopEdit();
	}

	function editKeys(event: KeyboardEvent) {
		if (
			!editing ||
			event.isComposing ||
			!(event.target instanceof Node) ||
			!form.contains(event.target)
		)
			return;
		if (event.key === "Escape") {
			event.preventDefault();
			void stopEdit();
		}
		if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			if (!event.repeat) form.requestSubmit();
		}
	}

	function updateIssue(update: IssueDetailUpdate) {
		const changes = activity ? issueActivityChanges(issue, update) : [];
		onUpdate(update);
		if (changes.length) activity?.onAction({ type: "update", changes });
	}

	function toggleLabel(key: string) {
		updateIssue({
			labels: chosenLabels.includes(key)
				? chosenLabels.filter((value) => value !== key)
				: [...chosenLabels, key],
		});
	}
</script>

<svelte:window onkeydown={editKeys} />

<section
	{id}
	style={tokens}
	aria-label={text("问题详情", "Issue details")}
	class={[
		"@container min-w-0 text-foreground [color-scheme:light] dark:[color-scheme:dark]",
		!embedded && "rounded-[10px] border border-border bg-(--detail-panel)",
	]}
>
	{#if !embedded}
		<header class="min-w-0 border-b border-border px-3 sm:px-4">
			<Breadcrumb.Root appearance="workspace" aria-label={text("问题路径", "Issue location")}>
				<Breadcrumb.List>
					{#if onBack}
						<Breadcrumb.Item>
							<Breadcrumb.Link>
								{#snippet child({ props })}
									<button
										type="button"
										class={props.class}
										data-slot={props["data-slot"]}
										onclick={onBack}
										aria-label={text("返回我的问题", "Back to My issues")}
										>{text("我的问题", "My issues")}</button
									>
								{/snippet}
							</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator />
					{/if}
					<Breadcrumb.Item>
						<Breadcrumb.Page>{issue.id} {issue.title}</Breadcrumb.Page>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</header>
	{/if}

	<div
		class={[
			"mx-auto grid max-w-[1150px] content-start gap-y-5 px-4 py-7 sm:px-8 sm:py-10 @min-[860px]:grid-cols-[minmax(0,1fr)_224px] @min-[860px]:gap-x-12 @min-[1050px]:px-12",
			activity ? "@min-[860px]:grid-rows-[max-content_max-content_1fr]" : "min-h-[440px]",
		]}
	>
		<form bind:this={form} onsubmit={save} class="contents">
			<div class="min-w-0 @min-[860px]:col-start-1 @min-[860px]:row-start-1">
				{#if editing}
					<Input
						bind:ref={titleInput}
						bind:value={title}
						aria-label={text("问题标题", "Issue title")}
						aria-required="true"
						aria-invalid={invalidTitle}
						aria-describedby={invalidTitle ? id + "-title-error" : undefined}
						maxlength={160}
						oninput={() => (invalidTitle = false)}
						class="h-9 rounded-md border-border bg-(--detail-control) px-2 text-[24px] leading-8 font-semibold tracking-tight md:text-[24px]"
					/>
					{#if invalidTitle}<p
							id={id + "-title-error"}
							role="alert"
							class="mt-1 text-xs text-destructive"
						>
							{text("请输入问题标题。", "Enter an issue title.")}
						</p>{/if}
				{:else}
					<h2
						tabindex="-1"
						bind:this={headingRef}
						aria-label={issue.title}
						class="text-[24px] leading-8 font-semibold tracking-tight outline-none"
					>
						<Button
							bind:ref={titleButton}
							variant="ghost"
							aria-label={text("编辑标题", "Edit title")}
							class="-ms-1 h-auto max-w-full justify-start rounded-md px-1 py-0 text-left text-[24px] leading-8 font-semibold break-words whitespace-normal hover:bg-accent"
							onclick={() => beginEdit("title")}>{issue.title}</Button
						>
					</h2>
				{/if}
			</div>

			<aside
				aria-label={text("问题属性", "Issue properties")}
				class={[
					"flex min-w-0 flex-wrap gap-1.5 @min-[860px]:col-start-2 @min-[860px]:row-start-1 @min-[860px]:block @min-[860px]:space-y-7",
					activity ? "@min-[860px]:row-span-3" : "@min-[860px]:row-span-2",
				]}
			>
				<div class="contents @min-[860px]:block">
					<h3 class={propertyHeading}>{text("属性", "Properties")}</h3>
					<IssueProperty
						label={text("更改状态", "Change status")}
						placeholder={text("搜索状态…", "Search statuses…")}
						{...propertyCopy}
						options={statusOptions}
						selected={[issue.status]}
						onSelect={(value) => updateIssue({ status: value as IssueDetailValue["status"] })}
					>
						{#snippet glyph(value)}<IssueGlyph
								value={value as IssueDetailValue["status"]}
							/>{/snippet}
						<IssueGlyph value={issue.status} />{label(issue.status)}
					</IssueProperty>
					<IssueProperty
						label={text("更改优先级", "Change priority")}
						placeholder={text("搜索优先级…", "Search priorities…")}
						{...propertyCopy}
						options={priorityOptions}
						selected={[issue.priority]}
						onSelect={(value) => updateIssue({ priority: value as IssueDetailValue["priority"] })}
					>
						{#snippet glyph(value)}<IssueGlyph
								value={value as IssueDetailValue["priority"]}
							/>{/snippet}
						<IssueGlyph value={issue.priority} />{issue.priority === "none"
							? text("设置优先级", "Set priority")
							: label(issue.priority)}
					</IssueProperty>
					<IssueProperty
						label={text("更改负责人", "Change assignee")}
						placeholder={text("搜索负责人…", "Search assignees…")}
						{...propertyCopy}
						options={assigneeOptions}
						selected={[issue.assignee ?? ""]}
						onSelect={(value) => updateIssue({ assignee: value || undefined })}
					>
						<span
							aria-hidden="true"
							class="grid size-3.5 shrink-0 place-items-center rounded-full border border-dashed text-[8px] leading-none"
							>{assigneeName?.slice(0, 1) ?? "◦"}</span
						>
						<span class="truncate">{assigneeName ?? text("分配负责人", "Assign")}</span>
					</IssueProperty>
				</div>
				<div class="contents @min-[860px]:block">
					<h3 class={propertyHeading}>{text("标签", "Labels")}</h3>
					<IssueProperty
						label={text("更改标签", "Change labels")}
						placeholder={text("搜索标签…", "Search labels…")}
						{...propertyCopy}
						options={labelOptions}
						selected={chosenLabels}
						multiple
						onSelect={toggleLabel}
					>
						<span aria-hidden="true" class="grid size-3.5 shrink-0 place-items-center text-[13px]"
							>◇</span
						>
						<span class="truncate"
							>{labelNames.length ? labelNames.join("、") : text("添加标签", "Add label")}</span
						>
					</IssueProperty>
				</div>
				<div class="contents @min-[860px]:block">
					<h3 class={propertyHeading}>{text("项目", "Project")}</h3>
					<IssueProperty
						label={text("更改项目", "Change project")}
						placeholder={text("搜索项目…", "Search projects…")}
						{...propertyCopy}
						options={projectOptions}
						selected={[issue.project ?? ""]}
						onSelect={(value) => updateIssue({ project: value || undefined })}
					>
						<span aria-hidden="true" class="grid size-3.5 shrink-0 place-items-center text-[13px]"
							>⬡</span
						>
						<span class="truncate">{projectName ?? text("添加到项目", "Add to project")}</span>
					</IssueProperty>
				</div>
			</aside>

			<div class="min-w-0 space-y-3 @min-[860px]:col-start-1 @min-[860px]:row-start-2">
				{#if editing}
					<DescriptionEditor
						bind:editor
						{content}
						{chinese}
						focusOnMount={editing === "description"}
						onChange={() => (changedDescription = true)}
					/>
					<div class="flex justify-end gap-2">
						<Button size="sm" variant="outline" onclick={stopEdit}>{text("取消", "Cancel")}</Button>
						<Button
							size="sm"
							type="submit"
							aria-keyshortcuts="Meta+Enter Control+Enter"
							class="bg-(--detail-accent) text-white hover:bg-(--detail-accent)/90"
							>{text("保存", "Save")}</Button
						>
					</div>
				{:else}
					{#if issue.descriptionContent || issue.description}<RichDescription {content} />{/if}
					<Button
						bind:ref={descriptionButton}
						size="sm"
						variant="ghost"
						class="-ms-2 px-2 text-xs {propertyButton}"
						onclick={() => beginEdit("description")}
					>
						{issue.descriptionContent || issue.description
							? text("编辑描述", "Edit description")
							: text("添加描述…", "Add description…")}
					</Button>
				{/if}

				{#if !editing && activity?.collaboration}
					<div class="flex flex-wrap items-center gap-1">
						<ReactionChips
							reactions={activity.collaboration.reactions}
							{chinese}
							viewerId={activity.viewer.id}
							addButton={reactionButton}
							onReaction={(emoji, active) =>
								activity?.collaboration?.onAction({ type: "react", emoji, active })}
						/>
						<ReactionPicker
							{chinese}
							{portal}
							bind:trigger={reactionButton}
							label={text("回应问题", "React to issue")}
							onSelect={(emoji) => {
								if (!activity?.collaboration) return;
								const active = activity.collaboration.reactions.some(
									(reaction) =>
										reaction.emoji === emoji &&
										reaction.users.some((user) => user.id === activity?.viewer.id)
								);
								activity.collaboration.onAction({ type: "react", emoji, active: !active });
							}}
						/>
					</div>
				{/if}
				{#if issue.attachments?.length}
					<ul
						aria-label={text("附件", "Attachments")}
						class="flex flex-wrap gap-1.5 text-xs text-muted-foreground"
					>
						{#each issue.attachments as file}
							<li class="max-w-full truncate rounded-full border border-border px-2 py-1">
								{file.name}
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</form>
		{#if activity}
			<div class="min-w-0 @min-[860px]:col-start-1 @min-[860px]:row-start-3">
				<IssueActivity {activity} {chinese} {portal} />
			</div>
		{/if}
	</div>
</section>
