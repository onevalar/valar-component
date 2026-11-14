<script lang="ts">
	import { tick, untrack } from "svelte";
	import * as Alert from "$lib/registry/ui/alert-dialog/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import DescriptionEditor from "./description-editor.svelte";
	import { descriptionFromText } from "./model.js";
	import type { IssueComment, IssueCommentDraft } from "./activity-model.js";
	import type { Editor } from "@tiptap/core";

	let {
		mode,
		chinese,
		portal,
		initial,
		onCommit,
		onCancel,
	}: {
		mode: "post" | "reply" | "edit";
		chinese: boolean;
		portal: { to: string };
		initial?: IssueComment;
		onCommit: (draft: IssueCommentDraft) => void;
		onCancel?: () => void;
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const label = $derived(
		mode === "reply"
			? text("回复", "Reply")
			: mode === "edit"
				? text("编辑评论", "Edit comment")
				: text("评论", "Comment")
	);
	const emptyLabel = $derived(
		mode === "reply" ? text("回复此线程…", "Leave a reply…") : text("发表评论…", "Leave a comment…")
	);
	const submitLabel = $derived(
		mode === "reply"
			? text("发表回复", "Post reply")
			: mode === "edit"
				? text("保存评论", "Save comment")
				: text("发表评论", "Post comment")
	);
	const iconButton =
		"size-6 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground [&_svg]:size-3.5";
	const startingContent = untrack(
		() => initial?.content ?? descriptionFromText(initial?.body ?? "")
	);
	let files = $state<File[]>(untrack(() => [...(initial?.attachments ?? [])]));
	let editor = $state.raw<Editor | null>(null);
	let opened = $state(untrack(() => mode === "edit"));
	let body = $state(untrack(() => initial?.body ?? ""));
	let contentChanged = $state(false);
	let discardOpen = $state(false);
	let discardConfirmed = false;
	let fileInput: HTMLInputElement;
	let form: HTMLFormElement;
	let placeholderButton = $state<HTMLButtonElement | null>(null);
	const canSubmit = $derived(!!body.trim() || files.length > 0);
	const dirty = $derived(
		contentChanged ||
			files.length !== (initial?.attachments?.length ?? 0) ||
			files.some((file, index) => file !== initial?.attachments?.[index])
	);

	function readEditor() {
		if (!editor) return;
		body = editor.getText({ blockSeparator: "\n" });
		contentChanged = initial
			? JSON.stringify(editor.getJSON()) !== JSON.stringify(startingContent)
			: !editor.isEmpty;
	}

	function post(event: SubmitEvent) {
		event.preventDefault();
		if (!canSubmit || (mode === "edit" && !dirty)) return;
		onCommit({
			body: body.trim(),
			content: editor && !editor.isEmpty ? editor.getJSON() : undefined,
			attachments: [...files],
		});
		if (mode === "edit") return;
		files = [];
		body = "";
		contentChanged = false;
		editor?.commands.clearContent(false);
		editor?.commands.focus();
	}

	async function discard() {
		discardConfirmed = true;
		discardOpen = false;
		if (mode === "edit") {
			onCancel?.();
			return;
		}
		files = [];
		body = "";
		contentChanged = false;
		opened = false;
		editor = null;
		await tick();
		placeholderButton?.focus();
	}

	function cancel() {
		if (dirty) {
			discardConfirmed = false;
			discardOpen = true;
		} else {
			void discard();
		}
	}

	function handleEditorKeys(event: KeyboardEvent) {
		if (event.defaultPrevented || event.isComposing || event.repeat) return false;
		if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			if (canSubmit) form.requestSubmit();
			return true;
		}
		if (event.key === "Escape" && opened) {
			event.preventDefault();
			event.stopPropagation();
			// Open after this key event so the dialog does not dismiss itself.
			setTimeout(cancel, 0);
			return true;
		}
		return false;
	}

	function handleKeys(event: KeyboardEvent) {
		if (event.target instanceof Node && form?.contains(event.target)) handleEditorKeys(event);
	}
</script>

<svelte:window onkeydown={handleKeys} />

<form
	bind:this={form}
	onsubmit={post}
	aria-label={mode === "post" ? text("新评论", "New comment") : label}
	class={[
		"min-w-0",
		mode === "post" &&
			"rounded-[8px] border border-(--activity-border) bg-(--activity-card) px-4 py-3",
		mode === "reply" &&
			(opened || files.length
				? "border-t border-(--activity-border) px-4 py-3"
				: "border-t border-(--activity-border) px-4 py-2.5"),
	]}
>
	<div
		class={[
			"flex min-w-0 gap-2",
			mode === "reply" && !opened && !files.length ? "flex-row items-center" : "flex-col",
		]}
	>
		<div class="min-w-0 flex-1">
			{#if opened}
				<DescriptionEditor
					bind:editor
					content={startingContent}
					{chinese}
					commentLabel={label}
					commentPlaceholder={mode !== "edit" && !contentChanged ? emptyLabel : undefined}
					onEditorKeyDown={handleEditorKeys}
					focusOnMount
					onChange={readEditor}
				/>
			{:else}
				<Button
					bind:ref={placeholderButton}
					type="button"
					variant="ghost"
					class="h-6 w-full min-w-0 justify-start rounded-sm px-0 py-0 text-start text-[15px] font-normal text-(--activity-placeholder) hover:bg-transparent"
					onclick={() => (opened = true)}>{emptyLabel}</Button
				>
			{/if}
			{#if files.length}
				<ul
					aria-label={text("评论附件", "Comment attachments")}
					class="mt-2 flex flex-wrap gap-1.5"
				>
					{#each files as file, index (index)}
						<li
							class="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border border-(--activity-border) ps-2 text-xs"
						>
							<span class="truncate">{file.name}</span>
							<Button
								size="icon-xs"
								variant="ghost"
								aria-label={text("移除附件 ", "Remove attachment ") + file.name}
								onclick={() => (files = files.filter((_, item) => item !== index))}>×</Button
							>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div class="flex items-center justify-end gap-2">
			<input
				bind:this={fileInput}
				type="file"
				hidden
				multiple
				onchange={(event) => {
					files = [...files, ...Array.from(event.currentTarget.files ?? [])];
					event.currentTarget.value = "";
				}}
			/>
			<Button
				type="button"
				variant="ghost"
				class={iconButton}
				aria-label={text("为评论添加附件", "Attach files to comment")}
				onclick={() => fileInput.click()}
			>
				<IconPlaceholder
					lucide="PaperclipIcon"
					tabler="IconPaperclip"
					hugeicons="AttachmentIcon"
					phosphor="PaperclipIcon"
					remixicon="RiAttachmentLine"
					aria-hidden="true"
				/>
			</Button>
			{#if mode === "edit"}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class="ms-auto h-7 rounded-full text-xs"
					onclick={cancel}>{text("取消编辑", "Cancel edit")}</Button
				>
				<Button
					type="submit"
					variant="secondary"
					size="sm"
					disabled={!canSubmit || !dirty}
					aria-keyshortcuts="Meta+Enter Control+Enter"
					class="h-7 rounded-full text-xs">{submitLabel}</Button
				>
			{:else}
				<Button
					type="submit"
					disabled={!canSubmit}
					class={iconButton +
						" bg-(--detail-accent) text-white hover:bg-(--detail-accent)/90 disabled:bg-accent disabled:text-muted-foreground"}
					aria-label={submitLabel}
					aria-keyshortcuts="Meta+Enter Control+Enter"
				>
					<IconPlaceholder
						lucide="ArrowUpIcon"
						tabler="IconArrowUp"
						hugeicons="ArrowUp02Icon"
						phosphor="ArrowUpIcon"
						remixicon="RiArrowUpLine"
						aria-hidden="true"
					/>
				</Button>
			{/if}
		</div>
	</div>
</form>

<Alert.Root bind:open={discardOpen}>
	<Alert.Content
		portalProps={portal}
		onCloseAutoFocus={(event) => {
			event.preventDefault();
			if (!discardConfirmed) editor?.commands.focus();
		}}
	>
		<Alert.Header>
			<Alert.Title>{text("放弃评论修改？", "Discard comment changes?")}</Alert.Title>
			<Alert.Description
				>{text(
					"草稿中的修改将被清除。",
					"The changes in this draft will be discarded."
				)}</Alert.Description
			>
		</Alert.Header>
		<Alert.Footer>
			<Alert.Cancel>{text("继续编辑", "Keep editing")}</Alert.Cancel>
			<Alert.Action onclick={discard}>{text("放弃修改", "Discard changes")}</Alert.Action>
		</Alert.Footer>
	</Alert.Content>
</Alert.Root>
