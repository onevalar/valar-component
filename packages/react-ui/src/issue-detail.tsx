"use client";

import * as React from "react";
import { ChevronRightIcon, HexagonIcon, TagIcon } from "lucide-react";
import { Button } from "./button.tsx";
import { Combobox, type ComboboxProps } from "./combobox.tsx";
import { Input } from "./input.tsx";
import { IssueGlyph, issueLabels, priorities, statuses } from "./issue-composer.tsx";
import { issueActivityChanges, type IssueActivityOptions } from "./issue-detail-activity-model.ts";
import { IssueActivity } from "./issue-detail-activity.tsx";
import { IssuePortal, IssueReactions } from "./issue-detail-controls.tsx";
import { isComposing } from "./issue-detail-editor-core.ts";
import { DescriptionEditor, RichDescription } from "./issue-detail-editor.tsx";
import {
	descriptionFromText,
	type IssueDetailOption,
	type IssueDetailUpdate,
	type IssueDetailValue,
} from "./issue-detail-model.ts";
import type { Editor } from "@tiptap/core";

export type {
	IssueDetailOption,
	IssueDetailUpdate,
	IssueDetailValue,
} from "./issue-detail-model.ts";
export {
	applyIssueActivityAction,
	applyIssueCollaborationAction,
} from "./issue-detail-activity-model.ts";
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
} from "./issue-detail-activity-model.ts";

export type IssueDetailProps = React.ComponentPropsWithoutRef<"section"> & {
	issue: IssueDetailValue;
	chinese?: boolean;
	embedded?: boolean;
	activity?: IssueActivityOptions;
	assignees?: readonly IssueDetailOption[];
	projects?: readonly IssueDetailOption[];
	labelOptions?: readonly IssueDetailOption[];
	headingRef?: React.Ref<HTMLHeadingElement>;
	onUpdate: (update: IssueDetailUpdate) => void;
	onBack?: () => void;
};

const tokens = {
	"--detail-panel": "light-dark(lch(97.94% .5 282), lch(5.52% .4 272))",
	"--detail-control": "light-dark(white, lch(10.149% .593 272))",
	"--detail-accent": "light-dark(lch(46% 70 267), lch(48% 72 267))",
	"--foreground": "light-dark(lch(9.794% 0 282), white)",
	"--muted-foreground": "light-dark(lch(39.176% 1.25 282), lch(61.803% 1.2 272))",
	"--border": "light-dark(lch(92.5% 0 282), lch(22% .85 272))",
	"--popover": "light-dark(white, lch(16.433% 1.3 272))",
	"--popover-foreground": "var(--foreground)",
	"--accent": "light-dark(lch(94.854% .5 282), lch(14.006% .593 272))",
	"--accent-foreground": "var(--foreground)",
	"--muted": "var(--accent)",
	"--ring": "var(--detail-accent)",
} as React.CSSProperties;
const propertyHeading =
	"sr-only @min-[860px]:not-sr-only @min-[860px]:mb-2 @min-[860px]:ps-1.5 @min-[860px]:text-[13px] @min-[860px]:font-medium @min-[860px]:text-muted-foreground";
const propertyControl =
	"h-6! min-h-0 max-w-full min-w-0 gap-1.5 rounded-full border-border bg-(--detail-control)! px-2! text-xs! text-muted-foreground shadow-none! hover:bg-accent! hover:text-foreground aria-expanded:bg-accent! @min-[860px]:h-8! @min-[860px]:w-full @min-[860px]:justify-start @min-[860px]:rounded-md @min-[860px]:border-transparent @min-[860px]:bg-transparent! @min-[860px]:px-1.5! @min-[860px]:text-[13px]!";

export function IssueDetail(props: IssueDetailProps) {
	// A host can reuse the same view for another issue without carrying draft, picker or thread UI state over.
	return <Detail key={props.issue.id} {...props} />;
}

function Detail({
	issue,
	chinese = false,
	embedded = false,
	activity,
	assignees = [],
	projects = [],
	labelOptions = [],
	headingRef,
	onUpdate,
	onBack,
	className = "",
	style,
	...attrs
}: IssueDetailProps) {
	const t = (zh: string, en: string) => (chinese ? zh : en);
	const id = React.useId();
	const [container, setContainer] = React.useState<HTMLElement | null>(null);
	const editor = React.useRef<Editor>(null);
	const form = React.useRef<HTMLFormElement>(null);
	const titleInput = React.useRef<HTMLInputElement>(null);
	const titleButton = React.useRef<HTMLButtonElement>(null);
	const descriptionButton = React.useRef<HTMLButtonElement>(null);
	const [editing, setEditing] = React.useState<"title" | "description">();
	const [title, setTitle] = React.useState<string>();
	const [invalid, setInvalid] = React.useState(false);
	const editedDescription = React.useRef(false);
	const restore = React.useRef<typeof editing>(undefined);
	const label = (key: keyof typeof issueLabels) => issueLabels[key][chinese ? 0 : 1];
	const chosenLabels = issue.labels ?? [];
	const assigneeName = assignees.find(({ id }) => id === issue.assignee)?.label ?? issue.assignee;
	const projectName = projects.find(({ id }) => id === issue.project)?.label ?? issue.project;
	const hasDescription = !!(issue.descriptionContent || issue.description);
	const content = issue.descriptionContent ?? descriptionFromText(issue.description ?? "");
	const property = {
		className: propertyControl,
		portalProps: { container },
		empty: t("没有匹配的选项", "No matching options"),
	} satisfies Partial<ComboboxProps>;

	React.useLayoutEffect(() => {
		if (editing === "title") titleInput.current?.focus();
		if (!editing && restore.current) {
			(restore.current === "title" ? titleButton : descriptionButton).current?.focus();
			restore.current = undefined;
		}
	}, [editing]);
	function begin(origin: NonNullable<typeof editing>) {
		setTitle(undefined);
		setInvalid(false);
		editedDescription.current = false;
		setEditing(origin);
	}
	function stop() {
		restore.current = editing;
		setEditing(undefined);
	}
	function updateIssue(update: IssueDetailUpdate) {
		const changes = activity ? issueActivityChanges(issue, update) : [];
		onUpdate(update);
		if (changes.length) activity?.onAction({ type: "update", changes });
	}
	function keys(event: KeyboardEvent) {
		if (!editing || event.defaultPrevented || isComposing(event)) return false;
		if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			if (!event.repeat) stop();
			return true;
		}
		if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			if (!event.repeat) form.current?.requestSubmit();
			return true;
		}
		return false;
	}
	function save(event: React.SyntheticEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!editing) return;
		const nextTitle = (title ?? issue.title).trim();
		if (!nextTitle) {
			setInvalid(true);
			titleInput.current?.focus();
			return;
		}
		const update: IssueDetailUpdate = {};
		if (title !== undefined && nextTitle !== issue.title) update.title = nextTitle;
		if (editor.current && editedDescription.current) {
			update.description = editor.current.getText({ blockSeparator: "\n" });
			update.descriptionContent = editor.current.isEmpty ? undefined : editor.current.getJSON();
		}
		if (Object.keys(update).length) updateIssue(update);
		stop();
	}
	return (
		<IssuePortal.Provider value={container}>
			<section
				ref={setContainer}
				data-slot="issue-detail"
				aria-label={t("问题详情", "Issue details")}
				{...attrs}
				style={{ ...tokens, ...style }}
				className={`@container min-w-0 text-foreground [color-scheme:light] dark:[color-scheme:dark] ${embedded ? "" : "rounded-[10px] border border-border bg-(--detail-panel)"} ${className}`}
			>
				{!embedded && (
					<header className="min-w-0 border-b border-border px-3 sm:px-4">
						<nav aria-label={t("问题路径", "Issue location")}>
							<ol className="flex h-[34px] min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
								{onBack && (
									<>
										<li className="shrink-0">
											<Button
												type="button"
												size="xs"
												variant="ghost"
												onClick={onBack}
												aria-label={t("返回我的问题", "Back to My issues")}
												className="px-1 font-normal"
											>
												{t("我的问题", "My issues")}
											</Button>
										</li>
										<li className="shrink-0" aria-hidden="true">
											<ChevronRightIcon className="size-3.5 rtl:rotate-180" />
										</li>
									</>
								)}
								<li className="min-w-0 truncate" aria-current="page">
									{issue.id} {issue.title}
								</li>
							</ol>
						</nav>
					</header>
				)}
				<div
					className={`mx-auto grid max-w-[1150px] content-start gap-y-5 px-4 py-7 sm:px-8 sm:py-10 @min-[860px]:grid-cols-[minmax(0,1fr)_224px] @min-[860px]:gap-x-12 @min-[1050px]:px-12 ${activity ? "@min-[860px]:grid-rows-[max-content_max-content_1fr]" : "min-h-[440px]"}`}
				>
					<form
						ref={form}
						aria-label={t("编辑问题", "Edit issue")}
						className="contents"
						onSubmit={save}
						onKeyDown={(event) => {
							if (event.currentTarget.contains(event.target as Node)) keys(event.nativeEvent);
						}}
					>
						<div className="min-w-0 @min-[860px]:col-start-1 @min-[860px]:row-start-1">
							{editing ? (
								<>
									<Input
										ref={titleInput}
										value={title ?? issue.title}
										aria-label={t("问题标题", "Issue title")}
										aria-required="true"
										aria-invalid={invalid}
										aria-describedby={invalid ? `${id}-title-error` : undefined}
										maxLength={160}
										onChange={(event) => {
											setTitle(event.currentTarget.value);
											setInvalid(false);
										}}
										className="h-9 rounded-md border-border bg-(--detail-control) px-2 text-[24px] leading-8 font-semibold tracking-tight md:text-[24px]"
									/>
									{invalid && (
										<p
											id={`${id}-title-error`}
											role="alert"
											className="mt-1 text-xs text-destructive"
										>
											{t("请输入问题标题。", "Enter an issue title.")}
										</p>
									)}
								</>
							) : (
								<h2
									ref={headingRef}
									tabIndex={-1}
									aria-label={issue.title}
									className="text-[24px] leading-8 font-semibold tracking-tight focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
								>
									<Button
										ref={titleButton}
										type="button"
										variant="ghost"
										aria-label={t("编辑标题", "Edit title")}
										className="-ms-1 h-auto max-w-full justify-start rounded-md px-1 py-0 text-start text-[24px] leading-8 font-semibold wrap-anywhere whitespace-normal hover:bg-accent"
										onClick={() => begin("title")}
									>
										{issue.title}
									</Button>
								</h2>
							)}
						</div>
						<aside
							aria-label={t("问题属性", "Issue properties")}
							className={`flex min-w-0 flex-wrap gap-1.5 @min-[860px]:col-start-2 @min-[860px]:row-start-1 @min-[860px]:block @min-[860px]:space-y-7 ${activity ? "@min-[860px]:row-span-3" : "@min-[860px]:row-span-2"}`}
						>
							<div className="contents @min-[860px]:block">
								<h3 className={propertyHeading}>{t("属性", "Properties")}</h3>
								<Combobox
									{...property}
									label={t("更改状态", "Change status")}
									placeholder={t("搜索状态…", "Search statuses…")}
									options={statuses.map((id) => ({ id, label: label(id) }))}
									value={[issue.status]}
									onSelect={(id) => updateIssue({ status: id as IssueDetailValue["status"] })}
									renderOption={(item) => (
										<>
											<IssueGlyph value={item.id as IssueDetailValue["status"]} />
											<span className="min-w-0 flex-1 wrap-anywhere">{item.label}</span>
										</>
									)}
								>
									<IssueGlyph value={issue.status} />
									{label(issue.status)}
								</Combobox>
								<Combobox
									{...property}
									label={t("更改优先级", "Change priority")}
									placeholder={t("搜索优先级…", "Search priorities…")}
									options={priorities.map((id) => ({ id, label: label(id) }))}
									value={[issue.priority]}
									onSelect={(id) => updateIssue({ priority: id as IssueDetailValue["priority"] })}
									renderOption={(item) => (
										<>
											<IssueGlyph value={item.id as IssueDetailValue["priority"]} />
											<span className="min-w-0 flex-1 wrap-anywhere">{item.label}</span>
										</>
									)}
								>
									<IssueGlyph value={issue.priority} />
									{issue.priority === "none"
										? t("设置优先级", "Set priority")
										: label(issue.priority)}
								</Combobox>
								<Combobox
									{...property}
									label={t("更改负责人", "Change assignee")}
									placeholder={t("搜索负责人…", "Search assignees…")}
									options={[{ id: "", label: t("未分配", "Unassigned") }, ...assignees]}
									value={[issue.assignee ?? ""]}
									onSelect={(id) => updateIssue({ assignee: id || undefined })}
								>
									<span
										aria-hidden="true"
										className="grid size-3.5 shrink-0 place-items-center rounded-full border border-dashed text-[8px] leading-none"
									>
										{assigneeName?.slice(0, 1) ?? "◦"}
									</span>
									<span className="truncate">{assigneeName ?? t("分配负责人", "Assign")}</span>
								</Combobox>
							</div>
							<div className="contents @min-[860px]:block">
								<h3 className={propertyHeading}>{t("标签", "Labels")}</h3>
								<Combobox
									{...property}
									label={t("更改标签", "Change labels")}
									placeholder={t("搜索标签…", "Search labels…")}
									options={labelOptions}
									value={chosenLabels}
									multiple
									onSelect={(id) =>
										updateIssue({
											labels: chosenLabels.includes(id)
												? chosenLabels.filter((label) => label !== id)
												: [...chosenLabels, id],
										})
									}
								>
									<TagIcon aria-hidden="true" className="size-3.5 shrink-0" />
									<span className="truncate">
										{chosenLabels.length
											? chosenLabels
													.map((id) => labelOptions.find((item) => item.id === id)?.label ?? id)
													.join("、")
											: t("添加标签", "Add label")}
									</span>
								</Combobox>
							</div>
							<div className="contents @min-[860px]:block">
								<h3 className={propertyHeading}>{t("项目", "Project")}</h3>
								<Combobox
									{...property}
									label={t("更改项目", "Change project")}
									placeholder={t("搜索项目…", "Search projects…")}
									options={[{ id: "", label: t("无项目", "No project") }, ...projects]}
									value={[issue.project ?? ""]}
									onSelect={(id) => updateIssue({ project: id || undefined })}
								>
									<HexagonIcon aria-hidden="true" className="size-3.5 shrink-0" />
									<span className="truncate">
										{projectName ?? t("添加到项目", "Add to project")}
									</span>
								</Combobox>
							</div>
						</aside>
						<div className="min-w-0 space-y-3 @min-[860px]:col-start-1 @min-[860px]:row-start-2">
							{editing ? (
								<>
									<DescriptionEditor
										editor={editor}
										content={content}
										chinese={chinese}
										focusOnMount={editing === "description"}
										onKeys={keys}
										onChange={() => {
											editedDescription.current = true;
										}}
									/>
									<div className="flex justify-end gap-2">
										<Button type="button" size="sm" variant="outline" onClick={stop}>
											{t("取消", "Cancel")}
										</Button>
										<Button
											type="submit"
											size="sm"
											aria-keyshortcuts="Meta+Enter Control+Enter"
											className="bg-(--detail-accent) text-white hover:bg-(--detail-accent)/90"
										>
											{t("保存", "Save")}
										</Button>
									</div>
								</>
							) : (
								<>
									{hasDescription && <RichDescription content={content} />}
									<Button
										ref={descriptionButton}
										type="button"
										size="sm"
										variant="ghost"
										className="-ms-2 px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
										onClick={() => begin("description")}
									>
										{hasDescription
											? t("编辑描述", "Edit description")
											: t("添加描述…", "Add description…")}
									</Button>
									{activity?.collaboration && (
										<div className="flex flex-wrap items-center gap-1">
											<IssueReactions
												label={t("回应问题", "React to issue")}
												reactions={activity.collaboration.reactions}
												viewerId={activity.viewer.id}
												chinese={chinese}
												onReaction={(emoji, active) =>
													activity.collaboration?.onAction({ type: "react", emoji, active })
												}
											/>
										</div>
									)}
								</>
							)}
							{!!issue.attachments?.length && (
								<ul
									aria-label={t("附件", "Attachments")}
									className="flex flex-wrap gap-1.5 text-xs text-muted-foreground"
								>
									{issue.attachments.map((file, index) => (
										<li
											key={index}
											className="max-w-full truncate rounded-full border border-border px-2 py-1"
										>
											{file.name}
										</li>
									))}
								</ul>
							)}
						</div>
					</form>
					{activity && (
						<div className="min-w-0 @min-[860px]:col-start-1 @min-[860px]:row-start-3">
							<IssueActivity activity={activity} chinese={chinese} />
						</div>
					)}
				</div>
			</section>
		</IssuePortal.Provider>
	);
}
