<script lang="ts">
	import { tick } from "svelte";
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";
	import DescriptionEditor from "./description-editor.svelte";
	import IssueGlyph from "./issue-glyph.svelte";
	import IssuePicker from "./issue-picker.svelte";
	import {
		issueLabels,
		priorities,
		statuses,
		type IssueComposerOption,
		type IssueDraft,
	} from "./issue-options.js";
	import { descriptionFromText, issueMediaIds, type IssueInlineMedia } from "./rich-text.js";
	import type { Editor } from "@tiptap/core";

	let {
		open = $bindable(false),
		chinese = false,
		workspace = "Valar",
		teams = [],
		assignees = [],
		projects = [],
		labels = [],
		onCreate,
		onSaveDraft,
		returnFocus,
	}: {
		open?: boolean;
		chinese?: boolean;
		workspace?: string;
		teams?: readonly IssueComposerOption[];
		assignees?: readonly IssueComposerOption[];
		projects?: readonly IssueComposerOption[];
		labels?: readonly IssueComposerOption[];
		onCreate: (draft: IssueDraft) => void;
		onSaveDraft?: (draft: IssueDraft) => void;
		returnFocus?: () => HTMLElement | null;
	} = $props();

	const id = $props.id();
	const surfaceId = `${id}-surface`;
	const portal = { to: `[id="${id}"]` };
	const menuPortal = { to: `[id="${surfaceId}"]` };
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const label = (key: keyof typeof issueLabels) => issueLabels[key][chinese ? 0 : 1];
	const baseFields = ["status", "priority"] as const;
	const statusOptions = $derived(statuses.map((id) => ({ id, label: label(id) })));
	const priorityOptions = $derived(priorities.map((id) => ({ id, label: label(id) })));
	const iconButton =
		"inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent p-0 text-foreground hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none";
	const editorField =
		"rounded-none border-0 bg-transparent! px-0 text-foreground ring-0! shadow-none! placeholder:text-(--composer-placeholder) transition-none";
	const tokens = `
		--composer-surface: light-dark(lch(100% 0 282), lch(9.232% .85 272));
		--composer-accent: light-dark(lch(53% 52.26 286.91), lch(47.918% 59.303 288.421));
		--composer-placeholder: light-dark(lch(57% 1.25 282), lch(42% 1.2 272));
		--composer-chip: light-dark(white, lch(13.861% 1.139 272));
		--detail-accent: var(--composer-accent);
		--foreground: light-dark(lch(9.794% 0 282), white);
		--muted-foreground: light-dark(lch(39.176% 1.25 282), lch(61.803% 1.2 272));
		--border: light-dark(lch(89% .5 282), lch(22% .85 272));
		--popover: light-dark(white, lch(16.433% 1.3 272));
		--popover-foreground: var(--foreground);
		--accent: light-dark(lch(94.854% .5 282), lch(24% 1.3 272));
		--accent-foreground: var(--foreground);
		--muted: var(--accent);
		--ring: var(--composer-accent);
		--settings-focus: var(--composer-accent);
		--settings-switch-on: var(--composer-accent);
		--settings-switch-off: light-dark(lch(86.75% .5 282), lch(25.69% 1.975 272));
	`;

	let title = $state("");
	let description = $state(descriptionFromText(""));
	let status = $state<IssueDraft["status"]>("backlog");
	let priority = $state<IssueDraft["priority"]>("none");
	let teamChoice = $state<string>();
	let assignee = $state("");
	let project = $state("");
	let selectedLabels = $state<string[]>([]);
	const team = $derived(teams.find(({ id }) => id === teamChoice) ?? teams[0]);
	const availableAssignees = $derived(teamOptions(assignees, team?.id));
	const availableProjects = $derived(teamOptions(projects, team?.id));
	const availableLabels = $derived(teamOptions(labels, team?.id));
	const assigneeName = $derived(availableAssignees.find(({ id }) => id === assignee)?.label);
	const projectName = $derived(availableProjects.find(({ id }) => id === project)?.label);
	const labelNames = $derived(
		availableLabels.filter(({ id }) => selectedLabels.includes(id)).map(({ label }) => label)
	);
	let attachments = $state<File[]>([]);
	let inlineMedia = $state<IssueInlineMedia[]>([]);
	let createMore = $state(false);
	let expanded = $state(false);
	let invalidTitle = $state(false);
	let dirty = $state(false);
	let confirmDraft = $state(false);
	let confirmOpener: HTMLElement | undefined;
	let saveButton = $state<HTMLButtonElement | null>(null);
	let titleInput = $state<HTMLInputElement | null>(null);
	let attachButton = $state<HTMLButtonElement | null>(null);
	let editor = $state<Editor | null>(null);
	let form: HTMLFormElement;
	let fileInput: HTMLInputElement;

	$effect(() => {
		if (!open) confirmDraft = false;
	});

	function teamOptions(options: readonly IssueComposerOption[], teamId?: string) {
		return options.filter(({ teamIds }) => !teamIds || (teamId && teamIds.includes(teamId)));
	}

	function setTeam(id: string) {
		if (team?.id === id) return;
		teamChoice = id;
		if (!teamOptions(assignees, id).some((option) => option.id === assignee)) assignee = "";
		if (!teamOptions(projects, id).some((option) => option.id === project)) project = "";
		const nextLabels = teamOptions(labels, id);
		selectedLabels = selectedLabels.filter((value) =>
			nextLabels.some((option) => option.id === value)
		);
		dirty = true;
	}

	function toggleLabel(id: string) {
		selectedLabels = selectedLabels.includes(id)
			? selectedLabels.filter((value) => value !== id)
			: [...selectedLabels, id];
		dirty = true;
	}

	function addFiles(event: Event & { currentTarget: HTMLInputElement }) {
		const files = Array.from(event.currentTarget.files ?? []);
		if (files.length) {
			attachments = [...attachments, ...files];
			dirty = true;
		}
		event.currentTarget.value = "";
	}

	function draftValue(): IssueDraft {
		const content = editor && !editor.isEmpty ? editor.getJSON() : undefined;
		const mediaIds = content ? issueMediaIds(content) : new Set<string>();
		const usedMedia = inlineMedia.filter(({ id }) => mediaIds.has(id));
		return {
			title: title.trim(),
			description: editor?.getText({ blockSeparator: "\n" }).trim() ?? "",
			...(content ? { descriptionContent: content } : {}),
			status,
			priority,
			attachments: [...attachments],
			...(usedMedia.length ? { inlineMedia: usedMedia } : {}),
			...(team ? { team: team.id } : {}),
			...(assigneeName ? { assignee } : {}),
			...(projectName ? { project } : {}),
			...(labels.length
				? {
						labels: availableLabels
							.filter(({ id }) => selectedLabels.includes(id))
							.map(({ id }) => id),
					}
				: {}),
		};
	}

	function clearText() {
		title = "";
		description = descriptionFromText("");
		editor?.commands.clearContent(false);
		attachments = [];
		inlineMedia = [];
		invalidTitle = false;
		dirty = false;
	}

	function clearProperties() {
		teamChoice = undefined;
		status = "backlog";
		priority = "none";
		assignee = "";
		project = "";
		selectedLabels = [];
	}

	function requestClose(event?: Event) {
		event?.preventDefault();
		if (!dirty) {
			open = false;
			return;
		}
		const active = document.activeElement;
		confirmOpener = active instanceof HTMLElement ? active : undefined;
		confirmDraft = true;
	}

	function closeWithDraft(save: boolean) {
		if (save) {
			description = editor?.getJSON() ?? description;
			onSaveDraft?.(draftValue());
			dirty = false;
		} else {
			clearText();
			clearProperties();
		}
		confirmDraft = false;
		open = false;
	}

	async function createIssue(event: SubmitEvent) {
		event.preventDefault();
		const trimmedTitle = title.trim();
		if (!trimmedTitle) {
			invalidTitle = true;
			titleInput?.focus();
			return;
		}

		onCreate(draftValue());
		clearText();
		if (createMore) {
			await tick();
			titleInput?.focus();
		} else {
			clearProperties();
			open = false;
		}
	}

	function handleSubmitShortcut(event: KeyboardEvent) {
		if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey) || event.isComposing)
			return false;
		event.preventDefault();
		if (!event.repeat) form.requestSubmit();
		return true;
	}
</script>

<div
	{id}
	style={tokens}
	class="[color-scheme:light] dark:[color-scheme:dark] [&>[data-slot=dialog-overlay]]:bg-black/25! [&>[data-slot=dialog-overlay]]:backdrop-blur-none! motion-reduce:[&>[data-slot=dialog-overlay]]:animate-none! dark:[&>[data-slot=dialog-overlay]]:bg-black/40!"
>
	<Tooltip.Provider delayDuration={500} skipDelayDuration={150}>
		<Dialog.Root bind:open>
			<Dialog.Content
				id={surfaceId}
				portalProps={portal}
				showCloseButton={false}
				data-expanded={expanded}
				onEscapeKeydown={requestClose}
				onInteractOutside={requestClose}
				class={`flex w-[calc(100%-24px)] translate-y-0 flex-col gap-0 rounded-[21px] bg-(--composer-surface) p-0 text-foreground shadow-[0_12px_36px_#0003] transition-[max-width,top] [transition-duration:220ms,300ms] ease-[cubic-bezier(0.43,0.07,0.59,0.94)] motion-reduce:animate-none! motion-reduce:transition-none motion-reduce:duration-0! ${
					expanded
						? "top-[max(8px,6svh)] max-w-[820px] sm:max-w-[820px]"
						: "top-[clamp(8px,13svh,calc(100svh-307px))] max-w-[750px] sm:top-[clamp(8px,13svh,calc(100svh-274px))] sm:max-w-[750px]"
				}`}
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					expanded = false;
					invalidTitle = false;
					titleInput?.focus();
				}}
				onCloseAutoFocus={(event) => {
					const target = returnFocus?.();
					if (!target) return;
					event.preventDefault();
					target.focus();
				}}
			>
				<form
					bind:this={form}
					class={`flex flex-col transition-[height] duration-300 ease-[cubic-bezier(0.43,0.07,0.59,0.94)] motion-reduce:transition-none motion-reduce:duration-0! ${
						expanded
							? "h-[min(88svh,800px,calc(100svh-16px))]"
							: "h-[min(295px,calc(100svh-16px))] sm:h-[min(262px,calc(100svh-16px))]"
					}`}
					onsubmit={createIssue}
				>
					<header class="flex h-14 shrink-0 items-center justify-between gap-2 ps-[19px] pe-2.5">
						<div class="flex min-w-0 items-center gap-2">
							<IssuePicker
								label={text("设置团队", "Set team")}
								display={team?.label ?? workspace}
								placeholder={text("更改团队…", "Change team…")}
								options={teams}
								selected={team ? [team.id] : []}
								portal={menuPortal}
								{chinese}
								disabled={teams.length < 2}
								onSelect={setTeam}
								class="max-w-32 ps-[5px]"
							/>
							<IconPlaceholder
								lucide="ChevronRightIcon"
								tabler="IconChevronRight"
								hugeicons="ArrowRight01Icon"
								phosphor="CaretRightIcon"
								remixicon="RiArrowRightSLine"
								aria-hidden="true"
								class="size-3.5 shrink-0 text-muted-foreground rtl:rotate-180"
							/>
							<Dialog.Title class="truncate text-[13px] leading-5 font-medium"
								>{text("新建问题", "New issue")}</Dialog.Title
							>
						</div>
						<Dialog.Description class="sr-only"
							>{text(
								"填写问题标题和描述，并选择状态和优先级。",
								"Write a title and description, then choose a status and priority."
							)}</Dialog.Description
						>
						<div class="flex shrink-0 items-center">
							{#if dirty}
								<Button
									type="button"
									variant="ghost"
									size="xs"
									class="hidden sm:inline-flex"
									onclick={() => closeWithDraft(true)}
								>
									{text("保存为草稿", "Save as draft")}
								</Button>
							{/if}
							<Tooltip.Hint
								label={expanded
									? text("收起编辑区", "Collapse editor")
									: text("展开编辑区", "Expand editor")}
								portal={menuPortal}
								side="bottom"
							>
								{#snippet trigger({ props })}
									<Button
										{...props}
										type="button"
										variant="ghost"
										class={iconButton}
										aria-label={expanded
											? text("收起编辑区", "Collapse editor")
											: text("展开编辑区", "Expand editor")}
										aria-controls="{id}-editor"
										aria-expanded={expanded}
										onclick={() => (expanded = !expanded)}
									>
										{#if expanded}<IconPlaceholder
												lucide="MinimizeIcon"
												tabler="IconMinimize"
												hugeicons="ArrowShrinkIcon"
												phosphor="CornersInIcon"
												remixicon="RiContractUpDownLine"
												aria-hidden="true"
												class="size-4"
											/>{:else}<IconPlaceholder
												lucide="MaximizeIcon"
												tabler="IconBorderCorners"
												hugeicons="ArrowExpandIcon"
												phosphor="CornersOutIcon"
												remixicon="RiExpandUpDownLine"
												aria-hidden="true"
												class="size-4"
											/>{/if}
									</Button>
								{/snippet}
							</Tooltip.Hint>
							<Tooltip.Hint label={text("关闭", "Close")} portal={menuPortal} side="bottom">
								{#snippet trigger({ props })}
									<Button
										{...props}
										type="button"
										variant="ghost"
										class={iconButton}
										aria-label={text("关闭", "Close")}
										onclick={requestClose}
										><IconPlaceholder
											lucide="XIcon"
											tabler="IconX"
											hugeicons="Cancel01Icon"
											phosphor="XIcon"
											remixicon="RiCloseLine"
											aria-hidden="true"
											class="size-4"
										/></Button
									>
								{/snippet}
							</Tooltip.Hint>
						</div>
					</header>

					<ScrollArea.Root
						type="hover"
						overscroll="contain"
						viewportLabel={text("表单内容", "Form fields")}
						class="flex-1 [&>[data-slot=scroll-area-viewport]>[data-scroll-area-content]]:flex [&>[data-slot=scroll-area-viewport]>[data-scroll-area-content]]:min-h-full [&>[data-slot=scroll-area-viewport]>[data-scroll-area-content]]:flex-col"
					>
						<div id="{id}-editor" class="flex flex-1 flex-col gap-1.5 px-[19px] pt-1.5">
							<Input
								bind:ref={titleInput}
								bind:value={title}
								aria-label={text("标题", "Title")}
								aria-required="true"
								aria-invalid={invalidTitle}
								aria-describedby={invalidTitle ? `${id}-error` : undefined}
								placeholder={text("问题标题", "Issue title")}
								maxlength={160}
								oninput={() => {
									invalidTitle = false;
									dirty = true;
								}}
								onkeydown={handleSubmitShortcut}
								class="{editorField} h-6 shrink-0 py-0 text-lg leading-6 font-semibold md:text-lg"
							/>
							{#if invalidTitle}
								<p id="{id}-error" role="alert" class="shrink-0 text-xs text-destructive">
									{text("请输入问题标题。", "Enter an issue title.")}
								</p>
							{/if}
							<DescriptionEditor
								bind:editor
								content={description}
								{chinese}
								focusOnMount={false}
								appearance="composer"
								portal={menuPortal}
								overlayPortal={portal}
								onAttach={() => fileInput.click()}
								{inlineMedia}
								onAddInlineMedia={(files) => {
									const linked = files.map((file) => ({
										id: globalThis.crypto.randomUUID(),
										file,
									}));
									inlineMedia = [...inlineMedia, ...linked];
									return linked;
								}}
								onEditorKeyDown={handleSubmitShortcut}
								onChange={() => {
									if (editor) description = editor.getJSON();
									dirty = true;
								}}
							/>
						</div>

						<div
							role="group"
							aria-label={text("问题属性", "Issue properties")}
							class="flex shrink-0 flex-wrap gap-1.5 px-[19px] pt-1.5 pb-2"
						>
							{#each baseFields as field (field)}
								{@const value = field === "status" ? status : priority}
								<IssuePicker
									label={label(field)}
									display={value === "none" ? label("priority") : label(value)}
									placeholder={field === "status"
										? text("更改状态…", "Change status…")
										: text("更改优先级…", "Change priority…")}
									options={field === "status" ? statusOptions : priorityOptions}
									selected={[value]}
									portal={menuPortal}
									{chinese}
									quickStart={field === "status" ? 1 : 0}
									onSelect={(next) => {
										if (field === "status") status = next as IssueDraft["status"];
										else priority = next as IssueDraft["priority"];
										dirty ||= next !== value;
									}}
								>
									<IssueGlyph {value} />
									{#snippet glyph(option)}
										<IssueGlyph
											value={option.id as IssueDraft["status"] | IssueDraft["priority"]}
										/>
									{/snippet}
								</IssuePicker>
							{/each}
							<IssuePicker
								label={text("负责人", "Assignee")}
								display={assigneeName ?? text("负责人", "Assignee")}
								placeholder={text("指派给…", "Assign to…")}
								options={[
									{ id: "", label: text("无负责人", "No assignee") },
									...availableAssignees,
								]}
								selected={[assignee]}
								portal={menuPortal}
								{chinese}
								onSelect={(value) => {
									dirty ||= value !== assignee;
									assignee = value;
								}}
							>
								<IconPlaceholder
									lucide="UserCircleIcon"
									tabler="IconUserCircle"
									hugeicons="UserCircleIcon"
									phosphor="UserCircleIcon"
									remixicon="RiAccountCircleLine"
									aria-hidden="true"
								/>
							</IssuePicker>
							<IssuePicker
								label={text("项目", "Project")}
								display={projectName ?? text("项目", "Project")}
								placeholder={text("添加到项目…", "Add to project…")}
								options={[{ id: "", label: text("无项目", "No project") }, ...availableProjects]}
								selected={[project]}
								portal={menuPortal}
								{chinese}
								onSelect={(value) => {
									dirty ||= value !== project;
									project = value;
								}}
							>
								<IconPlaceholder
									lucide="BoxIcon"
									tabler="IconBox"
									hugeicons="CubeIcon"
									phosphor="CubeIcon"
									remixicon="RiBox3Line"
									aria-hidden="true"
								/>
							</IssuePicker>
							<IssuePicker
								label={text("标签", "Labels")}
								display={labelNames.join(", ") || text("标签", "Labels")}
								placeholder={labelNames.length
									? text("更改或添加标签…", "Change or add labels…")
									: text("添加标签…", "Add labels…")}
								options={availableLabels}
								selected={selectedLabels}
								portal={menuPortal}
								{chinese}
								multiple
								class="max-w-48"
								onSelect={toggleLabel}
							>
								<IconPlaceholder
									lucide="TagIcon"
									tabler="IconTag"
									hugeicons="TagIcon"
									phosphor="TagIcon"
									remixicon="RiPriceTagLine"
									aria-hidden="true"
								/>
							</IssuePicker>
						</div>

						{#if attachments.length}
							<ul
								aria-label={text("附件", "Attachments")}
								class="flex shrink-0 flex-wrap gap-1 px-[19px] pb-2"
							>
								{#each attachments as file, index}
									<li
										class="inline-flex h-6 max-w-full min-w-0 items-center gap-1 rounded-full border border-border px-2 text-xs"
									>
										<span class="truncate">{file.name}</span>
										<button
											type="button"
											aria-label={`${text("移除附件", "Remove attachment")} ${file.name}`}
											class="rounded-full p-0.5 text-muted-foreground hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
											onclick={() => {
												attachments = attachments.filter((_, item) => item !== index);
												dirty = true;
												attachButton?.focus({ preventScroll: true });
											}}
											><IconPlaceholder
												lucide="XIcon"
												tabler="IconX"
												hugeicons="Cancel01Icon"
												phosphor="XIcon"
												remixicon="RiCloseLine"
												aria-hidden="true"
												class="size-3"
											/></button
										>
									</li>
								{/each}
							</ul>
						{/if}
					</ScrollArea.Root>

					<footer
						class="flex h-14 shrink-0 items-center justify-between gap-2 border-t border-border/60 ps-3 pe-[15px]"
					>
						<input type="file" multiple hidden bind:this={fileInput} onchange={addFiles} />
						<Tooltip.Hint label={text("添加附件", "Add attachment")} portal={menuPortal} side="top">
							{#snippet trigger({ props })}
								<Button
									{...props}
									bind:ref={attachButton}
									type="button"
									variant="ghost"
									class={iconButton}
									aria-label={text("添加附件", "Add attachment")}
									onclick={() => fileInput.click()}
									><IconPlaceholder
										lucide="PaperclipIcon"
										tabler="IconPaperclip"
										hugeicons="AttachmentIcon"
										phosphor="PaperclipIcon"
										remixicon="RiAttachmentLine"
										aria-hidden="true"
										class="size-4"
									/></Button
								>
							{/snippet}
						</Tooltip.Hint>
						<div class="flex min-w-0 items-center gap-3">
							<div class="flex items-center gap-1.5">
								<label
									for="{id}-more"
									class="cursor-pointer text-xs whitespace-nowrap text-muted-foreground"
									>{text("继续创建", "Create more")}</label
								>
								<Switch
									id="{id}-more"
									bind:checked={createMore}
									size="sm"
									appearance="settings"
									class="shrink-0 after:inset-x-0 after:inset-y-0"
								/>
							</div>
							<Button
								type="submit"
								size="sm"
								shape="pill"
								aria-keyshortcuts="Meta+Enter Control+Enter"
								class="h-7 bg-(--composer-accent) px-2.5 text-xs leading-none font-medium whitespace-nowrap text-white shadow-none hover:bg-(--composer-accent)/90"
								>{text("创建问题", "Create issue")}</Button
							>
						</div>
					</footer>
				</form>
				<AlertDialog.Root bind:open={confirmDraft}>
					<AlertDialog.Content
						portalProps={menuPortal}
						appearance="confirmation"
						class="w-[calc(100%-24px)]! max-w-[380px]"
						onOpenAutoFocus={(event) => {
							event.preventDefault();
							saveButton?.focus({ preventScroll: true });
						}}
						onCloseAutoFocus={(event) => {
							event.preventDefault();
							if (open) confirmOpener?.focus({ preventScroll: true });
						}}
					>
						<AlertDialog.Header>
							<AlertDialog.Title>{text("保存到草稿？", "Save to drafts?")}</AlertDialog.Title>
							<AlertDialog.Description>
								{text(
									"将问题保留为草稿，稍后继续编辑。",
									"Keep this issue as a draft and finish it later."
								)}
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Action variant="ghost" size="sm" onclick={() => closeWithDraft(false)}>
								{text("放弃", "Discard")}
							</AlertDialog.Action>
							<AlertDialog.Cancel size="sm">{text("取消", "Cancel")}</AlertDialog.Cancel>
							<AlertDialog.Action
								bind:ref={saveButton}
								size="sm"
								onclick={() => closeWithDraft(true)}
							>
								{text("保存", "Save")}
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</Dialog.Content>
		</Dialog.Root>
	</Tooltip.Provider>
</div>
