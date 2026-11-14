<script lang="ts">
	import { parseDate } from "@internationalized/date";
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { timeframeEnd, DatePicker } from "$lib/registry/ui/date-picker/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";
	import ProjectPicker from "./project-picker.svelte";
	import { priorities, statuses, type ProjectDraft, type Status } from "./data.js";

	let {
		open = $bindable(false),
		chinese,
		teamOptions,
		people,
		initialStatus,
		onCreate,
		returnFocus,
	}: {
		open?: boolean;
		chinese: boolean;
		teamOptions: readonly { id: string; label: string }[];
		people: readonly { id: string; team: string; label: string; detail: string }[];
		initialStatus: Status;
		onCreate: (draft: ProjectDraft) => void;
		returnFocus: () => HTMLElement | null;
	} = $props();

	const id = $props.id();
	const surface = id + "-surface";
	const portal = { to: '[id="' + id + '"]' };
	const pickerPortal = { to: '[id="' + surface + '"]' };
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const localized = (entry: { zh: string; en: string }) => (chinese ? entry.zh : entry.en);
	const pickerCopy = $derived({
		portal: pickerPortal,
		empty: text("没有匹配的选项", "No matching options"),
	});
	const editor =
		"border-0 bg-transparent! px-0 ring-0! shadow-none! placeholder:text-(--project-placeholder)";
	const closeButton =
		"size-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground";
	let draft = $state<ProjectDraft>(emptyDraft("backlog", []));
	let nameInput = $state<HTMLInputElement | null>(null);
	let invalidName = $state(false);
	let discardOpen = $state(false);
	let discardConfirmed = false;
	let discardOpener: HTMLElement | null = null;

	const statusOptions = $derived(statuses.map((entry) => ({ ...entry, label: localized(entry) })));
	const priorityOptions = $derived(
		priorities.map((entry) => ({ ...entry, label: localized(entry) }))
	);
	const status = $derived(statusOptions.find((option) => option.id === draft.status)!);
	const priority = $derived(priorityOptions.find((option) => option.id === draft.priority)!);
	const leadOptions = $derived([
		{ id: "", label: text("无负责人", "No lead") },
		...people.filter((person) => draft.teams.includes(person.team)),
	]);
	const lead = $derived(people.find((person) => person.id === draft.lead));
	const team = $derived(teamOptions.find((option) => option.id === draft.teams[0]));
	const invalidRange = $derived(
		Boolean(
			draft.start &&
			draft.target &&
			timeframeEnd(draft.target).compare(parseDate(draft.start.date)) < 0
		)
	);

	function emptyDraft(status: Status, teams: string[]): ProjectDraft {
		return { name: "", summary: "", description: "", status, priority: "none", teams, lead: "" };
	}

	function changeOpen(next: boolean) {
		if (next) {
			open = true;
			return;
		}
		const dirty =
			draft.name ||
			draft.summary ||
			draft.description ||
			draft.lead ||
			draft.start ||
			draft.target ||
			draft.status !== initialStatus ||
			draft.priority !== "none" ||
			draft.teams.length !== 1 ||
			draft.teams[0] !== teamOptions[0]?.id;
		if (dirty) {
			discardOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			discardOpen = true;
		} else open = false;
	}

	function toggleTeam(value: string) {
		if (draft.teams.length === 1 && draft.teams[0] === value) return;
		draft.teams = draft.teams.includes(value)
			? draft.teams.filter((item) => item !== value)
			: [...draft.teams, value];
		if (!draft.teams.includes(lead?.team ?? "")) draft.lead = "";
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		const name = draft.name.trim();
		if (!name) {
			invalidName = true;
			nameInput?.focus();
			return;
		}
		if (invalidRange) return;
		onCreate({
			...draft,
			name,
			summary: draft.summary.trim(),
			description: draft.description.trim(),
			teams: [...draft.teams],
		});
		open = false;
	}
</script>

<div
	{id}
	class="[&>[data-slot=dialog-overlay]]:bg-black/25! [&>[data-slot=dialog-overlay]]:backdrop-blur-none! motion-reduce:[&>[data-slot=dialog-overlay]]:animate-none! dark:[&>[data-slot=dialog-overlay]]:bg-black/40!"
>
	<Dialog.Root bind:open={() => open, changeOpen}>
		<Dialog.Content
			id={surface}
			portalProps={portal}
			showCloseButton={false}
			class="flex h-[88svh] w-[calc(100%-24px)] max-w-[920px] flex-col gap-0 rounded-[21px] bg-(--project-dialog) p-0 text-foreground shadow-[0_12px_36px_#0003] motion-reduce:animate-none! sm:max-w-[920px]"
			onOpenAutoFocus={(event) => {
				event.preventDefault();
				draft = emptyDraft(initialStatus, teamOptions.length ? [teamOptions[0].id] : []);
				invalidName = false;
				nameInput?.focus();
			}}
			onCloseAutoFocus={(event) => {
				event.preventDefault();
				returnFocus()?.focus();
			}}
		>
			<form onsubmit={submit} class="flex min-h-0 flex-1 flex-col">
				<header class="flex min-h-14 shrink-0 items-center gap-2 px-4 sm:px-5">
					<ProjectPicker
						label={text("项目团队", "Project teams")}
						placeholder={text("搜索团队…", "Search teams…")}
						{...pickerCopy}
						options={teamOptions}
						selected={draft.teams}
						disabled={teamOptions.length <= 1}
						multiple
						onSelect={toggleTeam}
					>
						<IconPlaceholder
							lucide="UsersIcon"
							tabler="IconUsers"
							hugeicons="UserGroupIcon"
							phosphor="UsersIcon"
							remixicon="RiGroupLine"
							aria-hidden="true"
						/>
						<span class="truncate">{team?.label ?? text("团队", "Team")}</span>
						{#if draft.teams.length > 1}<span>+{draft.teams.length - 1}</span>{/if}
					</ProjectPicker>
					<span aria-hidden="true" class="text-muted-foreground">›</span>
					<Dialog.Title class="truncate text-[13px] font-medium"
						>{text("新建项目", "New project")}</Dialog.Title
					>
					<Dialog.Description class="sr-only"
						>{text(
							"设置项目名称、属性和日期。",
							"Set the project name, properties, and dates."
						)}</Dialog.Description
					>
					<Button
						variant="ghost"
						size="icon"
						class="ml-auto {closeButton}"
						aria-label={text("关闭项目表单", "Close project form")}
						onclick={() => changeOpen(false)}
					>
						<IconPlaceholder
							lucide="XIcon"
							tabler="IconX"
							hugeicons="Cancel01Icon"
							phosphor="XIcon"
							remixicon="RiCloseLine"
							class="size-4"
							aria-hidden="true"
						/>
					</Button>
				</header>

				<div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-5 sm:px-[26px]">
					<div
						class="mb-3 flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400"
					>
						<IconPlaceholder
							lucide="BoxIcon"
							tabler="IconBox"
							hugeicons="CubeIcon"
							phosphor="CubeIcon"
							remixicon="RiBox3Line"
							class="size-4"
							aria-hidden="true"
						/>
					</div>
					<Input
						bind:ref={nameInput}
						bind:value={draft.name}
						aria-label={text("项目名称", "Project name")}
						aria-required="true"
						aria-invalid={invalidName}
						aria-describedby={invalidName ? id + "-name-error" : undefined}
						placeholder={text("项目名称", "Project name")}
						maxlength={120}
						oninput={() => (invalidName = false)}
						class="{editor} h-8 shrink-0 text-2xl font-semibold tracking-tight md:text-2xl"
					/>
					{#if invalidName}<p id={id + "-name-error"} role="alert" class="text-xs text-destructive">
							{text("请输入项目名称。", "Enter a project name.")}
						</p>{/if}
					<Input
						bind:value={draft.summary}
						aria-label={text("项目摘要", "Project summary")}
						placeholder={text("添加简短摘要…", "Add a short summary…")}
						maxlength={240}
						class="{editor} mb-1 h-8 shrink-0 text-[15px] md:text-[15px]"
					/>

					<div class="flex flex-wrap gap-2 border-b border-border pb-5">
						<ProjectPicker
							label={text("项目状态", "Project status")}
							placeholder={text("搜索状态…", "Search statuses…")}
							{...pickerCopy}
							options={statusOptions}
							selected={[draft.status]}
							onSelect={(value) => {
								draft.status = value as ProjectDraft["status"];
							}}
						>
							<span class="size-3 rounded-full border {status.color}" aria-hidden="true"
							></span>{status.label}
						</ProjectPicker>
						<ProjectPicker
							label={text("项目优先级", "Project priority")}
							placeholder={text("搜索优先级…", "Search priorities…")}
							{...pickerCopy}
							options={priorityOptions}
							selected={[draft.priority]}
							onSelect={(value) => {
								draft.priority = value as ProjectDraft["priority"];
							}}
						>
							<span aria-hidden="true">⋯</span>{priority.label}
						</ProjectPicker>
						<ProjectPicker
							label={text("项目负责人", "Project lead")}
							placeholder={text("搜索负责人…", "Search project leads…")}
							{...pickerCopy}
							options={leadOptions}
							selected={[draft.lead]}
							onSelect={(value) => {
								draft.lead = value;
							}}
						>
							{#if lead}<span
									class="grid size-4 place-items-center rounded-full bg-sky-500/15 text-[8px] font-medium text-sky-700 dark:text-sky-300"
									aria-hidden="true">{lead.detail}</span
								>
							{:else}<IconPlaceholder
									lucide="UserCircleIcon"
									tabler="IconUserCircle"
									hugeicons="UserCircleIcon"
									phosphor="UserCircleIcon"
									remixicon="RiAccountCircleLine"
									aria-hidden="true"
								/>{/if}
							{lead?.label ?? text("负责人", "Lead")}
						</ProjectPicker>
						<DatePicker
							label={text("开始日期", "Start date")}
							placeholder={text("开始", "Start")}
							value={draft.start}
							max={draft.target}
							locale={chinese ? "zh-CN" : "en"}
							class="bg-(--project-control)"
							portalProps={pickerPortal}
							onValueChange={(value) => {
								draft.start = value;
							}}
						/>
						<DatePicker
							label={text("目标日期", "Target date")}
							placeholder={text("目标", "Target")}
							value={draft.target}
							min={draft.start}
							locale={chinese ? "zh-CN" : "en"}
							class="bg-(--project-control)"
							portalProps={pickerPortal}
							onValueChange={(value) => {
								draft.target = value;
							}}
						/>
					</div>

					<Textarea
						bind:value={draft.description}
						aria-label={text("项目描述", "Project description")}
						placeholder={text(
							"写下项目描述、简报或想法…",
							"Write a description, a project brief, or collect ideas…"
						)}
						class="{editor} mt-5 min-h-32 flex-1 resize-none text-[15px] md:text-[15px]"
					/>
				</div>

				<footer
					class="flex min-h-[60px] shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border px-4 sm:px-5"
				>
					{#if invalidRange}<p role="alert" class="mr-auto text-xs text-destructive">
							{text("目标日期不能早于开始日期。", "Target date cannot precede the start date.")}
						</p>{/if}
					<Button
						type="submit"
						shape="pill"
						size="sm"
						disabled={invalidRange}
						class="bg-(--project-accent) text-white hover:bg-(--project-accent)/90"
					>
						{text("创建项目", "Create project")}
					</Button>
				</footer>
			</form>

			<AlertDialog.Root bind:open={discardOpen}>
				<AlertDialog.Content
					portalProps={pickerPortal}
					class="z-[60] w-[calc(100%-32px)] motion-reduce:animate-none!"
					onCloseAutoFocus={(event) => {
						event.preventDefault();
						if (discardConfirmed) {
							discardConfirmed = false;
							open = false;
						} else {
							(discardOpener?.isConnected ? discardOpener : nameInput)?.focus();
						}
					}}
				>
					<AlertDialog.Header>
						<AlertDialog.Title>{text("丢弃修改？", "Discard changes?")}</AlertDialog.Title>
						<AlertDialog.Description
							>{text(
								"已输入的项目内容将被清除。",
								"Your project draft will be cleared."
							)}</AlertDialog.Description
						>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>{text("继续编辑", "Keep editing")}</AlertDialog.Cancel>
						<AlertDialog.Action
							onclick={() => {
								discardConfirmed = true;
								discardOpen = false;
							}}>{text("丢弃", "Discard")}</AlertDialog.Action
						>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</Dialog.Content>
	</Dialog.Root>
</div>
