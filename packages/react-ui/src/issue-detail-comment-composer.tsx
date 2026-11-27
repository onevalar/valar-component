"use client";

import * as React from "react";
import { ArrowUpIcon, PaperclipIcon, XIcon } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./alert-dialog.tsx";
import { Button } from "./button.tsx";
import { IssuePortal } from "./issue-detail-controls.tsx";
import { isComposing } from "./issue-detail-editor-core.ts";
import { DescriptionEditor } from "./issue-detail-editor.tsx";
import { descriptionFromText } from "./issue-detail-model.ts";
import type { IssueComment, IssueCommentDraft } from "./issue-detail-activity-model.ts";
import type { Editor } from "@tiptap/core";

export function CommentComposer({
	mode,
	chinese,
	initial,
	onCommit,
	onCancel,
}: {
	mode: "post" | "reply" | "edit";
	chinese: boolean;
	initial?: IssueComment;
	onCommit: (draft: IssueCommentDraft) => void;
	onCancel?: () => void;
}) {
	const portal = React.useContext(IssuePortal);
	const t = (zh: string, en: string) => (chinese ? zh : en);
	const [startingContent] = React.useState(
		() => initial?.content ?? descriptionFromText(initial?.body ?? "")
	);
	const [originalFiles] = React.useState(() => [...(initial?.attachments ?? [])]);
	const [files, setFiles] = React.useState(originalFiles);
	const [opened, setOpened] = React.useState(mode === "edit");
	const [body, setBody] = React.useState(initial?.body ?? "");
	const [changed, setChanged] = React.useState(false);
	const [discardOpen, setDiscardOpen] = React.useState(false);
	const discarded = React.useRef(false);
	const editor = React.useRef<Editor>(null);
	const form = React.useRef<HTMLFormElement>(null);
	const fileInput = React.useRef<HTMLInputElement>(null);
	const placeholder = React.useRef<HTMLButtonElement>(null);
	const restore = React.useRef(false);
	const canSubmit = !!body.trim() || files.length > 0;
	const dirty =
		changed ||
		files.length !== originalFiles.length ||
		files.some((file, i) => file !== originalFiles[i]);
	const collapsedReply = mode === "reply" && !opened && !files.length;
	const label =
		mode === "reply"
			? t("回复", "Reply")
			: mode === "edit"
				? t("编辑评论", "Edit comment")
				: t("评论", "Comment");
	const emptyLabel =
		mode === "reply" ? t("回复此线程…", "Leave a reply…") : t("发表评论…", "Leave a comment…");
	const submitLabel =
		mode === "reply"
			? t("发表回复", "Post reply")
			: mode === "edit"
				? t("保存评论", "Save comment")
				: t("发表评论", "Post comment");
	const iconClass =
		"size-6 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground [&_svg]:size-3.5";

	React.useLayoutEffect(() => {
		if (!opened && restore.current) {
			placeholder.current?.focus();
			restore.current = false;
		}
	}, [opened]);
	function clear() {
		setBody("");
		setFiles([]);
		setChanged(false);
	}
	function discard() {
		discarded.current = true;
		setDiscardOpen(false);
		if (mode === "edit") onCancel?.();
		else {
			clear();
			restore.current = opened;
			setOpened(false);
		}
	}
	function cancel() {
		if (dirty) {
			discarded.current = false;
			setDiscardOpen(true);
		} else discard();
	}
	function keys(event: KeyboardEvent) {
		if (event.defaultPrevented || isComposing(event)) return false;
		if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			if (!event.repeat && canSubmit) form.current?.requestSubmit();
			return true;
		}
		if (event.key === "Escape" && (opened || files.length) && !discardOpen) {
			event.preventDefault();
			event.stopPropagation();
			if (!event.repeat) cancel();
			return true;
		}
		return false;
	}
	return (
		<>
			<form
				ref={form}
				aria-label={mode === "post" ? t("新评论", "New comment") : label}
				className={`min-w-0 ${mode === "post" ? "rounded-[8px] border border-(--activity-border) bg-(--activity-card) px-4 py-3" : ""} ${mode === "reply" ? `border-t border-(--activity-border) px-4 ${collapsedReply ? "py-2.5" : "py-3"}` : ""}`}
				onKeyDown={(event) => {
					if (event.currentTarget.contains(event.target as Node)) keys(event.nativeEvent);
				}}
				onSubmit={(event) => {
					event.preventDefault();
					if (!canSubmit || (mode === "edit" && !dirty)) return;
					const current = editor.current;
					onCommit({
						body: body.trim(),
						content: current && !current.isEmpty ? current.getJSON() : undefined,
						attachments: [...files],
					});
					if (mode === "edit") return;
					clear();
					current?.commands.clearContent(false);
					if (current) current.commands.focus();
					else placeholder.current?.focus();
				}}
			>
				<div className={`flex min-w-0 gap-2 ${collapsedReply ? "items-center" : "flex-col"}`}>
					<div className="min-w-0 flex-1">
						{opened ? (
							<DescriptionEditor
								editor={editor}
								content={startingContent}
								chinese={chinese}
								commentLabel={label}
								commentPlaceholder={mode !== "edit" && !changed ? emptyLabel : undefined}
								focusOnMount
								onKeys={keys}
								onChange={(current) => {
									setBody(current.getText({ blockSeparator: "\n" }));
									setChanged(
										initial
											? JSON.stringify(current.getJSON()) !== JSON.stringify(startingContent)
											: !current.isEmpty
									);
								}}
							/>
						) : (
							<Button
								ref={placeholder}
								type="button"
								variant="ghost"
								className="h-6 w-full min-w-0 justify-start rounded-sm px-0 py-0 text-start text-[15px] font-normal text-(--activity-placeholder) hover:bg-transparent"
								onClick={() => setOpened(true)}
							>
								{emptyLabel}
							</Button>
						)}
						{files.length > 0 && (
							<ul
								aria-label={t("评论附件", "Comment attachments")}
								className="mt-2 flex flex-wrap gap-1.5"
							>
								{files.map((file, i) => (
									<li
										key={i}
										className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border border-(--activity-border) ps-2 text-xs"
									>
										<span className="truncate">{file.name}</span>
										<Button
											type="button"
											size="icon-xs"
											variant="ghost"
											aria-label={t("移除附件 ", "Remove attachment ") + file.name}
											onClick={() => {
												setFiles(files.filter((_, index) => index !== i));
												form.current
													?.querySelector<HTMLButtonElement>("[data-comment-attach]")
													?.focus();
											}}
										>
											<XIcon aria-hidden="true" />
										</Button>
									</li>
								))}
							</ul>
						)}
					</div>
					<div className="flex items-center justify-end gap-2">
						<input
							ref={fileInput}
							type="file"
							hidden
							multiple
							onChange={(event) => {
								const added = Array.from(event.currentTarget.files ?? []);
								setFiles((current) => [...current, ...added]);
								event.currentTarget.value = "";
							}}
						/>
						<Button
							type="button"
							variant="ghost"
							className={iconClass}
							aria-label={t("为评论添加附件", "Attach files to comment")}
							data-comment-attach=""
							onClick={() => fileInput.current?.click()}
						>
							<PaperclipIcon aria-hidden="true" />
						</Button>
						{mode === "edit" ? (
							<>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="ms-auto h-7 rounded-full text-xs"
									onClick={cancel}
								>
									{t("取消编辑", "Cancel edit")}
								</Button>
								<Button
									type="submit"
									variant="secondary"
									size="sm"
									disabled={!canSubmit || !dirty}
									aria-keyshortcuts="Meta+Enter Control+Enter"
									className="h-7 rounded-full text-xs"
								>
									{submitLabel}
								</Button>
							</>
						) : (
							<Button
								type="submit"
								disabled={!canSubmit}
								aria-label={submitLabel}
								aria-keyshortcuts="Meta+Enter Control+Enter"
								className={`${iconClass} bg-(--detail-accent) text-white hover:bg-(--detail-accent)/90 disabled:bg-accent disabled:text-muted-foreground`}
							>
								<ArrowUpIcon aria-hidden="true" />
							</Button>
						)}
					</div>
				</div>
			</form>
			<AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
				<AlertDialogContent
					portalProps={{ container: portal }}
					appearance="confirmation"
					onEscapeKeyDown={(event) => {
						if (isComposing(event)) event.preventDefault();
					}}
					onCloseAutoFocus={(event) => {
						event.preventDefault();
						if (!discarded.current) {
							if (editor.current) editor.current.commands.focus();
							else placeholder.current?.focus();
						} else if (mode !== "edit" && !opened) {
							placeholder.current?.focus();
						}
					}}
				>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("放弃评论修改？", "Discard comment changes?")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("草稿中的修改将被清除。", "The changes in this draft will be discarded.")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("继续编辑", "Keep editing")}</AlertDialogCancel>
						<AlertDialogAction type="button" onClick={discard}>
							{t("放弃修改", "Discard changes")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
