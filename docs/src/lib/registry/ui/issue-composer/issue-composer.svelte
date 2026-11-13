<script lang="ts">
	import { tick } from "svelte";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Switch } from "$lib/registry/ui/switch/index.js";
	import { Textarea } from "$lib/registry/ui/textarea/index.js";
	import IssueGlyph from "./issue-glyph.svelte";
	import { issueLabels, priorities, statuses, type IssueDraft } from "./issue-options.js";

	let {
		open = $bindable(false),
		chinese = false,
		workspace = "Valar",
		onCreate,
		returnFocus,
	}: {
		open?: boolean;
		chinese?: boolean;
		workspace?: string;
		onCreate: (draft: IssueDraft) => void;
		returnFocus?: () => HTMLElement | null;
	} = $props();

	const id = $props.id();
	const surfaceId = `${id}-surface`;
	const portal = { to: `[id="${id}"]` };
	const menuPortal = { to: `[id="${surfaceId}"]` };
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const label = (key: keyof typeof issueLabels) => issueLabels[key][chinese ? 0 : 1];
	const fields = ["status", "priority"] as const;
	type Field = (typeof fields)[number];
	const options = { status: statuses, priority: priorities };
	const iconButton =
		"inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent p-0 text-foreground hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none";
	const editorField =
		"rounded-none border-0 bg-transparent! px-0 text-foreground ring-0! shadow-none! placeholder:text-(--composer-placeholder) transition-none";
	const tokens = `
		--composer-surface: light-dark(lch(100% 0 282), lch(9.232% .85 272));
		--composer-accent: light-dark(lch(53% 52.26 286.91), lch(47.918% 59.303 288.421));
		--composer-placeholder: light-dark(lch(57% 1.25 282), lch(42% 1.2 272));
		--composer-chip: light-dark(white, lch(13.861% 1.139 272));
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
	let description = $state("");
	let status = $state<IssueDraft["status"]>("backlog");
	let priority = $state<IssueDraft["priority"]>("none");
	let attachments = $state<File[]>([]);
	let createMore = $state(false);
	let expanded = $state(false);
	let invalidTitle = $state(false);
	let activeMenu = $state<Field>();
	let titleInput = $state<HTMLInputElement | null>(null);
	let menuInput = $state<HTMLInputElement | null>(null);
	let fileInput: HTMLInputElement;

	$effect(() => {
		if (!open) activeMenu = undefined;
	});

	function setMenu(field: Field, isOpen: boolean) {
		if (isOpen) activeMenu = field;
		else if (activeMenu === field) activeMenu = undefined;
	}

	function selectOption(field: Field, index: number) {
		if (field === "status") status = statuses[index];
		else priority = priorities[index];
		activeMenu = undefined;
	}

	function pickWithNumber(event: KeyboardEvent, field: Field) {
		if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey || menuInput?.value)
			return;
		if (!/^\d$/.test(event.key)) return;
		const index = Number(event.key) - (field === "status" ? 1 : 0);
		if (index < 0 || index >= options[field].length) return;
		event.preventDefault();
		selectOption(field, index);
	}

	function addFiles(event: Event & { currentTarget: HTMLInputElement }) {
		attachments = [...attachments, ...Array.from(event.currentTarget.files ?? [])];
		event.currentTarget.value = "";
	}

	async function createIssue(event: SubmitEvent) {
		event.preventDefault();
		const trimmedTitle = title.trim();
		if (!trimmedTitle) {
			invalidTitle = true;
			titleInput?.focus();
			return;
		}

		onCreate({
			title: trimmedTitle,
			description: description.trim(),
			status,
			priority,
			attachments: [...attachments],
		});
		title = "";
		description = "";
		attachments = [];
		invalidTitle = false;
		if (createMore) {
			await tick();
			titleInput?.focus();
		} else {
			status = "backlog";
			priority = "none";
			open = false;
		}
	}

	function handleSubmitShortcut(
		event: KeyboardEvent & { currentTarget: HTMLInputElement | HTMLTextAreaElement }
	) {
		if (
			event.key !== "Enter" ||
			!(event.metaKey || event.ctrlKey) ||
			event.isComposing ||
			activeMenu
		)
			return;
		event.preventDefault();
		if (!event.repeat) event.currentTarget.form?.requestSubmit();
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
				class={`flex w-[calc(100%-24px)] translate-y-0 flex-col gap-0 rounded-[21px] bg-(--composer-surface) p-0 text-foreground shadow-[0_12px_36px_#0003] transition-[max-width,top] [transition-duration:220ms,300ms] ease-[cubic-bezier(0.43,0.07,0.59,0.94)] motion-reduce:animate-none! motion-reduce:transition-none motion-reduce:duration-0! ${
					expanded
						? "top-[max(8px,6svh)] max-w-[820px] sm:max-w-[820px]"
						: "top-[clamp(8px,13svh,calc(100svh-274px))] max-w-[750px] sm:max-w-[750px]"
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
					class={`flex flex-col transition-[height] duration-300 ease-[cubic-bezier(0.43,0.07,0.59,0.94)] motion-reduce:transition-none motion-reduce:duration-0! ${
						expanded ? "h-[min(88svh,800px)]" : "h-[min(262px,calc(100svh-16px))]"
					}`}
					onsubmit={createIssue}
				>
					<header class="flex h-14 shrink-0 items-center justify-between gap-2 ps-[19px] pe-2.5">
						<div class="flex min-w-0 items-center gap-2">
							<span
								class="max-w-32 truncate rounded-full border border-border px-2 py-0.5 text-xs leading-4 font-medium text-muted-foreground"
								>{workspace}</span
							>
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
									<Dialog.Close {...props} class={iconButton} aria-label={text("关闭", "Close")}
										><IconPlaceholder
											lucide="XIcon"
											tabler="IconX"
											hugeicons="Cancel01Icon"
											phosphor="XIcon"
											remixicon="RiCloseLine"
											aria-hidden="true"
											class="size-4"
										/></Dialog.Close
									>
								{/snippet}
							</Tooltip.Hint>
						</div>
					</header>

					<div id="{id}-editor" class="flex min-h-0 flex-1 flex-col gap-1.5 px-[19px] pt-1.5">
						<Input
							bind:ref={titleInput}
							bind:value={title}
							aria-label={text("标题", "Title")}
							aria-required="true"
							aria-invalid={invalidTitle}
							aria-describedby={invalidTitle ? `${id}-error` : undefined}
							placeholder={text("问题标题", "Issue title")}
							maxlength={160}
							oninput={() => (invalidTitle = false)}
							onkeydown={handleSubmitShortcut}
							class="{editorField} h-6 shrink-0 py-0 text-lg leading-6 font-semibold md:text-lg"
						/>
						{#if invalidTitle}
							<p id="{id}-error" role="alert" class="shrink-0 text-xs text-destructive">
								{text("请输入问题标题。", "Enter an issue title.")}
							</p>
						{/if}
						<Textarea
							bind:value={description}
							aria-label={text("描述", "Description")}
							placeholder={text("添加描述…", "Add description…")}
							onkeydown={handleSubmitShortcut}
							class="{editorField} field-sizing-fixed min-h-0 flex-1 resize-none pt-1.5 pb-3 text-[15px] leading-5 font-[450] md:text-[15px]"
						/>
					</div>

					<div class="flex shrink-0 flex-wrap gap-1.5 px-[19px] pt-1.5 pb-2">
						{#each fields as field (field)}
							{@const selected = field === "status" ? status : priority}
							<Popover.Root
								bind:open={() => activeMenu === field, (isOpen) => setMenu(field, isOpen)}
							>
								<Popover.Trigger
									aria-label={`${label(field)} · ${label(selected)}`}
									class="inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-(--composer-chip) px-2 text-xs leading-none font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-expanded:bg-accent"
								>
									<IssueGlyph value={selected} />
									{selected === "none" ? label("priority") : label(selected)}
								</Popover.Trigger>
								<Popover.Content
									appearance="surface"
									portalProps={menuPortal}
									align="start"
									role="dialog"
									aria-label={label(field)}
									class="w-[204px] gap-0 p-0"
									onOpenAutoFocus={async (event) => {
										event.preventDefault();
										await tick();
										menuInput?.focus();
									}}
								>
									<Command.Root value={label(selected)} class="rounded-[inherit] bg-transparent">
										<Command.Input
											bind:ref={menuInput}
											aria-label={text("搜索选项", "Search options")}
											placeholder={field === "status"
												? text("更改状态…", "Change status…")
												: text("更改优先级…", "Change priority…")}
											onkeydown={(event) => pickWithNumber(event, field)}
										/>
										<Command.List class="max-h-48 p-1">
											<Command.Empty class="py-3 text-xs text-muted-foreground"
												>{text("没有匹配的选项", "No matching options")}</Command.Empty
											>
											{#each options[field] as option, index (option)}
												<Command.Item
													value={label(option)}
													data-checked={selected === option}
													aria-current={selected === option ? "true" : undefined}
													class="min-h-8 gap-2 rounded-[7px]! px-2 py-0 text-[13px] font-[450]"
													onSelect={() => selectOption(field, index)}
												>
													<IssueGlyph value={option} />
													{label(option)}
													{#if selected !== option}<Command.Shortcut
															>{index + (field === "status" ? 1 : 0)}</Command.Shortcut
														>{/if}
												</Command.Item>
											{/each}
										</Command.List>
									</Command.Root>
								</Popover.Content>
							</Popover.Root>
						{/each}
					</div>

					{#if attachments.length}
						<ul
							aria-label={text("附件", "Attachments")}
							class="flex max-h-16 shrink-0 flex-wrap gap-1 overflow-y-auto px-[19px] pb-2"
						>
							{#each attachments as file, index}
								<li
									class="inline-flex h-6 max-w-full min-w-0 items-center gap-1 rounded-full border border-border px-2 text-xs"
								>
									<span class="truncate">{file.name}</span>
									<button
										type="button"
										aria-label={`${text("移除附件", "Remove attachment")} ${file.name}`}
										class="rounded-full p-0.5 text-muted-foreground hover:bg-accent focus-visible:outline-ring"
										onclick={() => (attachments = attachments.filter((_, item) => item !== index))}
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

					<footer
						class="flex h-14 shrink-0 items-center justify-between gap-2 border-t border-border/60 ps-3 pe-[15px]"
					>
						<input type="file" multiple hidden bind:this={fileInput} onchange={addFiles} />
						<Tooltip.Hint label={text("添加附件", "Add attachment")} portal={menuPortal} side="top">
							{#snippet trigger({ props })}
								<Button
									{...props}
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
			</Dialog.Content>
		</Dialog.Root>
	</Tooltip.Provider>
</div>
